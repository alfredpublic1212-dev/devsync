// features/collaboration/editor/render-cursors.ts

import * as monaco from "monaco-editor";
import { Awareness } from "y-protocols/awareness";

const decorations = new Map<number, string[]>();
let isRendering = false;

export function renderRemoteCursors(
  editor: monaco.editor.IStandaloneCodeEditor,
  awareness: Awareness
) {
  // Prevent concurrent rendering
  if (isRendering) return;
  
  isRendering = true;

  try {
    const model = editor.getModel();
    if (!model) {
      isRendering = false;
      return;
    }

    const states = awareness.getStates();
    const localClientId = awareness.clientID;

    // Clean up old decorations for clients that left
    const activeClients = new Set(states.keys());
    for (const [clientId] of decorations.entries()) {
      if (!activeClients.has(clientId) && clientId !== localClientId) {
        const oldDecorations = decorations.get(clientId) || [];
        editor.deltaDecorations(oldDecorations, []);
        decorations.delete(clientId);
      }
    }

    // Render cursors for each remote client
    for (const [clientId, state] of states.entries()) {
      // Skip local client
      if (clientId === localClientId) continue;

      // Skip if no cursor data
      if (!state?.cursor) {
        const oldDecorations = decorations.get(clientId) || [];
        if (oldDecorations.length > 0) {
          editor.deltaDecorations(oldDecorations, []);
          decorations.delete(clientId);
        }
        continue;
      }

      const { start, end } = state.cursor;
      const user = state.user || {};
      const color = user.color || "#4f46e5";

      try {
        // Validate positions before creating range
        const lineCount = model.getLineCount();
        const startLine = Math.max(1, Math.min(start.lineNumber || 1, lineCount));
        const endLine = Math.max(1, Math.min(end.lineNumber || 1, lineCount));

        const startLineLength = model.getLineMaxColumn(startLine);
        const endLineLength = model.getLineMaxColumn(endLine);

        const startColumn = Math.max(1, Math.min(start.column || 1, startLineLength));
        const endColumn = Math.max(1, Math.min(end.column || 1, endLineLength));

        // Create range safely
        const range = new monaco.Range(
          startLine,
          startColumn,
          endLine,
          endColumn
        );

        // Create decoration
        const newDecorations = [
          {
            range,
            options: {
              className: "remote-selection",
              inlineClassName: "remote-cursor",
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              beforeContentClassName: "remote-cursor-label",
              before: {
                content: user.name || "User",
                inlineClassName: "remote-cursor-name",
                inlineClassNameAffectsLetterSpacing: true,
              },
            },
          },
        ];

        // Apply decorations
        const old = decorations.get(clientId) || [];
        const applied = editor.deltaDecorations(old, newDecorations);
        decorations.set(clientId, applied);

      } catch (err) {
        console.error("Error rendering cursor for client", clientId, err);
        // Clean up on error
        const oldDecorations = decorations.get(clientId) || [];
        if (oldDecorations.length > 0) {
          try {
            editor.deltaDecorations(oldDecorations, []);
          } catch {}
          decorations.delete(clientId);
        }
      }
    }
  } catch (err) {
    console.error("Error in renderRemoteCursors:", err);
  } finally {
    isRendering = false;
  }
}

/**
 * Clear all remote cursors
 */
export function clearRemoteCursors(
  editor: monaco.editor.IStandaloneCodeEditor
) {
  for (const [clientId, oldDecorations] of decorations.entries()) {
    try {
      editor.deltaDecorations(oldDecorations, []);
    } catch (err) {
      console.error("Error clearing decorations:", err);
    }
    decorations.delete(clientId);
  }
}