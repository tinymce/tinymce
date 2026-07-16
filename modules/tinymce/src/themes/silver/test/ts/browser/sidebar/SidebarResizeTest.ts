import { Pointer, TestStore } from '@ephox/agar';
import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import type { Sidebar } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';
import { Class, Css, Insert, Remove, SugarBody, SugarElement, Visibility, Width } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

import * as SidebarUtils from '../../module/SidebarUtils';
import { resizeEditorBy } from '../../module/UiUtils';

// When setting editor width, `width: 1200` the whole editor width is 1200px
// but there's a border on the left and on the right, so the inner width is 1194px.
const editorBorderLeft = 2;
const editorBorderRight = 2;

type SidebarResizeEvent =
  | { type: 'SidebarResizeStart' }
  | { type: 'SidebarResized'; width: number };

const registerResizable = (editor: Editor, name: string, tooltip: string): void => {
  editor.ui.registry.addSidebar(name, {
    tooltip,
    icon: 'comment',
    onSetup: (api: Sidebar.SidebarInstanceApi) => {
      api.element().appendChild(SugarElement.fromText(name).dom);
      return Fun.noop;
    },
    resizable: true
  });
};

const registerNotResizable = (editor: Editor, name: string, tooltip: string, color: string, width: number): void => {
  editor.ui.registry.addSidebar(name, {
    tooltip,
    icon: 'comment',
    onSetup: (api: Sidebar.SidebarInstanceApi) => {
      const div = SugarElement.fromTag('div');
      Css.setAll(div, { width: `${width}px`, 'background-color': color });
      api.element().appendChild(div.dom);
      return Fun.noop;
    },
    resizable: false
  });
};

