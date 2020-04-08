import { Pipeline, Log, Assertions, ApproxStructure } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorContentEditableTest', (success, failure) => {
  AnchorPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor without inner html, check contenteditable is false', [
        tinyApis.sSetContent('<p><a id="abc"></a></p>'),
        Assertions.sAssertStructure('Checking content structure',
          ApproxStructure.build((s, str, arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('a', {
                    attrs: { contenteditable: str.is('false'), id: str.is('abc') },
                    classes: [ arr.has('mce-item-anchor') ]
                  }),
                  s.theRest()
                ]
              })
            ]
          })),
          Element.fromDom(editor.getBody())
        ),
      ]),
      // Note: The next step should pass because of the allow_html_in_named_anchor setting
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor with inner html, check contenteditable is not present and inner html is present', [
        tinyApis.sSetContent('<p><a id="abc">abc</a></p>'),
        Assertions.sAssertStructure('Checking content structure',
          ApproxStructure.build((s, str, arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('a', {
                    html: str.is('abc'),
                    attrs: { contenteditable: str.none(), id: str.is('abc') },
                    classes: [ arr.has('mce-item-anchor') ]
                  }),
                  s.theRest()
                ]
              })
            ]
          })),
          Element.fromDom(editor.getBody())
        ),
      ]),
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    allow_html_in_named_anchor: true,
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
