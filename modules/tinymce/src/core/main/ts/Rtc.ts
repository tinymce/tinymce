/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Event, Node as DomNode, Range } from '@ephox/dom-globals';
import { Fun, Obj, Option, Type } from '@ephox/katamari';
import Editor from './api/Editor';
import Formatter from './api/Formatter';
import Node from './api/html/Node';
import Serializer from './api/html/Serializer';
import { Content, ContentFormat, GetContentArgs, SetContentArgs } from './content/ContentTypes';
import { getContentInternal } from './content/GetContentImpl';
import { insertHtmlAtCaret } from './content/InsertContentImpl';
import { setContentInternal } from './content/SetContentImpl';
import * as ApplyFormat from './fmt/ApplyFormat';
import * as RemoveFormat from './fmt/RemoveFormat';
import * as ToggleFormat from './fmt/ToggleFormat';
import * as FilterNode from './html/FilterNode';
import { getSelectedContentInternal, GetSelectionContentArgs } from './selection/GetSelectionContentImpl';
import { RangeLikeObject } from './selection/RangeTypes';
import * as Operations from './undo/Operations';
import { Index, Locks, UndoBookmark, UndoLevel, UndoLevelType, UndoManager } from './undo/UndoManagerTypes';

const isTreeNode = (content: any): content is Node => content instanceof Node;

const runSerializerFiltersOnFragment = (editor: Editor, fragment: Node) => {
  FilterNode.filter(editor.serializer.getNodeFilters(), editor.serializer.getAttributeFilters(), fragment);
};

/** API implemented by the RTC plugin */
interface RtcRuntimeApi {
  undo: () => void;
  redo: () => void;
  hasUndo: () => boolean;
  hasRedo: () => boolean;
  transact: (fn: () => void) => void;
  applyFormat: (format: string, vars: Record<string, string>) => void;
  removeFormat: (format: string, vars: Record<string, string>) => void;
  toggleFormat: (format: string, vars: Record<string, string>) => void;
  getContent: () => Node | null;
  setContent: (node: Node) => void;
  insertContent: (node: Node) => void;
  getSelectedContent: () => Node | null;
  getRawModel: () => any;
  isRemote: boolean;
}

/** A copy of the TinyMCE api definitions that the plugin overrides  */
interface RtcAdaptor {
  undoManager: {
    beforeChange: (locks: Locks, beforeBookmark: UndoBookmark) => void;
    addUndoLevel: (
      undoManager: UndoManager,
      index: Index,
      locks: Locks,
      beforeBookmark: UndoBookmark,
      level?: UndoLevel,
      event?: Event
    ) => UndoLevel;
    undo: (undoManager: UndoManager, locks: Locks, index: Index) => UndoLevel;
    redo: (index: Index, data: UndoLevel[]) => UndoLevel;
    clear: (undoManager: UndoManager, index: Index) => void;
    reset: (undoManager: UndoManager) => void;
    hasUndo: (undoManager: UndoManager, index: Index) => boolean;
    hasRedo: (undoManager: UndoManager, index: Index) => boolean;
    transact: (undoManager: UndoManager, locks: Locks, callback: () => void) => UndoLevel;
    ignore: (locks: Locks, callback: () => void) => void;
    extra: (undoManager: UndoManager, index: Index, callback1: () => void, callback2: () => void) => void;
  };
  formatter: {
    apply: Formatter['apply'];
    remove: Formatter['remove'];
    toggle: Formatter['toggle'];
  };
  editor: {
    getContent: (args: GetContentArgs, format: ContentFormat) => Content;
    setContent: (content: Content, args: SetContentArgs) => Content;
    insertContent: (value: string, details) => void;
  };
  selection: {
    getContent: (format: ContentFormat, args: GetSelectionContentArgs) => Content;
  };
  raw: {
    getModel: () => Option<any>;
  };
}

interface RtcPluginApi {
  setup: () => Promise<RtcRuntimeApi>;
}

// TODO: Perhaps this should be a core API for overriding
interface RtcEditor extends Editor {
  rtcInstance: RtcAdaptor;
}

const createDummyUndoLevel = (): UndoLevel => ({
  type: UndoLevelType.Complete,
  fragments: [],
  content: '',
  bookmark: null,
  beforeBookmark: null
});

