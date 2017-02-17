define(
  'ephox.alloy.test.PositionTestUtils',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.Sinks',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Scroll',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (Chain, Guard, NamedChain, Positioning, ChainUtils, Sinks, Result, Css, Scroll, Traverse, Error) {
    var cAddPopupToSink = function (sinkName) {
      return NamedChain.bundle(function (data) {
        var sink = data[sinkName];
        Positioning.addContainer(sink, data.popup);
        Positioning.position(sink, data.anchor, data.popup);
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
      cScrollDown: cScrollDown
    };
  }
);