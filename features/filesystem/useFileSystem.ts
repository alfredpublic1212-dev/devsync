import { useFSStore } from "./fs.store";
import type { FSNode } from "./fs.types";

export function useFileSystem() {
  const {
    tree,
    setTree,
    addNode,
    removeNode,
    renameNode,
  } = useFSStore();

  return {
    tree,
    setTree,
    addNode,
    removeNode,
    renameNode,
  };
}
