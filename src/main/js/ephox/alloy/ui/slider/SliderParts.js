define(
  'ephox.alloy.ui.slider.SliderParts',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.slider.SliderActions',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (EventHandler, PartType, SliderActions, Fun, Option) {
    var noSketch = { sketch: Fun.identity };

    var edgePart = function (name, action) {
      return PartType.optional(
        noSketch, [ ], '' + name + '-edge', '<alloy.slider.' + name + '-edge>',
        Fun.constant({ }),
        function (detail) {
          return {
            events: {
              touchstart: EventHandler.nu({
                run: function (l) {
                  action(l, detail);
                }
              })
            }
          };
        }
      );
    };

    // When the user touches the left edge, it should move the thumb
    var ledgePart = edgePart('left', SliderActions.setToLedge);

    // When the user touches the right edge, it should move the thumb
    var redgePart = edgePart('right', SliderActions.setToRedge);

    // The thumb part needs to have position absolute to be positioned correctly
    var thumbPart = PartType.internal(
      noSketch, [ ], 'thumb', '<alloy.slider.thumb>',
      Fun.constant({
        dom: {
          styles: { position: 'absolute' }
        }
      }),
      Fun.constant({ })
    );

    var spectrumPart = PartType.internal(
      noSketch, [ ], 'spectrum', '<alloy.slider.spectrum>',
      Fun.constant({ }),
      function (detail) {
        return {
          behaviours: {
            // Move left and right along the spectrum
            keying: {
              mode: 'special',
              onLeft: function (spectrum) {
                SliderActions.moveLeft(spectrum, detail);
                return Option.some(true);
              },
              onRight: function (spectrum) {
                SliderActions.moveRight(spectrum, detail);
                return Option.some(true);
              }
            },
            // Allow the spectrum to get keyboard focus
            focusing: true
          },

          events: {
            touchstart: EventHandler.nu({
              run: function (spectrum, simulatedEvent) {
                var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
                SliderActions.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
              }
            })
          }
        };
      }
    );

    return [
      ledgePart,
      redgePart,
      thumbPart,
      spectrumPart
    ];
  }
);