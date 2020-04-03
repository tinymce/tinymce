import { Assertions } from '@ephox/agar';
import * as Protect from 'tinymce/plugins/fullpage/core/Protect';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('atomic.tinymce.plugins.fullpage.ProtectTest', function () {
  const testProtect = function () {
    Assertions.assertEq('', 'a<!--mce:protected b-->c', Protect.protectHtml([ /b/g ], 'abc'));
    Assertions.assertEq('', 'a<!--mce:protected b-->cde<!--mce:protected f-->', Protect.protectHtml([ /b/g, /f/g ], 'abcdef'));
    Assertions.assertEq('', 'a<!--mce:protected %3Cb%3E-->c', Protect.protectHtml([ /<b>/g ], 'a<b>c'));
  };

  const testUnprotect = function () {
    Assertions.assertEq('', 'abc', Protect.unprotectHtml('a<!--mce:protected b-->c'));
    Assertions.assertEq('', 'abcdef', Protect.unprotectHtml('a<!--mce:protected b-->cde<!--mce:protected f-->'));
    Assertions.assertEq('', 'a<b>c', Protect.unprotectHtml('a<!--mce:protected %3Cb%3E-->c'));
  };

  testProtect();
  testUnprotect();
});
