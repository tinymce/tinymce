import { Pointer } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import type { Sidebar } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';
import { Css, Insert, Remove, SugarBody, SugarElement, Width } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

import * as SidebarUtils from '../../module/SidebarUtils';

// When setting editor width, `width: 1200` the whole editor width is 1200px
// but there's a border on the left and on the right, so the inner width is 1194px.
const editorBorderLeft = 2;
const editorBorderRight = 2;

describe('browser.tinymce.themes.silver.sidebar.SidebarResizeTest', () => {
  const setupEditorHook = (configOverrides: { sidebar_show?: string; sidebar_min_width?: number; sidebar_max_width?: number; sidebar_width?: number; width?: number; setupElement?: () => TinyHooks.SetupElement } = {}) => {
    const { setupElement, ...settings } = configOverrides;
    const config = {
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
      ...settings
    };

    return setupElement
      ? TinyHooks.bddSetupFromElement<Editor>(config, setupElement, [], { fastAnimations: true })
      : TinyHooks.bddSetupLight<Editor>(config, [], { fastAnimations: true });
  };

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

  context('TINYMCE-14530: Editing area minimum width protection', () => {
    context('TINYMCE-14530: Editing area minimum width constraint', () => {
      setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: 200, sidebar_min_width: 100, sidebar_max_width: 5000, width: 1200 });

      it('TINYMCE-14530: should not let the sidebar grow to the point where the editing area shrinks below its minimum width', async () => {
        const remainingSpace = 1200 - (editorBorderLeft + editorBorderRight) - 280;
        await SidebarUtils.resizeSidebarBy([ -1000, 0 ]);
        assertSidebarWidth(remainingSpace, 'The sidebar should be capped so the editing area keeps its minimum width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), remainingSpace, 'The requested width should also be capped, since the drag logic clamps it directly rather than relying on the CSS clamp');
        assert.equal(Width.get(SidebarUtils.getEditArea()), 280, 'The editing area must not shrink below its minimum width');
      });
    });

    context('TINYMCE-14530: Fractional available width rounding', () => {
      const editorParentElementWidth = 420.5;

      const setupElement = () => {
        const editorParentElement = SugarElement.fromTag('div');
        Css.set(editorParentElement, 'width', `${editorParentElementWidth}px`);
        const target = SugarElement.fromTag('textarea');
        Insert.append(editorParentElement, target);
        Insert.append(SugarBody.body(), editorParentElement);
        return {
          element: target,
          teardown: () => Remove.remove(editorParentElement)
        };
      };

      const hook = setupEditorHook({
        sidebar_show: 'sidebarone',
        sidebar_width: 100,
        sidebar_min_width: 100,
        sidebar_max_width: 5000,
        setupElement
      });

      it('TINYMCE-14530: should floor the fractional available width so the editing area never drops below its minimum', async () => {
        const editor = hook.editor();

        const editorWidth = Width.get(TinyDom.container(editor));
        assert.equal(editorWidth, editorParentElementWidth, 'The editor should take 100% of its fractional-width container');

        const wrapWidth = Width.get(SidebarUtils.getSidebarWrap());
        assert.equal(wrapWidth, editorParentElementWidth - editorBorderLeft - editorBorderRight, 'The sidebar-wrap width should be fractional');

        await SidebarUtils.resizeSidebarBy([ -1000, 0 ]);

        // The sidebar caps at an integer width and leaves the fractional remainder to the editing area.
        assertSidebarWidth(136, 'The sidebar should be capped at the floored available width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 136, 'The requested width should match the actual width of the sidebar');
        const editAreaWidth = Width.get(SidebarUtils.getEditArea());
        assert.equal(editAreaWidth, 280.5, 'The editing area should keep the fractional remainder');
      });
    });

    // TODO: start working on it

    // TODO: The same situation can happen not on init, but once the editor will be resized, add test
    context.skip('TINYMCE-14530: Editing area minimum width on init', () => {
      setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: 1000, sidebar_min_width: 1000, sidebar_max_width: 5000, width: 1200 });

      it('TINYMCE-14530: should not render the sidebar so wide on init that the editing area shrinks below its minimum width', () => {
        assert.equal(Width.get(SidebarUtils.getEditArea()), 280, 'The editing area must not shrink below its minimum width on init');
        assertSidebarWidth(920, 'The sidebar should be capped below its configured minimum so the editing area keeps its minimum width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should stay at the configured initial width; only the rendered width is reduced by the CSS clamp');
      });
    });
  });
});
