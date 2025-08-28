import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import {
  AllowedFormat, BlockStyleFormat, FormatReference, InlineStyleFormat, NestedFormatting, SelectorStyleFormat, Separator, StyleFormat
} from 'tinymce/core/api/fmt/StyleFormat';

import { getUserStyleFormats, shouldMergeStyleFormats } from '../../../api/Options';

export interface NestedStyleFormat {
  readonly title: string;
  readonly items: StyleFormatType[];
}

export type StyleFormatType = Separator | FormatReference | NestedStyleFormat;

interface CustomFormatMapping {
  readonly customFormats: { name: string; format: StyleFormat }[];
  readonly formats: StyleFormatType[];
}

export const isNestedFormat = (format: StyleFormatType): format is NestedStyleFormat =>
  Obj.hasNonNullableKey(format as NestedStyleFormat, 'items');

export const isFormatReference = (format: StyleFormatType): format is FormatReference =>
  Obj.hasNonNullableKey(format as FormatReference, 'format');

export const defaultStyleFormats: AllowedFormat[] = [
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
      { title: 'Bold', format: 'bold' },
      { title: 'Italic', format: 'italic' },
      { title: 'Underline', format: 'underline' },
      { title: 'Strikethrough', format: 'strikethrough' },
      { title: 'Superscript', format: 'superscript' },
      { title: 'Subscript', format: 'subscript' },
      { title: 'Code', format: 'code' }
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
    title: 'Align', items: [
      { title: 'Left', format: 'alignleft' },
      { title: 'Center', format: 'aligncenter' },
      { title: 'Right', format: 'alignright' },
      { title: 'Justify', format: 'alignjustify' }
    ]
  }
];

// Note: Need to cast format below to expected type, as Obj.has uses "K keyof T", which doesn't work with aliases
const isNestedFormats = (format: AllowedFormat): format is NestedFormatting => Obj.has(format as NestedFormatting, 'items');

const isBlockFormat = (format: AllowedFormat): format is BlockStyleFormat => Obj.has(format as BlockStyleFormat, 'block');

const isInlineFormat = (format: AllowedFormat): format is InlineStyleFormat => Obj.has(format as InlineStyleFormat, 'inline');

const isSelectorFormat = (format: AllowedFormat): format is SelectorStyleFormat => Obj.has(format as SelectorStyleFormat, 'selector');

const mapFormats = (userFormats: AllowedFormat[]): CustomFormatMapping =>
  Arr.foldl(userFormats, (acc, fmt) => {
    if (isNestedFormats(fmt)) {
      // Map the child formats
      const result = mapFormats(fmt.items);
      return {
        customFormats: acc.customFormats.concat(result.customFormats),
        formats: acc.formats.concat([{ title: fmt.title, items: result.formats }])
      };
    } else if (isInlineFormat(fmt) || isBlockFormat(fmt) || isSelectorFormat(fmt)) {
      // Convert the format to a reference and add the original to the custom formats to be registered
      const formatName = Type.isString(fmt.name) ? fmt.name : fmt.title.toLowerCase();
      const formatNameWithPrefix = `custom-${formatName}`;
      return {
        customFormats: acc.customFormats.concat([{ name: formatNameWithPrefix, format: fmt }]),
        formats: acc.formats.concat([{ title: fmt.title, format: formatNameWithPrefix, icon: fmt.icon }])
      };
    } else {
      return { ...acc, formats: acc.formats.concat(fmt) };
    }
  }, { customFormats: [], formats: [] } as CustomFormatMapping);

const registerCustomFormats = (editor: Editor, userFormats: AllowedFormat[]): StyleFormatType[] => {
  const result = mapFormats(userFormats);

  const registerFormats = (customFormats: Array<{ name: string; format: StyleFormat }>) => {
    Arr.each(customFormats, (fmt) => {
      // Only register the custom format with the editor, if it's not already registered
      if (!editor.formatter.has(fmt.name)) {
        editor.formatter.register(fmt.name, fmt.format);
      }
    });
  };

  // The editor may not yet be initialized, so check for that
  if (editor.formatter) {
    registerFormats(result.customFormats);
  } else {
    editor.on('init', () => {
      registerFormats(result.customFormats);
    });
  }

  return result.formats;
};

export const getStyleFormats = (editor: Editor): StyleFormatType[] => getUserStyleFormats(editor).map((userFormats) => {
  // Ensure that any custom formats specified by the user are registered with the editor
  const registeredUserFormats = registerCustomFormats(editor, userFormats);
  // Merge the default formats with the custom formats if required
  return shouldMergeStyleFormats(editor) ? defaultStyleFormats.concat(registeredUserFormats) : registeredUserFormats;
}).getOr(defaultStyleFormats);
