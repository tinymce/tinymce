import { RawEditorSettings, TinyMCE } from 'tinymce/core/api/PublicApi';
declare let tinymce: TinyMCE;

const addSvgDefToDocument = () => {
  const gradient = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
      <defs>
        <linearGradient id="editor-icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0" stop-color="#888"/>
          <stop offset="1" stop-color="#bbb"/>
        </linearGradient>
        <linearGradient id="editor-icon-gradient__hover" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0" stop-color="#555"/>
          <stop offset="1" stop-color="#888"/>
        </linearGradient>
      <linearGradient id="editor-icon-gradient__disabled" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0" stop-color="#ccc"/>
        <stop offset="1" stop-color="#ccc"/>
      </linearGradient>
        <linearGradient id="editor-icon-gradient__green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0" stop-color="#637d16"/>
          <stop offset="1" stop-color="#a4d024"/>
        </linearGradient>
        <linearGradient id="editor-icon-gradient__green-hover" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0" stop-color="#5e7715"/>
          <stop offset="1" stop-color="#90b620"/>
        </linearGradient>
      </defs>
    </svg>`;
  const svgDefsWrapper = document.createElement('div');
  svgDefsWrapper.innerHTML = gradient;

  document.body.append(svgDefsWrapper);
};

const color_map = [
  '#D6336C',
  'Pink',
  '#F03E3E',
  'Red',
  '#F76707',
  'Orange',
  '#F59F00',
  'Yellow',
  '#AE3EC9',
  'Grape',
  '#7048E8',
  'Violet',
  '#4263EB',
  'Indigo',
  '#1C7CD6',
  'Blue',
  '#1098AD',
  'Cyan',
  '#0CA678',
  'Teal',
  '#37B24D',
  'Green',
  '#74B816',
  'Lime',
  '#333333',
  'Black',
  '#666666',
  'Gray',
  '#999999',
  'Light Gray',
  '#CCCCCC',
  'Silver',
];

addSvgDefToDocument();
const toolbarItems = [
  'customButton',
  'reset',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  '|',
  'fontsizeselect',
  'forecolor',
  '|',
  'blockquote',
  '|',
  'bullist',
  '|',
  'align',
  '|',
  'image',
  'link',
  'emoticons',
  '|',
  'removeformat',
  '|',
  'code',
].join(' ');

const inlineFormattingItems =
  'bold italic underline strikethrough | fontsizeselect forecolor | blockquote';
const blockFormattingItems = 'align bullist';

interface EditorInitParams {
  selector?: string;
  customButton?: {
    action: () => void;
    title: string;
  };
}

export const initializeTinyMCE = (options: EditorInitParams) => {
  const settings: RawEditorSettings = {
    selector: options?.selector ?? 'textarea.tiny-area',
    plugins: 'link image code emoticons lists',
    toolbar_location: 'bottom',
    toolbar: toolbarItems,
    toolbar_mode: 'floating',
    fontsize_formats: [ 10, 12, 16, 18, 24, 32, 48 ]
      .map((size) => `${size}=${size}pt`)
      .join(' '),
    skin: 'torn',
    icons: 'torn',
    toolbar_sticky: true,
    height: 300,
    menubar: false,
    statusbar: false,
    color_map,
    custom_colors: false,
    mobile: {
      toolbar_mode: 'floating',
      toolbar: 'reset inlineFormatting blockFormatting',
      toolbar_groups: {
        inlineFormatting: {
          icon: 'format',
          tooltip: 'Formatting',
          items: inlineFormattingItems,
        },
        blockFormatting: {
          icon: 'align-left',
          tooltip: 'Block Formatting',
          items: blockFormattingItems,
        },
      },
    },
    setup: (editor) => {
      if (options?.customButton) {
        editor.ui.registry.addButton('customButton', {
          text: options.customButton.title,
          onAction: options.customButton.action,
        });
      }

      editor.ui.registry.addButton('reset', {
        icon: 'undo',
        onAction: () => {
          editor.setContent('');
          editor.focus();
        },
      });
    },
  };
  
  tinymce.init(settings);
};
