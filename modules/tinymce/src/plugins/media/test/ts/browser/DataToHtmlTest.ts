import { ApproxStructure, Assertions, StructAssert, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as DataToHtml from 'tinymce/plugins/media/core/DataToHtml';
import { MediaData } from 'tinymce/plugins/media/core/Types';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.media.core.DataToHtmlTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const pTestDataToHtml = async (editor: Editor, data: MediaData, expected: StructAssert) => {
    const actual = SugarElement.fromHtml(DataToHtml.dataToHtml(editor, data));
    await Waiter.pTryUntil('Wait for structure check',
      () => Assertions.assertStructure('Assert equal', expected, actual),
      10, 500
    );
  };

  const videoStruct = ApproxStructure.build((s, str/* , arr*/) => {
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

  const iframeStruct = ApproxStructure.build((s, str/* , arr*/) => {
    return s.element('iframe', {
      attrs: {
        height: str.is('150'),
        width: str.is('300')
      }
    });
  });

  it('TBA: Assert html structure of a video element', () => pTestDataToHtml(hook.editor(),
    {
      'type': 'video',
      'source': 'a',
      'altsource': '',
      'poster': '',
      'data-ephox-embed': 'a'
    },
    videoStruct
  ));

  it('TBA: Assert html structure of an iframe element', () => pTestDataToHtml(hook.editor(),
    {
      'type': 'iframe',
      'source': 'a',
      'altsource': '',
      'poster': '',
      'data-ephox-embed': 'a'
    },
    iframeStruct
  ));
});
