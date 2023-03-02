import { Arr, Type } from '@ephox/katamari';

import Entities from '../html/Entities';
import Tools from './Tools';

/**
 * This class handles parsing, modification and serialization of URI/URL strings.
 * @class tinymce.util.URI
 */

const each = Tools.each, trim = Tools.trim;
const queryParts = [
  'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host',
  'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
] as const;
const DEFAULT_PORTS: Record<string, number> = {
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

  getDocumentBaseUrl: (loc: { protocol: string; host?: string; href?: string; pathname?: string }) => string;
  parseDataUri: (uri: string) => { type: string; data: string };
}

interface SafeUriOptions {
  readonly allow_html_data_urls?: boolean;
  readonly allow_script_urls?: boolean;
  readonly allow_svg_data_urls?: boolean;
}

const safeSvgDataUrlElements = [ 'img', 'video' ];

const blockSvgDataUris = (allowSvgDataUrls: boolean | undefined, tagName?: string) => {
  if (Type.isNonNullable(allowSvgDataUrls)) {
    return !allowSvgDataUrls;
  } else {
    // Only allow SVGs by default on images/videos since the browser won't execute scripts on those elements
    return Type.isNonNullable(tagName) ? !Arr.contains(safeSvgDataUrlElements, tagName) : true;
  }
};

const decodeUri = (encodedUri: string) => {
  try {
    // Might throw malformed URI sequence
    return decodeURIComponent(encodedUri);
  } catch (ex) {
    // Fallback to non UTF-8 decoder
    return unescape(encodedUri);
  }
};

export const isInvalidUri = (settings: SafeUriOptions, uri: string, tagName?: string): boolean => {
  // remove all whitespaces from decoded uri to prevent impact on regex matching
  const decodedUri = decodeUri(uri).replace(/\s/g, '');

  if (settings.allow_script_urls) {
    return false;
  // Ensure we don't have a javascript URI, as that is not safe since it allows arbitrary JavaScript execution
  } else if (/((java|vb)script|mhtml):/i.test(decodedUri)) {
    return true;
  } else if (settings.allow_html_data_urls) {
    return false;
  } else if (/^data:image\//i.test(decodedUri)) {
    return blockSvgDataUris(settings.allow_svg_data_urls, tagName) && /^data:image\/svg\+xml/i.test(decodedUri);
  } else {
    return /^data:/i.test(decodedUri);
  }
};

class URI {

  public static parseDataUri(uri: string): { type: string | undefined; data: string } {
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

  /**
   * Check to see if a URI is safe to use in the Document Object Model (DOM). This will return
   * true if the URI can be used in the DOM without potentially triggering a security issue.
   *
   * @method isDomSafe
   * @static
   * @param {String} uri The URI to be validated.
   * @param {Object} context An optional HTML tag name where the element is being used.
   * @param {Object} options An optional set of options to use when determining if the URI is safe.
   * @return {Boolean} True if the URI is safe, otherwise false.
   */
  public static isDomSafe(uri: string, context?: string, options: SafeUriOptions = {}): boolean {
    if (options.allow_script_urls) {
      return true;
    } else {
      const decodedUri = Entities.decode(uri).replace(/[\s\u0000-\u001F]+/g, '');
      return !isInvalidUri(options, decodedUri, context);
    }
  }

  public static getDocumentBaseUrl(loc: { protocol: string; host?: string; href?: string; pathname?: string }): string {
    let baseUrl: string;

    // Pass applewebdata:// and other non web protocols though
    if (loc.protocol.indexOf('http') !== 0 && loc.protocol !== 'file:') {
      baseUrl = loc.href ?? '';
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

  public source!: string;
  public protocol: string | undefined;
  public authority: string | undefined;
  public userInfo: string | undefined;
  public user: string | undefined;
  public password: string | undefined;
  public host: string | undefined;
  public port: string | undefined;
  public relative: string | undefined;
  public path: string = '';
  public directory: string = '';
  public file: string | undefined;
  public query: string | undefined;
  public anchor: string | undefined;
  public settings: URISettings;

  /**
   * Constructs a new URI instance.
   *
   * @constructor
   * @method URI
   * @param {String} url URI string to parse.
   * @param {Object} settings Optional settings object.
   */
  public constructor(url: string, settings: URISettings = {}) {
    url = trim(url);
    this.settings = settings;
    const baseUri = settings.base_uri;
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
      const baseUrl = baseUri ? baseUri.path : new URI(document.location.href).directory;
      if (baseUri?.protocol === '') {
        url = '//mce_host' + self.toAbsPath(baseUrl, url);
      } else {
        const match = /([^#?]*)([#?]?.*)/.exec(url);
        if (match) {
          url = ((baseUri && baseUri.protocol) || 'http') + '://mce_host' + self.toAbsPath(baseUrl, match[1]) + match[2];
        }
      }
    }

    // Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
    url = url.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something

    const urlMatch = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?(\[[a-zA-Z0-9:.%]+\]|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url);

    if (urlMatch) {
      each(queryParts, (v, i) => {
        let part = urlMatch[i];

        // Zope 3 workaround, they use @@something
        if (part) {
          part = part.replace(/\(mce_at\)/g, '@@');
        }

        self[v] = part;
      });
    }

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
   * @param {String} path Path string to set.
   */
  public setPath(path: string): void {
    const pathMatch = /^(.*?)\/?(\w+)?$/.exec(path);

    // Update path parts
    if (pathMatch) {
      this.path = pathMatch[0];
      this.directory = pathMatch[1];
      this.file = pathMatch[2];
    }

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
   * const url = new tinymce.util.URI('http://www.site.com/dir/').toRelative('http://www.site.com/dir/somedir/somefile.htm');
   */
  public toRelative(uri: string): string {
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

    let output = this.toRelPath(this.path, relativeUri.path);

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
   * const url = new tinymce.util.URI('http://www.site.com/dir/').toAbsolute('somedir/somefile.htm');
   */
  public toAbsolute(uri: string, noHost?: boolean): string {
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
  public isSameOrigin(uri: URI): boolean {
    // eslint-disable-next-line eqeqeq
    if (this.host == uri.host && this.protocol == uri.protocol) {
      // eslint-disable-next-line eqeqeq
      if (this.port == uri.port) {
        return true;
      }

      const defaultPort = this.protocol ? DEFAULT_PORTS[this.protocol] : null;
      // eslint-disable-next-line eqeqeq
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
  public toRelPath(base: string, path: string): string {
    let breakPoint = 0, out = '', i, l;

    // Split the paths
    const normalizedBase = base.substring(0, base.lastIndexOf('/')).split('/');
    const items = path.split('/');

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
  public toAbsPath(base: string, path: string): string {
    let nb = 0;

    // Split paths
    const tr = /\/$/.test(path) ? '/' : '';
    const normalizedBase = base.split('/');
    const normalizedPath = path.split('/');

    // Remove empty chunks
    const baseParts: string[] = [];
    each(normalizedBase, (k) => {
      if (k) {
        baseParts.push(k);
      }
    });

    // Merge relURLParts chunks
    const pathParts: string[] = [];
    for (let i = normalizedPath.length - 1; i >= 0; i--) {
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

      pathParts.push(normalizedPath[i]);
    }

    const i = baseParts.length - nb;

    // If /a/b/c or /
    let outPath: string;
    if (i <= 0) {
      outPath = Arr.reverse(pathParts).join('/');
    } else {
      outPath = baseParts.slice(0, i).join('/') + '/' + Arr.reverse(pathParts).join('/');
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
  public getURI(noProtoHost: boolean = false): string {
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
