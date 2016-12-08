define(
  'ephox.alloy.ui.TieredMenuSpec',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.focus.FocusManagers',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.layered.LayeredState',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.SelectorFind'
  ],

  function (EditableFields, EventRoot, SystemEvents, Highlighting, Replacing, Representing, Sandboxing, FocusManagers, EventHandler, Fields, LayeredState, ItemEvents, MenuEvents, SpecSchema, FieldSchema, Objects, Arr, Obj, Merger, Fun, Option, Options, Body, Class, Classes, SelectorFind) {
    var make = function (uiSpec, rawUiSpec) {
      var buildMenus = function (container, menus) {
        return Obj.map(menus, function (spec, name) {
          // NOTE: We use rawUiSpec here so the nesting isn't a struct

          // return Munge(
          //   uiSpec.members().menu(),
          //   uiSpec,
          //   {
          //     value: name,
          //     items: spec.items
          //   }

          var data = Merger.deepMerge(
            uiSpec.members().menu().munge(spec),
            {
              uiType: 'menu',
              value: name,
              items: spec.items,
              markers: rawUiSpec.markers,
              members: {
                item: uiSpec.members().item()
              },

              // Fake focus.
              fakeFocus: uiSpec.fakeFocus(),
              onHighlight: uiSpec.onHighlight(),


              focusManager: uiSpec.fakeFocus() ? FocusManagers.highlights() : FocusManagers.dom()
            }
          );
          return container.getSystem().build(data);
        });
      };

      var state = LayeredState();

      var setup = function (container) {
        var componentMap = buildMenus(container, uiSpec.data().menus());
         addToWorld(container, componentMap);

        
        
        state.setContents(uiSpec.data().primary(), componentMap, uiSpec.data().expansions(), function (sMenus) {
          return toMenuValues(container, sMenus);
        });

        return state.getPrimary().map(function (primary) {
          return primary;
        });
      };

      var getItemValue = function (item) {
        // FIX: itemData.value
        return Representing.getValue(item).value;
      };

      var toMenuValues = function (container, sMenus) {
        return Obj.map(uiSpec.data().menus(), function (data, menuName) {
          return Arr.bind(data.items, function (item) {
            return item.type === 'separator' ? [ ] : [ item.data.value ];
          });
        });
      };

      var addToWorld = function (container, componentMap) {
        Arr.each(componentMap, container.getSystem().addToWorld);
      };

      var setActiveMenu = function (container, menu) {
        Highlighting.highlight(container, menu);
        Highlighting.getHighlighted(menu).orThunk(function () {
          return Highlighting.getFirst(menu);
        }).each(function (item) {
          container.getSystem().triggerEvent(SystemEvents.focusItem(), item.element(), { });
        });
      };

      var getMenus = function (state, menuValues) {
        return Options.cat(
          Arr.map(menuValues, state.lookupMenu)
        );
      };

      var updateMenuPath = function (container, state, path) {
        return Option.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
          var rest = getMenus(state, path.slice(1));
          Arr.each(rest, function (r) {
            Class.add(r.element(), uiSpec.markers().backgroundMenu());
          });

          if (! Body.inBody(activeMenu.element())) {
            Replacing.append(container, { built: activeMenu });
          }
          setActiveMenu(container, activeMenu);
          var others = getMenus(state, state.otherMenus(path));
          Arr.each(others, function (o) {
            // May not need to do the active menu thing.
            Classes.remove(o.element(), [ uiSpec.markers().backgroundMenu() ]);
            Replacing.remove(container, o);
          });

          return true;
        });
      };

      var expandRight = function (container, item) {
        var value = getItemValue(item);
        return state.expand(value).bind(function (path) {
          // When expanding, always select the first.
          Option.from(path[0]).bind(state.lookupMenu).each(function (activeMenu) {
            // DUPE with above. Fix later.
            if (! Body.inBody(activeMenu.element())) {
              Replacing.append(container, { built: activeMenu });
              uiSpec.onOpenSubmenu()(container, item, activeMenu);
            }

            Highlighting.highlightFirst(activeMenu);


          });

          return updateMenuPath(container, state, path);
        });
      };

      var collapseLeft = function (container, item) {
        var value = getItemValue(item);
        return state.collapse(value).bind(function (path) {
          return updateMenuPath(container, state, path);
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
          return uiSpec.onEscape()(container, item);
        // This should only fire when the user presses ESC ... not any other close.
          // return HotspotViews.onEscape(uiSpec.lazyAnchor()(), container);
        });
      };

      var keyOnItem = function (f) {
        return function (container, simulatedEvent) {
          return SelectorFind.closest(simulatedEvent.getSource(), '.' + uiSpec.markers().item()).bind(function (target) {
            return container.getSystem().getByDom(target).bind(function (item) {
              return f(container, item);
            });
          });
        };
      };

      var events = Objects.wrapAll([
        {
          key: MenuEvents.focus(),
          value: EventHandler.nu({
            // Set "active-menu" for the menu with focus
            run: function (sandbox, simulatedEvent) {
              var menu = simulatedEvent.event().menu();
              Highlighting.highlight(sandbox, menu);
            }
          })
        },
        {
          key: ItemEvents.hover(),
          value: EventHandler.nu({
            // Hide any irrelevant submenus and expand any submenus based 
            // on hovered item
            run: function (sandbox, simulatedEvent) {
              var item = simulatedEvent.event().item();
              updateView(sandbox, item);
              expandRight(sandbox, item);
            }
          })
        },
        {
          key: SystemEvents.execute(),
          value: EventHandler.nu({
            run: function (sandbox, simulatedEvent) {
              // Trigger on execute on the targeted element
              // I.e. clicking on menu item
              var target = simulatedEvent.event().target();
              return sandbox.getSystem().getByDom(target).bind(function (item) {
                return expandRight(sandbox, item).orThunk(function () {
                  return uiSpec.onExecute()(sandbox, item);
                });
              });
            }
          })
        },
        {
          key: SystemEvents.sandboxClose(),
          value: EventHandler.nu({
            run: function (sandbox, simulatedEvent) {
              if (Sandboxing.isShowing(sandbox)) Sandboxing.closeSandbox(sandbox);
            }
          })
        },
        {
          key: SystemEvents.systemInit(),
          value: EventHandler.nu({
            run: function (container, simulatedEvent) {
              if (EventRoot.isSource(container, simulatedEvent)) {
                setup(container).each(function (primary) {
                  console.log('primary', primary);
                  Replacing.append(container, { built: primary });

                  if (uiSpec.openImmediately()) {
                    setActiveMenu(container, primary);
                    uiSpec.onOpenMenu()(container, primary);
                  }
                });
              }
            }
          })
        }
      ]);

      return {
        uiType: 'custom',
        uid: uiSpec.uid(),
        dom: {
          tag: 'div',
          classes: [ 'main-menu' ]
        },
        behaviours: {
          keying: {
            mode: 'special',
            onRight: keyOnItem(onRight),
            onLeft: keyOnItem(onLeft),
            onEscape: keyOnItem(onEscape),
            focusIn: function (container, keyInfo) {
              state.getPrimary().each(function (primary) {
                container.getSystem().triggerEvent(SystemEvents.focusItem(), primary.element(), { });
              });
            }
          },
          // Highlighting is used for highlighting the active menu
          highlighting: {
            highlightClass: uiSpec.markers().selectedMenu(),
            itemClass: uiSpec.markers().menu()
          },
          replacing: { }
        },
        events: events
      };
    };

    return {
      make: make
    };
  }
);