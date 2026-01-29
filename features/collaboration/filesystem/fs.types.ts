export type FSNodeType = "file" | "folder";

export interface FSNode {
  id: string;
  name: string;
  type: FSNodeType;
  parentId: string | null;
  path: string;
  updatedAt: number;
}

export interface FSSnapshot {
  roomId: string;
  nodes: FSNode[];
}
