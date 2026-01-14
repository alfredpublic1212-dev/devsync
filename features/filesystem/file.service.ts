import type { FSNode, FileContent } from "./fs.types";

/**
 * Returns the tree for a room
 */
export async function getFileTree(roomId: string): Promise<FSNode[]> {
  return [
    { id: "1", name: "src", type: "folder", parentId: null, path: "src" },
    { id: "2", name: "main.py", type: "file", parentId: "1", path: "src/main.py" },
  ];
}

export async function getFileContent(fileId: string): Promise<FileContent> {
  return {
    fileId,
    content: `print("Hello DevSync")`,
    version: 1,
  };
}

export async function saveFileContent(
  fileId: string,
  content: string,
  version: number
) {
  // Will push to S3 + DB
}
