import * as Zwsp from 'tinymce/core/text/Zwsp';
import { Assert, UnitTest } from '@ephox/bedrock-client';

UnitTest.test('ZwspTest', () => {
  Assert.eq('ZWSP should be FEFF', '\uFEFF', Zwsp.ZWSP);
  Assert.eq('isZwsp(ZWSP) should be true', true, Zwsp.isZwsp(Zwsp.ZWSP));
  Assert.eq('ZWSP should be stripped out', 'ab', Zwsp.trim('a' + Zwsp.ZWSP + 'b'));
});
