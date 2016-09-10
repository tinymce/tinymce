define(
  'ephox.alloy.test.Sinks',

  [
    'ephox.alloy.api.GuiFactory',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.PredicateExists'
  ],

  function (GuiFactory, Compare, PredicateExists) {
    var fixedSink = function () {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          styles: {
            border: '1px solid green'
          }
        },
        uid: 'fixed-sink',
        positioning: {
          useFixed: true
        }
      });
    };

    var relativeSink = function () {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          styles: {
            border: '1px solid blue'
          }
        },
        uid: 'relative-sink',
        positioning: {
          useFixed: false
        }
      });
    };

    var popup = function () {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          innerHtml: 'Demo day',
          styles: {
            width: '200px',
            height: '150px',
            border: 'inherit'
          }
        },
        uid: 'popup'
      });
    };

    var isInside = function (sinkComponent, popupComponent) {
      var isSink = function (el) {
        return Compare.eq(el, sinkComponent.element());
      };

      return PredicateExists.closest(popupComponent.element(), isSink);
    };

    return {
      fixedSink: fixedSink,
      isInside: isInside,
      relativeSink: relativeSink,
      popup: popup
    };
  }
);