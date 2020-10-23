import { ApproxStructure, GeneralSteps, Keys, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';
import * as KeyUtils from '../../module/test/KeyUtils';

UnitTest.asynctest('browser.tinymce.core.delete.CaretBoundaryDeleteTest', (success, failure) => {
  Theme();

  const cefStruct = (text: string) => ApproxStructure.build((s, str) => s.element('span', {
    attrs: {
      contenteditable: str.is('false')
    },
    children: [
      s.text(str.is(text))
    ]
  }));

  const videoStruct = ApproxStructure.build((s, str) => s.element('video', {
    attrs: {
      controls: str.is('controls')
    },
    children: [
      s.element('source', {
        attrs: {
          src: str.is('custom/video.mp4')
        }
      })
    ]
  }));

  const sTestDelete = (editor: Editor, tinyApis: TinyApis, tinyActions: TinyActions) => GeneralSteps.sequence([
    tinyApis.sFocus(),

    Log.stepsAsStep('TINY-2998', 'Should delete single space between cef elements', [
      tinyApis.sSetContent('<p><span contenteditable="false">a</span>&nbsp;<span contenteditable="false">b</span>&nbsp;</p>'),
      tinyApis.sSetSelection([ 0, 2 ], 1, [ 0, 2 ], 1),
      tinyActions.sContentKeystroke(Keys.backspace(), {}),
      tinyApis.sAssertSelection([ 0, 1 ], 1, [ 0, 1 ], 1),
      tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) =>
        s.element('body', {
          children: [
            s.element('p', {
              children: [
                cefStruct('a'),
                s.text(str.is(Zwsp.ZWSP)),
                cefStruct('b'),
                s.text(str.is(Unicode.nbsp))
              ]
            })
          ]
        })
      ))
    ]),

    Log.stepsAsStep('TINY-2998', 'Should add fake caret if we delete content beside cef elements', [
      tinyApis.sSetContent('<p><span contenteditable="false">a</span>&nbsp;</p>'),
      tinyApis.sSetSelection([ 0, 2 ], 1, [ 0, 2 ], 1),
      tinyActions.sContentKeystroke(Keys.backspace()),
      tinyApis.sAssertSelection([ 0, 1 ], 1, [ 0, 1 ], 1),
      tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) =>
        s.element('body', {
          children: [
            s.element('p', {
              children: [
                cefStruct('a'),
                s.text(str.is(Zwsp.ZWSP))
              ]
            })
          ]
        })
      ))
    ]),

    Log.stepsAsStep('TINY-2998', 'Should add fake caret if we delete range beside cef', [
      tinyApis.sSetContent('<p><span contenteditable="false">a</span>&nbsp;abc</p>'),
      tinyApis.sSetSelection([ 0, 2 ], 0, [ 0, 2 ], 4),
      tinyActions.sContentKeystroke(Keys.backspace(), {}),
      tinyApis.sAssertSelection([ 0, 1 ], 1, [ 0, 1 ], 1),
      tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) =>
        s.element('body', {
          children: [
            s.element('p', {
              children: [
                cefStruct('a'),
                s.text(str.is(Zwsp.ZWSP))
              ]
            })
          ]
        })
      ))
    ]),

    Log.stepsAsStep('TINY-4211', 'Should add fake caret if we type and then delete content beside media elements', [
      tinyApis.sSetContent('<p><video controls="controls"><source src="custom/video.mp4" /></video></p>'),
      tinyApis.sSelect('video', []),
      // Pressing right will add a fake caret, which will be removed when we press backspace
      tinyActions.sContentKeystroke(Keys.right()),
      Step.sync(() => KeyUtils.type(editor, 'a')),
      tinyApis.sAssertSelection([ 0, 1 ], 2, [ 0, 1 ], 2),
      tinyActions.sContentKeystroke(Keys.backspace()),
      tinyApis.sAssertSelection([ 0, 1 ], 1, [ 0, 1 ], 1),
      tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) =>
        s.element('body', {
          children: [
            s.element('p', {
              children: [
                videoStruct,
                s.text(str.is(Zwsp.ZWSP))
              ]
            })
          ]
        })
      ))
    ])
  ]);

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      sTestDelete(editor, tinyApis, tinyActions)
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
