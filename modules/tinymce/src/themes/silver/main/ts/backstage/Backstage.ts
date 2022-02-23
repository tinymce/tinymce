import { AlloyComponent, AlloySpec, HotspotAnchorSpec, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Dialog, Menu } from '@ephox/bridge';
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

export interface UiFactoryBackstageProviders {
  icons: IconProvider;
  menuItems: () => Record<string, Menu.MenuItemSpec | Menu.NestedMenuItemSpec | Menu.ToggleMenuItemSpec>;
  translate: (any) => TranslatedString;
  isDisabled: () => boolean;
  getOption: Editor['options']['get'];
}

type UiFactoryBackstageForStyleButton = SelectData;

export interface UiFactoryBackstageShared {
  providers?: UiFactoryBackstageProviders;
  interpreter?: (spec: Dialog.BodyComponent) => AlloySpec;
  anchors?: {
    inlineDialog: () => HotspotAnchorSpec | NodeAnchorSpec;
    banner: () => HotspotAnchorSpec | NodeAnchorSpec;
    cursor: () => SelectionAnchorSpec;
    node: (elem: Optional<SugarElement>) => NodeAnchorSpec;
  };
  header?: UiFactoryBackstageForHeader;
  getSink?: () => Result<AlloyComponent, any>;
}

export interface UiFactoryBackstage {
  urlinput?: UiFactoryBackstageForUrlInput;
  styles?: UiFactoryBackstageForStyleButton;
  shared?: UiFactoryBackstageShared;
  colorinput?: UiFactoryBackstageForColorInput;
  dialog?: UiFactoryBackstageForDialog;
  isContextMenuOpen?: () => boolean;
  setContextMenuState?: (state: boolean) => void;
}

const init = (lazySink: () => Result<AlloyComponent, string>, editor: Editor, lazyAnchorbar: () => AlloyComponent): UiFactoryBackstage => {
  const contextMenuState = Cell(false);
  const toolbar = HeaderBackstage(editor);
  const backstage: UiFactoryBackstage = {
    shared: {
      providers: {
        icons: () => editor.ui.registry.getAll().icons,
        menuItems: () => editor.ui.registry.getAll().menuItems,
        translate: I18n.translate,
        isDisabled: () => editor.mode.isReadOnly() || !editor.ui.isEnabled(),
        getOption: editor.options.get
      },
      interpreter: (s) => UiFactory.interpretWithoutForm(s, {}, backstage),
      anchors: Anchors.getAnchors(editor, lazyAnchorbar, toolbar.isPositionedAtTop),
      header: toolbar,
      getSink: lazySink
    },
    urlinput: UrlInputBackstage(editor),
    styles: initStyleFormatBackstage(editor),
    colorinput: ColorInputBackstage(editor),
    dialog: DialogBackstage(editor),
    isContextMenuOpen: () => contextMenuState.get(),
    setContextMenuState: (state) => contextMenuState.set(state)
  };

  return backstage;
};

export { init };
