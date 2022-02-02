import { ApproxStructure, Assertions, Mouse, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as CaretFormat from 'tinymce/core/fmt/CaretFormat';
import { getParentCaretContainer, isCaretNode } from 'tinymce/core/fmt/FormatContainer';
import { FormatVars } from 'tinymce/core/fmt/FormatTypes';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.fmt.CaretFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    formats: {
      formatpainter_removeformat: [
        {
          selector: 'b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins',
          remove: 'all', split: true, expand: false, block_expand: true, deep: true
        },
        { selector: 'span', attributes: [ 'style', 'class' ], remove: 'empty', split: true, expand: false, deep: true },
        { selector: '*:not(tr,td,th,table)', attributes: [ 'style', 'class' ], split: false, expand: false, deep: true }
      ]
    }
  }, [ Theme ], true);

  const applyCaretFormat = (editor: Editor, name: string, vars: FormatVars) => {
    CaretFormat.applyCaretFormat(editor, name, vars);
  };

  const removeCaretFormat = (editor: Editor, name: string, vars: FormatVars, similar?: boolean) => {
    CaretFormat.removeCaretFormat(editor, name, vars, similar);
  };

  const assertNormalizedContentStructure = (editor: Editor, expected: StructAssert) => {
    const rawBody = editor.getBody().cloneNode(true);
    rawBody.normalize();

    Assertions.assertStructure(
      'Asserting the normalized structure of tiny content.',
      expected,
      SugarElement.fromDom(rawBody)
    );
  };

  it('Apply bold to caret and type bold text after the unformatted text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    applyCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p>a<strong>x</strong></p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
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
                      s.text(str.is(Zwsp.ZWSP + 'x'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2);
  });

  it('Apply bold to caret in middle of a word', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    applyCaretFormat(editor, 'bold', {});
    TinyAssertions.assertContent(editor, '<p><strong>ab</strong></p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [ s.element('strong', { children: [ s.text(str.is('ab')) ] }) ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });

  it('Remove bold from caret and type after the bold text', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    removeCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p><strong>a</strong>x</p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('strong', {
                children: [
                  s.text(str.is('a'))
                ]
              }),
              s.element('span', {
                attrs: {
                  'id': str.is('_mce_caret'),
                  'data-mce-bogus': str.is('1')
                },
                children: [
                  s.text(str.is(Zwsp.ZWSP + 'x'))
                ]
              })
            ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2);
  });

  it('Remove bold from caret in the middle of a bold word', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>ab</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    removeCaretFormat(editor, 'bold', {});
    TinyAssertions.assertContent(editor, '<p>ab</p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [ s.text(str.is('ab')) ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Toggle bold format on and off and type after unformatted text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    applyCaretFormat(editor, 'bold', {});
    removeCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p>ax</p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.element('span', {
                children: [
                  s.text(str.is(Zwsp.ZWSP + 'x'))
                ]
              })
            ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2);
  });

  it('Toggle bold format off and on and type after bold text', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    removeCaretFormat(editor, 'bold', {});
    applyCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p><strong>a</strong><strong>x</strong></p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('strong', { children: [ s.text(str.is('a')) ] }),
              s.element('span', {
                attrs: {
                  'id': str.is('_mce_caret'),
                  'data-mce-bogus': str.is('1')
                },
                children: [
                  s.element('strong', {
                    children: [
                      s.text(str.is(Zwsp.ZWSP + 'x'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2);
  });

  it('Apply bold format to the end of text and with trailing br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    applyCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p>a<strong>x</strong></p>');
    assertNormalizedContentStructure(editor, ApproxStructure.build((s, str) => {
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
                      s.text(str.is(Zwsp.ZWSP + 'x'))
                    ]
                  })
                ]
              }),
              s.element('br', {})
            ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2);
  });

  it('Remove bold format from word with trailing br', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a<br></strong></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    removeCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p><strong>a</strong>x</p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('strong', { children: [ s.text(str.is('a')) ] }),
              s.element('span', {
                attrs: {
                  'id': str.is('_mce_caret'),
                  'data-mce-bogus': str.is('1')
                },
                children: [ s.text(str.is(Zwsp.ZWSP + 'x')) ]
              })
            ]
          })
        ]
      });
    }));
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2);
  });

  it('Remove bold format from empty paragraph and move selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p><strong><br></strong></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    removeCaretFormat(editor, 'bold', {});
    TinyAssertions.assertContent(editor, '<p>a</p>\n<p>&nbsp;</p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [ s.text(str.is('a')) ]
          }),
          s.element('p', {
            children: [
              s.element('span', {
                attrs: {
                  'id': str.is('_mce_caret'),
                  'data-mce-bogus': str.is('1')
                },
                children: [
                  s.text(str.is(Zwsp.ZWSP))
                ]
              })
            ]
          })
        ]
      });
    }));
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p>ax</p>\n<p>&nbsp;</p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [ s.text(str.is('ax')) ]
          }),
          s.element('p', {
            children: [
              s.element('br', {})
            ]
          })
        ]
      });
    }));
  });

  it('Apply bold to caret, type bold text, unbold and type text, then apply a ranged selection', () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    applyCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'Hello');
    TinyAssertions.assertContent(editor, '<p><strong>Hello</strong></p>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 6, [ 0, 0, 0, 0 ], 6);
    removeCaretFormat(editor, 'bold', {});
    TinyContentActions.type(editor, 'world');
    TinyAssertions.assertContent(editor, '<p><strong>Hello</strong>world</p>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 6, [ 0, 1, 0 ], 6);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) =>
      s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('strong', { children: [ s.text(str.is('Hello')) ] }),
              s.element('span', {
                attrs: {
                  'id': str.is('_mce_caret'),
                  'data-mce-bogus': str.is('1')
                },
                children: [ s.text(str.is(Zwsp.ZWSP + 'world')) ]
              }),
              s.element('br', {})
            ]
          })
        ]
      })
    ));
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 1, 0 ], 3);
    Mouse.trueClickOn(TinyDom.body(editor), '#_mce_caret');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) =>
      s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('strong', { children: [ s.text(str.is('Hello')) ] }),
              s.text(str.is('world')),
              s.element('br', {})
            ]
          })
        ]
      })
    ));
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 2, [ 0, 1 ], 2);
  });

  it('isCaretNode', () => {
    const editor = hook.editor();
    assert.isFalse(isCaretNode(editor.dom.create('b')), 'Should be false since it is not a caret node');
    assert.isTrue(isCaretNode(editor.dom.create('span', { id: '_mce_caret' })), 'Should be true since it is a caret node');
  });

  it(`Apply some format to the empty editor and make sure that the content didn't mutate after serialization (TINY-1288)`, () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    editor.execCommand('fontname', false, 'Arial');
    TinyAssertions.assertContent(editor, '');
    assertNormalizedContentStructure(editor, ApproxStructure.build((s, str) => {
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
                  s.element('span', {
                    attrs: {
                      'style': str.is('font-family: Arial;'),
                      'data-mce-bogus': str.none('1') // shouldn't be set
                    },
                    children: [
                      s.text(str.is(Zwsp.ZWSP))
                    ]
                  })
                ]
              }),
              s.element('br', {})
            ]
          })
        ]
      });
    }));
  });

  it('getParentCaretContainer', () => {
    const body = SugarElement.fromHtml('<div><span id="_mce_caret">a</span></div>');
    const caret = SugarElement.fromDom(body.dom.firstChild);

    Assertions.assertDomEq('Should be caret element on child', caret, SugarElement.fromDom(getParentCaretContainer(body.dom, caret.dom.firstChild)));
    Assertions.assertDomEq('Should be caret element on self', caret, SugarElement.fromDom(getParentCaretContainer(body.dom, caret.dom)));
    assert.isNull(getParentCaretContainer(body.dom, SugarElement.fromTag('span').dom), 'Should not be caret element');
    assert.isNull(getParentCaretContainer(caret.dom, caret.dom), 'Should not be caret element');
  });

  it('replaceWithCaretFormat', () => {
    const body = SugarElement.fromHtml('<div><br /></div>');
    const formats = [
      SugarElement.fromTag('b').dom,
      SugarElement.fromTag('i').dom
    ];

    const pos = CaretFormat.replaceWithCaretFormat(body.dom.firstChild, formats);

    assert.equal(pos.offset(), 0, 'Should be at first offset');
    assert.equal((pos.container() as Text).data, Zwsp.ZWSP, 'Should the zwsp text node');

    Assertions.assertStructure(
      'Asserting the normalized structure of tiny content.',
      ApproxStructure.build((s, str) => {
        return s.element('div', {
          children: [
            s.element('span', {
              attrs: {
                'id': str.is('_mce_caret'),
                'data-mce-bogus': str.is('1')
              },
              children: [
                s.element('i', {
                  children: [
                    s.element('b', {
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
      }),
      body
    );
  });

  it('isFormatElement', () => {
    const editor = hook.editor();
    assert.isTrue(CaretFormat.isFormatElement(editor, SugarElement.fromTag('b')), 'Should be format element');
    assert.isTrue(CaretFormat.isFormatElement(editor, SugarElement.fromTag('i')), 'Should be format element');
    assert.isTrue(CaretFormat.isFormatElement(editor, SugarElement.fromTag('u')), 'Should be format element');
    assert.isTrue(CaretFormat.isFormatElement(editor, SugarElement.fromTag('span')), 'Should be format element');
    assert.isFalse(CaretFormat.isFormatElement(editor, SugarElement.fromTag('p')), 'Should not be format element');
    assert.isFalse(CaretFormat.isFormatElement(editor, SugarElement.fromTag('div')), 'Should not be format element');
    assert.isFalse(CaretFormat.isFormatElement(editor, SugarElement.fromHtml('<a href="#"></a>')), 'Should not be format element');
    assert.isFalse(CaretFormat.isFormatElement(editor, SugarElement.fromHtml('<span data-mce-bogus="1"></span>')), 'Should not be format element');
    assert.isFalse(CaretFormat.isFormatElement(editor, SugarElement.fromHtml('<span id="_mce_caret"></span>')), 'Should not be format element');
  });

  it('Remove single format on multiple format span (End of line) (TINY-1170)', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline; font-size: 18px;">a</span></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    removeCaretFormat(editor, 'underline', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline; font-size: 18px;">a</span><span style="font-size: 18px;">x</span></p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', { children: [ s.text(str.is('a')) ] }),
            s.element('span', {
              attrs: {
                'id': str.is('_mce_caret'),
                'data-mce-bogus': str.is('1')
              },
              children: [
                s.element('span', {
                  styles: { 'font-size': str.is('18px') },
                  children: [ s.text(str.is(Zwsp.ZWSP + 'x')) ]
                })
              ]
            })
          ]
        })
      ]
    })));
    TinyAssertions.assertSelection(editor, [ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2);
  });

  it('Remove single format on multiple format span (Empty line) (TINY-1170)', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline; font-size: 18px;"><br></span></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    removeCaretFormat(editor, 'underline', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p><span style="font-size: 18px;">x</span></p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              attrs: {
                'id': str.is('_mce_caret'),
                'data-mce-bogus': str.is('1')
              },
              children: [
                s.element('span', {
                  styles: { 'font-size': str.is('18px') },
                  children: [ s.text(str.is(Zwsp.ZWSP + 'x')) ]
                })
              ]
            })
          ]
        })
      ]
    })));
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 2, [ 0, 0, 0, 0 ], 2);
  });

  it('Remove text decoration format on text color, text decoration span (Empty line) (TINY-1170)', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline;"><span style="color: red; text-decoration: underline;"><br></span></span></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    removeCaretFormat(editor, 'underline', {});
    TinyContentActions.type(editor, 'x');
    TinyAssertions.assertContent(editor, '<p><span style="color: red;">x</span></p>');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              attrs: {
                'id': str.is('_mce_caret'),
                'data-mce-bogus': str.is('1')
              },
              children: [
                s.element('span', {
                  styles: { color: str.is('red') },
                  children: [ s.text(str.is(Zwsp.ZWSP + 'x')) ]
                })
              ]
            })
          ]
        })
      ]
    })));
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 2, [ 0, 0, 0, 0 ], 2);
  });
});
