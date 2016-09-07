asynctest(
  'SubmenuPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.PositionTestUtils',
    'ephox.alloy.test.Sinks',
    'global!Error',
    'global!setTimeout'
  ],
 
  function (Chain, NamedChain, GuiFactory, ChainUtils, GuiSetup, PositionTestUtils, Sinks, Error, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var item = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'li',
          innerHtml: 'Trigger Item'
        },
        
        uid: 'test-item'
      });

      var list = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'ol',
          styles: {
            position: 'absolute',
            left: '400px',
            top: '140px'
          }
        },
        uid: 'test-list',
        components: [
          { built: item }
        ]
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
          { built: list }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var cSetupAnchor = Chain.mapper(function (item) {
        return {
          anchor: 'submenu',
          item: item
        };
      });
     
      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            ChainUtils.cFindUids(gui, {
              'fixed': 'fixed-sink',
              'relative': 'relative-sink',
              'popup': 'popup',
              'item': 'test-item',
              'list': 'test-list'
            }),

            NamedChain.direct('item', cSetupAnchor, 'anchor'),

            PositionTestUtils.cTestSink('Relative, not scrolled', 'relative'),
            PositionTestUtils.cTestSink('Fixed, not scrolled', 'fixed'),

            PositionTestUtils.cScrollDown('list', '1000px'),
            PositionTestUtils.cTestSink('Relative, scrolled 1000px', 'relative'),
            PositionTestUtils.cTestSink('Fixed, scrolled 1000px', 'fixed')
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);