const makePlainAdaptor = (editor: Editor): RtcAdaptor => ({
  undoManager: {
    beforeChange: (locks, beforeBookmark) => Operations.beforeChange(editor, locks, beforeBookmark),
    addUndoLevel: (undoManager, index, locks, beforeBookmark, level, event) =>
      Operations.addUndoLevel(editor, undoManager, index, locks, beforeBookmark, level, event),
    undo: (undoManager, locks, index) => Operations.undo(editor, undoManager, locks, index),
    redo: (index, data) => Operations.redo(editor, index, data),
    clear: (undoManager, index) => Operations.clear(editor, undoManager, index),
    reset: (undoManager) => Operations.reset(undoManager),
    hasUndo: (undoManager, index) => Operations.hasUndo(editor, undoManager, index),
    hasRedo: (undoManager, index) => Operations.hasRedo(undoManager, index),
    transact: (undoManager, locks, callback) => Operations.transact(undoManager, locks, callback),
    ignore: (locks, callback) => Operations.ignore(locks, callback),
    extra: (undoManager, index, callback1, callback2) =>
      Operations.extra(editor, undoManager, index, callback1, callback2)
  },
  formatter: {
    apply: (name, vars?, node?) => ApplyFormat.applyFormat(editor, name, vars, node),
    remove: (name, vars, node, similar?) => RemoveFormat.remove(editor, name, vars, node, similar),
    toggle: (name, vars, node) => ToggleFormat.toggle(editor, name, vars, node),
  },
  editor: {
    getContent: (args, format) =>  getContentInternal(editor, args, format),
    setContent: (content, args) => setContentInternal(editor, content, args),
    insertContent: (value, details) => insertHtmlAtCaret(editor, value, details)
  },
  selection: {
    getContent: (format, args) => getSelectedContentInternal(editor, format, args)
  },
  raw: {
    getModel: () => Option.none()
  }
});

const makeRtcAdaptor = (tinymceEditor: Editor, rtcEditor: RtcRuntimeApi): RtcAdaptor => {
  const defaultVars = (vars: Record<string, string>) => Type.isObject(vars) ? vars : {};
  const unsupported = Fun.die('Unimplemented feature for rtc');
  const ignore = Fun.noop;
  return {
    undoManager: {
      beforeChange: ignore,
      addUndoLevel: unsupported,
      undo: () => {
        rtcEditor.undo();
        return createDummyUndoLevel();
      },
      redo: () => {
        rtcEditor.redo();
        return createDummyUndoLevel();
      },
      clear: unsupported,
      reset: unsupported,
      hasUndo: () => rtcEditor.hasUndo(),
      hasRedo: () => rtcEditor.hasRedo(),
      transact: (_undoManager, _locks, fn) => {
        rtcEditor.transact(fn);
        return createDummyUndoLevel();
      },
      ignore: unsupported,
      extra: unsupported
    },
    formatter: {
      apply: (name, vars, _node) => rtcEditor.applyFormat(name, defaultVars(vars)),
      remove: (name, vars, _node, _similar?) => rtcEditor.removeFormat(name, defaultVars(vars)),
      toggle: (name, vars, _node) => rtcEditor.toggleFormat(name, defaultVars(vars)),
    },
    editor: {
      getContent: (args, format) => {
        if (format === 'html' || format === 'tree') {
          const fragment = rtcEditor.getContent();
          const serializer = Serializer({ inner: true });

          runSerializerFiltersOnFragment(tinymceEditor, fragment);

          return format === 'tree' ? fragment : serializer.serialize(fragment);
        } else {
          return makePlainAdaptor(tinymceEditor).editor.getContent(args, format);
        }
      },
      setContent: (content, _args) => {
        const fragment = isTreeNode(content) ?
          content :
          tinymceEditor.parser.parse(content, { isRootContent: true, insert: true });
        rtcEditor.setContent(fragment);
        return content;
      },
      insertContent: (value, _details) => {
        const fragment = isTreeNode(value) ? value : tinymceEditor.parser.parse(value, { insert: true });
        rtcEditor.insertContent(fragment);
      }
    },
    selection: {
      getContent: (format, args) => {
        if (format === 'html' || format === 'tree') {
          const fragment = rtcEditor.getSelectedContent();
          const serializer = Serializer({});

          runSerializerFiltersOnFragment(tinymceEditor, fragment);

          return format === 'tree' ? fragment : serializer.serialize(fragment);
        } else {
          return makePlainAdaptor(tinymceEditor).selection.getContent(format, args);
        }
      }
    },
    raw: {
      getModel: () => Option.some(rtcEditor.getRawModel())
    }
  };
};

export const isRtc = (editor: Editor) => Obj.has(editor.plugins, 'rtc');

