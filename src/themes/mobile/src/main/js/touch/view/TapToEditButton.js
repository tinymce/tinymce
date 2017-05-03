define(
  'tinymce.themes.mobile.touch.view.TapToEditButton',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result',
    'ephox.katamari.api.Throttler',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Behaviour, Sliding, InlineView, Menu, TouchMenu, Cell, Future, Result, Throttler, Attr, Class, SelectorFind) {
    var sketch = function (spec) {
      var viewer = Throttler.last(spec.onView, 400);

      var state = Cell('View');

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
          console.log('removing');
          Class.remove(comp.element(), 'hovered');
        },

        onMiss: function (comp) {
          console.log("onMiss");
          SelectorFind.descendant(comp.element(), '.tinymce-mobile-mask-tap-icon').each(function (icon) {
            if (Class.has(comp.element(), 'hovered') === false) Attr.remove(icon, 'data-mode');
            state.set('View');
          });
        },

        onTap: function () {
          setTimeout(function () {
            viewer.throttle();
          }, 300);
        },

        toggleClass: 'selected',
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
            },

            inlineBehaviours: Behaviour.derive([
              Sliding.config({
                closedClass: 'longpress-menu-closed',
                openClass: 'longpress-menu-open',
                shrinkingClass: 'longpress-menu-shrinking',
                growingClass: 'longpress-menu-growing',
                dimension: {
                  property: 'height'
                },

                onShrunk: function (view) {
                  InlineView.hide(view);
                  
                  if (state.get() === 'Edit') spec.onEdit();
                  else spec.onView();
                }
              })
            ]),

            onShow: function (view) {
              Sliding.grow(view)
            },

            onHide: function (view) {
              Sliding.shrink(view);
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
