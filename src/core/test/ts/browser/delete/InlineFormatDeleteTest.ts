import { ApproxStructure, Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import InlineFormatDelete from 'tinymce/core/delete/InlineFormatDelete';
import Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.InlineFormatDelete', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sDelete = function (editor) {
    return Step.sync(function () {
      const returnVal = InlineFormatDelete.backspaceDelete(editor, true);
      Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
    });
  };

  const sDeleteNoop = function (editor) {
    return Step.sync(function () {
      const returnVal = InlineFormatDelete.backspaceDelete(editor, true);
      Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
    });
  };

  const sBackspace = function (editor, forward?) {
    return Step.sync(function () {
      const returnVal = InlineFormatDelete.backspaceDelete(editor, false);
      Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
    });
  };

  const sBackspaceNoop = function (editor, forward?) {
    return Step.sync(function () {
      const returnVal = InlineFormatDelete.backspaceDelete(editor, false);
      Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

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
        ])),
        Logger.t('Delete in middle of caret format span should do nothing', GeneralSteps.sequence([
          tinyApis.sSetRawContent('<p>a<span id="_mce_caret" data-mce-bogus="1" data-mce-type="format-caret"><strong>&#65279;</strong></span>b</p>'),
          tinyApis.sSetCursor([0, 1], 0),
          sDeleteNoop(editor),
          tinyApis.sAssertSelection([0, 1], 0, [0, 1], 0),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
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
                      s.text(str.is('b')),
                    ]
                  })
                ]
              });
            })
          )
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
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, success, failure);
});
