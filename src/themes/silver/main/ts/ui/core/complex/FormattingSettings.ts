import { Objects } from '@ephox/boulder';
import { Editor } from 'tinymce/core/api/Editor';
import { Arr } from '@ephox/katamari';

// TODO AP-393: Full list of styles properly
// somewhat documented at https://www.tiny.cloud/docs/configure/content-formatting/#style_formats
// export type AllowedFormats = Separator | DirectFormat | BlockFormat | NestedFormatting

// export type Separator = {
//   title: string;
// };

// export type DirectFormat = {
//   title: string;
//   format: string;
//   icon?: string;
// }

// export type BlockFormat = {
//   title: string;
//   block: string;
//   icon?: string;
// }

// export type NestedFormatting = {
//   title: string;
//   items: Array<DirectFormat | BlockFormat>;
// }

export const defaultStyleFormats = [
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

export const getUserFormats = (editor: Editor) => Objects.readOptFrom(editor.settings, 'style_formats');

const blockToFormat = (userFormats: any[]): any[] => {
  return Arr.map(userFormats, (fmt) => {
    // TODO AP-393: support the full API
    return fmt.items ?
      { title: fmt.title, items: blockToFormat(fmt.items) }
      : fmt.block ? { title: fmt.title, format: fmt.block } // This is needed because StyleSelect only checks for `format` to apply
        : fmt;
  });
};


export const getStyleFormats = (editor: Editor): any[] => {
  return getUserFormats(editor).map(blockToFormat).getOr(defaultStyleFormats);
};