import { assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Attr, Element, Html, Insert, InsertAll, Remove } from '@ephox/sugar';
import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

UnitTest.test('DomSearchTest', function () {
  const body = Element.fromDom(document.body);
  const container = Element.fromTag('div');
  Insert.append(body, container);

  const check = function (expected: string, rawTexts: string[], words: string[]) {
    const elements = Arr.map(rawTexts, function (x) {
      return Element.fromText(x);
    });

    Remove.empty(container);
    InsertAll.append(container, elements);

    const snapshots = DomSearch.safeWords(elements, words, Fun.constant(false));

    Arr.each(snapshots, function (x) {
      DomWrapping.wrapper(x.elements(), function () {
        const span = Element.fromTag('span');
        Attr.set(span, 'data-word', x.word());
        return DomWrapping.nu(span);
      });
    });

    assert.eq(expected, Html.get(container));
  };

  check('<span data-word="Sed">Sed</span>', [ 'Sed' ], [ 'Sed' ]);
  check('<span data-word="Sed">Sed</span> ut perspiciatis <span data-word="unde">u</span><span data-word="unde">nde</span>' +
    ' omnis <span data-word="iste">iste</span> natus error <span data-word="sit">sit</span> voluptatem', [ 'Sed', ' ut per', 'spiciatis u', 'nde om', 'ni', 's iste', ' natus', ' error', ' sit voluptatem' ], [ 'Sed', 'iste', 'unde', 'sit' ]);
  check('<span data-word="Sed">Sed</span> <span data-word="ut">ut</span> per', [ 'Sed', ' ut per' ], [ 'Sed', 'ut' ]);

  Remove.remove(container);
});
