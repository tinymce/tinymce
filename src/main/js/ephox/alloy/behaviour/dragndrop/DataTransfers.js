define(
  'ephox.alloy.behaviour.dragndrop.DataTransfers',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var setDataTransfer = function (transfer, types, data) {
      Arr.each(types, function (type) {
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
      // Check if falsy
      var set = transfer.items ? setDataItems : setDataTransfer;
      set(transfer, types, data);
    };

    var setDragImage = function (transfer, image, x, y) {
      // Neither IE nor Edge support setDragImage
      if (transfer.setDragImage) transfer.setDragImage(image, x, y);
      else console.error('haha');
    };

    var setDropEffect = function (transfer, effect) {
      transfer.dropEffect = effect;
    };

    return {
      setData: setData,
      setDragImage: setDragImage,
      setDropEffect: setDropEffect
    };
  }
);