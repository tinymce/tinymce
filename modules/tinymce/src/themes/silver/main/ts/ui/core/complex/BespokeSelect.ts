/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, TieredData } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Arr, Fun, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { TranslateIfNeeded } from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { renderCommonDropdown } from '../../dropdown/CommonDropdown';
import ItemResponse from '../../menus/item/ItemResponse';
import * as NestedMenus from '../../menus/menu/NestedMenus';
import { ToolbarButtonClasses } from '../../toolbar/button/ButtonClasses';
import { SelectDataset } from './SelectDatasets';
import * as FormatRegister from './utils/FormatRegister';

export interface PreviewSpec {
  tag: string;
  styles: Record<string, string>;
}

export interface FormatterFormatItem {
  type: 'formatter';
  title?: TranslateIfNeeded;
  format: string;
  isSelected: (value: Option<any>) => boolean;
  getStylePreview: () => Option<PreviewSpec>;
}

export interface SubMenuFormatItem {
  type: 'submenu';
  title: TranslateIfNeeded;
  getStyleItems: () => FormatItem[];
}

export interface SeparatorFormatItem {
  type: 'separator';
  title?: TranslateIfNeeded;
}

export type FormatItem = FormatterFormatItem | SubMenuFormatItem | SeparatorFormatItem;

export interface SelectSpec {
  tooltip: string;
  icon: Option<string>;
  // This is used for determining if an item gets a tick in the menu
  isSelectedFor: FormatRegister.IsSelectedForType;
  // This is used to get the current selection value when a menu is opened
  getCurrentValue: () => Option<any>;
  // This is used for rendering individual items with styles
  getPreviewFor: FormatRegister.GetPreviewForType;
  // This is used for clicking on the item
  onAction: (item: FormatterFormatItem) => (api) => void;
  // This is used for setting up the handler to change the menu text
  nodeChangeHandler: Option<(comp: AlloyComponent) => (e) => void>;
  // This is true if items should be hidden if they are not an applicable
  // format to the current selection
  shouldHide: boolean;
  // This determines if an item is applicable
  isInvalid: (item: FormatterFormatItem) => boolean;

  // This is used for assigning initial values
  setInitialValue: Option<(comp: AlloyComponent) => void>;

  dataset: SelectDataset;
}

export interface SelectData {
  getData: () => FormatItem[];
  getFlattenedKeys: () => string[];
}

interface BespokeSelectApi {
  getComponent: () => AlloyComponent;
}

const enum IrrelevantStyleItemResponse { Hide, Disable }

const generateSelectItems = (_editor: Editor, backstage: UiFactoryBackstage, spec: SelectSpec) => {
  const generateItem = (rawItem: FormatItem, response: IrrelevantStyleItemResponse, disabled: boolean, value: Option<any>): Option<Menu.NestedMenuItemContents> => {
    const translatedText = backstage.shared.providers.translate(rawItem.title);
    if (rawItem.type === 'separator') {
      return Option.some<Menu.SeparatorMenuItemApi>({
        type: 'separator',
        text: translatedText
      });
    } else if (rawItem.type === 'submenu') {
      const items = Arr.bind(rawItem.getStyleItems(), (si) => validate(si, response, value));
      if (response === IrrelevantStyleItemResponse.Hide && items.length <= 0) {
        return Option.none();
      } else {
        return Option.some<Menu.NestedMenuItemApi>({
          type: 'nestedmenuitem',
          text: translatedText,
          disabled: items.length <= 0,
          getSubmenuItems: () => Arr.bind(rawItem.getStyleItems(), (si) => validate(si, response, value))
        });
      }
    } else {
      return Option.some<Menu.ToggleMenuItemApi>({
        // ONLY TOGGLEMENUITEMS HANDLE STYLE META.
        // See ToggleMenuItem and ItemStructure for how it's handled.
        // If this type ever changes, we'll need to change that too
        type: 'togglemenuitem',
        text: translatedText,
        active: rawItem.isSelected(value),
        disabled,
        onAction: spec.onAction(rawItem),
        ...rawItem.getStylePreview().fold(() => ({}), (preview) => ({ meta: { style: preview } as any }))
      });
    }
  };

  const validate = (item: FormatItem, response: IrrelevantStyleItemResponse, value: Option<any>): Menu.NestedMenuItemContents[] => {
    const invalid = item.type === 'formatter' && spec.isInvalid(item);

    // If we are making them disappear based on some setting
    if (response === IrrelevantStyleItemResponse.Hide) {
      return invalid ? [ ] : generateItem(item, response, false, value).toArray();
    } else {
      return generateItem(item, response, invalid, value).toArray();
    }
  };

  const validateItems = (preItems: FormatItem[]) => {
    const value = spec.getCurrentValue();
    const response = spec.shouldHide ? IrrelevantStyleItemResponse.Hide : IrrelevantStyleItemResponse.Disable;
    return Arr.bind(preItems, (item) => validate(item, response, value));
  };

  const getFetch = (backstage: UiFactoryBackstage, getStyleItems: () => FormatItem[]) => (callback: (menu: Option<TieredData>) => null) => {
    const preItems = getStyleItems();
    const items = validateItems(preItems);
    const menu = NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, false);
    callback(menu);
  };

  return {
    validateItems, getFetch
  };
};

const createMenuItems = (editor: Editor, backstage: UiFactoryBackstage, spec: SelectSpec) => {
  const dataset = spec.dataset; // needs to be a var for tsc to understand the ternary
  const getStyleItems = dataset.type === 'basic' ? () => Arr.map(dataset.data, (d) => FormatRegister.processBasic(d, spec.isSelectedFor, spec.getPreviewFor)) : dataset.getData;
  return {
    items: generateSelectItems(editor, backstage, spec),
    getStyleItems
  };
};

const createSelectButton = (editor: Editor, backstage: UiFactoryBackstage, spec: SelectSpec) => {
  const { items, getStyleItems } = createMenuItems(editor, backstage, spec);

  const getApi = (comp: AlloyComponent): BespokeSelectApi => {
    return { getComponent: () => comp };
  };

  const onSetup = (api: BespokeSelectApi): () => void => {
    spec.setInitialValue.each((f) => f(api.getComponent()));
    return spec.nodeChangeHandler.map((f) => {
      const handler = f(api.getComponent());
      editor.on('NodeChange', handler);

      return () => {
        editor.off('NodeChange', handler);
      };
    }).getOr(Fun.noop);
  };

  return renderCommonDropdown(
    {
      text: spec.icon.isSome() ? Option.none() : Option.some(''),
      icon: spec.icon,
      tooltip: Option.from(spec.tooltip),
      role: Option.none(),
      fetch: items.getFetch(backstage, getStyleItems),
      onSetup,
      getApi,
      columns: 1,
      presets: 'normal',
      classes: spec.icon.isSome() ? [] : [ 'bespoke' ],
      dropdownBehaviours: []
    },
    ToolbarButtonClasses.Button,
    backstage.shared
  );
};

export { createMenuItems, createSelectButton };
