import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Ready from 'ephox/sugar/api/events/Ready';

UnitTest.test('ReadyTest', () => {
  // This isn't really a test. By definition, tests are run after document load.
  // We can't easily test the actual Ready event, but we can verify it works after document load
  let called = 0;
  Ready.execute(() => { called++; });
  assert.eq(1, called);
});
