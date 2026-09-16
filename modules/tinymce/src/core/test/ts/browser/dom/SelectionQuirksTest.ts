import { Keys, Monitor, Mouse } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Focus, PredicateFind, Ready, SelectorFind, SugarDocument, SugarNode, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

describe('browser.tinymce.core.dom.SelectionQuirksTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);
  let normalizeMonitor: Monitor<Range>;

  before(() => {
    const editor = hook.editor();
    // hijack editor.selection.normalize() to count how many times it will be invoked
    normalizeMonitor = Monitor(0, editor.selection.normalize);
    editor.selection.normalize = normalizeMonitor.run;
  });

  const resetNormalizeCounter = () => normalizeMonitor.clear();

  const assertNormalizeCounter = (expected: number) => {
    assert.equal(normalizeMonitor.get(), expected, 'checking normalization counter');
  };

  it('Test normalization for floated images', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<img src="about:blank" style="float: right"></p>');
    TinySelections.setSelection(editor, [ 0 ], 1, [ 0 ], 2);
    const selection = editor.selection.getSel();
    assert.equal(selection?.anchorNode?.nodeName, 'P', 'Anchor node should be the paragraph not the text node');
    assert.equal(selection?.anchorOffset, 1, 'Anchor offset should be the element index');
  });

  it('Normalize on key events when range is collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [], 1, [], 1);
    TinyContentActions.keystroke(editor, Keys.escape());
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });

  it('Normalize on mouse events when range is expanded', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [], 0, [], 1);
    Mouse.trueClick(TinyDom.body(editor));
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
  });

  it('Normalize on mouse events when range is collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [], 1, [], 1);
    Mouse.trueClick(TinyDom.body(editor));
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });

  it('Normalization during operations with modifier keys, should run only once in the end when user releases modifier key.', () => {
    const editor = hook.editor();
    resetNormalizeCounter();
    editor.setContent('<p><b>a</b><i>a</i></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0 ], 0);
    TinyContentActions.keyup(editor, Keys.left(), { shift: true });
    assertNormalizeCounter(0);
    TinyContentActions.keyup(editor, 17, { }); // Single Ctrl
    assertNormalizeCounter(1);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });

  it('TINY-4550: Normalization should not run after selecting all when there is only an image in the content', () => {
    const editor = hook.editor();
    resetNormalizeCounter();
    editor.setContent('<p><img src="about:blank"></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    editor.shortcuts.add('meta+a', null, 'SelectAll');
    const isMac = Env.os.isMacOS() || Env.os.isiOS();
    TinyContentActions.keydown(editor, 65, { metaKey: isMac, ctrlKey: !isMac });
    editor.dispatch('keyup', new KeyboardEvent('keyup', { key: isMac ? 'Meta' : 'Control' }));
    TinyAssertions.assertSelection(editor, [ ], 0, [ ], 1);
  });

  context('TINY-13886: nested list Chrome selection quirk', () => {
    before(function () {
      if (browser.isFirefox() || browser.isSafari()) {
        this.skip();
      }
    });

    const testClickOnRightSideOfLI = async (editor: Editor, { content, path, offset }: { content: string; path: number[]; offset: number }) => {
      const li = SelectorFind.descendant<HTMLLIElement>(TinyDom.body(editor), 'li').getOrDie();
      const firstChild = Traverse.firstChild(li).getOrDie();
      const textNode = SugarNode.isText(firstChild) ? firstChild : PredicateFind.descendant(firstChild, SugarNode.isText).getOrDie();
      const rng = editor.getDoc().createRange();
      rng.setStart(textNode.dom, 0);
      rng.setEnd(textNode.dom, textNode.dom.data.length);
      const rect = rng.getClientRects()[0];

      if (content.includes('<img')) {
        await Ready.image(SelectorFind.descendant<HTMLImageElement>(li, 'img').getOrDie()).catch(Fun.noop);
      }

      const target: EventTarget = li.dom;
      const mouseEvent = {
        target,
        clientX: rect.right + 100,
        clientY: rect.top + rect.height / 2
      } as MouseEvent;
      editor.dispatch('mousedown', mouseEvent);
      editor.dispatch('click', mouseEvent);
      editor.dispatch('mouseup', mouseEvent);

      TinyAssertions.assertCursor(editor, path, offset);
    };

    const cases = [
      { content: '<ol><li>abc<div>def</div></li></ol>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ol><li>abc\n<div>def</div></li></ol>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ul><li>abc<br><div>def</div></li></ul>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ul><li>abc<div>def</div></li></ul>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ul><li>abc\n<div>def</div></li></ul>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ol><li>abc<ul><li>def</li></ul></li></ol>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ul><li>abc<ul><li>def</li></ul></li></ul>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ol><li><span style="border: 2px solid red;">abc</span><div>def</div></li></ol>', path: [ 0, 0, 0, 0 ], offset: 3 },
      { content: '<ol><li><span style="border: 2px solid red;">abc</span>\n<div>def</div></li></ol>', path: [ 0, 0, 0, 0 ], offset: 3 },
      { content: '<ul><li><span style="border: 2px solid red;">abc</span><div>def</div></li></ul>', path: [ 0, 0, 0, 0 ], offset: 3 },
      { content: '<ol><li><span style="border: 2px solid red;">abc</span><ul><li>def</li></ul></li></ol>', path: [ 0, 0, 0, 0 ], offset: 3 },
      { content: '<ul><li><span style="border: 2px solid red;">abc</span><ul><li>def</li></ul></li></ul>', path: [ 0, 0, 0, 0 ], offset: 3 },
      { content: '<ol><li>abc<span style="display: block;">def</span></li></ol>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ul><li>abc<span style="display: block;">def</span></li></ul>', path: [ 0, 0, 0 ], offset: 3 },
      { content: '<ol><li><span style="border: 2px solid red;">abc</span><span style="display: block;">def</span></li></ol>', path: [ 0, 0, 0, 0 ], offset: 3 },
      { content: '<ul><li><span style="border: 2px solid red;">abc</span><span style="display: block;">def</span></li></ul>', path: [ 0, 0, 0, 0 ], offset: 3 },
      { content: '<ol><li><span style="border: 2px solid red;">abc</span>\n<span style="display: block;">def</span></li></ol>', path: [ 0, 0, 1 ], offset: 1 },
      { content: '<ol><li>a<b>b</b>c<div>def</div></li></ol>', path: [ 0, 0, 2 ], offset: 1 },
      { content: '<ol><li>&nbsp;<span style="display: block;">def</span></li></ol>', path: [ 0, 0, 0 ], offset: 1 },
      { content: '<ol><li>&nbsp;\n<span style="display: block;">def</span></li></ol>', path: [ 0, 0, 0 ], offset: 2 },
      { content: '<ol><li><span style="border: 2px solid red;">&nbsp;</span><span style="display: block;">def</span></li></ol>', path: [ 0, 0, 0, 0 ], offset: 1 },
      { content: '<ol><li><span style="border: 2px solid red;">&nbsp;</span>\n<span style="display: block;">def</span></li></ol>', path: [ 0, 0, 1 ], offset: 1 },
      { content: '<ol><li>abc<img src="some-fake-url"><div>def</div></li></ol>', path: [ 0, 0 ], offset: 2 },
      { content: '<ol><li>abc<img src="some-fake-url">\n<div>def</div></li></ol>', path: [ 0, 0 ], offset: 2 },
    ];

    Arr.each(cases, ({ content, path, offset }, i) => {
      it(`TINY-13886: clicking on the right of the first element (which must be an inline element) of li that also have a block element inside should place the caret at the end of the first element (${i}, ${content})`,
        async () => {
          const editor = hook.editor();
          editor.setContent(content);
          await testClickOnRightSideOfLI(editor, { content, path, offset });
        });
    });

    it(`TINYMCE-14490: inserting a new li pressing enter in an li that also has a block element inside and clicking on the right of the first li the caret should be at the end of the element`, async () => {
      const editor = hook.editor();
      const content = [ '<ol>' +
        '<li>abc' +
          '<ol>' +
            '<li>first</li>' +
            '<li>second</li>' +
          '</ol>' +
        '</li>' +
      '</ol>' ].join('');
      editor.setContent(content);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 3);
      TinyContentActions.keystroke(editor, Keys.enter());
      await TinyContentActions.pType(editor, 'def');

      await testClickOnRightSideOfLI(editor, { content, path: [ 0, 0, 0 ], offset: 3 });
    });

    it('TINYMCE-14856: clicking on the right of the first element of an li scrolled into view in an unfocused editor should not scroll the content back to the top', async () => {
      const editor = hook.editor();
      const paragraphCount = 50;
      const content = Arr.range(paragraphCount, (i) => `<p>paragraph ${i}</p>`).join('') + '<ul><li>abc<div>def</div></li></ul>';
      editor.setContent(content);
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      Focus.active(SugarDocument.getDocument()).each(Focus.blur);
      assert.isFalse(editor.hasFocus(), 'The editor should not have focus before clicking in the list item');

      editor.dom.select('li')[0].scrollIntoView();
      const scrollY = editor.getWin().scrollY;
      assert.isAbove(scrollY, 0, 'The list item should be scrolled into view before clicking in it');

      await testClickOnRightSideOfLI(editor, { content, path: [ paragraphCount, 0, 0 ], offset: 3 });

      assert.equal(editor.getWin().scrollY, scrollY, 'Clicking in the list item should not have scrolled the content');
    });
  });
});
