define(
  'tinymce.themes.mobile.ui.Dropup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'tinymce.themes.mobile.channels.Receivers',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.StylesMenu'
  ],

  function (Behaviour, Replacing, Sliding, GuiFactory, Memento, Container, Fun, Receivers, Styles, StylesMenu) {
    var build = function (refresh, scrollIntoView) {
      var dropup = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            classes: Styles.resolve('dropup'),
            styles: {
              // background: 'blue',
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
              disappear();
            })
          ])
        })
      );

      var appear = function (menu) {
        Replacing.set(dropup, [ menu ]);
        Sliding.grow(dropup);
      };

      var disappear = function () {
        Sliding.shrink(dropup);
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
