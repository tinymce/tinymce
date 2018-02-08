import { Pipeline, UiFinder, Chain, Assertions, ApproxStructure, Logger, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('browser.core.IframeNodeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('iframe with class and style, no width & height attribs', GeneralSteps.sequence([
        apis.sSetContent(
          '<iframe class="test-class" style="height: 250px; width: 500px;" src="about:blank"></iframe>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('iframe'),
          Chain.op((input) =>
            Assertions.assertStructure('should have all attributes', ApproxStructure.build((s, str, arr) => {
              return s.element('iframe', {
                classes: [ arr.has('test-class') ],
                attrs: {
                  width: str.none('should not have width'),
                  height: str.none('should not have height')
                },
                styles: {
                  width: str.is('500px'),
                  height: str.is('250px')
                },
              });
            }), input)
          )
        ])
      ])),
      Logger.t('iframe with class, style and width & height attribs', GeneralSteps.sequence([
        apis.sSetContent(
          '<iframe class="test-class" style="height: 250px; width: 500px;" width="300" height="150" src="about:blank"></iframe>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('iframe'),
          Chain.op((input) =>
            Assertions.assertStructure('should have all attributes', ApproxStructure.build((s, str, arr) => {
              return s.element('iframe', {
                classes: [ arr.has('test-class') ],
                attrs: {
                  width: str.is('300'),
                  height: str.is('150')
                },
                styles: {
                  width: str.is('500px'),
                  height: str.is('250px')
                },
              });
            }), input)
          )
        ])
      ])),
      Logger.t('iframe with width & height attribs', GeneralSteps.sequence([
        apis.sSetContent(
          '<iframe width="300" height="150" src="about:blank"></iframe>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('iframe'),
          Chain.op((input) =>
            Assertions.assertStructure('should have all attributes', ApproxStructure.build((s, str, arr) => {
              return s.element('iframe', {
                attrs: {
                  width: str.is('300'),
                  height: str.is('150')
                },
                styles: {
                  width: str.none('should not have width style'),
                  height: str.none('should not have height style')
                },
              });
            }), input)
          )
        ])
      ])),
    ], onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    media_url_resolver (data, resolve) {
      setTimeout(function () {
        resolve({
          html: '<span id="fake">' + data.url + '</span>'
        });
      }, 500);
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
