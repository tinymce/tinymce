import { Assertions, Cursors, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ScrollIntoViewEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as ScrollIntoView from 'tinymce/core/dom/ScrollIntoView';
import * as InsertNewLine from 'tinymce/core/newline/InsertNewLine';

interface State {
  readonly elm: HTMLElement;
  readonly alignToTop: boolean;
}

interface StateAndHandler {
  readonly handler: (e: EditorEvent<ScrollIntoViewEvent>) => void;
  readonly state: Cell<Partial<State>>;
}

describe('browser.tinymce.core.dom.ScrollIntoViewTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    add_unload_trigger: false,
    height: 500,
    width: 1000,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body  { margin: 0 }'
  }, [], true);

  const scrollReset = (editor: Editor) => {
    editor.getWin().scrollTo(0, 0);
  };

  const pSetContent = async (editor: Editor, html: string) => {
    editor.setContent(html);
    await Waiter.pTryUntil('Wait for scrollHeight to be updated', () => {
      assert.isAbove(editor.getBody().scrollHeight, 100, 'Scroll body should be more than 100');
    });
  };

  const scrollIntoView = (editor: Editor, selector: string, alignToTop?: boolean) => {
    editor.selection.scrollIntoView(editor.dom.select(selector)[0], alignToTop);
  };

  const scrollElementIntoView = (editor: Editor, selector: string, alignToTop?: boolean) => {
    ScrollIntoView.scrollElementIntoView(editor, editor.dom.select(selector)[0], alignToTop);
  };

  const scrollRangeIntoView = (editor: Editor, path: number[], offset: number) => {
    const x = Cursors.calculateOne(TinyDom.body(editor), path);
    const rng = editor.dom.createRng();
    rng.setStart(x.dom, offset);
    rng.setEnd(x.dom, offset);

    ScrollIntoView.scrollRangeIntoView(editor, rng);
  };

  const assertHorizontalScrollPosition = (editor: Editor, x: number) => {
    const actualX = Math.round(editor.dom.getViewPort(editor.getWin()).x);
    assert.approximately(actualX, x, 3, `Scroll position X should be expected value: ${x} got ${actualX}`);
  };

  const assertVerticalScrollPosition = (editor: Editor, y: number) => {
    const actualY = Math.round(editor.dom.getViewPort(editor.getWin()).y);
    assert.approximately(actualY, y, 3, `Scroll position Y should be expected value: ${y} got ${actualY}`);
  };

  const assertScrollPosition = (editor: Editor, x: number, y: number) => {
    assertHorizontalScrollPosition(editor, x);
    assertVerticalScrollPosition(editor, y);
  };

  const assertApproxScrollPosition = (editor: Editor, x: number, y: number) => {
    const actualX = editor.dom.getViewPort(editor.getWin()).x;
    const actualY = editor.dom.getViewPort(editor.getWin()).y;
    assert.isBelow(Math.abs(x - actualX), 5, `Scroll position X should be expected value: ${x} got ${actualX}`);
    assert.isBelow(Math.abs(y - actualY), 5, `Scroll position Y should be expected value: ${y} got ${actualY}`);
  };

  const bindScrollIntoViewEvent = (editor: Editor): StateAndHandler => {
    const state = Cell({});

    const handler = (e: EditorEvent<ScrollIntoViewEvent>) => {
      e.preventDefault();
      state.set({
        elm: e.elm,
        alignToTop: e.alignToTop
      });
    };

    editor.on('ScrollIntoView', handler);

    return {
      handler,
      state
    };
  };

  const assertScrollIntoViewEventInfo = (editor: Editor, value: StateAndHandler, expectedElementSelector: string, expectedAlignToTop: boolean) => {
    const state = value.state.get();
    const expectedTarget = SugarElement.fromDom(editor.dom.select(expectedElementSelector)[0]);
    const actualTarget = SugarElement.fromDom(state.elm as HTMLElement);
    Assertions.assertDomEq('Target should be expected element', expectedTarget, actualTarget);
    assert.equal(state.alignToTop, expectedAlignToTop, 'Align to top should be expected value');
    editor.off('ScrollIntoView', value.handler);
  };

  beforeEach(() => {
    scrollReset(hook.editor());
  });

  context('Public Selection API', () => {
    it('Scroll to element align to bottom', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      scrollIntoView(editor, 'div:nth-child(2)', false);
      assertScrollPosition(editor, 0, 667);
    });

    it('Scroll to element align to top', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      scrollIntoView(editor, 'div:nth-child(2)', true);
      assertScrollPosition(editor, 0, 1000);
    });

    it(`Scroll to element already in view shouldn't do anything`, async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 600px">a</div>');
      editor.getWin().scrollTo(0, 900);
      scrollIntoView(editor, 'div:nth-child(2)');
      assertScrollPosition(editor, 0, 900);
    });

    it('Scroll to element with height larger than viewport should align to top', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 600px">a</div>');
      scrollIntoView(editor, 'div:nth-child(3)');
      assertScrollPosition(editor, 0, 1050);
    });

    it('TINY-7291: Scroll current selection into view', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 600px">a</div>');
      TinySelections.setCursor(editor, [ 2, 0 ], 0);
      editor.selection.scrollIntoView();
      assertScrollPosition(editor, 0, 689);
    });

    it('TINY-9747: when the selection is scrolled into view selection if there is an horizontal scroll it should preserve the correct left position', async () => {
      const editor = hook.editor();
      await pSetContent(editor, `<div class="container-with-horizontal-scroll" style="margin-left: 100px">
        <div style="height: 1000px; width: 2000px">a</div>
        <div style="height: 50px">b</div>
        <div style="height: 600px">a</div>
      </div>`);

      TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
      editor.selection.scrollIntoView();
      /*
        TINY-9747: here the assertion on vertical scroll has a different value on a different browser
        because if the scrollbar is showed to have the element `a` inside the view the required scroll is different:

        ----   ----
        |      |
        |      a
        a      scrollbar
        ----   ----
      */
      assertHorizontalScrollPosition(editor, 0);
    });

    it('TINY-9776: when the selection is scrolled into view selection if there is an horizontal scroll it should preserve the correct left position', async () => {
      const editor = hook.editor();
      await pSetContent(editor, `<div class="container-with-horizontal-scroll" style="margin-left: 100px">
        <div style="height: 1000px; width: 2000px">a</div>
        <div style="height: 50px">b</div>
        <div style="height: 600px">a</div>
      </div>`);
      const leftScroll = 100;
      TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
      editor.getDoc().documentElement.scrollBy({ left: leftScroll });

      editor.selection.scrollIntoView();

      assertHorizontalScrollPosition(editor, leftScroll);
    });
  });

  context('Private ScrollElementIntoView', () => {
    it('Scroll to element align to bottom', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      scrollElementIntoView(editor, 'div:nth-child(2)', false);
      assertScrollPosition(editor, 0, 667);
    });

    it('Scroll to element align to top', async () => {
      const editor = hook.editor();
      scrollReset(editor);
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      scrollElementIntoView(editor, 'div:nth-child(2)', true);
      assertScrollPosition(editor, 0, 1000);
    });
  });

  context('Private ScrollRangeIntoView', () => {
    it('Scroll up/down', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      scrollRangeIntoView(editor, [ 1, 0 ], 0);
      assertApproxScrollPosition(editor, 0, 640); // Height of the text content/cursor
      scrollRangeIntoView(editor, [ 0, 0 ], 0);
      assertApproxScrollPosition(editor, 0, 0);
      scrollRangeIntoView(editor, [ 2, 0 ], 0);
      assertApproxScrollPosition(editor, 0, 689);
    });
  });

  context('Override scrollIntoView event', () => {
    it('Scroll to element align to bottom', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      const value = bindScrollIntoViewEvent(editor);
      scrollIntoView(editor, 'div:nth-child(2)', false);
      assertScrollIntoViewEventInfo(editor, value, 'div:nth-child(2)', false);
      assertScrollPosition(editor, 0, 0);
    });

    it('Scroll to element align to top', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      const value = bindScrollIntoViewEvent(editor);
      scrollIntoView(editor, 'div:nth-child(2)', true);
      assertScrollIntoViewEventInfo(editor, value, 'div:nth-child(2)', true);
      assertScrollPosition(editor, 0, 0);
    });

    it('Scroll to element align to bottom (private api)', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      const value = bindScrollIntoViewEvent(editor);
      scrollElementIntoView(editor, 'div:nth-child(2)', false);
      assertScrollIntoViewEventInfo(editor, value, 'div:nth-child(2)', false);
      assertScrollPosition(editor, 0, 0);
    });

    it('Scroll to element align to top (private api)', async () => {
      const editor = hook.editor();
      await pSetContent(editor, '<div style="height: 1000px">a</div><div style="height: 50px">b</div><div style="height: 1000px">a</div>');
      const value = bindScrollIntoViewEvent(editor);
      scrollElementIntoView(editor, 'div:nth-child(2)', true);
      assertScrollIntoViewEventInfo(editor, value, 'div:nth-child(2)', true);
      assertScrollPosition(editor, 0, 0);
    });
  });
});

