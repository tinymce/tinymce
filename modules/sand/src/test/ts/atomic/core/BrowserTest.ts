import { assert, UnitTest } from '@ephox/bedrock-client';
import { PlatformDetection } from 'ephox/sand/core/PlatformDetection';
import * as PlatformQuery from 'ephox/sand/test/PlatformQuery';

UnitTest.test('BrowserTest', function () {
  function check(expectedQuery: string, expectedOs: string, expectedBrowser: string, expectedMajor: number, expectedMinor: number, userAgent: string) {
    const platform = PlatformDetection.detect(userAgent, () => false);
    assert.eq(expectedBrowser, platform.browser.current);
    assert.eq(expectedOs, platform.os.current);

    const actualBrowserVersion = platform.browser.version;
    assert.eq(expectedMajor, actualBrowserVersion.major);
    assert.eq(expectedMinor, actualBrowserVersion.minor);

    if (! PlatformQuery.hasOwnProperty(expectedQuery)) {
      assert.fail('Platform query: ' + expectedQuery + ' not known');
    }
    assert.eq(true, PlatformQuery[expectedQuery](platform), 'The query ' + expectedQuery + ' should match.\nUser Agent: ' + userAgent + '\nbrowser: ' + expectedBrowser);
  }

  const checkOSVersion = function (expectedMajor: number, expectedMinor: number, userAgent: string) {
    const platform = PlatformDetection.detect(userAgent, () => false);
    assert.eq(expectedMajor, platform.os.version.major, 'invalid major OS version ' + platform.os.version.major + ' for agent: ' + userAgent);
    assert.eq(expectedMinor, platform.os.version.minor, 'invalid minor OS version ' + platform.os.version.minor + ' for agent: ' + userAgent);
  };

  // These tests are assuming there is no chromeframe activeX object active in the page.
  check('isEdge', 'Windows', 'Edge', 12, 0, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0');
  check('isIE11', 'Windows', 'IE', 11, 0, 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko');
  check('isIE', 'Windows', 'IE', 10, 0, 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; .NET4.0E; .NET4.0C; InfoPath.3)');
  check('isIE', 'Windows', 'IE', 9, 0, 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0)');
  check('isIE', 'Windows', 'IE', 8, 0, 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; WOW64; Trident/4.0; chromeframe/10.0.648.204; SLCC1; .NET CLR 2.0.50727; InfoPath.2; .NET CLR 1.1.4322; .NET CLR 3.5.21022; .NET CLR 3.5.30729; .NET CLR 3.0.30729)');
  check('isIE', 'Windows', 'IE', 8, 0, 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1; .NET CLR 2.0.50727; InfoPath.2; .NET CLR 1.1.4322; .NET CLR 3.5.21022; .NET CLR 3.5.30729; .NET CLR 3.0.30729)');
  check('isIE', 'Windows', 'IE', 7, 0, 'Mozilla/4.0 (compatible; MSIE 7.0; chromeframe/10.0.648.204; Windows NT 5.1)');
  check('isIE', 'Windows', 'IE', 7, 0, 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)');
  check('isIE', 'Windows', 'IE', 6, 0, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)');
  check('isIE', 'Windows', 'IE', 6, 0, 'Mozilla/4.0 (compatible; MSIE 6.0; chromeframe/10.0.648.204; Windows NT 5.1; SV1)');

  check('isFirefox', 'Windows', 'Firefox', 3, 6, 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-GB; rv:1.9.2) Gecko/20100115 Firefox/3.6');
  check('isFirefox', 'Windows', 'Firefox', 3, 5, 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6 (.NET CLR 3.5.30729)');
  check('isFirefox', 'Windows', 'Firefox', 2, 0, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-GB; rv:1.8.1.20) Gecko/20081217 Firefox/2.0.0.20');
  check('isFirefox', 'Linux', 'Firefox', 3, 6, 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.7) Gecko/20100723 Fedora/3.6.7-1.fc13 Firefox/3.6');
  check('isFirefox', 'FreeBSD', 'Firefox', 3, 6, 'Mozilla/5.0 (X11; U; FreeBSD amd64; en-US; rv:1.9.2.20) Gecko/20110823 Firefox/3.6.20');
  check('isFirefox', 'OSX', 'Firefox', 3, 5, 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 GTB7');

  check('isSafari', 'Windows', 'Safari', 4, 0, 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/531.21.8 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10');
  check('isSafari', 'Windows', 'Safari', 3, 2, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.28 (KHTML, like Gecko) Version/3.2.2 Safari/525.28.1');
  check('isSafari', 'OSX', 'Safari', 5, 0, 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-au) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8');

  check('isOpera', 'Windows', 'Opera', 10, 50, 'Opera/9.80 (Windows NT 6.1; U; en) Presto/2.5.22 Version/10.50');
  check('isOpera', 'Windows', 'Opera', 9, 63, 'Opera/9.63 (Windows NT 5.1; U; en) Presto/2.1.1');

  check('isChrome', 'Windows', 'Chrome', 3, 0, 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/532.0 (KHTML, like Gecko) Chrome/3.0.195.38 Safari/532.0');
  check('isChrome', 'Windows', 'Chrome', 4, 0, 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/532.0 (KHTML, like Gecko) Chrome/4.0.195.38 Safari/532.0');
  check('isChrome', 'Windows', 'Chrome', 5, 0, 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.127 Safari/533.4');
  check('isChrome', 'Windows', 'Chrome', 6, 0, 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/534.3 (KHTML, like Gecko) Chrome/6.0.472.53 Safari/534.3');
  check('isChrome', 'Linux', 'Chrome', 5, 0, 'Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.127 Safari/533.4');
  check('isChrome', 'OSX', 'Chrome', 6, 0, 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-US) AppleWebKit/534.3 (KHTML, like Gecko) Chrome/6.0.472.53 Safari/534.3');
  check('isSafari', 'iOS', 'Safari', 3, 0, 'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A537a Safari/419.3');
  check('isSafari', 'iOS', 'Safari', 9, 3, 'Mozilla/5.0 (iPad; CPU OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13E230');
  check('isSafari', 'iOS', 'Safari', 13, 0, 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1');
  check('isSafari', 'OSX', 'Safari', 13, 0, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15'); // iPadOS 13
  check('isChrome', 'Android', 'Chrome', 18, 0, 'Mozilla/5.0 (Linux; Android 4.2.2; Nexus 7 Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166  Safari/535.19');
  check('isChrome', 'ChromeOS', 'Chrome', 78, 0, 'Mozilla/5.0 (X11; CrOS x86_64 12499.66.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.106 Safari/537.36');

  checkOSVersion(4, 2, 'Mozilla/5.0 (Linux; Android 4.2.2; Nexus 7 Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166  Safari/535.19');
  checkOSVersion(6, 0, 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25');
  checkOSVersion(3, 0, 'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A537a Safari/419.3');
  checkOSVersion(4, 2, 'Mozilla/5.0 (Linux; Android 4.2.2; en-us; SAMSUNG GT-I9195 Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Version/1.0 Chrome/18.0.1025.308 Mobile Safari/535.19');
  checkOSVersion(3, 0, 'Mozilla/5.0 (Linux; U; Android 3.0; xx-xx; GT-P7100 Build/HRI83) AppleWebkit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13');
  checkOSVersion(4, 0, 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30');
  checkOSVersion(4, 0, 'Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.5; zh-cn; HTC_IncredibleS_S710e Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.4; fr-fr; HTC Desire Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; zh-tw; HTC_Pyramid Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; zh-tw; HTC_Pyramid Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; zh-tw; HTC Pyramid Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; ko-kr; LG-LU3000 Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; en-us; HTC_DesireS_S510e Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; en-us; HTC_DesireS_S510e Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; de-de; HTC Desire Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 3, 'Mozilla/5.0 (Linux; U; Android 2.3.3; de-ch; HTC Desire Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 2, 'Mozilla/5.0 (Linux; U; Android 2.2; fr-lu; HTC Legend Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 2, 'Mozilla/5.0 (Linux; U; Android 2.2; en-sa; HTC_DesireHD_A9191 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 2, 'Mozilla/5.0 (Linux; U; Android 2.2.1; fr-fr; HTC_DesireZ_A7272 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 2, 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-gb; HTC_DesireZ_A7272 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(2, 2, 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-ca; LG-P505R Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
  checkOSVersion(78, 0, 'Mozilla/5.0 (X11; CrOS x86_64 12499.66.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.106 Safari/537.36');

  // WKWebView drops the 'Version/X.X' text
  checkOSVersion(9, 2, 'Mozilla/5.0 (iPad; CPU OS 9_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13C75');
  // And verify the normal string still works
  checkOSVersion(9, 0, 'Mozilla/5.0 (iPad; CPU OS 9_2_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13D15 Safari/601.1');
  // iPhone5, 6 & 6 plus
  checkOSVersion(9, 2, 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13C75');
});
