import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import * as TextSearch from 'tinymce/plugins/textpattern/text/TextSearch';
import { SpotPoint } from 'tinymce/plugins/textpattern/utils/Spot';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.TextSearchTest', (success, failure) => {

  Theme();
  TextpatternPlugin();

  const process = (content: string) => (element: Text, offset: number) => {
    return element.data === content ? offset : -1;
  };

  const repeatLeftUntil = (editor: Editor, content: string) => {
    const rng = editor.selection.getRng();
    return TextSearch.repeatLeft(editor.dom, rng.startContainer, rng.startOffset, process(content), editor.getBody()).fold(
      () => null,
      (spot) => spot.container
    );
  };

  const repeatRightUntil = (editor: Editor, content: string) => {
    const rng = editor.selection.getRng();
    return TextSearch.repeatRight(editor.dom, rng.startContainer, rng.startOffset, process(content), editor.getBody()).fold(
      () => null,
      (spot) => spot.container
    );
  };

  const assertSpot = (label: string, spotOpt: Option<SpotPoint<Text>>, elementText: String, offset: number) => {
    const spot = spotOpt.getOrDie(`${label} - Spot not found`);

    Assertions.assertEq(label, elementText, spot.container.textContent);
    Assertions.assertEq(label, offset, spot.offset);
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const editorBody = editor.getBody();

    const steps = Utils.withTeardown([
      Log.stepsAsStep('TBA', 'TextSearch: text before from element', [
        tinyApis.sSetContent('<p>*<a href="#">a</a>bc</p>'),
        // Select the end of the paragraph
        tinyApis.sSetCursor([0], 1),
        Step.sync(() => {
          const rng = editor.selection.getRng();
          const content = TextSearch.textBefore(rng.startContainer, rng.startOffset, editorBody);
          assertSpot('Text before from end of paragraph', content, 'bc', 2);
          const anchorElm = rng.startContainer.childNodes[1];
          const anchor = TextSearch.textBefore(anchorElm, 1, editorBody);
          assertSpot('Text before from end of anchor', anchor, 'a', 1);
        })
      ]),
      Log.stepsAsStep('TBA', 'TextSearch: text before from text node', [
        tinyApis.sSetContent('<p>*<a href="#">a</a>bc</p>'),
        tinyApis.sSetCursor([0, 2], 2),
        Step.sync(() => {
          const rng = editor.selection.getRng();
          const contentEnd = TextSearch.textBefore(rng.startContainer, 2, editorBody);
          assertSpot('Text before within text node', contentEnd, 'bc', 2);
          const contentStart = TextSearch.textBefore(rng.startContainer, 0, editorBody);
          assertSpot('Text before within text node', contentStart, 'bc', 0);
        })
      ]),
      Log.stepsAsStep('TBA', 'TextSearch: scan right over fragmented text', [
        tinyApis.sSetContent('<p>*<a href="#">a</a>bc</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        Step.sync(() => {
          const startNode = editor.selection.getRng().startContainer as Text;
          const start = TextSearch.scanRight(startNode, 1, editorBody);
          const anchor = TextSearch.scanRight(startNode, 2, editorBody);
          const content = TextSearch.scanRight(startNode, 4, editorBody);
          const outOfRange = TextSearch.scanRight(startNode, 10, editorBody);
          assertSpot('Scan right same text node', start, '*', 1);
          assertSpot('Scan right into anchor element', anchor, 'a', 1);
          assertSpot('Scan right over anchor element', content, 'bc', 2);
          Assertions.assertEq('Scan right with out of range offset is none', true, outOfRange.isNone());
        })
      ]),
      Log.stepsAsStep('TBA', 'TextSearch: scan left over fragmented text', [
        tinyApis.sSetContent('<p>*<a href="#">a</a>bc</p>'),
        tinyApis.sSetCursor([0, 2], 2),
        Step.sync(() => {
          const startNode = editor.selection.getRng().startContainer as Text;
          const start = TextSearch.scanLeft(startNode, 1, editorBody);
          const anchor = TextSearch.scanLeft(startNode, -1, editorBody);
          const content = TextSearch.scanLeft(startNode, -2, editorBody);
          const outOfRange = TextSearch.scanLeft(startNode, -10, editorBody);
          assertSpot('Scan left same text node', start, 'bc', 1);
          assertSpot('Scan left into anchor element', anchor, 'a', 0);
          assertSpot('Scan left over anchor element', content, '*', 0);
          Assertions.assertEq('Scan left with out of range offset is none', true, outOfRange.isNone());
        })
      ]),
      Log.stepsAsStep('TBA', 'TextSearch: repeat left over fragmented text', [
        tinyApis.sSetContent('<p>def</p><p>*<a href="#">a</a>bc</p>'),
        tinyApis.sSetCursor([1, 2], 2),
        Step.sync(() => {
          const asteriskNode = editorBody.childNodes[1].firstChild;
          const anchorNode = asteriskNode.nextSibling.firstChild;
          const asterisk = repeatLeftUntil(editor, '*');
          Assertions.assertDomEq('Repeat left until asterisk found', Element.fromDom(asteriskNode), Element.fromDom(asterisk));
          const anchor = repeatLeftUntil(editor, 'a');
          Assertions.assertDomEq('Repeat left until anchor found', Element.fromDom(anchorNode), Element.fromDom(anchor));
          const boundary = repeatLeftUntil(editor, 'def');
          Assertions.assertEq('Repeat left until block boundary found', null, boundary);
        })
      ]),
      Log.stepsAsStep('TBA', 'TextSearch: repeat right over fragmented text', [
        tinyApis.sSetContent('<p>*<a href="#">a</a>bc</p><p>def</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        Step.sync(() => {
          const contentNode = editorBody.childNodes[0].lastChild;
          const anchorNode = contentNode.previousSibling.firstChild;
          const asterisk = repeatRightUntil(editor, 'bc');
          Assertions.assertDomEq('Repeat right until bc found', Element.fromDom(contentNode), Element.fromDom(asterisk));
          const anchor = repeatRightUntil(editor, 'a');
          Assertions.assertDomEq('Repeat right until anchor found', Element.fromDom(anchorNode), Element.fromDom(anchor));
          const boundary = repeatRightUntil(editor, 'def');
          Assertions.assertEq('Repeat right until block boundary found', null, boundary);
        })
      ])
    ], tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'textpattern',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
