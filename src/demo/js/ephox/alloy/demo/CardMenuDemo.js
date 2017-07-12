define(
  'ephox.alloy.demo.CardMenuDemo',

  [
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class'
  ],

  function (Attachment, Gui, Menu, TieredMenu, HtmlDisplay, Element, Class) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);


      var makeItem = function (value, text) {
        return {
          data: {
            value: value,
            text: text
          },
          type: 'item',
          dom: {
            tag: 'div',
            innerHtml: text
          },
          components: [ ]
        };
      };

      var makeMenu = function (value, items) {
        return {
          value: value,
          dom: {
            tag: 'div'
          },
          components: [
            Menu.parts().items({ })
          ],
          items: items
        };
      };

      var menu = HtmlDisplay.section(
        gui,
        'This menu is a card menu',
        TieredMenu.sketch({

          dom: {
            tag: 'div',
            classes: [ 'demo-tiered-menu' ]
          },
          components: [
            
          ],

          onExecute: function () {
            console.log('Executing');
          },
          onEscape: function () {
            console.log('Escaping');
          },
          onOpenMenu: function () {
            console.log('onOpenMenu');
          },
          onOpenSubmenu: function () {
            console.log('onOpenSubmenu');
          },

          navigateOnHover: false,

          openImmediately: true,
          data: TieredMenu.tieredData(
            'primary',
            {
              'primary': makeMenu('primary', [
                makeItem('alpha', 'Alpha'),
                makeItem('beta', 'Beta')
              ]),

              'secondary': makeMenu('secondary', [
                makeItem('animal', 'Animal'),
                makeItem('bear', 'Bear')
              ])
            },
            {
              'beta': 'secondary'
            }
          ),

          markers: {
            backgroundMenu: 'background-menu',
            menu: 'menu',
            selectedMenu: 'selected-menu',
            item: 'item',
            selectedItem: 'selected-item'
          }
        })
      );
    };
  }
);
