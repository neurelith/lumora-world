import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';
import { ScreeningSession, StudentCohortRecord, HavenDaySession, IASQResult } from './types';
import {
  saveScreeningSessionIDB,
  getScreeningSessionsIDB,
  saveHavenSessionIDB,
  getHavenSessionsIDB,
  saveIASQResultIDB,
  getIASQResultsIDB,
  getSyncQueue,
  clearSyncQueue,
  incrementSyncRetry,
} from './storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined' && isConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('[Firebase] Initialization error (falling back to offline mode):', err);
  }
}

export { app, auth, db };

// ============================================================================
// Authentication Layer (Anonymous for students, Email/Password for specialists)
// ============================================================================

export async function signInSpecialist(email: string, pass: string): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Running in offline/demo mode.');
  }
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function signInAnonymousChild(): Promise<User | null> {
  if (!auth) return null;
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (err) {
    console.warn('[Firebase] Anonymous child sign-in note:', err);
    return null;
  }
}

export async function signOutSpecialist(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ============================================================================
// Offline-First Data Layer: IndexedDB primary, Firebase sync secondary
// ============================================================================

export async function saveScreeningSession(session: ScreeningSession): Promise<void> {
  // 1. Save to IndexedDB on client (offline-first)
  if (typeof window !== 'undefined') {
    await saveScreeningSessionIDB(session);
  }

  // 2. Sync to Firebase Firestore if online and configured
  if (db && isConfigured) {
    try {
      const docRef = doc(db, 'sessions', session.id);
      await setDoc(docRef, session, { merge: true });
    } catch (e) {
      console.warn('[Firebase] Firestore sync failed:', e);
    }
  }
}

export async function getLocalScreeningSessions(): Promise<ScreeningSession[]> {
  if (typeof window !== 'undefined') {
    return getScreeningSessionsIDB();
  }
  return [];
}

export async function saveHavenSession(session: HavenDaySession): Promise<void> {
  if (typeof window !== 'undefined') {
    await saveHavenSessionIDB(session);
  }

  if (db && isConfigured) {
    try {
      const docRef = doc(db, 'haven_sessions', session.dayId);
      await setDoc(docRef, session, { merge: true });
    } catch (e) {
      console.warn('[Firebase] Haven Firestore sync failed:', e);
    }
  }
}

export async function saveIASQResult(record: IASQResult): Promise<void> {
  if (typeof window !== 'undefined') {
    await saveIASQResultIDB(record);
  }

  if (db && isConfigured) {
    try {
      const docRef = doc(db, 'iasq_results', `iasq-${record.childInitials}-${record.completedAt}`);
      await setDoc(docRef, record, { merge: true });
    } catch (e) {
      console.warn('[Firebase] IASQ Firestore sync failed:', e);
    }
  }
}

// ============================================================================
// Background Sync (call periodically or on visibility change)
// ============================================================================

export async function syncPendingToFirestore(): Promise<void> {
  if (!db || !isConfigured) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  const successIds: number[] = [];

  for (const item of queue) {
    try {
      let collectionName: string;
      let docId: string;

      switch (item.type) {
        case 'screening':
          collectionName = 'sessions';
          docId = item.payload.id;
          break;
        case 'haven':
          collectionName = 'haven_sessions';
          docId = item.payload.dayId;
          break;
        case 'iasq':
          collectionName = 'iasq_results';
          docId = `iasq-${item.payload.childInitials}-${item.payload.completedAt}`;
          break;
        default:
          continue;
      }

      await setDoc(doc(db, collectionName, docId), item.payload, { merge: true });
      successIds.push(item.id);
    } catch (err) {
      console.warn(`[Firebase] Sync failed for ${item.type}:`, err);
      await incrementSyncRetry(item.id);
    }
  }

  if (successIds.length > 0) {
    await clearSyncQueue(successIds);
  }
}

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingToFirestore().catch(console.error);
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      syncPendingToFirestore().catch(console.error);
    }
  });

  // Initial sync on load
  setTimeout(() => syncPendingToFirestore().catch(console.error), 3000);
}