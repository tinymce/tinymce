define(
  'tinymce.themes.mobile.ui.Dropup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Behaviour, Sliding, GuiFactory, Container, Fun, Styles) {
    var build = function (refresh, scrollIntoView) {
      console.log('scrollIntoView', scrollIntoView);
      var dropup = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            classes: Styles.resolve('dropup'),
            styles: {
              background: 'blue',
              display: 'flex',
              'width': '100%',
              'overflow': 'hidden'
            }
          },
          components: [
            Container.sketch({
              dom: {
                innerHtml: 'Dropup',
                styles: {
                  'padding': '50px'
                }
              }
            })
          ],
          containerBehaviours: Behaviour.derive([
            Sliding.config({
              closedClass: 'dropup-closed',
              openClass: 'dropup-open',
              shrinkingClass: 'dropup-shrinking',
              growingClass: 'dropup-growing',
              dimension: {
                property: 'height'
              },

              onShrunk: function () {
                console.log('onShrunk');
                debugger;
                refresh();
                scrollIntoView();
              },
              onGrown: function () {
                console.log('onGrown');
                debugger;
                refresh();
                scrollIntoView();
              }
            })
          ])
        })
      );

      var appear = function () {
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
