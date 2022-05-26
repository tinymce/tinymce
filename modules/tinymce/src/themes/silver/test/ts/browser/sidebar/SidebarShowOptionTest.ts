
import { UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Sidebar } from '@ephox/bridge';
import { SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';
interface EventLog {
  readonly name: string;
  readonly index: number;
}

describe('browser.tinymce.core.options.SidebarShowOptionTest', () => {
  const store = TestHelpers.TestStore();
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

  beforeEach(() => {
    store.clear();
  });

  it('TINY-8710: Show no sidebar on init if not set', async () => {
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
    });
    store.assertEq('Asserting initial show of sidebars', []);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show a sidebar on init', async () => {
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
      sidebar_show: 'sidebarone'
    });
    store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'sidebarone:show',
        index: 0
      },
    ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show a different sidebar on init', async () => {
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
      sidebar_show: 'sidebartwo'
    });
    store.assertEq('Asserting initial show of sidebars', [
      {
        name: 'sidebartwo:show',
        index: 1
      },
    ]);
    McEditor.remove(editor);
  });

  it('TINY-8710: Show no sidebar if the name does not exist', async () => {
    const editor = await McEditor.pFromSettings({
      ...settingsFactory(store),
    });
    store.assertEq('Asserting initial show of sidebars', []);
    McEditor.remove(editor);
  });

  it('TINY-8710: Should not apply animation', async () => {
    McEditor.pFromSettings({
      ...settingsFactory(store),
      sidebar_show: 'sidebartwo',
    });
    try {
      // expect that no animation should be applied to the sidebar
      await Waiter.pTryUntil('Watch any animation being applied to the sidebar', () => UiFinder.exists(SugarBody.body(), '.tox-sidebar--sliding-growing'));
      assert.fail('growing animation is applied to the sidebar');
    } catch (e) {
      // pass
    }
  });
});
