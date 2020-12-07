/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyEvents, Behaviour, GuiFactory, Highlighting, InlineView, ItemTypes, Menu, SystemEvents } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Arr, Cell, Optional, Throttler, Thunk } from '@ephox/katamari';
import { Remove, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { AutocompleteContext, getContext } from './autocomplete/AutocompleteContext';
import { AutocompleterEditorEvents, AutocompleterUiApi } from './autocomplete/AutocompleteEditorEvents';
import { AutocompleteLookupData, AutocompleteLookupInfo, lookup, lookupWithContext } from './autocomplete/AutocompleteLookup';
import * as Autocompleters from './autocomplete/Autocompleters';
import * as AutocompleteTag from './autocomplete/AutocompleteTag';
import { UiFactoryBackstageShared } from './backstage/Backstage';
import ItemResponse from './ui/menus/item/ItemResponse';
import { createPartialMenuWithAlloyItems } from './ui/menus/menu/MenuUtils';
import { createAutocompleteItems, createMenuFrom, FocusMode } from './ui/menus/menu/SingleMenu';

interface ActiveAutocompleter {
  triggerChar: string;
  element: SugarElement;
  matchLength: number;
}

const register = (editor: Editor, sharedBackstage: UiFactoryBackstageShared) => {
  const activeAutocompleter = Cell<Optional<ActiveAutocompleter>>(Optional.none());
  const processingAction = Cell<boolean>(false);

  const autocompleter = GuiFactory.build(
    InlineView.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-autocompleter' ]
      },
      components: [ ],
      fireDismissalEventInstead: { },
      inlineBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('dismissAutocompleter', [
          AlloyEvents.run(SystemEvents.dismissRequested(), () => cancelIfNecessary())
        ])
      ]),
      lazySink: sharedBackstage.getSink
    })
  );

  const isMenuOpen = () => InlineView.isOpen(autocompleter);
  const isActive = () => activeAutocompleter.get().isSome();

  const hideIfNecessary = () => {
    if (isActive()) {
      InlineView.hide(autocompleter);
    }
  };

  const cancelIfNecessary = () => {
    if (isActive()) {
      // Unwrap the content if an incomplete mention
      const lastElement = activeAutocompleter.get().map((ac) => ac.element);
      AutocompleteTag.detect(lastElement.getOr(SugarElement.fromDom(editor.selection.getNode()))).each(Remove.unwrap);

      // Hide the menu and reset
      hideIfNecessary();
      activeAutocompleter.set(Optional.none());
      processingAction.set(false);
    }
  };

  // This needs to be calculated once things are ready, but the key events must be bound
  // before `init` or other keydown / keypress listeners will fire first. Therefore,
  // this is a thunk so that its value is calculated just once when it is used for the
  // first time, and after that it's value is stored.
  const getAutocompleters: () => Autocompleters.AutocompleterDatabase = Thunk.cached(() => Autocompleters.register(editor));

  const getCombinedItems = (triggerChar: string, matches: AutocompleteLookupData[]): ItemTypes.ItemSpec[] => {
    const columns = Arr.findMap(matches, (m) => Optional.from(m.columns)).getOr(1);

    return Arr.bind(matches, (match) => {
      const choices = match.items;

      return createAutocompleteItems(
        choices,
        match.matchText,
        (itemValue, itemMeta) => {
          const nr = editor.selection.getRng();
          getContext(editor.dom, nr, triggerChar).fold(
            // eslint-disable-next-line no-console
            () => console.error('Lost context. Cursor probably moved'),
            ({ range }) => {
              const autocompleterApi: InlineContent.AutocompleterInstanceApi = {
                hide: () => {
                  cancelIfNecessary();
                },
                reload: (fetchOptions: Record<string, any>) => {
                  // Hide and then reload
                  hideIfNecessary();
                  load(fetchOptions);
                }
              };
              processingAction.set(true);
              match.onAction(autocompleterApi, range, itemValue, itemMeta);
              processingAction.set(false);
            }
          );
        },
        columns,
        ItemResponse.BUBBLE_TO_SANDBOX,
        sharedBackstage,
        match.highlightOn
      );
    });
  };

  const commenceIfNecessary = (context: AutocompleteContext) => {
    if (!isActive()) {
      // Create the wrapper
      const wrapper = AutocompleteTag.create(editor, context.range);

      // store the element/context
      activeAutocompleter.set(Optional.some({
        triggerChar: context.triggerChar,
        element: wrapper,
        matchLength: context.text.length
      }));
      processingAction.set(false);
    }
  };

  const display = (ac: ActiveAutocompleter, context: AutocompleteContext, lookupData: AutocompleteLookupData[], items: ItemTypes.ItemSpec[]) => {
    // Update the last displayed matched length
    ac.matchLength = context.text.length;

    // Display the autocompleter menu
    const columns: InlineContent.ColumnTypes = Arr.findMap(lookupData, (ld) => Optional.from(ld.columns)).getOr(1);
    InlineView.showAt(
      autocompleter,
      {
        anchor: 'node',
        root: SugarElement.fromDom(editor.getBody()),
        node: Optional.from(ac.element)
      },
      Menu.sketch(
        createMenuFrom(
          createPartialMenuWithAlloyItems('autocompleter-value', true, items, columns, 'normal'),
          columns,
          FocusMode.ContentFocus,
          // Use the constant.
          'normal'
        )
      )
    );

    InlineView.getContent(autocompleter).each(Highlighting.highlightFirst);
  };

  const doLookup = (fetchOptions?: Record<string, any>): Optional<AutocompleteLookupInfo> =>
    activeAutocompleter.get().map(
      (ac) => getContext(editor.dom, editor.selection.getRng(), ac.triggerChar)
        .bind((newContext) => lookupWithContext(editor, getAutocompleters, newContext, fetchOptions))
    ).getOrThunk(() => lookup(editor, getAutocompleters));

  const load = (fetchOptions?: Record<string, any>) => {
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
            if (ac.triggerChar === context.triggerChar) {
              const combinedItems = getCombinedItems(context.triggerChar, lookupData);

              // Open the autocompleter if there are items to show
              if (combinedItems.length > 0) {
                display(ac, context, lookupData, combinedItems);
                // close if we haven't found any matches in the last 10 chars
              } else if (context.text.length - ac.matchLength >= 10) {
                cancelIfNecessary();
                // otherwise just hide the menu
              } else {
                hideIfNecessary();
              }
            }
          });
        });
      }
    );
  };

  const onKeypress = Throttler.last((e) => {
    // IE will pass the escape key here, so just don't do anything on escape
    if (e.which === 27) {
      return;
    }

    load();
  }, 50);

  const autocompleterUiApi: AutocompleterUiApi = {
    onKeypress,
    cancelIfNecessary,
    isMenuOpen,
    isActive,
    isProcessingAction: processingAction.get,
    getView: () => InlineView.getContent(autocompleter)
  };

  if (editor.hasPlugin('rtc') === false) {
    AutocompleterEditorEvents.setup(autocompleterUiApi, editor);
  }
};

export const Autocompleter = {
  register
};
