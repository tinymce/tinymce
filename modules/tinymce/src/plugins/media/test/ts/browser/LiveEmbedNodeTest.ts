import { ApproxStructure, Assertions, Chain, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.media.core.LiveEmbedNodeTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const apis = TinyApis(editor);

    const sAssertStructure = (tag: string, classes: string[], attrs: Record<string, string>, styles: Record<string, string>) => Chain.asStep(SugarElement.fromDom(editor.getBody()), [
      UiFinder.cFindIn('span.mce-preview-object'),
      Chain.op((input) =>
        Assertions.assertStructure('should have all attributes', ApproxStructure.build((s, str, arr) => s.element('span', {
          classes: [ arr.has('mce-object-' + tag) ],
          styles: {
            height: str.none('should not have height style'),
            width: str.none('should not have width style')
          },
          children: [
            s.element(tag, {
              classes: Arr.map(classes, arr.has),
              attrs: {
                height: str.none('should not have height'),
                width: str.none('should not have width'),
                ...Obj.map(attrs, (value) => str.is(value))
              },
              styles: {
                height: str.none('should not have height style'),
                width: str.none('should not have width style'),
                ...Obj.map(styles, (value) => str.is(value))
              }
            }),
            s.zeroOrOne(s.element('span', {
              classes: [ arr.has('mce-shim') ]
            }))
          ]
        })), input)
      )
    ]);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Media: iframe with class and style, no width & height attribs', [
        apis.sSetContent('<iframe class="test-class" style="height: 250px; width: 500px;" src="about:blank"></iframe>'),
        sAssertStructure('iframe', [ 'test-class' ], { src: 'about:blank' }, { width: '500px', height: '250px' })
      ]),
      Log.stepsAsStep('TBA', 'Media: iframe with class, style and width & height attribs', [
        apis.sSetContent('<iframe class="test-class" style="height: 250px; width: 500px;" width="300" height="150" src="about:blank"></iframe>'),
        sAssertStructure('iframe', [ 'test-class' ], { src: 'about:blank', width: '300', height: '150' }, { width: '500px', height: '250px' })
      ]),
      Log.stepsAsStep('TBA', 'Media: iframe with width & height attribs', [
        apis.sSetContent('<iframe width="300" height="150" src="about:blank"></iframe>'),
        sAssertStructure('iframe', [ ], { width: '300', height: '150' }, { })
      ]),

      Log.stepsAsStep('TINY-6229', 'Media: video with class and style, no width & height attribs', [
        apis.sSetContent('<video class="test-class" style="height: 250px; width: 500px;" src="about:blank"></video>'),
        sAssertStructure('video', [ 'test-class' ], { src: 'about:blank' }, { width: '500px', height: '250px' })
      ]),
      Log.stepsAsStep('TINY-6229', 'Media: video with controls, width & height attribs, no width & height styles', [
        apis.sSetContent('<video controls="controls" style="padding: 4px" width="300" height="150" src="about:blank"></video>'),
        sAssertStructure('video', [ ], { controls: 'controls', src: 'about:blank', width: '300', height: '150' }, { padding: '4px' })
      ]),
      Log.stepsAsStep('TINY-6229', 'Media: video with controls, no width & height styles or styles defaults to 300x150', [
        apis.sSetContent('<video controls="controls" src="about:blank"></video>'),
        sAssertStructure('video', [ ], { controls: 'controls', width: '300', height: '150' }, { })
      ]),

      Log.stepsAsStep('TINY-6229', 'Media: audio with class and style, no width & height attribs', [
        apis.sSetContent('<audio class="test-class" style="height: 250px; width: 500px;" src="about:blank"></audio>'),
        sAssertStructure('audio', [ 'test-class' ], { src: 'about:blank' }, { width: '500px', height: '250px' })
      ]),
      Log.stepsAsStep('TINY-6229', 'Media: audio with controls, no width & height attribs', [
        apis.sSetContent('<audio controls="controls" src="about:blank"></audio>'),
        sAssertStructure('audio', [ ], { controls: 'controls', src: 'about:blank' }, { })
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: [ 'media' ],
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
