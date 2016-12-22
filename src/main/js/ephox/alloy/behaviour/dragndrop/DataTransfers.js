define(
  'ephox.alloy.behaviour.dragndrop.DataTransfers',

  [
    'ephox.compass.Arr',
    'ephox.fred.PlatformDetection'
  ],

  function (Arr, PlatformDetection) {
    var platform = PlatformDetection.detect();

    var setDataTransfer = function (transfer, types, data) {
      Arr.each(types, function (rawType) {
        var type = platform.browser.isIE() && rawType.indexOf('text') === 0 ? 'text' : rawType;
        transfer.setData(type, data);
      });
    };

    var setDataItems = function (transfer, types, data) {
      transfer.items.clear();
      Arr.each(types, function (type) {
        transfer.items.add(data, type);
      });
    };

    var setData = function (transfer, types, data) {
      // If we use setDataItems on Firefox and Linux, it basically gets into a failed state
      // which corrupts all drag and drops on that Firefox process. Avoid.
      var set = platform.browser.isChrome() ? setDataItems : setDataTransfer;
      set(transfer, types, data);
    };

    var getData = function (transfer, rawType) {
      var type = platform.browser.isIE() && rawType.indexOf('text') === 0 ? 'text' : rawType;
      return transfer.getData(type);
    };

    var setDragImage = function (transfer, image, x, y) {
      // Neither IE nor Edge support setDragImage
      if (transfer.setDragImage) transfer.setDragImage(image, x, y);
    };

    var setDropEffect = function (transfer, effect) {
      transfer.dropEffect = effect;
    };

    return {
      setData: setData,
      getData: getData,
      setDragImage: setDragImage,
      setDropEffect: setDropEffect
    };
  }
);