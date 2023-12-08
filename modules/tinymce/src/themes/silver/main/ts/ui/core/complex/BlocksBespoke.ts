import { AlloyComponent, AlloyTriggers, SketchSpec } from '@ephox/alloy';
import { Fun, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { BlockFormat, InlineFormat } from 'tinymce/core/api/fmt/Format';

import * as Events from '../../../api/Events';
import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { onActionToggleFormat, onSetupEditableToggle } from '../ControlUtils';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';
import { findNearest } from './utils/FormatDetection';
import * as Tooltip from './utils/Tooltip';

const menuTitle = 'Blocks';
const btnTooltip = 'Block {0}';
const fallbackFormat = 'Paragraph';

const getSpec = (editor: Editor): SelectSpec => {

  const isSelectedFor = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (format: string) => () => {
    const fmt = editor.formatter.get(format);
    if (fmt) {
      return Optional.some({
        tag: fmt.length > 0 ? (fmt[0] as InlineFormat).inline || (fmt[0] as BlockFormat).block || 'div' : 'div',
        styles: editor.dom.parseStyle(editor.formatter.getCssText(format))
      });
    } else {
      return Optional.none();
    }
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const detectedFormat = findNearest(editor, () => dataset.data);
    const text = detectedFormat.fold(Fun.constant(fallbackFormat), (fmt) => fmt.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
    Events.fireBlocksTextUpdate(editor, { value: text });
  };

  const dataset = buildBasicSettingsDataset(editor, 'block_formats', Delimiter.SemiColon);

  return {
    tooltip: Tooltip.makeTooltipText(editor, btnTooltip, fallbackFormat),
    text: Optional.some(fallbackFormat),
    icon: Optional.none(),
    isSelectedFor,
    getCurrentValue: Optional.none,
    getPreviewFor,
    onAction: onActionToggleFormat(editor),
    updateText: updateSelectMenuText,
    dataset,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  };
};

const createBlocksButton = (editor: Editor, backstage: UiFactoryBackstage): SketchSpec =>
  createSelectButton(editor, backstage, getSpec(editor), btnTooltip, 'BlocksTextUpdate');

// FIX: Test this!
const createBlocksMenu = (editor: Editor, backstage: UiFactoryBackstage): void => {
  const menuItems = createMenuItems(editor, backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('blocks', {
    text: menuTitle,
    onSetup: onSetupEditableToggle(editor),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};
export { createBlocksButton, createBlocksMenu };
