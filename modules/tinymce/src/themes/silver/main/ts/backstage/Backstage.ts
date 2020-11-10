/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, FormTypes, HotspotAnchorSpec, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Cell, Optional, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import I18n, { TranslatedString } from 'tinymce/core/api/util/I18n';
import * as UiFactory from 'tinymce/themes/silver/ui/general/UiFactory';
import { SelectData } from '../ui/core/complex/BespokeSelect';
import { IconProvider } from '../ui/icons/Icons';
import * as Anchors from './Anchors';
import { ColorInputBackstage, UiFactoryBackstageForColorInput } from './ColorInputBackstage';
import { DialogBackstage, UiFactoryBackstageForDialog } from './DialogBackstage';
import { HeaderBackstage, UiFactoryBackstageForHeader } from './HeaderBackstage';
import { init as initStyleFormatBackstage } from './StyleFormatsBackstage';
import { UiFactoryBackstageForUrlInput, UrlInputBackstage } from './UrlInputBackstage';

// INVESTIGATE: Make this a body component API ?
export type BridgedType = any;

export interface UiFactoryBackstageProviders {
  icons: IconProvider;
  menuItems: () => Record<string, Menu.MenuItemSpec | Menu.NestedMenuItemSpec | Menu.ToggleMenuItemSpec>;
  translate: (any) => TranslatedString;
  isDisabled: () => boolean;
  getSetting: Editor['getParam'];
}

type UiFactoryBackstageForStyleButton = SelectData;

export interface UiFactoryBackstageShared {
  providers?: UiFactoryBackstageProviders;
  interpreter?: (spec: BridgedType) => AlloySpec;
  anchors?: {
    inlineDialog: () => HotspotAnchorSpec | NodeAnchorSpec;
    banner: () => HotspotAnchorSpec | NodeAnchorSpec;
    cursor: () => SelectionAnchorSpec;
    node: (elem: Optional<SugarElement>) => NodeAnchorSpec;
  };
  header?: UiFactoryBackstageForHeader;
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

const init = (sink: AlloyComponent, editor: Editor, lazyAnchorbar: () => AlloyComponent): UiFactoryBackstage => {
  const contextMenuState = Cell(false);
  const toolbar = HeaderBackstage(editor);
  const backstage: UiFactoryBackstage = {
    shared: {
      providers: {
        icons: () => editor.ui.registry.getAll().icons,
        menuItems: () => editor.ui.registry.getAll().menuItems,
        translate: I18n.translate,
        isDisabled: () => editor.mode.isReadOnly() || editor.ui.isDisabled(),
        /*
          TODO: Remove bind when TINY-6621 is complete
          This bind is important to ensure we don't lose reference to the editor in getParam
        */
        getSetting: editor.getParam.bind(editor)
      },
      interpreter: (s) => UiFactory.interpretWithoutForm(s, backstage),
      anchors: Anchors.getAnchors(editor, lazyAnchorbar, toolbar.isPositionedAtTop),
      header: toolbar,
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
