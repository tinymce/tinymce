define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Button, Container, Styles) {
    var sketch = function (onTap) {

      return Button.sketch({
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
              Container.sketch({
                dom: {
                  attributes: {
                    'aria-hidden': 'true'
                  },
                  classes: [ Styles.resolve('mask-tap-icon') ]
                }
              }),
              Container.sketch({
                dom: {
                  classes: [ Styles.resolve('disclosure') ],
                  // FIX: i18n
                  innerHtml: 'Tap to Edit'
                }
              })
            ]
          })
        ],
        action: onTap
      });
    };

    return {
      sketch: sketch
    };
  }
);
