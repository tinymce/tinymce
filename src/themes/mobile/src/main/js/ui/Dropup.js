define(
  'tinymce.themes.mobile.ui.Dropup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'tinymce.themes.mobile.channels.Receivers',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Behaviour, Replacing, Sliding, GuiFactory, Container, Fun, Receivers, Styles) {
    var build = function (refresh, scrollIntoView) {
      var dropup = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            classes: Styles.resolve('dropup'),
            styles: {
              display: 'flex',
              'width': '100%',
              'overflow': 'hidden'
            }
          },
          components: [
            
          ],
          containerBehaviours: Behaviour.derive([
            Replacing.config({ }),
            Sliding.config({
              closedClass: 'dropup-closed',
              openClass: 'dropup-open',
              shrinkingClass: 'dropup-shrinking',
              growingClass: 'dropup-growing',
              dimension: {
                property: 'height'
              },
              onShrunk: function (component) {
                refresh();
                scrollIntoView();

                Replacing.set(component, [ ]);
              },
              onGrown: function (component) {
                refresh();
                scrollIntoView();
              }
            }),
            Receivers.orientation(function (component, data) {
              disappear(Fun.noop, {});
            })
          ])
        })
      );

      var appear = function (menu, update, component) {
        if (Sliding.hasShrunk(dropup) === true && Sliding.isTransitioning(dropup) === false) {
          window.requestAnimationFrame(function () {
            update(component);
            Replacing.set(dropup, [ menu() ]);
            Sliding.grow(dropup);
          });
        }
      };

      var disappear = function (update, component) {
        window.requestAnimationFrame(function () {
          update(component);
          Sliding.shrink(dropup);
        });
      };

      return {
        appear: appear,
        disappear: disappear,
        component: Fun.constant(dropup),
        element: dropup.element
      };
    };

    return {
      build: build
    };
  }
);
