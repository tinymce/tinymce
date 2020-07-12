import { ApproxStructure, GeneralSteps, Log, Logger, Pipeline, StructAssert, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.core.PlaceholderTest', (success, failure) => {
  Plugin();
  Theme();

  const sTestPlaceholder = (ui: TinyUi, editor: Editor, apis: TinyApis, url: string, expected: string, struct: StructAssert) => {
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

  const sTestScriptPlaceholder = (ui: TinyUi, editor: Editor, apis: TinyApis, expected: string, struct: StructAssert) => {
    return Logger.t(`Test script placeholder ${expected}`, GeneralSteps.sequence([
      apis.sSetContent(
        '<script src="http://media1.tinymce.com/123456"></script>' +
        '<script src="http://media2.tinymce.com/123456"></script>'),
      apis.sNodeChanged(),
      Waiter.sTryUntil('Wait for structure check',
        apis.sAssertContentStructure(struct),
        10, 500),
      Utils.sAssertEditorContent(apis, editor, expected),
      apis.sSetContent('')
    ]));
  };

  const placeholderStructure = ApproxStructure.build((s, str) => {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('img', {
              attrs: {
                src: str.is(Env.transparentSrc)
              }
            })
          ]
        }),
        s.theRest()
      ]
    });
  });

  const iframeStructure = ApproxStructure.build((s) => {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              children: [
                s.element('iframe', {}),
                s.element('span', {})
              ]
            })
          ]
        }),
        s.theRest()
      ]
    });
  });

  const scriptStruct = ApproxStructure.build((s, str, arr) => {
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

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Media: Set and assert script placeholder and placeholder structure', [
        Utils.sSetSetting(editor.settings, 'media_live_embeds', false),
        sTestScriptPlaceholder(ui, editor, apis,
          '<p>\n' +
          '<script src="http://media1.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
          '<script src="http://media2.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
          '</p>', scriptStruct),
        sTestPlaceholder(ui, editor, apis,
          'https://www.youtube.com/watch?v=P_205ZY52pY',
          '<p><iframe src="https://www.youtube.com/embed/P_205ZY52pY" width="560" ' +
          'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
          placeholderStructure),
        sTestPlaceholder(ui, editor, apis,
          '/custom/video.mp4',
          '<p><video controls="controls" width="300" height="150">\n' +
          '<source src="custom/video.mp4" type="video/mp4" /></video></p>',
          placeholderStructure),
        sTestPlaceholder(ui, editor, apis,
          '/custom/audio.mp3',
          '<p><audio src="custom/audio.mp3" controls="controls"></audio></p>',
          placeholderStructure),
      ]),
      Log.stepsAsStep('TBA', 'Media: Set and assert live embed structure', [
        Utils.sSetSetting(editor.settings, 'media_live_embeds', true),
        sTestPlaceholder(ui, editor, apis,
          'https://www.youtube.com/watch?v=P_205ZY52pY',
          '<p><iframe src="https://www.youtube.com/embed/P_205ZY52pY" width="560" ' +
          'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
          iframeStructure)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: [ 'media' ],
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
