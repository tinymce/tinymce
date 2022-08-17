import { ApproxStructure, Assertions, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SelectorFind, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

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
                      role: str.is('menuitemradio'),
                      title: str.is('Default')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Circle')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Square')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Default')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Lower Alpha')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Lower Greek')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Lower Roman')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Upper Alpha')
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
                      role: str.is('menuitemradio'),
                      title: str.is('Upper Roman')
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
});
