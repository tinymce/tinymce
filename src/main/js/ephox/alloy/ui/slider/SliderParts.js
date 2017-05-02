define(
  'ephox.alloy.ui.slider.SliderParts',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.slider.SliderActions',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection'
  ],

  function (Behaviour, Focusing, Keying, EventHandler, PartType, SliderActions, FieldSchema, Cell, Fun, Option, PlatformDetection) {
    var platform = PlatformDetection.detect();
    var isTouch = platform.deviceType.isTouch();

    var noSketch = { sketch: Fun.identity };

    var edgePart = function (name, action) {
      return PartType.optional(
        noSketch, [ ], '' + name + '-edge', '<alloy.slider.' + name + '-edge>',
        Fun.constant({ }),
        function (detail) {
          var uiEvents = isTouch ? {
            touchstart: EventHandler.nu({
              run: function (l) {
                action(l, detail);
              }
            })
          } : {
            mousedown: EventHandler.nu({
              run: function (l) {
                action(l, detail);
              }
            }),

            'mousemove': EventHandler.nu({
              run: function (l, simulatedEvent) {
                if (detail.mouseIsDown().get()) {
                  action(l, detail);
                }
              }
            })
          };

          return {
            events: uiEvents
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
      noSketch, [
        FieldSchema.state('mouseIsDown', function () { return Cell(false); })
      ], 'spectrum', '<alloy.slider.spectrum>',
      Fun.constant({ }),
      function (detail) {

        var moveToX = function (spectrum, simulatedEvent) {
          var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
          SliderActions.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
        };

        var uiEvents = PlatformDetection.detect().deviceType.isTouch() ? {
          touchstart: EventHandler.nu({
            run: moveToX
          }),
          touchmove: EventHandler.nu({
            run: moveToX
          })
        } : {
          'mousedown': EventHandler.nu({
            run: moveToX
          }),

          'mousemove': EventHandler.nu({
            run: function (spectrum, simulatedEvent) {
              if (detail.mouseIsDown().get()) moveToX(spectrum, simulatedEvent);
            }
          })
        };

        return {
          behaviours: Behaviour.derive([
            // Move left and right along the spectrum
            Keying.config({
              mode: 'special',
              onLeft: function (spectrum) {
                SliderActions.moveLeft(spectrum, detail);
                return Option.some(true);
              },
              onRight: function (spectrum) {
                SliderActions.moveRight(spectrum, detail);
                return Option.some(true);
              }
            }),
            // TODO: Do not allow keyboard focus on mobile (TM-25)
            Focusing.config({ })
          ]),

          events: uiEvents
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