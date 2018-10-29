import { Objects } from '@ephox/boulder';
import { Editor } from 'tinymce/core/api/Editor';
import { Arr, Option } from '@ephox/katamari';
import { Node } from '@ephox/dom-globals';

// somewhat documented at https://www.tiny.cloud/docs/configure/content-formatting/#style_formats
export type AllowedFormat = Separator | FormatReference | BlockFormat | InlineFormat | SelectorFormat | NestedFormatting;

export interface Separator {
  title: string;
}

export interface FormatReference {
  title: string;
  format: string;
  icon?: string;
}

// Largely derived from the docs and src/core/main/ts/fmt/DefaultFormats.ts
interface Format {
  title: string;
  icon?: string;
  classes?: string;
  styles?: Record<string, string>;
  attributes?: Record<string, string>;
  remove?: 'none' | 'empty' | 'all';
  preview?: string | boolean;
  ceFalseOverride?: boolean;
  collapsed?: boolean;
  deep?: boolean;
  exact?: boolean;
  expand?: boolean;
  links?: boolean;
  split?: boolean;
  toggle?: boolean;
  wrapper?: boolean;
  onmatch?: (node: Node, fmt: Format, itemName: string) => boolean;
  onformat?: (node: Node, fmt: Format, vars?: object) => void;
}

export interface BlockFormat extends Format {
  block: string;
}

export interface InlineFormat extends Format {
  inline: string;
  clear_child_styles?: boolean;
  remove_similar?: boolean;
}

export interface SelectorFormat extends Format {
  selector: string;
  defaultBlock?: string;
  inherit?: boolean;
}

export interface NestedFormatting {
  title: string;
  items: Array<FormatReference | BlockFormat | InlineFormat | SelectorFormat>;
}

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

export const getUserFormats = (editor: Editor): Option<AllowedFormat[]> => Objects.readOptFrom(editor.settings, 'style_formats');

const isNestedFormat = (format: AllowedFormat): format is NestedFormatting => {
  return Object.prototype.hasOwnProperty.call(format, 'items');
};

const isBlockFormat = (format: AllowedFormat): format is BlockFormat => {
  return Object.prototype.hasOwnProperty.call(format, 'block');
};

const isInlineFormat = (format: AllowedFormat): format is InlineFormat => {
  return Object.prototype.hasOwnProperty.call(format, 'inline');
};

const isSelectorFormat = (format: AllowedFormat): format is SelectorFormat => {
  return Object.prototype.hasOwnProperty.call(format, 'selector');
};

interface CustomFormatMapping {
  customFormats: { name: string, format: Format }[];
  formats: (Separator | FormatReference | NestedFormatting)[];
}

const mapFormats = (userFormats: AllowedFormat[]): CustomFormatMapping => {
  return Arr.foldl(userFormats, (acc, fmt) => {
    if (isNestedFormat(fmt)) {
      // Map the child formats
      const result = mapFormats(fmt.items);
      return {
        customFormats: acc.customFormats.concat(result.customFormats),
        formats: acc.formats.concat([{ title: fmt.title, items: result.formats }])
      };
    } else if (isInlineFormat(fmt) || isBlockFormat(fmt) || isSelectorFormat(fmt)) {
      // Convert the format to a reference and add the original to the custom formats to be registered
      const formatName = `custom-${fmt.title.toLowerCase()}`;
      return {
        customFormats: acc.customFormats.concat([{ name: formatName, format: fmt }]),
        formats: acc.formats.concat([{ title: fmt.title, format: formatName, icon: fmt.icon }])
      };
    } else {
      return { ...acc, formats: acc.formats.concat(fmt) };
    }
  }, { customFormats: [], formats: [] });
};

const registerCustomFormats = (editor: Editor, userFormats: AllowedFormat[]): (Separator | FormatReference | NestedFormatting)[] => {
  const result = mapFormats(userFormats);

  const registerFormats = (customFormats: {name: string, format: AllowedFormat}[]) => {
    Arr.each(customFormats, (fmt) => {
      // Only register the custom format with the editor, if it's not already registered
      if (editor.formatter.get(fmt.name) === undefined) {
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

export const getStyleFormats = (editor: Editor): (Separator | FormatReference | NestedFormatting)[] => {
  return getUserFormats(editor).map((userFormats) => {
    // Ensure that any custom formats specified by the user are registered with the editor
    return registerCustomFormats(editor, userFormats);
  }).getOr(defaultStyleFormats);
};