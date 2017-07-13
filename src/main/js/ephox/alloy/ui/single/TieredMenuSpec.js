define(
  'ephox.alloy.ui.single.TieredMenuSpec',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.focus.FocusManagers',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.menu.layered.LayeredState',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (
    EditableFields, Behaviour, Composing, Highlighting, Keying, Replacing, Representing, GuiFactory, AlloyEvents, AlloyTriggers, SystemEvents, FocusManagers,
    Menu, LayeredState, ItemEvents, MenuEvents, Objects, Arr, Fun, Merger, Obj, Option, Options, Body, Class, Classes, SelectorFind
  ) {
    var make = function (detail, rawUiSpec) {
      var buildMenus = function (container, menus) {
        return Obj.map(menus, function (spec, name) {
          var data = Menu.sketch(
            Merger.deepMerge(
              spec,
              {
                value: name,
                items: spec.items,
                markers: Objects.narrow(rawUiSpec.markers, [ 'item', 'selectedItem' ]),

                // Fake focus.
                fakeFocus: detail.fakeFocus(),
                onHighlight: detail.onHighlight(),


                focusManager: detail.fakeFocus() ? FocusManagers.highlights() : FocusManagers.dom()
              }
            )
          );

          return container.getSystem().build(data);
        });
      };

      var state = LayeredState();

      var setup = function (container) {
        var componentMap = buildMenus(container, detail.data().menus());
        state.setContents(detail.data().primary(), componentMap, detail.data().expansions(), function (sMenus) {
          return toMenuValues(container, sMenus);
        });

        return state.getPrimary();
      };

      var getItemValue = function (item) {
        return Representing.getValue(item).value;
      };

      var toMenuValues = function (container, sMenus) {
        return Obj.map(detail.data().menus(), function (data, menuName) {
          return Arr.bind(data.items, function (item) {
            return item.type === 'separator' ? [ ] : [ item.data.value ];
          });
        });
      };

      var setActiveMenu = function (container, menu) {
        Highlighting.highlight(container, menu);
        Highlighting.getHighlighted(menu).orThunk(function () {
          return Highlighting.getFirst(menu);
        }).each(function (item) {
          AlloyTriggers.dispatch(container, item.element(), SystemEvents.focusItem());
        });
      };

      var getMenus = function (state, menuValues) {
        return Options.cat(
          Arr.map(menuValues, state.lookupMenu)
        );
      };

      var updateMenuPath = function (container, state, path) {
        console.log('updateMenuPath');
        return Option.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
          var rest = getMenus(state, path.slice(1));
          Arr.each(rest, function (r) {
            Class.add(r.element(), detail.markers().backgroundMenu());
          });

          if (! Body.inBody(activeMenu.element())) {
            Replacing.append(container, GuiFactory.premade(activeMenu));
          }

          // Remove the background-menu class from the active menu
          Classes.remove(activeMenu.element(), [ detail.markers().backgroundMenu() ]);
          setActiveMenu(container, activeMenu);
          var others = getMenus(state, state.otherMenus(path));
          Arr.each(others, function (o) {
            // May not need to do the active menu thing.
            Classes.remove(o.element(), [ detail.markers().backgroundMenu() ]);
            Replacing.remove(container, o);
          });

          return activeMenu;
        });
      };

      var expandRight = function (container, item) {
        var value = getItemValue(item);
        return state.expand(value).bind(function (path) {
          // When expanding, always select the first.
          Option.from(path[0]).bind(state.lookupMenu).each(function (activeMenu) {
            // DUPE with above. Fix later.
            if (! Body.inBody(activeMenu.element())) {
              Replacing.append(container, GuiFactory.premade(activeMenu));
              detail.onOpenSubmenu()(container, item, activeMenu);
            }

            Highlighting.highlightFirst(activeMenu);


          });

          return updateMenuPath(container, state, path);
        });
      };

      var collapseLeft = function (container, item) {
        var value = getItemValue(item);
        return state.collapse(value).bind(function (path) {
          return updateMenuPath(container, state, path).map(function (activeMenu) {
            detail.onCollapseMenu()(container, item, activeMenu);
            return activeMenu;
          });
        });
      };

      var updateView = function (container, item) {
        var value = getItemValue(item);
        return state.refresh(value).bind(function (path) {
          return updateMenuPath(container, state, path);
        });
      };

      var onRight = function (container, item) {
        return EditableFields.inside(item.element()) ? Option.none() : expandRight(container, item);
      };

      var onLeft = function (container, item) {
        // Exclude inputs, textareas etc.
        return EditableFields.inside(item.element()) ? Option.none() : collapseLeft(container, item);
      };

      var onEscape = function (container, item) {
        return collapseLeft(container, item).orThunk(function () {
          return detail.onEscape()(container, item);
        // This should only fire when the user presses ESC ... not any other close.
          // return HotspotViews.onEscape(detail.lazyAnchor()(), container);
        });
      };

      var keyOnItem = function (f) {
        return function (container, simulatedEvent) {
          return SelectorFind.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
            return container.getSystem().getByDom(target).bind(function (item) {
              return f(container, item);
            });
          });
        };
      };

      var events = AlloyEvents.derive([
        // Set "active-menu" for the menu with focus
        AlloyEvents.run(MenuEvents.focus(), function (sandbox, simulatedEvent) {
          var menu = simulatedEvent.event().menu();
          Highlighting.highlight(sandbox, menu);
        }),

        
        AlloyEvents.runOnExecute(function (sandbox, simulatedEvent) {
          // Trigger on execute on the targeted element
          // I.e. clicking on menu item
          var target = simulatedEvent.event().target();
          return sandbox.getSystem().getByDom(target).bind(function (item) {
            return expandRight(sandbox, item).orThunk(function () {
              return detail.onExecute()(sandbox, item);
            });
          });
        }),

        // Open the menu as soon as it is added to the DOM
        AlloyEvents.runOnAttached(function (container, simulatedEvent) {
          setup(container).each(function (primary) {
            Replacing.append(container, GuiFactory.premade(primary));

            console.log('before open immediately');
            if (detail.openImmediately()) {
              setActiveMenu(container, primary);
              detail.onOpenMenu()(container, primary);
            }
          });
        })
      ].concat(detail.navigateOnHover() ? [
        // Hide any irrelevant submenus and expand any submenus based
        // on hovered item
        AlloyEvents.run(ItemEvents.hover(), function (sandbox, simulatedEvent) {
          var item = simulatedEvent.event().item();
          updateView(sandbox, item);
          expandRight(sandbox, item);
          detail.onHover()(sandbox, item);
        })
      ] : [ ]));

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        behaviours: Merger.deepMerge(
          Behaviour.derive([
            Keying.config({
              mode: 'special',
              onRight: keyOnItem(onRight),
              onLeft: keyOnItem(onLeft),
              onEscape: keyOnItem(onEscape),
              focusIn: function (container, keyInfo) {
                state.getPrimary().each(function (primary) {
                  AlloyTriggers.dispatch(container, primary.element(), SystemEvents.focusItem());
                });
              }
            }),
            // Highlighting is used for highlighting the active menu
            Highlighting.config({
              highlightClass: detail.markers().selectedMenu(),
              itemClass: detail.markers().menu()
            }),
            Composing.config({
              find: function (container) {
                return Highlighting.getHighlighted(container);
              }
            }),
            Replacing.config({ })
          ]),
          detail.tmenuBehaviours()
        ),
        eventOrder: detail.eventOrder(),
        events: events
      };
    };

    return {
      make: make
    };
  }
);