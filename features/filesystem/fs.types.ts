export type FSNodeType = "root" | "folder" | "file";

export interface FSNode {
  id: string;
  name: string;
  type: FSNodeType;
  parentId: string | null;
  path: string;
}


export interface FileContent {
  fileId: string;
  content: string;
  version: number;
}
