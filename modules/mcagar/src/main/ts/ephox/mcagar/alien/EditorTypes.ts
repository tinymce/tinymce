type EventCallback = (event: any) => void;

export interface Selection {
  win: Window;

  setRng: (rng: Range) => void;
  getRng: () => Range | null;
  select: (node: Node, content?: boolean) => Node;
  setCursorLocation: (node?: Node, offset?: number) => void;
  isCollapsed: () => boolean;
}

export type ContentFormat = 'raw' | 'text' | 'html' | 'tree';

export interface GetContentArgs {
  format?: ContentFormat;
  get?: boolean;
  content?: string;
  getInner?: boolean;
  no_events?: boolean;
  [key: string]: any;
}

export interface Editor {
  id: string;
  settings: Record<string, any>;
  inline: boolean;

  dom: any;
  editorCommands: any;
  selection: Selection;
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
