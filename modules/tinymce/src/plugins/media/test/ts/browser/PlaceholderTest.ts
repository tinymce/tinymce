import { ApproxStructure, StructAssert, Waiter } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.core.PlaceholderTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    extended_valid_elements: 'script[src|type]',
    media_scripts: [
      { filter: 'http://media1.tinymce.com' },
      { filter: 'http://media2.tinymce.com', width: 100, height: 200 }
    ],
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const pTestPlaceholder = async (editor: Editor, url: string, expected: string, struct: StructAssert) => {
    await Utils.pOpenDialog(editor);
    await Utils.pSetFormItemNoEvent(editor, url);
    TinyUiActions.submitDialog(editor);
    await Utils.pAssertEditorContent(editor, expected);
    await Waiter.pTryUntil('Wait for structure check', () => TinyAssertions.assertContentStructure(editor, struct));
    editor.setContent('');
  };

  const pTestScriptPlaceholder = async (editor: Editor, expected: string, struct: StructAssert) => {
    editor.setContent(
      '<script src="http://media1.tinymce.com/123456"></script>' +
      '<script src="http://media2.tinymce.com/123456"></script>'
    );
    editor.nodeChanged();
    await Waiter.pTryUntil('Wait for structure check',
      () => TinyAssertions.assertContentStructure(editor, struct)
    );
    await Utils.pAssertEditorContent(editor, expected);
    editor.setContent('');
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

  context('media_live_embeds=false', () => {
    before(() => {
      const editor = hook.editor();
      editor.settings.media_live_embeds = false;
    });

    it('TBA: Set and assert script placeholder structure', () => pTestScriptPlaceholder(hook.editor(),
      '<p>\n' +
      '<script src="http://media1.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
      '<script src="http://media2.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
      '</p>', scriptStruct
    ));

    it('TBA: Set and assert iframe placeholder structure', () => pTestPlaceholder(hook.editor(),
      'https://www.youtube.com/watch?v=P_205ZY52pY',
      '<p><iframe src="https://www.youtube.com/embed/P_205ZY52pY" width="560" ' +
      'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
      placeholderStructure
    ));

    it('TBA: Set and assert video placeholder structure', () => pTestPlaceholder(hook.editor(),
      '/custom/video.mp4',
      '<p><video controls="controls" width="300" height="150">\n' +
      '<source src="custom/video.mp4" type="video/mp4" /></video></p>',
      placeholderStructure
    ));

    it('TBA: Set and assert audio placeholder structure', () => pTestPlaceholder(hook.editor(),
      '/custom/audio.mp3',
      '<p><audio src="custom/audio.mp3" controls="controls"></audio></p>',
      placeholderStructure
    ));
  });

  context('media_live_embeds=true', () => {
    before(() => {
      const editor = hook.editor();
      editor.settings.media_live_embeds = true;
    });

    it('TBA: Set and assert live iframe embed structure', () => pTestPlaceholder(hook.editor(),
      'https://www.youtube.com/watch?v=P_205ZY52pY',
      '<p><iframe src="https://www.youtube.com/embed/P_205ZY52pY" width="560" ' +
      'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
      iframeStructure
    ));
  });
});
