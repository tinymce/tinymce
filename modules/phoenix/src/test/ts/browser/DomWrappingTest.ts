import { assert, UnitTest } from '@ephox/bedrock-client';
import { Class, Element, Html, Insert, InsertAll, Remove, SelectorFind, Traverse } from '@ephox/sugar';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

UnitTest.test('DomWrappingTest', function () {
  const root = Element.fromTag('div');
  const body = SelectorFind.first('body').getOrDie();

  Insert.append(body, root);

  const t = Element.fromText;
  const s = function (tag: string, xs: Element[]) {
    const element = Element.fromTag(tag);
    InsertAll.append(element, xs);
    return element;
  };

  const check = function (input: Element[], f: (e: Element) => void) {
    const container = Element.fromTag('div');
    Insert.append(root, container);
    InsertAll.append(container, input);
    f(container);
    Remove.remove(container);
  };

  const checker = function (expected: string, p1: number[], offset1: number, p2: number[], offset2: number, input: Element[], initial: string) {
    check(input, function (container: Element) {
      assert.eq(initial, Html.get(container));
      const first = c(container, p1);
      const second = c(container, p2);
      DomWrapping.wrapWith(first, offset1, second, offset2, function () {
        const basic = Element.fromTag('span');
        Class.add(basic, 'me');
        return DomWrapping.nu(basic);
      });

      assert.eq(expected, Html.get(container));
    });
  };

  const c = function (element: Element, paths: number[]): Element {
    const children = Traverse.children(element);
    return paths.length === 0 ? element : c(children[paths[0]], paths.slice(1));
  };

  checker(
    '<span><span class="me">this is</span><span><span class="me"> ath</span>ens!</span></span>',
    [0, 0], 0,
    [0, 1, 0], 4,
    [
      s('span', [
        t('this is'),
        s('span', [
          t(' athens!')
        ])
      ])
    ],
    '<span>this is<span> athens!</span></span>'
  );

  checker(
    '<span><span class="me">this is</span><br><span><span class="me"> ath</span>ens!</span></span>',
    [0, 0], 0,
    [0, 2, 0], 4,
    [s('span', [
      t('this is'),
      Element.fromTag('br'),
      s('span', [
        t(' athens!')
      ])
    ])],
    '<span>this is<br><span> athens!</span></span>'
  );

  checker(
    '<p><span>th<span class="me">is is</span><br><span><span class="me"> athens!</span></span></span></p><p><span class=\"me\">Mo</span>re</p>',
    [0, 0, 0], 2,
    [1, 0], 2,
    [
      s('p', [
        s('span', [
          t('this is'),
          Element.fromTag('br'),
          s('span', [
            t(' athens!')
          ])
        ])
      ]),
      s('p', [
        t('More')
      ])
    ],
    '<p><span>this is<br><span> athens!</span></span></p><p>More</p>'
  );

  Remove.remove(root);
});
