/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { BodyInit, Document, XMLHttpRequest } from '@ephox/dom-globals';
import Delay from './Delay';
import { NativeEventMap } from './EventDispatcher';
import Observable from './Observable';
import Tools from './Tools';

export interface XHRSettings {
  async?: boolean;
  content_type?: string;
  crossDomain?: boolean;
  data?: Document | BodyInit;
  requestheaders?: Record<string, { key: string; value: string}>;
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
 * This API allows you to send XMLHTTPRequests cross browser.
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
   *
   * @method send
   * @param {Object} settings An object containing the target URL,
   * callbacks, and other information needed to make the request.
   * For information on valid settings, see the table below.<br /><br />
   * <div>
   * <table>
   * <thead>
   * <tr style="text-align: center;">
   * <th>Setting</th>
   * <th>Required/<br />Optional</th>
   * <th>Type</th>
   * <th>Description</th>
   * </tr>
   * </thead>
   * <tbody>
   * <tr>
   * <td>
   * <p><code>url</code></p>
   * </td>
   * <td>Required</td>
   * <td>
   * <p><code>string</code></p>
   * </td>
   * <td>Address to send the request to, such as the back-end server.</td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>async<br /></code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>boolean</code></p>
   * </td>
   * <td>When <code>false</code>, the request will be synchronous.
   * Set to <code>true</code> by default.
   * <strong>NOTE</strong>: Synchronous requests have been deprecated on some browsers.
   * For details, see: <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open#Syntax">
   * MDN Web Docs - XMLHttpRequest.open() Syntax</a>.</td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>content_type<br /></code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>string</code></p>
   * </td>
   * <td>Used to define the mime-type of the data. Similar to
   * <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType">
   * the XMLHttpRequest.overrideMimeType method</a>.</td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>crossDomain<br /></code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>boolean</code></p>
   * </td>
   * <td>When <code>true</code>, the withCredentials property will be set to <code>true</code>.
   * For information on the withCredentials property, see:
   * <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials">
   * MDN Web Docs - XMLHttpRequest.withCredentials</a>.</td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>data<br /></code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>Document | Blob | FormData | string</code></p>
   * </td>
   * <td>The data to be sent to the specified URL (<code>url</code>). For information on valid data inputs,
   *  see: <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send#Syntax">
   *  MDN Web Docs - XMLHttpRequest.send() Syntax</a></td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>requestheaders</code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>Record&lt;string, { key: string; value: string }&gt;</code></p>
   * </td>
   * <td>Allows for the definition of additional
   *  <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader">
   *  header-values for the request header</a>.</td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>type</code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>string</code></p>
   * </td>
   * <td>
   * <p>The <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods">HTTP request method</a>,
   *  such as: <code>'GET'</code>, <code>'POST'</code>, <code>'PUT'</code> and <code>'DELETE'</code>.
   * By default:</p>
   * <ul>
   * <li>If no data is provided with the request, the <code>'GET'</code> method will be used.</li>
   * <li>If data is provided with the request, the <code>'POST'</code> method will be used.</li>
   * </ul>
   * </td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>error_scope</code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>object</code></p>
   * </td>
   * <td>Sets the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this">
   * '<code>this</code>'</a> value of the error callback function.</td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>success_scope<br /></code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>object</code></p>
   * </td>
   * <td>Sets the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this">
   * '<code>this</code>'</a> value of the success callback function.</td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>error<br /></code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>callback function</code></p>
   * </td>
   * <td>
   * <p>The callback function called when an error occurs.
   * The callback function will be passed the following arguments:</p>
   * <ul>
   * <li><code>message</code>: Passed either <code>'TIMED_OUT'</code> or <code>'GENERAL'</code>.</li>
   * <li><code>xhr</code>: Passed the XMLHttpRequest.</li>
   * <li><code>setting</code>: Passed the XMLHttpRequest settings.</li>
   * </ul>
   * </td>
   * </tr>
   * <tr>
   * <td>
   * <p><code>success</code></p>
   * </td>
   * <td>Optional</td>
   * <td>
   * <p><code>callback function</code></p>
   * </td>
   * <td>
   * <p>The callback function called when the request is successful.
   * The callback function will be passed the following arguments:</p>
   * <ul>
   * <li><code>text</code>: The text response from the server.
   * For information on the response text, see:
   * <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseText">
   * MDN Web Docs - XMLHttpRequest.responseText</a>.</li>
   * <li><code>xhr</code>: Passed the XMLHttpRequest.</li>
   * <li><code>setting</code>: Passed the XMLHttpRequest settings.</li>
   * </ul>
   * </td>
   * </tr>
   * </tbody>
   * </table>
   * </div>
   */
  send(settings: XHRSettings) {
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
