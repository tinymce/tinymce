test(
  'GatherTest',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.rye.Rye',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Option, Rye, Element, Insert, InsertAll, SelectorFind) {

    

    var body = SelectorFind.first('body').getOrDie();
    var div = Element.fromTag('div');
    Insert.append(body, div);

    var block = Element.fromTag('div');
    var a = Element.fromTag('span');
    var b = Element.fromTag('span');
    var c = Element.fromTag('span');
    var d = Element.fromTag('span');
    var e = Element.fromTag('span');
    var f = Element.fromTag('span');
    var ta = Element.fromText('really ');
    var tb = Element.fromText('other ');
    var tc = Element.fromText('');
    var td = Element.fromText('');
    var te = Element.fromText('word');
    var tf = Element.fromText(' some');
    var tg = Element.fromText('a');

    InsertAll.append(div, [block, tg]);
    InsertAll.append(block, [a, d]);
    InsertAll.append(a, [ta, b, c]);
    InsertAll.append(b, [tb, tc]);
    Insert.append(c, td);
    InsertAll.append(d, [e, f]);
    Insert.append(e, te);
    Insert.append(f, tf);

    assert.eq('<div><span>really <span>other </span><span></span></span><span><span>word</span><span> some</span></span></div>a', div.dom().innerHTML);

    var check = function (left, right, element, offset) {
      var rleft = Rye.left(element, offset);
      var rright = Rye.right(element, offset);
      assert.eq(true, rleft.equals(left));
      assert.eq(true, rright.equals(right));
    };

    check(Option.some('a'), Option.some('l'), ta, 3);
    check(Option.some(' '), Option.some('o'), tb, 0);
    check(Option.some(' '), Option.some('w'), te, 0);
    check(Option.some(' '), Option.some('w'), tb, 6);
    check(Option.some('e'), Option.none(), tf, 5);

  }
);
