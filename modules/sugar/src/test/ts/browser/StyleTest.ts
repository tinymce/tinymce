import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Style from 'ephox/sugar/impl/Style';

UnitTest.test('SizeTest', () => {
  const fakeElement = {
    style: {}
  };
  assert.eq(false, Style.isSupported(fakeElement as any));
});
