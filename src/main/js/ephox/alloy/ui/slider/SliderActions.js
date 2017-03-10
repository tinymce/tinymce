define(
  'ephox.alloy.ui.slider.SliderActions',

  [
    'ephox.alloy.ui.slider.SliderModel',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'global!Math'
  ],

  function (SliderModel, Fun, Option, Math) {
    var changeEvent = 'slider.change.value';

    var getEventX = function (simulatedEvent) {
      var touches = simulatedEvent.event().raw().touches;
      return touches.length === 1 ? Option.some(touches[0].clientX) : Option.none();
    };

    var fireChange = function (component, value, xPos) {
      component.getSystem().triggerEvent(changeEvent, component.element(), {
        value: value,
        xPos: xPos
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
      var values = SliderModel.findValueOfX(
        spectrumBounds, detail.min(), detail.max(),
        xValue, detail.stepSize(), detail.snapToGrid()
      );

      fireChange(spectrum, values.value, Option.some(values.xValue));
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