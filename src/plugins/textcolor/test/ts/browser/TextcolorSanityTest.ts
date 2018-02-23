import { ApproxStructure, Pipeline, GeneralSteps, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import TextcolorPlugin from 'tinymce/plugins/textcolor/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('browser.tinymce.plugins.textcolor.TextcolorSanityTest.js', (success, failure) => {
  const browser = PlatformDetection.detect().browser;

  ModernTheme();
  TextcolorPlugin();
  const forecolorStruct = ApproxStructure.build(function (s, str) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                'color': str.is(Env.ie && Env.ie <= 11 ? '#0000ff' : 'rgb(0, 0, 255)'),
                'font-size': str.is('24pt')
              }
            }),
            s.text(str.is(' test'))
          ]
        })
      ]
    });
  });

  const backcolorStruct = ApproxStructure.build(function (s, str) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                'background-color': str.is('rgb(204, 153, 255)'),
                'font-size': str.is('24pt')
              }
            }),
            s.text(str.is(' test'))
          ]
        })
      ]
    });
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, browser.isIE() ? [] : [
      Logger.t('forecolor', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('hello test'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 5),
        tinyUi.sClickOnToolbar('click forecolor', 'div[aria-label="Text color"] > button.mce-open'),
        tinyUi.sClickOnUi('click green color', 'div[data-mce-color="#00FF00"]:first'),
        tinyUi.sClickOnToolbar('click fontsize', 'div[aria-label="Font Sizes"] > button'),
        tinyUi.sClickOnUi('click 24pt', 'div.mce-floatpanel span.mce-text:contains("24pt")'),
        tinyUi.sClickOnToolbar('click forecolor again', 'div[aria-label="Text color"] > button.mce-open'),
        tinyUi.sClickOnUi('click blue color', 'div[data-mce-color="#0000FF"]:first'),
        tinyApis.sAssertContentStructure(forecolorStruct)
      ])),
      Logger.t('backcolor', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('hello test'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 5),
        tinyUi.sClickOnToolbar('click backcolor', 'div[aria-label="Background color"] > button.mce-open'),
        tinyUi.sClickOnUi('click green color', 'div[data-mce-color="#00FF00"]:last'),
        tinyUi.sClickOnToolbar('click fontsize', 'div[aria-label="Font Sizes"] > button'),
        tinyUi.sClickOnUi('click 24pt', 'div.mce-floatpanel span.mce-text:contains("24pt")'),
        tinyUi.sClickOnToolbar('click backcolor again', 'div[aria-label="Background color"] > button.mce-open'),
        tinyUi.sClickOnUi('click a nice purple color', 'div[data-mce-color="#CC99FF"]:last'),
        tinyApis.sAssertContentStructure(backcolorStruct)
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'textcolor',
    toolbar: 'forecolor backcolor fontsizeselect',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
