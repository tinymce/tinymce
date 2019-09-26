/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { XMLHttpRequest } from '@ephox/dom-globals';
import Delay from './Delay';
import Observable from './Observable';
import Tools from './Tools';
import { NativeEventMap } from './EventDispatcher';

export interface XHRSettings {
  async?: boolean;
  content_type?: string;
  crossDomain?: boolean;
  data?: string;
  requestheaders?: Record<string, { key: string, value: string}>;
  scope?: {};
  type?: string;
  url: string;
  error_scope?: {};
  success_scope?: {};
  error? (message: 'TIMED_OUT' | 'GENERAL', xhr: XMLHttpRequest, settings: XHRSettings): void;
  success? (text: string, xhr: XMLHttpRequest, settings: XHRSettings): void;
}

export interface XHREventMap extends NativeEventMap {
  'beforeInitialize': { settings: XHRSettings };
}

interface XHR extends Observable<XHREventMap> {
  send (settings: XHRSettings): void;
}

/**
 * This class enables you to send XMLHTTPRequests cross browser.
 * @class tinymce.util.XHR
 * @mixes tinymce.util.Observable
 * @static
 * @example
 * // Sends a low level Ajax request
 * tinymce.util.XHR.send({
 *    url: 'someurl',
 *    success: function(text) {
 *       console.debug(text);
 *    }
 * });
 *
 * // Add custom header to XHR request
 * tinymce.util.XHR.on('beforeSend', function(e) {
 *     e.xhr.setRequestHeader('X-Requested-With', 'Something');
 * });
 */

const XHR: XHR = {
  ...Observable,

  /**
   * Sends a XMLHTTPRequest.
   * Consult the TinyMCE Documentation for details on what settings this method takes.
   *
   * @method send
   * @param {Object} settings Object will target URL, callbacks and other info needed to make the request.
   */
  send (settings: XHRSettings) {
    let xhr, count = 0;

    const ready = function () {
      if (!settings.async || xhr.readyState === 4 || count++ > 10000) {
        if (settings.success && count < 10000 && xhr.status === 200) {
          settings.success.call(settings.success_scope, '' + xhr.responseText, xhr, settings);
        } else if (settings.error) {
          settings.error.call(settings.error_scope, count > 10000 ? 'TIMED_OUT' : 'GENERAL', xhr, settings);
        }

        xhr = null;
      } else {
        Delay.setTimeout(ready, 10);
      }
    };

    // Default settings
    settings.scope = settings.scope || this;
    settings.success_scope = settings.success_scope || settings.scope;
    settings.error_scope = settings.error_scope || settings.scope;
    settings.async = settings.async !== false;
    settings.data = settings.data || '';

    XHR.fire('beforeInitialize', { settings });

    xhr = new XMLHttpRequest();

    if (xhr) {
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType(settings.content_type);
      }

      xhr.open(settings.type || (settings.data ? 'POST' : 'GET'), settings.url, settings.async);

      if (settings.crossDomain) {
        xhr.withCredentials = true;
      }

      if (settings.content_type) {
        xhr.setRequestHeader('Content-Type', settings.content_type);
      }

      if (settings.requestheaders) {
        Tools.each(settings.requestheaders, function (header) {
          xhr.setRequestHeader(header.key, header.value);
        });
      }

      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      xhr = XHR.fire('beforeSend', { xhr, settings }).xhr;
      xhr.send(settings.data);

      // Syncronous request
      if (!settings.async) {
        return ready();
      }

      // Wait for response, onReadyStateChange can not be used since it leaks memory in IE
      Delay.setTimeout(ready, 10);
    }
  }
};

export default XHR;