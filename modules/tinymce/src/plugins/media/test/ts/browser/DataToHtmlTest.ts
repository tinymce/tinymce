import { ApproxStructure, Assertions, Pipeline, Waiter, Logger, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import * as DataToHtml from 'tinymce/plugins/media/core/DataToHtml';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.core.DataToHtmlTest', function (success, failure) {
  Plugin();
  Theme();

  const sTestDataToHtml = function (editor, data, expected) {
    const actual = Element.fromHtml(DataToHtml.dataToHtml(editor, data));

    return Logger.t(`Test html data ${expected}`, Waiter.sTryUntil('Wait for structure check',
      Assertions.sAssertStructure('Assert equal', expected, actual),
      10, 500)
    );
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {

    const videoStruct = ApproxStructure.build(function (s, str/*, arr*/) {
      return s.element('video', {
        children: [
          s.text(str.is('\n')),
          s.element('source', {
            attrs: {
              src: str.is('a')
            }
          }),
          s.text(str.is('\n'))
        ],
        attrs: {
          height: str.is('150'),
          width: str.is('300')
        }
      });
    });

    const iframeStruct = ApproxStructure.build(function (s, str/*, arr*/) {
      return s.element('iframe', {
        attrs: {
          height: str.is('150'),
          width: str.is('300')
        }
      });
    });

    Pipeline.async({},
      Log.steps('TBA', 'Media: Assert html structure of the video and iframe elements', [
        sTestDataToHtml(editor,
          {
            'type': 'video',
            'source': 'a',
            'altsource': '',
            'poster': '',
            'data-ephox-embed': 'a'
          },
          videoStruct),
        sTestDataToHtml(editor,
          {
            'type': 'iframe',
            'source': 'a',
            'altsource': '',
            'poster': '',
            'data-ephox-embed': 'a'
          },
          iframeStruct)
      ])
    , onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
