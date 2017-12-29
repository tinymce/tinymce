import { UnitTest, assert } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import DomTextdata from 'ephox/robin/api/dom/DomTextdata';
import { Element } from '@ephox/sugar';

UnitTest.test('DomTextdataTest', function() {
  var a = Element.fromText('alpha');
  var b = Element.fromText(' beta');
  var c = Element.fromText('');
  var d = Element.fromText(' ');
  var e = Element.fromText('epsilon');
  var f = Element.fromText('foo');

  var check = function (expected, elements, current, offset) {
    var actual = DomTextdata.from(elements, current, offset);
    assert.eq(expected.text, actual.text());
    expected.cursor.fold(function () {
      assert.eq(true, actual.cursor().isNone(), 'Actual cursor should be none for: ' + actual.text());
    }, function (exp) {
      assert.eq(exp, actual.cursor().getOrDie());
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

