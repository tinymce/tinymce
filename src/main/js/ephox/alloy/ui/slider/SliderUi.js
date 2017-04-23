define(
  'ephox.alloy.ui.slider.SliderUi',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.ui.slider.SliderActions',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Width'
  ],

  function (EventRoot, Behaviour, Keying, Representing, SystemEvents, EventHandler, SliderActions, Objects, Option, PlatformDetection, Css, Width) {
    var isTouch = PlatformDetection.detect().deviceType.isTouch();

    var sketch = function (detail, components, spec, externals) {
      var range = detail.max() - detail.min();

      var getXCentre = function (component) {
        var rect = component.element().dom().getBoundingClientRect();
        return (rect.left + rect.right) / 2;
      };

      var getThumb = function (component) {
        return component.getSystem().getByUid(detail.partUids().thumb).getOrDie();
      };

      var getXOffset = function (slider, spectrumBounds, detail) {
        var v = detail.value().get();
        if (v < detail.min()) {
          return slider.getSystem().getByUid(detail.partUids()['left-edge']).fold(function () {
            return 0;
          }, function (ledge) {
            return getXCentre(ledge) - spectrumBounds.left;
          });
        } else if (v > detail.max()) {
          // position at right edge
          return slider.getSystem().getByUid(detail.partUids()['right-edge']).fold(function () {
            return spectrumBounds.width;
          }, function (redge) {
            return getXCentre(redge) - spectrumBounds.left;
          });
        } else {
          // position along the slider
          return (detail.value().get() - detail.min())/range * spectrumBounds.width;
        }
      };

      var getXPos = function (slider) {
        var spectrum = slider.getSystem().getByUid(detail.partUids().spectrum).getOrDie();
        var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
        var sliderBounds = slider.element().dom().getBoundingClientRect();

        var xOffset = getXOffset(slider, spectrumBounds, detail);
        return (spectrumBounds.left - sliderBounds.left) + xOffset;
      };

      var refresh = function (component) {
        var pos = getXPos(component);
        var thumb = getThumb(component);
        var thumbRadius = Width.get(thumb.element()) / 2;
        Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
      };

      var changeValue = function (component, newValue) {
        var oldValue = detail.value().get();
        var thumb = getThumb(component);
        // The left check is used so that the first click calls refresh
        if (oldValue !== newValue || Css.getRaw(thumb.element(), 'left').isNone()) {
          detail.value().set(newValue);
          refresh(component);
          detail.onChange()(component, thumb, newValue);
          return Option.some(true);
        } else {
          return Option.none();
        }
      };

      var resetToMin = function (slider) {
        changeValue(slider, detail.min(), Option.none());
      };

      var resetToMax = function (slider) {
        changeValue(slider, detail.max(), Option.none());
      };

      var uiEventsArr = isTouch ? [ ] : [
        {
          key: 'mousedown',
          value: EventHandler.nu({
            run: function (spectrum, simulatedEvent) {
              simulatedEvent.stop();
              detail.mouseIsDown().set(true);
            }
          })
        },
        {
          key: 'mouseup',
          value: EventHandler.nu({
            run: function (spectrum, simulatedEvent) {
              detail.mouseIsDown().set(false);
            }
          })
        }
      ];

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: Behaviour.derive([
          Keying.config({
            mode: 'special',
            focusIn: function (slider) {
              var spectrum = slider.getSystem().getByUid(detail.partUids().spectrum).getOrDie();
              Keying.focusIn(spectrum);
              return Option.some(true);
            }
          }),
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (_) {
                return detail.value().get();
              }
            }
          })
        ]),

        events: Objects.wrapAll([
          {
            key: SliderActions.changeEvent(),
            value: EventHandler.nu({
              run: function (slider, simulatedEvent) {
                changeValue(slider, simulatedEvent.event().value());
              }
            })
          },
          {
            key: SystemEvents.attachedToDom(),
            value: EventHandler.nu({
              run: function (slider, simulatedEvent) {
                if (EventRoot.isSource(slider, simulatedEvent)) {
                  detail.value().set(detail.getInitialValue()());
                  var thumb = getThumb(slider);
                  // Call onInit instead of onChange for the first value.
                  refresh(slider);
                  detail.onInit()(slider, thumb, detail.value().get());
                }
              }
            })
          }
        ].concat(uiEventsArr)),

        apis: {
          resetToMin: resetToMin,
          resetToMax: resetToMax
        },

        domModification: {
          styles: {
            position: 'relative'
          }
        }
      };
    };

    return {
      sketch: sketch
    };
  }
);