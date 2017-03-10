define(
  'ephox.alloy.ui.slider.SliderUi',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.ui.slider.SliderActions',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Width'
  ],

  function (EventRoot, Keying, SystemEvents, EventHandler, SliderActions, Objects, Option, Css, Width) {
    var sketch = function (detail, components, spec, externals) {
      var range = detail.max() - detail.min();

      var getXCentre = function (component) {
        var rect = component.element().dom().getBoundingClientRect();
        return (rect.left + rect.right) / 2;
      };

      var getXOffset = function (slider, spectrumBounds, detail) {
        var v = detail.value().get();
        if (v < detail.min()) {
          // position at left edge
          return getXCentre(slider.getSystem().getByUid(detail.partUids()['left-edge']).getOrDie()) - spectrumBounds.left;
        } else if (v > detail.max()) {
          // position at right edge
          return getXCentre(slider.getSystem().getByUid(detail.partUids()['right-edge']).getOrDie()) - spectrumBounds.left;
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
        var thumb = component.getSystem().getByUid(detail.partUids().thumb).getOrDie();
        var thumbRadius = Width.get(thumb.element()) / 2;
        Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
      };

      var changeValue = function (component, newValue) {
        var oldValue = detail.value().get();
        // TODO: Reuse this concept.
        var thumb = component.getSystem().getByUid(detail.partUids().thumb).getOrDie();
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

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: {
          keying: {
            mode: 'special',
            focusIn: function (slider) {
              var spectrum = slider.getSystem().getByUid(detail.partUids().spectrum).getOrDie();
              Keying.focusIn(spectrum);
              return Option.some(true);
            }
          },
          representing: {
            store: {
              mode: 'manual',
              getValue: function (_) {
                return detail.value().get();
              }
            }
          }
        },

        events: Objects.wrapAll([
          {
            key: SliderActions.changeEvent(),
            value: EventHandler.nu({
              run: function (slider, simulatedEvent) {
                changeValue(slider, simulatedEvent.event().value);
              }
            })
          },
          {
            key: SystemEvents.attachedToDom(),
            value: EventHandler.nu({
              run: function (slider, simulatedEvent) {
                if (EventRoot.isSource(slider, simulatedEvent)) {
                  changeValue(slider, detail.value().get());
                }
              }
            })
          }
        ]),

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