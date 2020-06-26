import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as fc from 'fast-check';
import { addPxSuffix, isPercentage, removePxSuffix } from 'tinymce/plugins/table/core/Util';

UnitTest.test('atomic.tinymce.plugins.table.core.UtilTest - isPercentage', () => {
  Assert.eq('Empty string is false', false, isPercentage(''));
  Assert.eq('Single % string is false', false, isPercentage('%'));
  Assert.eq('Percentage string is true', true, isPercentage('10%'));
  Assert.eq('Percentage with decimal string is true', true, isPercentage('10.125%'));

  fc.assert(fc.property(fc.float(1, 100), (n) => {
    Assert.eq('Arbitrary float with percent string is true', true, isPercentage(n + '%'));
    Assert.eq('Number string is false', false, isPercentage(n + ''));
    Assert.eq('Pixel string is false', false, isPercentage(n + 'px'));
    Assert.eq('String containing % string is false', false, isPercentage(n + '%' + n));
  }));
});

UnitTest.test('atomic.tinymce.plugins.table.core.UtilTest - removePxSuffix', () => {
  Assert.eq('Empty string is identical', '', removePxSuffix(''));
  Assert.eq('Pixel string has pixel removed', '10', removePxSuffix('10px'));

  fc.assert(fc.property(fc.float(1, 100), (n) => {
    Assert.eq('Arbitrary float with px string is true', n + '', removePxSuffix(n + 'px'));
    Assert.eq('Number string is identical', n + '', removePxSuffix(n + ''));
    Assert.eq('String with pixel prefix is identical', 'px' + n, removePxSuffix('px' + n));
    Assert.eq('Percent string is identical', n + '%', removePxSuffix(n + '%'));
  }));
});

UnitTest.test('atomic.tinymce.plugins.table.core.UtilTest - addPxSuffix', () => {
  Assert.eq('Empty string is identical', '', addPxSuffix(''));
  Assert.eq('Number string has px added', '10px', addPxSuffix('10'));

  fc.assert(fc.property(fc.float(1, 100), (n) => {
    Assert.eq('Arbitrary float with px string is true', n + 'px', addPxSuffix(n + ''));
    Assert.eq('Percent string is identical', n + '%', addPxSuffix(n + '%'));
    Assert.eq('Pixel string is identical', n + 'px', addPxSuffix(n + 'px'));
  }));
});
