/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import JSON from './JSON';
import XHR from './XHR';
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

const JSONRequest: any = function (settings) {
  this.settings = extend({}, settings);
  this.count = 0;
};

/**
 * Simple helper function to send a JSON-RPC request without the need to initialize an object.
 * Consult the Wiki API documentation for more details on what you can pass to this function.
 *
 * @method sendRPC
 * @static
 * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
 */
JSONRequest.sendRPC = function (o) {
  return new JSONRequest().send(o);
};

JSONRequest.prototype = {
  /**
   * Sends a JSON-RPC call. Consult the Wiki API documentation for more details on what you can pass to this function.
   *
   * @method send
   * @param {Object} args Call object where there are three field id, method and params this object should also contain callbacks etc.
   */
  send (args) {
    const ecb = args.error, scb = args.success;

    args = extend(this.settings, args);

    args.success = function (c, x) {
      c = JSON.parse(c);

      if (typeof c === 'undefined') {
        c = {
          error: 'JSON Parse error.'
        };
      }

      if (c.error) {
        ecb.call(args.error_scope || args.scope, c.error, x);
      } else {
        scb.call(args.success_scope || args.scope, c.result);
      }
    };

    args.error = function (ty, x) {
      if (ecb) {
        ecb.call(args.error_scope || args.scope, ty, x);
      }
    };

    args.data = JSON.serialize({
      id: args.id || 'c' + (this.count++),
      method: args.method,
      params: args.params
    });

    // JSON content type for Ruby on rails. Bug: #1883287
    args.content_type = 'application/json';

    XHR.send(args);
  }
};

export default JSONRequest;