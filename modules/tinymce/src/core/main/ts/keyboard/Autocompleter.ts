import { Cell, Optional, Singleton, Throttler, Thunk, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Events from '../api/Events';
import { AutocompleteContext, getContext } from '../autocomplete/AutocompleteContext';
import { AutocompleteLookupInfo, lookup, lookupWithContext } from '../autocomplete/AutocompleteLookup';
import * as Autocompleters from '../autocomplete/Autocompleters';
import { AutocompleterReloadArgs } from '../autocomplete/AutocompleteTypes';

interface ActiveAutocompleter {
  readonly trigger: string;
  readonly matchLength: number;
}

interface AutocompleterApi {
  readonly cancelIfNecessary: () => void;
  readonly load: (fetchOptions?: Record<string, any>) => void;
}

const setupEditorInput = (editor: Editor, api: AutocompleterApi) => {
  const update = Throttler.last(api.load, 50);

  editor.on('input', (e) => {
    // TINY-10715: Firefox on Android using Korean Gboard will produce stray composition events when you move the caret by tapping inside the composed text
    if (e.inputType === 'insertCompositionText' && !editor.composing) {
      return;
    }

    update.throttle();
  });

  editor.on('keydown', (e) => {
    const keyCode = e.which;

    // Pressing <backspace> updates the autocompleter
    if (keyCode === 8) {
      update.throttle();
    // Pressing <esc> closes the autocompleter
    } else if (keyCode === 27) {
      update.cancel(); // We need to cancel here since Esc cancels the IME composition and triggers an input event
      api.cancelIfNecessary();
    } else if (keyCode === 38 || keyCode === 40) {
      // Arrow up and down keys needs to cancel the update since while composing arrow up or down will end the compose and issue a input event
      // that causes the list to update and then the focus moves up to the first item in the auto completer list.
      update.cancel();
    }
  }, true); // Need to add this to the top so that it exectued before the silver keyboard event

  editor.on('remove', update.cancel);
};

export const setup = (editor: Editor): void => {
  const activeAutocompleter = Singleton.value<ActiveAutocompleter>();
  const uiActive = Cell<boolean>(false);

  const isActive = activeAutocompleter.isSet;

  const cancelIfNecessary = () => {
    if (isActive()) {
      Events.fireAutocompleterEnd(editor);
      uiActive.set(false);
      activeAutocompleter.clear();
    }
  };

  const commenceIfNecessary = (context: AutocompleteContext) => {
    if (!isActive()) {
      // store the element/context
      activeAutocompleter.set({
        trigger: context.trigger,
        matchLength: context.text.length
      });
    }
  };

  // This needs to be calculated once things are ready, but the key events must be bound
  // before `init` or other keydown / keypress listeners will fire first. Therefore,
  // this is a thunk so that its value is calculated just once when it is used for the
  // first time, and after that it's value is stored.
  const getAutocompleters: () => Autocompleters.AutocompleterDatabase = Thunk.cached(() => Autocompleters.register(editor));

  const doLookup = (fetchOptions: Record<string, any> | undefined): Optional<AutocompleteLookupInfo> =>
    activeAutocompleter.get().map(
      (ac) => getContext(editor.dom, editor.selection.getRng(), ac.trigger, true)
        .bind((newContext) => lookupWithContext(editor, getAutocompleters, newContext, fetchOptions))
    ).getOrThunk(() => lookup(editor, getAutocompleters));

  const load = (fetchOptions: Record<string, any> | undefined) => {
    doLookup(fetchOptions).fold(
      cancelIfNecessary,
      (lookupInfo) => {
        commenceIfNecessary(lookupInfo.context);

        // Wait for the results to return and then display the menu
        lookupInfo.lookupData.then((lookupData) => {
          // Lookup the active autocompleter to make sure it's still active, if it isn't then do nothing
          activeAutocompleter.get().map((ac) => {
            const context = lookupInfo.context;

            // Ensure the active autocompleter trigger matches, as the old one may have closed
            // and a new one may have opened. If it doesn't match, then do nothing.
            if (ac.trigger !== context.trigger) {
              return;
            }

            activeAutocompleter.set({
              ...ac,
              matchLength: context.text.length
            });

            if (uiActive.get()) {
              Events.fireAutocompleterUpdateActiveRange(editor, { range: context.range });
              Events.fireAutocompleterUpdate(editor, { lookupData });
            } else {
              uiActive.set(true);
              Events.fireAutocompleterUpdateActiveRange(editor, { range: context.range });
              Events.fireAutocompleterStart(editor, { lookupData });
            }
          });
        });
      }
    );
  };

  const isRangeInsideOrEqual = (innerRange: Range, outerRange: Range) => {
    const startComparison = innerRange.compareBoundaryPoints(window.Range.START_TO_START, outerRange);
    const endComparison = innerRange.compareBoundaryPoints(window.Range.END_TO_END, outerRange);

    return startComparison >= 0 && endComparison <= 0;
  };

  const readActiveRange = () => {
    return activeAutocompleter.get().bind(({ trigger }) => {
      const selRange = editor.selection.getRng();
      return getContext(editor.dom, selRange, trigger, uiActive.get())
        .filter(({ range }) => isRangeInsideOrEqual(selRange, range))
        .map(({ range }) => range);
    });
  };

  editor.addCommand('mceAutocompleterReload', (_ui, value: AutocompleterReloadArgs) => {
    const fetchOptions = Type.isObject(value) ? value.fetchOptions : {};
    load(fetchOptions);
  });

  editor.addCommand('mceAutocompleterClose', cancelIfNecessary);

  editor.addCommand('mceAutocompleterRefreshActiveRange', () => {
    readActiveRange().each((range) => {
      Events.fireAutocompleterUpdateActiveRange(editor, { range });
    });
  });

  editor.editorCommands.addQueryStateHandler('mceAutoCompleterInRange', () => readActiveRange().isSome());

  setupEditorInput(editor, {
    cancelIfNecessary,
    load
  });
};
