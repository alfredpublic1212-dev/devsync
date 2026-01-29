"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getFileIcon } from "./file.icon";

import { useFSStore } from "@/features/collaboration/filesystem/fs.store";
import {
  createNode,
  renameNode,
  deleteNode,
} from "@/features/collaboration/filesystem/fs.action";

import { useEditorStore } from "@/features/collaboration/editor/editor.store";
import { getLanguageFromFilename } from "@/features/editor/language";
import type { FSNode } from "@/features/collaboration/filesystem/fs.types";

import { useRoomStore } from "@/features/rooms/room.store";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

/* ---------------- Helpers ---------------- */

function buildTree(nodes: FSNode[]) {
  const map = new Map<string | null, FSNode[]>();

  for (const node of nodes) {
    const key = node.parentId ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(node);
  }

  for (const children of map.values()) {
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  return map;
}

/* ---------------- Component ---------------- */

export default function FileTree({ roomId }: { roomId: string }) {
  /* ---------- Guards ---------- */
  const room = useRoomStore((s) => s.room);
  const members = useRoomStore((s) => s.members);

  if (!room) {
    return (
      <div className="p-2 text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  const currentUserId =
    typeof window !== "undefined"
      ? members.find((m) => m.role === "owner" || m.role === "editor")
          ?.userId
      : null;

  const myRole =
    members.find((m) => m.userId === currentUserId)
      ?.role ?? "viewer";

  const canEdit = myRole !== "viewer";

  /* ---------- FS state ---------- */
  const nodesMap = useFSStore((s) => s.nodes);
  const openFile = useEditorStore((s) => s.openFile);
  const activeFileId = useEditorStore((s) => s.activeFileId);

  const nodes = useMemo(
    () => Object.values(nodesMap),
    [nodesMap]
  );

  const tree = useMemo(
    () => buildTree(nodes),
    [nodes]
  );

  /* ---------- UI state ---------- */
  const [expanded, setExpanded] =
    useState<Record<string, boolean>>({});

  function toggleFolder(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  function handleOpenFile(node: FSNode) {
    if (node.type !== "file") return;

    openFile({
      fileId: node.id,
      name: node.name,
      language: getLanguageFromFilename(node.name),
    });
  }

  function renderNodes(
    parentId: string | null,
    depth = 0
  ) {
    const children = tree.get(parentId);
    if (!children) return null;

    return children.map((node) => {
      const isFolder = node.type !== "file";
      const isOpen = expanded[node.id];
      const isActive = node.id === activeFileId;

      const Icon = isFolder
        ? isOpen
          ? FolderOpen
          : Folder
        : getFileIcon(node.name);

      return (
        <Fragment key={node.id}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-1 py-1 text-sm select-none",
                  "hover:bg-neutral-700",
                  isActive &&
                    "bg-neutral-800 text-white"
                )}
                style={{
                  paddingLeft: 8 + depth * 14,
                  cursor: isFolder
                    ? "pointer"
                    : "default",
                }}
                onClick={() =>
                  isFolder
                    ? toggleFolder(node.id)
                    : handleOpenFile(node)
                }
              >
                {isFolder ? (
                  isOpen ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )
                ) : (
                  <span className="w-3" />
                )}

                <Icon size={14} />
                <span className="truncate">
                  {node.name}
                </span>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
              {isFolder && canEdit && (
                <>
                  <ContextMenuItem
                    onClick={() =>
                      createNode({
                        roomId,
                        parentId: node.id,
                        name: "new-file.ts",
                        type: "file",
                      })
                    }
                  >
                    New File
                  </ContextMenuItem>

                  <ContextMenuItem
                    onClick={() =>
                      createNode({
                        roomId,
                        parentId: node.id,
                        name: "new-folder",
                        type: "folder",
                      })
                    }
                  >
                    New Folder
                  </ContextMenuItem>
                </>
              )}

              {canEdit && (
                <>
                  <ContextMenuItem
                    onClick={() => {
                      const name = prompt(
                        "Rename",
                        node.name
                      );
                      if (!name) return;

                      renameNode({
                        roomId,
                        id: node.id,
                        name,
                      });
                    }}
                  >
                    Rename
                  </ContextMenuItem>

                  <ContextMenuItem
                    className="text-red-500"
                    onClick={() =>
                      deleteNode({
                        roomId,
                        id: node.id,
                      })
                    }
                  >
                    Delete
                  </ContextMenuItem>
                </>
              )}

              {!canEdit && (
                <ContextMenuItem disabled>
                  Read-only
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>

          {isFolder &&
            isOpen &&
            renderNodes(node.id, depth + 1)}
        </Fragment>
      );
    });
  }

  if (!nodes.length) {
    return (
      <div className="p-2 text-sm text-neutral-500">
        Empty workspace
      </div>
    );
  }

  return <div className="py-1">{renderNodes(null)}</div>;
}
