import * as Style from 'ephox/sugar/impl/Style';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('SizeTest', function () {
  const fakeElement = {
    style: {}
  };
  assert.eq(false, Style.isSupported(fakeElement as any));
});
