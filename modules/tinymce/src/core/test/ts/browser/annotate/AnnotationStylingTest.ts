import { UiFinder, Waiter } from '@ephox/agar';
import { before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Class, Compare, Css, SelectorFilter, SugarElement, SugarNode } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface Outline {
  readonly color: string;
  readonly style: string;
  readonly width: string;
}

describe('browser.tinymce.core.annotate.AnnotationStylingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('init', () => {
        editor.annotator.register('test-annotation', {
          decorate: (_uid, _data) => ({
            classes: []
          })
        });
        editor.annotator.register('test-comment', {
          decorate: (_uid, _data) => ({
            classes: [ 'tox-comment' ]
          })
        });
      });
    }
  }, [], true);

  before(() => {
    const editor = hook.editor();
    Class.add(TinyDom.body(editor), 'tox-comments-visible');
  });

  const noOutline: Outline = {
    color: 'rgb(0, 0, 0)',
    width: '0px',
    style: 'none'
  };

  const emptyFigCaptionOutline: Outline = {
    color: 'rgb(153, 153, 153)',
    width: '0px',
    style: 'none'
  };

  const selectedOutline: Outline = {
    color: 'rgb(180, 215, 255)', // #b4d7ff
    width: '3px',
    style: 'solid'
  };

  const commentOutline: Outline = {
    color: 'rgb(255, 232, 157)', // #ffe89d
    width: '3px',
    style: 'solid'
  };

  const commentActiveOutline: Outline = {
    color: 'rgb(254, 214, 53)', // #fed635
    width: '3px',
    style: 'solid'
  };

  const noBackgroundColor = 'rgba(0, 0, 0, 0)';
  const commentBackgroundColor = 'rgb(255, 232, 157)'; // #ffe89d
  const commentActiveBackgroundColor = 'rgb(254, 214, 53)'; // #fed635
  const inlineBoundaryBackgroundColor = 'rgb(180, 215, 255)'; // #b4d7ff

  const getOutline = (elm: SugarElement<Element>): Outline => {
    const color = Css.get(elm, 'outline-color');
    const width = Css.get(elm, 'outline-width');
    const style = Css.get(elm, 'outline-style');
    return {
      color,
      width,
      style
    };
  };

  const getBackgroundColor = (elm: SugarElement<Element>) =>
    Css.get(elm, 'background-color');

  const pAssertStyling = (editor: Editor, selector: string, expectedBackgroundColor: string, expectedOutline: Outline, checkOtherNodes: boolean = true) =>
    Waiter.pTryUntil('Should have correct styling', () => {
      const body = TinyDom.body(editor);
      const elm = UiFinder.findIn(body, selector).getOrDie();
      const actualBackgroundColor = getBackgroundColor(elm);
      const actualOutline = getOutline(elm);
      assert.equal(actualBackgroundColor, expectedBackgroundColor);
      assert.deepEqual(actualOutline, expectedOutline);

      if (checkOtherNodes) {
        const parents = SelectorFilter.ancestors(elm, '*', (e) => Compare.eq(e, body));
        const children = SelectorFilter.children(elm, '*:not(source)'); // Source is a hidden element and Firefox returns empty strings for runtime style properties
        const isFigCaption = SugarNode.isTag('figcaption');

        Arr.each(parents, (e) => assert.deepEqual(getOutline(e), noOutline, 'parent should not have outline'));
        Arr.each(children, (e) => assert.deepEqual(getOutline(e), isFigCaption(e) ? emptyFigCaptionOutline : noOutline, 'child should not have outline'));
      }
    });

  const imageHtml = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="600" height="400">';
  const audioHtml = '<audio src="custom/audio.mp3" controls="controls"></audio>';
  const videoHtml = '<video controls="controls" width="300" height="150"><source src="custom/video.mp4" type="video/mp4"></video>';
  const figureImageHtml = '<figure class="image" contenteditable="false">' +
    imageHtml +
    '<figcaption contenteditable="true">Caption</figcaption>' +
    '</figure>';
  const codesampleHtml = `<pre class="language-markup" contenteditable="false">test</pre>`;
  const iframeMediaHtml =
    `<span class="mce-preview-object" contenteditable="false" data-mce-object="iframe">` +
    '<iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>' +
    '<span class="mce-shim"></span>' +
    '</span>';
  const audioMediaHtml =
    `<span class="mce-preview-object" contenteditable="false" data-mce-object="audio">` +
    audioHtml +
    '<span class="mce-shim"></span>' +
    '</span>';
  const videoMediaHtml =
    `<span class="mce-preview-object" contenteditable="false" data-mce-object="video">` +
    videoHtml +
    '<span class="mce-shim"></span>' +
    '</span>';
  const tocHtml = '<div class="mce-toc" contenteditable="false">' +
    '<h2 contenteditable="true">Table of Contents</h2>' +
    '<ul>' +
    '<li><a href="#mcetoc_">Heading</a></li>' +
    '</ul>' +
    '</div>';
  const iframeMediaEmbedHtml = '<div style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.25%; max-width: 650px;" data-ephox-embed-iri="https://www.youtube.com/watch?v=8aGhZQkoFbQ" contenteditable="false">' +
    '<iframe style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" src="https://www.youtube.com/embed/8aGhZQkoFbQ?rel=0" scrolling="no" allowfullscreen="allowfullscreen"></iframe>' +
    '</div>';
  const videoMediaEmbedHtml = '<div style="max-width: 650px;" data-ephox-embed-iri="custom/video.mp4" contenteditable="false">' +
    '<video style="width: 100%;" controls="controls">' +
    '<source src="custom/video.mp4" type="video/mp4">' +
    '</video>' +
    '</div>';
  const audioMediaEmbedHtml = '<div style="max-width: 650px;" data-ephox-embed-iri="custom/audio.mp3" contenteditable="false">' +
    '<audio style="width: 100%;" controls="controls">' +
    '<source src="custom/audio.mp3" type="audio/mpeg">' +
    '</audio>' +
    '</div>';
  const pageEmbedHtml = '<div class="tiny-pageembed" contenteditable="false">' +
    '<iframe src="about:blank" width="350px" height="260px" scrolling="no"></iframe>' +
    '</div>';

  Arr.each([
    { label: 'image', name: 'img', html: `<p>${imageHtml}</p>` },
    { label: 'audio', name: 'audio', html: `<p>${audioHtml}</p>` },
    { label: 'video', name: 'video', html: `<p>${videoHtml}</p>` },
    { label: 'image with caption', name: 'img', outlineSelector: 'figure.image', html: figureImageHtml },
    { label: 'codesample', name: 'pre', html: codesampleHtml, backgroundColor: 'rgb(245, 242, 240)' },
    { label: 'table of contents', name: 'div.mce-toc', html: tocHtml },
    { label: 'media iframe (YouTube video)', name: 'iframe', outlineSelector: 'span.mce-preview-object', html: iframeMediaHtml },
    { label: 'media audio', name: 'audio', outlineSelector: 'span.mce-preview-object', html: audioMediaHtml },
    { label: 'media video', name: 'video', outlineSelector: 'span.mce-preview-object', html: videoMediaHtml },
    { label: 'mediaembed iframe (YouTube video)', name: 'iframe', outlineSelector: 'div[data-ephox-embed-iri]', html: iframeMediaEmbedHtml },
    { label: 'mediaembed video', name: 'video', outlineSelector: 'div[data-ephox-embed-iri]', html: videoMediaEmbedHtml },
    { label: 'mediaembed audio', name: 'audio', outlineSelector: 'div[data-ephox-embed-iri]', html: audioMediaEmbedHtml },
    { label: 'pageembed website', name: 'iframe', outlineSelector: 'div.tiny-pageembed', html: pageEmbedHtml },
  ], (scenario) => {
    const { label, name, outlineSelector, html } = scenario;
    context(label, () => {
      const editorHtml = `<p>Before</p>${html}<p>After</p>`;
      const selector = outlineSelector ?? name;
      const backgroundColor = scenario.backgroundColor ?? noBackgroundColor;
      const selectElm = (editor: Editor) => TinySelections.select(editor, selector, []);

      beforeEach(() => {
        const editor = hook.editor();
        editor.setContent(editorHtml, { format: 'raw' });
      });

      it('should have no outline when not selected and has no attributes', async () => {
        const editor = hook.editor();
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        await pAssertStyling(editor, selector, backgroundColor, noOutline);
      });

      it('should have blue outline when selected', async () => {
        const editor = hook.editor();
        selectElm(editor);
        await pAssertStyling(editor, selector, backgroundColor, selectedOutline);
      });

      it('TINY-8698: should have yellow outline when element has comment attribute but is not selected', async () => {
        const editor = hook.editor();
        selectElm(editor);
        editor.annotator.annotate('test-comment', {});
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        await pAssertStyling(editor, selector, backgroundColor, commentOutline);
      });

      it('TINY-8698: should have blue outline when element with comment attribute is selected', async () => {
        const editor = hook.editor();
        selectElm(editor);
        editor.annotator.annotate('test-comment', {});
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        selectElm(editor);
        await pAssertStyling(editor, selector, backgroundColor, selectedOutline);
      });

      it('TINY-8698: should have active yellow outline when there are several related comments but the element is not selected', async () => {
        const editor = hook.editor();
        editor.execCommand('SelectAll');
        editor.annotator.annotate('test-comment', {});
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        await pAssertStyling(editor, selector, backgroundColor, commentActiveOutline);
      });
    });
  });

  context('text comments', () => {
    it('should have no background when not selected and has no attributes', async () => {
      const editor = hook.editor();
      editor.setContent('<p>one two</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await pAssertStyling(editor, 'p', noBackgroundColor, noOutline);
    });

    it('should have blue background when basic annotated text is selected', async () => {
      const editor = hook.editor();
      editor.setContent('<p>one two</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.annotator.annotate('test-annotation', {});
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await pAssertStyling(editor, 'span', inlineBoundaryBackgroundColor, noOutline);
    });

    it('TINY-8698: should have yellow background on commented text when is not selected', async () => {
      const editor = hook.editor();
      editor.setContent('<p>one two</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.annotator.annotate('test-comment', {});
      TinySelections.setCursor(editor, [ 0, 1 ], 3);
      await pAssertStyling(editor, 'span', commentBackgroundColor, noOutline);
    });

    it('TINY-8698: should have blue background on commented text when it is selected', async () => {
      const editor = hook.editor();
      editor.setContent('<p>one two</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.annotator.annotate('test-comment', {});
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      await pAssertStyling(editor, 'span', inlineBoundaryBackgroundColor, noOutline);
    });

    it('TINY-8698: should have blue background on commented text when it is selected and yellow background for other related comments', async () => {
      const editor = hook.editor();
      editor.setContent('<p>one two</p><p>three four</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [], 2);
      editor.annotator.annotate('test-comment', {});
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      await pAssertStyling(editor, 'span[data-mce-selected]', inlineBoundaryBackgroundColor, noOutline);
      await pAssertStyling(editor, 'span:not([data-mce-selected])', commentActiveBackgroundColor, noOutline);
    });
  });

  context('text and block comments', () => {
    it('TINY-8698: should have blue background on commented text when it is selected and yellow background or outline for other related comments', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>one two</p><p>${imageHtml}</p>${figureImageHtml}<p>three four</p>`);
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [], 4);
      editor.annotator.annotate('test-comment', {});
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      await pAssertStyling(editor, 'span[data-mce-selected]:contains("two")', inlineBoundaryBackgroundColor, noOutline);
      await pAssertStyling(editor, 'span:not([data-mce-selected]):contains("three four")', commentActiveBackgroundColor, noOutline);
      await pAssertStyling(editor, 'span img', noBackgroundColor, commentActiveOutline);
      await pAssertStyling(editor, 'figure', noBackgroundColor, commentActiveOutline);
    });

    it('TINY-8698: should have blue outline on commented block when it is selected and yellow background or outline for other related comments', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>one two</p><p>${imageHtml}</p>${figureImageHtml}<p>three four</p>`);
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [], 4);
      editor.annotator.annotate('test-comment', {});
      TinySelections.select(editor, 'figure', []);
      await pAssertStyling(editor, 'span:contains("two")', commentBackgroundColor, noOutline);
      await pAssertStyling(editor, 'span:contains("three four")', commentBackgroundColor, noOutline);
      await pAssertStyling(editor, 'span img', noBackgroundColor, commentActiveOutline);
      await pAssertStyling(editor, 'figure', noBackgroundColor, selectedOutline);
    });
  });

  context('editable element within noneditable element', () => {
    it('should have blue outline for nested editable region and blue outline for noneditable ancestor (editable region selected)', async () => {
      const editor = hook.editor();
      editor.setContent(figureImageHtml);
      TinySelections.setCursor(editor, [ 1, 1, 0 ], 1, true);
      await pAssertStyling(editor, 'figure.image', noBackgroundColor, selectedOutline, false);
      await pAssertStyling(editor, 'figcaption', noBackgroundColor, selectedOutline, false);
    });

    it('TINY-8698: should have blue outline for nested editable region when selected noneditable ancestor has a comment', async () => {
      const editor = hook.editor();
      editor.setContent(figureImageHtml);
      TinySelections.select(editor, 'img', []);
      editor.annotator.annotate('test-comment', {});
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1, true);
      await pAssertStyling(editor, 'figure.image', noBackgroundColor, selectedOutline, false);
      await pAssertStyling(editor, 'figcaption', noBackgroundColor, selectedOutline, false);
    });
  });
});
