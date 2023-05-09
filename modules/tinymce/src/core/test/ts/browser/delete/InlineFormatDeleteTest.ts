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

  const doBackspace = (editor: Editor, shouldBeSome: boolean = true) => {
    const returnVal = InlineFormatDelete.backspaceDelete(editor, false);
    returnVal.each((apply) => apply());
    assert.isTrue(shouldBeSome === returnVal.isSome(), 'Should return true since the operation should have done something');
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
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('Delete before plain text should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      noopDelete(editor);
      TinyAssertions.assertContent(editor, '<p>a</p>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('Backspace in middle of plain text should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p>ab</p>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('Delete in middle of plain text should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      noopDelete(editor);
      TinyAssertions.assertContent(editor, '<p>ab</p>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('Delete in middle of caret format span should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<span id="_mce_caret" data-mce-bogus="1" data-mce-type="format-caret"><strong>&#65279;</strong></span>b</p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 1 ], 0);
      noopDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
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
                      'data-mce-bogus': str.is('1'),
                      'data-mce-type': str.is('format-caret')
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
                children: [
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1'),
                      'data-mce-type': str.is('format-caret')
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
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
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
                      'data-mce-bogus': str.is('1'),
                      'data-mce-type': str.is('format-caret')
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
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('Backspace before last character in formatted element', () => {
      const editor = hook.editor();
      editor.setContent('<p><em>a</em><strong>b</strong></p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      noopBackspace(editor);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
    });

    it('Delete after last character in formatted element', () => {
      const editor = hook.editor();
      editor.setContent('<p><em>a</em><strong>b</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      noopDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
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
                          'data-mce-bogus': str.is('1'),
                          'data-mce-type': str.is('format-caret')
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
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 0);
    });

    it('Delete before last character in formatted element with sibling in format parent', () => {
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
                          'data-mce-bogus': str.is('1'),
                          'data-mce-type': str.is('format-caret')
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
      TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0, 0 ], 0);
    });

    it('Backspace after last character in formatted element with sibling in format parent and outer single-child format ancestor', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;"><ins><strong><em>a</em></strong>b</ins></span></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 1);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('span', {
                    attrs: {
                      style: str.is('text-decoration: underline;')
                    },
                    children: [
                      s.element('ins', {
                        children: [
                          s.element('span', {
                            attrs: {
                              'id': str.is('_mce_caret'),
                              'data-mce-bogus': str.is('1'),
                              'data-mce-type': str.is('format-caret')
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
              })
            ]
          });
        })
      );
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 0);
    });

    it('Delete before last character in formatted element with sibling in format parent and outer single-child format ancestor', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;"><ins>a<strong><em>b</em></strong></ins></span></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0, 0 ], 0);
      doDelete(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('span', {
                    attrs: {
                      style: str.is('text-decoration: underline;')
                    },
                    children: [
                      s.element('ins', {
                        children: [
                          s.text(str.is('a')),
                          s.element('span', {
                            attrs: {
                              'id': str.is('_mce_caret'),
                              'data-mce-bogus': str.is('1'),
                              'data-mce-type': str.is('format-caret')
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
              })
            ]
          });
        })
      );
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0, 0, 0 ], 0);
    });
  });

  context('TINY-9302: Backspace/delete a selection', () => {
    const browser = PlatformDetection.detect().browser;

    const assertStructureAndSelectionBlockDelete = (editor: Editor) => {
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                // firefox retains formats by default, so no new caret created
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
                                s.element('br', {})
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
                        'data-mce-bogus': str.is('1'),
                        'data-mce-type': str.is('format-caret')
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
      TinyAssertions.assertCursor(editor, selPath, 0);
    };

    it('Backspace entire selection of block containing a single text format element', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 3);
      doBackspace(editor);
      assertStructureAndSelectionBlockDelete(editor);
    });

    it('Delete entire selection of block containing a single text format element', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em><span style="text-decoration: underline;">abc</span></em></strong></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 3);
      doDelete(editor);
      assertStructureAndSelectionBlockDelete(editor);
    });

    it('Backspace entire selection of format element in block', () => {
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
                      'data-mce-bogus': str.is('1'),
                      'data-mce-type': str.is('format-caret')
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
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0, 0, 0 ], 0);
    });

    it('Backspace selection starting at start of and ending after the end of text format element in block', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<strong><em><span style="text-decoration: underline;">bcd</span></em></strong>ef</p>');
      TinySelections.setSelection(editor, [ 0, 1, 0, 0, 0 ], 0, [ 0, 2 ], 'e'.length);
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
                      'data-mce-bogus': str.is('1'),
                      'data-mce-type': str.is('format-caret')
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

    it('Backspace entire selection of text format element in list item', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li><span style="text-decoration: underline;">a</span></li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 'a'.length);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('ul', {
                children: [
                  s.element('li', {
                    children: [
                      s.element('span', {
                        attrs: {
                          'id': str.is('_mce_caret'),
                          'data-mce-bogus': str.is('1'),
                          'data-mce-type': str.is('format-caret')
                        },
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
          });
        }));
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('Backspace selection starting at start of and ending after the end of text format element within list item', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li>a<strong><em><span style="text-decoration: underline;">bcd</span></em></strong>ef</li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0, 0 ], 0, [ 0, 0, 2 ], 'e'.length);
      doBackspace(editor);
      const firstOuterText = browser.isFirefox() ? [ 'a', '' ] : [ 'a' ];
      const secondOuterText = browser.isFirefox() ? [ 'f' ] : [ '', 'f' ];
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('ul', {
                children: [
                  s.element('li', {
                    children: [
                      ...Arr.map(firstOuterText, (text) => s.text(str.is(text))),
                      s.element('span', {
                        attrs: {
                          'id': str.is('_mce_caret'),
                          'data-mce-bogus': str.is('1'),
                          'data-mce-type': str.is('format-caret')
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
              })
            ]
          });
        })
      );
      const selPath = [ 0, 0, browser.isFirefox() ? 2 : 1, 0, 0, 0, 0 ];
      TinyAssertions.assertCursor(editor, selPath, 0);
    });

    it('Backspace entire selection of text format element in table cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><span style="text-decoration: underline;">a</span>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 'a'.length);
      doBackspace(editor);
      const outerText = browser.isFirefox() ? [ ] : [ '' ];
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('table', {
                children: [
                  s.element('tbody', {
                    children: [
                      s.element('tr', {
                        children: [
                          s.element('td', {
                            children: [
                              ...Arr.map(outerText, (text) => s.text(str.is(text))),
                              s.element('span', {
                                attrs: {
                                  'id': str.is('_mce_caret'),
                                  'data-mce-bogus': str.is('1'),
                                  'data-mce-type': str.is('format-caret')
                                },
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
                              }),
                              s.text(str.is('b'))
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
      const selPath = browser.isFirefox() ? [ 0, 0, 0, 0, 0, 0, 0 ] : [ 0, 0, 0, 0, 1, 0, 0 ];
      TinyAssertions.assertCursor(editor, selPath, 0);
    });

    it('Backspace selection starting at start of and ending after the end of text format element in table cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><span style="text-decoration: underline;">a</span>bc</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1 ], 'b'.length);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('table', {
                children: [
                  s.element('tbody', {
                    children: [
                      s.element('tr', {
                        children: [
                          s.element('td', {
                            children: [
                              s.text(str.is('')),
                              s.element('span', {
                                attrs: {
                                  'id': str.is('_mce_caret'),
                                  'data-mce-bogus': str.is('1'),
                                  'data-mce-type': str.is('format-caret')
                                },
                                children: [
                                  s.element('span', {
                                    attrs: {
                                      style: str.is('text-decoration: underline;')
                                    }
                                  })
                                ]
                              }),
                              s.text(str.is('c'))
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
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 1, 0, 0 ], 0);
    });

    it('Backspace entire selection of format element containing non-text child', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;">a<img src="about:blank" />b</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 2 ], 'b'.length);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                // firefox retains formats by default, so no new caret created
                children: browser.isFirefox()
                  ? [
                    s.element('span', {
                      attrs: {
                        style: str.is('text-decoration: underline;')
                      },
                      children: [
                        s.element('br', {})
                      ]
                    })
                  ] : [
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1'),
                        'data-mce-type': str.is('format-caret')
                      },
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
          });
        }));
      const selPath = browser.isFirefox() ? [ 0, 0 ] : [ 0, 0, 0, 0 ];
      TinyAssertions.assertCursor(editor, selPath, 0);
    });

    it('Backspace selection starting at start of and ending after the end of format element containing non-text child', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;">a<img src="about:blank" />b</span>cd</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1 ], 'c'.length);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('')),
                  s.element('span', {
                    attrs: {
                      'id': str.is('_mce_caret'),
                      'data-mce-bogus': str.is('1'),
                      'data-mce-type': str.is('format-caret')
                    },
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
                  }),
                  s.text(str.is('d'))
                ]
              })
            ]
          });
        }));
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
    });

    it('Backspace entire selection of text format element containing multiple children', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;">a<em><strong>b</strong></em></span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 'b'.length);
      doBackspace(editor);
      TinyAssertions.assertContentStructure(editor,
        ApproxStructure.build((s, str, _arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                // firefox retains formats by default, so no new caret created
                children: browser.isFirefox()
                  ? [
                    s.element('span', {
                      attrs: {
                        style: str.is('text-decoration: underline;')
                      },
                      children: [
                        s.element('br', {})
                      ]
                    })
                  ]
                  : [
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1'),
                        'data-mce-type': str.is('format-caret')
                      },
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
          });
        })
      );
      const selPath = browser.isFirefox() ? [ 0, 0 ] : [ 0, 0, 0, 0 ];
      TinyAssertions.assertCursor(editor, selPath, 0);
    });

    it('Backspace partial selection from start to middle of text format element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'ab'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">abc</span></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'ab'.length);
    });

    it('Backspace partial selection from middle to end of text format element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'a'.length, [ 0, 0, 0 ], 'bc'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">abc</span></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 'a'.length, [ 0, 0, 0 ], 'bc'.length);
    });

    it('Backspace partial selection between start and end of text format element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'a'.length, [ 0, 0, 0 ], 'b'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">abc</span></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 'a'.length, [ 0, 0, 0 ], 'b'.length);
    });

    it('Backspace partial selection from middle to after end of text format element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em>abc</em></strong></p><p>d</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 'a'.length, [ 1, 0 ], 'd'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p><strong><em>abc</em></strong></p><p>d</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 'a'.length, [ 1, 0 ], 'd'.length);
    });

    it('Backspace unformatted text selection should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'ab'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p>abc</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'ab'.length);
    });

    it('Backspace inline text selection containing text format element starting from non-format element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<span style="text-decoration: underline;">b</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 0 ], 'b'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p>a<span style="text-decoration: underline;">b</span></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 1, 0 ], 'b'.length);
    });

    it('Backspace text selection across blocks containing text format element starting from non-format element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p><span style="text-decoration: underline;">b</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0 ], 'b'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p>a</p><p><span style="text-decoration: underline;">b</span></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0 ], 'b'.length);
    });

    it('Backspace selection starting from non-text node within format element should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="text-decoration: underline;"><img src="about:blank">a</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0, 1 ], 'a'.length);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;"><img src="about:blank">a</span></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0, 1 ], 'a'.length);
    });
  });

  context('Interactions with other elements', () => {
    it('TINY-9807: If placed between two images the inline format should do nothing', () => {
      const editor = hook.editor();
      editor.setContent('<p><img id="one" src="about:blank"><img id="two" src="about:blank"></p>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      doBackspace(editor, false);
      TinyAssertions.assertContent(editor, '<p><img id="one" src="about:blank"><img id="two" src="about:blank"></p>');
      TinyAssertions.assertCursor(editor, [ 0 ], 1);
    });
  });
});
