/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { PlatformDetection } from '@ephox/sand';

/**
 * This class contains various environment constants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class tinymce.Env
 * @static
 */

const userAgent = navigator.userAgent;
const platform = PlatformDetection.detect();
const browser = platform.browser;
const os = platform.os;
const deviceType = platform.deviceType;

const windowsPhone = userAgent.indexOf('Windows Phone') !== -1;

interface Version {
  major: number;
  minor: number;
}

interface Env {
  transparentSrc: string;
  documentMode: number;
  cacheSuffix: any;
  container: any;
  canHaveCSP: boolean;
  windowsPhone: boolean;

  browser: {
    current: string | undefined;
    version: Version;
    isEdge: () => boolean;
    isChrome: () => boolean;
    isIE: () => boolean;
    isOpera: () => boolean;
    isFirefox: () => boolean;
    isSafari: () => boolean;
  };
  os: {
    current: string | undefined;
    version: Version;
    isWindows: () => boolean;
    isiOS: () => boolean;
    isAndroid: () => boolean;
    isOSX: () => boolean;
    isLinux: () => boolean;
    isSolaris: () => boolean;
    isFreeBSD: () => boolean;
    isChromeOS: () => boolean;
  };
  deviceType: {
    isiPad: () => boolean;
    isiPhone: () => boolean;
    isTablet: () => boolean;
    isPhone: () => boolean;
    isTouch: () => boolean;
    isWebView: () => boolean;
    isDesktop: () => boolean;
  };
}

const Env: Env = {
  /**
   * Transparent image data url.
   *
   * @property transparentSrc
   * @type Boolean
   * @final
   */
  transparentSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

  /**
   * Returns the IE document mode. For non IE browsers, this will fake IE 10 document mode.
   *
   * @property documentMode
   * @type Number
   */
  documentMode: browser.isIE() ? ((document as any).documentMode || 7) : 10,

  cacheSuffix: null,
  container: null,

  /**
   * Constant if CSP mode is possible or not. Meaning we can't use script urls for the iframe.
   */
  canHaveCSP: !browser.isIE(),

  windowsPhone,

  /**
   * @include ../../../../../tools/docs/tinymce.Env.js
   */
  browser: {
    current: browser.current,
    version: browser.version,
    isChrome: browser.isChrome,
    isEdge: browser.isEdge,
    isFirefox: browser.isFirefox,
    isIE: browser.isIE,
    isOpera: browser.isOpera,
    isSafari: browser.isSafari
  },
  os: {
    current: os.current,
    version: os.version,
    isAndroid: os.isAndroid,
    isChromeOS: os.isChromeOS,
    isFreeBSD: os.isFreeBSD,
    isiOS: os.isiOS,
    isLinux: os.isLinux,
    isOSX: os.isOSX,
    isSolaris: os.isSolaris,
    isWindows: os.isWindows
  },
  deviceType: {
    isDesktop: deviceType.isDesktop,
    isiPad: deviceType.isiPad,
    isiPhone: deviceType.isiPhone,
    isPhone: deviceType.isPhone,
    isTablet: deviceType.isTablet,
    isTouch: deviceType.isTouch,
    isWebView: deviceType.isWebView
  }
};

export default Env;
