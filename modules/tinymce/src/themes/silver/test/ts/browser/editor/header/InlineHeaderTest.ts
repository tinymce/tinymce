import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Css, Insert, Remove, Scroll, SelectorFind, SugarBody, SugarElement, SugarLocation, TextContent, Traverse } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.header.InlineHeaderTest', () => {
  context('horizontal ', () => {
    const wrapper = SugarElement.fromTag('div');
    const editorTarget = SugarElement.fromTag('div');
    const hook = TinyHooks.bddSetupFromElement<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'undo redo sidebar1 | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | align lineheight fontsize fontfamily blocks styles insertfile | styles | ' +
      'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code language | ltr rtl',
      inline: true,
      width: '400px'
    }, () => {
      Insert.append(wrapper, editorTarget);
      Insert.append(SugarBody.body(), wrapper);

      return {
        element: editorTarget,
        teardown: () => {
          Remove.remove(wrapper);
        }
      };
    });

    const pRunToolbarWidthTest = async (remainingWidth: number, expectedWidth: string) => {
      const editor = setupEditor(remainingWidth);

      editor.setContent('<p>Content</p>');
      editor.focus();
      editor.fire('ScrollWindow');

      await pAssertHeaderWidth(expectedWidth, '400px');
    };

    const setupEditor = (remainingWidth: number) => {
      const editor = hook.editor();
      const totalWidth = editor.getDoc().documentElement.clientWidth;
      Css.set(wrapper, 'width', 2 * totalWidth + 'px');
      Css.set(editorTarget, 'margin-left', totalWidth - remainingWidth + 'px');

      return editor;
    };

    const pAssertHeaderWidth = (expectedWidth: string, expectedMaxWidth: string) =>
      Waiter.pTryUntil('Could not verify width', () => {
        const header = SelectorFind.descendant(SugarBody.body(), '.tox-editor-header').getOrDie();
        const headerWrapper = SelectorFind.descendant(SugarBody.body(), '.tox-tinymce--toolbar-sticky-off').getOrDie();
        const width = Css.getRaw(headerWrapper, 'width');
        const maxWidth = Css.getRaw(header, 'max-width');
        if (maxWidth.getOrDie() !== expectedMaxWidth) {
          throw new Error(`maxWidth is ${maxWidth.isSome()}, ${maxWidth.getOrNull()} and expectedMaxWidth is ${expectedMaxWidth}`);
        }
        if (width.getOrDie() !== expectedWidth) {
          throw new Error(`Width is ${width.isSome()}, ${width.getOrNull()} and expectedWidth is ${expectedWidth}`);
        }
      });

    // TODO TINY-10480: Investigate flaky tests
    it.skip('TINY-9646: The width should remain on the editor', () =>
      pRunToolbarWidthTest(500, '400px')
    );

    // TODO TINY-10480: Investigate flaky tests
    it.skip('TINY-8977: If the editor does not fit within the view', () =>
      pRunToolbarWidthTest(200, '200px')
    );

    // TODO TINY-10480: Investigate flaky tests
    it.skip('TINY-8977: If the visible editor is smaller than the minimum', () =>
      pRunToolbarWidthTest(50, '150px')
    );

    // TODO TINY-10480: Investigate flaky tests
    it.skip('TINY-8977: If the editor is not visible at all', () =>
      pRunToolbarWidthTest(-50, '150px')
    );

    it('TINY-10580: when the inline editor is on the edge the bottom of the toolbar should be close to the top of the content', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      const totalWidth = editor.getDoc().documentElement.clientWidth;
      Css.set(editorTarget, 'margin-left', totalWidth - 250 + 'px');
      editor.focus();

      const toolbar = await UiFinder.pWaitFor('the toolbar should be visible', SugarBody.body(), '.tox-editor-header');
      const toolbarRect = editor.dom.getRect(toolbar.dom as HTMLElement);
      const toolbarBottom = toolbarRect.y + toolbarRect.h;

      const editorTargetRect = editor.dom.getRect(editorTarget.dom);
      const editorTargetTop = editorTargetRect.y;

      assert.approximately(editorTargetTop, toolbarBottom, 5, 'toolbarBottom should be above editorBodyTop');
    });
  });

  const makeHook = (setup: () => TinyHooks.SetupElement) => TinyHooks.bddSetupFromElement<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: 'undo redo | styles | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent outdent indent | bold bold',
    inline: true,
  }, setup);

  const pAssertToolbarGroupsAtleast = async (expectedGroups: number) => {
    const toolbar = await UiFinder.pWaitFor('the toolbar should be visible', SugarBody.body(), '.tox-toolbar__primary');
    const toolbarGroups = Traverse.children(toolbar);
    assert.isAtLeast(toolbarGroups.length, expectedGroups, `Toolbar should have more than ${expectedGroups} groups`);
  };

  const pAssertOverflowToolbarGroupsAtAleast = async (expectedGroups: number) => {
    const toolbar = await UiFinder.pWaitFor('the toolbar should be visible', SugarBody.body(), '.tox-toolbar__overflow');
    const toolbarGroups = Traverse.children(toolbar);
    assert.isAtLeast(toolbarGroups.length, expectedGroups, `Toolbar should have more than ${expectedGroups} groups`);
  };

  const pBlurAndScrollX = async (element: SugarElement<HTMLElement>, scrollToX: number) => {
    element.dom.blur();
    await Waiter.pTryUntil('Wait until toolbar is hidden', async () => UiFinder.pWaitForHidden('Wait for toolbar to be hidden', SugarBody.body(), '.tox-toolbar__primary'));
    Scroll.to(scrollToX, 0);
  };

  const pAssertOverflowButtonExist = async () => {
    const toolbar = await UiFinder.pWaitFor('the toolbar should be visible', SugarBody.body(), '.tox-toolbar__primary');
    await Waiter.pTryUntil('Wait for toolbar to be rendered and contains at least 1 group', () => UiFinder.exists(toolbar, '[data-mce-name="overflow-button"]'));
  };

  const clickOnOverflowButton = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="overflow-button"]');
  };

  context('editor in horizontal scrollable table, showing more button', () => {
    const wrapper = SugarElement.fromTag('div');
    const editorTarget = SugarElement.fromTag('div');
    const table = SugarElement.fromTag('table');
    const row = SugarElement.fromTag('tr');
    const td = SugarElement.fromTag('td');
    const td2 = SugarElement.fromTag('td');

    const hook = makeHook(() => {
      Insert.append(SugarBody.body(), wrapper);
      Insert.append(wrapper, table);
      Insert.append(table, row);
      Insert.append(row, td);
      Insert.append(row, td2);
      Insert.append(td2, editorTarget);

      Css.set(td, 'width', '90vw');
      Css.set(td2, 'width', '30vw');
      Css.setAll(table, {
        'table-layout': 'fixed',
        'width': '120vw',
        'margin-top': '50px'
      });

      TextContent.set(td, 'Some text');

      return {
        element: editorTarget,
        teardown: () => {
          Remove.remove(wrapper);
        }
      };
    });

    it('TINY-10684: Toolbar should only show more button, then expanded when scrolled, but not all items are rendered due to width constraint (scrolling left)', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(2);
    });

    it('TINY-10684: Toolbar should only show more button, then expanded when scrolled, but not all items are rendered due to width constraint (scrolling right)', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(2);
      await pBlurAndScrollX(editorTarget, 0);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
    });
  });

  context('editor in horizontal scrollable table, sufficient width to render all toolbar items', () => {
    const wrapper = SugarElement.fromTag('div');
    const editorTarget = SugarElement.fromTag('div');
    const table = SugarElement.fromTag('table');
    const row = SugarElement.fromTag('tr');
    const td = SugarElement.fromTag('td');
    const cellWithEditor = SugarElement.fromTag('td');
    const td3 = SugarElement.fromTag('td');

    const hook = makeHook(() => {
      Insert.append(SugarBody.body(), wrapper);
      Insert.append(wrapper, table);
      Insert.append(table, row);
      Insert.append(row, td);
      Insert.append(row, cellWithEditor);
      Insert.append(cellWithEditor, editorTarget);
      Insert.append(row, td3);

      Css.set(td, 'width', '90vw');
      Css.set(cellWithEditor, 'width', '30vw');
      Css.set(td3, 'width', '60vw');
      Css.setAll(table, {
        'table-layout': 'fixed',
        'width': '180vw',
        'margin-top': '50px'
      });

      TextContent.set(td, 'Some text');

      return {
        element: editorTarget,
        teardown: () => {
          Remove.remove(wrapper);
        }
      };
    });

    it('TINY-10684: Toolbar should expand the width of viewport when there\'s sufficient space, all items should be rendered, showing only show more button when width is constrained', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertToolbarGroupsAtleast(5);
      await pBlurAndScrollX(editorTarget, 0);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
    });

    it('TINY-10684: Toolbar should only show show more button, then expanded the width of viewport when there\'s sufficient space, all items should be rendered', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertToolbarGroupsAtleast(5);
    });
  });

  context('editor in horizontal scrollable table, editor in different location', () => {
    const wrapper = SugarElement.fromTag('div');
    const editorTarget = SugarElement.fromTag('div');
    const table = SugarElement.fromTag('table');
    const row = SugarElement.fromTag('tr');
    const td = SugarElement.fromTag('td');
    const cellWithEditor = SugarElement.fromTag('td');
    const td3 = SugarElement.fromTag('td');

    const hook = makeHook(() => {
      Insert.append(SugarBody.body(), wrapper);
      Insert.append(wrapper, table);
      Insert.append(table, row);
      Insert.append(row, td);
      Insert.append(row, cellWithEditor);
      Insert.append(cellWithEditor, editorTarget);
      Insert.append(row, td3);

      Css.set(td, 'width', '120vw');
      Css.set(cellWithEditor, 'width', '30vw');
      Css.set(td3, 'width', '30vw');
      Css.setAll(table, {
        'table-layout': 'fixed',
        'width': '180vw',
        'margin-top': '50px'
      });

      TextContent.set(td, 'Some text');

      return {
        element: editorTarget,
        teardown: () => {
          Remove.remove(wrapper);
        }
      };
    });

    it('TINY-10684: Toolbar should expand the width of viewport when there\'s sufficient space, all items should be rendered (scrolling right)', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      editorTarget.dom.scrollIntoView({ inline: 'end' });
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertToolbarGroupsAtleast(5);
    });

    it('TINY-10684: Toolbar should expand the width of viewport when there\'s sufficient space, all items should be rendered (scrolling left)', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertToolbarGroupsAtleast(5);
      editorTarget.dom.blur();
      editorTarget.dom.scrollIntoView({ inline: 'end' });
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
    });
  });

  context('editor in horizontal scrollable table, editor is off screen', () => {
    const wrapper = SugarElement.fromTag('div');
    const editorTarget = SugarElement.fromTag('div');
    const table = SugarElement.fromTag('table');
    const row = SugarElement.fromTag('tr');
    const td = SugarElement.fromTag('td');
    const cellWithEditor = SugarElement.fromTag('td');

    const hook = makeHook(() => {
      Insert.append(SugarBody.body(), wrapper);
      Insert.append(wrapper, table);
      Insert.append(row, td);
      Insert.append(row, cellWithEditor);
      Insert.append(cellWithEditor, editorTarget);
      Insert.append(table, row);

      Css.set(td, 'width', '150vw');
      Css.set(cellWithEditor, 'width', '30vw');
      Css.setAll(table, {
        'table-layout': 'fixed',
        'width': '180vw',
        'margin-top': '50px'
      });

      TextContent.set(td, 'Some text');

      return {
        element: editorTarget,
        teardown: () => {
          Remove.remove(wrapper);
        }
      };
    });

    it('TINY-10684: Toolbar should only show more button, then expanded when scrolled, but not all items are rendered due to width constraint (scrolling left)', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(2);
      await pBlurAndScrollX(editorTarget, 800);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
    });

    it('TINY-10684: Toolbar should only show more button, then expanded when scrolled, but not all items are rendered due to width constraint (scrolling right)', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pBlurAndScrollX(editorTarget, 800);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(1);
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertOverflowButtonExist();
      await pAssertToolbarGroupsAtleast(2);
    });

    it('TINY-10684: When overflow toolbar drawer is shown, and when document is scrolled, the scrolling state should be maintained', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Content</p>');
      Scroll.to(0, 0);
      editor.focus();
      await pBlurAndScrollX(editorTarget, document.documentElement.scrollWidth);
      editor.focus();
      await pAssertOverflowButtonExist();
      clickOnOverflowButton(editor);
      editor.focus();
      await pAssertOverflowToolbarGroupsAtAleast(2);

      Scroll.to(SugarLocation.absolute(editorTarget).left + 200 - window.innerWidth, 0);
      await Waiter.pWait(100);
      assert.notEqual(Scroll.get().left, 0, 'Scroll should be reset to 0');

      Scroll.to(document.documentElement.scrollWidth, 0);
      await Waiter.pWait(100);
      assert.notEqual(Scroll.get().left, 0, 'Scroll should be reset to 0');
    });
  });
});
