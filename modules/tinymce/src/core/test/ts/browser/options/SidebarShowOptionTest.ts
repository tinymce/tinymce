
import { Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import {describe, it } from '@ephox/bedrock-client';
import { Sidebar } from '@ephox/bridge';
import { SugarElement, Traverse } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

interface EventLog {
  readonly name: string;
  readonly index: number;
}

describe('browser.tinymce.core.options.sidebar_show', () => {
  const settingsFactory = (store: TestHelpers.TestStore) => {
    const logEvent = (name: string) => (api: Sidebar.SidebarInstanceApi) => {
      const index = Traverse.findIndex(SugarElement.fromDom(api.element())).getOr(-1);
      const entry: EventLog = { name, index };
      store.adder(entry)();
    };

    return {
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed) => {
        ed.ui.registry.addSidebar('sidebarone', {
          tooltip: 'side bar one',
          icon: 'comment',
          onShow: logEvent('sidebarone:show'),
        });
        ed.ui.registry.addSidebar('sidebartwo', {
          tooltip: 'side bar one',
          icon: 'comment',
          onShow: logEvent('sidebartwo:show'),
        });
      }
    };
  };

  it('TINY-8710: Show no sidebar on init if not set', async () => {
    const store = TestHelpers.TestStore();
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
    });
    await Waiter.pTryUntil('Checking initial events', () => store.assertEq('Asserting initial show of sidebars', []));
    McEditor.remove(editor);
  });

  it('TINY-8710: Show a sidebar on init', async () => {
    const store = TestHelpers.TestStore();
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
      sidebar_show: 'sidebarone'
    });
    await Waiter.pTryUntil('Checking initial events', () => store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'sidebarone:show',
        index: 0
      },
    ]));
    McEditor.remove(editor);
  });

  it('TINY-8710: Show just one sidebar on init', async () => {
    const store = TestHelpers.TestStore();
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
      sidebar_show: 'sidebartwo'
    });
    await Waiter.pTryUntil('Checking initial events', () => store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'sidebartwo:show',
        index: 1
      },
    ]));
    McEditor.remove(editor);
  });

  it('TINY-8710: Show no side bar if name does not exist', async () => {
    const store = TestHelpers.TestStore();
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
      sidebar_show: 'sidebartwo'
    });
    await Waiter.pTryUntil('Checking initial events', () => store.assertEq('Asserting initial show of sidebars', []));
    McEditor.remove(editor);
  });
});
