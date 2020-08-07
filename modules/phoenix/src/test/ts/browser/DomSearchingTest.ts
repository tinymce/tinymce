import { assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Pattern } from '@ephox/polaris';
import { SugarElement } from '@ephox/sugar';
import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';

UnitTest.test('DomSearchingTest', function () {
  const root = SugarElement.fromTag('div');
  root.dom.innerHTML = 'This is some<ol><li>text</li></ol>';

  const result = DomSearch.run([ root ], [{
    word: 'sometext',
    pattern: Pattern.unsafetoken('sometext')
  }], Fun.never);

  assert.eq(0, result.length, 'There should be no matches, because some and text are separated by a list boundary');
});
