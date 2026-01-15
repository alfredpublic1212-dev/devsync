import type { FSNode, FileContent } from "./fs.types";


export async function saveFileContent(
  fileId: string,
  content: string,
  version: number
) {
  // Will push to S3 + DB
}
