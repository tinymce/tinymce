import { ApproxStructure, Assertions, Chain, GeneralSteps, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { Sidebar } from '@ephox/bridge';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Element, Traverse } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { TestHelpers } from '@ephox/alloy';

interface EventLog {
  name: string;
  index: number;
}

UnitTest.asynctest('tinymce.themes.silver.test.browser.sidebar.SidebarTest', function (success, failure) {
  const store = TestHelpers.TestStore();
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    const sClickAndAssertEvents = function (tooltip, expected: EventLog[]) {
      return GeneralSteps.sequence([
        store.sClear,
        tinyUi.sClickOnToolbar('Toggle sidebar', 'button[aria-label="' + tooltip + '"]'),
        Waiter.sTryUntil('Checking sidebar callbacks', store.sAssertEq('Asserting sidebar callbacks', expected), 10, 1000),
      ]);
    };

    Pipeline.async(editor, Log.steps('TBA', 'Sidebar actions test', [
      Chain.asStep(Body.body(), [
        UiFinder.cFindIn('.tox-sidebar-wrap .tox-sidebar'),
        Assertions.cAssertStructure('Checking structure', ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [arr.has('tox-sidebar')],
            children: [
              s.element('div', {
                classes: [arr.has('tox-sidebar__slider')],
                children: [
                  s.element('div', {
                    classes: [arr.has('tox-sidebar__pane-container')],
                    children: [
                      s.element('div', {
                        classes: [arr.has('tox-sidebar__pane')],
                        styles: { display: str.is('none') },
                        attrs: { 'aria-hidden': str.is('true') }
                      }),
                      s.element('div', {
                        classes: [arr.has('tox-sidebar__pane')],
                        styles: { display: str.is('none') },
                        attrs: { 'aria-hidden': str.is('true') }
                      }),
                      s.element('div', {
                        classes: [arr.has('tox-sidebar__pane')],
                        styles: { display: str.is('none') },
                        attrs: { 'aria-hidden': str.is('true') }
                      })
                    ]
                  })
                ]
              })
            ]
          });
        }))
      ]),
      Waiter.sTryUntil('Checking initial events', store.sAssertEq('Asserting intial render and hide of sidebar', [
        {name: 'mysidebar1:render', index: 0},
        {name: 'mysidebar2:render', index: 1},
        {name: 'mysidebar3:render', index: 2},
        {name: 'mysidebar1:hide', index: 0},
        {name: 'mysidebar2:hide', index: 1},
        {name: 'mysidebar3:hide', index: 2},
      ]), 10, 1000),
      sClickAndAssertEvents('My sidebar 1', [{name: 'mysidebar1:show', index: 0}]),
      sClickAndAssertEvents('My sidebar 2', [{name: 'mysidebar1:hide', index: 0}, {name: 'mysidebar2:show', index: 1}]),
      sClickAndAssertEvents('My sidebar 3', [{name: 'mysidebar2:hide', index: 1}, {name: 'mysidebar3:show', index: 2}]),
      sClickAndAssertEvents('My sidebar 3', [{name: 'mysidebar3:hide', index: 2}]),
    ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'mysidebar1 mysidebar2 mysidebar3',
    setup (editor) {
      const logEvent = (name: string) => (api: Sidebar.SidebarInstanceApi) => {
        const index = Traverse.findIndex(Element.fromDom(api.element())).getOr(-1);
        const entry: EventLog = {name, index};
        store.adder(entry)();
      };
      const handleSetup = (eventName: string) => (api: Sidebar.SidebarInstanceApi) => {
        api.element().appendChild(Element.fromHtml('<div style="width: 200px; background: red;"></div>').dom());
        logEvent(eventName)(api);
        return () => {};
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
    },
  }, success, failure);
});
