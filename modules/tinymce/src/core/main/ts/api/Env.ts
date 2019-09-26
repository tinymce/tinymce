/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { navigator, window, matchMedia, document, URL } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';

/**
 * This class contains various environment constants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class tinymce.Env
 * @static
 */

const nav = navigator, userAgent = nav.userAgent;

const matchMediaQuery = function (query) {
  return 'matchMedia' in window ? matchMedia(query).matches : false;
};

const opera = false;
const android = /Android/.test(userAgent);
let webkit = /WebKit/.test(userAgent);
let ie: any = !webkit && !opera && (/MSIE/gi).test(userAgent) && (/Explorer/gi).test(nav.appName);
ie = ie && /MSIE (\w+)\./.exec(userAgent)[1];
const ie11 = userAgent.indexOf('Trident/') !== -1 && (userAgent.indexOf('rv:') !== -1 || nav.appName.indexOf('Netscape') !== -1) ? 11 : false;
const ie12 = (userAgent.indexOf('Edge/') !== -1 && !ie && !ie11) ? 12 : false;
ie = ie || ie11 || ie12;
const gecko = !webkit && !ie11 && /Gecko/.test(userAgent);
const mac = userAgent.indexOf('Mac') !== -1;
const iDevice = /(iPad|iPhone)/.test(userAgent);
const fileApi = 'FormData' in window && 'FileReader' in window && 'URL' in window && !!URL.createObjectURL;
const phone = matchMediaQuery('only screen and (max-device-width: 480px)') && (android || iDevice);
const tablet = matchMediaQuery('only screen and (min-width: 800px)') && (android || iDevice);
const windowsPhone = userAgent.indexOf('Windows Phone') !== -1;

if (ie12) {
  webkit = false;
}

// Is a iPad/iPhone and not on iOS5 sniff the WebKit version since older iOS WebKit versions
// says it has contentEditable support but there is no visible caret.
const contentEditable = !iDevice || fileApi || parseInt(userAgent.match(/AppleWebKit\/(\d*)/)[1], 10) >= 534;

const platform = PlatformDetection.detect();
const browser = platform.browser;
const os = platform.os;
const deviceType = platform.deviceType;

interface Env {
  opera: boolean;
  webkit: boolean;
  ie: false | number;
  gecko: boolean;
  mac: boolean;
  iOS: boolean;
  android: boolean;
  contentEditable: boolean;
  transparentSrc: string;
  caretAfter: boolean;
  range: boolean;
  documentMode: number;
  fileApi: boolean;
  ceFalse: boolean;
  cacheSuffix: any;
  container: any;
  experimentalShadowDom: boolean;
  canHaveCSP: boolean;
  desktop: boolean;
  windowsPhone: boolean;

  browser: PlatformDetection.Browser;
  os: PlatformDetection.OperatingSystem;
  deviceType: Omit<Omit<PlatformDetection.DeviceType, 'isiOS'>, 'isAndroid'>;
}

const Env: Env = {
  /**
   * Constant that is true if the browser is Opera.
   *
   * @property opera
   * @type Boolean
   * @final
   * @deprecated since version 5.1. Use Env.browser.isOpera() instead.
   */
  opera,

  /**
   * Constant that is true if the browser is WebKit (Safari/Chrome).
   *
   * @property webKit
   * @type Boolean
   * @final
   * @deprecated since version 5.1. Use Env.browser.isSafari() or Env.browser.isChrome() instead.
   */
  webkit,

  /**
   * Constant that is more than zero if the browser is IE.
   *
   * @property ie
   * @type Boolean
   * @final
   * @deprecated since version 5.1. Use Env.browser.isIE() or Env.browser.isEdge() instead.
   */
  ie,

  /**
   * Constant that is true if the browser is Gecko.
   *
   * @property gecko
   * @type Boolean
   * @final
   * @deprecated since version 5.1. Use Env.browser.isFirefox() instead.
   */
  gecko,

  /**
   * Constant that is true if the os is Mac OS.
   *
   * @property mac
   * @type Boolean
   * @final
   * @deprecated since version 5.1. Use Env.os.isOSX() instead.
   */
  mac,

  /**
   * Constant that is true if the os is iOS.
   *
   * @property iOS
   * @type Boolean
   * @final
   * @deprecated since version 5.1. Use Env.os.isiOS() instead.
   */
  iOS: iDevice,

  /**
   * Constant that is true if the os is android.
   *
   * @property android
   * @type Boolean
   * @final
   * @deprecated since version 5.1. Use Env.os.isAndroid() instead.
   */
  android,

  /**
   * Constant that is true if the browser supports editing.
   *
   * @property contentEditable
   * @type Boolean
   * @final
   */
  contentEditable,

  /**
   * Transparent image data url.
   *
   * @property transparentSrc
   * @type Boolean
   * @final
   */
  transparentSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

  /**
   * Returns true/false if the browser can or can't place the caret after a inline block like an image.
   *
   * @property noCaretAfter
   * @type Boolean
   * @final
   */
  caretAfter: ie !== 8,

  /**
   * Constant that is true if the browser supports native DOM Ranges. IE 9+.
   *
   * @property range
   * @type Boolean
   */
  range: window.getSelection && 'Range' in window,

  /**
   * Returns the IE document mode for non IE browsers this will fake IE 10.
   *
   * @property documentMode
   * @type Number
   */
  documentMode: browser.isIE() ? ((<any> document).documentMode || 7) : 10,

  /**
   * Constant that is true if the browser has a modern file api.
   *
   * @property fileApi
   * @type Boolean
   */
  fileApi,

  /**
   * Constant that is true if the browser supports contentEditable=false regions.
   *
   * @property ceFalse
   * @type Boolean
   */
  ceFalse: !browser.isIE() || browser.version.major > 8,

  cacheSuffix: null,
  container: null,
  experimentalShadowDom: false,

  /**
   * Constant if CSP mode is possible or not. Meaning we can't use script urls for the iframe.
   */
  canHaveCSP: !browser.isIE(),

  /**
   * @deprecated since version 5.1. Use Env.deviceType.isDesktop() instead
   */
  desktop: !phone && !tablet,
  windowsPhone,

  /**
   * A collection of utility functions that help to determine what DeviceType is being used,
   * based on the browsers User Agent.
   *
   * @property browser
   * @type Object
   * @final
   */
  browser,

  /**
   * A collection of utility functions that help to determine what Operating System (OS) is being used,
   * based on the browsers User Agent.
   *
   * @property os
   * @type Object
   * @final
   */
  os,

  /**
   * A collection of utility functions that help to determine what DeviceType is being used,
   * based on the browsers User Agent.
   *
   * @property deviceType
   * @type Object
   * @final
   */
  deviceType: {
    isiPad: deviceType.isiPad,
    isiPhone: deviceType.isiPhone,
    isPhone: deviceType.isPhone,
    isTablet: deviceType.isTablet,
    isTouch: deviceType.isTouch,
    isWebView: deviceType.isWebView,
    isDesktop: deviceType.isDesktop
  }
};

export default Env;
