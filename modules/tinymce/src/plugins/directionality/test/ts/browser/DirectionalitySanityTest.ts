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
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              dir: str.is('rtl')
            }
          })
        ]
      });
    }));
  });

  it('TBA: Set and select content, click on the Left to right toolbar button and assert direction is left to right', () => {
    const editor = hook.editor();
    editor.setContent('<p dir="rtl">a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              dir: str.is('ltr')
            }
          })
        ]
      });
    }));
  });

  it('should set two paragraphs to rtl and ltl', () => {
    const editor = hook.editor();
    editor.setContent('<p>foo</p><p>bar</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 1 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              dir: str.is('rtl')
            }
          }),
          s.element('p', {
            attrs: {
              dir: str.is('rtl')
            }
          })
        ]
      });
    }));

    TinySelections.setSelection(editor, [ 0 ], 0, [ 1 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              dir: str.is('ltr')
            }
          }),
          s.element('p', {
            attrs: {
              dir: str.is('ltr')
            }
          })
        ]
      });
    }));
  });

  it('should set parent dir when element is a list item', () => {
    const editor = hook.editor();
    editor.setContent(`
    <ul>
      <li>foo</li>
      <li>bar</li>
    </ul>
    `);
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('ul', {
            attrs: {
              dir: str.is('rtl')
            },
            children: [
              s.element('li', {}),
              s.element('li', {}),
            ]
          }),
        ]
      });
    }));

    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('ul', {
            attrs: {
              dir: str.is('ltr')
            },
            children: [
              s.element('li', {}),
              s.element('li', {}),
            ]
          }),
        ]
      });
    }));
  });

  it('should remove dir attr if parent has same dir', () => {
    const editor = hook.editor();
    editor.setContent(`
    <div dir="ltr">
      <p>foo</p>
      <p>bar</p>
    </div>
    `);
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('div', {
            attrs: {
              dir: str.is('ltr')
            },
            children: [
              s.element('p', {
                attrs: {
                  dir: str.is('rtl')
                }
              }),
              s.element('p', {}),
            ]
          }),
        ]
      });
    }));

    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('div', {
            attrs: {
              dir: str.is('ltr')
            },
            children: [
              s.element('p', {}),
              s.element('p', {}),
            ]
          }),
        ]
      });
    }));
  });

  it('should not remove dir attr if parent has dir empty', () => {
    const editor = hook.editor();
    editor.setContent(`
    <div dir="">
      <p>foo</p>
      <p>bar</p>
    </div>
    `);
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('div', {
            attrs: {
              dir: str.is('')
            },
            children: [
              s.element('p', {
                attrs: {
                  dir: str.is('rtl')
                }
              }),
              s.element('p', {}),
            ]
          }),
        ]
      });
    }));

    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('div', {
            attrs: {
              dir: str.is('')
            },
            children: [
              s.element('p', {
                attrs: {
                  dir: str.is('ltr')
                }
              }),
              s.element('p', {}),
            ]
          }),
        ]
      });
    }));
  });
});
