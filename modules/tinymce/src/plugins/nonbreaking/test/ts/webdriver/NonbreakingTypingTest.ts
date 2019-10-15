import { ApproxStructure, Log, Pipeline, RealKeys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import theme from 'tinymce/themes/silver/Theme';
import Env from 'tinymce/core/api/Env';

UnitTest.asynctest('webdriver.tinymce.plugins.nonbreaking.NonbreakingTypingTest', (success, failure) => {
  // Note: Uses RealKeys, so needs a browser. Headless won't work.

  theme();
  NonbreakingPlugin();

  const isGecko = Env.browser.isFirefox();
  const isGeckoOrIE = isGecko || Env.browser.isIE();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', '1. NonBreaking: Click on the nbsp button then type some text, and assert content is correct', [
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('\u00a0test'))
                ]
              })
            ]
          });
        }))
      ]),

      tinyApis.sSetContent(''),

      Log.stepsAsStep('TBA', '2. NonBreaking: Add text to editor, click on the nbsp button, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([0, 0], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test\u00a0'))
                ]
              })
            ]
          });
        }))
      ]),

      tinyApis.sSetContent(''),

      Log.stepsAsStep('TBA', '3. NonBreaking: Add content to editor, click on the nbsp button then type some text, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([0, 0], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test test'))
                ]
              })
            ]
          });
        }))
      ]),

      tinyApis.sSetContent(''),

      Log.stepsAsStep('TBA', '4. NonBreaking: Click on the nbsp button then type a space, and assert content is correct', [
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text(' ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is(isGeckoOrIE ? '\u00a0 ' : '\u00a0\u00a0'))
                ].concat(isGecko ? [ s.element('br', {})] : [])
              })
            ]
          });
        }))
      ]),

      Log.stepsAsStep('TBA', '5. NonBreaking: Add text to editor, click on the nbsp button and add content plus a space, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([0, 0], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is(isGeckoOrIE ? 'test test ' : 'test test\u00a0'))
                ].concat(isGecko ? [ s.element('br', {})] : [])
              })
            ]
          });
        }))
      ]),

    ], onSuccess, onFailure);
  }, {
    plugins: 'nonbreaking',
    toolbar: 'nonbreaking',
    nonbreaking_wrap: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
