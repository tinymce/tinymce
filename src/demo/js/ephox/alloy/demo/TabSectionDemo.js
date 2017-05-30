define(
  'ephox.alloy.demo.TabSectionDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!document'
  ],

  function (GuiFactory, Attachment, Gui, Tabbar, TabSection, HtmlDisplay, Arr, Element, Class, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var makeTab = function (tabSpec) {
        return {
          view: tabSpec.view,
          value: tabSpec.value,
          dom: {
            tag: 'button',
            attributes: {
              'data-value': tabSpec.value
            }
          },
          components: [
            GuiFactory.text(tabSpec.text)
          ]
        };
      };

      var pTabbar = TabSection.parts().tabbar({
        dom: {
          tag: 'div'
        },
        components: [
          Tabbar.parts().tabs({ })
        ],
        markers: {
          tabClass: 'demo-tab',
          selectedClass: 'demo-selected-tab'
        }
      });

      var subject = HtmlDisplay.section(
        gui,
        'A basic tab view (refactoring)',
        TabSection.sketch({
          dom: {
            tag: 'div'
          },
          components: [
            pTabbar,
            TabSection.parts().tabview({
              dom: {
                tag: 'div'
              }
            })
          ],
          tabs: Arr.map([
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
          ], makeTab)
        })
      );

    };
  }
);