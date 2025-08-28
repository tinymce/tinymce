import {
  PublicDialog as Dialog, PublicInlineContent as InlineContent, PublicMenu as Menu, PublicSidebar as Sidebar, PublicView as View, PublicToolbar as Toolbar,
  Registry as BridgeRegistry
} from '@ephox/bridge';

import StyleSheetLoader from '../dom/StyleSheetLoader';

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

export {
  Registry,
  Dialog,
  InlineContent,
  Menu,
  View,
  Sidebar,
  Toolbar
};
