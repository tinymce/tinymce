import * as Replication from 'ephox/sugar/api/dom/Replication';
import Element from 'ephox/sugar/api/node/Element';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ReplicationTest', function() {
  var checkValues = function (expected, actual) {
    assert.eq(expected.name, 'span');
    assert.eq(expected.attrs.href, actual.dom().getAttribute('href'));
    assert.eq(expected.attrs['data-color'], actual.dom().getAttribute('data-color'));

    assert.eq(expected.styles.margin, actual.dom().style.getPropertyValue('margin'));
    assert.eq(expected.styles.padding, actual.dom().style.getPropertyValue('padding'));
  };

  var checkCopy = function (expected, input) {
    var initial = Element.fromHtml(input);
    var actual = Replication.copy(initial, 'span');
    checkValues(expected, actual);
  };

  var checkMutate = function (expected, input) {
    var initial = Element.fromHtml(input);

    var actual = Replication.mutate(initial, 'span');

    // mutate destroys the original element
    assert.eq(0, Traverse.children(initial).length);

    checkValues(expected, actual);
  };

  var check = function (expected, input) {
    checkCopy(expected, input);
    checkMutate(expected, input);
  };

  var expected = {
    name: 'span',
    attrs: {
      'href': 'http://www.google.com',
      'data-color': 'red'
    },
    styles: {
      'margin': '0px',
      padding: '0px'
    },
    innerHtml: 'Link'
  };

  check(expected, '<a href="http://www.google.com" data-color="red" style="margin: 0; padding: 0;">Link</a>');
});