describe('browser.tinymce.themes.silver.sidebar.SidebarResizeTest', () => {
  const resizeStartEvent = (): SidebarResizeEvent => ({ type: 'SidebarResizeStart' });
  const resizedEvent = (width: number): SidebarResizeEvent => ({ type: 'SidebarResized', width });

  const store = TestStore<SidebarResizeEvent>();

  beforeEach(() => store.clear());

  const setupEditorHook = (configOverrides: {
    sidebar_show?: string;
    sidebar_min_width?: number;
    sidebar_max_width?: number;
    sidebar_width?: number;
    width?: number;
    resize?: boolean | 'both';
    statusbar?: boolean;
    setupElement?: () => TinyHooks.SetupElement;
  } = {}) => {
    const { setupElement, ...settings } = configOverrides;
    const config = {
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'sidebarone sidebartwo resizable-unset resizable-false w800-resizable-false w1000-resizable-false',
      setup: (editor: Editor) => {
        registerResizable(editor, 'sidebarone', 'side bar one');
        registerResizable(editor, 'sidebartwo', 'side bar two');
        registerNotResizable(editor, 'resizable-false', 'resizable false', 'yellow', 600);
        registerNotResizable(editor, 'w800-resizable-false', 'w800 resizable false', 'orange', 800);
        registerNotResizable(editor, 'w1000-resizable-false', 'w1000 resizable false', 'pink', 1000);

        // Registered with the raw API and no resizable flag, to cover the "flag omitted" default case.
        editor.ui.registry.addSidebar('resizable-unset', {
          tooltip: 'resizable unset',
          icon: 'comment',
          onSetup: (api: Sidebar.SidebarInstanceApi) => {
            const div = SugarElement.fromTag('div');
            Css.setAll(div, { width: '600px', 'background-color': 'green' });
            api.element().appendChild(div.dom);
            return Fun.noop;
          }
        });
        editor.on('SidebarResizeStart', () => store.add(resizeStartEvent()));
        editor.on('SidebarResized', (e) => store.add(resizedEvent(e.width)));
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

  const resetEditorWidth = async (editor: Editor, initialWidth: number) => {
    const container = TinyDom.container(editor);
    await resizeEditorBy([ initialWidth - Width.get(container), 0 ]);
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
        store.assertEq('Dragging to the max should emit start and resized with the max-clamped width', [ resizeStartEvent(), resizedEvent(800) ]);
        store.clear();

        await SidebarUtils.resizeSidebarBy([ 1000, 0 ]);
        assertSidebarWidth(300, 'The sidebar should be capped at the min width');
        store.assertEq('Dragging to the min should emit start and resized with the min-clamped width', [ resizeStartEvent(), resizedEvent(300) ]);
      });
    });

    context('set options', () => {
      setupEditorHook({ sidebar_show: 'sidebarone', sidebar_min_width: 100, sidebar_max_width: 600, sidebar_width: 200 });

      it('TINYMCE-14527: should respect initial and the min and max width constraints', async () => {
        assertSidebarWidth(200, 'The sidebar should start at the initial width');

        await SidebarUtils.resizeSidebarBy([ -1000, 0 ]);
        assertSidebarWidth(600, 'The sidebar should be capped at the max width');
        store.assertEq('Dragging to the max should emit start and resized with the max-clamped width', [ resizeStartEvent(), resizedEvent(600) ]);
        store.clear();

        await SidebarUtils.resizeSidebarBy([ 1000, 0 ]);
        assertSidebarWidth(100, 'The sidebar should be capped at the min width');
        store.assertEq('Dragging to the min should emit start and resized with the min-clamped width', [ resizeStartEvent(), resizedEvent(100) ]);
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
    const minEditingAreaWidth = 280;

    context('TINYMCE-14530: Editing area minimum width constraint', () => {
      setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: 200, sidebar_min_width: 100, sidebar_max_width: 5000, width: 1200 });

      it('TINYMCE-14530: should not let the sidebar grow to the point where the editing area shrinks below its minimum width', async () => {
        const remainingSpace = 1200 - (editorBorderLeft + editorBorderRight) - minEditingAreaWidth;
        await SidebarUtils.resizeSidebarBy([ -1000, 0 ]);
        assertSidebarWidth(remainingSpace, 'The sidebar should be capped so the editing area keeps its minimum width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), remainingSpace, 'The requested width should also be capped, since the drag logic clamps it directly rather than relying on the CSS clamp');
        store.assertEq('Dragging past the editing-area limit should emit start and resized with the effective-max-clamped width', [ resizeStartEvent(), resizedEvent(remainingSpace) ]);
        assert.equal(Width.get(SidebarUtils.getEditArea()), minEditingAreaWidth, 'The editing area must not shrink below its minimum width');
      });
    });

    context('TINYMCE-14530: Fractional available width rounding', () => {
      const editorParentElementWidth = 1420.5;

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

        await SidebarUtils.resizeSidebarBy([ -1500, 0 ]);

        // The sidebar caps at an integer width and leaves the fractional remainder to the editing area.
        assertSidebarWidth(1136, 'The sidebar should be capped at the floored available width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1136, 'The requested width should match the actual width of the sidebar');
        const editAreaWidth = Width.get(SidebarUtils.getEditArea());
        assert.equal(editAreaWidth, 280.5, 'The editing area should keep the fractional remainder');
      });
    });

    context('TINYMCE-14530: Editing area minimum width when the editor is resized', () => {
      const editorInitialWidth = 1500;
      const sidebarInitialWidth = 1000;
      const hook = setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: sidebarInitialWidth, sidebar_max_width: 1000, resize: 'both', statusbar: true, width: editorInitialWidth });

      afterEach(async () => {
        const editor = hook.editor();
        await resetEditorWidth(editor, editorInitialWidth);
        await resetSidebarWidth(sidebarInitialWidth);
      });

      it('TINYMCE-14530: should clamp the sidebar when the editor shrinks and restore it when the editor grows back', async () => {
        const editor = hook.editor();

        assert.equal(Width.get(TinyDom.container(editor)), 1500, 'The editor should start at its configured width');
        assertSidebarWidth(1000, 'The sidebar should start at its configured width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should match the configured width');

        await resizeEditorBy([ -400, 0 ]);

        assert.equal(Width.get(TinyDom.container(editor)), 1100, 'The editor should shrink');
        assert.equal(Width.get(SidebarUtils.getEditArea()), minEditingAreaWidth, 'The editing area must not shrink below its minimum width');
        assertSidebarWidth(1100 - minEditingAreaWidth - editorBorderLeft - editorBorderRight, 'The sidebar should be clamped so the editing area keeps its minimum width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should be preserved while the rendered width is clamped');

        await resizeEditorBy([ 400, 0 ]);

        assert.equal(Width.get(TinyDom.container(editor)), 1500, 'The editor should grow back');
        assertSidebarWidth(1000, 'The sidebar should return to its requested width once there is room again');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should have been preserved throughout');
      });

      it('TINYMCE-14530: should still resize the sidebar by dragging while the editing area is clamped at its minimum', async () => {
        const editor = hook.editor();

        assert.equal(Width.get(TinyDom.container(editor)), 1500, 'The editor should start at its configured width');
        assertSidebarWidth(1000, 'The sidebar should start at its configured width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should match the configured width');

        await resizeEditorBy([ -400, 0 ]);

        assert.equal(Width.get(TinyDom.container(editor)), 1100, 'The editor should shrink');
        assert.equal(Width.get(SidebarUtils.getEditArea()), minEditingAreaWidth, 'The editing area must not shrink below its minimum width');
        assertSidebarWidth(1100 - minEditingAreaWidth - editorBorderLeft - editorBorderRight, 'The sidebar should be clamped so the editing area keeps its minimum width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should be preserved while the rendered width is clamped');

        await SidebarUtils.resizeSidebarBy([ 40, 0 ]);

        assertSidebarWidth(1100 - minEditingAreaWidth - editorBorderLeft - editorBorderRight - 40, 'Dragging the handle should shrink the rendered sidebar');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1100 - minEditingAreaWidth - editorBorderLeft - editorBorderRight - 40, 'Dragging the handle should update the requested width even while the editing area was clamped');
      });
    });

    context('TINYMCE-14530: Growing the sidebar while the editing area is clamped', () => {
      const hook = setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: 1000, sidebar_max_width: 5000, resize: 'both', statusbar: true, width: 1500 });

      it('TINYMCE-14530: should cap the sidebar at the editing area minimum when dragging to grow it while the editing area is clamped', async () => {
        const editor = hook.editor();

        assert.equal(Width.get(TinyDom.container(editor)), 1500, 'The editor should start at its configured width');
        assertSidebarWidth(1000, 'The sidebar should start at its configured width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should match the configured width');

        await resizeEditorBy([ -400, 0 ]);

        assert.equal(Width.get(TinyDom.container(editor)), 1100, 'The editor should shrink');
        assertSidebarWidth(1100 - minEditingAreaWidth - editorBorderLeft - editorBorderRight, 'The sidebar should be clamped so the editing area keeps its minimum width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should be preserved while the rendered width is clamped');
        assert.equal(Width.get(SidebarUtils.getEditArea()), minEditingAreaWidth, 'The editing area must not shrink below its minimum width');

        await SidebarUtils.resizeSidebarBy([ -100, 0 ]);

        assertSidebarWidth(1100 - minEditingAreaWidth - editorBorderLeft - editorBorderRight, 'Dragging to grow should be capped at the editing area minimum, using the recomputed limit for the shrunk editor');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1100 - minEditingAreaWidth - editorBorderLeft - editorBorderRight, 'The requested width should update to the capped width when dragging to grow');
        assert.equal(Width.get(SidebarUtils.getEditArea()), minEditingAreaWidth, 'The editing area must still be kept at its minimum width');
      });
    });

    context('TINYMCE-14530: Dragging the sidebar while it is clamped below its configured minimum width', () => {
      const hook = setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: 1000, sidebar_min_width: 900, sidebar_max_width: 1200, width: 1500, resize: 'both', statusbar: true });

      it('TINYMCE-14530: should leave the sidebar untouched when dragging it while it is already clamped below its configured minimum width', async () => {
        const editor = hook.editor();

        assert.equal(Width.get(SidebarUtils.getEditArea()), 500 - editorBorderLeft - editorBorderRight, 'The editing area should start at the space left over after the configured sidebar width');
        assertSidebarWidth(1000, 'The sidebar should start at its configured width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should match the configured width');

        await resizeEditorBy([ -500, 0 ]);

        assert.equal(Width.get(TinyDom.container(editor)), 1000, 'The editor should shrink');
        assert.equal(Width.get(SidebarUtils.getEditArea()), minEditingAreaWidth, 'The editing area must not shrink below its minimum width');
        assertSidebarWidth(1000 - minEditingAreaWidth - editorBorderLeft - editorBorderRight, 'The sidebar should be clamped so the editing area keeps its minimum width, even though that leaves it narrower than its configured minimum width');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should be preserved while the rendered width is clamped');

        await SidebarUtils.resizeSidebarBy([ 10, 0 ]);
        assertSidebarWidth(1000 - minEditingAreaWidth - editorBorderLeft - editorBorderRight, 'Dragging should not move the sidebar');
        assert.equal(SidebarUtils.getSidebarRequestedWidth(), 1000, 'The requested width should be preserved because the drag cannot change the clamped width');
        store.assertEq('No resize events should be emitted while the sidebar is clamped below its configured min width', []);
      });
    });
  });

  context('TINYMCE-14529: Sidebar resize events', () => {
    setupEditorHook({ sidebar_show: 'sidebarone', sidebar_width: 440, sidebar_min_width: 300, sidebar_max_width: 800 });

    it('TINYMCE-14529: should emit SidebarResizeStart on drag start and SidebarResized with the final width on drag stop', async () => {
      const resizeHandle = SidebarUtils.getSidebarResizeHandle();

      await Pointer.pWithMockPointerCapture(resizeHandle, {}, async () => {
        Pointer.pointerDown(resizeHandle);
        Pointer.pointerMoveBy(resizeHandle, 0, 0);
        store.assertEq('SidebarResizeStart should be emitted when dragging starts', [ resizeStartEvent() ]);

        Pointer.pointerMoveBy(resizeHandle, -40, 0);
        assertSidebarWidth(480, 'Dragging the handle left should grow the sidebar');
        store.assertEq('SidebarResized should not be emitted mid-drag', [ resizeStartEvent() ]);

        Pointer.pointerUp(resizeHandle);
      });

      store.assertEq(
        'SidebarResized should be emitted once with the final width when dragging stops',
        [ resizeStartEvent(), resizedEvent(480) ]
      );
    });
  });

  context('TINYMCE-14678: Per-sidebar resizable flag', () => {
    const resizableClass = 'tox-sidebar-wrap--resizable';

    const assertWrapResizable = (message: string) =>
      assert.isTrue(Class.has(SidebarUtils.getSidebarWrap(), resizableClass), message);

    const assertWrapNotResizable = (message: string) =>
      assert.isFalse(Class.has(SidebarUtils.getSidebarWrap(), resizableClass), message);

    const assertHandleVisible = (message: string) =>
      assert.isTrue(Visibility.isVisible(SidebarUtils.getSidebarResizeHandle()), message);

    const assertHandleNotVisible = (message: string) =>
      assert.isFalse(Visibility.isVisible(SidebarUtils.getSidebarResizeHandle()), message);

    context('TINYMCE-14678: The resizable state follows the shown sidebar', () => {
      const initialWidth = 440;
      const hook = setupEditorHook({ sidebar_width: initialWidth, sidebar_min_width: 300, sidebar_max_width: 800 });

      beforeEach(async () => {
        const editor = hook.editor();
        if (editor.queryCommandValue('ToggleSidebar') !== 'sidebarone') {
          editor.execCommand('ToggleSidebar', false, 'sidebarone');
          await SidebarUtils.pWaitForSidebarOpen();
        }
        await resetSidebarWidth(initialWidth);
        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        await SidebarUtils.pWaitForSidebarClosed();
        store.clear();
      });

      it('TINYMCE-14678: should not be resizable when the shown sidebar has resizable: false', async () => {
        const editor = hook.editor();
        assertWrapNotResizable('The wrap should not have the resizable class while no sidebar is shown');

        editor.execCommand('ToggleSidebar', false, 'resizable-false');
        assertWrapNotResizable('A resizable: false sidebar should not add the resizable class to the wrap');

        await SidebarUtils.pWaitForSidebarOpen();
        assertWrapNotResizable('The resizable class should still be absent once the resizable: false sidebar has finished opening');
        assertHandleNotVisible('The resize handle should not be rendered when the sidebar is not resizable');
      });

      it('TINYMCE-14678: should not be resizable when the shown sidebar omits the resizable flag', async () => {
        const editor = hook.editor();
        assertWrapNotResizable('The wrap should not have the resizable class while no sidebar is shown');

        editor.execCommand('ToggleSidebar', false, 'resizable-unset');
        assertWrapNotResizable('A sidebar that omits the resizable flag should default to non-resizable and not add the resizable class');

        await SidebarUtils.pWaitForSidebarOpen();
        assertWrapNotResizable('The resizable class should still be absent once the sidebar that omits the flag has finished opening');
        assertHandleNotVisible('The resize handle should not be rendered when the sidebar omits the resizable flag');
      });

      it('TINYMCE-14678: should be resizable when the shown sidebar has resizable: true', async () => {
        const editor = hook.editor();
        assertWrapNotResizable('The wrap should not have the resizable class while no sidebar is shown');

        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        assertWrapResizable('A resizable: true sidebar should add the resizable class to the wrap');

        await SidebarUtils.pWaitForSidebarOpen();
        assertWrapResizable('The resizable class should still be present once the resizable sidebar has finished opening');
        assertHandleVisible('The resize handle should be rendered when the sidebar is resizable');
        assertSidebarWidth(440, 'The sidebar should start at its configured width');

        await SidebarUtils.resizeSidebarBy([ -40, 0 ]);
        assertSidebarWidth(480, 'Dragging the handle should resize a resizable sidebar');
        store.assertEq('Resizing a resizable sidebar should emit the resize start and resized events', [resizeStartEvent(), resizedEvent(480)]);
      });

      it('TINYMCE-14678: should toggle the resizable class when switching between resizable and non-resizable panels', async () => {
        const editor = hook.editor();
        assertWrapNotResizable('The wrap should not have the resizable class while no sidebar is shown');

        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        assertWrapResizable('A resizable: true sidebar should add the resizable class to the wrap');

        await SidebarUtils.pWaitForSidebarOpen();
        assertWrapResizable('The resizable class should still be present once the resizable sidebar has finished opening');
        assertHandleVisible('The resize handle should be rendered while a resizable panel is shown');

        editor.execCommand('ToggleSidebar', false, 'resizable-false');
        assertWrapNotResizable('Switching to a non-resizable panel should remove the resizable class');
        assertHandleNotVisible('The resize handle should not be rendered while a non-resizable panel is shown');

        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        assertWrapResizable('Switching back to a resizable panel should restore the resizable class');
        assertHandleVisible('The resize handle should be rendered again once the resizable panel is shown');
      });

      it('TINYMCE-14678: should remove the resizable class when a resizable sidebar is hidden', async () => {
        const editor = hook.editor();

        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        assertWrapResizable('Showing a resizable panel should add the resizable class immediately after toggling');

        await SidebarUtils.pWaitForSidebarOpen();
        assertWrapResizable('The resizable class should still be present once the resizable panel has finished opening');

        // The slot is only hidden once the shrink animation finishes, so the class is removed after animation.
        editor.execCommand('ToggleSidebar', false, 'sidebarone');
        await SidebarUtils.pWaitForSidebarClosed();
        assertWrapNotResizable('Hiding a resizable panel should remove the resizable class, since visibility wins over the panel being resizable');
      });
    });

    context('TINYMCE-14678: A non-resizable sidebar shown on load via sidebar_show', () => {
      setupEditorHook({ sidebar_show: 'resizable-false' });

      it('TINYMCE-14678: should not be resizable when a non-resizable sidebar is shown on initial render', () => {
        assertWrapNotResizable('A non-resizable sidebar shown via sidebar_show should not add the resizable class on initial render');
        assertHandleNotVisible('The resize handle should not be rendered for a non-resizable sidebar shown on load');
      });
    });

    context('TINYMCE-14678: Non-resizable sidebars ignore the width constraints', () => {
      context('TINYMCE-14678: the configured sidebar_width and sidebar_max_width', () => {
        const hook = setupEditorHook({ sidebar_width: 500, sidebar_min_width: 300, sidebar_max_width: 600, width: 1200 });

        it('TINYMCE-14678: should render a non-resizable sidebar at its content width, ignoring sidebar_width and sidebar_max_width', async () => {
          const editor = hook.editor();

          editor.execCommand('ToggleSidebar', false, 'w800-resizable-false');
          await SidebarUtils.pWaitForSidebarOpen();

          assertSidebarWidth(800, 'A non-resizable sidebar should render at its content width, ignoring the configured sidebar_width and sidebar_max_width');
        });
      });

      context('TINYMCE-14678: the editing area minimum width', () => {
        const hook = setupEditorHook({ sidebar_max_width: 5000, width: 1200 });

        it('TINYMCE-14678: should let a non-resizable sidebar shrink the editing area below its minimum width', async () => {
          const editor = hook.editor();

          editor.execCommand('ToggleSidebar', false, 'w1000-resizable-false');
          await SidebarUtils.pWaitForSidebarOpen();

          // The editing-area minimum width is enforced only for resizable sidebars, so a
          // non-resizable sidebar keeps its full content width and lets the editing area take whatever is left.
          assertSidebarWidth(1000, 'A non-resizable sidebar should render at its full content width');
          assert.equal(
            Width.get(SidebarUtils.getEditArea()),
            1200 - editorBorderLeft - editorBorderRight - 1000,
            'The editing area should keep the leftover space even though it drops below the minimum, since that protection only applies to resizable sidebars'
          );
        });
      });
    });
  });
});
