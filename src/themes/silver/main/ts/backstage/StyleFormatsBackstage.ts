import { Cell, Arr, Option } from '@ephox/katamari';
import { Objects } from '@ephox/boulder';
import { FormatItem } from '../ui/core/complex/BespokeSelect';
import * as FormatRegister from '../ui/core/complex/utils/FormatRegister';

const flatten = (fmt): string[] => {
  const subs = fmt.items;
  return subs !== undefined && subs.length > 0 ? Arr.bind(subs, flatten) : [ fmt.format ];
};

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

export const init = (editor) => {
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

  const settingsFormats = Cell<FormatItem[]>([ ]);
  const settingsFlattenedFormats = Cell<string[]>([ ]);

  const eventsFormats = Cell<FormatItem[]>([ ]);
  const eventsFlattenedFormats = Cell<string[]>([ ]);

  const replaceSettings = Cell(false);

  editor.on('init', () => {
    const formats = Objects.readOptFrom(editor.settings, 'style_formats').getOr(defaultStyleFormats);
    const enriched = FormatRegister.register(editor, formats, isSelectedFor, getPreviewFor);
    settingsFormats.set(enriched);

    settingsFlattenedFormats.set(
      Arr.bind(enriched, flatten)
    );
  });

  editor.on('addStyleModifications', (e) => {
    // Is there going to be an order issue here?
    const modifications = FormatRegister.register(editor, e.items, isSelectedFor, getPreviewFor);
    eventsFormats.set(modifications);
    replaceSettings.set(e.replace);

    eventsFlattenedFormats.set(
      Arr.bind(modifications, flatten)
    );
  });

  const getData = () => {
    const fromSettings = replaceSettings.get() ? [ ] : settingsFormats.get();
    const fromEvents = eventsFormats.get();
    return fromSettings.concat(fromEvents);
  };

  const getFlattenedKeys = () => {
    const fromSettings = replaceSettings.get() ? [ ] : settingsFlattenedFormats.get();
    const fromEvents = eventsFlattenedFormats.get();
    return fromSettings.concat(fromEvents);
  };

  return {
    getData,
    getFlattenedKeys
  };
};