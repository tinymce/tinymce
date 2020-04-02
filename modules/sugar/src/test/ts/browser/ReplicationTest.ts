import * as Replication from 'ephox/sugar/api/dom/Replication';
import Element from 'ephox/sugar/api/node/Element';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock-client';
import { HTMLElement } from '@ephox/dom-globals';

UnitTest.test('ReplicationTest', function () {
  const checkValues = function (expected, actual) {
    assert.eq(expected.name, 'span');
    assert.eq(expected.attrs.href, actual.dom().getAttribute('href'));
    assert.eq(expected.attrs['data-color'], actual.dom().getAttribute('data-color'));

    assert.eq(expected.styles.margin, actual.dom().style.getPropertyValue('margin'));
    assert.eq(expected.styles.padding, actual.dom().style.getPropertyValue('padding'));
  };

  const checkCopy = function (expected, input) {
    const initial = Element.fromHtml<HTMLElement>(input);
    const actual = Replication.copy(initial, 'span');
    checkValues(expected, actual);
  };

  const checkMutate = function (expected, input) {
    const initial = Element.fromHtml<HTMLElement>(input);

    const actual = Replication.mutate(initial, 'span');

    // mutate destroys the original element
    assert.eq(0, Traverse.children(initial).length);

    checkValues(expected, actual);
  };

  const check = function (expected, input) {
    checkCopy(expected, input);
    checkMutate(expected, input);
  };

  const exp = {
    name: 'span',
    attrs: {
      'href': 'http://www.google.com',
      'data-color': 'red'
    },
    styles: {
      margin: '0px',
      padding: '0px'
    },
    innerHtml: 'Link'
  };

  check(exp, '<a href="http://www.google.com" data-color="red" style="margin: 0; padding: 0;">Link</a>');
});
