import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import {
  Attribute, Compare, Css, Insert, PredicateFilter, Remove, SelectorFilter, SugarBody, SugarElement, SugarNode, SugarText, Traverse, Truncate
} from '@ephox/sugar';
import * as fc from 'fast-check';

import * as Arbitraries from 'ephox/agar/api/Arbitraries';
import * as Assertions from 'ephox/agar/api/Assertions';
import * as Generators from 'ephox/agar/api/Generators';

UnitTest.test('Arbitraries Test', () => {
  const assertProperty = (label: string, element: SugarElement<Node>, assertion: (node: SugarElement<Node>) => boolean): boolean => {
    Insert.append(SugarBody.body(), element);

    const self = SugarNode.isElement(element) ? [ element ] : [];
    const descendants = SelectorFilter.descendants(element, '*').concat(self);
    const failing = Arr.filter(descendants, assertion);
    Remove.remove(element);
    if (failing.length > 0) {
      throw new Error('These elements did not satisfy property ' + label + ': \n' +
        Arr.map(failing, Truncate.getHtml).join('\n'));
    }
    return true;
  };

  const checkProperty = <T>(label: string, arb: fc.Arbitrary<T>, f: (val: T) => boolean | void) => {
    try {
      // Increase when doing proper testing.
      fc.assert(fc.property(arb, f), { numRuns: 3 });
      // eslint-disable-next-line no-console
      console.log('✓ ' + label);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('x ' + label);
      throw e;
    }
  };

  checkProperty('Text nodes should have node type 3', Arbitraries.content<Text>('netext'), (textnode) => {
    Assertions.assertEq(
      'Node type of "netext"',
      3,
      SugarNode.type(textnode)
    );
    return true;
  });

  checkProperty('Zerowidth text nodes should have node type 3 and be uFEFF', Arbitraries.content<Text>('zerowidth'), (textnode) => {
    Assertions.assertEq('Node type of "zerowidth"', 3, SugarNode.type(textnode));
    Assertions.assertEq('Text value of zerowidth', '\uFEFF', SugarText.get(textnode));
    return true;
  });

  checkProperty('Zerowidths text nodes should have node type 3 and be uFEFF or u200B', Arbitraries.content<Text>('zerowidths'), (textnode) => {
    Assertions.assertEq('Node type of "zerowidths"', 3, SugarNode.type(textnode));
    Assertions.assertEq('Zerowidths cursor value: ' + SugarText.get(textnode), true, Arr.contains([ '\uFEFF', '\u200B' ], SugarText.get(textnode)));
    return true;
  });

  checkProperty('Spans should have attributes and styles', Arbitraries.content('test-data', {
    'test-data': {
      recursionDepth: 1,
      type: 'composite',
      tags: {
        span: { weight: 1.0, attributes: { 'data-a': 'b' }, styles: { color: 'red' }}
      },
      components: {
        'test-data': { weight: 1.0, useDepth: true }
      }
    }
  }), (data: SugarElement<HTMLElement>) =>
    assertProperty('style and attr api', data, (elem) => SugarNode.isTag('span')(elem) && (
      Attribute.get(elem, 'data-a') !== 'b' || Css.getRaw(elem, 'color').getOr('') !== 'red'
    )));

  checkProperty('Testing out attribute and style decorators', Arbitraries.content('test-data', {
    'test-data': {
      type: 'leaf',
      tag: 'span',
      attributes: Generators.chooseOne([
        { weight: 1.0, property: 'data-custom', value: fc.constant('hi') },
        { weight: 2.0, property: 'contenteditable', value: fc.constant('true') }
      ]),
      styles: Generators.chooseOne([
        { weight: 1.0, property: 'color', value: Generators.hexColor },
        { weight: 0.5, property: 'visibility', value: fc.constantFrom('hidden', 'visible') }
      ])
    }
  }), (leaf: SugarElement<HTMLElement>) => {
    const hasDataCustom = Attribute.get(leaf, 'data-custom') === 'hi';
    const hasContentEditable = Attribute.get(leaf, 'contenteditable') === 'true';
    const hasColor = Css.getRaw(leaf, 'color').isSome();
    const hasVisibility = Css.getRaw(leaf, 'visibility').isSome();
    return (
      !(hasDataCustom && hasContentEditable) && (hasDataCustom || hasContentEditable)
    ) && (
      !(hasColor && hasVisibility) && (hasColor || hasVisibility)
    ) && (
      Traverse.firstChild(leaf).isNone()
    );
  });

  checkProperty('Testing out attribute and style decorators (enforce)', Arbitraries.content('test-data', {
    'test-data': {
      type: 'leaf',
      tag: 'span',
      attributes: Generators.enforce({
        'data-custom': 'enforced-hi',
        'contenteditable': 'false'
      }),
      styles: Generators.enforce({
        color: 'blue',
        visibility: 'hidden'
      })
    }
  }), (leaf: SugarElement<HTMLElement>) => {
    Assertions.assertEq('data-custom should be "hi"', 'enforced-hi', Attribute.get(leaf, 'data-custom'));
    Assertions.assertEq('contenteditable should be "false"', 'false', Attribute.get(leaf, 'contenteditable'));
    Assertions.assertEq('should have color: blue', 'blue', Css.getRaw(leaf, 'color').getOrDie('Must have color'));
    Assertions.assertEq('should have visibility: hidden', 'hidden', Css.getRaw(leaf, 'visibility').getOrDie('Must have visibility'));
    return true;
  });

  checkProperty('Comment nodes should have node type 8', Arbitraries.content('comment'), (comment: SugarElement<Comment>) => {
    Assertions.assertEq('Node type of "comment"', 8, SugarNode.type(comment));
    return true;
  });

  checkProperty('Whitespace should be " ", "\n", or "br"', Arbitraries.content('whitespace'), (element: SugarElement<Node>) => {
    if (SugarNode.isText(element)) {
      Assertions.assertEq('Text content of "whitespace"', '', SugarText.get(element).trim());
      return true;
    } else if (SugarNode.isElement(element)) {
      Assertions.assertEq('Node name of "whitespace"', 'br', SugarNode.name(element));
      return true;
    } else {
      return false;
    }
  });

  checkProperty('Inline elements should have display: inline', Arbitraries.content('inline'), (element: SugarElement<HTMLElement>) =>
    // console.log('inline.element', Html.getOuter(element));
    assertProperty('(display === inline)', element, (elem) =>
      SugarNode.isElement(elem) && Css.get(elem, 'display') !== 'inline' || Arr.contains([ 'span-underline', 'span-strikethrough' ], SugarNode.name(elem))
    )
  );

  checkProperty('Container elements', Arbitraries.content('container'), (element: SugarElement<HTMLElement>) =>
    assertProperty('if display === inline, no descendants have display block', element, (elem) => {
      if (SugarNode.isElement(elem) && Css.get(elem, 'display') === 'inline') {
        const descendants = PredicateFilter.descendants(elem, (kin) => SugarNode.isElement(kin) && Css.get(kin, 'display') !== 'inline');
        return descendants.length > 0;
      } else {
        return false;
      }
    })
  );

  checkProperty('Formatting elements should only contain (display === inline)', Arbitraries.content('formatting'), (section: SugarElement<HTMLElement>) =>
    assertProperty(
      'nothing should have display block inside a formatting element',
      section,
      (elem) => !Compare.eq(section, elem) && SugarNode.isElement(elem) && Css.get(elem, 'display') !== 'inline'
    )
  );

  checkProperty('Table cell elements', Arbitraries.content('tablecell'), (element: SugarElement<HTMLTableCellElement>) => {
    Assertions.assertEq('Cells should be th|td', true, [ 'td', 'th' ].indexOf(SugarNode.name(element)) > -1);
    return true;
  });

  checkProperty('Table row elements', Arbitraries.content('tr'), (element: SugarElement<HTMLTableRowElement>) => {
    Assertions.assertEq('Table rows must be <tr>', 'tr', SugarNode.name(element));
    return true;
  });

  checkProperty('Table body elements', Arbitraries.content('tbody'), (element: SugarElement<HTMLTableSectionElement>) => {
    Assertions.assertEq('Table body must be <tbody>', 'tbody', SugarNode.name(element));
    return true;
  });

  checkProperty('Table foot elements', Arbitraries.content('tfoot'), (element: SugarElement<HTMLTableSectionElement>) => {
    Assertions.assertEq('Table foot must be <tfoot>', 'tfoot', SugarNode.name(element));
    return true;
  });

  checkProperty('Table head elements', Arbitraries.content('thead'), (element: SugarElement<HTMLTableSectionElement>) => {
    Assertions.assertEq('Table head must be <thead>', 'thead', SugarNode.name(element));
    return true;
  });

  checkProperty('Table elements', Arbitraries.content('table', {
    table: {
      components: {
        thead: { chance: 1.0 },
        tfoot: { chance: 1.0 },
        tbody: { chance: 1.0 },
        caption: { chance: 1.0 }
      }
    }
  }), (element: SugarElement<HTMLTableElement>) => {
    Assertions.assertEq('Table must be <table>', 'table', SugarNode.name(element));
    Assertions.assertPresence('Checking table generator', {
      'thead': 1,
      'tbody': 1,
      'tfoot': 1,
      'root>thead': 1,
      'root>tbody': 1,
      'root>tfoot': 1
    }, element);
    const captions = SelectorFilter.descendants(element, 'caption');
    Assertions.assertEq('There should 1 caption element (chance 100%)', true, captions.length === 1);
    return true;
  });

  checkProperty('li elements', Arbitraries.content('listitem'), (element: SugarElement<HTMLLIElement>) => {
    Assertions.assertEq('List items must be <li>', 'li', SugarNode.name(element));
    // console.log('li.node', Html.getOuter(element));
    return true;
  });

  checkProperty('ol and ul elements', Arbitraries.content('list'), (element: SugarElement<HTMLOListElement | HTMLUListElement>) => {
    Assertions.assertEq('Lists should be ol|ul', true, [ 'ol', 'ul' ].indexOf(SugarNode.name(element)) > -1);
    return true;
  });

  /*
  This is not a test ... just example code
  Pipeline.async({}, [
    PropertySteps.sAsyncProperty(`Let's see a visible selection`, [
      Arbitraries.scenario('table', {}, {})
    ], Step.stateful(function (scenario, next, die) {
        Insert.append(SugarBody.body(), scenario.root);

        // // Not sure how to handle window selection ... will do it without fussy for now.
        const selection = window.getSelection();
        const rng = document.createRange();
        rng.setStart(scenario.selection.start.dom, scenario.selection.soffset);
        rng.setEnd(scenario.selection.finish.dom, scenario.selection.foffset);
        selection.removeAllRanges();

        Assertions.assertEq('There should be no blockquotes', 0, scenario.root().dom.querySelectorAll('strike').length);

        // TODO: Note, this isn't going to handle backwards ranges. (Fussy does...)
        selection.addRange(rng);
        // setTimeout(function () {
        Remove.remove(scenario.root());
        next();
        // }, 0);
      }),
      { tests: 15 }
    )
  ], function () { success(); }, failure);
  */
});
