"use client";

import { Fragment, useMemo, useState } from "react";
import type { FSNode } from "./fs.types";
import { useFileSystem } from "./useFileSystem";
import { useEditorStore } from "@/features/editor/editor.store";
import type { EditorFile } from "@/features/editor/editor.types";
import { getFileIcon } from "./file.icon";

import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { cn } from "@/lib/utils";
import { useFSActions } from "./fs.action";

interface FileTreeProps {
  actions: ReturnType<typeof useFSActions>;
}

/* ---------------- Helpers ---------------- */

function buildTree(nodes: FSNode[]) {
  const map = new Map<string | null, FSNode[]>();
  for (const node of nodes) {
    const key = node.parentId ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(node);
  }
  return map;
}

/* ---------------- Component ---------------- */

export default function FileTree({ actions }: FileTreeProps) {
  const { tree } = useFileSystem();
  const { openFile, files, activeFileId } = useEditorStore();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const treeMap = useMemo(() => buildTree(tree), [tree]);

  function toggleFolder(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  function openFileFromTree(node: FSNode) {
    const existing = files.find((f) => f.fileId === node.id);
    if (existing) {
      openFile(existing);
      return;
    }

    const editorFile: EditorFile = {
      fileId: node.id,
      name: node.name,
      content: "",
      version: 1,
      language: node.name.split(".").pop() ?? "txt",
    };

    openFile(editorFile);
  }

  function renderNodes(parentId: string | null, depth = 0) {
    const nodes = treeMap.get(parentId);
    if (!nodes) return null;

    return nodes.map((node) => {
      const isFolder = node.type === "folder" || node.type === "root";
      const isOpen = expanded[node.id];
      const isActive = node.id === activeFileId;
      const FileIcon = getFileIcon(node.name);

      return (
        <Fragment key={node.id}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer select-none",
                  "hover:bg-neutral-700",
                  isActive && "bg-neutral-800 text-white"
                )}
                style={{ paddingLeft: 8 + depth * 14 }}
                onClick={() =>
                  isFolder ? toggleFolder(node.id) : openFileFromTree(node)
                }
              >
                {isFolder ? (
                  isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : (
                  <span className="w-3" />
                )}

                {isFolder ? (
                  isOpen ? <FolderOpen size={14} /> : <Folder size={14} />
                ) : (
                  <FileIcon size={14} />
                )}

                <span className="truncate">{node.name}</span>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
              {isFolder ? (
                <>
                  <ContextMenuItem onClick={() => actions.createFile(node, "new-file.ts")}>
                    New File
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => actions.createFolder(node, "new-folder")}>
                    New Folder
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => actions.rename(node, prompt("Rename", node.name) ?? node.name)}>
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => actions.remove(node)}
                    className="text-red-500"
                  >
                    Delete Folder
                  </ContextMenuItem>
                </>
              ) : (
                <>
                  <ContextMenuItem onClick={() => openFileFromTree(node)}>
                    Open
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => actions.rename(node, prompt("Rename", node.name) ?? node.name)}>
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => actions.remove(node)}
                    className="text-red-500"
                  >
                    Delete
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>

          {isFolder && isOpen && renderNodes(node.id, depth + 1)}
        </Fragment>
      );
    });
  }

  

  if (!tree.length) return null;

  return <div className="py-1">{renderNodes(null)}</div>;
}
