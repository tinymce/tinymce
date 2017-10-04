define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Throttler',
    'global!setTimeout',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Behaviour, Toggling, Memento, Button, Container, Throttler, setTimeout, Styles, UiDomFactory) {
    var sketch = function (onView, translate) {

      var memIcon = Memento.record(
        Container.sketch({
          dom: UiDomFactory.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
          containerBehaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: Styles.resolve('mask-tap-icon-selected'),
              toggleOnExecute: false
            })
          ])
        })
      );

      var onViewThrottle = Throttler.first(onView, 200);

      return Container.sketch({
        dom: UiDomFactory.dom('<div class="${prefix}-disabled-mask"></div>'),
        components: [
          Container.sketch({
            dom: UiDomFactory.dom('<div class="${prefix}-content-container"></div>'),
            components: [
              Button.sketch({
                dom: UiDomFactory.dom('<div class="${prefix}-content-tap-section"></div>'),
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
