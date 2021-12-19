import { ApproxStructure, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { ImageData } from 'tinymce/plugins/image/core/ImageData';
import { insertOrUpdateImage } from 'tinymce/plugins/image/core/ImageSelection';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.image.core.ImageSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const updateImageOrFigure = (editor: Editor, data: Partial<ImageData>) => {
    insertOrUpdateImage(editor, {
      src: 'image.png',
      alt: '',
      title: '',
      width: '200',
      height: '',
      class: '',
      style: '',
      caption: false,
      hspace: '',
      vspace: '',
      border: '',
      borderStyle: '',
      isDecorative: false,
      ...data
    });
  };

  const pWaitForDragHandles = (editor: Editor) =>
    Waiter.pTryUntil('wait for draghandles', () => UiFinder.exists(TinyDom.body(editor), '#mceResizeHandlenw'));

  it('Insert image, size 100x100', async () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    TinySelections.setCursor(editor, [ 0 ], 0);
    updateImageOrFigure(editor, {
      src: 'image.png',
      height: '100',
      width: '100'
    });
    await pWaitForDragHandles(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('div', {
        children: [
          s.element('p', {
            children: [
              s.element('img', {
                attrs: {
                  src: str.is('image.png'),
                  alt: str.is(''),
                  width: str.is('100'),
                  height: str.is('100')
                }
              }),
              s.element('br', {})
            ]
          }),
          s.element('div', { attrs: { id: str.is('mceResizeHandlenw') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlene') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlese') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlesw') }})
        ]
      });
    }));
  });

  it('Insert figure, size 100x100', async () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    TinySelections.setCursor(editor, [ 0 ], 0);
    updateImageOrFigure(editor, {
      src: 'image.png',
      caption: true,
      height: '100',
      width: '100'
    });
    await pWaitForDragHandles(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('div', {
        children: [
          s.element('figure', {
            attrs: {
              class: str.is('image'),
              contenteditable: str.is('false')
            },
            children: [
              s.element('img', {
                attrs: {
                  src: str.is('image.png'),
                  alt: str.is(''),
                  width: str.is('100'),
                  height: str.is('100')
                }
              }),
              s.element('figcaption', {
                attrs: {
                  contenteditable: str.is('true')
                },
                children: [
                  s.text(str.is('Caption'))
                ]
              })
            ]
          }),
          s.element('p', {}),
          s.anything(),
          s.element('div', { attrs: { id: str.is('mceResizeHandlenw') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlene') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlese') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlesw') }})
        ]
      });
    }));
  });

  it('Update figure, new dimensions and src', async () => {
    const editor = hook.editor();
    editor.setContent('<figure class="image" contenteditable="false">' +
      '<img src="image.png" alt="" width="200" height="200">' +
      '<figcaption contenteditable="true">Caption</figcaption>' +
      '</figure>');
    TinySelections.select(editor, 'figure', []);
    updateImageOrFigure(editor, {
      src: 'updated-image.png',
      caption: true,
      height: '100',
      width: '100'
    });
    await pWaitForDragHandles(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('div', {
        children: [
          s.element('figure', {
            attrs: {
              class: str.is('image'),
              contenteditable: str.is('false')
            },
            children: [
              s.element('img', {
                attrs: {
                  'src': str.is('updated-image.png'),
                  'alt': str.is(''),
                  'width': str.is('100'),
                  'height': str.is('100'),
                  'data-mce-src': str.is('updated-image.png')
                }
              }),
              s.element('figcaption', {
                attrs: {
                  contenteditable: str.is('true')
                },
                children: [
                  s.text(str.is('Caption'))
                ]
              })
            ]
          }),
          s.anything(),
          s.element('div', { attrs: { id: str.is('mceResizeHandlenw') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlene') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlese') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlesw') }})
        ]
      });
    }));
  });

  it('Update image, new dimensions and src', async () => {
    const editor = hook.editor();
    editor.setContent('<p>' +
      '<img src="image.png" alt="" width="200" height="200">' +
      '</p>');
    TinySelections.select(editor, 'img', []);
    updateImageOrFigure(editor, {
      src: 'updated-image.png',
      height: '100',
      width: '100'
    });
    await pWaitForDragHandles(editor);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('div', {
        children: [
          s.element('p', {
            children: [
              s.element('img', {
                attrs: {
                  'src': str.is('updated-image.png'),
                  'alt': str.is(''),
                  'width': str.is('100'),
                  'height': str.is('100'),
                  'data-mce-src': str.is('updated-image.png')
                }
              })
            ]
          }),
          s.element('div', { attrs: { id: str.is('mceResizeHandlenw') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlene') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlese') }}),
          s.element('div', { attrs: { id: str.is('mceResizeHandlesw') }})
        ]
      });
    }));
  });

  it('TINY-6592: If <figure> is not valid child, it should split parent node', async () => {
    const editor = hook.editor();
    editor.setContent('<p>' +
		      '<strong>A</strong>' +
		      '<img src="image.png">' +
		      '<strong>B</strong>' +
		      '</p>');
    TinySelections.select(editor, 'img', []);
    updateImageOrFigure(editor, {
      caption: true // convert <img> to <figure>
    });
    await pWaitForDragHandles(editor);
    TinyAssertions.assertContentStructure(
      editor,
      ApproxStructure.build((s, str) => {
        return s.element('div', {
          children: [
            s.element('p', {
              children: [
                s.element('strong', {
                  children: [ s.text(str.is('A')) ]
                })
              ]
            }),
            s.element('figure', {
              children: [ s.element('img', {}), s.element('figcaption', {}) ]
            }),
            s.element('p', {
              children: [
                s.element('strong', {
                  children: [ s.text(str.is('B')) ]
                })
              ]
            }),
            s.theRest()
          ]
        });
      })
    );
  });

  it('TINY-6592: If <figure> is valid child, it should not split parent node', async () => {
    const editor = hook.editor();
    editor.setContent('<div>' +
		      '<strong>A</strong>' +
		      '<img src="image.png">' +
		      '<strong>B</strong>' +
		      '</div>');
    TinySelections.select(editor, 'img', []);
    updateImageOrFigure(editor, {
      caption: true // convert <img> to <figure>
    });
    await pWaitForDragHandles(editor);
    TinyAssertions.assertContentStructure(
      editor,
      ApproxStructure.build((s, str) => {
        return s.element('div', {
          children: [
            s.element('div', {
              children: [
                s.element('strong', {
                  children: [ s.text(str.is('A')) ]
                }),
                s.element('figure', {
                  children: [ s.element('img', {}), s.element('figcaption', {}) ]
                }),
                s.element('strong', {
                  children: [ s.text(str.is('B')) ]
                })
              ]
            }),
            s.theRest()
          ]
        });
      })
    );
  });
});