export const setup = (editor: Editor): Option<Promise<boolean>> => {
  const editorCast = editor as RtcEditor;
  return (Obj.get(editor.plugins, 'rtc') as Option<RtcPluginApi>).fold(
    () => {
      editorCast.rtcInstance = makePlainAdaptor(editor);
      return Option.none();
    },
    (rtc) => Option.some(
      rtc.setup().then((rtcEditor) => {
        editorCast.rtcInstance = makeRtcAdaptor(editor, rtcEditor);
        return rtcEditor.isRemote;
      })
    )
  );
};

const getRtcInstanceWithFallback = (editor: Editor): RtcAdaptor =>
  // Calls to editor.getContent/editor.setContent should still work even if the rtcInstance is not yet available
  (editor as RtcEditor).rtcInstance ? (editor as RtcEditor).rtcInstance : makePlainAdaptor(editor);

const getRtcInstanceWithError = (editor: Editor): RtcAdaptor => {
  const rtcInstance = (editor as RtcEditor).rtcInstance;
  if (!rtcInstance) {
    throw new Error('Failed to get RTC instance not yet initialized.');
  } else {
    return rtcInstance;
  }
};

/** In theory these could all be inlined but having them here makes it clear what is overridden */
export const beforeChange = (editor: Editor, locks: Locks, beforeBookmark: UndoBookmark) => {
  getRtcInstanceWithError(editor).undoManager.beforeChange(locks, beforeBookmark);
};

export const addUndoLevel = (
  editor: Editor,
  undoManager: UndoManager,
  index: Index,
  locks: Locks,
  beforeBookmark: UndoBookmark,
  level?: UndoLevel,
  event?: Event
): UndoLevel =>
  getRtcInstanceWithError(editor).undoManager.addUndoLevel(undoManager, index, locks, beforeBookmark, level, event);

export const undo = (editor: Editor, undoManager: UndoManager, locks: Locks, index: Index): UndoLevel =>
  getRtcInstanceWithError(editor).undoManager.undo(undoManager, locks, index);

export const redo = (editor: Editor, index: Index, data: UndoLevel[]): UndoLevel =>
  getRtcInstanceWithError(editor).undoManager.redo(index, data);

export const clear = (editor: Editor, undoManager: UndoManager, index: Index): void => {
  getRtcInstanceWithError(editor).undoManager.clear(undoManager, index);
};

export const reset = (editor: Editor, undoManager: UndoManager): void => {
  getRtcInstanceWithError(editor).undoManager.reset(undoManager);
};

export const hasUndo = (editor: Editor, undoManager: UndoManager, index: Index): boolean =>
  getRtcInstanceWithError(editor).undoManager.hasUndo(undoManager, index);

export const hasRedo = (editor: Editor, undoManager: UndoManager, index: Index): boolean =>
  getRtcInstanceWithError(editor).undoManager.hasRedo(undoManager, index);

export const transact = (editor: Editor, undoManager: UndoManager, locks: Locks, callback: () => void): UndoLevel =>
  getRtcInstanceWithError(editor).undoManager.transact(undoManager, locks, callback);

export const ignore = (editor: Editor, locks: Locks, callback: () => void): void => {
  getRtcInstanceWithError(editor).undoManager.ignore(locks, callback);
};

export const extra = (
  editor: Editor,
  undoManager: UndoManager,
  index: Index,
  callback1: () => void,
  callback2: () => void
): void => {
  getRtcInstanceWithError(editor).undoManager.extra(undoManager, index, callback1, callback2);
};

export const applyFormat = (
  editor: Editor,
  name: string,
  vars?: Record<string, string>,
  node?: DomNode | RangeLikeObject
): void => {
  getRtcInstanceWithError(editor).formatter.apply(name, vars, node);
};

export const removeFormat = (editor: Editor, name: string, vars?: Record<string, string>, node?: DomNode | Range, similar?: boolean) => {
  getRtcInstanceWithError(editor).formatter.remove(name, vars, node, similar);
};

export const toggleFormat = (editor: Editor, name: string, vars: Record<string, string>, node: DomNode): void => {
  getRtcInstanceWithError(editor).formatter.toggle(name, vars, node);
};

export const getContent = (editor: Editor, args: GetContentArgs, format: ContentFormat): Content =>
  getRtcInstanceWithFallback(editor).editor.getContent(args, format);

export const setContent = (editor: Editor, content: Content, args: SetContentArgs): Content =>
  getRtcInstanceWithFallback(editor).editor.setContent(content, args);

export const insertContent = (editor: Editor, value: string, details): void =>
  getRtcInstanceWithFallback(editor).editor.insertContent(value, details);

export const getSelectedContent = (editor: Editor, format: ContentFormat, args: GetSelectionContentArgs): Content =>
  getRtcInstanceWithError(editor).selection.getContent(format, args);
