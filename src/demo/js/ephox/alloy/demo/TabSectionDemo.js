define(
  'ephox.alloy.demo.TabSectionDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, Container, TabSection, Tabbar, HtmlDisplay, Merger, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());


      var subject = HtmlDisplay.section(
        gui,
        'A basic tab view (refactoring)',
        TabSection.sketch({
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
                  GuiFactory.text('Alpha panel text')
                ];
              }
            },
            {
              value: 'beta',
              text: 'Beta',
              view: function () {
                return [
                  GuiFactory.text('Beta panel text')
                ];
              }
            }
          ],
          defaultView: function () {
            return Container.sketch({ });
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
                        GuiFactory.text(tabSpec.text)
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