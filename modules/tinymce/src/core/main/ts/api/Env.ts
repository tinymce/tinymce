/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { navigator, window, document, URL } from '@ephox/dom-globals';
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

const webkit = /WebKit/.test(userAgent) && !browser.isEdge();
const fileApi = 'FormData' in window && 'FileReader' in window && 'URL' in window && !!URL.createObjectURL;
const windowsPhone = userAgent.indexOf('Windows Phone') !== -1;

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
   * <br>
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>browser.isOpera()</code> instead.
   *
   * @property opera
   * @type Boolean
   * @final
   * @deprecated
   */
  opera: browser.isOpera(),

  /**
   * Constant that is true if the browser is WebKit (Safari/Chrome).
   * <br>
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>browser.isSafari()</code> or <code>browser.isChrome()</code> instead.
   *
   * @property webKit
   * @type Boolean
   * @final
   * @deprecated
   */
  webkit,

  /**
   * Constant that is more than zero if the browser is IE.
   * <br>
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>browser.version.major</code> and <code>browser.isIE()</code> or <code>browser.ieEdge()</code> instead.
   *
   * @property ie
   * @type Number
   * @final
   * @deprecated
   */
  ie: browser.isIE() || browser.isEdge() ? browser.version.major : false,

  /**
   * Constant that is true if the browser is Gecko.
   * <br>
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>browser.isFirefox()</code> instead.
   *
   * @property gecko
   * @type Boolean
   * @final
   * @deprecated
   */
  gecko: browser.isFirefox(),

  /**
   * Constant that is true if the os is Mac OS.
   * <br>
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>os.isOSX()</code> instead.
   *
   * @property mac
   * @type Boolean
   * @final
   * @deprecated
   */
  mac: os.isOSX(),

  /**
   * Constant that is true if the os is iOS.
   * <br>
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>os.isiOS()</code> instead.
   *
   * @property iOS
   * @type Boolean
   * @final
   * @deprecated
   */
  iOS: deviceType.isiPad() || deviceType.isiPhone(),

  /**
   * Constant that is true if the os is android.
   * <br>
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>os.isAndroid()</code> instead.
   *
   * @property android
   * @type Boolean
   * @final
   * @deprecated
   */
  android: os.isAndroid(),

  /**
   * Constant that is true if the browser supports editing.
   *
   * @property contentEditable
   * @type Boolean
   * @final
   */
  // All supported browsers support contentEditable now
  contentEditable: true,

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
   * @property caretAfter
   * @type Boolean
   * @final
   */
  // All supported browsers support carets after an inline block now
  caretAfter: true,

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
  // All supported browsers support contenteditable=false now
  ceFalse: true,

  cacheSuffix: null,
  container: null,
  experimentalShadowDom: false,

  /**
   * Constant if CSP mode is possible or not. Meaning we can't use script urls for the iframe.
   */
  canHaveCSP: !browser.isIE(),

  /**
   * <em>Deprecated in TinyMCE 5.1</em> - Use <code>deviceType.isDesktop()</code> instead.
   *
   * @deprecated
   */
  desktop: deviceType.isDesktop(),
  windowsPhone,

  /**
   * @include ../../../../../tools/docs/tinymce.Env.js
   */
  browser,
  os,
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
