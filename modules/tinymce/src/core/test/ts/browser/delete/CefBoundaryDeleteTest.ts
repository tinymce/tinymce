import { ApproxStructure, GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import Zwsp from 'tinymce/core/text/Zwsp';

UnitTest.asynctest('browser.tinymce.core.delete.CefBoundaryDeleteTest',  (success, failure) => {
  Theme();

  const sTestDelete = function (editor, tinyApis, tinyActions) {
    return GeneralSteps.sequence([
      tinyApis.sFocus,

      Logger.t('Should delete single space between cef elements', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span contenteditable="false">a</span>&nbsp;<span contenteditable="false">b</span>&nbsp;</p>'),
        tinyApis.sSetSelection([0, 2], 1, [0, 2], 1),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('span', {
                      attrs: {
                        contenteditable: str.is('false')
                      },
                      children: [
                        s.text(str.is('a'))
                      ]
                    }),
                    s.text(str.is(Zwsp.ZWSP)),
                    s.element('span', {
                      attrs: {
                        contenteditable: str.is('false')
                      },
                      children: [
                        s.text(str.is('b'))
                      ]
                    }),
                    s.text(str.is('\u00a0'))
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should add fake caret if we delete content beside cef elements', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span contenteditable="false">a</span>&nbsp;</p>'),
        tinyApis.sSetSelection([0, 2], 1, [0, 2], 1),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('span', {
                      attrs: {
                        contenteditable: str.is('false')
                      },
                      children: [
                        s.text(str.is('a'))
                      ]
                    }),
                    s.text(str.is(Zwsp.ZWSP))
                  ]
                })
              ]
            });
          })
        )
      ])),

      Logger.t('Should add fake caret if we delete range beside cef', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span contenteditable="false">a</span>&nbsp;abc</p>'),
        tinyApis.sSetSelection([0, 2], 0, [0, 2], 4),
        tinyActions.sContentKeystroke(Keys.backspace(), {}),
        tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('span', {
                      attrs: {
                        contenteditable: str.is('false')
                      },
                      children: [
                        s.text(str.is('a'))
                      ]
                    }),
                    s.text(str.is(Zwsp.ZWSP))
                  ]
                })
              ]
            });
          })
        )
      ]))
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      sTestDelete(editor, tinyApis, tinyActions)
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
