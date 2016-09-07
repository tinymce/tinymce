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
      var cSetupAnchor = Chain.mapper(function (hotspot) {
        return {
          anchor: 'hotspot',
          hotspot: hotspot
        };
      });

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            ChainUtils.cFindUids(gui, {
              'fixed': 'fixed-sink',
              'relative': 'relative-sink',
              'popup': 'popup',
              'hotspot': 'hotspot'
            }),

            NamedChain.direct('hotspot', cSetupAnchor, 'anchor'),

            PositionTestUtils.cTestSink('Relative, not scrolled', 'relative'),
            Chain.wait(1000),
            PositionTestUtils.cTestSink('Fixed, not scrolled', 'fixed'),
            Chain.wait(1000),

            PositionTestUtils.cScrollDown('hotspot', '1000px'),
            PositionTestUtils.cTestSink('Relative, scrolled 1000px', 'relative'),
            Chain.wait(1000),
            PositionTestUtils.cTestSink('Fixed, scrolled 1000px', 'fixed'),
            
            Chain.wait(1000)
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);