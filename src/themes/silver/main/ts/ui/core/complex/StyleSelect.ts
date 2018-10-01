import { Objects } from '@ephox/boulder';
import { Arr, Option } from '@ephox/katamari';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { findNearest } from './utils/FormatDetection';
import { AlloyTriggers } from '@ephox/alloy';
import { updateMenuText } from '../../dropdown/CommonDropdown';

const defaultStyleFormats = [
  {
    title: 'Headings', items: [
      { title: 'Heading 1', format: 'h1' },
      { title: 'Heading 2', format: 'h2' },
      { title: 'Heading 3', format: 'h3' },
      { title: 'Heading 4', format: 'h4' },
      { title: 'Heading 5', format: 'h5' },
      { title: 'Heading 6', format: 'h6' }
    ]
  },

  {
    title: 'Inline', items: [
      { title: 'Bold', icon: 'bold', format: 'bold' },
      { title: 'Italic', icon: 'italic', format: 'italic' },
      { title: 'Underline', icon: 'underline', format: 'underline' },
      { title: 'Strikethrough', icon: 'strike-through', format: 'strikethrough' },
      { title: 'Superscript', icon: 'superscript', format: 'superscript' },
      { title: 'Subscript', icon: 'subscript', format: 'subscript' },
      { title: 'Code', icon: 'code', format: 'code' }
    ]
  },

  {
    title: 'Blocks', items: [
      { title: 'Paragraph', format: 'p' },
      { title: 'Blockquote', format: 'blockquote' },
      { title: 'Div', format: 'div' },
      { title: 'Pre', format: 'pre' }
    ]
  },

  {
    title: 'Alignment', items: [
      { title: 'Left', icon: 'align-left', format: 'alignleft' },
      { title: 'Center', icon: 'align-center', format: 'aligncenter' },
      { title: 'Right', icon: 'align-right', format: 'alignright' },
      { title: 'Justify', icon: 'align-justify', format: 'alignjustify' }
    ]
  }
];

const getSpec = (editor): SelectSpec => {
  const isSelectedFor = (format) => {
    return () => {
      return editor.formatter.match(format);
    };
  };

  const getPreviewFor = (format) => () => {
    const fmt = editor.formatter.get(format);
    return fmt !== undefined ? Option.some({
      tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
      styleAttr: editor.formatter.getCssText(format)
    }) : Option.none();
  };

  const flatten = (fmt): string[] => {
    const subs = fmt.items;
    return subs !== undefined && subs.length > 0 ? Arr.bind(subs, flatten) : [ fmt.format ];
  };

  const getRawFormats = () => Objects.readOptFrom(editor.settings, 'style_formats').getOr(defaultStyleFormats);

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
    const getFormatItems = (fmt) => {
      const subs = fmt.items;
      return subs !== undefined && subs.length > 0 ? Arr.bind(subs, getFormatItems) : [ { title: fmt.title, format: fmt.format } ];
    };
    const flattenedItems = Arr.bind(getRawFormats(), getFormatItems);

    return (e) => {
      const detectedFormat = findNearest(editor, () => flattenedItems, e);
      const optText = detectedFormat.map((fmt) => fmt.title);
      optText.each((text) => {
        AlloyTriggers.emitWith(comp, updateMenuText, {
          text
        });
      });
    };
  });

  return {
    isSelectedFor,
    getPreviewFor,
    onAction,
    nodeChangeHandler
  } as SelectSpec;
};

const createStyleSelect = (editor, backstage) => {
  // FIX: Not right.
  const data = backstage.styleselect;
  return createSelectButton(editor, backstage, data, getSpec(editor));
};

const styleSelectMenu = (editor, backstage) => {
  const data = backstage.styleselect;
  const menuItems = createMenuItems(editor, backstage, data, getSpec(editor));
  return {
    type: 'menuitem',
    text: 'Formats',
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  };
};

export {
  createStyleSelect, styleSelectMenu
};
