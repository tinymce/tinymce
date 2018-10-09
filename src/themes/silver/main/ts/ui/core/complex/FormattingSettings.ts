import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

export interface UserFormats {
  title: string;
  block: string;
}

export interface BlockToFormat {
  title: string;
  format: string;
}

export interface NestedFormatting {
  title: string;
  items: {
    title: string;
    format: string;
    icon?: string;
  }[];
}

export const defaultStyleFormats: NestedFormatting[] = [
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

const blockToFormat = (userFormats: UserFormats[]): BlockToFormat[] => {
  return Arr.map(userFormats, (fmt) => {
    return { title: fmt.title, format: fmt.block };
  });
};

export const getUserFormats = (editor: Editor) => Objects.readOptFrom(editor.settings, 'style_formats');

export const getStyleFormats = (editor: Editor): BlockToFormat[] | NestedFormatting[] => {
  return getUserFormats(editor).map<BlockToFormat[] | NestedFormatting[]>(blockToFormat).getOr(defaultStyleFormats);
};