asynctest(
  'HotspotPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.PositionTestUtils',
    'ephox.alloy.test.Sinks',
    'global!Error',
    'global!setTimeout'
  ],
 
  function (Chain, NamedChain, GuiFactory, Button, Container, ChainUtils, GuiSetup, PositionTestUtils, Sinks, Error, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var hotspot = GuiFactory.build(
        Button.build({
          action: function () { },
          dom: {
            styles: {
              position: 'absolute',
              left: '100px',
              top: '120px'
            },
            innerHtml: 'Hotspot',
            tag: 'button'
          },
          uid: 'hotspot'
        })
      );

      return GuiFactory.build(
        Container.build({
          components: [
            GuiFactory.premade(Sinks.fixedSink()),
            GuiFactory.premade(Sinks.relativeSink()),
            GuiFactory.premade(Sinks.popup()),
            GuiFactory.premade(hotspot)
          ]
        })
      );

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
            PositionTestUtils.cTestSink('Fixed, not scrolled', 'fixed'),

            PositionTestUtils.cScrollDown('hotspot', '1000px'),
            PositionTestUtils.cTestSink('Relative, scrolled 1000px', 'relative'),
            PositionTestUtils.cTestSink('Fixed, scrolled 1000px', 'fixed')
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);