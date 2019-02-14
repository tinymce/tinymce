import { UnitTest, assert } from '@ephox/bedrock';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';
import { Insert, InsertAll, Remove, Element, Class, Html, SelectorFind, Traverse } from '@ephox/sugar';

UnitTest.test('DomWrappingTest', function () {
  var root = Element.fromTag('div');
  var body = SelectorFind.first('body').getOrDie();

  Insert.append(body, root);

  var t = Element.fromText;
  var s = function (tag, xs) {
    var element = Element.fromTag(tag);
    InsertAll.append(element, xs);
    return element;
  };

  var check = function (input, f) {
    var container = Element.fromTag('div');
    Insert.append(root, container);
    InsertAll.append(container, input);
    f(container);
    Remove.remove(container);
  };

  var checker = function (expected, p1, offset1, p2, offset2, input, initial) {
    check(input, function (container) {
      assert.eq(initial, Html.get(container));
      var first = c(container, p1);
      var second = c(container, p2);
      DomWrapping.wrapWith(first, offset1, second, offset2, function () {
        var basic = Element.fromTag('span');
        Class.add(basic, 'me');
        return DomWrapping.nu(basic);
      });

      assert.eq(expected, Html.get(container));
    });
  };

  var c = function (element, paths) {
    var children = Traverse.children(element);
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