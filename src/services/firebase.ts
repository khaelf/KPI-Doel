import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WorkEntry, KpiIndicator, AgendaItem } from '../types/kpi';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Sign in anonymously to establish active Firebase session across devices
signInAnonymously(auth).catch((err) => {
  console.info('Firebase anonymous auth status notice:', err?.message || err);
});

// Test Firestore connection on boot
export async function testFirestoreConnection() {
  try {
    await setDoc(doc(db, 'test', 'connection'), { lastPing: new Date().toISOString() }, { merge: true });
    console.log('Connected to Firestore successfully.');
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) {
      console.info('Firestore backend unreachable; operating with local storage persistence.');
    } else {
      console.warn('Firestore connection check notice:', error);
    }
  }
}


enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
}

// Collections References
const WORK_ENTRIES_COL = 'workEntries';
const KPI_INDICATORS_COL = 'kpiIndicators';
const AGENDA_ITEMS_COL = 'agendaItems';

// Helper to remove undefined fields which cause Firestore setDoc/updateDoc to reject writes
function sanitizeFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export const firebaseDataService = {
  // --- Work Entries Firestore API ---
  async fetchWorkEntries(): Promise<WorkEntry[]> {
    try {
      const snapshot = await getDocs(collection(db, WORK_ENTRIES_COL));
      const items: WorkEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as WorkEntry);
      });
      return items;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, WORK_ENTRIES_COL);
      return [];
    }
  },

  async saveWorkEntry(entry: WorkEntry): Promise<void> {
    try {
      const docRef = doc(db, WORK_ENTRIES_COL, entry.id);
      await setDoc(docRef, sanitizeFirestoreData(entry));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${WORK_ENTRIES_COL}/${entry.id}`);
    }
  },

  async updateWorkEntry(id: string, updated: Partial<WorkEntry>): Promise<void> {
    try {
      const docRef = doc(db, WORK_ENTRIES_COL, id);
      await setDoc(docRef, sanitizeFirestoreData(updated), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${WORK_ENTRIES_COL}/${id}`);
    }
  },

  async deleteWorkEntry(id: string): Promise<void> {
    try {
      const docRef = doc(db, WORK_ENTRIES_COL, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${WORK_ENTRIES_COL}/${id}`);
    }
  },

  // --- Realtime Work Entries Listener ---
  subscribeWorkEntries(callback: (entries: WorkEntry[]) => void) {
    return onSnapshot(
      collection(db, WORK_ENTRIES_COL),
      (snapshot) => {
        const items: WorkEntry[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as WorkEntry);
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, WORK_ENTRIES_COL);
      }
    );
  },

  // --- KPI Indicators Firestore API ---
  async fetchKpiIndicators(): Promise<KpiIndicator[]> {
    try {
      const snapshot = await getDocs(collection(db, KPI_INDICATORS_COL));
      const items: KpiIndicator[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as KpiIndicator);
      });
      return items;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, KPI_INDICATORS_COL);
      return [];
    }
  },

  async saveKpiIndicator(indicator: KpiIndicator): Promise<void> {
    try {
      const docRef = doc(db, KPI_INDICATORS_COL, indicator.id);
      await setDoc(docRef, sanitizeFirestoreData(indicator), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${KPI_INDICATORS_COL}/${indicator.id}`);
    }
  },

  async updateKpiIndicator(id: string, updated: Partial<KpiIndicator>): Promise<void> {
    try {
      const docRef = doc(db, KPI_INDICATORS_COL, id);
      await setDoc(docRef, sanitizeFirestoreData(updated), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${KPI_INDICATORS_COL}/${id}`);
    }
  },

  async deleteKpiIndicator(id: string): Promise<void> {
    try {
      const docRef = doc(db, KPI_INDICATORS_COL, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${KPI_INDICATORS_COL}/${id}`);
    }
  },

  // --- Realtime KPI Indicators Listener ---
  subscribeKpiIndicators(callback: (indicators: KpiIndicator[]) => void) {
    return onSnapshot(
      collection(db, KPI_INDICATORS_COL),
      (snapshot) => {
        const items: KpiIndicator[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as KpiIndicator);
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, KPI_INDICATORS_COL);
      }
    );
  },

  // --- Agenda Items Firestore API ---
  async fetchAgendaItems(): Promise<AgendaItem[]> {
    try {
      const snapshot = await getDocs(collection(db, AGENDA_ITEMS_COL));
      const items: AgendaItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as AgendaItem);
      });
      return items;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, AGENDA_ITEMS_COL);
      return [];
    }
  },

  async saveAgendaItem(item: AgendaItem): Promise<void> {
    try {
      const docRef = doc(db, AGENDA_ITEMS_COL, item.id);
      await setDoc(docRef, sanitizeFirestoreData(item), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${AGENDA_ITEMS_COL}/${item.id}`);
    }
  },

  async updateAgendaItem(id: string, updated: Partial<AgendaItem>): Promise<void> {
    try {
      const docRef = doc(db, AGENDA_ITEMS_COL, id);
      await setDoc(docRef, sanitizeFirestoreData(updated), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${AGENDA_ITEMS_COL}/${id}`);
    }
  },

  async deleteAgendaItem(id: string): Promise<void> {
    try {
      const docRef = doc(db, AGENDA_ITEMS_COL, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${AGENDA_ITEMS_COL}/${id}`);
    }
  },

  // Realtime Agenda Listener
  subscribeAgendaItems(callback: (items: AgendaItem[]) => void) {
    return onSnapshot(
      collection(db, AGENDA_ITEMS_COL),
      (snapshot) => {
        const items: AgendaItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as AgendaItem);
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, AGENDA_ITEMS_COL);
      }
    );
  },

  // Explicit sync all items to Firestore
  async syncAllToFirestore(
    entries: WorkEntry[],
    indicators: KpiIndicator[],
    agendas: AgendaItem[]
  ): Promise<void> {
    for (const entry of entries) {
      await this.saveWorkEntry(entry);
    }
    for (const ind of indicators) {
      await this.saveKpiIndicator(ind);
    }
    for (const ag of agendas) {
      await this.saveAgendaItem(ag);
    }
  },
};

