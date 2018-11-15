import { Menu } from '@ephox/bridge';
import { Arr, Option } from '@ephox/katamari';
import { renderCommonDropdown } from '../../dropdown/CommonDropdown';
import * as NestedMenus from '../../menus/menu/NestedMenus';
import { SingleMenuItemApi } from '../../menus/menu/SingleMenu';
import * as FormatRegister from './utils/FormatRegister';
import { ToolbarButtonClasses } from '../../toolbar/button/ButtonClasses';
import { BasicSelectDataset, AdvancedSelectDataset } from './SelectDatasets';
import { AlloyComponent } from '@ephox/alloy';
import { TranslateIfNeeded } from 'tinymce/core/api/util/I18n';
import { Editor } from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import ItemResponse from '../../menus/item/ItemResponse';

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
  // This is used for determining if an item gets a tick in the menu
  isSelectedFor: FormatRegister.IsSelectedForType;
  // This is used for rendering individual items with styles
  getPreviewFor: FormatRegister.GetPreviewForType;
  // This is used for clicking on the item
  onAction: (item) => (api) => void;
  // This is used for setting up the handler to change the menu text
  nodeChangeHandler: Option<(comp: AlloyComponent) => (e) => void>;
}

export interface SelectData {
  getData: () => FormatItem[];
  getFlattenedKeys: () => string[];
}

// TODO: AP-226: Read this from hte appropriate setting
const enum IrrelevantStyleItemResponse { Hide, Disable }

const generateSelectItems = (editor: Editor, backstage: UiFactoryBackstage, spec) => {
  const generateItem = (rawItem: FormatItem, response: IrrelevantStyleItemResponse, disabled: boolean): SingleMenuItemApi => {
    const translatedText = backstage.shared.providers.translate(rawItem.title);
    if (rawItem.type === 'separator') {
      return {
        type: 'separator',
        text: translatedText
      } as Menu.SeparatorMenuItemApi;
    } else if (rawItem.type === 'submenu') {
      return {
        type: 'menuitem',
        text: translatedText,
        disabled,
        getSubmenuItems: () => Arr.bind(rawItem.getStyleItems(), (si) => validate(si, response))
      } as Menu.MenuItemApi;
    } else {
      return rawItem.getStylePreview().fold(
        () => {
          return {
            type: 'togglemenuitem',
            text: translatedText,
            active: rawItem.isSelected(),
            disabled: false,
            onAction: spec.onAction(rawItem),
          } as SingleMenuItemApi;
        },
        (preview) => {
          return {
            type: 'styleitem',
            item: {
              type: 'togglemenuitem',
              text: translatedText,
              disabled: false,
              active: rawItem.isSelected(),
              onAction: spec.onAction(rawItem),
              meta: preview as any
            } as Menu.ToggleMenuItemApi
          } as SingleMenuItemApi;
        }
      );
    }
  };

  const validate = (item: FormatItem, response: IrrelevantStyleItemResponse): SingleMenuItemApi[] => {
    const invalid = item.type === 'formatter' && !editor.formatter.canApply(item.format);

    // If we are making them disappear based on some setting
    if (response === IrrelevantStyleItemResponse.Hide) {
      return invalid ? [ ] : [ generateItem(item, response, false) ];
    } else {
      return [ generateItem(item, response, invalid) ];
    }
  };

  const validateItems = (preItems) => {
    return Arr.bind(preItems, (item) => validate(item, IrrelevantStyleItemResponse.Disable));
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
      text: Option.some(''),
      icon: Option.none(),
      role: 'button',
      fetch: items.getFetch(backstage, getStyleItems),
      onAttach: spec.nodeChangeHandler.map((f) => (comp) => editor.on('nodeChange', f(comp))).getOr(() => { }),
      onDetach: spec.nodeChangeHandler.map((f) => (comp) => editor.off('nodeChange', f(comp))).getOr(() => { }),
      columns: 1,
      presets: 'normal',
      classes: [ 'bespoke' ]
    },
    ToolbarButtonClasses.Button,
    backstage.shared
  );
};

export { createMenuItems, createSelectButton };