define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.sugar.api.properties.Attr',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.TapToEditButton'
  ],

  function (AdhocBehaviour, Behaviour, Memento, AlloyEvents, Container, Attr, Styles, TapToEditButton) {
    var sketch = function (onView, onEdit, translate) {
      
      var memIcon = Memento.record(
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
            AdhocBehaviour.events('conn', AlloyEvents.derive([
              AlloyEvents.runOnAttached(function (c, s) {
                Attr.remove(c.element(), 'data-mode');
              })
            ]))
          ]
        })
      );

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
                  memIcon.asSpec()
                ],
                memIcon: memIcon,
                onView: onView,
                onEdit: onEdit
              })
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
