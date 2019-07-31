import { GeneralSteps, Logger, Pipeline, Step, Assertions, ApproxStructure } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import SetSelectionContent from 'tinymce/core/selection/SetSelectionContent';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.selection.SetSelectionContentTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sSetContent = function (editor, content, args) {
    return Step.sync(function () {
      SetSelectionContent.setContent(editor, content, args);
    });
  };

  const sSetContentOverride = function (editor, content, overrideContent, args) {
    return Step.sync(function () {
      const handler = function (e) {
        if (e.selection === true) {
          e.preventDefault();
          editor.getBody().innerHTML = overrideContent;
        }
      };

      editor.on('BeforeSetContent', handler);
      SetSelectionContent.setContent(editor, content, args);
      editor.off('BeforeSetContent', handler);
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const root = Element.fromDom(editor.getBody());

    Pipeline.async({}, [
      Logger.t('Should insert a before b', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
        sSetContent(editor, 'a', {}),
        tinyApis.sAssertContent('<p>ab</p>')
      ])),
      Logger.t('Should fill the body with x h1 instead of a before b in a paragraph', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
        sSetContentOverride(editor, 'a', '<h1>x</h1>', {}),
        tinyApis.sAssertContent('<h1>x</h1>')
      ])),

      Logger.t('Insert content in middle of word, expanded selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>abc</p>'),
        tinyApis.sSetSelection([0, 0], 1, [0, 0], 2),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('aXc'))
                  ]
                })
              ]
            });
          }),
          root
        ),
        tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
      ])),

      Logger.t('Insert content in middle of word, collapsed selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>ab</p>'),
        tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('aXb'))
                  ]
                })
              ]
            });
          }),
          root
        ),
        tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
      ])),

      Logger.t('Insert content at start of word, collapsed selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('Xa'))
                  ]
                })
              ]
            });
          }),
          root
        ),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1),
      ])),

      Logger.t('Insert content at end of word, collapsed selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
        sSetContent(editor, 'X', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('aX'))
                  ]
                })
              ]
            });
          }),
          root
        ),
      ])),

      Logger.t('Insert content at end of word with partial text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
        sSetContent(editor, 'b<em>c</em>', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('ab')),
                    s.element('em', {
                      children: [
                        s.text(str.is('c'))
                      ]
                    })
                  ]
                })
              ]
            });
          }),
          root
        ),
      ])),

      Logger.t('Insert content at end of word with partial text', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
        sSetContent(editor, '<em>b</em>c', {}),
        Assertions.sAssertStructure('Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a')),
                    s.element('em', {
                      children: [
                        s.text(str.is('b'))
                      ]
                    }),
                    s.text(str.is('c'))
                  ]
                })
              ]
            });
          }),
          root
        ),
      ])),
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
