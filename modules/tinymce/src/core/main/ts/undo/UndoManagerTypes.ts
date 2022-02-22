import { Cell, Singleton } from '@ephox/katamari';

import { EditorEvent } from '../api/util/EventDispatcher';
import { Bookmark } from '../bookmark/BookmarkTypes';

export const enum UndoLevelType {
  Fragmented = 'fragmented',
  Complete = 'complete'
}

export interface UndoLevel {
  type: UndoLevelType;
  fragments: string[];
  content: string;
  bookmark: Bookmark;
  beforeBookmark: Bookmark;
}

export interface UndoManager {
  data: UndoLevel[];
  typing: boolean;
  add: (level?: UndoLevel, event?: EditorEvent<any>) => UndoLevel;
  beforeChange: () => void;
  undo: () => UndoLevel;
  redo: () => UndoLevel;
  clear: () => void;
  reset: () => void;
  hasUndo: () => boolean;
  hasRedo: () => boolean;
  transact: (callback: () => void) => UndoLevel;
  ignore: (callback: () => void) => void;
  extra: (callback1: () => void, callback2: () => void) => void;
}

export type Index = Cell<number>;

export type Locks = Cell<number>;

export type UndoBookmark = Singleton.Value<Bookmark>;
