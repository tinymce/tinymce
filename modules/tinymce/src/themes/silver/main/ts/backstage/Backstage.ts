import { AlloyComponent, AlloySpec } from '@ephox/alloy';
import { Dialog, Menu } from '@ephox/bridge';
import { Cell, Result } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import I18n, { TranslatedString, Untranslated } from 'tinymce/core/api/util/I18n';
import * as UiFactory from 'tinymce/themes/silver/ui/general/UiFactory';

import { IconProvider } from '../ui/icons/Icons';
import { UiFactoryBackstageAnchors } from './Anchors';
import * as Anchors from './Anchors';
import { ColorInputBackstage, UiFactoryBackstageForColorInput } from './ColorInputBackstage';
import { DialogBackstage, UiFactoryBackstageForDialog } from './DialogBackstage';
import { HeaderBackstage, UiFactoryBackstageForHeader } from './HeaderBackstage';
import { init as initStyleFormatBackstage, UiFactoryBackstageForStyleFormats } from './StyleFormatsBackstage';
import { UiFactoryBackstageForUrlInput, UrlInputBackstage } from './UrlInputBackstage';

export interface UiFactoryBackstageProviders {
  readonly icons: IconProvider;
  readonly menuItems: () => Record<string, Menu.MenuItemSpec | Menu.NestedMenuItemSpec | Menu.ToggleMenuItemSpec>;
  readonly translate: (text: Untranslated) => TranslatedString;
  readonly isDisabled: () => boolean;
  readonly getOption: Editor['options']['get'];
}

export interface UiFactoryBackstageShared {
  readonly providers: UiFactoryBackstageProviders;
  readonly interpreter: (spec: Dialog.BodyComponent) => AlloySpec;
  readonly anchors: UiFactoryBackstageAnchors;
  readonly header: UiFactoryBackstageForHeader;
  readonly getSink: () => Result<AlloyComponent, any>;
}

export interface UiFactoryBackstage {
  readonly urlinput: UiFactoryBackstageForUrlInput;
  readonly styles: UiFactoryBackstageForStyleFormats;
  readonly shared: UiFactoryBackstageShared;
  readonly colorinput: UiFactoryBackstageForColorInput;
  readonly dialog: UiFactoryBackstageForDialog;
  readonly isContextMenuOpen: () => boolean;
  readonly setContextMenuState: (state: boolean) => void;
}

export interface UiFactoryBackstagePair {
  readonly popup: UiFactoryBackstage;
  readonly dialog: UiFactoryBackstage;
}

const init = (lazySinks: { popup: () => Result<AlloyComponent, string>; dialog: () => Result<AlloyComponent, string> }, editor: Editor, lazyAnchorbar: () => AlloyComponent, lazyBottomAnchorBar: () => AlloyComponent): UiFactoryBackstagePair => {
  const contextMenuState = Cell(false);
  const toolbar = HeaderBackstage(editor);

  const providers: UiFactoryBackstageProviders = {
    icons: () => editor.ui.registry.getAll().icons,
    menuItems: () => editor.ui.registry.getAll().menuItems,
    translate: I18n.translate,
    isDisabled: () => editor.mode.isReadOnly() || !editor.ui.isEnabled(),
    getOption: editor.options.get
  };

  const urlinput = UrlInputBackstage(editor);
  const styles = initStyleFormatBackstage(editor);
  const colorinput = ColorInputBackstage(editor);
  const dialogSettings = DialogBackstage(editor);
  const isContextMenuOpen = () => contextMenuState.get();
  const setContextMenuState = (state: boolean) => contextMenuState.set(state);

  const commonBackstage = {
    shared: {
      providers,
      anchors: Anchors.getAnchors(editor, lazyAnchorbar, lazyBottomAnchorBar, toolbar.isPositionedAtTop),
      header: toolbar,
    },
    urlinput,
    styles,
    colorinput,
    dialog: dialogSettings,
    isContextMenuOpen,
    setContextMenuState
  };

  const popupBackstage: UiFactoryBackstage = {
    ...commonBackstage,
    shared: {
      ...commonBackstage.shared,
      interpreter: (s) => UiFactory.interpretWithoutForm(s, {}, popupBackstage),
      getSink: lazySinks.popup
    }
  };

  const dialogBackstage: UiFactoryBackstage = {
    ...commonBackstage,
    shared: {
      ...commonBackstage.shared,
      interpreter: (s) => UiFactory.interpretWithoutForm(s, {}, dialogBackstage),
      getSink: lazySinks.dialog
    }
  };

  return {
    popup: popupBackstage,
    dialog: dialogBackstage
  };
};

export { init };
