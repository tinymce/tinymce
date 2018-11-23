import { AlloyTriggers } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { findNearest } from './utils/FormatDetection';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';

const defaultBlocks = (
  'Paragraph=p;' +
  'Heading 1=h1;' +
  'Heading 2=h2;' +
  'Heading 3=h3;' +
  'Heading 4=h4;' +
  'Heading 5=h5;' +
  'Heading 6=h6;' +
  'Preformatted=pre'
);

const getSpec = (editor): SelectSpec & { dataset } => {
  const getMatchingValue = (nodeChangeEvent) => {
    return findNearest(editor, () => dataset.data, nodeChangeEvent);
  };

  const isSelectedFor = (format) => {
    return () => {
      return editor.formatter.match(format);
    };
  };

  const getPreviewFor = (format) => () => {
    const fmt = editor.formatter.get(format);
    return Option.some({
      tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
      styleAttr: editor.formatter.getCssText(format)
    });
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

  const nodeChangeHandler = Option.some((comp) => {
    return (e) => {
      const detectedFormat = getMatchingValue(e);
      const text = detectedFormat.fold(() => 'Paragraph', (fmt) => fmt.title);
      AlloyTriggers.emitWith(comp, updateMenuText, {
        text
      });
    };
  });

  const dataset = buildBasicSettingsDataset(editor, 'block_formats', defaultBlocks, Delimiter.SemiColon);

  return {
    isSelectedFor,
    getPreviewFor,
    onAction,
    nodeChangeHandler,
    dataset,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  };
};

const createFormatSelect = (editor, backstage) => {
  const spec = getSpec(editor);
  return createSelectButton(editor, backstage, spec.dataset, spec);
};

// FIX: Test this!
const formatSelectMenu = (editor, backstage) => {
  const spec = getSpec(editor);
  const menuItems = createMenuItems(editor, backstage, spec.dataset, spec);
  return {
    type: 'nestedmenuitem',
    text: 'Blocks',
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  };
};

export { createFormatSelect, formatSelectMenu };
