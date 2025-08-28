import { ApproxStructure, Assertions, StructAssert, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as DataToHtml from 'tinymce/plugins/media/core/DataToHtml';
import { MediaData } from 'tinymce/plugins/media/core/Types';
import Plugin from 'tinymce/plugins/media/Plugin';

describe('browser.tinymce.plugins.media.core.DataToHtmlTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

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

  it('TBA: Assert html structure of audio from template callback', async () => {
    const editor = hook.editor();
    const audioTemplateCallback = Fun.constant('<audio id="template" controls="controls"><source src="https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"></audio>');
    editor.options.set('audio_template_callback', audioTemplateCallback);
    const input = {
      source: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      altsource: '',
      poster: ''
    };
    const expected = ApproxStructure.build((s, str/* , arr*/) => {
      return s.element('audio', {
        children: [
          s.element('source', {
            attrs: {
              src: str.is('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3')
            }
          })
        ],
        attrs: {
          id: str.is('template'),
          controls: str.is('controls'),
        }
      });
    });
    await pTestDataToHtml(editor, input, expected);
    editor.options.unset('audio_template_callback');
  });

  it('TBA: Assert html structure of video from template callback', async () => {
    const editor = hook.editor();
    const videoTemplateCallback = Fun.constant('<video id="template" controls="controls" width="500" height="300" ><source src="https://i.imgur.com/Tu4e5WX.mp4"></video>');
    editor.options.set('video_template_callback', videoTemplateCallback);
    const input = {
      source: 'https://i.imgur.com/Tu4e5WX.mp4',
      altsource: '',
      poster: ''
    };
    const expected = ApproxStructure.build((s, str/* , arr*/) => {
      return s.element('video', {
        children: [
          s.element('source', {
            attrs: {
              src: str.is('https://i.imgur.com/Tu4e5WX.mp4')
            }
          })
        ],
        attrs: {
          id: str.is('template'),
          controls: str.is('controls'),
          height: str.is('300'),
          width: str.is('500')
        }
      });
    });
    await pTestDataToHtml(editor, input, expected);
    editor.options.unset('video_template_callback');
  });

  it('TINY-8684: Assert html structure of iframe from template callback', async () => {
    const editor = hook.editor();
    const iframeTemplateCallback = Fun.constant('<iframe id="template" title="testcallback" src="https://www.youtube.com/embed/IcgmSRJHu_8" width="500" height="300"></iframe>');
    editor.options.set('iframe_template_callback', iframeTemplateCallback);
    const input = {
      source: 'https://www.youtube.com/embed/IcgmSRJHu_8',
      altsource: '',
      poster: ''
    };
    const expected = ApproxStructure.build((s, str/* , arr*/) => {
      return s.element('iframe', {
        attrs: {
          src: str.is('https://www.youtube.com/embed/IcgmSRJHu_8'),
          title: str.is('testcallback'),
          id: str.is('template'),
          height: str.is('300'),
          width: str.is('500')
        }
      });
    });
    await pTestDataToHtml(editor, input, expected);
    editor.options.unset('iframe_template_callback');
  });
});
