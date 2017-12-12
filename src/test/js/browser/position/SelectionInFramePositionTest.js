import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import Writer from 'ephox/alloy/frame/Writer';
import ChainUtils from 'ephox/alloy/test/ChainUtils';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import Sinks from 'ephox/alloy/test/Sinks';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { WindowSelection } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('SelectionInFramePositionTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    var content = '';
    for (var i = 0; i < 20; i++) {
      content += '<p>paragraph ' + i + '</p>';
    }

    var frame = Element.fromTag('iframe');
    var onload = DomEvent.bind(frame, 'load', function () {
      onload.unbind();
      Writer.write(frame, '<html><body contenteditable="true">' + content + '</body></html>');
    });

    var classicEditor = GuiFactory.build(
      GuiFactory.external({
        uid: 'classic-editor',
        element: frame
      })
    );

    Css.set(classicEditor.element(), 'margin-top', '300px');

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(Sinks.fixedSink()),
          GuiFactory.premade(Sinks.relativeSink()),
          GuiFactory.premade(Sinks.popup()),
          GuiFactory.premade(classicEditor)
        ]
      })
    );

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
        return WindowSelection.getExact(win).fold(function () {
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
              NamedChain.direct('range2', Chain.binder(function (range2) {
                var start = range2.start();
                // NOTE: Safari likes to select the text node.
                var optElement = Node.isText(start) ? Traverse.parent(start) : Option.some(start);
                return optElement.map(function (elem) {
                  elem.dom().scrollIntoView();
                  return Scroll.get(
                    Traverse.owner(elem)
                  );
                });
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
});

