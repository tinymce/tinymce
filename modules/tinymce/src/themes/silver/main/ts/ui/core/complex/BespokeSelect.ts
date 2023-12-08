import { AlloyComponent, Disabling, SketchSpec, TieredData } from '@ephox/alloy';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { renderCommonDropdown } from '../../dropdown/CommonDropdown';
import ItemResponse from '../../menus/item/ItemResponse';
import * as NestedMenus from '../../menus/menu/NestedMenus';
import { ToolbarButtonClasses } from '../../toolbar/button/ButtonClasses';
import { composeUnbinders, onSetupEvent } from '../ControlUtils';
import { SelectDataset } from './SelectDatasets';
import { NestedStyleFormat } from './StyleFormat';
import * as FormatRegister from './utils/FormatRegister';
import * as Tooltip from './utils/Tooltip';

export interface PreviewSpec {
  readonly tag: string;
  readonly styles: Record<string, string>;
}

export interface FormatterFormatItem {
  readonly type: 'formatter';
  readonly title: string;
  readonly format: string;
  readonly icon?: string;
  readonly isSelected: (value: Optional<any>) => boolean;
  readonly getStylePreview: () => Optional<PreviewSpec>;
}

export interface SubMenuFormatItem extends NestedStyleFormat {
  readonly type: 'submenu';
  readonly getStyleItems: () => FormatItem[];
}

export interface SeparatorFormatItem {
  readonly type: 'separator';
  readonly title: string;
}

export type FormatItem = FormatterFormatItem | SubMenuFormatItem | SeparatorFormatItem;

export interface SelectedFormat {
  readonly title: string;
  readonly format: string;
}

export interface SelectSpec {
  readonly tooltip: string;
  readonly text: Optional<string>;
  readonly icon: Optional<string>;
  // This is used for determining if an item gets a tick in the menu
  readonly isSelectedFor: FormatRegister.IsSelectedForType;
  // This is used to get the current selection value when a menu is opened
  readonly getCurrentValue: () => Optional<SelectedFormat>;
  // This is used for rendering individual items with styles
  readonly getPreviewFor: FormatRegister.GetPreviewForType;
  // This is used for clicking on the item
  readonly onAction: (item: FormatterFormatItem) => (api: Menu.ToggleMenuItemInstanceApi) => void;
  // This is used to change the menu text
  readonly updateText: (comp: AlloyComponent) => void;
  // This is true if items should be hidden if they are not an applicable
  // format to the current selection
  readonly shouldHide: boolean;
  // This determines if an item is applicable
  readonly isInvalid: (item: FormatterFormatItem) => boolean;

  readonly dataset: SelectDataset;
}

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
  readonly setTooltip: (tooltip: string) => void;
}

interface BespokeMenuItems {
  readonly items: {
    readonly validateItems: (preItems: FormatItem[]) => Menu.NestedMenuItemContents[];
    readonly getFetch: (backstage: UiFactoryBackstage, getStyleItems: () => FormatItem[]) => (comp: AlloyComponent, callback: (menu: Optional<TieredData>) => void) => void;
  };
  readonly getStyleItems: () => FormatItem[];
}

const enum IrrelevantStyleItemResponse {
  Hide,
  Disable
}

const generateSelectItems = (_editor: Editor, backstage: UiFactoryBackstage, spec: SelectSpec) => {
  const generateItem = (rawItem: FormatItem, response: IrrelevantStyleItemResponse, invalid: boolean, value: Optional<SelectedFormat>): Optional<Menu.NestedMenuItemContents> => {
    const translatedText = backstage.shared.providers.translate(rawItem.title);
    if (rawItem.type === 'separator') {
      return Optional.some<Menu.SeparatorMenuItemSpec>({
        type: 'separator',
        text: translatedText
      });
    } else if (rawItem.type === 'submenu') {
      const items = Arr.bind(rawItem.getStyleItems(), (si) => validate(si, response, value));
      if (response === IrrelevantStyleItemResponse.Hide && items.length <= 0) {
        return Optional.none();
      } else {
        return Optional.some<Menu.NestedMenuItemSpec>({
          type: 'nestedmenuitem',
          text: translatedText,
          enabled: items.length > 0,
          getSubmenuItems: () => Arr.bind(rawItem.getStyleItems(), (si) => validate(si, response, value))
        });
      }
    } else {
      return Optional.some<Menu.ToggleMenuItemSpec>({
        // ONLY TOGGLEMENUITEMS HANDLE STYLE META.
        // See ToggleMenuItem and ItemStructure for how it's handled.
        // If this type ever changes, we'll need to change that too
        type: 'togglemenuitem',
        text: translatedText,
        icon: rawItem.icon,
        active: rawItem.isSelected(value),
        enabled: !invalid,
        onAction: spec.onAction(rawItem),
        ...rawItem.getStylePreview().fold(() => ({}), (preview) => ({ meta: { style: preview } as any }))
      });
    }
  };

  const validate = (item: FormatItem, response: IrrelevantStyleItemResponse, value: Optional<SelectedFormat>): Menu.NestedMenuItemContents[] => {
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

  const getFetch = (backstage: UiFactoryBackstage, getStyleItems: () => FormatItem[]) => (comp: AlloyComponent, callback: (menu: Optional<TieredData>) => void) => {
    const preItems = getStyleItems();
    const items = validateItems(preItems);
    const menu = NestedMenus.build(
      items,
      ItemResponse.CLOSE_ON_EXECUTE,
      backstage,
      {
        isHorizontalMenu: false,
        search: Optional.none()
      }
    );
    callback(menu);
  };

  return {
    validateItems,
    getFetch
  };
};

const createMenuItems = (editor: Editor, backstage: UiFactoryBackstage, spec: SelectSpec): BespokeMenuItems => {
  const dataset = spec.dataset; // needs to be a var for tsc to understand the ternary
  const getStyleItems = dataset.type === 'basic' ?
    () => Arr.map(dataset.data, (d) => FormatRegister.processBasic(d, spec.isSelectedFor, spec.getPreviewFor)) :
    dataset.getData;
  return {
    items: generateSelectItems(editor, backstage, spec),
    getStyleItems
  };
};

const createSelectButton = (editor: Editor, backstage: UiFactoryBackstage, spec: SelectSpec, tooltipWithPlaceholder: string, textUpdateEventName: string): SketchSpec => {
  const { items, getStyleItems } = createMenuItems(editor, backstage, spec);

  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({
    getComponent: Fun.constant(comp),
    setTooltip: (tooltip: string) => {
      const translatedTooltip = backstage.shared.providers.translate(tooltip);
      Attribute.setAll(comp.element, { 'aria-label': translatedTooltip, 'title': translatedTooltip });
    }
  });

  // Set the initial text when the component is attached and then update on node changes
  const onSetup = (api: BespokeSelectApi) => {
    const handler = (e: EditorEvent<{ value: string }>) =>
      api.setTooltip(Tooltip.makeTooltipText(editor, tooltipWithPlaceholder, e.value));
    editor.on(textUpdateEventName, handler);
    return composeUnbinders(
      onSetupEvent(editor, 'NodeChange', (api: BespokeSelectApi) => {
        const comp = api.getComponent();
        spec.updateText(comp);
        Disabling.set(api.getComponent(), !editor.selection.isEditable());
      })(api),
      () => editor.off(textUpdateEventName, handler)
    );
  };

  return renderCommonDropdown(
    {
      text: spec.icon.isSome() ? Optional.none() : spec.text,
      icon: spec.icon,
      tooltip: Optional.from(spec.tooltip),
      role: Optional.none(),
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
