/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { GuiFactory, InlineView, Menu, Highlighting, ItemTypes } from '@ephox/alloy';
import { InlineContent, Types } from '@ephox/bridge';
import { console, Range, Text } from '@ephox/dom-globals';
import { Arr, Option, Options, Throttler, Thunk } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { UiFactoryBackstageShared } from './backstage/Backstage';
import { getContext } from './ui/autocomplete/AutocompleteContext';
import { AutocompleterEditorEvents, AutocompleterUiApi } from './ui/autocomplete/AutocompleteEditorEvents';
import { AutocompleteLookupData, lookup } from './ui/autocomplete/AutocompleteLookup';
import * as Autocompleters from './ui/autocomplete/Autocompleters';
import {
  createAutocompleteItems,
  createMenuFrom,
  createPartialMenuWithAlloyItems,
  FocusMode,
} from './ui/menus/menu/SingleMenu';
import ItemResponse from './ui/menus/item/ItemResponse';
import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor, sharedBackstage: UiFactoryBackstageShared) => {
  const autocompleter = GuiFactory.build(
    InlineView.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-autocompleter' ]
      },
      components: [

      ],
      lazySink: sharedBackstage.getSink
    })
  );

  const isActive = () => InlineView.isOpen(autocompleter);
  const closeIfNecessary = () => {
    if (isActive()) {
      InlineView.hide(autocompleter);
    }
  };

  // This needs to be calcluated once things are ready, but the key events must be bound
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
        (itemValue, itemMeta) => {
          const nr = editor.selection.getRng();
          const textNode = nr.startContainer as Text; // TODO: Investigate if this is safe
          getContext(nr, triggerChar, textNode.data, nr.startOffset).fold(
            () => console.error('Lost context. Cursor probably moved'),
            ({ rng }) => {
              const autocompleterApi: InlineContent.AutocompleterInstanceApi = {
                hide: closeIfNecessary
              };
              match.onAction(autocompleterApi, rng, itemValue, itemMeta);
            }
          );
        },
        columns,
        ItemResponse.BUBBLE_TO_SANDBOX,
        sharedBackstage
      );
    });
  };

  const onKeypress = Throttler.last((e) => {
    const optMatches = e.key === ' ' ? Option.none<{ range: Range, triggerChar: string, lookupData: Promise<AutocompleteLookupData[]> }>() : lookup(editor, getAutocompleters);
    optMatches.fold(
      closeIfNecessary,
      (lookupInfo) => {
        lookupInfo.lookupData.then((lookupData) => {
          const combinedItems = getCombinedItems(lookupInfo.triggerChar, lookupData);

          // Only open the autocompleter if there are items to show
          if (combinedItems.length > 0) {
            const columns: Types.ColumnTypes = Options.findMap(lookupData, (ld) => Option.from(ld.columns)).getOr(1);
            InlineView.showAt(
              autocompleter,
              {
                anchor: 'selection',
                root: Element.fromDom(editor.getBody()),
                getSelection: () => {
                  return Option.some({
                    start: () => Element.fromDom(lookupInfo.range.startContainer),
                    soffset: () => lookupInfo.range.startOffset,
                    finish: () => Element.fromDom(lookupInfo.range.endContainer),
                    foffset: () => lookupInfo.range.endOffset
                  });
                }
              },
              Menu.sketch(
                createMenuFrom(
                  createPartialMenuWithAlloyItems('autocompleter-value', true, combinedItems, columns, 'normal'),
                  columns,
                  FocusMode.ContentFocus,
                  // Use the constant.
                  'normal'
                )
              )
            );

            InlineView.getContent(autocompleter).each(Highlighting.highlightFirst);
          } else {
            closeIfNecessary();
          }
        });
      }
    );
  }, 50);

  const autocompleterUiApi: AutocompleterUiApi = {
    onKeypress,
    closeIfNecessary,
    isActive,
    getView: () => InlineView.getContent(autocompleter),
  };

  AutocompleterEditorEvents.setup(autocompleterUiApi, editor);
};

export const Autocompleter = {
  register
};