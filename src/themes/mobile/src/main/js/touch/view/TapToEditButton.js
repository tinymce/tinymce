define(
  'tinymce.themes.mobile.touch.view.TapToEditButton',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result'
  ],

  function (Behaviour, Sliding, InlineView, Menu, TouchMenu, Future, Result) {
    var sketch = function (spec) {
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
            { type: 'item', data: { value: 'alpha', text: 'Alpha', 'item-class': 'alpha' } },
            { type: 'item', data: { value: 'beta', text: 'Beta', 'item-class': 'beta' } }
          ]);
        },
        onExecute: function (component, item, data) {
          if (data.value === 'view') spec.onView();
          else if (data.value === 'edit') spec.onEdit();
        },

        onTap: spec.onView,

        toggleClass: 'selected',
        parts: {
          sink: { },
          view: {
            dom: {
              tag: 'div'
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
