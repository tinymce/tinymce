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

describe('browser.tinymce.core.annotate.OutlineOnBlocksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('init', () => {
        editor.annotator.register('test-comment', {
          decorate: (_uid, _data) => ({
            classes: [ 'tox-comment' ]
          })
        });
      });
    }
  }, [], true);

  const emptyOutline: Outline = {
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

  const pAssertOutline = (editor: Editor, selector: string, expected: Outline, checkOtherNodes: boolean = true) =>
    Waiter.pTryUntil('Should have correct outline', () => {
      const elm = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
      const actual = getOutline(elm);
      assert.deepEqual(actual, expected);

      if (checkOtherNodes) {
        const parents = SelectorFilter.ancestors(elm, '*', (e) => Compare.eq(e, TinyDom.body(editor)));
        const children = SelectorFilter.children(elm, '*');
        const isFigCaption = SugarNode.isTag('figcaption');

        Arr.each(parents, (e) => assert.deepEqual(getOutline(e), emptyOutline, 'parent should not have outline'));
        Arr.each(children, (e) => assert.deepEqual(getOutline(e), isFigCaption(e) ? emptyFigCaptionOutline : emptyOutline, 'child should not have outline'));
      }
    });

  before(() => {
    const editor = hook.editor();
    Class.add(TinyDom.body(editor), 'tox-comments-visible');
  });

  const imageHtml = '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="600" height="400"></p>';
  const figureImageHtml = '<figure class="image" contenteditable="false">' +
    '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="600" height="400">' +
    '<figcaption contenteditable="true">Caption</figcaption>' +
    '</figure>';
  const codesampleHtml = `<pre class="language-markup" contenteditable="false">test</pre>`;
  const iframeHtml =
    `<span class="mce-preview-object" contenteditable="false" data-mce-object="iframe">` +
    '<iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>' +
    '<span class="mce-shim"></span>' +
    '</span>';
  const audioHtml =
    `<span class="mce-preview-object" contenteditable="false" data-mce-object="audio">` +
    '<audio src="custom/audio.mp3" controls="controls"></audio>' +
    '<span class="mce-shim"></span>' +
    '</span>';
  const videoMediaHtml =
    `<span class="mce-preview-object" contenteditable="false" data-mce-object="video">` +
    '<video controls="controls" width="300" height="150"><source src="custom/video.mp4" type="video/mp4"></video>' +
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
    '<iframe src="custom/file.pdf" width="350px" height="260px" scrolling="no"></iframe>' +
    '</div>';

  Arr.each([
    { label: 'image', name: 'img', html: imageHtml },
    { label: 'image with caption', name: 'img', outlineSelector: 'figure.image', html: figureImageHtml },
    { label: 'codesample', name: 'pre', html: codesampleHtml },
    { label: 'table of contents', name: 'div.mce-toc', html: tocHtml },
    { label: 'iframe (YouTube video)', name: 'iframe', outlineSelector: 'span.mce-preview-object', html: iframeHtml },
    { label: 'audio', name: 'audio', outlineSelector: 'span.mce-preview-object', html: audioHtml },
    { label: 'video', name: 'video', outlineSelector: 'span.mce-preview-object', html: videoMediaHtml },
    { label: 'mediaembed iframe (YouTube video)', name: 'iframe', outlineSelector: 'div[data-ephox-embed-iri]', html: iframeMediaEmbedHtml },
    { label: 'mediaembed video', name: 'video', outlineSelector: 'div[data-ephox-embed-iri]', html: videoMediaEmbedHtml },
    { label: 'mediaembed audio', name: 'audio', outlineSelector: 'div[data-ephox-embed-iri]', html: audioMediaEmbedHtml },
    { label: 'pageembed website', name: 'iframe', outlineSelector: 'div.tiny-pageembed', html: pageEmbedHtml },
  ], ({ label, name, outlineSelector, html }) => {
    context(label, () => {
      const editorHtml = `<p>Before</p>${html}<p>After</p>`;
      const selector = outlineSelector ?? name;
      const selectElm = (editor: Editor) => TinySelections.select(editor, selector, []);

      beforeEach(() => {
        const editor = hook.editor();
        editor.setContent(editorHtml, { format: 'raw' });
      });

      it('should have no outline when not selected and has no attributes', async () => {
        const editor = hook.editor();
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        await pAssertOutline(editor, selector, emptyOutline);
      });

      it('should have blue outline when selected', async () => {
        const editor = hook.editor();
        selectElm(editor);
        await pAssertOutline(editor, selector, selectedOutline);
      });

      it('TINY-8698: should have yellow outline when element has comment attribute but is not selected', async () => {
        const editor = hook.editor();
        selectElm(editor);
        editor.annotator.annotate('test-comment', {});
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        await pAssertOutline(editor, selector, commentOutline);
      });

      it('TINY-8698: should have blue outline when element with comment attribute is selected', async () => {
        const editor = hook.editor();
        selectElm(editor);
        editor.annotator.annotate('test-comment', {});
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        selectElm(editor);
        await pAssertOutline(editor, selector, selectedOutline);
      });
    });
  });

  context('editable element within noneditable element', () => {
    it('should have blue outline for nested editable region and blue outline for noneditable ancestor (editable region selected)', async () => {
      const editor = hook.editor();
      editor.setContent(figureImageHtml);
      TinySelections.setCursor(editor, [ 1, 1, 0 ], 1, true);
      await pAssertOutline(editor, 'figure.image', selectedOutline, false);
      await pAssertOutline(editor, 'figcaption', selectedOutline, false);
    });

    it('TINY-8698: should have blue outline for nested editable region when selected noneditable ancestor has a comment', async () => {
      const editor = hook.editor();
      editor.setContent(figureImageHtml);
      TinySelections.select(editor, 'img', []);
      editor.annotator.annotate('test-comment', {});
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1, true);
      await pAssertOutline(editor, 'figure.image', selectedOutline, false);
      await pAssertOutline(editor, 'figcaption', selectedOutline, false);
    });
  });
});
