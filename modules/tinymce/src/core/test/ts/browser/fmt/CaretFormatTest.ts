import { ApproxStructure, Assertions, GeneralSteps, Logger, Mouse, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Text } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import * as CaretFormat from 'tinymce/core/fmt/CaretFormat';
import { getParentCaretContainer, isCaretNode } from 'tinymce/core/fmt/FormatContainer';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';
import * as TypeText from '../../module/test/TypeText';

UnitTest.asynctest('browser.tinymce.core.fmt.CaretFormatTest', function (success, failure) {

  Theme();

  const sApplyCaretFormat = function (editor, name, vars) {
    return Step.sync(function () {
      CaretFormat.applyCaretFormat(editor, name, vars);
    });
  };

  const sRemoveCaretFormat = function (editor, name, vars, similar?) {
    return Step.sync(function () {
      CaretFormat.removeCaretFormat(editor, name, vars, similar);
    });
  };

  const sAssertNormalizedContentStructure = function (editor, expected) {
    return Step.sync(function () {
      const rawBody = editor.getBody().cloneNode(true);
      rawBody.normalize();

      Assertions.assertStructure(
        'Asserting the normalized structure of tiny content.',
        expected,
        Element.fromDom(rawBody)
      );
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Logger.t('Apply bold to caret and type bold text after the unformatted text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sApplyCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p>a<strong>x</strong></p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
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
        })),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2)
      ])),
      Logger.t('Apply bold to caret in middle of a word', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>ab</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sApplyCaretFormat(editor, 'bold', {}),
        tinyApis.sAssertContent('<p><strong>ab</strong></p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [ s.element('strong', { children: [ s.text(str.is('ab')) ] }) ]
              })
            ]
          });
        })),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1)
      ])),
      Logger.t('Remove bold from caret and type after the bold text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><strong>a</strong></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 1),
        sRemoveCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p><strong>a</strong>x</p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
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
        })),
        tinyApis.sAssertSelection([ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2)
      ])),
      Logger.t('Remove bold from caret in the middle of a bold word', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><strong>ab</strong></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 1),
        sRemoveCaretFormat(editor, 'bold', {}),
        tinyApis.sAssertContent('<p>ab</p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [ s.text(str.is('ab')) ]
              })
            ]
          });
        })),
        tinyApis.sAssertSelection([ 0, 0 ], 1, [ 0, 0 ], 1)
      ])),
      Logger.t('Toggle bold format on and off and type after unformatted text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sApplyCaretFormat(editor, 'bold', {}),
        sRemoveCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p>ax</p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
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
        })),
        tinyApis.sAssertSelection([ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2)
      ])),
      Logger.t('Toggle bold format off and on and type after bold text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><strong>a</strong></p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sRemoveCaretFormat(editor, 'bold', {}),
        sApplyCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p><strong>a</strong><strong>x</strong></p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
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
        })),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2)
      ])),
      Logger.t('Apply bold format to the end of text and with trailing br', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p>a<br></p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sApplyCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p>a<strong>x</strong></p>'),
        sAssertNormalizedContentStructure(editor, ApproxStructure.build(function (s, str) {
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
        })),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2)
      ])),
      Logger.t('Remove bold format from word with trailing br', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><strong>a<br></strong></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 1),
        sRemoveCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p><strong>a</strong>x</p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
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
        })),
        tinyApis.sAssertSelection([ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2)
      ])),
      Logger.t('Remove bold format from empty paragraph and move selection', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p>a</p><p><strong><br></strong></p>'),
        tinyApis.sSetCursor([ 1, 0, 0 ], 0),
        sRemoveCaretFormat(editor, 'bold', {}),
        tinyApis.sAssertContent('<p>a</p>\n<p>&nbsp;</p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
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
        })),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p>ax</p>\n<p>&nbsp;</p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
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
        }))
      ])),
      Logger.t('Apply bold to caret, type bold text, unbold and type text, then apply a ranged selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p></p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sApplyCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'Hello'),
        tinyApis.sAssertContent('<p><strong>Hello</strong></p>'),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 6, [ 0, 0, 0, 0 ], 6),
        sRemoveCaretFormat(editor, 'bold', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'world'),
        tinyApis.sAssertContent('<p><strong>Hello</strong>world</p>'),
        tinyApis.sAssertSelection([ 0, 1, 0 ], 6, [ 0, 1, 0 ], 6),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) =>
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
        )),
        tinyApis.sSetSelection([ 0, 0, 0 ], 2, [ 0, 1, 0 ], 3),
        Mouse.sTrueClickOn(Element.fromDom(editor.getBody()), '#_mce_caret'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) =>
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
        )),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 2, [ 0, 1 ], 2)
      ])),
      Logger.t('isCaretNode', Step.sync(function () {
        Assertions.assertEq('Should be false since it is not a caret node', false, isCaretNode(editor.dom.create('b')));
        Assertions.assertEq('Should be true since it is a caret node', true, isCaretNode(editor.dom.create('span', { id: '_mce_caret' })));
      })),
      Logger.t(`Apply some format to the empty editor and make sure that the content didn't mutate after serialization (TINY-1288)`, GeneralSteps.sequence([
        tinyApis.sSetContent(''),
        tinyApis.sSetCursor([ 0 ], 0),
        tinyApis.sExecCommand('fontname', 'Arial'),
        tinyApis.sAssertContent(''),
        sAssertNormalizedContentStructure(editor, ApproxStructure.build(function (s, str) {
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
        }))
      ])),
      Logger.t('getParentCaretContainer', Step.sync(function () {
        const body = Element.fromHtml('<div><span id="_mce_caret">a</span></div>');
        const caret = Element.fromDom(body.dom().firstChild);

        Assertions.assertDomEq('Should be caret element on child', caret, Element.fromDom(getParentCaretContainer(body.dom(), caret.dom().firstChild)));
        Assertions.assertDomEq('Should be caret element on self', caret, Element.fromDom(getParentCaretContainer(body.dom(), caret.dom())));
        Assertions.assertEq('Should not be caret element', null, getParentCaretContainer(body.dom(), Element.fromTag('span').dom()));
        Assertions.assertEq('Should not be caret element', null, getParentCaretContainer(caret.dom(), caret.dom()));
      })),
      Logger.t('replaceWithCaretFormat', Step.sync(function () {
        const body = Element.fromHtml('<div><br /></div>');
        const formats = [
          Element.fromTag('b').dom(),
          Element.fromTag('i').dom()
        ];

        const pos = CaretFormat.replaceWithCaretFormat(body.dom().firstChild, formats);

        Assertions.assertEq('Should be at first offset', 0, pos.offset());
        Assertions.assertEq('Should the zwsp text node', Zwsp.ZWSP, (<Text> pos.container()).data);

        Assertions.assertStructure(
          'Asserting the normalized structure of tiny content.',
          ApproxStructure.build(function (s, str) {
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
      })),
      Logger.t('isFormatElement', Step.sync(function () {
        Assertions.assertEq('Should be format element', true, CaretFormat.isFormatElement(editor, Element.fromTag('b')));
        Assertions.assertEq('Should be format element', true, CaretFormat.isFormatElement(editor, Element.fromTag('i')));
        Assertions.assertEq('Should be format element', true, CaretFormat.isFormatElement(editor, Element.fromTag('u')));
        Assertions.assertEq('Should be format element', true, CaretFormat.isFormatElement(editor, Element.fromTag('span')));
        Assertions.assertEq('Should not be format element', false, CaretFormat.isFormatElement(editor, Element.fromTag('p')));
        Assertions.assertEq('Should not be format element', false, CaretFormat.isFormatElement(editor, Element.fromTag('div')));
        Assertions.assertEq('Should not be format element', false, CaretFormat.isFormatElement(editor, Element.fromHtml('<a href="#"></a>')));
        Assertions.assertEq('Should not be format element', false, CaretFormat.isFormatElement(editor, Element.fromHtml('<span data-mce-bogus="1"></span>')));
        Assertions.assertEq('Should not be format element', false, CaretFormat.isFormatElement(editor, Element.fromHtml('<span id="_mce_caret"></span>')));
      })),
      Logger.t('Remove single format on multiple format span (End of line) (TINY-1170)', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span style="text-decoration: underline; font-size: 18px;">a</span></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 1),
        sRemoveCaretFormat(editor, 'underline', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p><span style="text-decoration: underline; font-size: 18px;">a</span><span style="font-size: 18px;">x</span></p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) => s.element('body', {
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
        }))),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 2, [ 0, 1, 0, 0 ], 2)
      ])),
      Logger.t('Remove single format on multiple format span (Empty line) (TINY-1170)', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span style="text-decoration: underline; font-size: 18px;"><br></span></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        sRemoveCaretFormat(editor, 'underline', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p><span style="font-size: 18px;">x</span></p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) => s.element('body', {
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
        }))),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 2, [ 0, 0, 0, 0 ], 2)
      ])),
      Logger.t('Remove text decoration format on text color, text decoration span (Empty line) (TINY-1170)', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span style="text-decoration: underline;"><span style="color: red; text-decoration: underline;"><br></span></span></p>'),
        tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
        sRemoveCaretFormat(editor, 'underline', {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
        tinyApis.sAssertContent('<p><span style="color: red;">x</span></p>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) => s.element('body', {
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
        }))),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 2, [ 0, 0, 0, 0 ], 2)
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: '',
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
  }, success, failure);
});
