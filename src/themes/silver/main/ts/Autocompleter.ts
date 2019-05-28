/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { GuiFactory, InlineView, Menu, Highlighting, ItemTypes, Behaviour, AddEventsBehaviour, AlloyEvents, SystemEvents } from '@ephox/alloy';
import { InlineContent, Types } from '@ephox/bridge';
import { console } from '@ephox/dom-globals';
import { Arr, Cell, Option, Options, Throttler, Thunk } from '@ephox/katamari';
import { Element, Remove } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { AutocompleteContext, getContext } from './autocomplete/AutocompleteContext';
import { AutocompleterEditorEvents, AutocompleterUiApi } from './autocomplete/AutocompleteEditorEvents';
import { AutocompleteLookupInfo, AutocompleteLookupData, lookup, lookupWithContext } from './autocomplete/AutocompleteLookup';
import * as AutocompleteTag from './autocomplete/AutocompleteTag';
import * as Autocompleters from './autocomplete/Autocompleters';
import { UiFactoryBackstageShared } from './backstage/Backstage';
import { createAutocompleteItems, createMenuFrom, FocusMode } from './ui/menus/menu/SingleMenu';
import { createPartialMenuWithAlloyItems } from './ui/menus/menu/MenuUtils';
import ItemResponse from './ui/menus/item/ItemResponse';

interface ActiveAutocompleter {
  triggerChar: string;
  element: Element;
  matchLength: number;
}

const register = (editor: Editor, sharedBackstage: UiFactoryBackstageShared) => {
  const activeAutocompleter = Cell<Option<ActiveAutocompleter>>(Option.none());

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
      AutocompleteTag.detect(lastElement.getOr(Element.fromDom(editor.selection.getNode()))).each(Remove.unwrap);

      // Hide the menu and reset
      hideIfNecessary();
      activeAutocompleter.set(Option.none());
    }
  };

  // This needs to be calculated once things are ready, but the key events must be bound
  // before `init` or other keydown / keypress listeners will fire first. Therefore,
  // this is a thunk so that its value is calculated just once when it is used for the
  // first time, and after that it's value is stored.
  const getAutocompleters: () => Autocompleters.AutocompleterDatabase = Thunk.cached(() => {
    return Autocompleters.register(editor);
  });

  const getCombinedItems = (triggerChar: string, matches: AutocompleteLookupData[]): ItemTypes.ItemSpec[] => {
    const columns = Options.findMap(matches, (m) => Option.from(m.columns)).getOr(1);

    return Arr.bind(matches, (match) => {
      const choices = match.items;

      return createAutocompleteItems(
        choices,
        match.matchText,
        (itemValue, itemMeta) => {
          const nr = editor.selection.getRng();
          getContext(editor.dom, nr, triggerChar).fold(
            () => console.error('Lost context. Cursor probably moved'),
            ({ range }) => {
              const autocompleterApi: InlineContent.AutocompleterInstanceApi = {
                hide: cancelIfNecessary
              };
              match.onAction(autocompleterApi, range, itemValue, itemMeta);
            }
          );
        },
        columns,
        ItemResponse.BUBBLE_TO_SANDBOX,
        sharedBackstage
      );
    });
  };

  const commence = (context: AutocompleteContext, lookupData: AutocompleteLookupData[], items: ItemTypes.ItemSpec[]) => {
    // Create the wrapper
    const wrapper = AutocompleteTag.create(editor, context.range);

    // store the element/context
    activeAutocompleter.set(Option.some({
      triggerChar: context.triggerChar,
      element: wrapper,
      matchLength: context.text.length
    }));

    // Show the menu
    display(context, lookupData, items);
  };

  const display = (context: AutocompleteContext, lookupData: AutocompleteLookupData[], items: ItemTypes.ItemSpec[]) => {
    // Update the last displayed matched length
    activeAutocompleter.get().map((ac) => ac.matchLength = context.text.length);

    // Display the autocompleter menu
    const columns: Types.ColumnTypes = Options.findMap(lookupData, (ld) => Option.from(ld.columns)).getOr(1);
    const contextRng = context.range;
    InlineView.showAt(
      autocompleter,
      {
        anchor: 'selection',
        root: Element.fromDom(editor.getBody()),
        getSelection: () => {
          return Option.some({
            start: () => Element.fromDom(contextRng.startContainer),
            soffset: () => contextRng.startOffset,
            finish: () => Element.fromDom(contextRng.endContainer),
            foffset: () => contextRng.endOffset
          });
        }
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

  const doLookup = (): Option<AutocompleteLookupInfo> => {
    return activeAutocompleter.get().map((ac) => {
      return getContext(editor.dom, editor.selection.getRng(), ac.triggerChar).map((newContext) => lookupWithContext(editor, getAutocompleters, newContext));
    }).getOrThunk(() => lookup(editor, getAutocompleters));
  };

  const onKeypress = Throttler.last((e) => {
    // IE will pass the escape key here, so just don't do anything on escape
    if (e.which === 27) {
      return;
    }

    doLookup().fold(
      cancelIfNecessary,
      (lookupInfo) => {
        lookupInfo.lookupData.then((lookupData) => {
          const context = lookupInfo.context;
          const lastMatchLength = activeAutocompleter.get().map((c) => c.matchLength).getOr(0);
          const combinedItems = getCombinedItems(context.triggerChar, lookupData);

          // Open the autocompleter if there are items to show
          if (combinedItems.length > 0) {
            const func = isActive() ? display : commence;
            func(context, lookupData, combinedItems);
          // close if we haven't found any matches in the last 10 chars
          } else if (context.text.length - lastMatchLength >= 10) {
            cancelIfNecessary();
          // otherwise just hide the menu
          } else {
            hideIfNecessary();
          }
        });
      }
    );
  }, 50);

  const autocompleterUiApi: AutocompleterUiApi = {
    onKeypress,
    cancelIfNecessary,
    isMenuOpen,
    isActive,
    getView: () => InlineView.getContent(autocompleter),
  };

  AutocompleterEditorEvents.setup(autocompleterUiApi, editor);
};

export const Autocompleter = {
  register
};