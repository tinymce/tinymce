/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyEvents, Behaviour, GuiFactory, Highlighting, InlineView, ItemTypes, Menu, SystemEvents } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Arr, Cell, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { DOMUtils } from 'tinymce/core/api/PublicApi';
import { AutocompleteLookupData } from 'tinymce/core/autocomplete/AutocompleteTypes';

import { AutocompleterEditorEvents, AutocompleterUiApi } from './autocomplete/AutocompleteEditorEvents';
import * as AutocompleteTagReader from './autocomplete/AutocompleteTagReader';
import { UiFactoryBackstageShared } from './backstage/Backstage';
import ItemResponse from './ui/menus/item/ItemResponse';
import { createPartialMenuWithAlloyItems } from './ui/menus/menu/MenuUtils';
import { createAutocompleteItems, createMenuFrom, FocusMode } from './ui/menus/menu/SingleMenu';

const getAutocompleterRange = (dom: DOMUtils, initRange: Range): Optional<Range> => {
  return AutocompleteTagReader.detect(SugarElement.fromDom(initRange.startContainer)).map((elm) => {
    const range = dom.createRng();
    range.selectNode(elm.dom);
    return range;
  });
};

const register = (editor: Editor, sharedBackstage: UiFactoryBackstageShared) => {
  const processingAction = Cell<boolean>(false);
  const activeState = Cell<boolean>(false);

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
  const isActive = activeState.get;

  const hideIfNecessary = () => {
    if (isActive()) {
      InlineView.hide(autocompleter);
    }
  };

  const cancelIfNecessary = () => editor.execCommand('mceAutocompleterClose');

  const getCombinedItems = (matches: AutocompleteLookupData[]): ItemTypes.ItemSpec[] => {
    const columns = Arr.findMap(matches, (m) => Optional.from(m.columns)).getOr(1);

    return Arr.bind(matches, (match) => {
      const choices = match.items;

      return createAutocompleteItems(
        choices,
        match.matchText,
        (itemValue, itemMeta) => {
          const nr = editor.selection.getRng();
          getAutocompleterRange(editor.dom, nr).each((range) => {
            const autocompleterApi: InlineContent.AutocompleterInstanceApi = {
              hide: () => cancelIfNecessary(),
              reload: (fetchOptions: Record<string, any>) => {
                hideIfNecessary();
                editor.execCommand('mceAutocompleterReload', false, { fetchOptions });
              }
            };
            processingAction.set(true);
            match.onAction(autocompleterApi, range, itemValue, itemMeta);
            processingAction.set(false);
          });
        },
        columns,
        ItemResponse.BUBBLE_TO_SANDBOX,
        sharedBackstage,
        match.highlightOn
      );
    });
  };

  const display = (lookupData: AutocompleteLookupData[], items: ItemTypes.ItemSpec[]) => {
    AutocompleteTagReader.findIn(SugarElement.fromDom(editor.getBody())).each((element) => {
      // Display the autocompleter menu
      const columns: InlineContent.ColumnTypes = Arr.findMap(lookupData, (ld) => Optional.from(ld.columns)).getOr(1);
      InlineView.showAt(
        autocompleter,
        Menu.sketch(
          createMenuFrom(
            createPartialMenuWithAlloyItems('autocompleter-value', true, items, columns, 'normal'),
            columns,
            FocusMode.ContentFocus,
            // Use the constant.
            'normal'
          )
        ),
        {
          anchor: {
            type: 'node',
            root: SugarElement.fromDom(editor.getBody()),
            node: Optional.from(element)
          }
        }
      );

      InlineView.getContent(autocompleter).each(Highlighting.highlightFirst);
    });
  };

  const updateDisplay = (lookupData: AutocompleteLookupData[]) => {
    const combinedItems = getCombinedItems(lookupData);

    // Open the autocompleter if there are items to show
    if (combinedItems.length > 0) {
      display(lookupData, combinedItems);
    } else {
      hideIfNecessary();
    }
  };

  editor.on('AutocompleterStart', ({ lookupData }) => {
    activeState.set(true);
    processingAction.set(false);
    updateDisplay(lookupData);
  });

  editor.on('AutocompleterUpdate', ({ lookupData }) => updateDisplay(lookupData));

  editor.on('AutocompleterEnd', () => {
    // Hide the menu and reset
    hideIfNecessary();
    activeState.set(false);
    processingAction.set(false);
  });

  const autocompleterUiApi: AutocompleterUiApi = {
    cancelIfNecessary,
    isMenuOpen,
    isActive,
    isProcessingAction: processingAction.get,
    getView: () => InlineView.getContent(autocompleter)
  };

  AutocompleterEditorEvents.setup(autocompleterUiApi, editor);
};

export const Autocompleter = {
  register
};
