asynctest(
  'browser.tinymce.core.fmt.CaretFormatTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.core.fmt.CaretFormat',
    'tinymce.core.test.TypeText',
    'tinymce.core.text.Zwsp',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Element, CaretFormat, TypeText, Zwsp, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    var sApplyCaretFormat = function (editor, name, vars) {
      return Step.sync(function () {
        CaretFormat.applyCaretFormat(editor, name, vars);
      });
    };

    var sRemoveCaretFormat = function (editor, name, vars, similar) {
      return Step.sync(function () {
        CaretFormat.removeCaretFormat(editor, name, vars, similar);
      });
    };

    var sSetRawContent = function (editor, html) {
      return Step.sync(function () {
        editor.getBody().innerHTML = html;
      });
    };

    var sAssertNormalizedContentStructure = function (editor, expected) {
      return Step.sync(function () {
        var rawBody = editor.getBody().cloneNode(true);
        rawBody.normalize();

        Assertions.assertStructure(
          'Asserting the normalized structure of tiny content.',
          expected,
          Element.fromDom(rawBody)
        );
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Apply bold to caret and type bold text after the unformatted text', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
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
          tinyApis.sAssertSelection([0, 1, 0, 0], 2, [0, 1, 0, 0], 2)
        ])),
        Logger.t('Apply bold to caret in middle of a word', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>ab</p>'),
          tinyApis.sSetCursor([0, 0], 1),
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
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
        Logger.t('Remove bold from caret and type after the bold text', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>a</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 1),
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
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2)
        ])),
        Logger.t('Remove bold from caret in the middle of a bold word', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>ab</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 1),
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
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Toggle bold format on and off and type after unformatted text', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
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
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2)
        ])),
        Logger.t('Toggle bold format off and on and type after bold text', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>a</strong></p>'),
          tinyApis.sSetCursor([0, 0], 1),
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
          tinyApis.sAssertSelection([0, 1, 0, 0], 2, [0, 1, 0, 0], 2)
        ])),
        Logger.t('Apply bold format to the end of text and with trailing br', GeneralSteps.sequence([
          sSetRawContent(editor, '<p>a<br></p>'),
          tinyApis.sSetCursor([0, 0], 1),
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
          tinyApis.sAssertSelection([0, 1, 0, 0], 2, [0, 1, 0, 0], 2)
        ])),
        Logger.t('Remove bold format from word with trailing br', GeneralSteps.sequence([
          sSetRawContent(editor, '<p><strong>a<br></strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 1),
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
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2)
        ])),
        Logger.t('Remove bold format from empty paragraph and move selection', GeneralSteps.sequence([
          sSetRawContent(editor, '<p>a</p><p><strong><br></strong></p>'),
          tinyApis.sSetCursor([1, 0, 0], 0),
          sRemoveCaretFormat(editor, 'bold', {}),
          tinyApis.sAssertContent('<p>a</p>\n<p>&nbsp;</p>'),
          tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [s.text(str.is('a')) ]
                }),
                s.element('p', {
                  children: [
                    s.element('span', {
                      attrs: {
                        'id': str.is('_mce_caret'),
                        'data-mce-bogus': str.is('1')
                      },
                      children: [
                        s.element('br', {})
                      ]
                    })
                  ]
                })
              ]
            });
          })),
          tinyApis.sSetCursor([0, 0], 1),
          TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'x'),
          tinyApis.sAssertContent('<p>ax</p>\n<p>&nbsp;</p>'),
          tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [s.text(str.is('ax')) ]
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
        Logger.t('isCaretNode', Step.sync(function () {
          Assertions.assertEq('Should be false since it is not a caret node', false, CaretFormat.isCaretNode(editor.dom.create('b')));
          Assertions.assertEq('Should be false since it ia caret node', true, CaretFormat.isCaretNode(editor.dom.create('span', { id: '_mce_caret' })));
        }))
      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);