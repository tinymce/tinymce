define(
  'tinymce.themes.mobile.ui.StylesMenu',

  [
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Transitioning',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Width',
    'tinymce.themes.mobile.ios.scroll.Scrollables',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.scroll.Scrollable'
  ],

  function (
    AddEventsBehaviour, Behaviour, Representing, Toggling, Transitioning, AlloyEvents, SystemEvents, Menu, TieredMenu, Objects, Arr, Merger, Obj, Css, SelectorFind,
    Width, Scrollables, Styles, Scrollable
  ) {
    // var defaultData = TieredMenu.tieredData(
    //   'styles',
    //   {
    //     'styles': makeMenu('Styles', [
    //       makeItem('headers', 'Headers'),
    //       makeItem('inline', 'Inline'),
    //       makeItem('blocks', 'Blocks'),
    //       makeItem('alignment', 'Alignment')
    //     ]),

    //     'headers': makeMenu('Headers', [
    //       makeBack('< Back'),
    //       makeItem('h1', 'Header 1'),
    //       makeItem('h2', 'Header 2'),
    //       makeItem('h3', 'Header 3')
    //     ]),

    //     'inline': makeMenu('Inline', [
    //       makeBack('< Back'),
    //       makeItem('bold', 'Bold'),
    //       makeItem('italic', 'Italic')
    //     ]),

    //     'blocks': makeMenu('Blocks', [
    //       makeBack('< Back'),
    //       makeItem('p', 'Paragraph'),
    //       makeItem('blockquote', 'Blockquote'),
    //       makeItem('div', 'Div')
    //     ]),

    //     'alignment': makeMenu('Alignment', [
    //       makeBack('< Back'),
    //       makeItem('alignleft', 'Left')
    //     ])
    //   },
    //   {
    //     'headers': 'headers',
    //     'inline': 'inline',
    //     'blocks': 'blocks',
    //     'alignment': 'alignment'
    //   }
    // );

    var getValue = function (item) {
      return Objects.readOptFrom(item, 'format').getOr(item.title);
    };

    var convert = function (formats) {
      var mainMenu = makeMenu('styles', Arr.map(formats.items, function (k) {
        return makeItem(getValue(k), k.title, k.isSelected(), k.getPreview(), k.menu === true);
      }));

      var submenus = Obj.map(formats.menus, function (menuItems, menuName) {
        var previousMenu = menuItems.length > 0 ? menuItems[0].previousMenu : 'styles';
        console.log('previousMenu of ', menuName, previousMenu);
        var retreat = makeBack('Back to ' + previousMenu);
        var items = Arr.map(menuItems, function (item) {
          return makeItem(
            getValue(item),
            item.title,
            item.isSelected !== undefined ? item.isSelected() : false,
            item.getPreview !== undefined ? item.getPreview() : '',
            item.menu === true
          );
        });
        return makeMenu(menuName, [ retreat ].concat(items));
      });

      var menus = Merger.deepMerge(submenus, Objects.wrap('styles', mainMenu));


      var tmenu = TieredMenu.tieredData('styles', menus, formats.expansions);

      return {
        tmenu: tmenu
      };
    };

    var makeBack = function (text) {
      return {
        data: TieredMenu.collapseItem(text),
        type: 'item',
        dom: {
          tag: 'div',
          classes: [ 'collapser' ],
          innerHtml: text
        },
        components: [ ]
      };
    };

    var makeItem = function (value, text, selected, preview, isMenu) {
      return {
        data: {
          value: value,
          text: text
        },
        type: 'item',
        dom: {
          tag: 'div',
          classes: isMenu ? [ 'item-is-menu' ] : [ ]
        },
        toggling: {
          toggleOnExecute: false,
          toggleClass: Styles.resolve('format-matches'),
          selected: selected
        },
        components: [
          {
            dom: {
              tag: 'div',
              attributes: {
                style: preview
              },
              innerHtml: text
            }
          }
        ]
      };
    };

    var makeSeparator = function (text) {
      return {
        type: 'separator',
        dom: {
          tag: 'div',
          classes: [ 'separator' ]
        },
        components: [
          {
            dom: {
              tag: 'strong',
              innerHtml: text
            }
          }
        ]
      };
    };

    var makeMenu = function (value, items) {
      return {
        value: value,
        dom: {
          tag: 'div'
        },
        components: [
          Objects.exclude(makeSeparator(value), [ 'type' ]),
          {
            dom: {
              tag: 'div',
              classes: [ 'menu-items-container' ]
            },
            components: [
              Menu.parts().items({ })
            ]
          }
        ],
        items: items,
        menuBehaviours: Behaviour.derive([
          Transitioning.config({
            initialState: 'after',
            routes: Transitioning.createTristate('before', 'current', 'after', {
              transition: {
                property: 'transform',
                transitionClass: 'transitioning'
              }
            })
          }),

          AddEventsBehaviour.config('adhoc-scrollable-toolbar', [
            AlloyEvents.runOnAttached(function (component, simulatedEvent) {
              Css.set(component.element(), 'overflow-y', 'auto');
              Scrollable.register(component.element());
            }),

            AlloyEvents.runOnDetached(function (component) {
              Css.remove(component.element(), 'overflow-y');
              Scrollable.deregister(component.element());
            })
          ])
        ]),

        eventOrder: Objects.wrap(
          SystemEvents.attachedToDom(),
          [ 'adhoc-scrollable-toolbar', Transitioning.name() ]
        )
      };
    };

    var sketch = function (settings) {
      var dataset = convert(settings.formats);
      // Turn settings into a tiered menu data.

      return TieredMenu.sketch({
        dom: {
          tag: 'div',
          classes: [ 'demo-tiered-menu' ]
        },
        components: [
          
        ],

        // Focus causes issues when the things being focused are offscreen.
        fakeFocus: true,
        // For animations, need things to stay around in the DOM (at least until animation is done)
        stayInDom: true,

        onExecute: function (tmenu, item) {
          var v = Representing.getValue(item);
          settings.handle(v.value);
        },
        onEscape: function () {
          console.log('Escaping');
        },
        onOpenMenu: function (container, menu) {
          var w = Width.get(container.element());
          Width.set(menu.element(), w);
          Transitioning.jumpTo(menu, 'current');
        },
        onOpenSubmenu: function (container, item, submenu) {
          var w = Width.get(container.element());
          var menu = SelectorFind.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
          var menuComp = container.getSystem().getByDom(menu).getOrDie();

          Width.set(submenu.element(), w);

          Transitioning.progressTo(menuComp, 'before');
          Transitioning.jumpTo(submenu, 'after');
          Transitioning.progressTo(submenu, 'current');
        },

        onCollapseMenu: function (container, item, menu) {
          var submenu = SelectorFind.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
          var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
          Transitioning.progressTo(submenuComp, 'after');
          Transitioning.progressTo(menu, 'current');
        },

        navigateOnHover: false,

        openImmediately: true,
        data: dataset.tmenu,

        markers: {
          backgroundMenu: 'background-menu',
          menu: 'menu',
          selectedMenu: 'selected-menu',
          item: 'item',
          selectedItem: 'selected-item'
        }
      });
    };

    return {
      sketch: sketch
    };
  }
);
