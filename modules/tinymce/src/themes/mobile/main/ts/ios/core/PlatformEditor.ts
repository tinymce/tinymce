/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { Compare, DomEvent, EventArgs, RawRect, SimRange, SugarElement, WindowSelection } from '@ephox/sugar';

// TODO finish adding the full types
export interface PlatformEditor {
  readonly body: SugarElement<HTMLElement>;
  readonly doc: SugarElement<Document>;
  readonly win: Window;
  readonly html: SugarElement<HTMLElement>;

  readonly getSelection: () => Optional<SimRange>;
  readonly setSelection: (start, soffset, finish, foffset) => void;
  readonly clearSelection: () => void;
  readonly frame: SugarElement<HTMLIFrameElement>;

  readonly onKeyup: (handler: (event) => void) => { unbind: () => void };
  readonly onNodeChanged: (handler: (event) => void) => { unbind: () => void };
  readonly onDomChanged: (handler: (event) => void) => { unbind: () => void };

  readonly onScrollToCursor: (handler: (event) => void) => { unbind: () => void };
  readonly onScrollToElement: (handler: (event) => void) => { unbind: () => void };
  readonly onToReading: (handler: (event) => void) => { unbind: () => void };
  readonly onToEditing: (handler: (event) => void) => { unbind: () => void };

  readonly onToolbarScrollStart: () => void;
  readonly onTouchContent: () => void;
  readonly onTapContent: (event: EventArgs<TouchEvent>) => void;
  readonly onTouchToolstrip: () => void;

  readonly getCursorBox: () => Optional<RawRect>;
}

const getBodyFromFrame = (frame) => {
  return Optional.some(SugarElement.fromDom(frame.dom.contentWindow.document.body));
};

const getDocFromFrame = (frame) => {
  return Optional.some(SugarElement.fromDom(frame.dom.contentWindow.document));
};

const getWinFromFrame = (frame) => {
  return Optional.from(frame.dom.contentWindow);
};

const getSelectionFromFrame = (frame) => {
  const optWin = getWinFromFrame(frame);
  return optWin.bind(WindowSelection.getExact);
};

const getFrame = (editor) => {
  return editor.getFrame();
};

const getOrDerive = (name, f) => {
  return (editor) => {
    const g = editor[name].getOrThunk(() => {
      const frame = getFrame(editor);
      return () => {
        return f(frame);
      };
    });

    return g();
  };
};

const getOrListen = (editor, doc, name, type: string) => {
  return editor[name].getOrThunk(() => {
    return (handler) => {
      return DomEvent.bind(doc, type, handler);
    };
  });
};

const getActiveApi = (editor): Optional<PlatformEditor> => {
  const frame = getFrame(editor);

  // Empty paragraphs can have no rectangle size, so let's just use the start container
  // if it is collapsed;
  const tryFallbackBox = (win: Window) => {
    const isCollapsed = (sel: SimRange) => {
      return Compare.eq(sel.start, sel.finish) && sel.soffset === sel.foffset;
    };

    const toStartRect = (sel): Optional<RawRect> => {
      const rect = sel.start.dom.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0 ? Optional.some(rect) : Optional.none();
    };

    return WindowSelection.getExact(win).filter(isCollapsed).bind(toStartRect);
  };

  return getBodyFromFrame(frame).bind((body) => {
    return getDocFromFrame(frame).bind((doc) => {
      return getWinFromFrame(frame).map((win) => {

        const html = SugarElement.fromDom(doc.dom.documentElement);

        const getCursorBox: () => Optional<RawRect> = editor.getCursorBox.getOrThunk(() => {
          return () => {
            return WindowSelection.get(win).bind((sel) => {
              return WindowSelection.getFirstRect(win, sel).orThunk(() => {
                return tryFallbackBox(win);
              });
            });
          };
        });

        const setSelection = editor.setSelection.getOrThunk(() => {
          return (start, soffset, finish, foffset) => {
            WindowSelection.setExact(win, start, soffset, finish, foffset);
          };
        });

        const clearSelection = editor.clearSelection.getOrThunk(() => {
          return () => {
            WindowSelection.clear(win);
          };
        });

        return {
          body,
          doc,
          win,
          html,
          getSelection: Fun.curry(getSelectionFromFrame, frame),
          setSelection,
          clearSelection,
          frame,

          onKeyup: getOrListen(editor, doc, 'onKeyup', 'keyup'),
          onNodeChanged: getOrListen(editor, doc, 'onNodeChanged', 'SelectionChange'),
          onDomChanged: editor.onDomChanged, // consider defaulting with MutationObserver

          onScrollToCursor: editor.onScrollToCursor,
          onScrollToElement: editor.onScrollToElement,
          onToReading: editor.onToReading,
          onToEditing: editor.onToEditing,

          onToolbarScrollStart: editor.onToolbarScrollStart,
          onTouchContent: editor.onTouchContent,
          onTapContent: editor.onTapContent,
          onTouchToolstrip: editor.onTouchToolstrip,

          getCursorBox
        };
      });
    });
  });
};

const getBody = getOrDerive('getBody', getBodyFromFrame);
const getDoc = getOrDerive('getDoc', getDocFromFrame);
const getWin = getOrDerive('getWin', getWinFromFrame);
const getSelection = getOrDerive('getSelection', getSelectionFromFrame);

export {
  getBody,
  getDoc,
  getWin,
  getSelection,
  getFrame,
  getActiveApi
};
