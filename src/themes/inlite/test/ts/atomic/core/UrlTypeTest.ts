import UrlType from 'tinymce/themes/inlite/core/UrlType';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('atomic.themes.core.UrlTypeTest', function () {
  const testIsDomainLike = function () {
    const mostUsedTopLevelDomains = [
      'com', 'org', 'edu', 'gov', 'uk', 'net', 'ca', 'de', 'jp',
      'fr', 'au', 'us', 'ru', 'ch', 'it', 'nl', 'se', 'no', 'es', 'mil'
    ];

    assert.eq(UrlType.isDomainLike('www.site.com'), true);
    assert.eq(UrlType.isDomainLike('www.site.xyz'), true);
    assert.eq(UrlType.isDomainLike('   www.site.xyz'), true);
    assert.eq(UrlType.isDomainLike('site.xyz'), false);

    mostUsedTopLevelDomains.forEach(function (tld) {
      assert.eq(UrlType.isDomainLike('site.' + tld), true);
      assert.eq(UrlType.isDomainLike('  site.' + tld), true);
      assert.eq(UrlType.isDomainLike('site.' + tld + '  '), true);
    });

    assert.eq(UrlType.isDomainLike('/a/b'), false);
  };

  const testIsAbsoluteUrl = function () {
    assert.eq(UrlType.isAbsolute('http://www.site.com'), true);
    assert.eq(UrlType.isAbsolute('https://www.site.com'), true);
    assert.eq(UrlType.isAbsolute('www.site.com'), false);
    assert.eq(UrlType.isAbsolute('file.gif'), false);
  };

  testIsDomainLike();
  testIsAbsoluteUrl();
});
