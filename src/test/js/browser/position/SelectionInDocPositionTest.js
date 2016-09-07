asynctest(
  'SelectionInDocPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Cursors',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.ChainUtils',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.compass.Arr',
    'ephox.fussy.api.WindowSelection',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'global!Error',
    'global!setTimeout',
    'global!window'
  ],
 
  function (Chain, Cursors, Guard, NamedChain, GuiFactory, ChainUtils, GuiSetup, Sinks, Arr, WindowSelection, Option, Result, Css, Element, Html, Error, setTimeout, window) {
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
      var cFindUid = function (uid) {
        return Chain.binder(function (context) {
          return context.getByUid(uid);
        });
      };

      var getAnchor = function (data) {
        return {
          anchor: 'selection',
          root: data.inline.element(),
          getSelection: function () {
            return Option.some(
              Cursors.calculate(data.inline.element(), data.path)
            );
          }
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
            
            ChainUtils.cLogging(
              'Relative, Selected: 3rd paragraph, no page scroll, no editor scroll',
              [
                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(1000)
              ]
            ),

            ChainUtils.cLogging(
              'Fixed, Selected: 3rd paragraph, no page scroll, no editor scroll',
              [
                cAddPopupToFixed,
                cTestPopupInFixed,
                Chain.wait(1000)
              ]
            ),
           
            ChainUtils.cLogging(
              'Setting margin on inline editor and scrolling to it',
              [
                Chain.wait(1000),
                Chain.op(function (data) {
                  Css.set(data.inline.element(), 'margin-top', '2000px');
                  window.scrollTo(0, 2000);
                })
              ]
            ),

            ChainUtils.cLogging(
              'Relative, Selected: 3rd paragraph, large scroll, no editor scroll',
              [
                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(1000)
              ]
            ),

            ChainUtils.cLogging(
              'Fixed, Selected: 3rd paragraph, large scroll, no editor scroll',
              [
                cAddPopupToFixed,
                cTestPopupInFixed,
                Chain.wait(1000)
              ]
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
                })
              ]
            ),

            ChainUtils.cLogging(
              'Relative, Selected: 13rd paragraph, large scroll, no editor scroll',
              [
                cAddPopupToRelative,
                cTestPopupInRelative,
                Chain.wait(1000)
              ]
            ),

            ChainUtils.cLogging(
              'Fixed, Selected: 13rd paragraph, large scroll, no editor scroll',
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