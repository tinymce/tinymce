import { ApproxStructure, GeneralSteps, Keyboard, Keys, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.CefDeleteTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sKeyUp = function (editor, key) {
    const iDoc = Element.fromDom(editor.getDoc());
    return Keyboard.sKeyup(iDoc, key, {});
  };

  const sFakeBackspaceKeyOnRange = function (editor) {
    return GeneralSteps.sequence([
      Step.sync(function () {
        editor.getDoc().execCommand('Delete', false, null);
      }),
      sKeyUp(editor, Keys.backspace())
    ]);
  };

  const sTestDeletePadd = function (editor, tinyApis, tinyActions) {
    return GeneralSteps.sequence([
      tinyApis.sFocus,
      Logger.t('Should padd empty ce=true inside ce=false when everything is deleted', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a<p contenteditable="true">a</p>b</div>'),
        tinyApis.sSetSelection([1, 1, 0], 0, [1, 1, 0], 1),
        sFakeBackspaceKeyOnRange(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('div', {
                  children: [
                    s.text(str.is('a')),
                    s.element('p', {
                      children: [
                        s.element('br', {
                          attrs: {
                            'data-mce-bogus': str.is('1')
                          }
                        })
                      ]
                    }),
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should not padd an non empty ce=true inside ce=false', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a<p contenteditable="true">ab</p>b</div>'),
        tinyApis.sSetSelection([1, 1, 0], 0, [1, 1, 0], 1),
        sFakeBackspaceKeyOnRange(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('div', {
                  children: [
                    s.text(str.is('a')),
                    s.element('p', {
                      children: [
                        s.text(str.is('b'))
                      ]
                    }),
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should padd editor with paragraph and br if the editor is empty after delete of a cef element', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a</div>'),
        tinyApis.sSetSelection([], 1, [], 2),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0], 0, [0], 0),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('br', {
                      attrs: {
                        'data-mce-bogus': str.is('1')
                      }
                    })
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should padd editor with empty paragraph if we delete last element', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a</div>'),
        tinyApis.sSetSelection([], 2, [], 2),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0], 0, [0], 0),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('br', {
                      attrs: {
                        'data-mce-bogus': str.is('1')
                      }
                    })
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should remove fake caret if we delete block cef', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false">a</div><p>b</p>'),
        tinyApis.sSetSelection([], 2, [], 2),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        )
      ]))
    ]);
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      sTestDeletePadd(editor, tinyApis, tinyActions)
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
