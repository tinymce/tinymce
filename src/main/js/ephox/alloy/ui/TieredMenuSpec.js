define(
  'ephox.alloy.ui.TieredMenuSpec',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.layered.LayeredState',
    'ephox.alloy.menu.logic.HotspotViews',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (ComponentStructure, EditableFields, EventRoot, SystemEvents, Highlighting, Keying, Replacing, Representing, Sandboxing, EventHandler, Fields, LayeredState, HotspotViews, ItemEvents, MenuEvents, SpecSchema, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Fun, Option, Options, Body, Class, Classes, Insert, Remove, SelectorFilter) {
    var schema = [
      FieldSchema.strict('onExecute'),
      FieldSchema.strict('onEscape'),

      // FieldSchema.strict('onOpenMenu'),
      FieldSchema.strict('onOpenSubmenu'),

      FieldSchema.strictObjOf('data', [
        FieldSchema.strict('primary'),
        FieldSchema.strict('menus'),
        FieldSchema.strict('expansions')
      ]),

    
      FieldSchema.defaulted('fakeFocus', false),
      Fields.tieredMenuMarkers(),
      Fields.members([ 'menu', 'item' ])
    ];
    
    return function (rawUiSpec) {
      var uiSpec = SpecSchema.asStructOrDie('TieredMenu', schema, rawUiSpec, [ ]);

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
              // fakeFocus: uiSpec.fakeFocus(),
              // onHighlight: uiSpec.onHighlight(),


              // focusManager: uiSpec.fakeFocus() ? focusManager : undefined
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
          return primary.container;
        });
      };

      var getItemValue = function (item) {
        // FIX: itemData.value
        return Representing.getValue(item).value;
      };

      var toMenuValues = function (container, sMenus) {
        return Obj.map(sMenus, function (menuTuple) {
          var menuItems = SelectorFilter.descendants(menuTuple.menu.element(), '.' + uiSpec.markers().item());
          return Arr.bind(menuItems, function (mi) {
            return container.getSystem().getByDom(mi).map(getItemValue).fold(Fun.constant([ ]), Arr.pure);
          });
        });
      };

      var addToWorld = function (container, componentMap) {
        var menuCs = Arr.map(
          Obj.values(componentMap),
          function (tuple) {
            return tuple;
          }
        );
        Arr.each(menuCs, container.getSystem().addToWorld);
      };

      var setActiveMenu = function (container, tuple) {
        var menu = tuple.menu;
        Highlighting.highlight(container, menu);
        Highlighting.getHighlighted(menu).orThunk(function () {
          return Highlighting.getFirst(menu);
        }).each(function (item) {
          container.getSystem().triggerEvent(SystemEvents.focusItem(), item.element(), { });
        });
      };

      // Not sure what to do about this one.
      var clear = function (container, state) {
        var tuples = state.getMenus();
        Obj.each(tuples, function (tuple, menuName) {
          container.getSystem().removeFromWorld(tuple.container);
        });
        state.clear();
      };

      var isPartOf = function (container, state, queryElem) {
        var menus = Obj.values(state.getMenus());
        return Arr.exists(menus, function (menu) {
          return ComponentStructure.isPartOf(menu, queryElem);
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
            Class.add(r.menu.element(), uiSpec.markers().backgroundMenu());
          });
          if (! Body.inBody(activeMenu.container.element())) {
            Insert.append(container.element(), newMenuCompTuple.container.element());
          }
          setActiveMenu(container, newMenuCompTuple);
          var others = getMenus(state, state.otherMenus(path));
          Arr.each(others, function (o) {
            // May not need to do the active menu thing.
            Classes.remove(o.menu.element(), [ uiSpec.backgroundClass() ]);
            Remove.remove(o.container.element());
          });

          return true;
        });
      };

      var expandRight = function (sandbox, item) {
        var value = getItemValue(item);
        return Sandboxing.getState(sandbox).bind(function (state) {
          return state.expand(value).bind(function (path) {
            // When expanding, always select the first.
            Option.from(path[0]).bind(state.lookupMenu).each(function (newMenuCompTuple) {
              Highlighting.highlightFirst(newMenuCompTuple.menu);

              // DUPE with above. Fix later.
              if (! Body.inBody(newMenuCompTuple.container.element())) {
                Insert.append(sandbox.element(), newMenuCompTuple.container.element());
                uiSpec.onOpenSubmenu()(sandbox, item, newMenuCompTuple);
              }
            });

            return updateMenuPath(sandbox, state, path);
          });
        });
      };

      var collapseLeft = function (sandbox, item) {
        var value = getItemValue(item);
        return Sandboxing.getState(sandbox).bind(function (state) {
          return state.collapse(value).bind(function (path) {
            return updateMenuPath(sandbox, state, path);
          });
        });
      };

      var updateView = function (sandbox, item) {
        var value = getItemValue(item);
        return Sandboxing.getState(sandbox).bind(function (state) {
          return state.refresh(value).bind(function (path) {
            return updateMenuPath(sandbox, state, path);
          });
        });
      };

      var onRight = function (sandbox, triggerItem) {
        return sandbox.getSystem().getByDom(triggerItem).bind(function (item) {
          return EditableFields.inside(triggerItem) ? Option.none() : expandRight(sandbox, item);
        });
      };

      var onLeft = function (sandbox, target) {
        return sandbox.getSystem().getByDom(target).bind(function (item) {
          // Exclude inputs, textareas etc.
          return EditableFields.inside(target) ? Option.none() : collapseLeft(sandbox, item);
        });
      };

      var onEscape = function (sandbox, target) {
        return sandbox.getSystem().getByDom(target).bind(function (item) {
          return collapseLeft(sandbox, item).orThunk(function () {
            return uiSpec.onEscape()(sandbox, item);
          // This should only fire when the user presses ESC ... not any other close.
            // return HotspotViews.onEscape(uiSpec.lazyAnchor()(), sandbox);
          });
        });
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
                  Replacing.replace(container, [ { built: primary } ]);
                });
              }
            }
          })
        }
      ]);

      var focusManager = {
        set: function (sandbox, element) {
          sandbox.getSystem().getByDom(element).fold(Fun.noop, function (item) {
            Highlighting.getHighlighted(sandbox).each(function (menu) {
              Highlighting.highlight(menu, item);
            });
          });          
        },
        get: function (sandbox) {
          return Highlighting.getHighlighted(sandbox).bind(function (menu) {
            return Highlighting.getHighlighted(menu).map(function (item) {
              return item.element();
            });
          });
        }
      };

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
            onRight: onRight,
            onLeft: onLeft,
            onEscape: onEscape
            // focusManager: uiSpec.fakeFocus() ? focusManager : undefined
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
  }
);