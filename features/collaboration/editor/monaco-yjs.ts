import * as Y from "yjs";
import type * as monaco from "monaco-editor";

export function bindMonacoToYText(
  model: monaco.editor.ITextModel,
  ytext: Y.Text
) {
  let applyingRemote = false;

  const yObserver = () => {
    if (applyingRemote) return;
    applyingRemote = true;
    model.applyEdits([
      {
        range: model.getFullModelRange(),
        text: ytext.toString(),
      },
    ]);
    applyingRemote = false;
  };

  ytext.observe(yObserver);

  const disposable = model.onDidChangeContent(() => {
    if (applyingRemote) return;
    applyingRemote = true;
    ytext.delete(0, ytext.length);
    ytext.insert(0, model.getValue());
    applyingRemote = false;
  });

  return () => {
    ytext.unobserve(yObserver);
    disposable.dispose();
  };
}
