'use client';

// lib/use-storage.ts — React hooks for IndexedDB offline persistence in client components
import { useState, useEffect, useCallback } from 'react';
import { ScreeningSession, HavenDaySession, IASQResult } from './types';
import {
  saveScreeningSessionIDB,
  getScreeningSessionsIDB,
  deleteScreeningSessionIDB,
  saveHavenSessionIDB,
  getHavenSessionsIDB,
  saveIASQResultIDB,
  getIASQResultsIDB,
} from './storage';

export function useScreeningSessions() {
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getScreeningSessionsIDB();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (session: ScreeningSession) => {
      await saveScreeningSessionIDB(session);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteScreeningSessionIDB(id);
      await refresh();
    },
    [refresh]
  );

  return { sessions, loading, error, refresh, add, remove };
}

export function useHavenSessions() {
  const [sessions, setSessions] = useState<HavenDaySession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getHavenSessionsIDB();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (session: HavenDaySession) => {
      await saveHavenSessionIDB(session);
      await refresh();
    },
    [refresh]
  );

  return { sessions, loading, add, refresh };
}

export function useIASQResults() {
  const [results, setResults] = useState<IASQResult[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getIASQResultsIDB();
    setResults(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (record: IASQResult) => {
      await saveIASQResultIDB(record);
      await refresh();
    },
    [refresh]
  );

  return { results, loading, add, refresh };
}
