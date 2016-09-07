define(
  'ephox.alloy.test.PositionTestUtils',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse',
    'global!Error'
  ],

  function (Chain, Guard, NamedChain, ChainUtils, Sinks, Result, Css, Scroll, Traverse, Error) {
    var cAddPopupToSink = function (sinkName) {
      return NamedChain.bundle(function (data) {
        var sink = data[sinkName];
        sink.apis().addContainer(data.popup);
        sink.apis().position(data.anchor, data.popup);
        return Result.value(data);
      });
    };
    
    var cTestPopupInSink = function (label, sinkName) {
      return Chain.control(
        NamedChain.bundle(function (data) {
          var sink = data[sinkName];
          var inside = Sinks.isInside(sink, data.popup);
          return inside ? Result.value(data) : Result.error(
            new Error('The popup does not appear within the ' + label + ' sink container')
          );
        }),
        Guard.tryUntil('Ensuring that the popup is inside the ' + label + ' sink', 100, 3000)
      );
    };

    var cScrollTo = Chain.mapper(function (component) {
      component.element().dom().scrollIntoView();
      var doc = Traverse.owner(component.element());
      return Scroll.get(doc);
    });

    var cAddTopMargin = function (amount) {
      return Chain.mapper(function (component) {
        Css.set(component.element(), 'margin-top', amount);
        return component;
      });
    };

    var cTestSink = function (label, sinkName) {
      return ChainUtils.cLogging(
        label,
        [
          cAddPopupToSink(sinkName),
          cTestPopupInSink(sinkName, sinkName)
        ]
      );
    };

    var cScrollDown = function (componentName, amount) {
      return ChainUtils.cLogging(
        'Adding margin to ' + componentName + ' and scrolling to it',
        [
          NamedChain.direct(componentName, cAddTopMargin(amount), '_'),
          NamedChain.direct(componentName, cScrollTo, '_')
        ]
      );
    };

    return {
      cTestSink: cTestSink,
      cScrollDown: cScrollDown,
      cScrollTo: cScrollTo,
      cAddTopMargin: cAddTopMargin
    };
  }
);