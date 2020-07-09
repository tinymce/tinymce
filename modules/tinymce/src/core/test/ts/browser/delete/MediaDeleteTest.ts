import { ApproxStructure, GeneralSteps, Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.delete.MediaDeleteTest', (success, failure) => {
  Theme();

  const sAssertEmptyEditorStructure = (tinyApis: TinyApis) => tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('br', {
              attrs: {
                'data-mce-bogus': str.is('1')
              }
            })
          ]
        })
      ]
    })
  ));

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const sTestMedia = (type: string, content: string) => GeneralSteps.sequence([
      Log.stepsAsStep('TINY-4211', 'Backspace selected node with padd editor', [
        tinyApis.sSetContent(content),
        tinyApis.sSelect(type, []),
        tinyActions.sContentKeystroke(Keys.backspace()),
        sAssertEmptyEditorStructure(tinyApis)
      ]),
      Log.stepsAsStep('TINY-4211', 'Delete selected node with padd editor', [
        tinyApis.sSetContent(content),
        tinyApis.sSelect(type, []),
        tinyActions.sContentKeystroke(Keys.delete()),
        sAssertEmptyEditorStructure(tinyApis)
      ]),
      Log.stepsAsStep('TINY-4211', 'Backspace after media', [
        tinyApis.sSetContent(`<p>before${content}</p>`),
        tinyApis.sSelect(type, []),
        tinyActions.sContentKeystroke(Keys.right()),
        tinyActions.sContentKeystroke(Keys.backspace()),
        tinyApis.sAssertContent('<p>before</p>')
      ]),
      Log.stepsAsStep('TINY-4211', 'Delete before media', [
        tinyApis.sSetContent(`<p>${content}after</p>`),
        tinyApis.sSelect(type, []),
        tinyActions.sContentKeystroke(Keys.left()),
        tinyActions.sContentKeystroke(Keys.delete()),
        tinyApis.sAssertContent('<p>after</p>')
      ])
    ]);

    // Firefox won't render without a valid embed/object
    const optionalTests = Env.browser.isFirefox() ? [ ] : [
      sTestMedia('embed', '<embed src="custom/video.mp4" />'),
      sTestMedia('object', '<object data="custom/file.pdf"></object>')
    ];

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sTestMedia('video', '<video controls="controls"><source src="custom/video.mp4" /></video>'),
      sTestMedia('audio', '<audio controls="controls"><source src="custom/audio.mp3" /></audio>'),
      ...optionalTests
    ], onSuccess, onFailure);
  }, {
    indent: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
