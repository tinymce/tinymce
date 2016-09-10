asynctest(
  'SelectionInDocPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Cursors',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.PositionTestUtils',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'global!Error',
    'global!setTimeout',
    'global!window'
  ],
 
  function (Chain, Cursors, NamedChain, GuiFactory, ChainUtils, GuiSetup, PositionTestUtils, Sinks, Option, Result, Css, Element, Html, Error, setTimeout, window) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var content = '';
      for (var i = 0; i < 20; i++) {
        content += '<p>paragraph ' + i  + '</p>';
      }

      var editor = Element.fromTag('div');
      Html.set(editor, content);

      var inlineEditor = GuiFactory.build({
        external: {
          uid: 'inline-editor',
          element: editor
        }
      });

      Css.setAll(inlineEditor.element(), {
        'margin-top': '300px',
        height: '200px',
        overflow: 'scroll',
        border: '1px solid red'
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
          { built: inlineEditor }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var cSetupAnchor = Chain.mapper(function (data) {
        return {
          anchor: 'selection',
          root: data.inline.element(),
          getSelection: function () {
            return Option.some(
              Cursors.calculate(data.inline.element(), data.path)
            );
          }
        };
      });

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            ChainUtils.cFindUids(gui, {
              'fixed': 'fixed-sink',
              'relative': 'relative-sink',
              'popup': 'popup',
              'inline': 'inline-editor'
            }),

            ChainUtils.cLogging(
              'Setting selection path to 3rd paragraph',
              [
                NamedChain.writeValue('path', Cursors.path({
                  startPath: [ 2 ],
                  soffset: 0,
                  finishPath: [ 3 ],
                  foffset: 0
                }))
              ]
            ),

            NamedChain.write('anchor', cSetupAnchor),
            
            PositionTestUtils.cTestSink(
              'Relative, Selected: 3rd paragraph, no page scroll, no editor scroll',
              'relative'
            ),
            PositionTestUtils.cTestSink(
              'Fixed, Selected: 3rd paragraph, no page scroll, no editor scroll',
              'fixed'
            ),
           
            PositionTestUtils.cScrollDown(
              'inline',
              '2000px'
            ),

            PositionTestUtils.cTestSink(
              'Relative, Selected: 3rd paragraph, large scroll, no editor scroll',
              'relative'
            ),
            PositionTestUtils.cTestSink(
              'Fixed, Selected: 3rd paragraph, large scroll, no editor scroll',
              'fixed'
            ),
          

            ChainUtils.cLogging(
              'Setting selection to 13th paragraph and scrolling there',
              [
                NamedChain.writeValue('path', Cursors.path({
                  startPath: [ 12 ],
                  soffset: 0,
                  finishPath: [ 13 ],
                  foffset: 0
                })),
                NamedChain.bundle(function (data) {
                  var root = data.inline.element();
                  var path = data.path;
                  var range = Cursors.calculate(root, path);
                  range.start().dom().scrollIntoView();
                  return Result.value(data);
                }),

                // Update the anchor
                NamedChain.write('anchor', cSetupAnchor)
              ]
            ),

            PositionTestUtils.cTestSink(
              'Relative, Selected: 13rd paragraph, large scroll, no editor scroll',
              'relative'
            ),
            PositionTestUtils.cTestSink(
              'Fixed, Selected: 13rd paragraph, large scroll, no editor scroll',
              'fixed'
            )
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);