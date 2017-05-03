define(
  'ephox.alloy.api.ui.TouchMenu',

  [
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dropdown.DropdownUtils',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.alloy.ui.schema.TouchMenuSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Width',
    'global!document'
  ],

  function (
    AdhocBehaviour, Behaviour, Coupling, Highlighting, Positioning, Representing, Sandboxing, Sliding, Toggling, Unselecting, SystemEvents, InlineView, Menu,
    UiSketcher, EventHandler, DropdownUtils, PartType, Layout, TouchMenuSchema, Objects, Fun, Future, Merger, Option, Result, Focus, Element, Height, Location,
    Width, document
  ) {
    var schema = TouchMenuSchema.schema();
    var partTypes = TouchMenuSchema.parts();

    var make = function (detail, components, spec, externals) {

      var getMenu = function (component) {
        var sandbox = Coupling.getCoupled(component, 'sandbox');
        return Sandboxing.getState(sandbox);
      };

      return Merger.deepMerge(
        {
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,
          behaviours: Merger.deepMerge(
            Behaviour.derive([
              Toggling.config({
                toggleClass: detail.toggleClass(),
                aria: {
                  mode: 'pressed',
                  syncWithExpanded: true
                }
              }),
              Unselecting.config({ }),
              Coupling.config({
                others: {
                  sandbox: function (hotspot) {
                    // var sink = DropdownUtils.getSink(hotspot, detail);
                    // console.log('sink', sink);
                    return InlineView.sketch(
                      Merger.deepMerge(
                        externals.view(),
                        {
                          dom: {
                            tag: 'div'
                          },
                          lazySink: DropdownUtils.getSink(hotspot, detail),
                          inlineBehaviours: Behaviour.derive([
                            AdhocBehaviour.config('execute-for-menu')
                          ]),
                          customBehaviours: [
                            AdhocBehaviour.events('execute-for-menu', Objects.wrapAll([
                              {
                                key: SystemEvents.execute(),
                                value: EventHandler.nu({
                                  run: function (c, s) {
                                    var target = s.event().target();
                                    c.getSystem().getByDom(target).each(function (item) {
                                      detail.onExecute()(hotspot, c, item, Representing.getValue(item));
                                    });
                                  }
                                })
                              }
                            ]))
                          ]
                        }
                      )
                    );
                  }
                }
              })
            ]),
            detail.touchmenuBehaviours()
          ),

          events: {
            'contextmenu': EventHandler.nu({
              run: function (component, simulatedEvent) {
                simulatedEvent.event().kill();
              }
            }),

            'touchstart': EventHandler.nu({
              run: function (comp, se) {
                Toggling.on(comp);
                detail.onHoverOn()(comp);
              }
            }),

            // FIX: SystemEvents.tap()
            'alloy.tap': EventHandler.nu({
              run: function (comp, se) {
                detail.onTap()(comp);
              }
            }),

            'longpress': EventHandler.nu({
              run: function (component, simulatedEvent) {
                detail.fetch()('').get(function (items) {

                  var iMenu = Menu.sketch(
                    Merger.deepMerge(
                      externals.menu(),
                      {
                        items: items
                      }
                    )
                  );

                  var sandbox = Coupling.getCoupled(component, 'sandbox');
                  console.log('simulatedEvent', simulatedEvent.event());
                  var pos = Location.absolute(component.element());
                  var w = Width.get(component.element());
                  var h = Height.get(component.element());
                  InlineView.showAt(sandbox, {
                    anchor: 'makeshift',
                    x: pos.left() + w/2,
                    y: pos.top() + h,
                    layouts: [ Layout.southmiddle, Layout.northmiddle ]
                    // hotspot: component
                  }, iMenu);
                });
              }
            }),

            'touchmove': EventHandler.nu({
              run: function (component, simulatedEvent) {
                var e = simulatedEvent.event().raw().touches[0];
                getMenu(component).each(function (iMenu) {
                  Option.from(document.elementFromPoint(e.clientX, e.clientY)).map(Element.fromDom).filter(function (tgt) {
                    return iMenu.element().dom().contains(tgt.dom());
                  }).fold(function () {



                    console.log('no point');
                    Highlighting.dehighlightAll(iMenu);
                    Focus.active().each(Focus.blur);

                    // Dupe.
                    Option.from(document.elementFromPoint(e.clientX, e.clientY)).map(Element.fromDom).filter(function (tgt) {
                      return component.element().dom().contains(tgt.dom());
                    }).fold(function () {
                      console.log("Hovering off");
                      detail.onHoverOff()(component);
                    }, function () {
                      console.log("hovering on");
                      detail.onHoverOn()(component);
                    });

                  }, function (elem) {
                    component.getSystem().triggerEvent('mouseover', elem, {
                      target: Fun.constant(elem),
                      x: Fun.constant(e.clientX),
                      y: Fun.constant(e.clientY)
                    });
                    detail.onHoverOff()(component);
                  });
                  simulatedEvent.event().kill();
                });
              }
            }),

            'touchend': EventHandler.nu({
              run: function (component, simulatedEvent) {
                var e = simulatedEvent.event().raw().touches[0];
                getMenu(component).each(function (iMenu) {
                  Highlighting.getHighlighted(iMenu).fold(function () {
                    detail.onMiss()(component);
                  }, function (item) {
                    console.log('found item', item.element().dom());
                    component.getSystem().triggerEvent(SystemEvents.execute(), item.element(), {
                      target: Fun.constant(item.element())
                    });
                  });
                });
                Sliding.shrink(Coupling.getCoupled(component, 'sandbox'));
                Toggling.off(component);

              }
            })
          },

          eventOrder: {
            // Order, the button state is toggled first, so assumed !selected means close.
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          }
        },
        {
          dom: {
            attributes: {
              role: detail.role().getOr('button')
            }
          }
        }
      );
    };

    var sketch = function (spec) {
      return UiSketcher.composite(TouchMenuSchema.name(), schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(TouchMenuSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);
