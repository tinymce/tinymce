import * as Attr from 'ephox/sugar/api/properties/Attr';
import Element from 'ephox/sugar/api/node/Element';
import Div from 'ephox/sugar/test/Div';
import { UnitTest, assert } from '@ephox/bedrock';
import { Node } from '@ephox/dom-globals';

UnitTest.test('AttrTest', function () {
  const c = Div();

  const checkErr = function (f, element, k, v?) {
    try {
      f(element, k, v);
    } catch (e) {
      // expected
      return;
    }
    assert.fail('function did not throw an error');
  };

  const checkTypeErr = function (e) {
    checkErr(Attr.get, e, 'id');
    checkErr(Attr.set, e, 'id', '');
    checkErr(Attr.setAll, e, {id: ''});
    checkErr(Attr.remove, e, 'id');

    // has just returns false now, no point in errors
    assert.eq(false, Attr.has(e, 'id'));
  };

  const check = function (k, v1, v2) {
    assert.eq(false, Attr.has(c, k));
    assert.eq(undefined, Attr.get(c, k));
    assert.eq(true, Attr.getOpt(c, k).isNone());
    Attr.set(c, k, v1);
    assert.eq(true, Attr.has(c, k));
    assert.eq(v1, Attr.get(c, k));
    assert.eq(true, Attr.getOpt(c, k).isSome());
    assert.eq(v1, Attr.getOpt(c, k).getOr('X'));
    Attr.set(c, k, v2);
    assert.eq(true, Attr.has(c, k));
    assert.eq(v2, Attr.get(c, k));
    assert.eq(true, Attr.getOpt(c, k).isSome());
    assert.eq(v2, Attr.getOpt(c, k).getOr('X'));
    Attr.remove(c, k);
    assert.eq(false, Attr.has(c, k));
    assert.eq(undefined, Attr.get(c, k));
    assert.eq(true, Attr.getOpt(c, k).isNone());
  };

  // setting a non-simple value
  checkErr(Attr.set, c, 'expect-console-error--value-undefined', undefined);
  checkErr(Attr.set, c, 'expect-console-error--value-null', null);
  checkErr(Attr.set, c, 'expect-console-error--value-object', {});

  // passing things that don't have attributes
  checkTypeErr(Element.fromText(''));
  checkTypeErr(Element.fromHtml('<!--a-->'));
  checkTypeErr(Element.fromDom({} as Node));

  check('name', 'black', 'blue');

  assert.eq(true, Attr.hasNone(Element.fromHtml('<div></div>')));
  assert.eq(true, Attr.hasNone(Element.fromHtml('<div>Dog</div>')));
  assert.eq(true, Attr.hasNone(Element.fromHtml('<div><span id="cat"></span></div>')));
  assert.eq(false, Attr.hasNone(Element.fromHtml('<div name="container"><span id="cat"></span></div>')));

  /*
   * Note: IE returns true for an empty style attribute.
   * assert.eq(false, Attr.hasNone(Element.fromHtml('<div style=""><span id="cat"></span></div>')));
   *
   */
  assert.eq(false, Attr.hasNone(Element.fromHtml('<div style="display: block;"><span id="cat"></span></div>')));

  assert.eq({id: 'cat'}, Attr.clone(Element.fromHtml('<span id="cat"></span>')));
  assert.eq({'name': 'foo', 'data-ephox-foo': 'bar'}, Attr.clone(Element.fromHtml('<span name="foo" data-ephox-foo="bar"></span>')));

  Attr.set(c, 'tabindex', -1);
  assert.eq('-1', Attr.get(c, 'tabindex'));
});
