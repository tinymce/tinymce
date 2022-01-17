import { ApproxStructure, Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import { countNumber, extractOnlyOne } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.toolbar.EditorToolbarOptionsTest', () => {

  const pCreateEditorWithToolbar = (
    toolbarVal: boolean | string | string[] | Record<string, any> | undefined,
    toolbarVal1?: string,
    toolbarVal2?: string,
    toolbarVal9?: string,
    toolbarVal20?: string
  ) => McEditor.pFromSettings<Editor>({
    toolbar: toolbarVal,
    toolbar1: toolbarVal1,
    toolbar2: toolbarVal2,
    toolbar9: toolbarVal9,
    toolbar20: toolbarVal20,
    menubar: false,
    statusbar: false,
    base_url: '/project/tinymce/js/tinymce'
  });

  const assertIsDefaultToolbar = (toolbar: SugarElement<HTMLElement>) => Assertions.assertStructure(
    'Checking structure of tox-toolbar is "default"',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-toolbar') ],
      children: Arr.map([ 1, 2, 3, 4, 5 ], (_) => // Technically meant to be 6 groups by default but the link and image plugins aren't loaded here so whatever
        s.element('div', { classes: [ arr.has('tox-toolbar__group') ] }))
    })),
    toolbar
  );

  it('TBA: false should not create toolbar at all', async () => {
    const editor = await pCreateEditorWithToolbar(false);
    const numToolbars = countNumber(SugarBody.body(), '.tox-toolbar');
    assert.equal(numToolbars, 0, 'Should be no toolbars');
    McEditor.remove(editor);
  });

  it('TBA: true should create default toolbar', async () => {
    const editor = await pCreateEditorWithToolbar(true);
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    assertIsDefaultToolbar(toolbar);
    McEditor.remove(editor);
  });

  it('TBA: undefined should create default toolbar', async () => {
    const editor = await pCreateEditorWithToolbar(undefined);
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    assertIsDefaultToolbar(toolbar);
    McEditor.remove(editor);
  });

  it('TBA: "bold italic" should create "bold italic" toolbar', async () => {
    const editor = await pCreateEditorWithToolbar('bold italic');
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have just bold and italic',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            children: [
              s.element('button', { }),
              s.element('button', { })
            ]
          })
        ]
      })),
      toolbar
    );
    McEditor.remove(editor);
  });

  it('TBA: "bold italic | stufffffed | strikethrough underline" should create "bold italic | strikethrough underline" toolbar', async () => {
    const editor = await pCreateEditorWithToolbar('bold italic | stufffffed | strikethrough underline');
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have bold, italic, strikethrough and underline',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            children: [
              s.element('button', { }),
              s.element('button', { })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            children: [
              s.element('button', { }),
              s.element('button', { })
            ]
          })
        ]
      })),
      toolbar
    );
    McEditor.remove(editor);
  });

  it('TBA: ["bold italic", "underline | strikethrough"] should create "bold italic" and "underline | strikethrough" toolbars', async () => {
    const editor = await pCreateEditorWithToolbar([ 'bold italic', 'underline | strikethrough' ]);
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    const numToolbars = countNumber(SugarBody.body(), '.tox-toolbar');
    assert.equal(numToolbars, 2, 'Should be two toolbars');
    Assertions.assertStructure(
      'Checking toolbar1 should have bold italic and and toolbar 2 should have underline',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { }),
                  s.element('button', { })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { })
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: ["bold"] should create "bold" toolbar', async () => {
    const editor = await pCreateEditorWithToolbar([ 'bold' ]);
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have just bold',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { })
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: empty array should not create toolbar at all', async () => {
    const editor = await pCreateEditorWithToolbar([]);
    const numToolbars = countNumber(SugarBody.body(), '.tox-toolbar');
    assert.equal(numToolbars, 0, 'Should be no toolbars');
    McEditor.remove(editor);
  });

  it('TBA: toolbar: "link", toolbar1: "bold italic underline" and toolbar2: "strikethrough" should create a "bold italic underline" toolbar and a "strikethrough" toolbar', async () => {
    const editor = await pCreateEditorWithToolbar('link', 'bold italic underline', 'strikethrough');
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    const numToolbars = countNumber(SugarBody.body(), '.tox-toolbar');
    assert.equal(numToolbars, 2, 'Should be two toolbars');
    Assertions.assertStructure(
      'Checking toolbar should have just bold and italic',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { }),
                  s.element('button', { }),
                  s.element('button', { })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { })
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: toolbar1: "bold italic underline" and toolbar2: ["strikethrough"] should create "bold italic underline" toolbar and ignore toolbar2', async () => {
    const editor = await pCreateEditorWithToolbar(true, 'bold italic underline', [ 'strikethrough' ] as any);
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have just bold, italic and underline',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', {}),
                  s.element('button', {}),
                  s.element('button', {})
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: toolbar: false and toolbar2: "bold italic" should create "bold italic" toolbar and ignore toolbar', async () => {
    const editor = await pCreateEditorWithToolbar(false, false as any, 'bold italic');
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have just bold and italic',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { }),
                  s.element('button', { })
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: toolbar: empty array and toolbar1: "bold italic" and toolbar2: "strikethrough" should create a "bold italic" toolbar and a "strikethrough" toolbar and ignore toolbar', async () => {
    const editor = await pCreateEditorWithToolbar([], 'bold italic', 'strikethrough');
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    const numToolbars = countNumber(SugarBody.body(), '.tox-toolbar');
    assert.equal(numToolbars, 2, 'Should be two toolbars');
    Assertions.assertStructure(
      'Checking toolbar 1 should have bold and italic and toolbar 2 should have strikethrough',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { }),
                  s.element('button', { })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { })
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: toolbar1: false and toolbar2: "bold italic underline" should create "bold italic underline toolbar and ignore toolbar1', async () => {
    const editor = await pCreateEditorWithToolbar(true, false as any, 'bold italic underline');
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have just bold, italic and underline',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { }),
                  s.element('button', { }),
                  s.element('button', { })
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: toolbar1: "bold italic | underline" and toolbar9: "strikethrough" should create a "bold italic | underline" toolbar and a "strikethrough" toolbar', async () => {
    const editor = await pCreateEditorWithToolbar(true, 'bold italic | underline', false as any, 'strikethrough');
    const overlord = extractOnlyOne(SugarBody.body(), '.tox-toolbar-overlord');
    const numToolbars = countNumber(SugarBody.body(), '.tox-toolbar');
    assert.equal(numToolbars, 2, 'Should be two toolbars');
    Assertions.assertStructure(
      'Checking toolbar 1 should have bold, italic and underline and toolbar 2 should have strikethrough',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar-overlord') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { }),
                  s.element('button', { })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', { })
                ]
              })
            ]
          })
        ]
      })),
      overlord
    );
    McEditor.remove(editor);
  });

  it('TBA: toolbar1: [] and toolbar2: false should create default toolbar', async () => {
    const editor = await pCreateEditorWithToolbar(true, [] as any, false as any);
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    assertIsDefaultToolbar(toolbar);
    McEditor.remove(editor);
  });

  it('TBA: toolbar25: "bold italic underline" should create default toolbar', async () => {
    const editor = await pCreateEditorWithToolbar(true, false as any, false as any, false as any, 'bold italic underline');
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    assertIsDefaultToolbar(toolbar);
    McEditor.remove(editor);
  });

  it('TBA: invalid toolbar type should fallback to the default toolbar', async () => {
    const editor = await pCreateEditorWithToolbar(1 as any);
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    assertIsDefaultToolbar(toolbar);
    McEditor.remove(editor);
  });

  it('TBA: toolbar with toolbar group names: toolbar: [ { name: "history", items: [ "undo", "redo" ] }, { name: "formatting", items: [ "bold", "italic" ] } ] should create a "undo redo | bold italic" toolbar', async () => {
    const editor = await pCreateEditorWithToolbar([
      { name: 'history', items: [ 'undo', 'redo' ] },
      { name: 'formatting', items: [ 'bold', 'italic' ] }
    ]);
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have undo, redo, bold and italic',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            attrs: {
              title: str.is('history')
            },
            children: [
              s.element('button', {}),
              s.element('button', {})
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            attrs: {
              title: str.is('formatting')
            },
            children: [
              s.element('button', {}),
              s.element('button', {})
            ]
          })
        ]
      })),
      toolbar
    );
    McEditor.remove(editor);
  });
});
