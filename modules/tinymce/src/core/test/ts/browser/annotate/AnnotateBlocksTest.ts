import { Cursors, Waiter } from '@ephox/agar';
import { before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import { annotate, assertMarkings, assertHtmlContent } from '../../module/test/AnnotationAsserts';

interface AnnotationChangeData {
  readonly state: boolean;
  readonly uid: string;
  readonly rawNodes: Node[];
  readonly nodeNames: string[];
}

interface AnnotationCount {
  readonly span: number;
  readonly block: number;
}

describe('browser.tinymce.core.annotate.AnnotateBlocksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.annotator.register('test-annotation', {
          decorate: (_uid, data) => ({
            attributes: {
              'data-test-anything': data.anything
            },
            classes: [ 'test-class' ]
          })
        });
        ed.annotator.annotationChanged('test-annotation', (state, _name, data) => {
          annotationChangeData.push({
            state,
            uid: data?.uid ?? '',
            rawNodes: data?.nodes ?? [],
            nodeNames: Arr.map(data?.nodes ?? [], (node) => (node as Node).nodeName.toLowerCase())
          });
        });
      });
    }
  }, [], true);

  let uidCounter = 0;
  let annotationChangeData: AnnotationChangeData[] = [];
  const platform = PlatformDetection.detect();

  beforeEach(() => {
    uidCounter = 0;
    annotationChangeData = [];
  });

  const expectedSpanAnnotationAttrs = (uidPostfix: number = 1) =>
    `data-test-anything="something" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid-${uidPostfix}" class="mce-annotation test-class"`;
  const expectedBlockAnnotationAttrs = (uidPostfix: number = 1) =>
    `data-test-anything="something" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid-${uidPostfix}" class="mce-annotation test-class" data-mce-annotation-classes="test-class" data-mce-annotation-attrs="data-test-anything"`;

  const selectionPath = (startPath: number[], soffset: number, finishPath: number[], foffset: number): Cursors.CursorPath => ({
    startPath,
    soffset,
    finishPath,
    foffset
  });

  const pAssertAnnotationChangeData = (expected: Omit<AnnotationChangeData, 'rawNodes'>[]) =>
    Waiter.pTryUntil('annotation change data should be correct', () => {
      assert.lengthOf(annotationChangeData, expected.length);
      Arr.each(annotationChangeData, (data, i) => {
        const expectedData = expected[i];
        assert.equal(data.state, expectedData.state);
        assert.equal(data.uid, expectedData.uid);
        assert.deepEqual(data.nodeNames, expectedData.nodeNames);
      });
    });

  const assertGetAll = (editor: Editor, expected: Record<string, string[]>) => {
    const actual = Obj.map(editor.annotator.getAll('test-annotation'), (nodes, _key) => Arr.map(nodes, (node) => node.nodeName.toLowerCase()));
    assert.deepEqual(actual, expected);
  };

  const testApplyAnnotationOnSelection = (
    editor: Editor,
    setSelection: (editor: Editor) => void,
    expectedHtml: string[],
    expectedSelection: Cursors.CursorPath,
    expectedCounts: AnnotationCount,
    allowExtrasInExpectedHtml: boolean = false
  ): void => {
    setSelection(editor);
    uidCounter += 1;
    annotate(editor, 'test-annotation', `test-uid-${uidCounter}`, { anything: 'something' });
    assertMarkings(editor, expectedCounts.span, expectedCounts.block);
    assertHtmlContent(editor, expectedHtml, allowExtrasInExpectedHtml);
    TinyAssertions.assertSelection(editor, expectedSelection.startPath, expectedSelection.soffset, expectedSelection.finishPath, expectedSelection.foffset);
  };

  const testRemoveAnnotationOnSelection = (
    editor: Editor,
    setSelection: (editor: Editor) => void,
    expectedHtml: string[],
    expectedSelection: Cursors.CursorPath,
    removeAll: boolean,
    expectedCounts: AnnotationCount,
    allowExtrasInExpectedHtml: boolean = false
  ): void => {
    setSelection(editor);
    const remover = removeAll ? editor.annotator.removeAll : editor.annotator.remove;
    remover('test-annotation');
    assertMarkings(editor, expectedCounts.span, expectedCounts.block);
    assertHtmlContent(editor, expectedHtml, allowExtrasInExpectedHtml);
    TinyAssertions.assertSelection(editor, expectedSelection.startPath, expectedSelection.soffset, expectedSelection.finishPath, expectedSelection.foffset);
  };

  const testDirectSelectionAnnotation = (
    editor: Editor,
    selector: string,
    expectedHtml: string[],
    expectedSelection: Cursors.CursorPath,
    expectedCounts: AnnotationCount
  ): void =>
    testApplyAnnotationOnSelection(
      editor,
      () => TinySelections.select(editor, selector, []),
      [
        '<p>Before</p>',
        ...expectedHtml,
        '<p>After</p>'
      ],
      expectedSelection,
      expectedCounts,
      true
    );

  const testAllContentSelectionAnnotation = (
    editor: Editor,
    expectedHtml: string[],
    expectedSelection: Cursors.CursorPath,
    expectedCounts: AnnotationCount,
    expectedId: number = 1
  ): void =>
    testApplyAnnotationOnSelection(
      editor,
      () => editor.execCommand('SelectAll'),
      [
        `<p><span ${expectedSpanAnnotationAttrs(expectedId)}>Before</span></p>`,
        ...expectedHtml,
        `<p><span ${expectedSpanAnnotationAttrs(expectedId)}>After</span></p>`
      ],
      expectedSelection,
      expectedCounts
    );

  const annotationSpanWrapper = (html: string) => (
    `<span ${expectedSpanAnnotationAttrs()}>` +
    html +
    '</span>'
  );

  const mediaWrapper = (html: string, name: string) => (
    `<span class="mce-preview-object" contenteditable="false" data-mce-object="${name}">` +
    html +
    '<span class="mce-shim"></span>' +
    '</span>'
  );

  const imageHtml = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="600" height="400">';
  const iframeHtml = '<iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>';
  const audioHtml = '<audio src="custom/audio.mp3" controls="controls"></audio>';
  const videoHtml = '<video controls="controls" width="300" height="150"><source src="custom/video.mp4" type="video/mp4"></video>';

  const figureImageHtml = (withAnnotation: boolean) => (
    `<figure class="image" contenteditable="false"${withAnnotation ? ' ' + expectedBlockAnnotationAttrs() : ''}>` +
    imageHtml +
    '<figcaption contenteditable="true">Caption</figcaption>' +
    '</figure>'
  );
  const codesampleHtml = (withAnnotation: boolean) =>
    `<pre class="language-markup" contenteditable="false"${withAnnotation ? ' ' + expectedBlockAnnotationAttrs() : ''}>test</pre>`;
  const tocHtml = (withAnnotation: boolean) => (
    `<div class="mce-toc" contenteditable="false" data-mce-toc="true"${withAnnotation ? ' ' + expectedBlockAnnotationAttrs() : ''}>` +
    '<h2 contenteditable="true">Table of Contents</h2>' +
    '<ul>' +
    `<li><a href="#mcetoc_1">Heading</a>${platform.browser.isFirefox() ? '<br>' : ''}</li>` +
    '</ul>' +
    '</div>'
  );
  const iframeMediaHtml = mediaWrapper(iframeHtml, 'iframe');
  const videoMediaHtml = mediaWrapper(videoHtml, 'video');
  const audioMediaHtml = mediaWrapper(audioHtml, 'audio');
  const iframeMediaEmbedHtml = (withAnnotation: boolean) => (
    `<div
      style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.25%; max-width: 650px;"
      data-ephox-embed-iri="https://www.youtube.com/watch?v=8aGhZQkoFbQ"
      contenteditable="false"${withAnnotation ? ' ' + expectedBlockAnnotationAttrs() : ''}>` +
    '<iframe style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" src="https://www.youtube.com/embed/8aGhZQkoFbQ?rel=0" scrolling="no" allowfullscreen="allowfullscreen"></iframe>' +
    '</div>'
  );
  const videoMediaEmbedHtml = (withAnnotation: boolean) => (
    `<div
      style="max-width: 650px;"
      data-ephox-embed-iri="custom/video.mp4"
      contenteditable="false"${withAnnotation ? ' ' + expectedBlockAnnotationAttrs() : ''}>` +
    '<video style="width: 100%;" controls="controls">' +
    '<source src="custom/video.mp4" type="video/mp4">' +
    '</video>' +
    '</div>'
  );
  const audioMediaEmbedHtml = (withAnnotation: boolean) => (
    `<div
      style="max-width: 650px;"
      data-ephox-embed-iri="custom/audio.mp3"
      contenteditable="false"${withAnnotation ? ' ' + expectedBlockAnnotationAttrs() : ''}>` +
    '<audio style="width: 100%;" controls="controls">' +
    '<source src="custom/audio.mp3" type="audio/mpeg">' +
    '</audio>' +
    '</div>');
  const pageEmbedHtml = (withAnnotation: boolean) => (
    `<div class="tiny-pageembed" contenteditable="false"${withAnnotation ? ' ' + expectedBlockAnnotationAttrs() : ''}>` +
    '<iframe src="about:blank" width="350px" height="260px" scrolling="no"></iframe>' +
    '</div>'
  );

  Arr.each([
    {
      label: 'image',
      name: 'img',
      html: `<p>before${imageHtml}after</p>`,
      expectedDirectHtml:
        '<p>before' +
        annotationSpanWrapper(imageHtml) +
        'after</p>',
      expectedRangeHtml:
        `<p><span ${expectedSpanAnnotationAttrs()}>before` +
        imageHtml +
        'after</span></p>',
      expectedDirectSelection: selectionPath([ 1, 1 ], 0, [ 1, 1 ], 1),
      afterRemoveSelection: selectionPath([ 1 ], 1, [ 1 ], 2),
      blockType: 'inline'
    },
    {
      label: 'audio',
      name: 'audio',
      html: `<p>before${audioHtml}after</p>`,
      expectedDirectHtml:
        '<p>before' +
        annotationSpanWrapper(audioHtml) +
        'after</p>',
      expectedRangeHtml:
        `<p><span ${expectedSpanAnnotationAttrs()}>before` +
        audioHtml +
        'after</span></p>',
      expectedDirectSelection: selectionPath([ 1, 1 ], 0, [ 1 ], 2),
      afterRemoveSelection: selectionPath([ 1 ], 1, [ 1 ], 2),
      blockType: 'inline'
    },
    {
      label: 'video',
      name: 'video',
      html: `<p>before<video controls="controls" width="300" height="150"><source src="custom/video.mp4" type="video/mp4"></video>after</p>`,
      expectedDirectHtml:
        '<p>before' +
        annotationSpanWrapper(videoHtml) +
        'after</p>',
      expectedRangeHtml:
        `<p><span ${expectedSpanAnnotationAttrs()}>before` +
        videoHtml +
        'after</span></p>',
      expectedDirectSelection: selectionPath([ 1, 1 ], 0, [ 1 ], 2),
      afterRemoveSelection: selectionPath([ 1 ], 1, [ 1 ], 2),
      blockType: 'inline'
    },
    {
      label: 'image with caption',
      name: 'img',
      annotationSelector: 'figure',
      html: figureImageHtml(false),
      expectedDirectHtml: figureImageHtml(true),
      expectedRangeHtml: figureImageHtml(true),
      expectedDirectSelection: selectionPath([], 1, [], 2),
      blockType: 'root'
    },
    {
      label: 'codesample',
      name: 'pre',
      html: codesampleHtml(false),
      expectedDirectHtml: codesampleHtml(true),
      expectedRangeHtml: codesampleHtml(true),
      expectedDirectSelection: selectionPath([], 1, [], 2),
      blockType: 'root'
    },
    {
      label: 'table of contents',
      name: 'div',
      html: tocHtml(false),
      expectedDirectHtml: tocHtml(true),
      expectedRangeHtml: tocHtml(true),
      expectedDirectSelection: selectionPath([], 1, [], 2),
      blockType: 'root'
    },
    {
      label: 'media iframe (YouTube video)',
      name: 'iframe',
      annotationSelector: 'span.mce-preview-object',
      html:
        '<p>before' +
        iframeMediaHtml +
        'after</p>',
      expectedDirectHtml:
        '<p>before' +
        annotationSpanWrapper(iframeMediaHtml) +
        'after</p>',
      expectedRangeHtml:
        `<p><span ${expectedSpanAnnotationAttrs()}>before` +
        iframeMediaHtml +
        'after</span></p>',
      expectedDirectSelection: selectionPath([ 1, 1 ], 0, [ 1 ], 2),
      afterRemoveSelection: selectionPath([ 1 ], 1, [ 1 ], 2),
      blockType: 'inline'
    },
    {
      label: 'media audio',
      name: 'audio',
      annotationSelector: 'span.mce-preview-object',
      html:
        '<p>before' +
        audioMediaHtml +
        'after</p>',
      expectedDirectHtml:
        '<p>before' +
        annotationSpanWrapper(audioMediaHtml) +
        'after</p>',
      expectedRangeHtml:
        `<p><span ${expectedSpanAnnotationAttrs()}>before` +
        audioMediaHtml +
        'after</span></p>',
      expectedDirectSelection: selectionPath([ 1, 1 ], 0, [ 1 ], 2),
      afterRemoveSelection: selectionPath([ 1 ], 1, [ 1 ], 2),
      blockType: 'inline'
    },
    {
      label: 'media video',
      name: 'video',
      annotationSelector: 'span.mce-preview-object',
      html:
        '<p>before' +
        videoMediaHtml +
        'after</p>',
      expectedDirectHtml:
        '<p>before' +
        annotationSpanWrapper(videoMediaHtml) +
        'after</p>',
      expectedRangeHtml:
        `<p><span ${expectedSpanAnnotationAttrs()}>before` +
        videoMediaHtml +
        'after</span></p>',
      expectedDirectSelection: selectionPath([ 1, 1 ], 0, [ 1 ], 2),
      afterRemoveSelection: selectionPath([ 1 ], 1, [ 1 ], 2),
      blockType: 'inline'
    },
    {
      label: 'mediaembed iframe (YouTube video)',
      name: 'iframe',
      annotationSelector: 'div',
      html: iframeMediaEmbedHtml(false),
      expectedDirectHtml: iframeMediaEmbedHtml(true),
      expectedRangeHtml: iframeMediaEmbedHtml(true),
      expectedDirectSelection: selectionPath([], 1, [], 2),
      blockType: 'root'
    },
    {
      label: 'mediaembed video',
      name: 'video',
      annotationSelector: 'div',
      html: videoMediaEmbedHtml(false),
      expectedDirectHtml: videoMediaEmbedHtml(true),
      expectedRangeHtml: videoMediaEmbedHtml(true),
      expectedDirectSelection: selectionPath([], 1, [], 2),
      blockType: 'root'
    },
    {
      label: 'mediaembed audio',
      name: 'audio',
      annotationSelector: 'div',
      html: audioMediaEmbedHtml(false),
      expectedDirectHtml: audioMediaEmbedHtml(true),
      expectedRangeHtml: audioMediaEmbedHtml(true),
      expectedDirectSelection: selectionPath([], 1, [], 2),
      blockType: 'root'
    },
    {
      label: 'pageembed website',
      name: 'iframe',
      annotationSelector: 'div',
      html: pageEmbedHtml(false),
      expectedDirectHtml: pageEmbedHtml(true),
      expectedRangeHtml: pageEmbedHtml(true),
      expectedDirectSelection: selectionPath([], 1, [], 2),
      blockType: 'root'
    },
  ], (scenario) => {
    const { label, name, html } = scenario;
    const selector = scenario.annotationSelector ?? name;
    const isRootBlock = scenario.blockType === 'root';

    context(label, () => {
      beforeEach(() => {
        const editor = hook.editor();
        editor.setContent(`<p>Before</p>${html}<p>After</p>`, { format: 'raw' });
      });

      it('TINY-8698: should annotate when directly selected', () => {
        const editor = hook.editor();
        testDirectSelectionAnnotation(
          editor,
          selector,
          [ scenario.expectedDirectHtml ],
          scenario.expectedDirectSelection,
          { span: isRootBlock ? 0 : 1, block: isRootBlock ? 2 : 0 }
        );
        assertGetAll(editor, { 'test-uid-1': isRootBlock ? [ selector ] : [ 'span' ] });
      });

      it('TINY-8698: should annotate when in ranged selection', () => {
        const editor = hook.editor();
        testAllContentSelectionAnnotation(
          editor,
          [ scenario.expectedRangeHtml ],
          selectionPath([], 0, [], 3),
          { span: isRootBlock ? 2 : 3, block: isRootBlock ? 1 : 0 }
        );
        assertGetAll(editor, { 'test-uid-1': isRootBlock ? [ 'span', selector, 'span' ] : [ 'span', 'span', 'span' ] });
      });

      if (isRootBlock) {
        it('TINY-8698: should be able to apply ranged annotation after direct selection block annotation', () => {
          const editor = hook.editor();

          testDirectSelectionAnnotation(
            editor,
            selector,
            [ scenario.expectedDirectHtml ],
            scenario.expectedDirectSelection,
            { span: 0, block: 2 }
          );
          assertGetAll(editor, { 'test-uid-1': [ selector ] });

          testAllContentSelectionAnnotation(
            editor,
            [ scenario.expectedDirectHtml ],
            selectionPath([], 0, [], 3),
            { span: 2, block: 1 },
            2
          );
          assertGetAll(editor, { 'test-uid-1': [ selector ], 'test-uid-2': [ 'span', 'span' ] });
        });
      }

      it('TINY-8698: should be able to remove annotation and other annotations of the same id when it is directly selected', () => {
        const editor = hook.editor();

        testAllContentSelectionAnnotation(
          editor,
          [ scenario.expectedRangeHtml ],
          selectionPath([], 0, [], 3),
          { span: isRootBlock ? 2 : 3, block: isRootBlock ? 1 : 0 }
        );

        testRemoveAnnotationOnSelection(
          editor,
          () => TinySelections.select(editor, selector, []),
          [
            `<p>Before</p>`,
            html,
            `<p>After</p>`,
          ],
          scenario.afterRemoveSelection ?? scenario.expectedDirectSelection,
          false,
          { span: 0, block: 0 },
          true
        );
        assertGetAll(editor, {});
      });

      it('TINY-8698: should be able to remove annotation when another annotation with the same uid is selected', () => {
        const editor = hook.editor();
        testAllContentSelectionAnnotation(
          editor,
          [ scenario.expectedRangeHtml ],
          selectionPath([], 0, [], 3),
          { span: isRootBlock ? 2 : 3, block: isRootBlock ? 1 : 0 }
        );

        testRemoveAnnotationOnSelection(
          editor,
          (editor) => TinySelections.setCursor(editor, [ 0, 0, 0 ], 1),
          [
            `<p>Before</p>`,
            html,
            `<p>After</p>`,
          ],
          selectionPath([ 0, 0 ], 1, [ 0, 0 ], 1),
          false,
          { span: 0, block: 0 }
        );
        assertGetAll(editor, {});
      });

      it('TINY-8698: should be able to remove annotation when it is selected without affecting different neighboring annotations', () => {
        const editor = hook.editor();

        testDirectSelectionAnnotation(
          editor,
          selector,
          [ scenario.expectedDirectHtml ],
          scenario.expectedDirectSelection,
          { span: isRootBlock ? 0 : 1, block: isRootBlock ? 2 : 0 }
        );

        testApplyAnnotationOnSelection(
          editor,
          () => TinySelections.setCursor(editor, [ 0, 0 ], 1),
          [
            `<p><span ${expectedSpanAnnotationAttrs(2)}>Before</span></p>`,
            scenario.expectedDirectHtml,
            `<p>After</p>`,
          ],
          // Annotation logic changes selection to word wrap
          selectionPath([], 0, [], 1),
          { span: isRootBlock ? 1 : 2, block: isRootBlock ? 1 : 0 }
        );
        assertGetAll(editor, { 'test-uid-1': isRootBlock ? [ selector ] : [ 'span' ], 'test-uid-2': [ 'span' ] });

        testRemoveAnnotationOnSelection(
          editor,
          () => TinySelections.select(editor, selector, []),
          [
            `<p><span ${expectedSpanAnnotationAttrs(2)}>Before</span></p>`,
            html,
            `<p>After</p>`,
          ],
          scenario.afterRemoveSelection ?? scenario.expectedDirectSelection,
          false,
          { span: 1, block: 0 },
          true
        );
        assertGetAll(editor, { 'test-uid-2': [ 'span' ] });
      });

      it('TINY-8698: should be able to remove annotations when using `removeAll` API', () => {
        const editor = hook.editor();

        testDirectSelectionAnnotation(
          editor,
          selector,
          [ scenario.expectedDirectHtml ],
          scenario.expectedDirectSelection,
          { span: isRootBlock ? 0 : 1, block: isRootBlock ? 2 : 0 }
        );

        testApplyAnnotationOnSelection(
          editor,
          () => TinySelections.setCursor(editor, [ 0, 0 ], 1),
          [
            `<p><span ${expectedSpanAnnotationAttrs(2)}>Before</span></p>`,
            scenario.expectedDirectHtml,
            `<p>After</p>`,
          ],
          // Annotation logic changes selection to word wrap
          selectionPath([], 0, [], 1),
          { span: isRootBlock ? 1 : 2, block: isRootBlock ? 1 : 0 }
        );

        testRemoveAnnotationOnSelection(
          editor,
          () => TinySelections.setCursor(editor, [ 2, 0 ], 1),
          [
            `<p>Before</p>`,
            html,
            `<p>After</p>`,
          ],
          selectionPath([ 2, 0 ], 1, [ 2, 0 ], 1),
          true,
          { span: 0, block: 0 }
        );
        assertGetAll(editor, {});
      });

      it('TINY-8698: should fire `annotationChange` API callback when annotated block is selected', async () => {
        const editor = hook.editor();

        testApplyAnnotationOnSelection(
          editor,
          () => TinySelections.setSelection(editor, [ 0, 0 ], 3, [], 3),
          [
            `<p>Bef<span ${expectedSpanAnnotationAttrs()}>ore</span></p>`,
            scenario.expectedRangeHtml,
            `<p><span ${expectedSpanAnnotationAttrs()}>After</span></p>`,
          ],
          selectionPath([ 0 ], 1, [], 3),
          { span: isRootBlock ? 2 : 3, block: isRootBlock ? 1 : 0 }
        );
        await Waiter.pWait(100);

        annotationChangeData = [];
        TinySelections.setCursor(editor, [ 0, 0 ], 1, true);
        await pAssertAnnotationChangeData([{ state: false, uid: '', nodeNames: [] }]);

        annotationChangeData = [];
        TinySelections.select(editor, selector, []);
        await pAssertAnnotationChangeData([{ state: true, uid: 'test-uid-1', nodeNames: isRootBlock ? [ 'span', selector, 'span' ] : [ 'span', 'span', 'span' ] }]);
      });
    });
  });

  context('multiple blocks', () => {
    it('TINY-8698: Should be able to annotate inline block and root block in same selection', () => {
      const editor = hook.editor();
      editor.setContent(`<p>Before</p>${figureImageHtml(false)}<p>${imageHtml}</p><p>After</p>`);

      testAllContentSelectionAnnotation(
        editor,
        [
          figureImageHtml(true),
          '<p>' +
          `<span ${expectedSpanAnnotationAttrs()}>` +
          imageHtml +
          '</span>' +
          '</p>'
        ],
        selectionPath([], 0, [], 4),
        { span: 3, block: 1 }
      );
      assertGetAll(editor, { 'test-uid-1': [ 'span', 'figure', 'span', 'span' ] });
    });

    it('TINY-8698: Should be able to annotate multiple inline blocks in same paragraph', () => {
      const editor = hook.editor();
      editor.setContent(`<p>Before</p><p>${videoMediaHtml}${iframeMediaHtml}</p><p>After</p>`, { format: 'raw' });

      testAllContentSelectionAnnotation(
        editor,
        [
          '<p>' +
          annotationSpanWrapper(
            videoMediaHtml +
            iframeMediaHtml
          ) +
          '</p>'
        ],
        selectionPath([], 0, [], 3),
        { span: 3, block: 0 }
      );
      assertGetAll(editor, { 'test-uid-1': [ 'span', 'span', 'span' ] });
    });
  });

  context('nested annotation', () => {
    before(function () {
      // TODO: TINY-8820 Safari appears to have a bug where an annotation cannot be applied to the caption text when it is a collapsed selection
      // Instead the annotation is applied to the nearest paragaraph which is incorrect
      if (platform.browser.isSafari()) {
        this.skip();
      }
    });

    it('TINY-8698: should be able to annotate both figure and caption text', () => {
      const editor = hook.editor();
      editor.setContent(`<p>Before</p>${figureImageHtml(false)}<p>After</p>`);

      testDirectSelectionAnnotation(
        hook.editor(),
        'figure',
        [ figureImageHtml(true) ],
        selectionPath([], 1, [], 2),
        { span: 0, block: 2 }
      );

      testApplyAnnotationOnSelection(
        editor,
        () => TinySelections.setCursor(editor, [ 1, 1, 0 ], 1),
        [
          '<p>Before</p>',
          `<figure class="image" contenteditable="false" ${expectedBlockAnnotationAttrs(1)}>${imageHtml}<figcaption><span ${expectedSpanAnnotationAttrs(2)}>Caption</span></figcaption></figure>`,
          '<p>After</p>'
        ],
        selectionPath([ 1 ], 1, [ 1 ], 2),
        { span: 1, block: 1 }
      );
    });
  });

  context('non-annotatable blocks', () => {
    it('TINY-8698: should not annotate hr block if directly selected', () => {
      const editor = hook.editor();
      editor.setContent('<p>Before</p><hr><p>After</p>');

      testDirectSelectionAnnotation(
        editor,
        'hr',
        [ '<hr>' ],
        selectionPath([], 1, [], 2),
        { span: 0, block: 0 }
      );
    });

    it('TINY-8698: should not annotate hr block when part of ranged selection', () => {
      const editor = hook.editor();
      editor.setContent('<p>Before</p><hr><p>After</p>');

      testAllContentSelectionAnnotation(
        editor,
        [ '<hr>' ],
        selectionPath([], 0, [], 3),
        { span: 2, block: 0 }
      );
    });
  });
});
