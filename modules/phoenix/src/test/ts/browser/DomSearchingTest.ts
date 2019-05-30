import { UnitTest, assert } from '@ephox/bedrock';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import { Pattern } from '@ephox/polaris';

UnitTest.test('DomSearchingTest', function () {
  const root = Element.fromTag('div');
  root.dom().innerHTML = 'This is some<ol><li>text</li></ol>';

  const result = DomSearch.run([root], [{
    word: Fun.constant('sometext'),
    pattern: Fun.constant(Pattern.unsafetoken('sometext'))
  }], Fun.constant(false));

  assert.eq(0, result.length, 'There should be no matches, because some and text are separated by a list boundary');
});