define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.properties.Attr',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.TapToEditButton'
  ],

  function (EventRoot, AdhocBehaviour, Behaviour, SystemEvents, Container, EventHandler, Objects, Attr, Styles, TapToEditButton) {
    var sketch = function (onView, onEdit, translate) {

      return Container.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('disabled-mask') ]
        },
        components: [
          Container.sketch({
            dom: {
              classes: [ Styles.resolve('content-container') ]
            },
            components: [
              TapToEditButton.sketch({
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('content-tap-section') ]
                },
                components: [
                  Container.sketch({
                    dom: {
                      attributes: {
                        'aria-hidden': 'true'
                      },
                      classes: [ Styles.resolve('mask-tap-icon') ]
                    },
                    containerBehaviours: Behaviour.derive([
                      AdhocBehaviour.config('conn')
                    ]),
                    customBehaviours: [
                      AdhocBehaviour.events('conn', Objects.wrapAll([
                        {
                          key: SystemEvents.attachedToDom(),
                          value :EventHandler.nu({
                            run: function (c, s) {
                              if (EventRoot.isSource(c, s)) {
                                Attr.remove(c.element(), 'data-mode');
                              }
                            }
                          })
                        }
                      ]))
                    ]
                  }),
                  // Container.sketch({
                  //   dom: {
                  //     // FIX: i18n
                  //     styles: {
                  //       'width': '60%',
                  //       'text-align': 'center'
                  //     },
                  //     innerHtml: translate('Tap to Edit')
                  //   }
                  // })
                ],
                onView: onView,
                onEdit: onEdit
              })

              // Container.sketch({
              //   dom: {
              //     tag: 'div',
              //     classes: [ Styles.resolve('disclosure') ],
              //     // FIX: i18n
              //     innerHtml: 'Powered by TinyMCE'
              //   }
              // })
            ]
          })
        ]
        // action: onTap
      });
    };

    return {
      sketch: sketch
    };
  }
);
