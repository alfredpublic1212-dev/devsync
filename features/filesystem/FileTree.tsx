"use client";

import { Fragment, useMemo, useState } from "react";
import type { FSNode } from "./fs.types";
import { useFileSystem } from "./useFileSystem";
import { getFileContent } from "./file.service";
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


function buildTree(nodes: FSNode[]) {
  const map = new Map<string | null, FSNode[]>();

  for (const node of nodes) {
    const key = node.parentId ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(node);
  }

  return map;
}


export default function FileTree() {
  const {
    tree,
    addNode,
    removeNode,
    renameNode,
  } = useFileSystem();

  const openEditorFile = useEditorStore((s) => s.openFile);
  const activeFileId = useEditorStore((s) => s.activeFileId);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const treeMap = useMemo(() => buildTree(tree), [tree]);


  function toggleFolder(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  async function openFile(node: FSNode) {
    const file = await getFileContent(node.id);

    const editorFile: EditorFile = {
      fileId: file.fileId,
      name: node.name,
      content: file.content,
      version: file.version,
      language: node.name.split(".").pop() ?? "txt",
    };

    openEditorFile(editorFile);
  }

  function createFile(parent: FSNode) {
    const name = prompt("File name", "new-file.ts");
    if (!name) return;

    addNode({
      id: crypto.randomUUID(),
      name,
      type: "file",
      parentId: parent.id,
      path: `${parent.path}/${name}`,
    });
  }

  function createFolder(parent: FSNode) {
    const name = prompt("Folder name", "new-folder");
    if (!name) return;

    addNode({
      id: crypto.randomUUID(),
      name,
      type: "folder",
      parentId: parent.id,
      path: `${parent.path}/${name}`,
    });
  }

  function rename(node: FSNode) {
    const name = prompt("Rename", node.name);
    if (name && name !== node.name) {
      renameNode(node.id, name);
    }
  }

  function remove(node: FSNode) {
    if (confirm(`Delete "${node.name}"?`)) {
      removeNode(node.id);
    }
  }

  function renderNodes(parentId: string | null, depth = 0) {
    const nodes = treeMap.get(parentId);
    if (!nodes) return null;

    return nodes.map((node) => {
      const isFolder = node.type === "folder";
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
                  isFolder ? toggleFolder(node.id) : openFile(node)
                }
              >
                {isFolder ? (
                  isOpen ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )
                ) : (
                  <span className="w-3" />
                )}

                {isFolder ? (
                  isOpen ? (
                    <FolderOpen size={14} />
                  ) : (
                    <Folder size={14} />
                  )
                ) : (
                  <FileIcon size={14} />
                )}

                <span className="truncate">{node.name}</span>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
              {isFolder ? (
                <>
                  <ContextMenuItem onClick={() => createFile(node)}>
                    New File
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => createFolder(node)}>
                    New Folder
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => rename(node)}>
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => remove(node)}
                    className="text-red-500"
                  >
                    Delete Folder
                  </ContextMenuItem>
                </>
              ) : (
                <>
                  <ContextMenuItem onClick={() => openFile(node)}>
                    Open
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => rename(node)}>
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => remove(node)}
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

  if (!tree.length) {
    return (
      <div className="px-3 py-2 text-xs text-neutral-500">
        No files in this workspace
      </div>
    );
  }

  return <div className="py-1">{renderNodes(null)}</div>;
}
