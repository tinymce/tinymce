import * as Attr from 'ephox/sugar/api/properties/Attr';
import Element from 'ephox/sugar/api/node/Element';
import Div from 'ephox/sugar/test/Div';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Node, Comment, HTMLDivElement, HTMLSpanElement } from '@ephox/dom-globals';
import { OptionInstances, Option } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { Testable } from '@ephox/dispute';

UnitTest.test('AttrTest', function () {
  const c = Div();

  const checkErr = function (f, element, k, v?) {
    try {
      f(element, k, v);
    } catch (e) {
      // expected
      return;
    }
    Assert.fail('function did not throw an error');
  };

  const checkTypeErr = function (e) {
    checkErr(Attr.get, e, 'id');
    checkErr(Attr.set, e, 'id', '');
    checkErr(Attr.setAll, e, {id: ''});
    checkErr(Attr.remove, e, 'id');

    // has just returns false now, no point in errors
    Assert.eq('does not have key', false, Attr.has(e, 'id'));
  };

  const check = function (k, v1, v2) {
    Assert.eq('has', false, Attr.has(c, k));
    Assert.eq('get', undefined, Attr.get(c, k));
    KAssert.eqNone('getOpt', Attr.getOpt(c, k));

    Attr.set(c, k, v1);
    Assert.eq('has', true, Attr.has(c, k));
    Assert.eq('get', v1, Attr.get(c, k));
    KAssert.eqSome('getOpt', v1, Attr.getOpt(c, k));

    Attr.set(c, k, v2);
    Assert.eq('has', true, Attr.has(c, k));
    Assert.eq('get', v2, Attr.get(c, k));
    KAssert.eqSome('getOpt', v2, Attr.getOpt(c, k));

    Attr.remove(c, k);
    Assert.eq('has', false, Attr.has(c, k));
    Assert.eq('get', undefined, Attr.get(c, k));
    KAssert.eqNone('getOpt', Attr.getOpt(c, k));
  };

  // setting a non-simple value
  checkErr(Attr.set, c, 'expect-console-error--value-undefined', undefined);
  checkErr(Attr.set, c, 'expect-console-error--value-null', null);
  checkErr(Attr.set, c, 'expect-console-error--value-object', {});

  // passing things that don't have attributes
  checkTypeErr(Element.fromText(''));
  checkTypeErr(Element.fromHtml<Comment>('<!--a-->'));
  checkTypeErr(Element.fromDom({} as Node));

  check('name', 'black', 'blue');

  Assert.eq('hasNone', true, Attr.hasNone(Element.fromHtml<HTMLDivElement>('<div></div>')));
  Assert.eq('hasNone', true, Attr.hasNone(Element.fromHtml<HTMLDivElement>('<div>Dog</div>')));
  Assert.eq('hasNone', true, Attr.hasNone(Element.fromHtml<HTMLDivElement>('<div><span id="cat"></span></div>')));
  Assert.eq('hasNone', false, Attr.hasNone(Element.fromHtml<HTMLDivElement>('<div name="container"><span id="cat"></span></div>')));

  /*
   * Note: IE returns true for an empty style attribute.
   * Assert.eq(false, Attr.hasNone(Element.fromHtml<HTMLDivElement>('<div style=""><span id="cat"></span></div>')));
   *
   */
  Assert.eq('hasNone', false, Attr.hasNone(Element.fromHtml<HTMLDivElement>('<div style="display: block;"><span id="cat"></span></div>')));

  Assert.eq('clone', {id: 'cat'}, Attr.clone(Element.fromHtml<HTMLSpanElement>('<span id="cat"></span>')));
  Assert.eq('clone', {'name': 'foo', 'data-ephox-foo': 'bar'}, Attr.clone(Element.fromHtml<HTMLSpanElement>('<span name="foo" data-ephox-foo="bar"></span>')));

  Attr.set(c, 'tabindex', -1);
  Assert.eq('get', '-1', Attr.get(c, 'tabindex'));
});
