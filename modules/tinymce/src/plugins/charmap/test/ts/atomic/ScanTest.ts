import { Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import * as Scan from 'tinymce/plugins/charmap/core/Scan';
import { CharMap } from 'tinymce/plugins/charmap/core/CharMap';

UnitTest.test('atomic.tinymce.plugins.charmap.ScanTest', () => {
  const charMap: CharMap = {
    name: 'All',
    characters: [
      [ 36, 'dollar sign' ],
      [ 8364, 'euro sign' ],
      [ 402, 'function / florin' ],
      [ 192, 'A - grave' ],
      [ 224, 'a - grave' ],
      [ 0x1d160, 'Musical Symbol Eighth Note' ]
    ]
  };

  const testCharCode = () => {
    Assertions.assertEq('$ should match the dollar sign', [{ value: '$', icon: '$', text: 'dollar sign' }], Scan.scan(charMap, '$'));
    Assertions.assertEq('À should match the "A - grave" and "a - grave"', [{ value: 'À', icon: 'À', text: 'A - grave' }, { value: 'à', icon: 'à', text: 'a - grave' }], Scan.scan(charMap, 'À'));
    Assertions.assertEq('𝅘𝅥𝅮 should match "Musical Symbol Eighth Note"', [{ value: '𝅘𝅥𝅮', icon: '𝅘𝅥𝅮', text: 'Musical Symbol Eighth Note' }], Scan.scan(charMap, '𝅘𝅥𝅮'));
  };

  const testNames = () => {
    Assertions.assertEq('"dolla" should match the dollar sign', [{ value: '$', icon: '$', text: 'dollar sign' }], Scan.scan(charMap, 'dolla'));
    Assertions.assertEq('"function" should match the function / florin sign', [{ value: 'ƒ', icon: 'ƒ', text: 'function / florin' }], Scan.scan(charMap, 'function'));
    Assertions.assertEq('"A-" without spaces should match "A - grave" and "a - grave"', [{ value: 'À', icon: 'À', text: 'A - grave' }, { value: 'à', icon: 'à', text: 'a - grave' }], Scan.scan(charMap, 'A-'));
    Assertions.assertEq('"A - " with spaces should match "A - grave" and "a - grave"', [{ value: 'À', icon: 'À', text: 'A - grave' }, { value: 'à', icon: 'à', text: 'a - grave' }], Scan.scan(charMap, 'A - '));
    Assertions.assertEq('"grave" should match "A - grave" and "a - grave"', [{ value: 'À', icon: 'À', text: 'A - grave' }, { value: 'à', icon: 'à', text: 'a - grave' }], Scan.scan(charMap, 'grave'));
  };

  testCharCode();
  testNames();
});
