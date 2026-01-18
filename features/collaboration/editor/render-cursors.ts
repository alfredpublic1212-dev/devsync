import * as monaco from "monaco-editor";
import { Awareness } from "y-protocols/awareness";

const decorations = new Map<number, string[]>();

export function renderRemoteCursors(
  editor: monaco.editor.IStandaloneCodeEditor,
  awareness: Awareness
) {
  const states = awareness.getStates();

  for (const [clientId, state] of states.entries()) {
    if (!state?.cursor) continue;

    const { start, end } = state.cursor;

    const range = new monaco.Range(
      start.lineNumber,
      start.column,
      end.lineNumber,
      end.column
    );

    const newDecorations = [
      {
        range,
        options: {
          className: "remote-selection",
        },
      },
    ];

    const old = decorations.get(clientId) ?? [];
    const applied = editor.deltaDecorations(old, newDecorations);

    decorations.set(clientId, applied);
  }
}
