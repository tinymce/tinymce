import { AlloyComponent, AlloySpec } from '@ephox/alloy';
import { Dialog, Menu } from '@ephox/bridge';
import { Cell, Obj, Optional, Result } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import I18n, { TranslatedString, Untranslated } from 'tinymce/core/api/util/I18n';
import * as UiFactory from 'tinymce/themes/silver/ui/general/UiFactory';

import * as Options from '../api/Options';
import { IconProvider } from '../ui/icons/Icons';
import { UiFactoryBackstageAnchors } from './Anchors';
import * as Anchors from './Anchors';
import { ColorInputBackstage, UiFactoryBackstageForColorInput } from './ColorInputBackstage';
import { DialogBackstage, UiFactoryBackstageForDialog } from './DialogBackstage';
import { HeaderBackstage, UiFactoryBackstageForHeader } from './HeaderBackstage';
import { init as initStyleFormatBackstage, UiFactoryBackstageForStyleFormats } from './StyleFormatsBackstage';
import { TooltipsBackstage, TooltipsProvider } from './TooltipsBackstage';
import { UiFactoryBackstageForUrlInput, UrlInputBackstage } from './UrlInputBackstage';

export interface UiFactoryBackstageProviders {
  readonly icons: IconProvider;
  readonly menuItems: () => Record<string, Menu.MenuItemSpec | Menu.NestedMenuItemSpec | Menu.ToggleMenuItemSpec>;
  readonly translate: (text: Untranslated) => TranslatedString;
  readonly isDisabled: () => boolean;
  readonly getOption: Editor['options']['get'];
  readonly tooltips: TooltipsProvider;
  readonly checkUiComponentContext: (specContext: string) => { contextType: string; shouldDisable: boolean };
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
    isDisabled: () => !editor.ui.isEnabled(),
    getOption: editor.options.get,
    tooltips: TooltipsBackstage(lazySinks.dialog),
    checkUiComponentContext: (specContext: string) => {
      if (Options.isDisabled(editor)) {
        return {
          contextType: 'disabled',
          shouldDisable: true
        };
      }
      const [ key, value = '' ] = specContext.split(':');
      const contexts = editor.ui.registry.getAll().contexts;
      const enabledInContext = Obj.get(contexts, key)
        .fold(
          // Fallback to 'mode:design' if key is not found
          () => Obj.get(contexts, 'mode').map((pred) => pred('design')).getOr(false),
          (pred) => value.charAt(0) === '!' ? !pred(value.slice(1)) : pred(value)
        );
      return {
        contextType: key,
        shouldDisable: !enabledInContext
      };
    }
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

  const getCompByName = (_name: string) => Optional.none();

  const popupBackstage: UiFactoryBackstage = {
    ...commonBackstage,
    shared: {
      ...commonBackstage.shared,
      interpreter: (s) => UiFactory.interpretWithoutForm(s, {}, popupBackstage, getCompByName),
      getSink: lazySinks.popup
    }
  };

  const dialogBackstage: UiFactoryBackstage = {
    ...commonBackstage,
    shared: {
      ...commonBackstage.shared,
      interpreter: (s) => UiFactory.interpretWithoutForm(s, {}, dialogBackstage, getCompByName),
      getSink: lazySinks.dialog
    }
  };

  return {
    popup: popupBackstage,
    dialog: dialogBackstage
  };
};

export { init };
