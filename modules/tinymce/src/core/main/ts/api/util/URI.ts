/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document } from '@ephox/dom-globals';
import Tools from './Tools';

/**
 * This class handles parsing, modification and serialization of URI/URL strings.
 * @class tinymce.util.URI
 */

const each = Tools.each, trim = Tools.trim;
const queryParts = 'source protocol authority userInfo user password host port relative path directory file query anchor'.split(' ');
const DEFAULT_PORTS = {
  ftp: 21,
  http: 80,
  https: 443,
  mailto: 25
};

export interface URISettings {
  base_uri?: URI;
}

export interface URIConstructor {
  readonly prototype: URI;

  new (url: string, settings?: URISettings): URI;

  getDocumentBaseUrl (loc: { protocol: string; host?: string; href?: string; pathname?: string }): string;
  parseDataUri (uri: string): { type: string; data: string };
}

class URI {

  public static parseDataUri (uri: string): { type: string; data: string} {
    let type;

    const uriComponents = decodeURIComponent(uri).split(',');

    const matches = /data:([^;]+)/.exec(uriComponents[0]);
    if (matches) {
      type = matches[1];
    }

    return {
      type,
      data: uriComponents[1]
    };
  }

  public static getDocumentBaseUrl (loc: { protocol: string; host?: string; href?: string; pathname?: string }): string {
    let baseUrl;

    // Pass applewebdata:// and other non web protocols though
    if (loc.protocol.indexOf('http') !== 0 && loc.protocol !== 'file:') {
      baseUrl = loc.href;
    } else {
      baseUrl = loc.protocol + '//' + loc.host + loc.pathname;
    }

    if (/^[^:]+:\/\/\/?[^\/]+\//.test(baseUrl)) {
      baseUrl = baseUrl.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');

      if (!/[\/\\]$/.test(baseUrl)) {
        baseUrl += '/';
      }
    }

    return baseUrl;
  }

  public source: string;
  public protocol: string;
  public authority: string;
  public userInfo: string;
  public user: string;
  public password: string;
  public host: string;
  public port: string;
  public relative: string;
  public path: string;
  public directory: string;
  public file: string;
  public query: string;
  public anchor: string;
  public settings: URISettings;

