/* eslint-disable no-console */
import { ApproxStructure, Assertions, Keys, UiFinder } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Cell, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as UiUtils from '../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.SilverInlineEditorTest', () => {
  const os = PlatformDetection.detect().os;
  const store = Cell<string[]>([ ]);
  const hook = TinyHooks.bddSetup<Editor>({
    inline: true,
    toolbar: 'custom1 customtoggle1 dropdown1-with-text dropdown1-with-icon splitbutton1-with-text splitbutton2-with-icon',
    menubar: 'menutest',
    menu: {
      menutest: { title: 'test', items: 'x1' }
    },
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('custom1', {
        type: 'button',
        icon: 'cut',
        onAction: () => {
          store.set(store.get().concat([ 'button1' ]));
        }
      });

      ed.ui.registry.addToggleButton('customtoggle1', {
        type: 'togglebutton',
        text: 'ToggleMe',
        onSetup: (toggleButtonApi) => {
          const f = () => {
            toggleButtonApi.setActive(!toggleButtonApi.isActive());
          };
          ed.on('customtoggle1-toggle', f);
          return () => ed.off('customtoggle1-toggle', f);
        },
        onAction: () => {
          store.set(store.get().concat([ 'button1' ]));
        }
      });

      ed.ui.registry.addMenuButton('dropdown1-with-text', {
        text: 'dropdown1',
        fetch: (callback) => callback([
          {
            type: 'menuitem',
            text: 'Fetch1',
            onAction: () => {
              console.log('fetching item1');
            }
          }
        ])
      });

      ed.ui.registry.addMenuButton('dropdown1-with-icon', {
        icon: 'bold',
        fetch: (callback) => callback([
          {
            type: 'menuitem',
            text: 'Fetch1',
            onAction: () => {
              console.log('fetching item1');
            }
          }
        ])
      });

      ed.ui.registry.addSplitButton('splitbutton1-with-text', {
        text: 'Delta',
        onItemAction: Fun.noop,
        fetch: (callback) => {
          callback([
            {
              type: 'choiceitem',
              text: 'Split1',
              value: 'split1'
            },
            {
              type: 'choiceitem',
              text: 'Split2',
              value: 'split2'
            }
          ]);
        },
        onSetup: (splitButtonApi) => {
          const f = () => {
            splitButtonApi.setActive(!splitButtonApi.isActive());
          };
          ed.on('splitbutton1-toggle', f);
          return () => ed.off('splitbutton1-toggle', f);
        },
        onAction: () => {
          console.log('triggering action instead');
        }
      });

      ed.ui.registry.addSplitButton('splitbutton2-with-icon', {
        icon: 'underline',
        onItemAction: Fun.noop,
        fetch: (callback) => {
          callback([
            {
              type: 'choiceitem',
              text: '2-Split1',
              value: '2-split1'
            },
            {
              type: 'choiceitem',
              text: '2-Split2',
              value: '2-split2'
            }
          ]);
        },
        onAction: () => {
          console.log('triggering action instead');
        }
      });

      ed.ui.registry.addMenuItem('x1', {
        icon: 'italic',
        text: 'Text with icon',
        shortcut: 'Meta+M',
        onAction: () => {
          console.log('Just Text click');
        }
      });
    }
  }, []);

  beforeEach(async () => {
    hook.editor().focus();
    await UiUtils.pWaitForEditorToRender();
  });

  it('Check basic container structure and actions', () => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);
    Assertions.assertStructure(
      'Container structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-editor-container') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-editor-header') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-menubar') ],
                    attrs: { role: str.is('menubar') },
                    children: [
                      // Dropdown via text
                      s.element('button', {
                        classes: [ arr.has('tox-mbtn'), arr.has('tox-mbtn--select') ],
                        children: [
                          s.element('span', {
                            classes: [ arr.has('tox-mbtn__select-label') ],
                            html: str.is('test')
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-mbtn__select-chevron') ],
                            children: [
                              s.element('svg', {})
                            ]
                          })
                        ]
                      })
                    ]
                  }),

                  s.element('div', {
                    classes: [ arr.has('tox-toolbar-overlord') ],
                    attrs: { role: str.is('group') },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-toolbar__primary') ],
                        attrs: { role: str.is('group') },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-toolbar__group') ],
                            children: [
                              // Basic button
                              s.element('button', {
                                classes: [ arr.has('tox-tbtn') ]
                              }),

                              // Toggle button
                              s.element('button', {
                                classes: [ arr.has('tox-tbtn'), arr.not('tox-btn--enabled') ]
                              }),

                              // Dropdown via text
                              s.element('button', {
                                classes: [ arr.has('tox-tbtn'), arr.has('tox-tbtn--select') ],
                                children: [
                                  s.element('span', {
                                    classes: [ arr.has('tox-tbtn__select-label') ],
                                    html: str.is('dropdown1')
                                  }),
                                  s.element('div', {
                                    classes: [ arr.has('tox-tbtn__select-chevron') ],
                                    children: [
                                      s.element('svg', {})
                                    ]
                                  })
                                ]
                              }),

                              // Dropdown via icon
                              s.element('button', {
                                classes: [ arr.has('tox-tbtn'), arr.has('tox-tbtn--select') ],
                                children: [
                                  s.element('span', {
                                    // NOTE: Not sure what this should be?
                                    classes: [],
                                    children: [
                                      s.element('svg', {})
                                    ]
                                  }),
                                  s.element('div', {
                                    classes: [ arr.has('tox-tbtn__select-chevron') ],
                                    children: [
                                      s.element('svg', {})
                                    ]
                                  })
                                ]
                              }),

                              // Splitbutton with text
                              s.element('div', {
                                classes: [ arr.has('tox-split-button') ],
                                children: [
                                  s.element('span', {
                                    classes: [ arr.has('tox-tbtn') ],
                                    children: [
                                      s.element('span', {
                                        classes: [ arr.has('tox-tbtn__select-label') ],
                                        html: str.is('Delta')
                                      })
                                    ]
                                  }),
                                  s.element('span', {
                                    classes: [ arr.has('tox-tbtn'), arr.has('tox-split-button__chevron') ],
                                    children: [
                                      s.element('svg', {})
                                    ]
                                  }),
                                  s.element('span', {
                                    attrs: {
                                      'aria-hidden': str.is('true'),
                                      'style': str.is('display: none;')
                                    },
                                    children: [
                                      s.text(str.is('To open the popup, press Shift+Enter'))
                                    ]
                                  })
                                ]
                              }),

                              // Splitbutton with icon
                              s.element('div', {
                                classes: [ arr.has('tox-split-button') ],
                                children: [
                                  s.element('span', {
                                    classes: [ arr.has('tox-tbtn') ],
                                    children: [
                                      s.element('span', {
                                        children: [
                                          s.element('svg', {})
                                        ]
                                      })
                                    ]
                                  }),
                                  s.element('span', {
                                    classes: [ arr.has('tox-tbtn'), arr.has('tox-split-button__chevron') ],
                                    children: [
                                      s.element('svg', {})
                                    ]
                                  }),
                                  s.element('span', {
                                    attrs: {
                                      'aria-hidden': str.is('true'),
                                      'style': str.is('display: none;')
                                    },
                                    children: [
                                      s.text(str.is('To open the popup, press Shift+Enter'))
                                    ]
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-anchorbar') ]
                  })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-throbber') ]
          })
        ]
      })),
      container
    );

    const top = Css.get(container, 'top');
    const left = Css.get(container, 'left');
    assert.notInclude(top, '.', `Container top position (${top}) should be an integer`);
    assert.notInclude(left, '.', `Container left position (${left}) should be an integer`);

    TinyUiActions.clickOnToolbar(editor, 'button');
    assert.deepEqual(store.get(), [ 'button1' ], 'Button should have been triggered');
  });

  it('TBA: Menu appearing from menubar should have svg icons', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnMenu(editor, 'button[role="menuitem"]:contains("test")');
    await UiFinder.pWaitForVisible('Waiting for menu to appear', SugarBody.body(), '[role="menu"]');
    const activeItem = UiFinder.findIn(SugarBody.body(), '[role="menu"] .tox-collection__item--active').getOrDie();
    Assertions.assertStructure(
      'Checking item has svg icon and text',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-collection__item') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__item-icon') ],
            children: [
              s.element('svg', { })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-collection__item-label') ],
            html: str.is('Text with icon')
          }),
          s.element('div', {
            classes: [ arr.has('tox-collection__item-accessory') ],
            html: str.is(os.isMacOS() || os.isiOS() ? '\u2318' + 'M' : 'Ctrl' + '+M')
          })
        ]
      })),
      activeItem
    );
    TinyUiActions.keyup(editor, Keys.escape());
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');
  });

  it('TBA: Clicking on a toggle button should not toggle. It is up to the setActive api to do that', () => {
    const editor = hook.editor();
    const button = TinyUiActions.clickOnToolbar(editor, '.tox-tbtn:contains("ToggleMe")');
    Assertions.assertStructure('ToggleMe button should not be pressed',
      ApproxStructure.build((s, str, arr) => s.element('button', {
        attrs: {
          'aria-pressed': str.is('false')
        },
        classes: [ arr.not('tox-tbtn--enabled') ]
      })),
      button
    );
  });

  it('TBA: Using the api should toggle a toggle button', () => {
    const editor = hook.editor();
    editor.dispatch('customtoggle1-toggle');
    const button = UiFinder.findIn(TinyDom.container(editor), '.tox-tbtn:contains("ToggleMe")').getOrDie();
    Assertions.assertStructure('ToggleMe button should be pressed',
      ApproxStructure.build((s, str, arr) => s.element('button', {
        attrs: {
          'aria-pressed': str.is('true')
        },
        classes: [ arr.has('tox-tbtn--enabled') ]
      })),
      button
    );
  });

  it('TBA: Clicking on a split button primary part should not toggle. It is up to the setActive api to do that', () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, '.tox-split-button:contains("Delta")');
    const button = UiFinder.findIn(TinyDom.container(editor), '.tox-split-button > .tox-tbtn:contains("Delta")').getOrDie();
    Assertions.assertStructure('Delta button should not be pressed',
      ApproxStructure.build((s, str, arr) => s.element('span', {
        classes: [ arr.not('tox-tbtn--enabled') ]
      })),
      button
    );
  });

  it('TBA: Using the api should toggle a split button', () => {
    const editor = hook.editor();
    editor.dispatch('splitbutton1-toggle');
    const button = UiFinder.findIn(TinyDom.container(editor), '.tox-split-button > .tox-tbtn:contains("Delta")').getOrDie();
    Assertions.assertStructure('Delta button should be pressed',
      ApproxStructure.build((s, str, arr) => s.element('span', {
        classes: [ arr.has('tox-tbtn--enabled') ]
      })),
      button
    );
  });

  it('Check basic content area container structure', () => {
    const editor = hook.editor();
    Assertions.assertStructure(
      'Content area container structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('mce-content-body') ],
        children: [
          s.element('p', {
            children: [ s.anything() ]
          })
        ]
      })),
      TinyDom.contentAreaContainer(editor)
    );
  });
});
