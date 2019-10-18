import { PlatformDetection } from 'ephox/sand/core/PlatformDetection';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('DeviceTypeTest', function () {
  const getPlatform = function (userAgent: string) {
    return PlatformDetection.detect(userAgent, () => false);
  };

  const checkTablet = function (expected: boolean, userAgent: string) {
    const platform = getPlatform(userAgent);
    assert.eq(expected, platform.deviceType.isTablet(), 'Tablet incorrect: ' + userAgent);
  };

  const checkiPad = function (expected: boolean, userAgent: string) {
    const platform = getPlatform(userAgent);
    assert.eq(expected, platform.deviceType.isiPad(), 'iPad incorrect: ' + userAgent);
  };

  const checkiPhone = function (expected: boolean, userAgent: string) {
    const platform = getPlatform(userAgent);
    assert.eq(expected, platform.deviceType.isiPhone(), 'iPhone incorrect: ' + userAgent);
  };

  const checkIsWebView = function (expected: boolean, userAgent: string) {
    const platform = getPlatform(userAgent);
    assert.eq(expected, platform.deviceType.isWebView(), 'WebView incorrect: ' + userAgent);
  };

  const checkDesktop = function (expected: boolean, userAgent: string) {
    const platform = getPlatform(userAgent);
    assert.eq(expected, platform.deviceType.isDesktop(), 'desktop incorrect: ' + userAgent);
  };

  // iPad ios10 wkWebview
  const ipad_ios10_wkWebview = 'Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.40 (KHTML, like Gecko) Mobile/14A5309d';
  checkiPad(true, ipad_ios10_wkWebview);
  checkiPhone(false, ipad_ios10_wkWebview);
  checkTablet(true, ipad_ios10_wkWebview);
  checkIsWebView(true, ipad_ios10_wkWebview);

  // iPad ios10 Safari
  const ipad_ios10_safari = 'Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.40 (KHTML, like Gecko) Version/10.0 Mobile/14A5309d Safari/602.1';
  checkiPad(true, ipad_ios10_safari);
  checkiPhone(false, ipad_ios10_safari);
  checkTablet(true, ipad_ios10_safari);
  checkIsWebView(false, ipad_ios10_safari);

  // iPad iOS 9 wkWebview ~ same UA as iPad Pro
  const ipad_ios9_wkWebview = 'Mozilla/5.0 (iPad; CPU OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69';
  checkiPad(true, ipad_ios9_wkWebview);
  checkiPhone(false, ipad_ios9_wkWebview);
  checkTablet(true, ipad_ios9_wkWebview);
  checkIsWebView(true, ipad_ios9_wkWebview);

  // iPad iOS 9 Safari ~ same UA as iPad Pro
  const ipad_ios9_safari = 'Mozilla/5.0 (iPad; CPU OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13F69 Safari/601.1';
  checkiPad(true, ipad_ios9_safari);
  checkiPhone(false, ipad_ios9_safari);
  checkTablet(true, ipad_ios9_safari);
  checkIsWebView(false, ipad_ios9_safari);

  // iPhone iOS 9 Safari
  const iphone_ios9_safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G34 Safari/601.1';
  checkiPad(false, iphone_ios9_safari);
  checkiPhone(true, iphone_ios9_safari);
  checkTablet(false, iphone_ios9_safari);
  checkIsWebView(false, iphone_ios9_safari);

  // iPhone iOS 13 Safari
  const iphone_ios13_safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1';
  checkiPad(false, iphone_ios13_safari);
  checkiPhone(true, iphone_ios13_safari);
  checkTablet(false, iphone_ios13_safari);
  checkIsWebView(false, iphone_ios13_safari);
  checkDesktop(false, iphone_ios13_safari);

  // iPad iPadOS 13 Safari
  const ipad_ipados13_safari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15';
  checkiPad(false, ipad_ipados13_safari);
  checkiPhone(false, ipad_ipados13_safari);
  checkTablet(false, ipad_ipados13_safari);
  checkIsWebView(false, ipad_ipados13_safari);
  checkDesktop(true, ipad_ipados13_safari);
});
