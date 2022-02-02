import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { Attribute, Compare, Hierarchy, Html, SelectorFind, SugarElement } from '@ephox/sugar';

import * as DomParent from 'ephox/robin/api/dom/DomParent';

UnitTest.test(
  'DomParentTest',
  () => {
    const check = (expected: string, p: string, c: string) => {
      const container = SugarElement.fromTag('div');
      container.dom.innerHTML =
        '<ol class="one-nine" style="list-style-type: decimal;">' +
        '<li class="one">One</li>' +
        '<li class="two">Two</li>' +
        '<ol class="three-five" style="list-style-type: lower-alpha;">' +
        '<li class="three">three</li>' +
        '<li class="four">four</li>' +
        '<li class="five">five</li>' +
        '</ol>' +
        '<li class="six">six</li>' +
        '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
        '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
        '<li class="seven">seven</li>' +
        '<li class="eight">eight</li>' +
        '</ol>' +
        '<li class="nine">nine</li>' +
        '</ol>' +
        '</ol>';

      const parent = SelectorFind.descendant(container, '.' + p).getOrDie();
      const child = SelectorFind.descendant(container, '.' + c).getOrDie();
      DomParent.breakToRight(parent, child);
      Assert.eq('eq', expected, Html.get(container));
    };

    check('<ol class="one-nine" style="list-style-type: decimal;">' +
      '<li class="one">One</li>' +
      '<li class="two">Two</li>' +
      '<ol class="three-five" style="list-style-type: lower-alpha;">' +
      '<li class="three">three</li>' +
      '<li class="four">four</li>' +
      '<li class="five">five</li>' +
      '</ol>' +
      '<ol class="three-five" style="list-style-type: lower-alpha;">' +
      '</ol>' +
      '<li class="six">six</li>' +
      '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
      '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
      '<li class="seven">seven</li>' +
      '<li class="eight">eight</li>' +
      '</ol>' +
      '<li class="nine">nine</li>' +
      '</ol>' +
      '</ol>', 'three-five', 'five');

    check(
      '<ol class="one-nine" style="list-style-type: decimal;">' +
      '<li class="one">One</li>' +
      '<li class="two">Two</li>' +
      '<ol class="three-five" style="list-style-type: lower-alpha;">' +
      '<li class="three">three</li>' +
      '<li class="four">four</li>' +
      '<li class="five">five</li>' +
      '</ol>' +
      '<li class="six">six</li>' +
      '</ol>' +
      '<ol class="one-nine" style="list-style-type: decimal;">' +
      '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
      '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
      '<li class="seven">seven</li>' +
      '<li class="eight">eight</li>' +
      '</ol>' +
      '<li class="nine">nine</li>' +
      '</ol>' +
      '</ol>', 'one-nine', 'six');

    const checkPath = (expected: string, input: string, p: number[], c: number[]) => {
      const container = SugarElement.fromTag('div');
      container.dom.innerHTML = input;

      const parent = Hierarchy.follow(container, p).getOrDie();
      const child = Hierarchy.follow(container, c).getOrDie();
      const isTop = Fun.curry(Compare.eq, parent);
      DomParent.breakPath(child, isTop, DomParent.breakToLeft);
      Assert.eq('eq', expected, Html.get(container));
    };

    checkPath(
      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>Dog</span>' +
      '</font>' +
      '<font>' +
      '<span></span>' +
      '</font>' +
      '</div>',

      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>Dog</span>' +
      '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 0 ]);

    checkPath(
      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>' +
      'Hello' +
      '<br>' + // --- SPLIT to <font>
      '</span>' +
      '</font>' +
      '<font>' +
      '<span>' +
      'World' +
      '</span>' +
      '<span>Dog</span>' +
      '</font>' +
      '</div>',

      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>' +
      'Hello' +
      '<br>' +
      'World' +
      '</span>' +
      '<span>Dog</span>' +
      '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 1 ]);

    checkPath(
      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>' +
      'Hello' +
      '<br>' +
      'World' + // --- SPLIT to <font>
      '</span>' +
      '</font>' +
      '<font>' +
      '<span></span>' +
      '<span>Dog</span>' +
      '</font>' +
      '</div>',

      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>' +
      'Hello' +
      '<br>' +
      'World' +
      '</span>' +
      '<span>Dog</span>' +
      '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 2 ]);

    checkPath(
      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>' +
      'Hello' + // --- SPLIT to <font>
      '</span>' +
      '</font>' +
      '<font>' +
      '<span>' +
      '<br>' +
      'World' +
      '</span>' +
      '<span>Dog</span>' +
      '</font>' +
      '</div>',

      '<div>' +
      '<font>' +
      '<span>Cat</span>' +
      '<span>' +
      'Hello' +
      '<br>' +
      'World' +
      '</span>' +
      '<span>Dog</span>' +
      '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 0 ]);

    (() => {
      const check = (expected: Optional<string[]>, s: string, f: string) => {
        const container = SugarElement.fromTag('div');
        container.dom.innerHTML =
          '<ol class="one-nine" style="list-style-type: decimal;">' +
          '<li class="one">One</li>' +
          '<li class="two">Two</li>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
          '<li class="three">three</li>' +
          '<li class="four">four</li>' +
          '<li class="five">five</li>' +
          '</ol>' +
          '<li class="six">six</li>' +
          '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
          '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
          '<li class="seven">seven</li>' +
          '<li class="eight">eight</li>' +
          '</ol>' +
          '<li class="nine">nine</li>' +
          '</ol>' +
          '</ol>';

        const parent = SelectorFind.descendant(container, '.' + s).getOrDie();
        const child = SelectorFind.descendant(container, '.' + f).getOrDie();
        const subset = DomParent.subset(parent, child);

        const actual = subset.map((ss) => Arr.map(ss, (x) => Attribute.get(x, 'class')));
        const expected_ = expected.map((ss) => Arr.map<string | undefined>((ss), Fun.identity));

        KAssert.eqOptional('eq', expected_, actual);
      };

      check(Optional.some([ 'three-five' ]), 'three-five', 'five');
      check(Optional.some([ 'three-five' ]), 'five', 'three-five');
      check(Optional.some([ 'two', 'three-five' ]), 'two', 'five');
      check(Optional.some([ 'two', 'three-five', 'six', 'seven-nine' ]), 'two', 'eight');
    })();
  }
);
