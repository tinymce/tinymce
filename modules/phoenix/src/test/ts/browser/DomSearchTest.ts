import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Html, Insert, InsertAll, Remove, SugarElement } from '@ephox/sugar';

import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

UnitTest.test('DomSearchTest', () => {
  const body = SugarElement.fromDom(document.body);
  const container = SugarElement.fromTag('div');
  Insert.append(body, container);

  const check = (expected: string, rawTexts: string[], words: string[]) => {
    const elements = Arr.map(rawTexts, (x) => {
      return SugarElement.fromText(x);
    });

    Remove.empty(container);
    InsertAll.append(container, elements);

    const snapshots = DomSearch.safeWords(elements, words, Fun.never);

    Arr.each(snapshots, (x) => {
      DomWrapping.wrapper(x.elements, () => {
        const span = SugarElement.fromTag('span');
        Attribute.set(span, 'data-word', x.word);
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
