import { TestStore, UiFinder } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Sidebar } from '@ephox/bridge';
import { SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { McEditor, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

interface EventLog {
  readonly name: string;
  readonly index: number;
}

describe('browser.tinymce.themes.silver.sidebar.SidebarShowOptionTest', () => {
  const store = TestStore<EventLog>();
  const settingsFactory = (store: TestStore<EventLog>) => {
    const logEvent = (name: string) => (api: Sidebar.SidebarInstanceApi) => {
      const index = Traverse.findIndex(SugarElement.fromDom(api.element())).getOr(-1);
      const entry: EventLog = { name, index };
      store.adder(entry)();
    };

    return {
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'sidebarone sidebartwo',
      setup: (ed: Editor) => {
        ed.ui.registry.addSidebar('sidebarone', {
          tooltip: 'side bar one',
          icon: 'comment',
          onShow: logEvent('sidebarone:show'),
        });
        ed.ui.registry.addSidebar('SideBarTwo', {
          tooltip: 'side bar two',
          icon: 'comment',
          onShow: logEvent('SideBarTwo:show'),
        });
      }
    };
  };

  const assertNotAnimating = () => UiFinder.notExists(SugarBody.body(), '.tox-sidebar--sliding-growing');
  const assertSidebarOpen = () => UiFinder.exists(SugarBody.body(), '.tox-sidebar--sliding-open');
  const assertSidebarClosed = () => UiFinder.notExists(SugarBody.body(), '.tox-sidebar--sliding-open');
  const pAssertToolbarActiveStates = async (editor: Editor, states: [ boolean, boolean ]) => {
    const pAssertToolbarButtonState = (editor: Editor, selector: string, active: boolean) =>
      TinyUiActions.pWaitForUi(editor, `button[aria-label="${selector}"][aria-pressed="${active}"]`);

    await pAssertToolbarButtonState(editor, 'side bar one', states[0]);
    await pAssertToolbarButtonState(editor, 'side bar two', states[1]);
  };

  beforeEach(() => {
    store.clear();
  });

  it('TINY-8710: Show no sidebar on init if not set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store)
    });
    store.assertEq('Asserting initial show of sidebars', []);
    assertSidebarClosed();
    await pAssertToolbarActiveStates(editor, [ false, false ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show a sidebar on init', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store),
      sidebar_show: 'sidebarone'
    });
    assertNotAnimating();
    assertSidebarOpen();
    await pAssertToolbarActiveStates(editor, [ true, false ]);
    store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'sidebarone:show',
        index: 0
      },
    ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show a different sidebar on init', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store),
      sidebar_show: 'SideBarTwo'
    });
    assertNotAnimating();
    assertSidebarOpen();
    await pAssertToolbarActiveStates(editor, [ false, true ]);
    store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'SideBarTwo:show',
        index: 1
      }
    ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Name should be case-insensitive', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store),
      sidebar_show: 'sideBartwo'
    });
    assertNotAnimating();
    assertSidebarOpen();
    store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'SideBarTwo:show',
        index: 1
      }
    ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show no sidebar if the name does not exist', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      ...settingsFactory(store),
      sidebar_show: 'noexistsidebar'
    });
    store.assertEq('Asserting initial show of sidebars', []);
    assertSidebarClosed();
    await pAssertToolbarActiveStates(editor, [ false, false ]);
    McEditor.remove(editor);
  });
});
