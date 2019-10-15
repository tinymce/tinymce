/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, FormTypes, HotspotAnchorSpec, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Cell, Option, Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import I18n, { TranslatedString } from 'tinymce/core/api/util/I18n';
import * as UiFactory from 'tinymce/themes/silver/ui/general/UiFactory';
import { SelectData } from '../ui/core/complex/BespokeSelect';
import { IconProvider } from '../ui/icons/Icons';
import Anchors from './Anchors';
import { ColorInputBackstage, UiFactoryBackstageForColorInput } from './ColorInputBackstage';
import { DialogBackstage, UiFactoryBackstageForDialog } from './DialogBackstage';
import { init as initStyleFormatBackstage } from './StyleFormatsBackstage';
import { UiFactoryBackstageForUrlInput, UrlInputBackstage } from './UrlInputBackstage';

// INVESTIGATE: Make this a body component API ?
export type BridgedType = any;

export interface UiFactoryBackstageProviders {
  icons: IconProvider;
  menuItems: () => Record<string, Menu.MenuItemApi | Menu.NestedMenuItemApi | Menu.ToggleMenuItemApi>;
  translate: (any) => TranslatedString;
}

type UiFactoryBackstageForStyleButton = SelectData;

export interface UiFactoryBackstageShared {
  providers?: UiFactoryBackstageProviders;
  interpreter?: (spec: BridgedType) => AlloySpec;
  anchors?: {
    toolbar: () => HotspotAnchorSpec | NodeAnchorSpec,
    toolbarOverflow: () => HotspotAnchorSpec,
    banner: () => HotspotAnchorSpec | NodeAnchorSpec,
    cursor: () => SelectionAnchorSpec,
    node: (elem: Option<Element>) => NodeAnchorSpec
  };
  formInterpreter?: (parts: FormTypes.FormParts, spec: BridgedType, backstage: UiFactoryBackstage) => AlloySpec;
  getSink?: () => Result<AlloyComponent, any>;
}

export interface UiFactoryBackstage {
  urlinput?: UiFactoryBackstageForUrlInput;
  styleselect?: UiFactoryBackstageForStyleButton;
  shared?: UiFactoryBackstageShared;
  colorinput?: UiFactoryBackstageForColorInput;
  dialog?: UiFactoryBackstageForDialog;
  isContextMenuOpen?: () => boolean;
  setContextMenuState?: (state: boolean) => void;
}

const init = (sink: AlloyComponent, editor: Editor, lazyAnchorbar: () => AlloyComponent, lazyMoreButton: () => AlloyComponent): UiFactoryBackstage => {
  const contextMenuState = Cell(false);
  const backstage: UiFactoryBackstage = {
    shared: {
      providers: {
        icons: () => editor.ui.registry.getAll().icons,
        menuItems: () => editor.ui.registry.getAll().menuItems,
        translate: I18n.translate
      },
      interpreter: (s) => {
        return UiFactory.interpretWithoutForm(s, backstage);
      },
      anchors: Anchors.getAnchors(editor, lazyAnchorbar, lazyMoreButton),
      getSink: () => Result.value(sink)
    },
    urlinput: UrlInputBackstage(editor),
    styleselect: initStyleFormatBackstage(editor),
    colorinput: ColorInputBackstage(editor),
    dialog: DialogBackstage(editor),
    isContextMenuOpen: () => contextMenuState.get(),
    setContextMenuState: (state) => contextMenuState.set(state)
  };

  return backstage;
};

export { init };
