import AddOnManager from './AddOnManager';
import Editor from './Editor';
import { NotificationManagerImpl } from './NotificationManager';
import { EditorUiApi } from './ui/Ui';
import { WindowManagerImpl } from './WindowManager';

export interface RenderResult {
  iframeContainer?: HTMLElement;
  editorContainer: HTMLElement;
  api?: Partial<EditorUiApi>;
}

export interface Theme {
  ui?: any;
  inline?: any;
  execCommand?: (command: string, ui?: boolean, value?: any) => boolean;
  destroy?: () => void;
  init?: (editor: Editor, url: string) => void;
  renderUI?: () => Promise<RenderResult> | RenderResult;
  getNotificationManagerImpl?: () => NotificationManagerImpl;
  getWindowManagerImpl?: () => WindowManagerImpl;
}

type ThemeManager = AddOnManager<void | Theme>;
const ThemeManager: ThemeManager = AddOnManager.ThemeManager;

export default ThemeManager;
