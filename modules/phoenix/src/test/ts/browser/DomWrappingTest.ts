import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Class, Html, Insert, InsertAll, Remove, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';

import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

UnitTest.test('DomWrappingTest', () => {
  const root = SugarElement.fromTag('div');
  const body = SelectorFind.first('body').getOrDie();

  Insert.append(body, root);

  const t = SugarElement.fromText;
  const s = (tag: string, xs: SugarElement[]) => {
    const element = SugarElement.fromTag(tag);
    InsertAll.append(element, xs);
    return element;
  };

  const check = (input: SugarElement[], f: (e: SugarElement) => void) => {
    const container = SugarElement.fromTag('div');
    Insert.append(root, container);
    InsertAll.append(container, input);
    f(container);
    Remove.remove(container);
  };

  const checker = (expected: string, p1: number[], offset1: number, p2: number[], offset2: number, input: SugarElement[], initial: string) => {
    check(input, (container: SugarElement) => {
      Assert.eq('', initial, Html.get(container));
      const first = c(container, p1);
      const second = c(container, p2);
      DomWrapping.wrapWith(first, offset1, second, offset2, () => {
        const basic = SugarElement.fromTag('span');
        Class.add(basic, 'me');
        return DomWrapping.nu(basic);
      });

      Assert.eq('', expected, Html.get(container));
    });
  };

  const c = (element: SugarElement, paths: number[]): SugarElement => {
    const children = Traverse.children(element);
    return paths.length === 0 ? element : c(children[paths[0]], paths.slice(1));
  };

  checker(
    '<span><span class="me">this is</span><span><span class="me"> ath</span>ens!</span></span>',
    [ 0, 0 ], 0,
    [ 0, 1, 0 ], 4,
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
    [ 0, 0 ], 0,
    [ 0, 2, 0 ], 4,
    [ s('span', [
      t('this is'),
      SugarElement.fromTag('br'),
      s('span', [
        t(' athens!')
      ])
    ]) ],
    '<span>this is<br><span> athens!</span></span>'
  );

  checker(
    '<p><span>th<span class="me">is is</span><br><span><span class="me"> athens!</span></span></span></p><p><span class=\"me\">Mo</span>re</p>',
    [ 0, 0, 0 ], 2,
    [ 1, 0 ], 2,
    [
      s('p', [
        s('span', [
          t('this is'),
          SugarElement.fromTag('br'),
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
