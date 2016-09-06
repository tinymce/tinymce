asynctest(
  'SubmenuPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Scroll',
    'global!Error',
    'global!setTimeout'
  ],
 
  function (Chain, Guard, NamedChain, GuiFactory, GuiSetup, Sinks, Result, Css, Scroll, Error, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var fixedSink = Sinks.fixedSink();
      var relativeSink = Sinks.relativeSink();

      var popup = GuiFactory.build({
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
          { built: fixedSink },
          { built: relativeSink },
          { built: popup },
          { built: list }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var cFindUid = function (uid) {
        return Chain.binder(function (context) {
          return context.getByUid(uid);
        });
      };

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
            NamedChain.writeValue('context', gui),
            NamedChain.direct('context', cFindUid('fixed-sink'), 'fixed'),
            NamedChain.direct('context', cFindUid('relative-sink'), 'relative'),
            NamedChain.direct('context', cFindUid('test-list'), 'list'),
            NamedChain.direct('context', cFindUid('test-item'), 'item'),
            NamedChain.direct('context', cFindUid('popup'), 'popup'),
            cAddPopupToRelative,
            cTestPopupInRelative,
            cAddPopupToFixed,
            cTestPopupInFixed,

            NamedChain.bundle(function (data) {
              Css.set(data.list.element(), 'top', '1000px');
              return Result.value(data);
            }),

            cScrollToItem,
            cAddPopupToRelative,
            cTestPopupInRelative,
            cAddPopupToFixed,
            cTestPopupInFixed
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);