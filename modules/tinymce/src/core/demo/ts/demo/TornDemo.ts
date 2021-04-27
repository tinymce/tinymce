/* eslint-disable no-console */
import { RawEditorSettings, TinyMCE } from 'tinymce/core/api/PublicApi';

const addSvgDefToDocument = () => {
  const gradient =
    `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
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

declare let tinymce: TinyMCE;

const toolbarItems = [
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

export default () => {
  const settings: RawEditorSettings = {
    selector: 'textarea',
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
    templates: [
      {
        title: 'Some title',
        description: 'Some description',
        content: 'Some content',
      },
    ],
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
      addSvgDefToDocument();
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
