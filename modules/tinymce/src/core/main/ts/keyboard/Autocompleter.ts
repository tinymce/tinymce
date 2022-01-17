/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Singleton, Throttler, Thunk, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { fireAutocompleterEnd, fireAutocompleterStart, fireAutocompleterUpdate } from '../api/Events';
import { AutocompleteContext, getContext } from '../autocomplete/AutocompleteContext';
import { AutocompleteLookupInfo, lookup, lookupWithContext } from '../autocomplete/AutocompleteLookup';
import * as Autocompleters from '../autocomplete/Autocompleters';
import { AutocompleterReloadArgs } from '../autocomplete/AutocompleteTypes';
import * as Rtc from '../Rtc';

interface ActiveAutocompleter {
  readonly triggerChar: string;
  readonly matchLength: number;
}

const setupEditorInput = (editor: Editor, load: (fetchOptions?: Record<string, any>) => void) => {
  const update = Throttler.last(load, 50);

  editor.on('keypress compositionend', (e) => {
    // IE will pass the escape key here, so just don't do anything on escape
    if (e.which === 27) {
      return;
    }

    update.throttle();
  });

  editor.on('keydown', (e) => {
    // Pressing <backspace> updates the autocompleter
    if (e.which === 8) {
      update.throttle();
    }
  });

  editor.on('remove', update.cancel);
};

export const setup = (editor: Editor): void => {
  const activeAutocompleter = Singleton.value<ActiveAutocompleter>();

  const isActive = activeAutocompleter.isSet;

  const cancelIfNecessary = () => {
    if (isActive()) {
      Rtc.removeAutocompleterDecoration(editor);
      fireAutocompleterEnd(editor);
      activeAutocompleter.clear();
    }
  };

  const commenceIfNecessary = (context: AutocompleteContext) => {
    if (!isActive()) {
      // Create the wrapper
      Rtc.addAutocompleterDecoration(editor, context.range);

      // store the element/context
      activeAutocompleter.set({
        triggerChar: context.triggerChar,
        matchLength: context.text.length
      });

      return true;
    } else {
      return false;
    }
  };

  // This needs to be calculated once things are ready, but the key events must be bound
  // before `init` or other keydown / keypress listeners will fire first. Therefore,
  // this is a thunk so that its value is calculated just once when it is used for the
  // first time, and after that it's value is stored.
  const getAutocompleters: () => Autocompleters.AutocompleterDatabase = Thunk.cached(() => Autocompleters.register(editor));

  const doLookup = (fetchOptions?: Record<string, any>): Optional<AutocompleteLookupInfo> =>
    activeAutocompleter.get().map(
      (ac) => getContext(editor.dom, editor.selection.getRng(), ac.triggerChar)
        .bind((newContext) => lookupWithContext(editor, getAutocompleters, newContext, fetchOptions))
    ).getOrThunk(() => lookup(editor, getAutocompleters));

  const load = (fetchOptions?: Record<string, any>) => {
    doLookup(fetchOptions).fold(
      cancelIfNecessary,
      (lookupInfo) => {
        const wasNecessary = commenceIfNecessary(lookupInfo.context);

        // Wait for the results to return and then display the menu
        lookupInfo.lookupData.then((lookupData) => {
          // Lookup the active autocompleter to make sure it's still active, if it isn't then do nothing
          activeAutocompleter.get().map((ac) => {
            const context = lookupInfo.context;

            // Ensure the active autocompleter trigger matches, as the old one may have closed
            // and a new one may have opened. If it doesn't match, then do nothing.
            if (ac.triggerChar === context.triggerChar) {
              // close if we haven't found any matches in the last 10 chars
              if (context.text.length - ac.matchLength >= 10) {
                cancelIfNecessary();
              } else {
                activeAutocompleter.set({
                  ...ac,
                  matchLength: context.text.length
                });

                if (wasNecessary) {
                  fireAutocompleterStart(editor, { lookupData });
                } else {
                  fireAutocompleterUpdate(editor, { lookupData });
                }
              }
            }
          });
        });
      }
    );
  };

  editor.addCommand('mceAutocompleterReload', (_ui, value: AutocompleterReloadArgs) => {
    const fetchOptions: Record<string, any> = Type.isObject(value) ? value.fetchOptions : {};
    load(fetchOptions);
  });

  editor.addCommand('mceAutocompleterClose', cancelIfNecessary);

  setupEditorInput(editor, load);
};
