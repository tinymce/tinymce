/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Highlighting, AlloyTriggers, NativeEvents } from '@ephox/alloy';
import { Event } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

export interface AutocompleterUiApi {
  onKeypress: { cancel: () => void, throttle: (evt: Event) => void };
  getView: () => Option<AlloyComponent>;
  isActive: () => boolean;
  closeIfNecessary: () => void;
}

const setup = (api: AutocompleterUiApi, editor: Editor) => {

  editor.on('keypress', api.onKeypress.throttle);

  editor.on('remove', api.onKeypress.cancel);

  const redirectKeyToItem = (item, e) => {
    AlloyTriggers.emitWith(item, NativeEvents.keydown(), { raw: e });
  };

  editor.on('keydown', (e) => {
    const getItem = () => {
      return api.getView().bind(Highlighting.getHighlighted);
    };

    // Pressing <backspace> updates the autocompleter
    if (e.which === 8) {
      api.onKeypress.throttle(e);
    }

    if (api.isActive()) {
      // Pressing <esc> closes the autocompleter
      if (e.which === 27) {
        api.closeIfNecessary();
      // Pressing <space> closes the autocompleter
      } else if (e.which === 32) {
        api.closeIfNecessary();
      // Pressing <enter> executes any item currently selected, or does nothing
      } else if (e.which === 13) {
        getItem().each(AlloyTriggers.emitExecute);
        e.preventDefault();
      // Pressing <down> either highlights the first option, or moves down the menu
      } else if (e.which === 40) {
        getItem().fold(
          // No current item, so highlight the first one
          () => {
            api.getView().each(Highlighting.highlightFirst);
          },

          // There is a current item, so move down in the menu
          (item) => {
            redirectKeyToItem(item, e);
          }
        );
        e.preventDefault();
      // Pressing <up>, <left>, <right> gets redirected to the selected item
      } else if (e.which === 37 || e.which === 38 || e.which === 39 ) {
        getItem().each(
          (item) => {
            redirectKeyToItem(item, e);
            e.preventDefault();
          }
        );
      }
    }
  });
};

export const AutocompleterEditorEvents = {
  setup
};