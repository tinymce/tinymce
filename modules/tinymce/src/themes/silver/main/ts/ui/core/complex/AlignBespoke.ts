import { AlloyComponent, AlloyTriggers, SketchSpec } from '@ephox/alloy';
import { Arr, Fun, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { updateMenuIcon } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton, FormatterFormatItem, SelectedFormat, SelectSpec } from './BespokeSelect';
import { buildBasicStaticDataset } from './SelectDatasets';

const alignMenuItems = [
  { title: 'Left', icon: 'align-left', format: 'alignleft', command: 'JustifyLeft' },
  { title: 'Center', icon: 'align-center', format: 'aligncenter', command: 'JustifyCenter' },
  { title: 'Right', icon: 'align-right', format: 'alignright', command: 'JustifyRight' },
  { title: 'Justify', icon: 'align-justify', format: 'alignjustify', command: 'JustifyFull' }
];

const getSpec = (editor: Editor): SelectSpec => {
  const getMatchingValue = (): Optional<SelectedFormat> => Arr.find(alignMenuItems, (item) => editor.formatter.match(item.format));

  const isSelectedFor = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (_format: string) => Optional.none;

  const updateSelectMenuIcon = (comp: AlloyComponent) => {
    const match = getMatchingValue();
    const alignment = match.fold(Fun.constant('left'), (item) => item.title.toLowerCase());
    AlloyTriggers.emitWith(comp, updateMenuIcon, {
      icon: `align-${alignment}`
    });
  };

  const dataset = buildBasicStaticDataset(alignMenuItems);

  const onAction = (rawItem: FormatterFormatItem) => () =>
    Arr.find(alignMenuItems, (item) => item.format === rawItem.format)
      .each((item) => editor.execCommand(item.command));

  return {
    tooltip: 'Align',
    text: Optional.none(),
    icon: Optional.some('align-left'),
    isSelectedFor,
    getCurrentValue: Optional.none,
    getPreviewFor,
    onAction,
    updateText: updateSelectMenuIcon,
    dataset,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  };
};

const createAlignButton = (editor: Editor, backstage: UiFactoryBackstage): SketchSpec =>
  createSelectButton(editor, backstage, getSpec(editor));

const createAlignMenu = (editor: Editor, backstage: UiFactoryBackstage): void => {
  const menuItems = createMenuItems(editor, backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('align', {
    text: backstage.shared.providers.translate('Align'),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createAlignButton, createAlignMenu };
