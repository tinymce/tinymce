import { ApproxStructure, Assertions, Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SelectorFind, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.advlist.SplitButtonTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'advlist lists',
    advlist_bullet_styles: 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman',
    advlist_number_styles: 'default,circle,square',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ AdvListPlugin, ListsPlugin ]);

  const pClickOnSplitBtnFor = async (editor: Editor, label: string) => {
    TinyUiActions.clickOnToolbar(editor, '[aria-label="' + label + '"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-menu.tox-selected-menu');
  };

  const assertNumListStructure = () => {
    Assertions.assertStructure('A basic alert dialog should have these components',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tiered-menu') ],
        children: [
          s.element('div', {
            classes: [
              arr.has('tox-menu'),
              arr.has('tox-collection'),
              arr.has('tox-collection--toolbar'),
              arr.has('tox-collection--toolbar-lg'),
              arr.has('tox-selected-menu')
            ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: [
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item'),
                      arr.has('tox-collection__item--active')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Default')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Circle')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Square')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      SelectorFind.descendant(SugarDocument.getDocument(), '.tox-tiered-menu').getOrDie('Cannot find menu')
    );
  };

  const assertBullListStructure = () => {
    Assertions.assertStructure('A basic alert dialog should have these components',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tiered-menu') ],
        children: [
          s.element('div', {
            classes: [
              arr.has('tox-menu'),
              arr.has('tox-collection'),
              arr.has('tox-collection--toolbar'),
              arr.has('tox-collection--toolbar-lg'),
              arr.has('tox-selected-menu')
            ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: [
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item'),
                      arr.has('tox-collection__item--active')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Default')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Lower Alpha')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Lower Greek')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  })
                ]
              }),
              // second row of icons
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: [
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Lower Roman')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Upper Alpha')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      'role': str.is('menuitemradio'),
                      'aria-label': str.is('Upper Roman')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      SelectorFind.descendant(SugarDocument.getDocument(), '.tox-tiered-menu').getOrDie('Cannot find menu')
    );
  };

  it('Check numbered list toolbar button structure', async () => {
    const editor = hook.editor();
    await pClickOnSplitBtnFor(editor, 'Numbered list');
    assertNumListStructure();
    TinyUiActions.keyup(editor, Keys.escape());
  });

  it('Check bullet list toolbar button structure', async () => {
    const editor = hook.editor();
    await pClickOnSplitBtnFor(editor, 'Bullet list');
    assertBullListStructure();
    TinyUiActions.keyup(editor, Keys.escape());
  });

  const assertButtonEnabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="false"]`);

  const assertButtonDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  const assertMenuPartEnabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"] > span.tox-tbtn.tox-tbtn--select[aria-disabled="false"]`);

  it('TINY-112674: Advlist split buttons should be disabled in readonly mode', async () => {
    const editor = hook.editor();
    assertButtonEnabled('numlist');
    assertButtonEnabled('bullist');
    assertMenuPartEnabled('numlist');
    assertMenuPartEnabled('bullist');

    editor.mode.set('readonly');
    assertButtonDisabled('numlist');
    assertButtonDisabled('bullist');

    editor.mode.set('design');
    editor.setEditableRoot(false);
    assertButtonDisabled('numlist');
    assertButtonDisabled('bullist');

    editor.setEditableRoot(true);
    assertButtonEnabled('numlist');
    assertButtonEnabled('bullist');
    assertMenuPartEnabled('numlist');
    assertMenuPartEnabled('bullist');
  });

  it('TINY-11264: Advlist split buttons should be disabled on non editable parent ul ol', async () => {
    const editor = hook.editor();
    editor.setContent('<p>test</p><ul contentEditable="false"><li>a</li></ul><ul ><li>a</li></ul>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 1);
    assertButtonDisabled('numlist');
    assertButtonDisabled('bullist');

    TinySelections.setCursor(editor, [ 2, 0, 0 ], 1);
    assertButtonEnabled('numlist');
    assertButtonEnabled('bullist');
    assertMenuPartEnabled('numlist');
    assertMenuPartEnabled('bullist');
  });
});
