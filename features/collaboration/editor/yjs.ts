import * as Y from "yjs";

const docs = new Map<string, Y.Doc>();

function getKey(roomId: string, fileId: string) {
  return `${roomId}:${fileId}`;
}

export function getYDoc(roomId: string, fileId: string): Y.Doc {
  const key = getKey(roomId, fileId);

  let doc = docs.get(key);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(key, doc);
  }

  return doc;
}
