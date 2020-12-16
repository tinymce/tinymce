import { Arr, Future, Optional, Result, Strings } from '@ephox/katamari';
import { Class, SugarElement, Value } from '@ephox/sugar';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { TypeaheadData } from 'ephox/alloy/ui/types/TypeaheadTypes';

import * as DemoRenders from './forms/DemoRenders';

/* eslint-disable no-console */

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const dataset = Arr.map([
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
  ], (s) => ({
    value: s,
    text: Strings.capitalize(s)
  }));

  const lazySink = () => Result.value(sink);

  const sketchTypeahead = (model: {
    selectsOver: boolean;
    getDisplayText: (data: TypeaheadData) => string;
    populateFromBrowse: boolean;
  }) => Typeahead.sketch({
    minChars: 1,
    lazySink,

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

    initialData: { value: 'bison', meta: { text: 'Bison' }},
    model,

    fetch: (input) => {
      const inputValue = Value.get(input.element);
      console.log('text', inputValue);
      const matching: DemoRenders.DemoItems[] = Arr.bind(dataset, (d) => {
        const lText = d.text.toLowerCase();
        const index = lText.indexOf(inputValue.toLowerCase());
        if (index > -1) {

          const html = d.text.substring(0, index) + '<strong>' + d.text.substring(index, index + inputValue.length) + '</strong>' +
              d.text.substring(index + inputValue.length);
          return [
            {
              type: 'item',
              data: {
                value: d.value,
                meta: {
                  'text': d.text,
                  html,
                  'meta-demo-content': 'caterpillar',
                  'item-class': 'class-' + d.value
                }
              }
            }
          ];
        } else {
          return [ ];
        }
      });

      const matches = matching.length > 0 ? matching : [
        { type: 'separator', text: 'No items' } as DemoRenders.DemoSeparatorItem
      ];

      const future = Future.pure(matches.slice(0, 5));
      return future.map((items) => {
        const menu = DemoRenders.menu({
          value: 'blah.value',
          items: Arr.map(items, DemoRenders.item)
        });
        return Optional.some(TieredMenu.singleData('blah', menu));
      });
    },
    onExecute: (sandbox, item, _itemValue) => {
      const value = Representing.getValue(item);
      console.log('*** typeahead menu demo execute on: ', value, ' ***');
      return Optional.some(true);
    }
  });

  HtmlDisplay.section(gui,
    'An example of a typeahead component',
    Container.sketch({
      components: [
        sketchTypeahead({
          selectsOver: true,
          getDisplayText: (itemData) => itemData.meta && itemData.meta.text ? itemData.meta.text : 'No.text',
          populateFromBrowse: true
        }),

        sketchTypeahead({
          selectsOver: false,
          getDisplayText: (itemData) => itemData.value,
          populateFromBrowse: true
        }),

        sketchTypeahead({
          selectsOver: false,
          getDisplayText: (itemData) => itemData.value,
          populateFromBrowse: false
        })
      ]
    })
  );
};
