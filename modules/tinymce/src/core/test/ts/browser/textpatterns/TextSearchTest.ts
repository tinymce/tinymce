import { Assertions } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import { SpotPoint } from 'tinymce/core/alien/Spot';
import * as TextSearch from 'tinymce/core/alien/TextSearch';
import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.textpatterns.TextSearchTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  const process = (content: string) => (element: Text, offset: number) => element.data === content ? offset : -1;

  const repeatLeftUntil = (editor: Editor, content: string) => {
    const rng = editor.selection.getRng();
    return TextSearch.repeatLeft(editor.dom, rng.startContainer, rng.startOffset, process(content), editor.getBody())
      .map((spot) => spot.container)
      .getOrNull();
  };

  const repeatRightUntil = (editor: Editor, content: string) => {
    const rng = editor.selection.getRng();
    return TextSearch.repeatRight(editor.dom, rng.startContainer, rng.startOffset, process(content), editor.getBody())
      .map((spot) => spot.container)
      .getOrNull();
  };

  const assertSpot = (label: string, spotOpt: Optional<SpotPoint<Text>>, elementText: string, offset: number) => {
    const spot = spotOpt.getOrDie(`${label} - Spot not found`);

    assert.equal(spot.container.textContent, elementText, label);
    assert.equal(spot.offset, offset, label);
  };

  it('TBA: text before from element', () => {
    const editor = hook.editor();
    const editorBody = editor.getBody();
    editor.setContent('<p>*<a href="#">a</a>bc</p>');
    // Select the end of the paragraph
    TinySelections.setCursor(editor, [ 0 ], 1);

    const rng = editor.selection.getRng();
    const content = TextSearch.textBefore(rng.startContainer, rng.startOffset, editorBody);
    assertSpot('Text before from end of paragraph', content, 'bc', 2);
    const anchorElm = rng.startContainer.childNodes[1];
    const anchor = TextSearch.textBefore(anchorElm, 1, editorBody);
    assertSpot('Text before from end of anchor', anchor, 'a', 1);
  });

  it('TBA: text before from text node', () => {
    const editor = hook.editor();
    const editorBody = editor.getBody();
    editor.setContent('<p>*<a href="#">a</a>bc</p>');
    TinySelections.setCursor(editor, [ 0, 2 ], 2);

    const rng = editor.selection.getRng();
    const contentEnd = TextSearch.textBefore(rng.startContainer, 2, editorBody);
    assertSpot('Text before within text node', contentEnd, 'bc', 2);
    const contentStart = TextSearch.textBefore(rng.startContainer, 0, editorBody);
    assertSpot('Text before within text node', contentStart, 'bc', 0);
  });

  it('TBA: scan right over fragmented text', () => {
    const editor = hook.editor();
    const editorBody = editor.getBody();
    editor.setContent('<p>*<a href="#">a</a>bc</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);

    const startNode = editor.selection.getRng().startContainer as Text;
    const start = TextSearch.scanRight(startNode, 1, editorBody);
    const anchor = TextSearch.scanRight(startNode, 2, editorBody);
    const content = TextSearch.scanRight(startNode, 4, editorBody);
    const outOfRange = TextSearch.scanRight(startNode, 10, editorBody);
    assertSpot('Scan right same text node', start, '*', 1);
    assertSpot('Scan right into anchor element', anchor, 'a', 1);
    assertSpot('Scan right over anchor element', content, 'bc', 2);
    assert.isTrue(outOfRange.isNone(), 'Scan right with out of range offset is none');
  });

  it('TBA: scan left over fragmented text', () => {
    const editor = hook.editor();
    const editorBody = editor.getBody();
    editor.setContent('<p>*<a href="#">a</a>bc</p>');
    TinySelections.setCursor(editor, [ 0, 2 ], 2);

    const startNode = editor.selection.getRng().startContainer as Text;
    const start = TextSearch.scanLeft(startNode, 1, editorBody);
    const anchor = TextSearch.scanLeft(startNode, -1, editorBody);
    const content = TextSearch.scanLeft(startNode, -2, editorBody);
    const outOfRange = TextSearch.scanLeft(startNode, -10, editorBody);
    assertSpot('Scan left same text node', start, 'bc', 1);
    assertSpot('Scan left into anchor element', anchor, 'a', 0);
    assertSpot('Scan left over anchor element', content, '*', 0);
    assert.isTrue(outOfRange.isNone(), 'Scan left with out of range offset is none');
  });

  it('TBA: repeat left over fragmented text', () => {
    const editor = hook.editor();
    const editorBody = editor.getBody();
    editor.setContent('<p>def</p><p>*<a href="#">a</a>bc</p>');
    TinySelections.setCursor(editor, [ 1, 2 ], 2);

    const asteriskNode = editorBody.childNodes[1].firstChild as Text;
    const anchorNode = asteriskNode.nextSibling?.firstChild as Text;
    const asterisk = repeatLeftUntil(editor, '*') as Text;
    Assertions.assertDomEq('Repeat left until asterisk found', SugarElement.fromDom(asteriskNode), SugarElement.fromDom(asterisk));
    const anchor = repeatLeftUntil(editor, 'a') as Text;
    Assertions.assertDomEq('Repeat left until anchor found', SugarElement.fromDom(anchorNode), SugarElement.fromDom(anchor));
    const boundary = repeatLeftUntil(editor, 'def');
    assert.isNull(boundary, 'Repeat left until block boundary found');
  });

  it('TBA: repeat right over fragmented text', () => {
    const editor = hook.editor();
    const editorBody = editor.getBody();
    editor.setContent('<p>*<a href="#">a</a>bc</p><p>def</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);

    const contentNode = editorBody.childNodes[0].lastChild as Text;
    const anchorNode = contentNode.previousSibling?.firstChild as Text;
    const asterisk = repeatRightUntil(editor, 'bc') as Text;
    Assertions.assertDomEq('Repeat right until bc found', SugarElement.fromDom(contentNode), SugarElement.fromDom(asterisk));
    const anchor = repeatRightUntil(editor, 'a') as Text;
    Assertions.assertDomEq('Repeat right until anchor found', SugarElement.fromDom(anchorNode), SugarElement.fromDom(anchor));
    const boundary = repeatRightUntil(editor, 'def');
    assert.isNull(boundary, 'Repeat right until block boundary found');
  });
});
