import * as Ready from 'ephox/sugar/api/events/Ready';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('ReadyTest', function () {
  // This isn't really a test. By definition, tests are run after document load.
  // We can't easily test the actual Ready event, but we can verify it works after document load
  let called = 0;
  Ready.execute(function () { called++; });
  assert.eq(1, called);
});
