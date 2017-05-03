define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.alloy.api.ui.Container',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.TapToEditButton'
  ],

  function (Container, Styles, TapToEditButton) {
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
                    }
                  }),
                  Container.sketch({
                    dom: {
                      // FIX: i18n
                      styles: {
                        'width': '60%',
                        'text-align': 'center'
                      },
                      innerHtml: translate('Tap to Edit')
                    }
                  })
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
