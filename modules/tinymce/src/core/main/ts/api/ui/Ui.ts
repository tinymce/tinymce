import {
  PublicDialog as Dialog, PublicInlineContent as InlineContent, PublicMenu as Menu, PublicSidebar as Sidebar, PublicView as View, PublicToolbar as Toolbar,
  type Registry as BridgeRegistry
} from '@ephox/bridge';

import type StyleSheetLoader from '../dom/StyleSheetLoader';

type Registry = BridgeRegistry.Registry;

export interface EditorUiApi {
  show: () => void;
  hide: () => void;
  setEnabled: (state: boolean) => void;
  isEnabled: () => boolean;
}

export interface EditorUi extends EditorUiApi {
  registry: Registry;
  /** StyleSheetLoader for styles in the editor UI. For content styles, use editor.dom.styleSheetLoader. */
  styleSheetLoader: StyleSheetLoader;
}

export type { Registry };
export { Dialog, InlineContent, Menu, View, Sidebar, Toolbar };
