import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Attr, Compare, Element, Hierarchy, Html, SelectorFind } from '@ephox/sugar';
import DomParent from 'ephox/robin/api/dom/DomParent';

UnitTest.test(
  'DomParentTest',
  function () {
    const check = function (expected: string, p: string, c: string) {
      const container = Element.fromTag('div');
      container.dom().innerHTML =
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
      assert.eq(expected, Html.get(container));
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

    const checkPath = function (expected: string, input: string, p: number[], c: number[]) {
      const container = Element.fromTag('div');
      container.dom().innerHTML = input;

      const parent = Hierarchy.follow(container, p).getOrDie();
      const child = Hierarchy.follow(container, c).getOrDie();
      const isTop = Fun.curry(Compare.eq, parent);
      DomParent.breakPath(child, isTop, DomParent.breakToLeft);
      assert.eq(expected, Html.get(container));
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
      [0, 0], [0, 0, 1, 0]);

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
      [0, 0], [0, 0, 1, 1]);

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
      [0, 0], [0, 0, 1, 2]);

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
      [0, 0], [0, 0, 1, 0]);

    (function () {
      const check = function (expected: Option<string[]>, s: string, f: string) {
        const container = Element.fromTag('div');
        container.dom().innerHTML =
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
        expected.fold(function () {
          assert.eq(true, subset.isNone());
        }, function (exp) {
          subset.fold(function () {
            assert.fail('Expected some, was none');
          }, function (ss) {
            assert.eq(exp, Arr.map(ss, function (x) { return Attr.get(x, 'class'); }));
          });
        });
      };

      check(Option.some(['three-five']), 'three-five', 'five');
      check(Option.some(['three-five']), 'five', 'three-five');
      check(Option.some(['two', 'three-five']), 'two', 'five');
      check(Option.some(['two', 'three-five', 'six', 'seven-nine']), 'two', 'eight');
    })();
  }
);