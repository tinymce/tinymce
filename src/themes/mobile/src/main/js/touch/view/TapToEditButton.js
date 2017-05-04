define(
  'tinymce.themes.mobile.touch.view.TapToEditButton',

  [
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Singleton',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (AdhocBehaviour, Behaviour, Coupling, AlloyEvents, InlineView, Menu, TouchMenu, Future, Singleton, Attr, Class, SelectorFind) {
    var sketch = function (spec) {
      var state = Singleton.value();

      var gotoView = function (comp) {
        if (state.isSet()) spec.onView();
        state.clear();
      };

      var gotoEdit = function (comp) {
        if (state.isSet()) spec.onEdit();
        state.clear();
      };

      return TouchMenu.sketch({
        dom: spec.dom,
        components: [
          TouchMenu.parts().sink()
        ].concat(spec.components),
        // lazySink: function () {
        //   return Result.value(sink)
        // },
        fetch: function () {
          return Future.pure([
            { type: 'item', data: { value: 'Edit', text: 'Edit' } }
          ]);
        },
        onExecute: function (comp, menuComp, item, data) {
          SelectorFind.descendant(comp.element(), '.tinymce-mobile-mask-tap-icon').each(function (icon) {
            Attr.set(icon, 'data-mode', data.value);
            state.set(data.value);
          });
          // if (data.value === 'view') spec.onView();
          // else if (data.value === 'edit') spec.onEdit();
        },

        onHoverOn: function (comp) {
          Class.add(comp.element(), 'hovered');
          SelectorFind.descendant(comp.element(), '.tinymce-mobile-mask-tap-icon').each(function (icon) {
            Attr.set(icon, 'data-mode', 'View');
            state.set('View');
          });
        },
        onHoverOff: function (comp) {
          Class.remove(comp.element(), 'hovered');
          SelectorFind.descendant(comp.element(), '.tinymce-mobile-mask-tap-icon').each(function (icon) {
            Attr.remove(icon, 'data-mode');
            state.clear();
          });
        },

        onTap: function () {
          setTimeout(function () {
            gotoView();
          }, 300);
        },

        toggleClass: 'selected',

        transition: {
          property: 'transform',
          transitionClass: 'longpress-menu-transitioning'
        },

        onClosed: function (comp) {
          state.on(function (s) {
            if (s === 'Edit') gotoEdit(comp);
            else if (s === 'View') gotoView(comp);
          })
        },

        customBehaviours: [
          AdhocBehaviour.events('initial-state', AlloyEvents.derive([
            AlloyEvents.runOnAttached(function (comp, se) {
              state.clear();
            }),
            AlloyEvents.runOnDetached(function (comp, se) {
              // Use an api
              var sandbox = Coupling.getCoupled(comp, 'sandbox');
              InlineView.hide(sandbox);
            })
          ]))
        ],

        touchmenuBehaviours: Behaviour.derive([
          AdhocBehaviour.config('initial-state')
        ]),

        parts: {
          sink: {
            dom: {
              classes: [ 'tap-button-sink' ]
            }
          },
          view: {
            dom: {
              tag: 'div',
              classes: [ 'tap-button-view' ]
            }
          },
          menu: {
            dom: {
              tag: 'div',
              // styles: { display: 'flex' }
            },
            components: [
              Menu.parts().items()
            ],
            value: 'touch-menu-1',
            markers: {
              item: 'alloy-orb',
              selectedItem: 'alloy-selected-orb'
            },
            members: {
              item: { 
                munge: function (itemSpec) {
                  return {
                    dom: {
                      tag: 'div',
                      attributes: {
                        'data-value': itemSpec.data.value
                      },
                      styles: {
                        display: 'flex',
                        'justify-content': 'center'
                      },
                      classes: [ 'alloy-orb' ]
                    },
                    components: [
                      {
                        dom: {
                          tag: 'span',
                          innerHtml: itemSpec.data.text
                        }
                      }
                    ]
                  };              
                }
              }
            }
          }

        }
      });
    };

    return {
      sketch: sketch
    };
  }
);
