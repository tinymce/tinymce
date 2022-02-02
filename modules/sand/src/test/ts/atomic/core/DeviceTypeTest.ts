import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { PlatformDetection } from 'ephox/sand/core/PlatformDetection';

describe('DeviceTypeTest', () => {
  const getPlatform = (userAgent: string) => {
    return PlatformDetection.detect(userAgent, Optional.none(), Fun.never);
  };

  const checkTablet = (expected: boolean, userAgent: string) => {
    const platform = getPlatform(userAgent);
    assert.equal(expected, platform.deviceType.isTablet(), 'Tablet incorrect: ' + userAgent);
  };

  const checkiPad = (expected: boolean, userAgent: string) => {
    const platform = getPlatform(userAgent);
    assert.equal(expected, platform.deviceType.isiPad(), 'iPad incorrect: ' + userAgent);
  };

  const checkiPhone = (expected: boolean, userAgent: string) => {
    const platform = getPlatform(userAgent);
    assert.equal(expected, platform.deviceType.isiPhone(), 'iPhone incorrect: ' + userAgent);
  };

  const checkIsWebView = (expected: boolean, userAgent: string) => {
    const platform = getPlatform(userAgent);
    assert.equal(expected, platform.deviceType.isWebView(), 'WebView incorrect: ' + userAgent);
  };

  const checkDesktop = (expected: boolean, userAgent: string) => {
    const platform = getPlatform(userAgent);
    assert.equal(expected, platform.deviceType.isDesktop(), 'desktop incorrect: ' + userAgent);
  };

  it('iPad iOS10 wkWebview', () => {
    const userAgent = 'Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.40 (KHTML, like Gecko) Mobile/14A5309d';
    checkiPad(true, userAgent);
    checkiPhone(false, userAgent);
    checkTablet(true, userAgent);
    checkIsWebView(true, userAgent);
  });

  it('iPad iOS10 Safari', () => {
    const userAgent = 'Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.40 (KHTML, like Gecko) Version/10.0 Mobile/14A5309d Safari/602.1';
    checkiPad(true, userAgent);
    checkiPhone(false, userAgent);
    checkTablet(true, userAgent);
    checkIsWebView(false, userAgent);
  });

  it('iPad iOS 9 wkWebview ~ same UA as iPad Pro', () => {
    const userAgent = 'Mozilla/5.0 (iPad; CPU OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69';
    checkiPad(true, userAgent);
    checkiPhone(false, userAgent);
    checkTablet(true, userAgent);
    checkIsWebView(true, userAgent);
  });

  it('iPad iOS 9 Safari ~ same UA as iPad Pro', () => {
    const userAgent = 'Mozilla/5.0 (iPad; CPU OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13F69 Safari/601.1';
    checkiPad(true, userAgent);
    checkiPhone(false, userAgent);
    checkTablet(true, userAgent);
    checkIsWebView(false, userAgent);
  });

  it('iPhone iOS 9 Safari', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G34 Safari/601.1';
    checkiPad(false, userAgent);
    checkiPhone(true, userAgent);
    checkTablet(false, userAgent);
    checkIsWebView(false, userAgent);
  });

  it('iPhone iOS 13 Safari', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1';
    checkiPad(false, userAgent);
    checkiPhone(true, userAgent);
    checkTablet(false, userAgent);
    checkIsWebView(false, userAgent);
    checkDesktop(false, userAgent);
  });

  it('iPad iPadOS 13 Safari', () => {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15';
    checkiPad(false, userAgent);
    checkiPhone(false, userAgent);
    checkTablet(false, userAgent);
    checkIsWebView(false, userAgent);
    checkDesktop(true, userAgent);
  });
});
