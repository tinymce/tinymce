define(
  'ephox.alloy.ui.slider.SliderActions',

  [
    'ephox.alloy.ui.slider.SliderModel',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'global!Math'
  ],

  function (SliderModel, Fun, Option, PlatformDetection, Math) {
    var changeEvent = 'slider.change.value';

    var isTouch = PlatformDetection.detect().deviceType.isTouch();

    var getEventSource = function (simulatedEvent) {
      var evt = simulatedEvent.event().raw();
      if (isTouch && evt.touches !== undefined && evt.touches.length === 1) return Option.some(evt.touches[0]);
      else if (isTouch && evt.touches !== undefined) return Option.none();
      else if (! isTouch && evt.clientX !== undefined) return Option.some(evt);
      else return Option.none();
    };

    var getEventX = function (simulatedEvent) {
      var spot = getEventSource(simulatedEvent);
      return spot.map(function (s) {
        return s.clientX;
      });
    };

    var fireChange = function (component, value) {
      component.getSystem().triggerEvent(changeEvent, component.element(), {
        value: Fun.constant(value)
      });
    }

    var moveRightFromLedge = function (ledge, detail) {
      fireChange(ledge, detail.min(), Option.none());
    };

    var moveLeftFromRedge = function (redge, detail) {
      fireChange(redge, detail.max(), Option.none());
    };

    var setToRedge = function (redge, detail) {
      fireChange(redge, detail.max() + 1, Option.none());
    };

    var setToLedge = function (ledge, detail) {
      fireChange(ledge, detail.min() - 1, Option.none());
    };

    var setToX = function (spectrum, spectrumBounds, detail, xValue) {
      var value = SliderModel.findValueOfX(
        spectrumBounds, detail.min(), detail.max(),
        xValue, detail.stepSize(), detail.snapToGrid()
      );

      fireChange(spectrum, value);
    };

    var setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
      return getEventX(simulatedEvent).map(function (xValue) {
        setToX(spectrum, spectrumBounds, detail, xValue);
        return xValue;
      });
    };

    var moveLeft = function (spectrum, detail) {
      var newValue = SliderModel.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
      fireChange(spectrum, newValue, Option.none());
    };

    var moveRight = function (spectrum, detail) { 
      var newValue = SliderModel.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
      fireChange(spectrum, newValue, Option.none());
    };
    

    return {
      setXFromEvent: setXFromEvent,
      setToLedge: setToLedge,
      setToRedge: setToRedge,
      moveLeftFromRedge: moveLeftFromRedge,
      moveRightFromLedge: moveRightFromLedge,
      moveLeft: moveLeft,
      moveRight: moveRight,

      changeEvent: Fun.constant(changeEvent)
    };
  }
);