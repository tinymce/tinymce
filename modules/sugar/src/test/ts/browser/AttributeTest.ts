import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import Div from 'ephox/sugar/test/Div';

type AttrFn<K, V> = (element: SugarElement<HTMLElement>, k: K, v: V) => void;
type InvalidValue<V> = V | null | undefined | {};

UnitTest.test('AttributeTest', () => {
  const c = Div();

  const checkErr = <K, V>(f: AttrFn<K, V>, element: SugarElement<Node>, k: K, v?: InvalidValue<V>) => {
    try {
      f(element as SugarElement<HTMLElement>, k, v as V);
    } catch (e) {
      // expected
      return;
    }
    Assert.fail('function did not throw an error');
  };

  const checkTypeErr = (e: SugarElement<Node>) => {
    checkErr(Attribute.get, e, 'id');
    checkErr(Attribute.set, e, 'id', '');
    checkErr(Attribute.setAll, e, { id: '' });
    checkErr(Attribute.remove, e, 'id');

    // has just returns false now, no point in errors
    Assert.eq('does not have key', false, Attribute.has(e, 'id'));
  };

  const check = (k: string, v1: string, v2: string) => {
    Assert.eq('has', false, Attribute.has(c, k));
    Assert.eq('get', undefined, Attribute.get(c, k));
    KAssert.eqNone('getOpt', Attribute.getOpt(c, k));

    Attribute.set(c, k, v1);
    Assert.eq('has', true, Attribute.has(c, k));
    Assert.eq('get', v1, Attribute.get(c, k));
    KAssert.eqSome('getOpt', v1, Attribute.getOpt(c, k));

    Attribute.set(c, k, v2);
    Assert.eq('has', true, Attribute.has(c, k));
    Assert.eq('get', v2, Attribute.get(c, k));
    KAssert.eqSome('getOpt', v2, Attribute.getOpt(c, k));

    Attribute.remove(c, k);
    Assert.eq('has', false, Attribute.has(c, k));
    Assert.eq('get', undefined, Attribute.get(c, k));
    KAssert.eqNone('getOpt', Attribute.getOpt(c, k));
  };

  // setting a non-simple value
  checkErr(Attribute.set, c, 'expect-console-error--value-undefined', undefined);
  checkErr(Attribute.set, c, 'expect-console-error--value-null', null);
  checkErr(Attribute.set, c, 'expect-console-error--value-object', {});

  // passing things that don't have attributes
  checkTypeErr(SugarElement.fromText(''));
  checkTypeErr(SugarElement.fromHtml<Comment>('<!--a-->'));
  checkTypeErr(SugarElement.fromDom({} as Node));

  check('name', 'black', 'blue');

  Assert.eq('hasNone', true, Attribute.hasNone(SugarElement.fromHtml<HTMLDivElement>('<div></div>')));
  Assert.eq('hasNone', true, Attribute.hasNone(SugarElement.fromHtml<HTMLDivElement>('<div>Dog</div>')));
  Assert.eq('hasNone', true, Attribute.hasNone(SugarElement.fromHtml<HTMLDivElement>('<div><span id="cat"></span></div>')));
  Assert.eq('hasNone', false, Attribute.hasNone(SugarElement.fromHtml<HTMLDivElement>('<div name="container"><span id="cat"></span></div>')));

  /*
   * Note: IE returns true for an empty style attribute.
   * Assert.eq(false, Attribute.hasNone(SugarElement.fromHtml<HTMLDivElement>('<div style=""><span id="cat"></span></div>')));
   *
   */
  Assert.eq('hasNone', false, Attribute.hasNone(SugarElement.fromHtml<HTMLDivElement>('<div style="display: block;"><span id="cat"></span></div>')));

  Assert.eq('clone', { id: 'cat' }, Attribute.clone(SugarElement.fromHtml<HTMLSpanElement>('<span id="cat"></span>')));
  Assert.eq('clone', { 'name': 'foo', 'data-ephox-foo': 'bar' }, Attribute.clone(SugarElement.fromHtml<HTMLSpanElement>('<span name="foo" data-ephox-foo="bar"></span>')));

  Attribute.set(c, 'tabindex', -1);
  Assert.eq('get', '-1', Attribute.get(c, 'tabindex'));

  Attribute.setOptions(c, {
    tabindex: Optional.none(),
    src: Optional.some('custom')
  });
  Assert.eq('setOptions - none', false, Attribute.has(c, 'tabindex'));
  Assert.eq('setOptions - some', 'custom', Attribute.get(c, 'src'));
});
