// lib/storage.ts — IndexedDB persistence layer for Lumora World
// Offline-first, client-side storage with automatic sync when online

import { ScreeningSession, HavenDaySession, IASQResult, StudentCohortRecord } from './types';

const DB_NAME = 'LumoraWorldDB';
const DB_VERSION = 2;

const STORES = {
  SCREENING_SESSIONS: 'screeningSessions',
  HAVEN_SESSIONS: 'havenSessions',
  IASQ_RESULTS: 'iasqResults',
  COHORT_CACHE: 'cohortCache',
  SETTINGS: 'settings',
  SYNC_QUEUE: 'syncQueue',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available in SSR'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;

        // Screening Sessions
        if (!db.objectStoreNames.contains(STORES.SCREENING_SESSIONS)) {
          const screeningStore = db.createObjectStore(STORES.SCREENING_SESSIONS, { keyPath: 'id' });
          screeningStore.createIndex('childInitials', 'childInitials', { unique: false });
          screeningStore.createIndex('grade', 'grade', { unique: false });
          screeningStore.createIndex('schoolCode', 'schoolCode', { unique: false });
          screeningStore.createIndex('createdAt', 'createdAt', { unique: false });
          screeningStore.createIndex('overallTriage', 'overallTriage', { unique: false });
        }

        // Haven Sessions
        if (!db.objectStoreNames.contains(STORES.HAVEN_SESSIONS)) {
          const havenStore = db.createObjectStore(STORES.HAVEN_SESSIONS, { keyPath: 'id' });
          havenStore.createIndex('childNickname', 'childNickname', { unique: false });
          havenStore.createIndex('completedAt', 'completedAt', { unique: false });
        }

        // IASQ Results
        if (!db.objectStoreNames.contains(STORES.IASQ_RESULTS)) {
          const iasqStore = db.createObjectStore(STORES.IASQ_RESULTS, { keyPath: 'id' });
          iasqStore.createIndex('childInitials', 'childInitials', { unique: false });
          iasqStore.createIndex('completedAt', 'completedAt', { unique: false });
        }

        // Cohort Cache (Specialist Hub)
        if (!db.objectStoreNames.contains(STORES.COHORT_CACHE)) {
          const cohortStore = db.createObjectStore(STORES.COHORT_CACHE, { keyPath: 'id' });
          cohortStore.createIndex('schoolCode', 'schoolCode', { unique: false });
          cohortStore.createIndex('overallTriage', 'overallTriage', { unique: false });
        }

        // Settings
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Sync Queue for background sync
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }
  return dbPromise;
}

