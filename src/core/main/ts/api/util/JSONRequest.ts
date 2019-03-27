/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import JSON from './JSON';
import XHR, { XHRSettings } from './XHR';
import Tools from './Tools';

/**
 * This class enables you to use JSON-RPC to call backend methods.
 *
 * @class tinymce.util.JSONRequest
 * @example
 * var json = new tinymce.util.JSONRequest({
 *     url: 'somebackend.php'
 * });
 *
 * // Send RPC call 1
 * json.send({
 *     method: 'someMethod1',
 *     params: ['a', 'b'],
 *     success: function(result) {
 *         console.dir(result);
 *     }
 * });
 *
 * // Send RPC call 2
 * json.send({
 *     method: 'someMethod2',
 *     params: ['a', 'b'],
 *     success: function(result) {
 *         console.dir(result);
 *     }
 * });
 */

const extend = Tools.extend;

export interface JSONRequestSettings {
  crossDomain?: boolean;
  requestheaders?: Record<string, { key: string, value: string}>;
  type?: string;
  url?: string;
  error_scope?: {};
  success_scope?: {};
  success? (data: any): void;
  error? (error: any): void;
}

export interface JSONRequestArgs extends JSONRequestSettings {
  id?: string;
  method?: string;
  params?: string;
  url: string;
}

export interface JSONRequestConstructor {
  readonly prototype: JSONRequest;

  new (settings?: JSONRequestSettings): JSONRequest;

  sendRPC (o: JSONRequestArgs): void;
}

class JSONRequest {
  /**
   * Simple helper function to send a JSON-RPC request without the need to initialize an object.
   * Consult the Wiki API documentation for more details on what you can pass to this function.
   *
   * @method sendRPC
   * @static
   * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
   */
  public static sendRPC (o: JSONRequestArgs) {
    return new JSONRequest().send(o);
  }

  public settings: JSONRequestSettings;
  public count: number;

  constructor (settings?: JSONRequestSettings) {
    this.settings = extend({}, settings);
    this.count = 0;
  }

  /**
   * Sends a JSON-RPC call. Consult the Wiki API documentation for more details on what you can pass to this function.
   *
   * @method send
   * @param {Object} args Call object where there are three field id, method and params this object should also contain callbacks etc.
   */
  public send (args: JSONRequestArgs) {
    const ecb = args.error, scb = args.success;

    const xhrArgs: XHRSettings = extend(this.settings, args);

    xhrArgs.success = function (c: any, x) {
      c = JSON.parse(c);

      if (typeof c === 'undefined') {
        c = {
          error: 'JSON Parse error.'
        };
      }

      if (c.error) {
        ecb.call(xhrArgs.error_scope || xhrArgs.scope, c.error, x);
      } else {
        scb.call(xhrArgs.success_scope || xhrArgs.scope, c.result);
      }
    };

    xhrArgs.error = function (ty, x) {
      if (ecb) {
        ecb.call(xhrArgs.error_scope || xhrArgs.scope, ty, x);
      }
    };

    xhrArgs.data = JSON.serialize({
      id: args.id || 'c' + (this.count++),
      method: args.method,
      params: args.params
    });

    // JSON content type for Ruby on rails. Bug: #1883287
    xhrArgs.content_type = 'application/json';

    XHR.send(xhrArgs);
  }
}

export default JSONRequest;