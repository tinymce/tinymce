asynctest(
  'browser.tinymce.core.delete.InlineFormatDelete',
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
    'tinymce.core.delete.InlineFormatDelete',
    'tinymce.core.text.Zwsp',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Element, InlineFormatDelete, Zwsp, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sDelete = function (editor) {
      return Step.sync(function () {
        var returnVal = InlineFormatDelete.backspaceDelete(editor, true);
        Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
      });
    };

    var sDeleteNoop = function (editor) {
      return Step.sync(function () {
        var returnVal = InlineFormatDelete.backspaceDelete(editor, true);
        Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
      });
    };

    var sBackspace = function (editor, forward) {
      return Step.sync(function () {
        var returnVal = InlineFormatDelete.backspaceDelete(editor, false);
        Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
      });
    };

    var sBackspaceNoop = function (editor, forward) {
      return Step.sync(function () {
        var returnVal = InlineFormatDelete.backspaceDelete(editor, false);
        Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Backspace/delete in unformatted plain text', GeneralSteps.sequence([
          Logger.t('Backspace after plain text should do nothing', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>a</p>'),
            tinyApis.sSetCursor([0, 0], 1),
            sBackspaceNoop(editor),
            tinyApis.sAssertContent('<p>a</p>'),
            tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
          ])),
          Logger.t('Delete before plain text should do nothing', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>a</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sDeleteNoop(editor),
            tinyApis.sAssertContent('<p>a</p>'),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
          ])),
          Logger.t('Backspace in middle of plain text should do nothing', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>ab</p>'),
            tinyApis.sSetCursor([0, 0], 1),
            sBackspaceNoop(editor),
            tinyApis.sAssertContent('<p>ab</p>'),
            tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
          ])),
          Logger.t('Delete in middle of plain text should do nothing', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>ab</p>'),
            tinyApis.sSetCursor([0, 0], 1),
            sDeleteNoop(editor),
            tinyApis.sAssertContent('<p>ab</p>'),
            tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
          ]))
        ])),
        Logger.t('Backspace/delete in at last character', GeneralSteps.sequence([
          Logger.t('Backspace after last character in formatted element', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><strong><em>a</em></strong></p>'),
            tinyApis.sSetCursor([0, 0, 0, 0], 1),
            sBackspace(editor),
            tinyApis.sAssertContentStructure(
              ApproxStructure.build(function (s, str, arr) {
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
            ),
            tinyApis.sAssertSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0)
          ])),
          Logger.t('Delete before last character in formatted element', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><strong><em>a</em></strong></p>'),
            tinyApis.sSetCursor([0, 0, 0, 0], 0),
            sDelete(editor),
            tinyApis.sAssertContentStructure(
              ApproxStructure.build(function (s, str, arr) {
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
            ),
            tinyApis.sAssertSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0)
          ])),
          Logger.t('Backspace before last character in formatted element', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><em>a</em><strong>b</strong></p>'),
            tinyApis.sSetCursor([0, 1, 0], 0),
            sBackspaceNoop(editor),
            tinyApis.sAssertSelection([0, 1, 0], 0, [0, 1, 0], 0)
          ])),
          Logger.t('Delete after last character in formatted element', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><em>a</em><strong>b</strong></p>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            sDeleteNoop(editor),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
          ])),
          Logger.t('Backspace after last character in formatted element with sibling in format parent', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><ins><strong><em>a</em></strong>b</ins></p>'),
            tinyApis.sSetCursor([0, 0, 0, 0, 0], 1),
            sBackspace(editor),
            tinyApis.sAssertContentStructure(
              ApproxStructure.build(function (s, str, arr) {
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
            ),
            tinyApis.sAssertSelection([0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0, 0], 0)
          ])),
          Logger.t('Delete after last character in formatted element with sibling in format parent', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><ins>a<strong><em>b</em></strong></ins></p>'),
            tinyApis.sSetCursor([0, 0, 1, 0, 0], 0),
            sDelete(editor),
            tinyApis.sAssertContentStructure(
              ApproxStructure.build(function (s, str, arr) {
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
            ),
            tinyApis.sAssertSelection([0, 0, 1, 0, 0, 0], 0, [0, 0, 1, 0, 0, 0], 0)
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      indent: false
    }, success, failure);
  }
);