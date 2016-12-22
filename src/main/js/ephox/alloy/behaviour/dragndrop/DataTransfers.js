define(
  'ephox.alloy.behaviour.dragndrop.DataTransfers',

  [
    'ephox.compass.Arr',
    'ephox.fred.PlatformDetection',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!setTimeout'
  ],

  function (Arr, PlatformDetection, Attr, Css, Element, Insert, Remove, setTimeout) {
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

    var setDragImage = function (target, transfer, image, x, y) {
      // Neither IE nor Edge support setDragImage
      if (transfer.setDragImage) transfer.setDragImage(image, x, y);
      else {
        var style = Attr.get(target, 'style');
        // Css.set(target, 'background', 'blue');

        var nu = Element.fromDom(image.cloneNode(true));
        Css.set(nu, 'position', 'absolute');
        Css.set(nu, 'left', '0px');
        Css.set(nu, 'top', '0px');
        console.log('nu', nu.dom());
        Insert.append(target, nu);
        Css.set(target, 'position', 'relative');

        setTimeout(function () {
          Attr.set(target, 'style', style);
          Remove.remove(nu);
        }, 1000);
      }
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