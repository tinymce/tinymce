type EventCallback = (event: any) => void;

export interface EditorSelection {
  win: Window;

  setRng: (rng: Range) => void;
  getRng: () => Range | null;
  getSel: () => Selection | null;
  select: (node: Node, content?: boolean) => Node;
  setCursorLocation: (node?: Node, offset?: number) => void;
  isCollapsed: () => boolean;
}

export type ContentFormat = 'raw' | 'text' | 'html' | 'tree';

export interface GetContentArgs {
  format?: ContentFormat;
  get?: boolean;
  content?: any;
  getInner?: boolean;
  no_events?: boolean;
  [key: string]: any;
}

export interface Editor {
  id: string;
  settings?: Record<string, any>;
  options?: any;
  inline: boolean;

  dom: any;
  editorCommands: any;
  selection: EditorSelection;
  windowManager: any;
  ui: {
    registry: any;
  };

  getBody: () => HTMLElement;
  getDoc: () => Document;
  getWin: () => Window;
  getContainer: () => HTMLElement;
  getContentAreaContainer: () => HTMLElement;
  getElement: () => HTMLElement;

  getContent: (args?: GetContentArgs) => string;
  setContent: (content: string) => void;

  execCommand: (command: string, ui?: boolean, value?: any, args?: any) => boolean;
  setEditableRoot?: (state: boolean) => void; // Introduced in v6.5

  nodeChanged: () => void;
  focus: () => void;
  hasFocus: () => boolean;
  remove: () => void;
  getParam: <T>(key: string, defaultValue?: T, type?: string) => T;

  setProgressState: (state: boolean, time?: number) => void;

  on: (event: string, callback: EventCallback) => void;
  once: (event: string, callback: EventCallback) => void;
  off: (event: string, callback: EventCallback) => void;
}
