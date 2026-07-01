import { Pointer } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import type { Sidebar } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';
import { SugarElement, Width } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

import * as SidebarUtils from '../../module/SidebarUtils';

describe('browser.tinymce.themes.silver.sidebar.SidebarResizeTest', () => {
  const setupEditorHook = (configOverrides: { sidebar_show?: string; sidebar_min_width?: number; sidebar_max_width?: number; sidebar_width?: number } = {}) =>
    TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'sidebarone sidebartwo',
      setup: (editor: Editor) => {
        const register = (name: string, tooltip: string) =>
          editor.ui.registry.addSidebar(name, {
            tooltip,
            icon: 'comment',
            onSetup: (api: Sidebar.SidebarInstanceApi) => {
              api.element().appendChild(SugarElement.fromText(name).dom);
              return Fun.noop;
            }
          });
        register('sidebarone', 'side bar one');
        register('sidebartwo', 'side bar two');
      },
      ...configOverrides
    }, [], { fastAnimations: true });

  const assertSidebarWidth = (expectedWidth: number, message: string) => {
    const sidebar = SidebarUtils.getSidebar();
    assert.equal(Width.get(sidebar), expectedWidth, message);
  };

  const resetSidebarWidth = async (initialWidth: number) => {
    const sidebar = SidebarUtils.getSidebar();
    await SidebarUtils.resizeSidebarBy([ Width.get(sidebar) - initialWidth, 0 ]);
  };

  context('TINYMCE-14527: Resizing the sidebar', () => {
    const initialWidth = 440;
    setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: initialWidth, sidebar_min_width: 300, sidebar_max_width: 800 });
    afterEach(async () => resetSidebarWidth(initialWidth));

    it('TINYMCE-14527: should resize the sidebar by dragging the handle', async () => {
      const resizeHandle = SidebarUtils.getSidebarResizeHandle();

      await Pointer.pWithMockPointerCapture(resizeHandle, {}, async () => {
        Pointer.pointerDown(resizeHandle);
        Pointer.pointerMoveBy(resizeHandle, 0, 0);

        Pointer.pointerMoveBy(resizeHandle, -40, 0);
        assertSidebarWidth(480, 'Dragging the handle left should grow the sidebar');

        Pointer.pointerMoveBy(resizeHandle, -40, 0);
        Pointer.pointerUp(resizeHandle);
        assertSidebarWidth(520, 'Releasing the handle should keep the grown width');

        Pointer.pointerDown(resizeHandle);
        Pointer.pointerMoveBy(resizeHandle, 0, 0);

        Pointer.pointerMoveBy(resizeHandle, 80, 0);
        assertSidebarWidth(440, 'Dragging the handle right should shrink the sidebar');

        Pointer.pointerMoveBy(resizeHandle, 40, 0);
        Pointer.pointerUp(resizeHandle);
        assertSidebarWidth(400, 'Releasing the handle should keep the shrunk width');
      });
    });

    it('TINYMCE-14527: should not resume resizing after over-dragging until the pointer returns to the handle', async () => {
      const resizeHandle = SidebarUtils.getSidebarResizeHandle();

      await Pointer.pWithMockPointerCapture(resizeHandle, {}, async () => {
        Pointer.pointerDown(resizeHandle);
        Pointer.pointerMoveBy(resizeHandle, 0, 0);

        Pointer.pointerMoveBy(resizeHandle, -360, 0);
        assertSidebarWidth(800, 'Dragging left should grow the sidebar up to its max width');

        Pointer.pointerMoveBy(resizeHandle, -150, 0);
        assertSidebarWidth(800, 'Over-dragging past the max should keep the sidebar clamped at the max width');

        Pointer.pointerMoveBy(resizeHandle, 0, 0);
        assertSidebarWidth(800, 'Dragging back towards the handle should be ignored until the pointer reaches it, so the sidebar stays at the max width');

        Pointer.pointerMoveBy(resizeHandle, 500, 0);
        assertSidebarWidth(300, 'Dragging right past the handle should shrink the sidebar down to its min width');

        Pointer.pointerMoveBy(resizeHandle, 150, 0);
        assertSidebarWidth(300, 'Over-dragging past the min should keep the sidebar clamped at the min width');

        Pointer.pointerMoveBy(resizeHandle, 0, 0);
        assertSidebarWidth(300, 'Dragging back towards the handle should be ignored until the pointer reaches it, so the sidebar stays at the min width');

        Pointer.pointerUp(resizeHandle);
      });
    });
  });

  context('TINYMCE-14527: Constraints', () => {
    context('defaults', () => {
      setupEditorHook({ sidebar_show: 'sidebarone' });

      it('TINYMCE-14527: should respect initial and the min and max width constraints', async () => {
        assertSidebarWidth(440, 'The sidebar should start at the initial width');

        await SidebarUtils.resizeSidebarBy([ -1000, 0 ]);
        assertSidebarWidth(800, 'The sidebar should be capped at the max width');

        await SidebarUtils.resizeSidebarBy([ 1000, 0 ]);
        assertSidebarWidth(300, 'The sidebar should be capped at the min width');
      });
    });

    context('set options', () => {
      setupEditorHook({ sidebar_show: 'sidebarone', sidebar_min_width: 100, sidebar_max_width: 600, sidebar_width: 200 });

      it('TINYMCE-14527: should respect initial and the min and max width constraints', async () => {
        assertSidebarWidth(200, 'The sidebar should start at the initial width');

        await SidebarUtils.resizeSidebarBy([ -1000, 0 ]);
        assertSidebarWidth(600, 'The sidebar should be capped at the max width');

        await SidebarUtils.resizeSidebarBy([ 1000, 0 ]);
        assertSidebarWidth(100, 'The sidebar should be capped at the min width');
      });
    });
  });

  context('TINYMCE-14527: Persistence', () => {
    const initialWidth = 440;
    const hook = setupEditorHook({ sidebar_width: 440, sidebar_min_width: 300, sidebar_max_width: 800 });

    afterEach(async () => {
      const editor = hook.editor();
      const currentSidebar = editor.queryCommandValue('ToggleSidebar');
      if (currentSidebar) {
        await resetSidebarWidth(initialWidth);
        editor.execCommand('ToggleSidebar', false, editor.queryCommandValue('ToggleSidebar'));
        await SidebarUtils.pWaitForSidebarClosed();
      } else {
        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        await SidebarUtils.pWaitForSidebarOpen();
        await resetSidebarWidth(initialWidth);
        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        await SidebarUtils.pWaitForSidebarClosed();
      }
    });

    it('TINYMCE-14527: should keep the resized width after hiding and showing the sidebar', async () => {
      const editor = hook.editor();

      editor.execCommand('ToggleSidebar', false, 'sidebarone');
      await SidebarUtils.pWaitForSidebarOpen();
      assertSidebarWidth(440, 'The sidebar should start at the initial width');

      await SidebarUtils.resizeSidebarBy([ -50, 0 ]);
      assertSidebarWidth(490, 'Dragging the handle left should grow the sidebar');

      editor.execCommand('ToggleSidebar', false, 'sidebarone');
      await SidebarUtils.pWaitForSidebarClosed();

      editor.execCommand('ToggleSidebar', false, 'sidebarone');
      await SidebarUtils.pWaitForSidebarOpen();
      assertSidebarWidth(490, 'The resized width should survive hiding and showing the sidebar');
    });

    it('TINYMCE-14527: should keep the resized width when switching between sidebar panels', async () => {
      const editor = hook.editor();

      editor.execCommand('ToggleSidebar', false, 'sidebarone');
      await SidebarUtils.pWaitForSidebarOpen();
      assertSidebarWidth(440, 'The sidebar should start at the initial width');

      await SidebarUtils.resizeSidebarBy([ -50, 0 ]);
      assertSidebarWidth(490, 'Dragging the handle left should grow the sidebar');

      editor.execCommand('ToggleSidebar', false, 'sidebartwo');
      await SidebarUtils.pWaitForSidebarOpen();
      assertSidebarWidth(490, 'The resized width should survive switching between panels');
    });
  });
});
