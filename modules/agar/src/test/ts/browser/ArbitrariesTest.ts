import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import {
  Attr,
  Body,
  Compare,
  Css,
  Insert,
  Node,
  PredicateFilter,
  Remove,
  SelectorFilter,
  Text,
  Traverse,
  Truncate
} from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';
import * as Arbitraries from 'ephox/agar/api/Arbitraries';
import * as Assertions from 'ephox/agar/api/Assertions';
import * as Generators from 'ephox/agar/api/Generators';

UnitTest.test('Arbitraries Test', () => {
  const assertProperty = (label, element, assertion) => {
    Insert.append(Body.body(), element);

    const self = Node.isElement(element) ? [element] : [];
    const descendants = SelectorFilter.descendants(element, '*').concat(self);
    const failing = Arr.filter(descendants, assertion);
    Remove.remove(element);
    if (failing.length > 0) {
      return 'These elements did not satisfy property ' + label + ': \n' +
        Arr.map(failing, Truncate.getHtml).join('\n');
    }
    return true;
  };

  const checkProperty = (label, arb, f) => {
    // Increase when doing proper testing.
    Jsc.syncProperty(label, [arb], f, {tests: 3});
  };

  checkProperty('Text nodes should have node type 3', Arbitraries.content('netext'), (textnode) => {
    Assertions.assertEq(
      'Node type of "netext"',
      3,
      Node.type(textnode)
    );
    return true;
  });

  checkProperty('Zerowidth text nodes should have node type 3 and be uFEFF', Arbitraries.content('zerowidth'), (textnode) => {
    Assertions.assertEq('Node type of "zerowidth"', 3, Node.type(textnode));
    Assertions.assertEq('Text value of zerowidth', '\uFEFF', Text.get(textnode));
    return true;
  });

  checkProperty('Zerowidths text nodes should have node type 3 and be uFEFF or u200B', Arbitraries.content('zerowidths'), (textnode) => {
    Assertions.assertEq('Node type of "zerowidths"', 3, Node.type(textnode));
    Assertions.assertEq('Zerowidths cursor value: ' + Text.get(textnode), true, Arr.contains(['\uFEFF', '\u200B'], Text.get(textnode)));
    return true;
  });

  checkProperty('Spans should have attributes and styles', Arbitraries.content('test-data', {
    'test-data': {
      recursionDepth: 1,
      type: 'composite',
      tags: {
        span: {weight: 1.0, attributes: {'data-a': 'b'}, styles: {color: 'red'}}
      },
      components: {
        'test-data': {weight: 1.0, useDepth: true}
      }
    }
  }), (data) =>
    assertProperty('style and attr api', data, (elem) => Node.name(elem) === 'span' && (
      Attr.get(elem, 'data-a') !== 'b' || Css.getRaw(elem, 'color').getOr('') !== 'red'
    )));

  checkProperty('Testing out attribute and style decorators', Arbitraries.content('test-data', {
    'test-data': {
      type: 'leaf',
      tag: 'span',
      attributes: Generators.chooseOne([
        {weight: 1.0, property: 'data-custom', value: Jsc.constant('hi').generator},
        {weight: 2.0, property: 'contenteditable', value: Jsc.constant('true').generator}
      ]),
      styles: Generators.chooseOne([
        {weight: 1.0, property: 'color', value: Generators.hexColor},
        {weight: 0.5, property: 'visibility', value: Jsc.elements(['hidden', 'visible']).generator}
      ]),
      components: {}
    }
  }), (leaf) => {
    const hasDataCustom = Attr.get(leaf, 'data-custom') === 'hi';
    const hasContentEditable = Attr.get(leaf, 'contenteditable') === 'true';
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
      }),
      components: {}
    }
  }), (leaf) => {
    Assertions.assertEq('data-custom should be "hi"', 'enforced-hi', Attr.get(leaf, 'data-custom'));
    Assertions.assertEq('contenteditable should be "false"', 'false', Attr.get(leaf, 'contenteditable'));
    Assertions.assertEq('should have color: blue', 'blue', Css.getRaw(leaf, 'color').getOrDie('Must have color'));
    Assertions.assertEq('should have visibility: hidden', 'hidden', Css.getRaw(leaf, 'visibility').getOrDie('Must have visibility'));
    return true;
  });

  checkProperty('Comment nodes should have node type 8', Arbitraries.content('comment'), (comment) => {
    Assertions.assertEq('Node type of "comment"', 8, Node.type(comment));
    return true;
  });

  checkProperty('Whitespace should be " ", "\n", or "br"', Arbitraries.content('whitespace'), (element) => {
    if (Node.isText(element)) {
      Assertions.assertEq('Text content of "whitespace"', '', Text.get(element).trim());
      return true;
    } else if (Node.isElement(element)) {
      Assertions.assertEq('Node name of "whitespace"', 'br', Node.name(element));
      return true;
    } else {
      return false;
    }
  });

  checkProperty('Inline elements should have display: inline', Arbitraries.content('inline'), (element) => {
    // console.log('inline.element', Html.getOuter(element));
    return assertProperty('(display === inline)', element, (elem) =>
      Css.get(elem, 'display') !== 'inline' || Arr.contains(['span-underline', 'span-strikethrough'], Node.name(elem))
    );
  });

  checkProperty('Container elements', Arbitraries.content('container'), (element) => assertProperty('if display === inline, no descendants have display block', element, (elem) => {
    if (Css.get(elem, 'display') === 'inline') {
      const descendants = PredicateFilter.descendants(elem, (kin) => Node.isElement(kin) && Css.get(kin, 'display') !== 'inline');
      return descendants.length > 0;
    } else {
      return false;
    }
  }));

  checkProperty('Formatting elements should only contain (display === inline)', Arbitraries.content('formatting'), (section) => assertProperty('nothing should have display block inside a formatting element', section, (elem) => !Compare.eq(section, elem) && Node.isElement(elem) && Css.get(elem, 'display') !== 'inline'));

  checkProperty('Table cell elements', Arbitraries.content('tablecell'), (element) => {
    Assertions.assertEq('Cells should be th|td', true, ['td', 'th'].indexOf(Node.name(element)) > -1);
    return true;
  });

  checkProperty('Table row elements', Arbitraries.content('tr'), (element) => {
    Assertions.assertEq('Table rows must be <tr>', 'tr', Node.name(element));
    return true;
  });

  checkProperty('Table body elements', Arbitraries.content('tbody'), (element) => {
    Assertions.assertEq('Table body must be <tbody>', 'tbody', Node.name(element));
    return true;
  });

  checkProperty('Table foot elements', Arbitraries.content('tfoot'), (element) => {
    Assertions.assertEq('Table foot must be <tfoot>', 'tfoot', Node.name(element));
    return true;
  });

  checkProperty('Table head elements', Arbitraries.content('thead'), (element) => {
    Assertions.assertEq('Table head must be <thead>', 'thead', Node.name(element));
    return true;
  });

  checkProperty('Table elements', Arbitraries.content('table', {
    table: {
      components: {
        thead: {chance: 1.0},
        tfoot: {chance: 1.0},
        tbody: {chance: 1.0},
        caption: {chance: 1.0}
      }
    }
  }), (element) => {
    Assertions.assertEq('Table must be <table>', 'table', Node.name(element));
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

  checkProperty('li elements', Arbitraries.content('listitem'), (element) => {
    Assertions.assertEq('List items must be <li>', 'li', Node.name(element));
    // console.log('li.node', Html.getOuter(element));
    return true;
  });

  checkProperty('ol and ul elements', Arbitraries.content('list'), (element) => {
    Assertions.assertEq('Lists should be ol|ul', true, ['ol', 'ul'].indexOf(Node.name(element)) > -1);
    return true;
  });

  /*
  This is not a test ... just example code
  Pipeline.async({}, [
    PropertySteps.sAsyncProperty('Let\'s see a visible selection', [
      Arbitraries.scenario('table', {}, {})
    ], Step.stateful(function (scenario, next, die) {
        Insert.append(Body.body(), scenario.root());

        // // Not sure how to handle window selection ... will do it without fussy for now.
        const selection = window.getSelection();
        const rng = document.createRange();
        rng.setStart(scenario.selection().start().dom(), scenario.selection().soffset());
        rng.setEnd(scenario.selection().finish().dom(), scenario.selection().foffset());
        selection.removeAllRanges();

        Assertions.assertEq('There should be no blockquotes', 0, scenario.root().dom().querySelectorAll('strike').length);

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
