import { ApproxStructure, Assertions, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAddAnchor, sAssertAnchorPresence } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorAllowHtmlTest', (success, failure) => {
  AnchorPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sAssertContentStructure = (id: string, isContentEditable: boolean, innerContent: string) =>
      Assertions.sAssertStructure('Checking content structure',
        ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('a', {
                  html: str.is(innerContent),
                  attrs: { contenteditable: isContentEditable ? str.none() : str.is('false'), id: str.is(id) },
                  classes: [ arr.has('mce-item-anchor') ]
                }),
                s.theRest()
              ]
            })
          ]
        })),
        Element.fromDom(editor.getBody())
      );

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor without inner html, check contenteditable is false', [
        tinyApis.sSetContent('<p><a id="abc"></a></p>'),
        sAssertContentStructure('abc', false, '')
      ]),
      // Note: The next step should pass because of the allow_html_in_named_anchor setting
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor with inner html, check contenteditable is not present and inner html is present', [
        tinyApis.sSetContent('<p><a id="abc">abc</a></p>'),
        sAssertContentStructure('abc', true, 'abc')
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Select text and insert anchor, check selected text is included within anchor', [
        tinyApis.sSetContent('<p>abc</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 3),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertAnchorPresence(tinyApis, 1),
        sAssertContentStructure('abc', true, 'abc')
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Check non-empty anchor can be inserted and updated', [
        tinyApis.sSetContent('<p>abc</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 3),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertContentStructure('abc', true, 'abc'),
        // Latest html: <p><a id="abc">abc</a></p>
        // Note: Browser check since selection is unstable on IE11 due to TINY-3799
        Env.browser.isIE() ? tinyApis.sSelect('a', []) : tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
        sAddAnchor(tinyApis, tinyUi, 'def'),
        sAssertContentStructure('def', true, 'abc')
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Check bare anchor can be converted to a named anchor', [
        tinyApis.sSetContent('<p><a>abc</a></p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 0, 0, 0 ], 1),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertAnchorPresence(tinyApis, 1),
        sAssertContentStructure('abc', true, 'abc')
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Select over existing anchor and insert new anchor, check existing anchor is removed and new anchor is inserted', [
        // Test for empty anchor
        tinyApis.sSetContent('<p>ab<a id="abc"></a>cd</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 2 ], 2),
        sAddAnchor(tinyApis, tinyUi, 'def'),
        sAssertAnchorPresence(tinyApis, 1),
        sAssertContentStructure('def', true, 'abcd'),
        // Test for non-empty anchor
        tinyApis.sSetContent('<p>ab<a id="abc">cd</a>ef</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 2 ], 2),
        sAddAnchor(tinyApis, tinyUi, 'def'),
        sAssertAnchorPresence(tinyApis, 1),
        sAssertContentStructure('def', true, 'abcdef')
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Partially select non-empty anchor and insert new anchor, check existing anchor is truncated and new anchor is inserted', [
        tinyApis.sSetContent('<p>ab<a id="abc">cdef</a>gh</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 1, 0 ], 2),
        sAddAnchor(tinyApis, tinyUi, 'def'),
        sAssertAnchorPresence(tinyApis, 2),
        tinyApis.sAssertContent('<p><a id="def">abcd</a><a id="abc">ef</a>gh</p>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    allow_html_in_named_anchor: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
