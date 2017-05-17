define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Throttler',
    'global!setTimeout',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (AdhocBehaviour, Behaviour, Toggling, Memento, Button, Container, Throttler, setTimeout, Styles) {
    var sketch = function (onView, translate) {
      
      var memIcon = Memento.record(
        Container.sketch({
          dom: {
            attributes: {
              'aria-hidden': 'true'
            },
            classes: [ Styles.resolve('mask-tap-icon') ]
          },
          containerBehaviours: Behaviour.derive([
            AdhocBehaviour.config('conn'),
            Toggling.config({
              toggleClass: Styles.resolve('mask-tap-icon-selected'),
              toggleOnExecute: false
            })
          ])
        })
      );

      var onViewThrottle = Throttler.first(onView, 200);

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
              Button.sketch({
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('content-tap-section') ]
                },
                components: [
                  memIcon.asSpec()
                ],
                action: function (button) {
                  onViewThrottle.throttle();
                },

                buttonBehaviours: Behaviour.derive([
                  Toggling.config({
                    toggleClass: Styles.resolve('mask-tap-icon-selected')
                  })
                ])
              })
            ]
          })
        ]
      });
    };

    return {
      sketch: sketch
    };
  }
);
