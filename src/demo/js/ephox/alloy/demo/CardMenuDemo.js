define(
  'ephox.alloy.demo.CardMenuDemo',

  [
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Width'
  ],

  function (Attachment, Gui, Menu, TieredMenu, HtmlDisplay, Element, Class, Css, SelectorFind, Width) {
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
            classes: [ 'demo-tiered-menu' ],
            styles: {
              outline: '4px solid black',
              // This would make the left 800px somehow get shifted inside the box. Weird.
              // overflow: 'hidden',
              width: '100px',
              position: 'relative',
              height: '100px'
            }
          },
          components: [
            
          ],

          onExecute: function () {
            console.log('Executing');
          },
          onEscape: function () {
            console.log('Escaping');
          },
          onOpenMenu: function (container, menu) {
            var w = Width.get(container.element());
            Css.set(menu.element(), 'left', '0px');
            console.log('width', w);

            Width.set(menu.element(), w);
          },
          onOpenSubmenu: function (container, item, submenu) {
            var w = Width.get(container.element());
            var menu = SelectorFind.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
            var menuLeft = '-' + w + 'px';
            console.log('menuLeft', menuLeft, 'width', w);
            Css.set(menu, 'left', menuLeft);
            
            Css.set(submenu.element(), 'left', w + 'px');
            Css.reflow(submenu.element());
            Css.set(submenu.element(), 'left', '0px');
          },

          onCollapseMenu: function (container, item, menu) {
            var w = Width.get(container.element());
            var submenu = SelectorFind.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');

            Css.set(menu.element(), 'left', '0px');
            Css.set(submenu, 'left', w + 'px');
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
              ]),

              'tertiary': makeMenu('secondary', [
                makeItem('university', 'University')
              ])
            },
            {
              'beta': 'secondary',
              'alpha': 'tertiary'
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
