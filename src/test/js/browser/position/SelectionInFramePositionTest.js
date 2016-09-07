asynctest(
  'SelectionInFramePositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Cursors',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.PositionTestUtils',
    'ephox.alloy.test.Sinks',
    'ephox.fussy.api.WindowSelection',
    'ephox.perhaps.Result',
    'ephox.photon.Writer',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!Error',
    'global!setTimeout',
    'global!window'
  ],
 
  function (Chain, Cursors, Guard, NamedChain, GuiFactory, ChainUtils, GuiSetup, PositionTestUtils, Sinks, WindowSelection, Result, Writer, Css, DomEvent, Element, Scroll, SelectorFind, Traverse, Error, setTimeout, window) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
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
          { built: Sinks.fixedSink() },
          { built: Sinks.relativeSink() },
          { built: Sinks.popup() },
          { built: classicEditor }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var cSetupAnchor = Chain.mapper(function (data) {
        return {
          anchor: 'selection',
          root: Element.fromDom(data.classic.element().dom().contentWindow.document.body)
        };
      });

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

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            ChainUtils.cFindUids(gui, {
              'fixed': 'fixed-sink',
              'relative': 'relative-sink',
              'popup': 'popup',
              'classic': 'classic-editor'
            }),
            NamedChain.direct('classic', cGetWin, 'iWin'),

            // Wait until the content has loaded
            ChainUtils.cLogging(
              'Waiting for iframe to load content.',
              [
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
                )
              ]
            ),
            
            ChainUtils.cLogging(
              'Selecting 3rd paragraph',
              [
                NamedChain.direct('iWin', cSetPath({
                  startPath: [ 2, 0 ],
                  soffset: 0,
                  finishPath: [ 3, 0 ],
                  foffset: 0
                }), 'range'),
                NamedChain.write('anchor', cSetupAnchor)
              ]
            ),

            PositionTestUtils.cTestSink(
              'Relative, Selected: 3rd paragraph, no page scroll, no editor scroll',
              'relative'
            ),
            PositionTestUtils.cTestSink(
              'Fixed, Selected: 3rd paragraph, no page scroll, no editor scroll',
              'fixed'
            ),

            PositionTestUtils.cScrollDown('classic', '2000px'),
            PositionTestUtils.cTestSink(
              'Relative, Selected: 3rd paragraph, 2000px scroll, no editor scroll',
              'relative'
            ),
            PositionTestUtils.cTestSink(
              'Fixed, Selected: 3rd paragraph, 2000px scroll, no editor scroll',
              'fixed'
            ),


            ChainUtils.cLogging(
              'Selecting 13th paragraph and scrolling to it',
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
                NamedChain.write('anchor', cSetupAnchor)
              ]
            ),


            PositionTestUtils.cTestSink(
              'Relative, Selected: 13rd paragraph, 2000px scroll, no editor scroll',
              'relative'
            ),
            PositionTestUtils.cTestSink(
              'Fixed, Selected: 13rd paragraph, 2000px scroll, no editor scroll',
              'fixed'
            )
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);