import { ApproxStructure, Assertions, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Sidebar } from 'tinymce/core/api/ui/Ui';

interface EventLog {
  readonly name: string;
  readonly index: number;
}

describe('browser.tinymce.themes.silver.sidebar.SidebarTest', () => {
  const store = TestStore<EventLog>();
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
  }, []);

  const pClickAndAssertEvents = async (editor: Editor, tooltip: string, expected: EventLog[]) => {
    store.clear();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="' + tooltip + '"]');
    await Waiter.pTryUntil('Checking sidebar callbacks', () => store.assertEq('Asserting sidebar callbacks', expected));
  };

  it('TBA: Sidebar initial events test', async () => {
    await Waiter.pTryUntil('Checking initial events', () => store.assertEq('Asserting initial render and hide of sidebar', [
      { name: 'mysidebar1:render', index: 0 },
      { name: 'mysidebar2:render', index: 1 },
      { name: 'mysidebar3:render', index: 2 },
      { name: 'mysidebar1:hide', index: 0 },
      { name: 'mysidebar2:hide', index: 1 },
      { name: 'mysidebar3:hide', index: 2 }
    ]));
  });

  it('TBA: Sidebar structure test', () => {
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
    await pClickAndAssertEvents(editor, 'My sidebar 1', [{ name: 'mysidebar1:show', index: 0 }]);
    await pClickAndAssertEvents(editor, 'My sidebar 2', [{ name: 'mysidebar1:hide', index: 0 }, { name: 'mysidebar2:show', index: 1 }]);
    await pClickAndAssertEvents(editor, 'My sidebar 3', [{ name: 'mysidebar2:hide', index: 1 }, { name: 'mysidebar3:show', index: 2 }]);
    await pClickAndAssertEvents(editor, 'My sidebar 3', [{ name: 'mysidebar3:hide', index: 2 }]);
  });
});
