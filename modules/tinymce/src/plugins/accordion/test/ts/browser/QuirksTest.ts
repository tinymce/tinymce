import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

describe('browser.tinymce.plugins.accordion.QuirksTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    },
    [ Plugin ]
  );
  it('TINY-10177: should override the selection to the beginning of `summary` after clicking on it.', () => {
    const editor = hook.editor();
    editor.setContent('<p>Hello</p> ' + AccordionUtils.createAccordion());
    if (browser.isSafari()) {
    // set selection before the `summary`
      TinySelections.setCursor(editor, [ 1 ], 0);
    } else {
    // set selection at the beginning of the `summary`
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
    }
    const event = { target: editor.dom.select('summary')[0] } as unknown as MouseEvent;
    editor.dispatch('click', event );
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
  });

  const testClickOnRightSideOfLI = async (editor: Editor, { content, path, offset }: { content: string; path: number[]; offset: number }) => {
    editor.setContent(content);

    const li = editor.dom.select('li')[0];
    const firstChild = SugarElement.fromDom(li.firstChild as Node);
    const textNode = SugarNode.isText(firstChild) ? firstChild.dom : PredicateFind.descendant(firstChild, SugarNode.isText).getOrDie().dom;
    const rng = editor.getDoc().createRange();
    rng.setStart(textNode, 0);
    rng.setEnd(textNode, textNode.data.length);
    const rect = rng.getClientRects()[0];

    if (content.includes('<img')) {
      const img = editor.dom.select('img')[0];
      if (img && !img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
    }

    const mouseEvent = {
      target: li as EventTarget,
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
    ((browser.isFirefox() || browser.isSafari()) ?
      it.skip :
      it
    )(`TINY-13886: clicking on the right of the first element (which must be an inline element) of li that also have a block element inside should place the caret at the end of the first element (${i}, ${content})`,
      async () => {
        const editor = hook.editor();
        await testClickOnRightSideOfLI(editor, { content, path, offset });
      });
  });
});