async function runTransaction<T = void>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T> | IDBRequest | T
): Promise<T> {
  const db = await getDB();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let opResult: any;

    try {
      opResult = operation(store);
    } catch (err) {
      reject(err);
      return;
    }

    transaction.oncomplete = () => {
      if (opResult && typeof opResult.result !== 'undefined') {
        resolve(opResult.result);
      } else {
        resolve(opResult);
      }
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

// ============================================================================
// Screening Sessions
// ============================================================================

export async function saveScreeningSessionIDB(session: ScreeningSession): Promise<void> {
  await runTransaction(STORES.SCREENING_SESSIONS, 'readwrite', (store) => {
    return store.put(session);
  });
  await queueSync('screening', session);
}

export async function getScreeningSessionsIDB(): Promise<ScreeningSession[]> {
  return runTransaction<ScreeningSession[]>(STORES.SCREENING_SESSIONS, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getScreeningSessionByIdIDB(id: string): Promise<ScreeningSession | undefined> {
  return runTransaction<ScreeningSession | undefined>(STORES.SCREENING_SESSIONS, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getScreeningSessionsByChildIDB(childInitials: string): Promise<ScreeningSession[]> {
  return runTransaction<ScreeningSession[]>(STORES.SCREENING_SESSIONS, 'readonly', (store) => {
    const index = store.index('childInitials');
    return new Promise((resolve, reject) => {
      const request = index.getAll(childInitials);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getScreeningSessionsBySchoolIDB(schoolCode: string): Promise<ScreeningSession[]> {
  return runTransaction<ScreeningSession[]>(STORES.SCREENING_SESSIONS, 'readonly', (store) => {
    const index = store.index('schoolCode');
    return new Promise((resolve, reject) => {
      const request = index.getAll(schoolCode);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function deleteScreeningSessionIDB(id: string): Promise<void> {
  await runTransaction(STORES.SCREENING_SESSIONS, 'readwrite', (store) => {
    return store.delete(id);
  });
}

// ============================================================================
// Haven Sessions
// ============================================================================

export async function saveHavenSessionIDB(session: HavenDaySession): Promise<void> {
  await runTransaction(STORES.HAVEN_SESSIONS, 'readwrite', (store) => {
    return store.put({ ...session, id: session.dayId });
  });
  await queueSync('haven', session);
}

export async function getHavenSessionsIDB(): Promise<HavenDaySession[]> {
  return runTransaction<HavenDaySession[]>(STORES.HAVEN_SESSIONS, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getHavenSessionsByChildIDB(nickname: string): Promise<HavenDaySession[]> {
  return runTransaction<HavenDaySession[]>(STORES.HAVEN_SESSIONS, 'readonly', (store) => {
    const index = store.index('childNickname');
    return new Promise((resolve, reject) => {
      const request = index.getAll(nickname);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

// ============================================================================
// IASQ Results
// ============================================================================

export async function saveIASQResultIDB(record: IASQResult): Promise<void> {
  const id = `iasq-${record.childInitials}-${record.completedAt}`;
  await runTransaction(STORES.IASQ_RESULTS, 'readwrite', (store) => {
    return store.put({ ...record, id });
  });
  await queueSync('iasq', record);
}

export async function getIASQResultsIDB(): Promise<IASQResult[]> {
  return runTransaction<IASQResult[]>(STORES.IASQ_RESULTS, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

// ============================================================================
// Cohort Cache (Specialist Hub)
// ============================================================================

export async function saveCohortCacheIDB(records: StudentCohortRecord[]): Promise<void> {
  await runTransaction(STORES.COHORT_CACHE, 'readwrite', (store) => {
    store.clear();
    for (const record of records) {
      store.put(record);
    }
  });
}

export async function getCohortCacheIDB(): Promise<StudentCohortRecord[]> {
  return runTransaction<StudentCohortRecord[]>(STORES.COHORT_CACHE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

// ============================================================================
// Settings
// ============================================================================

export async function getSetting<T>(key: string): Promise<T | undefined> {
  return runTransaction<T | undefined>(STORES.SETTINGS, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function setSetting(key: string, value: any): Promise<void> {
  await runTransaction(STORES.SETTINGS, 'readwrite', (store) => {
    return store.put({ key, value });
  });
}

// ============================================================================
// Sync Queue (Background Sync)
// ============================================================================

async function queueSync(type: 'screening' | 'haven' | 'iasq' | 'cohort', payload: any): Promise<void> {
  const syncItem = {
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
  };
  await runTransaction(STORES.SYNC_QUEUE, 'readwrite', (store) => {
    return store.add(syncItem);
  });
}

export async function getSyncQueue(): Promise<Array<{
  id: number;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
}>> {
  const all = await runTransaction<Array<{
    id: number;
    type: string;
    payload: any;
    timestamp: number;
    retries: number;
  }>>(STORES.SYNC_QUEUE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });

  const now = Date.now();
  // Filter by exponential backoff (1s, 2s, 4s, 8s, 16s... max 30s) and max 5 retries
  return (all || []).filter((item) => {
    if (item.retries >= 5) return false; // Dead-letter limit reached
    const backoffDelay = Math.min(30000, 1000 * Math.pow(2, item.retries));
    return item.timestamp + backoffDelay <= now;
  });
}

export async function clearSyncQueue(ids: number[]): Promise<void> {
  await runTransaction(STORES.SYNC_QUEUE, 'readwrite', (store) => {
    for (const id of ids) {
      store.delete(id);
    }
  });
}

export async function incrementSyncRetry(id: number): Promise<void> {
  await runTransaction(STORES.SYNC_QUEUE, 'readwrite', (store) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const item = request.result;
      if (item) {
        item.retries += 1;
        store.put(item);
      }
    };
  });
}

// ============================================================================
// Export / Import (Backup & Restore)
// ============================================================================

export async function exportAllData(): Promise<string> {
  const [screening, haven, iasq, cohort, settings] = await Promise.all([
    getScreeningSessionsIDB(),
    getHavenSessionsIDB(),
    getIASQResultsIDB(),
    getCohortCacheIDB(),
    getAllSettings(),
  ]);

  return JSON.stringify(
    {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      screening,
      haven,
      iasq,
      cohort,
      settings,
    },
    null,
    2
  );
}

async function getAllSettings(): Promise<Record<string, any>> {
  return runTransaction<Record<string, any>>(STORES.SETTINGS, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const settings: Record<string, any> = {};
        for (const item of request.result || []) {
          settings[item.key] = item.value;
        }
        resolve(settings);
      };
      request.onerror = () => reject(request.error);
    });
  });
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);

  await runTransaction(STORES.SCREENING_SESSIONS, 'readwrite', (store) => {
    store.clear();
    for (const item of data.screening || []) store.put(item);
  });

  await runTransaction(STORES.HAVEN_SESSIONS, 'readwrite', (store) => {
    store.clear();
    for (const item of data.haven || []) store.put(item);
  });

  await runTransaction(STORES.IASQ_RESULTS, 'readwrite', (store) => {
    store.clear();
    for (const item of data.iasq || []) store.put(item);
  });

  await runTransaction(STORES.COHORT_CACHE, 'readwrite', (store) => {
    store.clear();
    for (const item of data.cohort || []) store.put(item);
  });

  await runTransaction(STORES.SETTINGS, 'readwrite', (store) => {
    store.clear();
    for (const [key, value] of Object.entries(data.settings || {})) {
      store.put({ key, value });
    }
  });
}

// Initialize DB on import (client-side only)
if (typeof window !== 'undefined') {
  getDB().catch(() => {}); // Silently fail in SSR
}