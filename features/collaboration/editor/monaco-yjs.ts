// features/collaboration/editor/monaco-yjs.ts

import type * as monaco from "monaco-editor";
import * as Y from "yjs";

export function bindMonacoToYText(
  model: monaco.editor.ITextModel,
  ytext: Y.Text
) {
  let applyingRemote = false;
  let applyingLocal = false;
  let disposed = false;

  /* ---------- Check if model is valid ---------- */
  if (model.isDisposed()) {
    console.error("Cannot bind disposed model");
    return () => {};
  }

  /* ---------- Initial sync: Yjs → Monaco ---------- */
  const initialContent = ytext.toString();
  if (initialContent && model.getValue() !== initialContent) {
    try {
      model.setValue(initialContent);
    } catch (err) {
      console.error("Initial sync failed:", err);
    }
  }

  /* ---------- Yjs → Monaco (updates) ---------- */
  const yObserver = (event: Y.YTextEvent, transaction: Y.Transaction) => {
    if (disposed) return;
    if (applyingLocal) return;
    if (transaction.local) return;

    applyingRemote = true;

    // Use double RAF for maximum safety
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (disposed || model.isDisposed()) {
          applyingRemote = false;
          return;
        }

        try {
          const newValue = ytext.toString();
          const currentValue = model.getValue();

          if (newValue === currentValue) {
            applyingRemote = false;
            return;
          }

          // Use setValue which is safer than pushEditOperations
          model.setValue(newValue);
          
        } catch (err) {
          console.error("Error applying Yjs update:", err);
        } finally {
          applyingRemote = false;
        }
      });
    });
  };

  ytext.observe(yObserver);

  /* ---------- Monaco → Yjs ---------- */
  let updateTimeout: NodeJS.Timeout | null = null;

  const monacoDisposable = model.onDidChangeContent(() => {
    if (disposed || model.isDisposed()) return;
    if (applyingRemote) return;

    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(() => {
      if (disposed || model.isDisposed() || applyingRemote) return;

      applyingLocal = true;

      try {
        const newContent = model.getValue();
        const oldContent = ytext.toString();

        if (newContent !== oldContent && ytext.doc) {
          ytext.doc.transact(() => {
            ytext.delete(0, ytext.length);
            ytext.insert(0, newContent);
          }, "local");
        }
      } catch (err) {
        console.error("Error syncing to Yjs:", err);
      } finally {
        applyingLocal = false;
      }
    }, 50);
  });

  /* ---------- Cleanup ---------- */
  return () => {
    disposed = true;
    
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }
    
    try {
      ytext.unobserve(yObserver);
    } catch (err) {
      console.error("Error unobserving ytext:", err);
    }
    
    try {
      monacoDisposable.dispose();
    } catch (err) {
      console.error("Error disposing Monaco listener:", err);
    }
  };
}