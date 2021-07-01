import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/directionality/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.directionality.DirectionalitySanityTest', () => {
  const hook = TinyHooks.bddSetupLight({
    plugins: 'directionality',
    toolbar: 'ltr rtl',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: Set and select content, click on the Right to left toolbar button and assert direction is right to left', () => {
    const editor = hook.editor();
    editor.setContent('a');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, '<p dir="rtl">a</p>');
  });

  it('TBA: Set and select content, click on the Left to right toolbar button and assert direction is left to right', () => {
    const editor = hook.editor();
    editor.setContent('<p dir="rtl">a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, '<p dir="ltr">a</p>');
  });

  it('TINY-4589: should set two paragraphs to rtl and ltl', () => {
    const editor = hook.editor();
    editor.setContent('<p>foo</p><p>bar</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 1 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, `<p dir="rtl">foo</p>\n<p dir="rtl">bar</p>`);

    TinySelections.setSelection(editor, [ 0 ], 0, [ 1 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, `<p dir="ltr">foo</p>\n<p dir="ltr">bar</p>`);
  });

  it('TINY-4589: should set parent dir when element is a list item', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>foo</li><li>bar</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, `<ul dir="rtl">\n<li>foo</li>\n<li>bar</li>\n</ul>`);

    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, `<ul dir="ltr">\n<li>foo</li>\n<li>bar</li>\n</ul>`);
  });

  it('TINY-4589: should remove dir from list item', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li dir="ltr">foo</li><li>bar</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, `<ul dir="rtl">\n<li>foo</li>\n<li>bar</li>\n</ul>`);
  });

  it('TINY-4589: should consider list parent dir if it is a list item', () => {
    const editor = hook.editor();
    editor.setContent(`
    <ul dir="rtl">
      <li dir="ltr">
        ini
        <ul>
          <li>foo</li>
          <li>bar</li>
        </ul>
      </li>
    </ul>
    `);
    TinySelections.setSelection(editor, [ 0, 0, 1, 0 ], 0, [ 0, 0, 1, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('ul', {
            attrs: {
              dir: str.is('rtl')
            },
            children: [
              s.element('li', {
                attrs: {
                  dir: str.is('ltr')
                },
                children: [
                  s.anything(),
                  s.element('ul', {
                    attrs: {
                      dir: str.is('ltr')
                    },
                    children: [
                      s.element('li', {}),
                      s.element('li', {})
                    ]
                  }),
                ]
              })
            ]
          })
        ]
      });
    }));

    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('ul', {
            attrs: {
              dir: str.is('rtl')
            },
            children: [
              s.element('li', {
                attrs: {
                  dir: str.is('ltr')
                },
                children: [
                  s.anything(),
                  s.element('ul', { // remove dir cause parent ul has rtl already
                    children: [
                      s.element('li', {}),
                      s.element('li', {})
                    ]
                  }),
                ]
              })
            ]
          })
        ]
      });
    }));
  });

  it('TINY-4589: should remove dir attr if parent has same dir', () => {
    const editor = hook.editor();
    editor.setContent(`
    <div dir="ltr">
    <p>foo</p>
    <p>bar</p>
    </div>
    `);
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, `<div dir="ltr">\n<p dir="rtl">foo</p>\n<p>bar</p>\n</div>`);

    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, `<div dir="ltr">\n<p>foo</p>\n<p>bar</p>\n</div>`);
  });

  it('TINY-4589: should not remove dir attr if parent has dir empty', () => {
    const editor = hook.editor();
    editor.setContent(`
    <div dir="">
      <p>foo</p>
      <p>bar</p>
    </div>
    `);
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, `<div dir="">\n<p dir="rtl">foo</p>\n<p>bar</p>\n</div>`);

    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, `<div dir="">\n<p dir="ltr">foo</p>\n<p>bar</p>\n</div>`);
  });

  it('TINY-4589: should use first correct parent dir', () => {
    const editor = hook.editor();
    editor.setContent(`
    <div dir="rtl">
      <div dir="ltr">
        <div dir>
          <div dir="x">
            <div dir=" ">
              <p>foo</p>
              <p>bar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    `);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('div', {
            attrs: {
              dir: str.is('rtl')
            },
            children: [
              s.element('div', {
                attrs: {
                  dir: str.is('ltr')
                },
                children: [
                  s.element('div', {
                    attrs: {
                      dir: str.is('')
                    },
                    children: [
                      s.element('div', {
                        attrs: {
                          dir: str.is('x')
                        },
                        children: [
                          s.element('div', {
                            attrs: {
                              dir: str.is(' ')
                            },
                            children: [
                              s.element('p', {
                                attrs: {
                                  dir: str.is('rtl')
                                }
                              }),
                              s.element('p', {})
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    }));

    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('div', {
            attrs: {
              dir: str.is('rtl')
            },
            children: [
              s.element('div', {
                attrs: {
                  dir: str.is('ltr')
                },
                children: [
                  s.element('div', {
                    attrs: {
                      dir: str.is('')
                    },
                    children: [
                      s.element('div', {
                        attrs: {
                          dir: str.is('x')
                        },
                        children: [
                          s.element('div', {
                            attrs: {
                              dir: str.is(' ')
                            },
                            children: [
                              s.element('p', {}), // doesn't add ltr cause parent has
                              s.element('p', {})
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    }));
  });
});
