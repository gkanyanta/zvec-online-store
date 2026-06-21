import { create } from 'zustand';
import { adminFetch } from '@/lib/adminFetch';
import type { BizDocument, DocumentType } from '@/types';

interface DocumentsStore {
  documents: BizDocument[];
  status: 'idle' | 'loading' | 'ready';
  fetchDocuments: () => Promise<void>;
  fetchDocumentById: (id: string) => Promise<BizDocument | null>;
  createDocument: (data: {
    type: DocumentType;
    customer: BizDocument['customer'];
    items: BizDocument['items'];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    notes?: string;
    dueDate?: string;
  }) => Promise<BizDocument>;
  updateDocument: (id: string, updates: Partial<BizDocument>) => Promise<BizDocument>;
  convertDocument: (id: string, to: 'invoice' | 'receipt') => Promise<BizDocument>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsStore>()((set, get) => ({
  documents: [],
  status: 'idle',

  fetchDocuments: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const res = await adminFetch('/api/documents');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const documents: BizDocument[] = await res.json();
      set({ documents, status: 'ready' });
    } catch (err) {
      console.error('Failed to load documents:', err);
      set({ status: 'idle' });
    }
  },

  fetchDocumentById: async (id: string) => {
    try {
      const res = await adminFetch(`/api/documents/${id}`);
      if (!res.ok) return null;
      const doc: BizDocument = await res.json();
      set((s) => ({
        documents: s.documents.some((d) => d.id === id)
          ? s.documents.map((d) => (d.id === id ? doc : d))
          : [doc, ...s.documents],
      }));
      return doc;
    } catch {
      return null;
    }
  },

  createDocument: async (data) => {
    const res = await adminFetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create document');
    const saved: BizDocument = await res.json();
    set((s) => ({ documents: [saved, ...s.documents] }));
    return saved;
  },

  updateDocument: async (id, updates) => {
    const res = await adminFetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update document');
    const saved: BizDocument = await res.json();
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? saved : d)) }));
    return saved;
  },

  convertDocument: async (id, to) => {
    const res = await adminFetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convertTo: to }),
    });
    if (!res.ok) throw new Error('Failed to convert document');
    const newDoc: BizDocument = await res.json();

    // Refresh list since source doc status also changed; inject newDoc if missing
    const listRes = await adminFetch('/api/documents');
    if (listRes.ok) {
      const documents: BizDocument[] = await listRes.json();
      const merged = documents.some((d) => d.id === newDoc.id)
        ? documents
        : [newDoc, ...documents];
      set({ documents: merged });
    } else {
      // List refresh failed — patch locally so the UI doesn't get stuck
      const sourceStatus = to === 'invoice' ? 'accepted' : 'paid';
      set((s) => ({
        documents: [
          newDoc,
          ...s.documents.map((d) =>
            d.id === id ? ({ ...d, status: sourceStatus } as BizDocument) : d
          ),
        ],
      }));
    }

    return newDoc;
  },

  deleteDocument: async (id) => {
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
    await adminFetch(`/api/documents/${id}`, { method: 'DELETE' });
  },
}));
