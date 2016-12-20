test(
  'DocumentPositionTest',

  [
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.dom.DocumentPosition',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove'
  ],

  function (Body, DocumentPosition, Element, Insert, InsertAll, Remove) {
    var container = Element.fromTag('div');
    var p1 = Element.fromTag('p');
    var p1t1 = Element.fromText('p1text');
    var p1t2 = Element.fromText('p2text');
    var p1s1 = Element.fromTag('span');
    var p1s1t1 = Element.fromText('spantext');

    /* Note: this looks like
     * <div>
     *   <p>
     *     p1text
     *     p2text
     *     <span>
     *       spantext
     *     </span>
     *   </p>
     * </div>
     */

    InsertAll.append(container, [ p1 ]);
    InsertAll.append(p1, [ p1t1, p1t2, p1s1 ]);
    InsertAll.append(p1s1, [ p1s1t1 ]);

    Insert.append(Body.body(), container);

    var check = function (expected, start, soffset, finish, foffset, msg) {
      assert.eq(expected, DocumentPosition.after(start, soffset, finish, foffset), msg);
    };

    check(true, container, 1, p1t1, ''.length, 'Selection from (div,end) -> (p1t1,0) should be RTL');
    check(false, p1t1, 0, container, 1, 'Selection from (p1t1,0) -> (div,end) should be LTR');

    check(true, container, 1, p1t1, 'p1text'.length, 'Selection from (div,end) -> (p1t1,end) should be RTL');
    check(false, p1t1, 'p1text'.length, container, 1, 'Selection from (p1t1,end) -> (div,end) should be LTR');

    check(true, container, 1, p1s1t1, 'spantext'.length, 'Selection from (div,end) -> (p1s1t1,end) should be RTL');
    check(false, p1s1t1, 'spantext'.length, container, 1, 'Selection from  (p1s1t1,end) -> (div,end) should be LTR');

    check(true, container, 1, p1, 3, 'Selection from (div,end) -> (p,end) should be RTL');
    check(false, p1, 3, container, 1, 'Selection from (p,end) -> (div,end) should be LTR');

    Remove.remove(container);
  }
);