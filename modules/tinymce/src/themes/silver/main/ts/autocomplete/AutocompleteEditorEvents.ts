import { AlloyComponent, AlloyTriggers, Highlighting, NativeEvents } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as AutocompleteTagReader from './AutocompleteTagReader';

export interface AutocompleterUiApi {
  readonly getMenu: () => Optional<AlloyComponent>;
  readonly isMenuOpen: () => boolean;
  readonly isActive: () => boolean;
  readonly isProcessingAction: () => boolean;
  readonly cancelIfNecessary: () => void;
}

const setup = (api: AutocompleterUiApi, editor: Editor): void => {
  const redirectKeyToItem = (item: AlloyComponent, e: EditorEvent<KeyboardEvent>) => {
    AlloyTriggers.emitWith(item, NativeEvents.keydown(), { raw: e });
  };

  const getItem = (): Optional<AlloyComponent> => api.getMenu().bind(Highlighting.getHighlighted);

  editor.on('keydown', (e) => {
    const keyCode = e.which;

    // If the autocompleter isn't activated then do nothing
    if (!api.isActive()) {
      return;
    }

    if (api.isMenuOpen()) {
      // Pressing <enter> executes any item currently selected, or does nothing
      if (keyCode === 13) {
        getItem().each(AlloyTriggers.emitExecute);
        e.preventDefault();
      // Pressing <down> either highlights the first option, or moves down the menu
      } else if (keyCode === 40) {
        getItem().fold(
          // No current item, so highlight the first one
          () => {
            api.getMenu().each(Highlighting.highlightFirst);
          },

          // There is a current item, so move down in the menu
          (item) => {
            redirectKeyToItem(item, e);
          }
        );
        e.preventDefault();
        e.stopImmediatePropagation();
      // Pressing <up>, <left>, <right> gets redirected to the selected item
      } else if (keyCode === 37 || keyCode === 38 || keyCode === 39) {
        getItem().each(
          (item) => {
            redirectKeyToItem(item, e);
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        );
      }
    } else {
      // Pressing <enter>, <down> or <up> closes the autocompleter when it's active but the menu isn't open
      if (keyCode === 13 || keyCode === 38 || keyCode === 40) {
        api.cancelIfNecessary();
      }
    }
  });

  editor.on('NodeChange', (e) => {
    // Close if active, not in the middle of an onAction callback and we're no longer inside the autocompleter span
    if (api.isActive() && !api.isProcessingAction() && AutocompleteTagReader.detect(SugarElement.fromDom(e.element)).isNone()) {
      api.cancelIfNecessary();
    }
  });
};

export const AutocompleterEditorEvents = {
  setup
};
