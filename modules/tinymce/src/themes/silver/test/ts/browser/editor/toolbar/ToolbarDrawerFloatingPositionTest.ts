import { Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Css, Insert, Remove, Scroll, SugarBody, SugarElement, SugarLocation } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import { pAssertFloatingToolbarHeight, pOpenFloatingToolbarAndAssertPosition } from '../../../module/ToolbarUtils';

describe('browser.tinymce.themes.silver.editor.toolbar.ToolbarDrawerFloatingPositionTest', () => {
  const toolbarHeight = 33;
  const toolbarDrawerHeight = 86;
  const windowBottomOffset = window.innerHeight - 100;
  let rootElement: SugarElement<HTMLDivElement>;

  const setupElement = () => {
    // Setup the element to render to
    rootElement = SugarElement.fromTag('div');
    const editorElement = SugarElement.fromTag('textarea');
    Css.set(rootElement, 'margin-left', '100px');
    Insert.append(rootElement, editorElement);
    Insert.append(SugarBody.body(), rootElement);
    return {
      element: editorElement,
      teardown: () => Remove.remove(rootElement)
    };
  };

  const hook = TinyHooks.bddSetupFromElement<Editor>({
    menubar: false,
    width: 450,
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'undo redo | styles | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
    toolbar_mode: 'floating'
  }, setupElement, []);

  before(async () => {
    // Firefox requires a small wait, otherwise the initial toolbar position is incorrect
    if (PlatformDetection.detect().browser.isFirefox()) {
      await Waiter.pWait(100);
    }
  });

  const addMargins = (editor: Editor) => {
    const uiContainer = TinyDom.container(editor);
    Css.set(uiContainer, 'margin-top', '2000px');
    Css.set(uiContainer, 'margin-bottom', '2000px');
  };

  const removeMargins = (editor: Editor) => {
    const uiContainer = TinyDom.container(editor);
    Css.remove(uiContainer, 'margin-top');
    Css.remove(uiContainer, 'margin-bottom');
  };

  it('TBA: Editor in the page', async () => {
    const editor = hook.editor();
    const initialContainerPos = SugarLocation.absolute(TinyDom.container(editor));

    // Top of screen
    await pOpenFloatingToolbarAndAssertPosition(editor, () => initialContainerPos.top + toolbarHeight, async () => { // top of ui container + toolbar height
      await pAssertFloatingToolbarHeight(editor, toolbarDrawerHeight);
    });
    addMargins(editor);

    // Top of screen + scrolled
    Scroll.to(0, initialContainerPos.top + 2000);
    await pOpenFloatingToolbarAndAssertPosition(editor, () => initialContainerPos.top + toolbarHeight + 2000, async () => { // top of ui container + toolbar height + scroll pos
      await pAssertFloatingToolbarHeight(editor, toolbarDrawerHeight);
    });

    // Bottom of screen + scrolled
    Scroll.to(0, initialContainerPos.top + 2000 - windowBottomOffset);
    await pOpenFloatingToolbarAndAssertPosition(editor, () => initialContainerPos.top + toolbarHeight + 2000, async () => { // top of ui container + toolbar height + scroll pos
      await pAssertFloatingToolbarHeight(editor, toolbarDrawerHeight);
    });
    removeMargins(editor);
  });

  it('TINY-4837: Editor in floating element (eg dialog)', async () => {
    const editor = hook.editor();
    const initialContainerPos = SugarLocation.absolute(TinyDom.container(editor));
    Css.set(rootElement, 'position', 'absolute');
    Scroll.to(0, 0);

    // Top of screen
    await pOpenFloatingToolbarAndAssertPosition(editor, () => initialContainerPos.top + toolbarHeight, async () => { // top of ui container + toolbar height
      await pAssertFloatingToolbarHeight(editor, toolbarDrawerHeight);
    });
    addMargins(editor);

    // Top of screen + scrolled
    Scroll.to(0, initialContainerPos.top + 2000);
    await pOpenFloatingToolbarAndAssertPosition(editor, () => initialContainerPos.top + toolbarHeight + 2000, async () => { // top of ui container + toolbar height + scroll pos
      await pAssertFloatingToolbarHeight(editor, toolbarDrawerHeight);
    });

    // Bottom of screen + scrolled
    Scroll.to(0, initialContainerPos.top + 2000 - windowBottomOffset);
    await pOpenFloatingToolbarAndAssertPosition(editor, () => initialContainerPos.top + toolbarHeight + 2000, async () => { // top of ui container + toolbar height + scroll pos
      await pAssertFloatingToolbarHeight(editor, toolbarDrawerHeight);
    });
    removeMargins(editor);
  });
});