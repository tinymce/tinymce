/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Arr, Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { TranslateIfNeeded } from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { renderCommonDropdown } from '../../dropdown/CommonDropdown';
import ItemResponse from '../../menus/item/ItemResponse';
import * as NestedMenus from '../../menus/menu/NestedMenus';
import { ToolbarButtonClasses } from '../../toolbar/button/ButtonClasses';
import { AdvancedSelectDataset, BasicSelectDataset } from './SelectDatasets';
import * as FormatRegister from './utils/FormatRegister';

export interface PreviewSpec {
  tag: string;
  styleAttr: string;
}

export interface FormatItem {
  type: 'separator' | 'submenu' | 'formatter';
  title?: TranslateIfNeeded;
  icon?: string;
  getStyleItems: () => FormatItem[];
  format: string;
  isSelected: () => boolean;
  getStylePreview: () => Option<PreviewSpec>;
}

export interface SelectSpec {
  tooltip: string;
  icon: Option<string>;
  // This is used for determining if an item gets a tick in the menu
  isSelectedFor: FormatRegister.IsSelectedForType;
  // This is used for rendering individual items with styles
  getPreviewFor: FormatRegister.GetPreviewForType;
  // This is used for clicking on the item
  onAction: (item) => (api) => void;
  // This is used for setting up the handler to change the menu text
  nodeChangeHandler: Option<(comp: AlloyComponent) => (e) => void>;
  // This is true if items should be hidden if they are not an applicable
  // format to the current selection
  shouldHide: boolean;
  // This determines if an item is applicable
  isInvalid: (item: FormatItem) => boolean;
}

export interface SelectData {
  getData: () => FormatItem[];
  getFlattenedKeys: () => string[];
}

// TODO: AP-226: Read this from hte appropriate setting
const enum IrrelevantStyleItemResponse { Hide, Disable }

const generateSelectItems = (editor: Editor, backstage: UiFactoryBackstage, spec) => {
  const generateItem = (rawItem: FormatItem, response: IrrelevantStyleItemResponse, disabled: boolean): Menu.NestedMenuItemContents => {
    const translatedText = backstage.shared.providers.translate(rawItem.title);
    if (rawItem.type === 'separator') {
      return {
        type: 'separator',
        text: translatedText
      } as Menu.SeparatorMenuItemApi;
    } else if (rawItem.type === 'submenu') {
      return {
        type: 'nestedmenuitem',
        text: translatedText,
        disabled,
        getSubmenuItems: () => Arr.bind(rawItem.getStyleItems(), (si) => validate(si, response))
      } as Menu.NestedMenuItemApi;
    } else {
      return {
        // ONLY TOGGLEMENUITEMS HANDLE STYLE META.
        // See ToggleMenuItem and ItemStructure for how it's handled.
        // If this type ever changes, we'll need to change that too
        type: 'togglemenuitem',
        text: translatedText,
        active: rawItem.isSelected(),
        disabled,
        onAction: spec.onAction(rawItem),
        ...rawItem.getStylePreview().fold(() => ({}), (preview) => ({ meta: { style: preview } as any }))
      } as Menu.ToggleMenuItemApi;
    }
  };

  const validate = (item: FormatItem, response: IrrelevantStyleItemResponse): Menu.NestedMenuItemContents[] => {
    const invalid = item.type === 'formatter' && spec.isInvalid(item);

    // If we are making them disappear based on some setting
    if (response === IrrelevantStyleItemResponse.Hide) {
      return invalid ? [ ] : [ generateItem(item, response, false) ];
    } else {
      return [ generateItem(item, response, invalid) ];
    }
  };

  const validateItems = (preItems) => {
    const response = spec.shouldHide ? IrrelevantStyleItemResponse.Hide : IrrelevantStyleItemResponse.Disable;
    return Arr.bind(preItems, (item) => validate(item, response));
  };

  const getFetch = (backstage, getStyleItems) => (callback) => {
    const preItems = getStyleItems();
    const items = validateItems(preItems);
    const menu = NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage.shared.providers);
    callback(menu);
  };

  return {
    validateItems, getFetch
  };
};

const createMenuItems = (editor: Editor, backstage: UiFactoryBackstage, dataset: BasicSelectDataset | AdvancedSelectDataset, spec: SelectSpec) => {
  const getStyleItems = dataset.type === 'basic' ? () => Arr.map(dataset.data, (d) => FormatRegister.processBasic(d, spec.isSelectedFor, spec.getPreviewFor)) : dataset.getData;
  return {
    items: generateSelectItems(editor, backstage, spec),
    getStyleItems
  };
};

const createSelectButton = (editor: Editor, backstage: UiFactoryBackstage, dataset: BasicSelectDataset | AdvancedSelectDataset, spec: SelectSpec) => {
  const {items, getStyleItems} = createMenuItems(editor, backstage, dataset, spec);
  return renderCommonDropdown(
    {
      text: spec.icon.isSome() ? Option.none() : Option.some(''),
      icon: spec.icon,
      tooltip: Option.from(spec.tooltip),
      role: Option.none(),
      fetch: items.getFetch(backstage, getStyleItems),
      onAttach: spec.nodeChangeHandler.map((f) => (comp) => editor.on('nodeChange', f(comp))).getOr(() => { }),
      onDetach: spec.nodeChangeHandler.map((f) => (comp) => editor.off('nodeChange', f(comp))).getOr(() => { }),
      columns: 1,
      presets: 'normal',
      classes: spec.icon.isSome() ? [] : [ 'bespoke' ]
    },
    ToolbarButtonClasses.Button,
    backstage.shared
  );
};

export { createMenuItems, createSelectButton };