define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Button, Container, Styles) {
    var sketch = function (onTap, translate) {

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
                  classes: [ Styles.resolve('content-tap-section') ]
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
                      // FIX: i18n
                      innerHtml: translate('Tap to Edit')
                    }
                  })
                ]
              }),

              Container.sketch({
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('disclosure') ],
                  // FIX: i18n
                  innerHtml: 'Powered by TinyMCE'
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
