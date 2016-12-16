define(
  'ephox.alloy.demo.TabSectionDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.highway.Merger',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/demo.tabbar.html',
    'text!dom-templates/demo.tabbing.html'
  ],

  function (Gui, TabSection, Tabbar, HtmlDisplay, Merger, Class, Element, Insert, document, TemplateTabbar, TemplateTabs) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());


      var subject = HtmlDisplay.section(
        gui,
        'A basic tab view (refactoring)',
        TabSection.build({
          dom: {
            tag: 'div'
          },
          components: [
            TabSection.parts().tabbar(),
            TabSection.parts().tabview()
          ],
          tabs: [
            {
              value: 'alpha',
              text: 'Alpha',
              view: function () {
                return [
                  { text: 'Alpha panel' }
                ];
              }
            },
            {
              value: 'beta',
              text: 'Beta',
              view: function () {
                return [
                  { text: 'Beta panel' }
                ];
              }
            }
          ],
          defaultView: function () {
            return {
              uiType: 'container'
            };
          },
          parts: {
            tabbar: {
              dom: {
                tag: 'div'
              },
              components: [
                Tabbar.parts().tabs()
              ],
              parts: {
                tabs: { }
              },
              members: {
                tab: {
                  munge: function (tabSpec) {
                    return Merger.deepMerge(tabSpec, {
                      dom: {
                        tag: 'button',
                        attributes: {
                          'data-value': tabSpec.value
                        }
                      },
                      components: [
                        { text: tabSpec.text }
                      ]
                    });
                  }
                }
              },
              markers: {
                tabClass: 'demo-tab',
                selectedClass: 'demo-selected-tab'
              }
            },
            'tabview': {
              dom: {
                tag: 'div'
              }
            } 
          }
        })
      );

    };
  }
);