  /**
   * Constructs a new URI instance.
   *
   * @constructor
   * @method URI
   * @param {String} url URI string to parse.
   * @param {Object} settings Optional settings object.
   */
  constructor(url: string, settings?: URISettings) {
    url = trim(url);
    this.settings = settings || {};
    const baseUri: URI = this.settings.base_uri;
    const self = this;

    // Strange app protocol that isn't http/https or local anchor
    // For example: mailto,skype,tel etc.
    if (/^([\w\-]+):([^\/]{2})/i.test(url) || /^\s*#/.test(url)) {
      self.source = url;
      return;
    }

    const isProtocolRelative = url.indexOf('//') === 0;

    // Absolute path with no host, fake host and protocol
    if (url.indexOf('/') === 0 && !isProtocolRelative) {
      url = (baseUri ? baseUri.protocol || 'http' : 'http') + '://mce_host' + url;
    }

    // Relative path http:// or protocol relative //path
    if (!/^[\w\-]*:?\/\//.test(url)) {
      const baseUrl = this.settings.base_uri ? this.settings.base_uri.path : new URI(document.location.href).directory;
      // tslint:disable-next-line:triple-equals
      if (this.settings.base_uri && this.settings.base_uri.protocol == '') {
        url = '//mce_host' + self.toAbsPath(baseUrl, url);
      } else {
        const match = /([^#?]*)([#?]?.*)/.exec(url);
        url = ((baseUri && baseUri.protocol) || 'http') + '://mce_host' + self.toAbsPath(baseUrl, match[1]) + match[2];
      }
    }

    // Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
    url = url.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something

    const urlMatch = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url);

    each(queryParts, (v, i) => {
      let part = urlMatch[i];

      // Zope 3 workaround, they use @@something
      if (part) {
        part = part.replace(/\(mce_at\)/g, '@@');
      }

      self[v] = part;
    });

    if (baseUri) {
      if (!self.protocol) {
        self.protocol = baseUri.protocol;
      }

      if (!self.userInfo) {
        self.userInfo = baseUri.userInfo;
      }

      if (!self.port && self.host === 'mce_host') {
        self.port = baseUri.port;
      }

      if (!self.host || self.host === 'mce_host') {
        self.host = baseUri.host;
      }

      self.source = '';
    }

    if (isProtocolRelative) {
      self.protocol = '';
    }
  }

  /**
   * Sets the internal path part of the URI.
   *
   * @method setPath
   * @param {string} path Path string to set.
   */
  public setPath (path: string) {
    const pathMatch = /^(.*?)\/?(\w+)?$/.exec(path);

    // Update path parts
    this.path = pathMatch[0];
    this.directory = pathMatch[1];
    this.file = pathMatch[2];

    // Rebuild source
    this.source = '';
    this.getURI();
  }

  /**
   * Converts the specified URI into a relative URI based on the current URI instance location.
   *
   * @method toRelative
   * @param {String} uri URI to convert into a relative path/URI.
   * @return {String} Relative URI from the point specified in the current URI instance.
   * @example
   * // Converts an absolute URL to an relative URL url will be somedir/somefile.htm
   * var url = new tinymce.util.URI('http://www.site.com/dir/').toRelative('http://www.site.com/dir/somedir/somefile.htm');
   */
  public toRelative (uri: string): string {
    let output;

    if (uri === './') {
      return uri;
    }

    const relativeUri = new URI(uri, { base_uri: this });

    // Not on same domain/port or protocol
    if ((relativeUri.host !== 'mce_host' && this.host !== relativeUri.host && relativeUri.host) || this.port !== relativeUri.port ||
      (this.protocol !== relativeUri.protocol && relativeUri.protocol !== '')) {
      return relativeUri.getURI();
    }

    const tu = this.getURI(), uu = relativeUri.getURI();

    // Allow usage of the base_uri when relative_urls = true
    if (tu === uu || (tu.charAt(tu.length - 1) === '/' && tu.substr(0, tu.length - 1) === uu)) {
      return tu;
    }

    output = this.toRelPath(this.path, relativeUri.path);

    // Add query
    if (relativeUri.query) {
      output += '?' + relativeUri.query;
    }

    // Add anchor
    if (relativeUri.anchor) {
      output += '#' + relativeUri.anchor;
    }

    return output;
  }

  /**
   * Converts the specified URI into a absolute URI based on the current URI instance location.
   *
   * @method toAbsolute
   * @param {String} uri URI to convert into a relative path/URI.
   * @param {Boolean} noHost No host and protocol prefix.
   * @return {String} Absolute URI from the point specified in the current URI instance.
   * @example
   * // Converts an relative URL to an absolute URL url will be http://www.site.com/dir/somedir/somefile.htm
   * var url = new tinymce.util.URI('http://www.site.com/dir/').toAbsolute('somedir/somefile.htm');
   */
  public toAbsolute (uri: string, noHost?: boolean): string {
    const absoluteUri = new URI(uri, { base_uri: this });

    return absoluteUri.getURI(noHost && this.isSameOrigin(absoluteUri));
  }

  /**
   * Determine whether the given URI has the same origin as this URI.  Based on RFC-6454.
   * Supports default ports for protocols listed in DEFAULT_PORTS.  Unsupported protocols will fail safe: they
   * won't match, if the port specifications differ.
   *
   * @method isSameOrigin
   * @param {tinymce.util.URI} uri Uri instance to compare.
   * @returns {Boolean} True if the origins are the same.
   */
  public isSameOrigin (uri: URI): boolean {
    // tslint:disable-next-line:triple-equals
    if (this.host == uri.host && this.protocol == uri.protocol) {
      // tslint:disable-next-line:triple-equals
      if (this.port == uri.port) {
        return true;
      }

      const defaultPort = DEFAULT_PORTS[this.protocol];
      // tslint:disable-next-line:triple-equals
      if (defaultPort && ((this.port || defaultPort) == (uri.port || defaultPort))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Converts a absolute path into a relative path.
   *
   * @method toRelPath
   * @param {String} base Base point to convert the path from.
   * @param {String} path Absolute path to convert into a relative path.
   */
  public toRelPath (base: string, path: string): string {
    let items, breakPoint = 0, out = '', i, l;

    // Split the paths
    const normalizedBase = base.substring(0, base.lastIndexOf('/')).split('/');
    items = path.split('/');

    if (normalizedBase.length >= items.length) {
      for (i = 0, l = normalizedBase.length; i < l; i++) {
        if (i >= items.length || normalizedBase[i] !== items[i]) {
          breakPoint = i + 1;
          break;
        }
      }
    }

    if (normalizedBase.length < items.length) {
      for (i = 0, l = items.length; i < l; i++) {
        if (i >= normalizedBase.length || normalizedBase[i] !== items[i]) {
          breakPoint = i + 1;
          break;
        }
      }
    }

    if (breakPoint === 1) {
      return path;
    }

    for (i = 0, l = normalizedBase.length - (breakPoint - 1); i < l; i++) {
      out += '../';
    }

    for (i = breakPoint - 1, l = items.length; i < l; i++) {
      if (i !== breakPoint - 1) {
        out += '/' + items[i];
      } else {
        out += items[i];
      }
    }

    return out;
  }

  /**
   * Converts a relative path into a absolute path.
   *
   * @method toAbsPath
   * @param {String} base Base point to convert the path from.
   * @param {String} path Relative path to convert into an absolute path.
   */
  public toAbsPath (base: string, path: string): string {
    let i, nb = 0, o = [], tr, outPath;

    // Split paths
    tr = /\/$/.test(path) ? '/' : '';
    let normalizedBase = base.split('/');
    const normalizedPath = path.split('/');

    // Remove empty chunks
    each(normalizedBase, function (k) {
      if (k) {
        o.push(k);
      }
    });

    normalizedBase = o;

    // Merge relURLParts chunks
    for (i = normalizedPath.length - 1, o = []; i >= 0; i--) {
      // Ignore empty or .
      if (normalizedPath[i].length === 0 || normalizedPath[i] === '.') {
        continue;
      }

      // Is parent
      if (normalizedPath[i] === '..') {
        nb++;
        continue;
      }

      // Move up
      if (nb > 0) {
        nb--;
        continue;
      }

      o.push(normalizedPath[i]);
    }

    i = normalizedBase.length - nb;

    // If /a/b/c or /
    if (i <= 0) {
      outPath = o.reverse().join('/');
    } else {
      outPath = normalizedBase.slice(0, i).join('/') + '/' + o.reverse().join('/');
    }

    // Add front / if it's needed
    if (outPath.indexOf('/') !== 0) {
      outPath = '/' + outPath;
    }

    // Add trailing / if it's needed
    if (tr && outPath.lastIndexOf('/') !== outPath.length - 1) {
      outPath += tr;
    }

    return outPath;
  }

  /**
   * Returns the full URI of the internal structure.
   *
   * @method getURI
   * @param {Boolean} noProtoHost Optional no host and protocol part. Defaults to false.
   */
  public getURI (noProtoHost: boolean = false): string {
    let s;

    // Rebuild source
    if (!this.source || noProtoHost) {
      s = '';

      if (!noProtoHost) {
        if (this.protocol) {
          s += this.protocol + '://';
        } else {
          s += '//';
        }

        if (this.userInfo) {
          s += this.userInfo + '@';
        }

        if (this.host) {
          s += this.host;
        }

        if (this.port) {
          s += ':' + this.port;
        }
      }

      if (this.path) {
        s += this.path;
      }

      if (this.query) {
        s += '?' + this.query;
      }

      if (this.anchor) {
        s += '#' + this.anchor;
      }

      this.source = s;
    }

    return this.source;
  }
}

export default URI;
