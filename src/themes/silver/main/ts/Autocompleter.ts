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

const register = (editor: Editor, sharedBackstage: UiFactoryBackstageShared) => {
  const currentContext = Cell(Option.none<AutocompleteContext>());
  const lastElement = Cell(Option.none<Element>());
  const lastMatch = Cell<number>(0);

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
          AlloyEvents.run(SystemEvents.dismissRequested(), () => closeIfNecessary())
        ])
      ]),
      lazySink: sharedBackstage.getSink
    })
  );

  const isMenuOpen = () => InlineView.isOpen(autocompleter);
  const isActive = () => currentContext.get().isSome();

  const hideIfNecessary = () => {
    if (isActive()) {
      InlineView.hide(autocompleter);
    }
  };

  const closeIfNecessary = () => {
    if (isActive()) {
      // Unwrap the content if an incomplete mention
      AutocompleteTag.detect(lastElement.get().getOr(Element.fromDom(editor.selection.getNode()))).each(Remove.unwrap);

      // Hide the menu and reset
      hideIfNecessary();
      lastElement.set(Option.none());
      currentContext.set(Option.none());
      lastMatch.set(0);
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
          // Don't reuse the stored context here, as the dom may have changed meaning the
          // stored context range would have been altered
          getContext(editor.dom, nr, triggerChar).fold(
            () => console.error('Lost context. Cursor probably moved'),
            ({ range }) => {
              const autocompleterApi: InlineContent.AutocompleterInstanceApi = {
                hide: closeIfNecessary
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
    lastElement.set(Option.some(wrapper));
    currentContext.set(Option.some(context));

    // Show the menu
    display(context, lookupData, items);
  };

  const display = (context: AutocompleteContext, lookupData: AutocompleteLookupData[], items: ItemTypes.ItemSpec[]) => {
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
    return currentContext.get().map((context) => {
      const newContextOpt = getContext(editor.dom, editor.selection.getRng(), context.triggerChar);
      currentContext.set(newContextOpt);
      return newContextOpt.map((newContext) => lookupWithContext(editor, getAutocompleters, newContext));
    }).getOrThunk(() => lookup(editor, getAutocompleters));
  };

  const onKeypress = Throttler.last(() => {
    doLookup().fold(
      closeIfNecessary,
      (lookupInfo) => {
        lookupInfo.lookupData.then((lookupData) => {
          const context = lookupInfo.context;
          const combinedItems = getCombinedItems(context.triggerChar, lookupData);

          // Open the autocompleter if there are items to show
          if (combinedItems.length > 0) {
            lastMatch.set(context.text.length);
            const func = isActive() ? display : commence;
            func(context, lookupData, combinedItems);
          // close if we haven't found any matches in the last 10 chars
          } else if (context.text.length - lastMatch.get() >= 10) {
            closeIfNecessary();
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
    closeIfNecessary,
    isMenuOpen,
    isActive,
    getView: () => InlineView.getContent(autocompleter),
  };

  AutocompleterEditorEvents.setup(autocompleterUiApi, editor);
};

export const Autocompleter = {
  register
};