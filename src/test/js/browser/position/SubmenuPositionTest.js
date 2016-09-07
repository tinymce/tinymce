asynctest(
  'SubmenuPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Scroll',
    'global!Error',
    'global!setTimeout'
  ],
 
  function (Chain, Guard, NamedChain, GuiFactory, ChainUtils, GuiSetup, Sinks, Result, Css, Scroll, Error, setTimeout) {
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
      var cAddPopupToRelative = NamedChain.bundle(function (data) {
        data.relative.apis().addContainer(data.popup);
        data.relative.apis().position({
          anchor: 'submenu',
          item: data.item
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
          anchor: 'submenu',
          item: data.item
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

      var cScrollToItem = NamedChain.direct('item', Chain.mapper(function (item) {
        item.element().dom().scrollIntoView();
        return Scroll.get();
      }), 'scrollValue');

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

            ChainUtils.cLogging(
              'Relative, not scrolled',
              [
                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(1000)
              ]
            ),

            ChainUtils.cLogging(
              'Fixed, not scrolled',
              [
                cAddPopupToFixed,
                cTestPopupInFixed,
                Chain.wait(1000)
              ]
            ),

            ChainUtils.cLogging(
              'Adding margin to item and scrolling to it',
              [
                NamedChain.bundle(function (data) {
                  Css.set(data.list.element(), 'top', '1000px');
                  return Result.value(data);
                }),
                cScrollToItem
              ]
            ),

            ChainUtils.cLogging(
              'Relative, scrolled 1000px',
              [
                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(1000)
              ]
            ),

            ChainUtils.cLogging(
              'Fixed, scrolled 1000px',
              [
                cAddPopupToFixed,
                cTestPopupInFixed,
                Chain.wait(1000)
              ]
            )
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);