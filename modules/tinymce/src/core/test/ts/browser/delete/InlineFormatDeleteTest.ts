import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as InlineFormatDelete from 'tinymce/core/delete/InlineFormatDelete';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.delete.InlineFormatDelete', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const doDelete = (editor: Editor) => {
    const returnVal = InlineFormatDelete.backspaceDelete(editor, true);
    returnVal.each((apply) => apply());
    assert.isTrue(returnVal.isSome(), 'Should return true since the operation should have done something');
  };

  const noopDelete = (editor: Editor) => {
    const returnVal = InlineFormatDelete.backspaceDelete(editor, true);
    assert.isFalse(returnVal.isSome(), 'Should return false since the operation is a noop');
  };

  const doBackspace = (editor: Editor) => {
    const returnVal = InlineFormatDelete.backspaceDelete(editor, false);
    returnVal.each((apply) => apply());
    assert.isTrue(returnVal.isSome(), 'Should return true since the operation should have done something');
  };

  const noopBackspace = (editor: Editor) => {
    const returnVal = InlineFormatDelete.backspaceDelete(editor, false);
    assert.isFalse(returnVal.isSome(), 'Should return false since the operation is a noop');
  };

  context('Backspace/delete in unformatted plain text', () => {
    it('Backspace after plain text should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p>a</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Delete before plain text should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      noopDelete(editor);
      TinyAssertions.assertContent(editor, '<p>a</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    });

    it('Backspace in middle of plain text should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p>ab</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Delete in middle of plain text should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      noopDelete(editor);
      TinyAssertions.assertContent(editor, '<p>ab</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Delete in middle of caret format span should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<span id="_mce_caret" data-mce-bogus="1" data-mce-type="format-caret"><strong>&#65279;</strong></span>b</p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1 ], 0);
      noopDelete(editor);
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 0);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a')),
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1')
                    },
                    children: [
                      s.element('strong', {
                        children: [
                          s.text(str.is(Zwsp.ZWSP))
                        ]
                      })
                    ]
                  }),
                  s.text(str.is('b'))
                ]
              })
            ]
          });
        })
      );
    });

  });

  context('Backspace/delete in at last character', () => {
    it('Backspace after last character in formatted element', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em>a</em></strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                // firefox retains all formats by default
                children: [
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1')
                    },
                    children: [
                      s.element('strong', {
                        children: [
                          s.element('em', {
                            children: [
                              s.text(str.is(Zwsp.ZWSP))
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
        })
      );
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('Delete before last character in formatted element', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em>a</em></strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
      doDelete(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1')
                    },
                    children: [
                      s.element('strong', {
                        children: [
                          s.element('em', {
                            children: [
                              s.text(str.is(Zwsp.ZWSP))
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
        })
      );
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('Backspace before last character in formatted element', () => {
      const editor = hook.editor();
      editor.setContent('<p><em>a</em><strong>b</strong></p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      noopBackspace(editor);
      TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
    });

    it('Delete after last character in formatted element', () => {
      const editor = hook.editor();
      editor.setContent('<p><em>a</em><strong>b</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      noopDelete(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    });

    it('Backspace after last character in formatted element with sibling in format parent', () => {
      const editor = hook.editor();
      editor.setContent('<p><ins><strong><em>a</em></strong>b</ins></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('ins', {
                    children: [
                      s.element('span', {
                        attrs: {
                          'id': str.is('_mce_caret'),
                          'data-mce-bogus': str.is('1')
                        },
                        children: [
                          s.element('strong', {
                            children: [
                              s.element('em', {
                                children: [
                                  s.text(str.is(Zwsp.ZWSP))
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      s.text(str.is('b'))
                    ]
                  })
                ]
              })
            ]
          });
        })
      );
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0);
    });

    it('Delete after last character in formatted element with sibling in format parent', () => {
      const editor = hook.editor();
      editor.setContent('<p><ins>a<strong><em>b</em></strong></ins></p>');
      TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
      doDelete(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('ins', {
                    children: [
                      s.text(str.is('a')),
                      s.element('span', {
                        attrs: {
                          'id': str.is('_mce_caret'),
                          'data-mce-bogus': str.is('1')
                        },
                        children: [
                          s.element('strong', {
                            children: [
                              s.element('em', {
                                children: [
                                  s.text(str.is(Zwsp.ZWSP))
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
        })
      );
      TinyAssertions.assertSelection(editor, [ 0, 0, 1, 0, 0, 0 ], 0, [ 0, 0, 1, 0, 0, 0 ], 0);
    });
  });

  context('Backspace/delete a selection', () => {
    const browser = PlatformDetection.detect().browser;

    const assertStructureAndSelectionBlockDelete = (editor: Editor) => {
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                // firefox retains format for block delete, so no new caret created
                children: browser.isFirefox()
                  ? [
                    s.element('strong', {
                      children: [
                        s.element('em', {
                          children: [
                            s.element('span', {
                              attrs: {
                                style: str.is('text-decoration: underline;')
                              },
                              children: [
                                s.element('br', {}),
                              ]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                  : [
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1')
                      },
                      children: [
                        s.element('strong', {
                          children: [
                            s.element('em', {
                              children: [
                                s.element('span', {
                                  attrs: {
                                    style: str.is('text-decoration: underline;')
                                  },
                                  children: [
                                    s.text(str.is(Zwsp.ZWSP))
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
        })
      );
      const selPath = browser.isFirefox() ? [ 0, 0, 0, 0 ] : [ 0, 0, 0, 0, 0, 0 ];
      TinyAssertions.assertSelection(editor, selPath, 0, selPath, 0);
    };

    it('Backspace entire selection of block containing a single formatted element should retain original formats', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 3);
      doBackspace(editor);
      assertStructureAndSelectionBlockDelete(editor);
    });

    it('Delete entire selection of block containing a single formatted element should retain original formats', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 3);
      doDelete(editor);
      assertStructureAndSelectionBlockDelete(editor);
    });

    it('Backspace entire selection of formatted element within block should retain original formats', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<strong><em><span style="text-decoration: underline;">bcd</span></em></strong>e</p>');
      TinySelections.setSelection(editor, [ 0, 1, 0, 0, 0 ], 0, [ 0, 1, 0, 0, 0 ], 3);
      doBackspace(editor);
      const outerText = browser.isFirefox() ? [ 'e' ] : [ '', 'e' ];
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a')),
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1')
                    },
                    children: [
                      s.element('strong', {
                        children: [
                          s.element('em', {
                            children: [
                              s.element('span', {
                                attrs: {
                                  style: str.is('text-decoration: underline;')
                                },
                                children: [
                                  s.text(str.is(Zwsp.ZWSP))
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  ...Arr.map(outerText, (text) => s.text(str.is(text)))
                ]
              })
            ]
          });
        })
      );
      TinyAssertions.assertSelection(editor, [ 0, 1, 0, 0, 0, 0 ], 0, [ 0, 1, 0, 0, 0, 0 ], 0);
    });

    it('Backspace partial selection from start of formatted element within block should retain original formats', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<strong><em><span style="text-decoration: underline;">bcd</span></em></strong>ef</p>');
      TinySelections.setSelection(editor, [ 0, 1, 0, 0, 0 ], 0, [ 0, 2 ], 1);
      doBackspace(editor);
      const firstOuterText = browser.isFirefox() ? [ 'a', '' ] : [ 'a' ];
      const secondOuterText = browser.isFirefox() ? [ 'f' ] : [ '', 'f' ];
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  ...Arr.map(firstOuterText, (text) => s.text(str.is(text))),
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1')
                    },
                    children: [
                      s.element('strong', {
                        children: [
                          s.element('em', {
                            children: [
                              s.element('span', {
                                attrs: {
                                  style: str.is('text-decoration: underline;')
                                },
                                children: [
                                  s.text(str.is(Zwsp.ZWSP))
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  ...Arr.map(secondOuterText, (text) => s.text(str.is(text))),
                ]
              })
            ]
          });
        })
      );
      const selPath = browser.isFirefox() ? [ 0, 2, 0, 0, 0, 0 ] : [ 0, 1, 0, 0, 0, 0 ];
      TinyAssertions.assertCursor(editor, selPath, 0);
    });
  });
});
