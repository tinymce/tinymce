asynctest(
  'SelectionInFramePositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Cursors',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.compass.Arr',
    'ephox.fussy.api.WindowSelection',
    'ephox.perhaps.Result',
    'ephox.photon.Writer',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!Error',
    'global!setTimeout',
    'global!window'
  ],
 
  function (Chain, Cursors, Guard, NamedChain, GuiFactory, GuiSetup, Sinks, Arr, WindowSelection, Result, Writer, Css, DomEvent, Element, Scroll, SelectorExists, SelectorFind, Traverse, Error, setTimeout, window) {
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
            border: 'inherit',
            position: 'absolute'
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

      Css.set(classicEditor.element(), 'margin-top', '300px');

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

      var getAnchor = function (data) {
        return {
          anchor: 'selection',
          root: Element.fromDom(data.classic.element().dom().contentWindow.document.body)
        };
      };

      var cAddPopupToRelative = NamedChain.bundle(function (data) {
        data.relative.apis().addContainer(data.popup);
        data.relative.apis().position(getAnchor(data), data.popup);
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
        data.fixed.apis().position(getAnchor(data), data.popup);
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

      var cGetWin = Chain.mapper(function (frame) {
        return frame.element().dom().contentWindow;
      });

      var cSetPath = function (rawPath) {
        var path = Cursors.path(rawPath);

        return Chain.binder(function (win) {
          var body = Element.fromDom(win.document.body);
          var range = Cursors.calculate(body, path);
           WindowSelection.setExact(
            win,
            range.start(),
            range.soffset(),
            range.finish(),
            range.foffset()
          );
          return WindowSelection.get(win).fold(function () {
            return Result.error('Could not retrieve the set selection');
          }, Result.value);
        });
      };

      var addLogging = function (label, chains) {
        var logChains = Arr.map(chains, function (c) {
          return Chain.control(c, Guard.addLogging(label));
        });

        return Chain.fromChains(logChains);
      };

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.writeValue('context', gui),
            NamedChain.direct('context', cFindUid('fixed-sink'), 'fixed'),
            NamedChain.direct('context', cFindUid('relative-sink'), 'relative'),
            NamedChain.direct('context', cFindUid('classic-editor'), 'classic'),
            NamedChain.direct('context', cFindUid('popup'), 'popup'),
            NamedChain.direct('classic', cGetWin, 'iWin'),

            // Wait until the content has loaded
            Chain.control(
              Chain.binder(function (data) {
                var root = Element.fromDom(data.classic.element().dom().contentWindow.document.body);
                return SelectorFind.descendant(root, 'p').fold(function () {
                  return Result.error('Could not find paragraph yet');
                }, function (p) {
                  return Result.value(data);
                });
              }),
              Guard.tryUntil('Waiting for content to load in iframe', 100, 10000)
            ),
            
            addLogging(
              'Selected: 3rd paragraph, no page scroll, no editor scroll',
              [
                NamedChain.direct('iWin', cSetPath({
                  startPath: [ 2, 0 ],
                  soffset: 0,
                  finishPath: [ 3, 0 ],
                  foffset: 0
                }), 'range'),

                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(2000),
                cAddPopupToFixed,
                cTestPopupInFixed,
                Chain.wait(2000)
              ]
            ),
            
            Chain.wait(1000),

            addLogging(
              'Selected: 3rd paragraph, large page scroll, no editor scroll',
              [
                Chain.op(function (data) {
                  Css.set(data.classic.element(), 'margin-top', '2000px');
                  window.scrollTo(0, 2000);
                }),

                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(2000),
                cAddPopupToFixed,
                cTestPopupInFixed,
                Chain.wait(2000)
              ]
            ),

            addLogging(
              'Selected: 13th paragraph, large page scroll, large editor scroll',
              [
                NamedChain.direct('iWin', cSetPath({
                  startPath: [ 12 ],
                  soffset: 0,
                  finishPath: [ 13 ],
                  foffset: 0
                }), 'range2'),
                NamedChain.direct('range2', Chain.mapper(function (range2) {
                  range2.start().dom().scrollIntoView();
                  return Scroll.get(
                    Traverse.owner(range2.start())
                  );
                }), 'scroll2'),

                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(3000),
                cAddPopupToFixed,
                cTestPopupInFixed,

                Chain.wait(3000)
              ]
            )
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);