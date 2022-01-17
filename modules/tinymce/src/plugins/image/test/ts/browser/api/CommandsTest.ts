import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { ImageData } from 'tinymce/plugins/image/core/ImageData';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.image.api.CommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const updateImage = (editor: Editor, data: Partial<ImageData>) => editor.execCommand('mceUpdateImage', false, data);

  it('TBA: Insert image with all data specified except caption and isDecorative', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</a>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    updateImage(editor, {
      src: '#2',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'cls1',
      style: 'color: red',
      caption: false,
      hspace: '1',
      vspace: '2',
      border: '3',
      borderStyle: 'solid',
      isDecorative: false
    });
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.element('img', {
                attrs: {
                  class: str.is('cls1'),
                  title: str.is('title'),
                  src: str.is('#2'),
                  alt: str.is('alt'),
                  width: str.is('100'),
                  height: str.is('200')
                },
                styles: {
                  'color': str.is('red'),
                  'border-width': str.is('3px'),
                  'border-style': str.is('solid'),
                  'margin': str.is('2px 1px')
                }
              })
            ]
          })
        ]
      }))
    );
  });

  it('TBA: Update image with all data specified except caption and isDecorative', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    updateImage(editor, {
      src: '#2',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'cls1',
      style: 'color: red',
      caption: false,
      hspace: '1',
      vspace: '2',
      border: '3',
      borderStyle: 'solid',
      isDecorative: false
    });
    TinySelections.setCursor(editor, [ 0 ], 1);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('img', {
                attrs: {
                  class: str.is('cls1'),
                  title: str.is('title'),
                  src: str.is('#2'),
                  alt: str.is('alt'),
                  width: str.is('100'),
                  height: str.is('200')
                },
                styles: {
                  'color': str.is('red'),
                  'border-width': str.is('3px'),
                  'border-style': str.is('solid'),
                  'margin': str.is('2px 1px')
                }
              })
            ]
          })
        ]
      }))
    );
  });

  it('TBA: Update image with null alt value', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" alt="alt1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    updateImage(editor, {
      alt: null
    });
    TinyAssertions.assertContent(editor, '<p><img src="#1"></p>');
  });

  it('TBA: Update image with empty alt value', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" alt="alt1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    updateImage(editor, {
      alt: ''
    });
    TinyAssertions.assertContent(editor, '<p><img src="#1" alt=""></p>');
  });

  it('TBA: Update image with empty title, width, height should not produce empty attributes', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" title="title" width="100" height="200" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    updateImage(editor, {
      title: '',
      width: '',
      height: ''
    });
    TinyAssertions.assertContent(editor, '<p><img src="#1"></p>');
  });

  it('TINY-7998: Update image with dangerous URL should remove the src attribute', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" alt="alt1" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    updateImage(editor, {
      src: 'javascript:alert(1)'
    });
    TinyAssertions.assertContent(editor, '<p><img alt="alt1"></p>');
  });
});
