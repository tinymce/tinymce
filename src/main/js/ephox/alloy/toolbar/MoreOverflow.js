define(
  'ephox.alloy.toolbar.MoreOverflow',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (DomModification, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('initWidth'),
      FieldSchema.state('handler', function () {
        var schema = [ ];

        var doExhibit = function (oInfo, base) {
          return DomModification.nu({ });
        };

        var builder = function (oInfo, groups) {
          return [
            {
              uiType: 'container',
              components: groups.concat([
                {
                  uiType: 'button',
                  text: 'Open/Close',
                  action: function (component) {
                    var slider = component.getSystem().getByUid('more-drawer-slider').getOrDie();
                    if (slider.apis().hasGrown()) slider.apis().shrink();
                    else slider.apis().grow();
                  }
                }
              ]),
              dom: {
                styles: {
                  display: 'flex'
                }
              }
            },
            {
              uiType: 'container',
              uid: 'more-drawer-slider',
              components: [
                {
                  uiType: 'container',
                  dom: {
                    styles: {
                      height: '100px',
                      display: 'block',

                      'background-color': 'black'
                    }
                  }
                }
              ],
              sliding: {
                mode: 'height',
                // FIX: hard-coded demo styles
                closedStyle: 'demo-sliding-closed',
                openStyle: 'demo-sliding-open',
                shrinkingStyle: 'demo-sliding-height-shrinking',
                growingStyle: 'demo-sliding-height-growing'
              }
            }
          ];
        };

        return {
          doExhibit: doExhibit,
          builder: builder,
          schema: Fun.constant(schema)
        };
      })

    ];



    return schema;
  }
);