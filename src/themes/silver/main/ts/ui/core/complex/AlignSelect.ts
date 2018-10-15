import { AlloyTriggers, AlloyComponent } from '@ephox/alloy';
import { Arr, Option } from '@ephox/katamari';

import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createSelectButton, FormatItem, PreviewSpec } from './BespokeSelect';
import { buildBasicStaticDataset } from './SelectDatasets';
import { IsSelectedForType } from './utils/FormatRegister';

const alignMenuItems = [
  { title: 'Left', icon: 'align-left', format: 'alignleft'},
  { title: 'Center', icon: 'align-center', format: 'aligncenter' },
  { title: 'Right', icon: 'align-right', format: 'alignright' },
  { title: 'Justify', icon: 'align-justify', format: 'alignjustify' }
];

const createAlignSelect = (editor, backstage) => {
  const getMatchingValue = (): Option<Partial<FormatItem>> => {
    return  Arr.find(alignMenuItems, (item) => editor.formatter.match(item.format));
  };

  const isSelectedFor: IsSelectedForType = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (format: string) => () => {
    return Option.none<PreviewSpec>();
  };

  const onAction = (rawItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      if (editor.formatter.match(rawItem.format)) {
        editor.formatter.remove(rawItem.format);
      } else {
        editor.formatter.apply(rawItem.format);
      }
    });
  };

  const nodeChangeHandler = Option.some((comp: AlloyComponent) => {
    return () => {
      const match = getMatchingValue();
      const text = match.fold(() => 'Align', (item) => item.title);
      AlloyTriggers.emitWith(comp, updateMenuText, {
        text: backstage.shared.translate(text)
      });
    };
  });

  const dataset = buildBasicStaticDataset(alignMenuItems);

  return createSelectButton(editor, backstage, dataset, {
    isSelectedFor,
    getPreviewFor,
    onAction,
    nodeChangeHandler
  });
};

export { createAlignSelect };