import { ApproxStructure, GeneralSteps, Pipeline, Waiter, Logger, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.core.PlaceholderTest', function (success, failure) {
  Plugin();
  Theme();

  const sTestPlaceholder = function (ui, editor, apis, url, expected, struct) {
    return Logger.t(`Test placeholder ${expected}`, GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      Utils.sSetFormItemNoEvent(ui, url),
      ui.sClickOnUi('click checkbox', Utils.selectors.saveButton),
      Utils.sAssertEditorContent(apis, editor, expected),
      Waiter.sTryUntil('Wait for structure check',
        apis.sAssertContentStructure(struct)),
      apis.sSetContent('')
    ]));
  };

  const sTestScriptPlaceholder = function (ui, editor, apis, expected, struct) {
    return Logger.t(`Test script placeholder ${expected}`, GeneralSteps.sequence([
      apis.sSetContent(
        '<script src="http://media1.tinymce.com/123456"></script>' +
        '<script src="http://media2.tinymce.com/123456"></script>'),
      apis.sNodeChanged,
      Waiter.sTryUntil('Wait for structure check',
        apis.sAssertContentStructure(struct),
        10, 500),
      Utils.sAssertEditorContent(apis, editor, expected),
      apis.sSetContent('')
    ]));
  };
  const placeholderStructure = ApproxStructure.build(function (s) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('img', {})
          ]
        }),
        s.element('div', {}),
        s.element('div', {}),
        s.element('div', {}),
        s.element('div', {})
      ]
    });
  });

  const iframeStructure = ApproxStructure.build(function (s) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              children: [
                s.element('iframe', {}),
                s.element('span', {})
              ]
            }),
            s.anything()
          ]
        })
      ]
    });
  });

  const scriptStruct = ApproxStructure.build(function (s, str, arr) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('img', {
              classes: [
                arr.has('mce-object'),
                arr.has('mce-object-script')
              ],
              attrs: {
                height: str.is('150'),
                width: str.is('300')
              }
            }),
            s.element('img', {
              classes: [
                arr.has('mce-object'),
                arr.has('mce-object-script')
              ],
              attrs: {
                height: str.is('200'),
                width: str.is('100')
              }
            })
          ]
        })
      ]
    });
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Media: Set and assert script placeholder and placeholder structure', [
        Utils.sSetSetting(editor.settings, 'media_live_embeds', false),
        sTestScriptPlaceholder(ui, editor, apis,
          '<p>\n' +
          '<script src="http://media1.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
          '<script src="http://media2.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
          '</p>', scriptStruct),
        sTestPlaceholder(ui, editor, apis,
          'https://www.youtube.com/watch?v=P_205ZY52pY',
          '<p><iframe src="//www.youtube.com/embed/P_205ZY52pY" width="560" ' +
          'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
          placeholderStructure),
        Utils.sSetSetting(editor.settings, 'media_live_embeds', true),
        sTestPlaceholder(ui, editor, apis,
          'https://www.youtube.com/watch?v=P_205ZY52pY',
          '<p><iframe src="//www.youtube.com/embed/P_205ZY52pY" width="560" ' +
          'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
          iframeStructure)
      ])
    , onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    extended_valid_elements: 'script[src|type]',
    media_scripts: [
        { filter: 'http://media1.tinymce.com' },
        { filter: 'http://media2.tinymce.com', width: 100, height: 200 }
    ],
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
