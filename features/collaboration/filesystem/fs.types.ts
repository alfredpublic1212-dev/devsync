export type FSNodeType = "root" | "folder" | "file";

export interface FSNode {
  id: string;            // assigned by server
  name: string;
  type: FSNodeType;
  parentId: string | null;
  path: string;          // server-computed, canonical
  updatedAt: number;
}

export interface FSSnapshot {
  roomId: string;
  nodes: FSNode[];
}
