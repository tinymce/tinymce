import { ApproxStructure, Assertions, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import type { Sidebar } from 'tinymce/core/api/ui/Ui';

interface EventLog {
  readonly name: string;
  readonly index: number;
}

describe('browser.tinymce.themes.silver.sidebar.SidebarTest', () => {
  const store = TestStore<EventLog>();

  const pClickAndAssertEvents = async (editor: Editor, tooltip: string, expected: EventLog[]) => {
    store.clear();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="' + tooltip + '"]');
    await Waiter.pTryUntil('Checking sidebar callbacks', () => store.assertEq('Asserting sidebar callbacks', expected));
  };

  const pExecCommandAndAssertEvents = async (editor: Editor, sidebarName: string, expected: EventLog[]) => {
    store.clear();
    editor.execCommand('ToggleSidebar', false, sidebarName);
    await Waiter.pTryUntil('Checking sidebar callbacks', () => store.assertEq('Asserting sidebar callbacks', expected));
  };

  context('Toggling sidebar with button', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'mysidebar1 mysidebar2 mysidebar3',
      setup: (editor: Editor) => {
        const logEvent = (name: string) => (api: Sidebar.SidebarInstanceApi) => {
          const index = Traverse.findIndex(SugarElement.fromDom(api.element())).getOr(-1);
          const entry: EventLog = { name, index };
          store.adder(entry)();
        };
        const handleSetup = (eventName: string) => (api: Sidebar.SidebarInstanceApi) => {
          api.element().appendChild(SugarElement.fromHtml('<div style="width: 200px; background: red;"></div>').dom);
          logEvent(eventName)(api);
          return Fun.noop;
        };
        editor.ui.registry.addSidebar('mysidebar1', {
          tooltip: 'My sidebar 1',
          icon: 'bold',
          onSetup: handleSetup('mysidebar1:render'),
          onShow: logEvent('mysidebar1:show'),
          onHide: logEvent('mysidebar1:hide')
        });

        editor.ui.registry.addSidebar('mysidebar2', {
          tooltip: 'My sidebar 2',
          icon: 'italic',
          onSetup: handleSetup('mysidebar2:render'),
          onShow: logEvent('mysidebar2:show'),
          onHide: logEvent('mysidebar2:hide')
        });

        editor.ui.registry.addSidebar('mysidebar3', {
          tooltip: 'My sidebar 3',
          icon: 'comment',
          onSetup: handleSetup('mysidebar3:render'),
          onShow: logEvent('mysidebar3:show'),
          onHide: logEvent('mysidebar3:hide')
        });
      }
    });

    it('TBA: Sidebar initial events test', async () => {
      await Waiter.pTryUntil('Checking initial events', () => store.assertEq('Asserting initial render and hide of sidebar', [
        { name: 'mysidebar1:render', index: 1 },
        { name: 'mysidebar2:render', index: 2 },
        { name: 'mysidebar3:render', index: 3 },
        { name: 'mysidebar1:hide', index: 1 },
        { name: 'mysidebar2:hide', index: 2 },
        { name: 'mysidebar3:hide', index: 3 }
      ]));
    });

    it('TBA: Sidebar structure test', async () => {
      const sidebar = UiFinder.findIn(SugarBody.body(), '.tox-sidebar-wrap .tox-sidebar').getOrDie();
      Assertions.assertStructure('Checking structure', ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-sidebar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-sidebar__slider') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-sidebar__pane-container') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-sidebar__resize-handle') ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-sidebar__pane') ],
                    styles: { display: str.is('none') },
                    attrs: { 'aria-hidden': str.is('true') }
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-sidebar__pane') ],
                    styles: { display: str.is('none') },
                    attrs: { 'aria-hidden': str.is('true') }
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-sidebar__pane') ],
                    styles: { display: str.is('none') },
                    attrs: { 'aria-hidden': str.is('true') }
                  })
                ]
              })
            ]
          })
        ]
      })), sidebar);
    });

    it('TBA: Sidebar actions test', async () => {
      const editor = hook.editor();
      await pClickAndAssertEvents(editor, 'My sidebar 1', [{ name: 'mysidebar1:show', index: 1 }]);
      await pClickAndAssertEvents(editor, 'My sidebar 2', [{ name: 'mysidebar1:hide', index: 1 }, { name: 'mysidebar2:show', index: 2 }]);
      await pClickAndAssertEvents(editor, 'My sidebar 3', [{ name: 'mysidebar2:hide', index: 2 }, { name: 'mysidebar3:show', index: 3 }]);
      await pClickAndAssertEvents(editor, 'My sidebar 3', [{ name: 'mysidebar3:hide', index: 3 }]);
    });

    it('TINY-11178: Toggle sidebar command test', async () => {
      const editor = hook.editor();
      await pExecCommandAndAssertEvents(editor, 'mysidebar1', [{ name: 'mysidebar1:show', index: 1 }]);
      await pExecCommandAndAssertEvents(editor, 'mysidebar2', [{ name: 'mysidebar1:hide', index: 1 }, { name: 'mysidebar2:show', index: 2 }]);
      await pExecCommandAndAssertEvents(editor, 'mysidebar3', [{ name: 'mysidebar2:hide', index: 2 }, { name: 'mysidebar3:show', index: 3 }]);
      await pExecCommandAndAssertEvents(editor, 'mysidebar3', [{ name: 'mysidebar3:hide', index: 3 }]);
    });
  });

  context('Initialize sidebar with command', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'mysidebar1',
      setup: (editor: Editor) => {
        const logEvent = (name: string) => (api: Sidebar.SidebarInstanceApi) => {
          const index = Traverse.findIndex(SugarElement.fromDom(api.element())).getOr(-1);
          const entry: EventLog = { name, index };
          store.adder(entry)();
        };
        const handleSetup = (eventName: string) => (api: Sidebar.SidebarInstanceApi) => {
          store.clear();
          api.element().appendChild(SugarElement.fromHtml('<div style="width: 200px; background: red;"></div>').dom);
          logEvent(eventName)(api);
          return Fun.noop;
        };
        editor.ui.registry.addSidebar('mysidebar1', {
          tooltip: 'My sidebar 1',
          icon: 'bold',
          onSetup: handleSetup('mysidebar1:render'),
          onShow: logEvent('mysidebar1:show'),
          onHide: logEvent('mysidebar1:hide')
        });
        editor.on('init', () => {
          editor.execCommand('ToggleSidebar', false, 'mysidebar1');
        });
      }
    });

    it('TINY-11178: Toggle sidebar command on init event test', async () => {
      const editor = hook.editor();
      await Waiter.pTryUntil('Checking sidebar callbacks', () => store.assertEq('Asserting sidebar callbacks', [
        { name: 'mysidebar1:render', index: 1 },
        { name: 'mysidebar1:hide', index: 1 },
        { name: 'mysidebar1:show', index: 1 }
      ]));
      await pExecCommandAndAssertEvents(editor, 'mysidebar1', [{ name: 'mysidebar1:hide', index: 1 }]);
    });
  });

  const assertButtonEnabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  context('Sidebar toggle button', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'mysidebar1',
      setup: (editor: Editor) => {
        const logEvent = (name: string) => (api: Sidebar.SidebarInstanceApi) => {
          const index = Traverse.findIndex(SugarElement.fromDom(api.element())).getOr(-1);
          const entry: EventLog = { name, index };
          store.adder(entry)();
        };
        const handleSetup = (eventName: string) => (api: Sidebar.SidebarInstanceApi) => {
          store.clear();
          api.element().appendChild(SugarElement.fromHtml('<div style="width: 200px; background: red;"></div>').dom);
          logEvent(eventName)(api);
          return Fun.noop;
        };
        editor.ui.registry.addSidebar('mysidebar1', {
          tooltip: 'My sidebar 1',
          icon: 'bold',
          onSetup: handleSetup('mysidebar1:render'),
          onShow: logEvent('mysidebar1:show'),
          onHide: logEvent('mysidebar1:hide')
        });
      }
    });

    it('TINY-11211: Toggle sidebar button should be disabled in readonly mode', async () => {
      const editor = hook.editor();
      assertButtonEnabled('mysidebar1');
      editor.execCommand('ToggleSidebar', false, 'mysidebar1');
      await Waiter.pTryUntil('Checking sidebar callbacks', () => store.assertEq('Asserting sidebar callbacks', [
        { name: 'mysidebar1:render', index: 1 },
        { name: 'mysidebar1:hide', index: 1 },
        { name: 'mysidebar1:show', index: 1 }
      ]));
      await pExecCommandAndAssertEvents(editor, 'mysidebar1', [{ name: 'mysidebar1:hide', index: 1 }]);

      editor.mode.set('readonly');
      assertButtonEnabled('mysidebar1');
      editor.execCommand('ToggleSidebar', false, 'mysidebar1');
      await Waiter.pTryUntil('Checking sidebar callbacks', () => store.assertEq('Asserting sidebar callbacks', [
        { name: 'mysidebar1:hide', index: 1 },
        { name: 'mysidebar1:show', index: 1 }
      ]));
      await pExecCommandAndAssertEvents(editor, 'mysidebar1', [{ name: 'mysidebar1:hide', index: 1 }]);

      editor.mode.set('readonly');
      assertButtonEnabled('mysidebar1');

      editor.mode.set('design');
    });
  });

  context('Sidebar toggle should not scroll to caret', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      height: 300,
      toolbar: 'bold mysidebar1',
      setup: (editor: Editor) => {
        editor.ui.registry.addSidebar('mysidebar1', {
          tooltip: 'My sidebar 1',
          icon: 'comment',
          onSetup: (api: Sidebar.SidebarInstanceApi) => {
            api.element().appendChild(SugarElement.fromHtml('<div style="width: 200px;">Test</div>').dom);
            return Fun.noop;
          },
          onShow: Fun.noop,
          onHide: Fun.noop
        });
      }
    });

    const blurEditor = () => {
      const body = SugarBody.body();
      body.dom.focus();
    };

    const pToggleSidebar = async (editor: Editor): Promise<void> => {
      TinyUiActions.clickOnToolbar(editor, 'button[aria-label="My sidebar 1"]');
      await Waiter.pWait(100);
    };

    afterEach(async () => {
      const editor = hook.editor();
      if (editor.queryCommandValue('ToggleSidebar') === 'mysidebar1') {
        await pToggleSidebar(editor);
      }
    });

    it('TINYMCE-14765: Opening sidebar from toolbar does not scroll when editor unfocused', async () => {
      const editor = hook.editor();
      editor.setContent('<p>top</p><p style="height: 1000px">spacer</p><p>bottom</p>');
      editor.selection.select(editor.getBody().lastChild as Element);
      editor.getWin().scrollTo(0, 0);
      blurEditor();
      const scrollY = editor.getWin().scrollY;
      await pToggleSidebar(editor);
      Assertions.assertEq('Should not scroll', scrollY, editor.getWin().scrollY);
    });

    it('TINYMCE-14765: Closing sidebar from toolbar does not scroll when editor unfocused', async () => {
      const editor = hook.editor();
      editor.setContent('<p>top</p><p style="height: 1000px">spacer</p><p>bottom</p>');
      await pToggleSidebar(editor);
      editor.selection.select(editor.getBody().lastChild as Element);
      editor.getWin().scrollTo(0, 0);
      blurEditor();
      const scrollY = editor.getWin().scrollY;
      await pToggleSidebar(editor);
      Assertions.assertEq('Should not scroll', scrollY, editor.getWin().scrollY);
    });

    it('TINYMCE-14765: Bold from toolbar still scrolls when editor unfocused', async function () {
      // Scroll behavior works locally on Safari but CI Safari doesn't register the scroll change
      // so we've agreed to keep chromium as a sanity check that we still attempt the scroll.
      if (!Env.browser.isChromium()) {
        this.skip();
      }
      const editor = hook.editor();
      editor.setContent('<p>top</p><p style="height: 1000px">spacer</p><p>bottom</p>');
      editor.selection.select(editor.getBody().lastChild as Element);
      editor.getWin().scrollTo(0, 0);
      blurEditor();
      const scrollY = editor.getWin().scrollY;
      TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bold"]');
      await Waiter.pWait(100);
      Assertions.assertEq('Should be focused', true, editor.hasFocus());
      Assertions.assertEq('Should have scrolled', true, editor.getWin().scrollY > scrollY);
    });
  });
});
