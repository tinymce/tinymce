import { Cell, Singleton } from '@ephox/katamari';

import { EditorEvent } from '../api/util/EventDispatcher';
import { Bookmark } from '../bookmark/BookmarkTypes';

export type UndoLevelType = 'fragmented' | 'complete';

interface BaseUndoLevel {
  type: UndoLevelType;
  bookmark: Bookmark | null;
  beforeBookmark: Bookmark | null;
}

export interface FragmentedUndoLevel extends BaseUndoLevel {
  type: 'fragmented';
  fragments: string[];
  content: '';
}

export interface CompleteUndoLevel extends BaseUndoLevel {
  type: 'complete';
  fragments: null;
  content: string;
}

export type NewUndoLevel = CompleteUndoLevel | FragmentedUndoLevel;
export type UndoLevel = NewUndoLevel & { bookmark: Bookmark };

export interface Extra {
  (callback1: () => void, callback2: () => void): void;
  (callback1: () => Promise<void>, callback2: () => void): Promise<void>;
  (callback1: () => void, callback2: () => Promise<void>): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (callback1: () => Promise<void>, callback2: () => Promise<void>): Promise<void>;
}

export interface UndoManager {
  data: UndoLevel[];
  typing: boolean;
  add: (level?: Partial<UndoLevel>, event?: EditorEvent<any>) => UndoLevel | null;
  dispatchChange: () => void;
  beforeChange: () => void;
  undo: () => UndoLevel | undefined;
  redo: () => UndoLevel | undefined;
  clear: () => void;
  reset: () => void;
  hasUndo: () => boolean;
  hasRedo: () => boolean;
  transact: (callback: () => void) => UndoLevel | null;
  ignore: (callback: () => void) => void;
  extra: Extra;
}

export type Index = Cell<number>;

export type Locks = Cell<number>;

export type UndoBookmark = Singleton.Value<Bookmark>;
