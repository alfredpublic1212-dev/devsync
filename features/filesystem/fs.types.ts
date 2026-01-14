export type FileType = "file" | "folder";

export interface FSNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  path: string;
}

export interface FileContent {
  fileId: string;
  content: string;
  version: number;
}
