import { Arr, Future, Option, Result } from '@ephox/katamari';
import { Class, Element, Value } from '@ephox/sugar';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import TieredMenu from 'ephox/alloy/api/ui/TieredMenu';
import Typeahead from 'ephox/alloy/api/ui/Typeahead';
import DemoSink from 'ephox/alloy/demo/DemoSink';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import DemoRenders from './forms/DemoRenders';

export default <any> function () {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const dataset = [
    'ant',
    'bison',
    'cat',
    'dog',
    'elephant',
    'frog',
    'goose',
    'hyena',
    'iguana',
    'jaguar',
    'koala',
    'lemur',
    'mongoose',
    'narwhal',
    'orca',
    'pig',
    'quoll',
    'robin',
    'snake',
    'tern',
    'uakari',
    'viper',
    'wombat',
    'x',
    'yak',
    'zebra'
  ];

  const lazySink = function () {
    return Result.value(sink);
  };

  HtmlDisplay.section(gui,
    'An example of a typeahead component',
    Typeahead.sketch({
      minChars: 1,
      lazySink,
      dom: {
        tag: 'input'
      },

      parts: {
        menu: {
          markers: DemoRenders.tieredMarkers(),
          dom: {
            tag: 'div'
          }
        }
      },

      markers: {
        openClass: 'demo-typeahead-open'
      },

      fetch (input) {
        const text = Value.get(input.element());
        console.log('text', text);
        const matching = Arr.bind(dataset, function (d) {
          const index = d.indexOf(text.toLowerCase());
          if (index > -1) {
            const html = d.substring(0, index) + '<b>' + d.substring(index, index + text.length) + '</b>' +
              d.substring(index + text.length);
            return [ { 'type': 'item', 'data': { value: d, text: d, html }, 'item-class': 'class-' + d } ];
          } else {
            return [ ];
          }
        });

        const matches = matching.length > 0 ? matching : [
          { type: 'separator', text: 'No items' }
        ];

        const future = Future.pure(matches.slice(0, 5));
        return future.map(function (items) {
          const menu = DemoRenders.menu({
            value: 'blah.value',
            items: Arr.map(items, DemoRenders.item)
          });
          return TieredMenu.singleData('blah', menu);
        });
      },
      onExecute (sandbox, item, itemValue) {
        const value = Representing.getValue(item);
        console.log('*** typeahead menu demo execute on: ' + value + ' ***');
        return Option.some(true);
      }
    })
  );
};