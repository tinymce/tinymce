import { after, Assert, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Html, Insert, InsertAll, Remove, SugarElement } from '@ephox/sugar';

import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

interface EntitiesMap {
  readonly [name: string]: string;
}

describe('browser.phoenix.api.DomSearchTest', () => {
  const body = SugarElement.fromDom(document.body);
  const container = SugarElement.fromTag('div');
  Insert.append(body, container);

  // Taken from: modules/tinymce/src/core/main/ts/api/html/Entities.ts, makes tests easier to read
  const decode = (html: string) => {
    const entityRegExp = /&#([a-z0-9]+);?|&([a-z0-9]+);/gi;
    const reverseEntities: EntitiesMap = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': `'`
    };

    return html.replace(entityRegExp, (all) => reverseEntities[all]);
  };

  after(() => Remove.remove(container));

  const check = (expected: string, rawTexts: string[], words: string[]) => {
    const elements = Arr.map(rawTexts, (x) => SugarElement.fromText(x));

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

    Assert.eq(`Asserting result for word: ${rawTexts.join('')},`, expected, decode(Html.get(container)));
  };

  it('TINY-10062: Search for text in DOM', () => {
    check('<span data-word="Sed">Sed</span>', [ 'Sed' ], [ 'Sed' ]);
    check('<span data-word="Sed">Sed</span> ut perspiciatis <span data-word="unde">u</span><span data-word="unde">nde</span>' +
      ' omnis <span data-word="iste">iste</span> natus error <span data-word="sit">sit</span> voluptatem', [ 'Sed', ' ut per', 'spiciatis u', 'nde om', 'ni', 's iste', ' natus', ' error', ' sit voluptatem' ], [ 'Sed', 'iste', 'unde', 'sit' ]);
    check('<span data-word="Sed">Sed</span> <span data-word="ut">ut</span> per', [ 'Sed', ' ut per' ], [ 'Sed', 'ut' ]);

    check(
      [
        '<span data-word="<p>"><p></span>',
        '<span data-word="Hello">Hello</span>',
        '<span data-word="World<">World<</span>/<span data-word="p>">p></span>'
      ].join(' '),
      [ '<p> Hello World</p>' ],
      [ '<p>', 'Hello', 'World<', 'p>' ]
    );

    // No word boundaries before the space between the text within the element, so we just pass <p>Hello
    check(
      [
        '<span data-word="<p>Hello"><p>Hello</span>',
        '<span data-word="World<">World<</span>/<span data-word="p>">p></span>'
      ].join(' '),
      [ '<p>Hello World</p>' ],
      [ '<p>Hello', 'World<', 'p>' ]
    );

    check(
      [
        '<span data-word="<p>"><p></span>',
        '<span data-word="Hello">Hello</span>',
        '<span data-word="World">World</span>',
        '<span data-word="<"><</span>/<span data-word="p>">p></span>'
      ].join(' '),
      [ '<p> Hello World </p>' ],
      [ '<p>', 'Hello', 'World', '<', 'p>' ]
    );

    check(
      [
        '<span data-word="<p>Hello"><p>Hello</span>',
        '<span data-word="World">World</span>',
        '<span data-word="<"><</span>/<span data-word="p>">p></span>'
      ].join(' '),
      [ '<p>Hello World </p>' ],
      [ '<p>Hello', 'World', '<', 'p>' ]
    );

    check(
      [
        'Test.',
        '[<span data-word="IF:INTEXT">IF:INTEXT</span>]Test2',
        '[/<span data-word="IF">IF</span>]'
      ].join(' '),
      [ 'Test. [IF:INTEXT]Test2 [/IF]' ],
      [ 'IF:INTEXT', 'IF' ]
    );

    check(
      [
        'Test.',
        '[/<span data-word="IF">IF</span>]Test2',
        '[<span data-word="IF:INTEXT">IF:INTEXT</span>]'
      ].join(' '),
      [ 'Test. [/IF]Test2 [IF:INTEXT]' ],
      [ 'IF', 'IF:INTEXT' ]
    );
  });
});
