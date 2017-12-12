import Uuid from 'tinymce/themes/inlite/alien/Uuid';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('atomic.themes.alien.UuidTest', function() {
  var testUuid = function () {
    assert.eq(Uuid.uuid('mce').indexOf('mce'), 0);
    assert.eq(Uuid.uuid('mce') !== Uuid.uuid('mce'), true);
  };

  testUuid();
});