context('scrollToMarker should not scroll the container', () => {
  const insertNewline = (editor: Editor, args: Partial<EditorEvent<KeyboardEvent>>) => {
    InsertNewLine.insert(editor, args as EditorEvent<KeyboardEvent>);
  };
  const container: SugarElement<HTMLElement> = SugarElement.fromHtml('<div id="ephox-ui" style="border: 2px solid red; margin-top: 4000px; margin-bottom: 4000px"></div>');

  const setupElement = () => {
    const element = SugarElement.fromTag('textarea');

    Insert.append(SugarBody.body(), container);
    Insert.append(container, element);
    return {
      element,
      teardown: () => {
        Remove.remove(element);
        Remove.remove(container);
      }
    };
  };

  const hook = TinyHooks.bddSetupFromElement<Editor>({
    add_unload_trigger: false,
    height: 500,
    width: 500,
    toolbar: false,
    menubar: false,
    statusbar: false,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body  { margin: 0 }'
  }, setupElement, []);

  it('TINY-9776: scrollToMarker should not scroll the container', () => {
    const editor = hook.editor();
    TinySelections.setCursor(editor, [ 0 ], 0);
    window.scrollTo(0, 4500);
    editor.selection.scrollIntoView();

    const initialTop = container.dom.getBoundingClientRect().top;
    while (editor.getContainer().clientHeight > editor.getBody().clientHeight) {
      insertNewline(editor, {});
    }
    assert.equal(initialTop, container.dom.getBoundingClientRect().top);
  });
});
