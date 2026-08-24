import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'lumora-world.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lumora-world',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'lumora-world.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

// Initialize Firebase only on client or if configured
const isConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
let app: any;
let auth: any;
let db: any;

if (typeof window !== 'undefined') {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization note (using local fallback mode):', err);
  }
}

export { app, auth, db };

// ============================================================================
// Offline-First Data Layer: IndexedDB primary, Firebase sync secondary
// ============================================================================

export async function saveScreeningSession(session: ScreeningSession): Promise<void> {
  // 1. Always save to IndexedDB immediately (offline-first)
  await saveScreeningSessionIDB(session);

  // 2. Sync to Firebase Firestore if online and configured
  if (db && isConfigured) {
    try {
      const docRef = doc(db, 'sessions', session.id);
      await setDoc(docRef, session, { merge: true });
    } catch (e) {
      console.warn('Firestore sync failed, saved locally:', e);
    }
  }
}

export async function getLocalScreeningSessions(): Promise<ScreeningSession[]> {
  return getScreeningSessionsIDB();
}

export async function saveHavenSession(session: HavenDaySession): Promise<void> {
  await saveHavenSessionIDB(session);

  if (db && isConfigured) {
    try {
      const docRef = doc(db, 'haven_sessions', session.dayId);
      await setDoc(docRef, session, { merge: true });
    } catch (e) {
      console.warn('Haven Firestore sync failed:', e);
    }
  }
}

export async function saveIASQResult(record: IASQResult): Promise<void> {
  await saveIASQResultIDB(record);

  if (db && isConfigured) {
    try {
      const docRef = doc(db, 'iasq_results', `iasq-${record.childInitials}-${record.completedAt}`);
      await setDoc(docRef, record, { merge: true });
    } catch (e) {
      console.warn('IASQ Firestore sync failed:', e);
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
      console.warn(`Sync failed for ${item.type}:`, err);
      await incrementSyncRetry(item.id);
    }
  }

  if (successIds.length > 0) {
    await clearSyncQueue(successIds);
  }
}

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  const handleOnline = () => {
    syncPendingToFirestore().catch(console.error);
  };

  window.addEventListener('online', handleOnline);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      syncPendingToFirestore().catch(console.error);
    }
  });

  // Initial sync on load
  setTimeout(() => syncPendingToFirestore().catch(console.error), 3000);
}