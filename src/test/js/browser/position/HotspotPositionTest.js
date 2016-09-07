asynctest(
  'HotspotPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.PositionTestUtils',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Scroll',
    'global!Error',
    'global!setTimeout'
  ],
 
  function (Chain, Guard, NamedChain, GuiFactory, ChainUtils, GuiSetup, PositionTestUtils, Sinks, Result, Css, Scroll, Error, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var hotspot = GuiFactory.build({
        uiType: 'button',
        text: 'Hotspot',
        action: function () { },
        dom: {
          styles: {
            position: 'absolute',
            left: '100px',
            top: '120px'
          }
        },
        uid: 'hotspot'
      });

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          { built: Sinks.fixedSink() },
          { built: Sinks.relativeSink() },
          { built: Sinks.popup() },
          { built: hotspot }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var cAddPopupToRelative = NamedChain.bundle(function (data) {
        data.relative.apis().addContainer(data.popup);
        data.relative.apis().position({
          anchor: 'hotspot',
          hotspot: data.hotspot
        }, data.popup);
        return Result.value(data);
      });

      var cTestPopupInRelative = Chain.control(
        NamedChain.bundle(function (data) {
          var inside = Sinks.isInside(data.relative, data.popup);
          return inside ? Result.value(data) : Result.error(
            new Error('The popup does not appear within the relative sink container')
          );
        }),
        Guard.tryUntil('Ensuring that the popup is inside the relative sink', 100, 3000)
      );

      var cAddPopupToFixed = NamedChain.bundle(function (data) {
        data.fixed.apis().addContainer(data.popup);
        data.fixed.apis().position({
          anchor: 'hotspot',
          hotspot: data.hotspot
        }, data.popup);
        return Result.value(data);
      });

      var cTestPopupInFixed = Chain.control(
        NamedChain.bundle(function (data) {
          var inside = Sinks.isInside(data.fixed, data.popup);
          return inside ? Result.value(data) : Result.error(
            new Error('The popup does not appear within the fixed sink container')
          );
        }),
        Guard.tryUntil('Ensuring that the popup is inside the fixed sink', 100, 3000)
      );

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            ChainUtils.cFindUids(gui, {
              'fixed': 'fixed-sink',
              'relative': 'relative-sink',
              'popup': 'popup',
              'hotspot': 'hotspot'
            }),

            ChainUtils.cLogging(
              'Relative, not scrolled',
              [
                cAddPopupToRelative,
                cTestPopupInRelative
              ]
            ),

            Chain.wait(1000),

            ChainUtils.cLogging(
              'Fixed, not scrolled',
              [
                cAddPopupToFixed,
                cTestPopupInFixed
              ]
            ),
            
            Chain.wait(1000),

            ChainUtils.cLogging(
              'Adding margin to hotspot and scrolling to it',
              [
                NamedChain.direct('hotspot', PositionTestUtils.cAddTopMargin('1000px'), '_'),
                NamedChain.direct('hotspot', PositionTestUtils.cScrollTo, 'scroll')
              ]
            ),
            

            ChainUtils.cLogging(
              'Relative, scrolled 1000px',
              [
                cAddPopupToRelative,
                cTestPopupInRelative
              ]
            ),

            Chain.wait(1000),

            ChainUtils.cLogging(
              'Fixed, scrolled 1000px',
              [
                cAddPopupToFixed,
                cTestPopupInFixed
              ]
            ),
            
            Chain.wait(1000)
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);