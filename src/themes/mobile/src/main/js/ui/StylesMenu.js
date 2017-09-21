define(
  'tinymce.themes.mobile.ui.StylesMenu',

  [
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Transitioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Width',
    'tinymce.themes.mobile.channels.Receivers',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.scroll.Scrollable'
  ],

  function (
    AddEventsBehaviour, Behaviour, Representing, Toggling, Transitioning, GuiFactory, Memento,
    AlloyEvents, Button, Menu, TieredMenu, Objects, Arr, Merger, Obj, Css, SelectorFind,
    Width, Receivers, Styles, Scrollable
  ) {

    var getValue = function (item) {
      return Objects.readOptFrom(item, 'format').getOr(item.title);
    };

    var convert = function (formats, memMenuThunk) {
      var mainMenu = makeMenu('Styles', [
      ].concat(
        Arr.map(formats.items, function (k) {
          return makeItem(getValue(k), k.title, k.isSelected(), k.getPreview(), Objects.hasKey(formats.expansions, getValue(k)));
        })
      ), memMenuThunk, false);

      var submenus = Obj.map(formats.menus, function (menuItems, menuName) {
        var items = Arr.map(menuItems, function (item) {
          return makeItem(
            getValue(item),
            item.title,
            item.isSelected !== undefined ? item.isSelected() : false,
            item.getPreview !== undefined ? item.getPreview() : '',
            Objects.hasKey(formats.expansions, getValue(item))
          );
        });
        return makeMenu(menuName, items, memMenuThunk, true);
      });

      var menus = Merger.deepMerge(submenus, Objects.wrap('styles', mainMenu));


      var tmenu = TieredMenu.tieredData('styles', menus, formats.expansions);

      return {
        tmenu: tmenu
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
          classes: isMenu ? [ Styles.resolve('styles-item-is-menu') ] : [ ]
        },
        toggling: {
          toggleOnExecute: false,
          toggleClass: Styles.resolve('format-matches'),
          selected: selected
        },
        itemBehaviours: Behaviour.derive(isMenu ? [ ] : [
          Receivers.format(value, function (comp, status) {
            var toggle = status ? Toggling.on : Toggling.off;
            toggle(comp);
          })
        ]),
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

    var makeMenu = function (value, items, memMenuThunk, collapsable) {
      return {
        value: value,
        dom: {
          tag: 'div'
        },
        components: [
          Button.sketch({
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('styles-collapser') ]
            },
            components: collapsable ? [
              {
                dom: {
                  tag: 'span',
                  classes: [ Styles.resolve('styles-collapse-icon') ]
                }
              },
              GuiFactory.text(value)
            ] : [ GuiFactory.text(value) ],
            action: function (item) {
              if (collapsable) {
                var comp = memMenuThunk().get(item);
                TieredMenu.collapseMenu(comp);
              }
            }
          }),
          {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('styles-menu-items-container') ]
            },
            components: [
              Menu.parts().items({ })
            ],

            behaviours: Behaviour.derive([
              AddEventsBehaviour.config('adhoc-scrollable-menu', [
                AlloyEvents.runOnAttached(function (component, simulatedEvent) {
                  Css.set(component.element(), 'overflow-y', 'auto');
                  Css.set(component.element(), '-webkit-overflow-scrolling', 'touch');
                  Scrollable.register(component.element());
                }),

                AlloyEvents.runOnDetached(function (component) {
                  Css.remove(component.element(), 'overflow-y');
                  Css.remove(component.element(), '-webkit-overflow-scrolling');
                  Scrollable.deregister(component.element());
                })
              ])
            ])
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
          })
        ])
      };
    };

    var sketch = function (settings) {
      var dataset = convert(settings.formats, function () {
        return memMenu;
      });
      // Turn settings into a tiered menu data.

      var memMenu = Memento.record(TieredMenu.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('styles-menu') ]
        },
        components: [ ],

        // Focus causes issues when the things being focused are offscreen.
        fakeFocus: true,
        // For animations, need things to stay around in the DOM (at least until animation is done)
        stayInDom: true,

        onExecute: function (tmenu, item) {
          var v = Representing.getValue(item);
          settings.handle(item, v.value);
        },
        onEscape: function () {
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
          backgroundMenu: Styles.resolve('styles-background-menu'),
          menu: Styles.resolve('styles-menu'),
          selectedMenu: Styles.resolve('styles-selected-menu'),
          item: Styles.resolve('styles-item'),
          selectedItem: Styles.resolve('styles-selected-item')
        }
      }));

      return memMenu.asSpec();
    };

    return {
      sketch: sketch
    };
  }
);
