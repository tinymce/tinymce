import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import ChainUtils from 'ephox/alloy/test/ChainUtils';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import Sinks from 'ephox/alloy/test/Sinks';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('SelectionInDocPositionTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    var content = '';
    for (var i = 0; i < 20; i++) {
      content += '<p>paragraph ' + i + '</p>';
    }

    var editor = Element.fromTag('div');
    Html.set(editor, content);

    var inlineEditor = GuiFactory.build(
      GuiFactory.external({
        uid: 'inline-editor',
        element: editor
      })
    );

    Css.setAll(inlineEditor.element(), {
      'margin-top': '300px',
      height: '200px',
      overflow: 'scroll',
      border: '1px solid red'
    });

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(Sinks.fixedSink()),
          GuiFactory.premade(Sinks.relativeSink()),
          GuiFactory.premade(Sinks.popup()),
          GuiFactory.premade(inlineEditor)
        ]
      })
    );

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
});

