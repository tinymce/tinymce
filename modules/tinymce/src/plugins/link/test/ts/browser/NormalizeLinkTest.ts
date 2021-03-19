import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { TinyHooks } from '@ephox/mcagar';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { getSelectedLink } from 'tinymce/plugins/link/core/NormalizeLink';
import Theme from 'tinymce/themes/silver/Theme';

interface BaseRange {
  startPath: number[];
  startOffset: number;
  endPath: number[];
  endOffset: number;
}

describe('browser.tinymce.plugins.link.NormalizeLink', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  const makeRange = (startPath: number[], startOffset: number, endPath: number[], endOffset: number): BaseRange => {
    return { startPath, startOffset, endPath, endOffset };
  };

  const makeCaretRange = (path: number[], offset: number): BaseRange => {
    return { startPath: path, startOffset: offset, endPath: path, endOffset: offset };
  };

  const resolveTestRange = (scope: SugarElement<Node>, range: BaseRange): Range => {
    const doc = scope.dom.ownerDocument;
    const rng = doc.createRange();
    const startContainer = Hierarchy.follow(scope, range.startPath).getOrDie('Failed to resolve start path');
    const endContainer = Hierarchy.follow(scope, range.endPath).getOrDie('Failed to resolve end path');
    rng.setStart(startContainer.dom, range.startOffset);
    rng.setEnd(endContainer.dom, range.endOffset);
    return rng;
  };

  const test = (html: string, range: BaseRange, expectedLink: Optional<number[]>): void => {
    const editor = hook.editor();
    const scope = SugarElement.fromDom(editor.getBody());

    editor.setContent(html);
    const resolvedRange = resolveTestRange(scope, range);
    editor.selection.setRng(resolvedRange);

    const link = getSelectedLink(editor, editor.selection.getNode());
    const path = link.bind((link) => Hierarchy.path(scope, SugarElement.fromDom(link)))
      .orThunk(() => Hierarchy.path(scope, SugarElement.fromHtml('<b><b/>')));

    KAssert.eqOptional('Should be expected path', expectedLink, path);
  };

  it('TINY-6508: Should find a link if the end selection is after the link but before a br', () => {
    test('<p><a href="tiny">test</a><br></p>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 1), Optional.some([ 0, 0 ]));
  });

  it('TINY-6508: Should not find a link if there are short ended elements between the link and the br', () => {
    test('<p><a href="tiny">test</a><br><img><br></p>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 3), Optional.none());
  });

  it('TINY-6508: Should find a link if the link is wrapped in another inline element', () => {
    test('<p><b><a href="tiny">test</a></b><br></p>', makeRange([ 0, 0, 0, 0 ], 0, [ 0 ], 1), Optional.some([ 0, 0, 0 ]));
  });

  it('TINY-6508: Should not find a link if there is a block element between it and the br', () => {
    test('<p><b><a href="tiny">test</a></b><b><div>tiny</div></b><br></p>', makeRange([ 0, 0, 0, 0 ], 0, [ 0 ], 2), Optional.none());
  });

  it('TINY-6508: Should find a link if the selection start at the links child and end before a br', () => {
    test('<p><a href="tiny"><strong>word</strong>other</a><br></p>', makeRange([ 0, 0, 0, 0 ], 0, [ 0 ], 1), Optional.some([ 0, 0 ]));
  });

  it('TINY-6508: Should find a link, Single link with two level nested child', () => {
    test('<p><a href="tiny"><strong><span>word</span></strong>other</a><br></p>', makeRange([ 0, 0, 0, 0 ], 0, [ 0 ], 1), Optional.some([ 0, 0 ]));
  });

  it('TINY-6508: Should find a link, Nested link at the end of the line', () => {
    test('<p><em>test</em><b><a href="tiny">test</a></b><br></p>', makeRange([ 0, 1, 0 ], 0, [ 0 ], 2), Optional.some([ 0, 1, 0 ]));
  });

  it('TINY-6508: Should not find a link if there is another link between it and the br', () => {
    test('<p><a href="tiny">link1</a>content<a href="tiny">link2</a><br></p>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 3), Optional.none());
  });

  it('TINY-6508: Should not find a link if it has a nested Img', () => {
    test('<p><a href="tiny"><img src="image.jpg"></a>text<br></p>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 2), Optional.none());
  });

  it('TINY-6508: Should not find a link if the selection ends between two br', () => {
    test('<p>text<a href="tiny">test</a><br><br></p>', makeRange([ 0, 1, 0 ], 0, [ 0 ], 3), Optional.none());
  });

  it('TINY-6508: Should not find a link if the selection ends in another block element (paragraph)', () => {
    test('<p>text<a href="tiny">test</a><br></p><p>info<br></p>', makeRange([ 0, 1, 0 ], 0, [ 1 ], 1), Optional.none());
  });

  it('TINY-6508: Should not find a link if there are elements between it and the br (header)', () => {
    test('<h1><a href="tiny">tiny</a><span>tiny</span><br></h1>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 2), Optional.none());
  });

  it('TINY-6508: Should not find a link if the selection ends in another block element (header)', () => {
    test('<h1><a href="tiny">test</a><br></h1><h1>info<br></h1>', makeRange([ 0, 0, 0 ], 0, [ 1 ], 1), Optional.none());
  });

  it('TINY-6508: Should not find a link if there are elements between it and the br (div)', () => {
    test('<div><a href="tiny">tiny</a><em>tiny</em><br></div>', makeRange([ 0, 0, 0 ], 0, [ 0 ], 2), Optional.none());
  });

  it('TINY-6508: Should not find a link if the selection ends in another block element (div)', () => {
    test('<div><a href="tiny">test</a><br></div><div>info<br></div>', makeRange([ 0, 0, 0 ], 0, [ 1 ], 1), Optional.none());
  });

  it('TINY-6508: Does not return a link since the caret is after the link', () => {
    test('<p><a href="tiny">x</a><br></p>', makeCaretRange([ 0 ], 1), Optional.none());
  });

  describe('IE', () => {
    it('TINY-6508: Return a link if the selection starts in the link and end in the link text', () => {
      test('<p><a href="tiny">link</a></p>', makeRange([ 0 ], 0, [ 0, 0, 0 ], 4), Optional.some([ 0, 0 ]));
    });
  });
});
