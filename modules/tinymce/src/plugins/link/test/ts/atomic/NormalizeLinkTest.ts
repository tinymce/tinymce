import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { getSelectedLink } from 'tinymce/plugins/link/core/NormalizeLink';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.link.NormalizeLink', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  const makeRange = (startPath, startOffset, endPath, endOffset) => {
    return { startPath, startOffset, endPath, endOffset };
  };

  const makeCaretRange = (path, offset) => {
    return { startPath: path, startOffset: offset, endPath: path, endOffset: offset };
  };

  const resolveTestRange = (scope: SugarElement<Node>, range) => {
    const doc = scope.dom.ownerDocument;
    const rng = doc.createRange();
    const startContainer = Hierarchy.follow(scope, range.startPath).getOrDie('Failed to resolve start path');
    const endContainer = Hierarchy.follow(scope, range.endPath).getOrDie('Failed to resolve end path');
    rng.setStart(startContainer.dom, range.startOffset);
    rng.setEnd(endContainer.dom, range.endOffset);
    return rng;
  };

  const test = (html, range, expectedLink) => {
    const editor = hook.editor();
    const scope = SugarElement.fromDom(editor.getBody());
    editor.setContent(html);
    const resolvedRange = resolveTestRange(scope, range);
    editor.selection.setRng(resolvedRange);
    const link = getSelectedLink(editor);
    const solvedLink = link ? SugarElement.fromDom(link) : SugarElement.fromHtml('<b><b/>');
    const path = Hierarchy.path(scope, solvedLink);

    assert.deepEqual(path.getOrNull(), expectedLink.getOrNull());
  };

  describe('Returns a link if the end selection is after the link but before a br', () => {
    it('TINY-6508: Single link', () => {
      test('<p><a href="#">test</a><br></p>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 1), Optional.some([ 0, 0 ]));
    });

    it('TINY-6508: Multiple short ended elements', () => {
      test('<p><a href="#">test</a><br><img><br></p>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 3), Optional.some([ 0, 0 ]));
    });

    it('TINY-6508: Nested link', () => {
      test('<p><b><a href="#">test</a></b><br></p>', makeRange([ 0, 0, 0, 0 ], 0, [ 0 ], 1), Optional.some([ 0, 0, 0 ]));
    });
  });

  it('TINY-6508: Return a link if the selection starts in the link and end in the link text', () => {
    test('<p><a href="#">link</a></p>', makeRange([ 0, 0 ], 0, [ 0, 0, 0 ], 3), Optional.some([ 0, 0 ]));
  });

  it('TINY-6508: Does not return a link since the caret is after the link', () => {
    test('<p><a href="#">x</a><br></p>', makeCaretRange([ 0 ], 1), Optional.some(null));
  });
});
