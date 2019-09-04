/* tslint:disable:no-console */
import { ApproxStructure, Assertions, Logger, Mouse, Pipeline, Step, Chain, UiFinder, Keyboard, Keys, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { console, document } from '@ephox/dom-globals';
import { Cell, Arr } from '@ephox/katamari';
import { TinyLoader, TinyApis } from '@ephox/mcagar';
import { Element, Body, Css } from '@ephox/sugar';

import Env from 'tinymce/core/api/Env';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Inline Editor (Silver) test', (success, failure) => {
  Theme();

  const store = Cell([ ]);

  const sUiContainerTest = (editor, container, tinyApis) => Logger.ts('Check basic container structure and actions', [
    tinyApis.sFocus,
    Assertions.sAssertStructure(
      'Container structure',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-editor-container') ],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-editor-header')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-menubar')],
                      attrs: { role: str.is('menubar') },
                      children: [
                        // Dropdown via text
                        s.element('button', {
                          classes: [arr.has('tox-mbtn'), arr.has('tox-mbtn--select')],
                          children: [
                            s.element('span', {
                              classes: [arr.has('tox-mbtn__select-label')],
                              html: str.is('test')
                            }),
                            s.element('div', {
                              classes: [arr.has('tox-mbtn__select-chevron')],
                              children: [
                                s.element('svg', {})
                              ]
                            }),
                          ]
                        }),
                      ]
                    }),

                    s.element('div', {
                      classes: [ arr.has('tox-toolbar') ],
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
                                    s.element('svg', { })
                                  ]
                                }),
                              ]
                            }),

                            // Dropdown via icon
                            s.element('button', {
                              classes: [ arr.has('tox-tbtn'), arr.has('tox-tbtn--select') ],
                              children: [
                                s.element('span', {
                                  // NOTE: Not sure what this should be?
                                  classes: [  ],
                                  children: [
                                    s.element('svg', { })
                                  ]
                                }),
                                s.element('div', {
                                  classes: [ arr.has('tox-tbtn__select-chevron') ],
                                  children: [
                                    s.element('svg', { })
                                  ]
                                }),
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
                                    s.element('svg', { })
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
                                        s.element('svg', { })
                                      ]
                                    })
                                  ]
                                }),
                                s.element('span', {
                                  classes: [ arr.has('tox-tbtn'), arr.has('tox-split-button__chevron') ],
                                  children: [
                                    s.element('svg', { })
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
                    }),
                    s.element('div', {
                      classes: [ arr.has('tox-anchorbar') ]
                    })
                  ]
                }),
              ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-throbber') ]
            })
          ]
        });
      }),
      container
    ),
    Step.sync(() => {
      const top = Css.get(container, 'top');
      const left = Css.get(container, 'left');
      Assertions.assertEq(`Container top position (${top}) should be an integer`, true, top.indexOf('.') === -1);
      Assertions.assertEq(`Container left position (${left}) should be an integer`, true, left.indexOf('.') === -1);
    }),

    Mouse.sClickOn(container, '.tox-toolbar button'),
    Step.sync(() => {
      Assertions.assertEq('Button should have been triggered', [ 'button1' ], store.get());
    }),

    Log.stepsAsStep('TBA', 'Menu appearing from menubar should have svg icons', [
      Mouse.sClickOn(container, '[role="menubar"] button[role="menuitem"]:contains("test")'),
      UiFinder.sWaitForVisible('Waiting for menu to appear', Body.body(), '[role="menu"]'),
      Chain.asStep(Body.body(), [
        UiFinder.cFindIn('[role="menu"] .tox-collection__item--active'),
        Assertions.cAssertStructure(
          'Checking item has svg icon and text',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
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
                  html: str.is(Env.mac ? '\u2318' + 'M' : 'Ctrl' + '+M')
                })
              ]
            });
          })
        )
      ]),
      Keyboard.sKeydown(Element.fromDom(document), Keys.escape(), { }),
      UiFinder.sNotExists(Body.body(), '[role="menu"]')
    ]),

    Log.stepsAsStep('TBA', 'Clicking on a toggle button should not toggle. It is up to the setActive api to do that', [
      Mouse.sClickOn(container, '.tox-toolbar .tox-tbtn:contains("ToggleMe")'),
      Chain.asStep(container, [
        UiFinder.cFindIn('.tox-tbtn:contains("ToggleMe")'),
        Assertions.cAssertStructure('Should not be pressed', ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            attrs: {
              'aria-pressed': str.is('false')
            },
            classes: [ arr.not('tox-tbtn--enabled') ]
          });
        }))
      ])
    ]),

    Log.stepsAsStep('TBA', 'Using the api should toggle a toggle button', [
      Step.sync(() => {
        editor.fire('customtoggle1-toggle');
      }),
      Chain.asStep(container, [
        UiFinder.cFindIn('.tox-tbtn:contains("ToggleMe")'),
        Assertions.cAssertStructure('Should be pressed', ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            attrs: {
              'aria-pressed': str.is('true')
            },
            classes: [ arr.has('tox-tbtn--enabled') ]
          });
        }))
      ])
    ]),

    Log.stepsAsStep('TBA', 'Clicking on a split button primary part should not toggle. It is up to the setActive api to do that', [
      Mouse.sClickOn(container, '.tox-toolbar .tox-split-button:contains("Delta")'),
      Chain.asStep(container, [
        UiFinder.cFindIn('.tox-split-button > .tox-tbtn:contains("Delta")'),
        Assertions.cAssertStructure('Should not be pressed', ApproxStructure.build((s, str, arr) => {
          return s.element('span', {
            classes: [ arr.not('tox-tbtn--enabled') ]
          });
        }))
      ])
    ]),

    Log.stepsAsStep('TBA', 'Using the api should toggle a split button', [
      Step.sync(() => {
        editor.fire('splitbutton1-toggle');
      }),
      Chain.asStep(container, [
        UiFinder.cFindIn('.tox-split-button > .tox-tbtn:contains("Delta")'),
        Assertions.cAssertStructure('Should be pressed', ApproxStructure.build((s, str, arr) => {
          return s.element('span', {
            classes: [ arr.has('tox-tbtn--enabled') ]
          });
        }))
      ])
    ])
  ]);

  const sContentAreaContainerTest = (contentAreaContainer) => Logger.ts('Check basic content area container structure', [
    Assertions.sAssertStructure(
      'Content area container structure',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('mce-content-body') ],
          children: [
            s.element('p', {
              children: [ s.anything() ]
            })
          ]
        });
      }),
      contentAreaContainer
    )
  ]);

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
      const uiContainer = Element.fromDom(editor.getContainer());
      const contentAreaContainer = Element.fromDom(editor.getContentAreaContainer());

      const tinyApis = TinyApis(editor);

      Pipeline.async({ }, Arr.flatten([
        sUiContainerTest(editor, uiContainer, tinyApis),
        sContentAreaContainerTest(contentAreaContainer)
      ]), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      inline: true,
      toolbar: 'custom1 customtoggle1 dropdown1-with-text dropdown1-with-icon splitbutton1-with-text splitbutton2-with-icon',
      menubar: 'menutest',
      menu: {
        menutest: { title: 'test', items: 'x1'}
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
          fetch: (callback) => {
            return callback([
              {
                type: 'menuitem',
                text: 'Fetch1',
                onAction: () => {
                  console.log('fetching item1');
                }
              }
            ]);
          }
        });

        ed.ui.registry.addMenuButton('dropdown1-with-icon', {
          icon: 'bold',
          fetch: (callback) => {
            return callback([
              {
                type: 'menuitem',
                text: 'Fetch1',
                onAction: () => {
                  console.log('fetching item1');
                }
              }
            ]);
          }
        });

        ed.ui.registry.addSplitButton('splitbutton1-with-text', {
          text: 'Delta',
          onItemAction: () => { },
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
              },
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
          onItemAction: () => { },
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
              },
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
          onAction () {
            console.log('Just Text click');
          }
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
