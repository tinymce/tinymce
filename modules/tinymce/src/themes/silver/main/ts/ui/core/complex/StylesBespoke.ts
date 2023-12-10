import { AlloyComponent, AlloyTriggers, SketchSpec } from '@ephox/alloy';
import { Arr, Fun, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { BlockFormat, InlineFormat } from 'tinymce/core/api/fmt/Format';

import * as Events from '../../../api/Events';
import * as Options from '../../../api/Options';
import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { onActionToggleFormat, onSetupEditableToggle } from '../ControlUtils';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { AdvancedSelectDataset, BasicSelectItem, SelectDataset } from './SelectDatasets';
import { getStyleFormats, isFormatReference, isNestedFormat, StyleFormatType } from './StyleFormat';
import { findNearest } from './utils/FormatDetection';
import * as Tooltip from './utils/Tooltip';

const menuTitle = 'Formats';
const btnTooltip = 'Format {0}';

const getSpec = (editor: Editor, dataset: SelectDataset): SelectSpec => {
  const fallbackFormat = 'Paragraph';

  const isSelectedFor = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (format: string) => () => {
    const fmt = editor.formatter.get(format);
    return fmt !== undefined ? Optional.some({
      tag: fmt.length > 0 ? (fmt[0] as InlineFormat).inline || (fmt[0] as BlockFormat).block || 'div' : 'div',
      styles: editor.dom.parseStyle(editor.formatter.getCssText(format))
    }) : Optional.none();
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const getFormatItems = (fmt: StyleFormatType): BasicSelectItem[] => {
      if (isNestedFormat(fmt)) {
        return Arr.bind(fmt.items, getFormatItems);
      } else if (isFormatReference(fmt)) {
        return [{ title: fmt.title, format: fmt.format }];
      } else {
        return [];
      }
    };
    const flattenedItems = Arr.bind(getStyleFormats(editor), getFormatItems);
    const detectedFormat = findNearest(editor, Fun.constant(flattenedItems));
    const text = detectedFormat.fold(Fun.constant(fallbackFormat), (fmt) => fmt.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
    Events.fireStylesTextUpdate(editor, { value: text });
  };

  return {
    tooltip: Tooltip.makeTooltipText(editor, btnTooltip, fallbackFormat),
    text: Optional.some(fallbackFormat),
    icon: Optional.none(),
    isSelectedFor,
    getCurrentValue: Optional.none,
    getPreviewFor,
    onAction: onActionToggleFormat(editor),
    updateText: updateSelectMenuText,
    shouldHide: Options.shouldAutoHideStyleFormats(editor),
    isInvalid: (item) => !editor.formatter.canApply(item.format),
    dataset
  } as SelectSpec;
};

const createStylesButton = (editor: Editor, backstage: UiFactoryBackstage): SketchSpec => {
  const dataset: AdvancedSelectDataset = { type: 'advanced', ...backstage.styles };
  return createSelectButton(editor, backstage, getSpec(editor, dataset), btnTooltip, 'StylesTextUpdate');
};

const createStylesMenu = (editor: Editor, backstage: UiFactoryBackstage): void => {
  const dataset: AdvancedSelectDataset = { type: 'advanced', ...backstage.styles };
  const menuItems = createMenuItems(editor, backstage, getSpec(editor, dataset));
  editor.ui.registry.addNestedMenuItem('styles', {
    text: menuTitle,
    onSetup: onSetupEditableToggle(editor),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createStylesButton, createStylesMenu };
