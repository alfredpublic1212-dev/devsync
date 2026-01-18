import type * as monaco from "monaco-editor";
import { Awareness } from "y-protocols/awareness";

export function bindAwarenessToMonaco(
  editor: monaco.editor.IStandaloneCodeEditor,
  awareness: Awareness
) {
  editor.onDidChangeCursorSelection(() => {
    const selection = editor.getSelection();
    if (!selection) return;

    awareness.setLocalStateField("cursor", {
      start: selection.getStartPosition(),
      end: selection.getEndPosition(),
    });
  });
}
