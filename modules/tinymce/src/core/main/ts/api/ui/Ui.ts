/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  PublicDialog as Dialog, PublicInlineContent as InlineContent, PublicMenu as Menu, PublicSidebar as Sidebar, PublicToolbar as Toolbar,
  Registry as BridgeRegistry
} from '@ephox/bridge';
import { StyleSheetLoader } from '../dom/StyleSheetLoader';

type Registry = BridgeRegistry.Registry;

export interface EditorUiApi {
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
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
  Sidebar,
  Toolbar
};
