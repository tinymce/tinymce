asynctest(
  'SelectionPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.fussy.api.WindowSelection',
    'ephox.perhaps.Result',
    'ephox.photon.Writer',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Scroll',
    'global!Error',
    'global!setTimeout'
  ],
 
  function (Chain, Guard, NamedChain, GuiFactory, GuiSetup, Sinks, WindowSelection, Result, Writer, Css, DomEvent, Element, Scroll, Error, setTimeout) {
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
            border: '1px solid black',
            background: 'inherit'
          }
        },
        uid: 'popup'
      });

      var content = '';
      for (var i = 0; i < 20; i++) {
        content += '<p>paragraph ' + i  + '</p>';
      }

      var frame = Element.fromTag('iframe');
      var onload = DomEvent.bind(frame, 'load', function () {
        onload.unbind();
        Writer.write(frame, '<html><body contenteditable="true">' + content + '</body></html>');
      });

      var classicEditor = GuiFactory.build({
        external: {
          uid: 'classic-editor',
          element: frame
        }
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
          { built: classicEditor }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var cFindUid = function (uid) {
        return Chain.binder(function (context) {
          return context.getByUid(uid);
        });
      };

      var classicEditor = component.components()[3];
      console.log('classicEditor', classicEditor);

      var cAddPopupToRelative = NamedChain.bundle(function (data) {
        data.relative.apis().addContainer(data.popup);
        data.relative.apis().position({
          anchor: 'selection',
          root: Element.fromDom(data.classic.element().dom().contentWindow.document.body),
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
            NamedChain.direct('context', cFindUid('classic-editor'), 'classic'),
            NamedChain.direct('context', cFindUid('popup'), 'popup'),

            Chain.wait(3000),
            NamedChain.bundle(function (data) {

              // Make a selection in the window.
              var win = data.classic.element().dom().contentWindow;
              win.focus();
              console.log('win', win);
              var root = Element.fromDom(win.document.body);
              
              WindowSelection.setExact(
                win,
                body,
                0,
                body,
                1
              );
debugger;
              return Result.value(data);
            }),
            cAddPopupToRelative,
            // cTestPopupInRelative,
            // cAddPopupToFixed,
            // cTestPopupInFixed,

            // NamedChain.bundle(function (data) {
            //   Css.set(data.list.element(), 'top', '1000px');
            //   return Result.value(data);
            // }),

            // cScrollToItem,
            // cAddPopupToRelative,
            // cTestPopupInRelative,
            // cAddPopupToFixed,
            // cTestPopupInFixed
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);