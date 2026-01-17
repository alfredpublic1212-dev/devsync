/* ===============================
   FILE: features/collaboration/editor/editor.types.ts
=============================== */

export interface EditorFile {
  fileId: string;
  name: string;
  language: string;
}

export interface EditorContent {
  fileId: string;
  content: string;
  revision: number; // server-authoritative
}

export interface EditorUpdatePayload {
  roomId: string;
  fileId: string;
  content: string;
  baseRevision: number;
  clientId: string;
}
