import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import DomTextdata from 'ephox/robin/api/dom/DomTextdata';

UnitTest.test('DomTextdataTest', function () {
  const a = Element.fromText('alpha');
  const b = Element.fromText(' beta');
  const c = Element.fromText('');
  const d = Element.fromText(' ');
  const e = Element.fromText('epsilon');
  const f = Element.fromText('foo');

  const check = function (expected: { text: string, cursor: Option<number> }, elements: Element[], current: Element, offset: number) {
    const actual = DomTextdata.from(elements, current, offset);
    assert.eq(expected.text, actual.text());
    expected.cursor.fold(function () {
      assert.eq(true, actual.cursor().isNone(), 'Actual cursor should be none for: ' + actual.text());
    }, function (exp) {
      assert.eq(exp, actual.cursor().getOrDie('Expected an actual cursor at ' + exp));
    });
  };

  check({
    text: '',
    cursor: Option.some(0)
  }, [c], c, 0);

  check({
    text: 'alpha beta epsilonfoo',
    cursor: Option.some(13)
  }, [a, b, c, d, e, f], e, 2);
});