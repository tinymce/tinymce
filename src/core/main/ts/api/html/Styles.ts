/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * This class is used to parse CSS styles it also compresses styles to reduce the output size.
 *
 * @example
 * var Styles = new tinymce.html.Styles({
 *    url_converter: function(url) {
 *       return url;
 *    }
 * });
 *
 * styles = Styles.parse('border: 1px solid red');
 * styles.color = 'red';
 *
 * console.log(new tinymce.html.StyleSerializer().serialize(styles));
 *
 * @class tinymce.html.Styles
 * @version 3.4
 */

import Schema from './Schema';

export interface StyleMap { [s: string]: string | number; }
interface Styles {
  toHex(color: string): string;
  parse(css: string): StyleMap;
  serialize(styles: StyleMap, elementName?: string): string;
}

const toHex = (match: string, r: string, g: string, b: string) => {
  const hex = (val: string) => {
    val = parseInt(val, 10).toString(16);

    return val.length > 1 ? val : '0' + val; // 0 -> 00
  };

  return '#' + hex(r) + hex(g) + hex(b);
};

const Styles = function (settings?, schema?: Schema): Styles {
  /*jshint maxlen:255 */
  /*eslint max-len:0 */
  const rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi;
  const urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi;
  const styleRegExp = /\s*([^:]+):\s*([^;]+);?/g;
  const trimRightRegExp = /\s+$/;
  let i;
  const encodingLookup = {};
  let encodingItems;
  let validStyles;
  let invalidStyles;
  const invisibleChar = '\uFEFF';

  settings = settings || {};

  if (schema) {
    validStyles = schema.getValidStyles();
    invalidStyles = schema.getInvalidStyles();
  }

  encodingItems = ('\\" \\\' \\; \\: ; : ' + invisibleChar).split(' ');
  for (i = 0; i < encodingItems.length; i++) {
    encodingLookup[encodingItems[i]] = invisibleChar + i;
    encodingLookup[invisibleChar + i] = encodingItems[i];
  }

  return {
    /**
     * Parses the specified RGB color value and returns a hex version of that color.
     *
     * @method toHex
     * @param {String} color RGB string value like rgb(1,2,3)
     * @return {String} Hex version of that RGB value like #FF00FF.
     */
    toHex (color: string): string {
      return color.replace(rgbRegExp, toHex);
    },

    /**
     * Parses the specified style value into an object collection. This parser will also
     * merge and remove any redundant items that browsers might have added. It will also convert non hex
     * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
     *
     * @method parse
     * @param {String} css Style value to parse for example: border:1px solid red;.
     * @return {Object} Object representation of that style like {border: '1px solid red'}
     */
    parse (css: string): StyleMap {
      const styles: any = {};
      let matches, name, value, isEncoded;
      const urlConverter = settings.url_converter;
      const urlConverterScope = settings.url_converter_scope || this;

      const compress = function (prefix, suffix, noJoin?) {
        let top, right, bottom, left;

        top = styles[prefix + '-top' + suffix];
        if (!top) {
          return;
        }

        right = styles[prefix + '-right' + suffix];
        if (!right) {
          return;
        }

        bottom = styles[prefix + '-bottom' + suffix];
        if (!bottom) {
          return;
        }

        left = styles[prefix + '-left' + suffix];
        if (!left) {
          return;
        }

        const box = [top, right, bottom, left];
        i = box.length - 1;
        while (i--) {
          if (box[i] !== box[i + 1]) {
            break;
          }
        }

        if (i > -1 && noJoin) {
          return;
        }

        styles[prefix + suffix] = i === -1 ? box[0] : box.join(' ');
        delete styles[prefix + '-top' + suffix];
        delete styles[prefix + '-right' + suffix];
        delete styles[prefix + '-bottom' + suffix];
        delete styles[prefix + '-left' + suffix];
      };

      /**
       * Checks if the specific style can be compressed in other words if all border-width are equal.
       */
      const canCompress = function (key) {
        let value = styles[key], i;

        if (!value) {
          return;
        }

        value = value.split(' ');
        i = value.length;
        while (i--) {
          if (value[i] !== value[0]) {
            return false;
          }
        }

        styles[key] = value[0];

        return true;
      };

      /**
       * Compresses multiple styles into one style.
       */
      const compress2 = function (target, a, b, c) {
        if (!canCompress(a)) {
          return;
        }

        if (!canCompress(b)) {
          return;
        }

        if (!canCompress(c)) {
          return;
        }

        // Compress
        styles[target] = styles[a] + ' ' + styles[b] + ' ' + styles[c];
        delete styles[a];
        delete styles[b];
        delete styles[c];
      };

      // Encodes the specified string by replacing all \" \' ; : with _<num>
      const encode = function (str) {
        isEncoded = true;

        return encodingLookup[str];
      };

      // Decodes the specified string by replacing all _<num> with it's original value \" \' etc
      // It will also decode the \" \' if keepSlashes is set to fale or omitted
      const decode = function (str, keepSlashes?) {
        if (isEncoded) {
          str = str.replace(/\uFEFF[0-9]/g, function (str) {
            return encodingLookup[str];
          });
        }

        if (!keepSlashes) {
          str = str.replace(/\\([\'\";:])/g, '$1');
        }

        return str;
      };

      const decodeSingleHexSequence = function (escSeq) {
        return String.fromCharCode(parseInt(escSeq.slice(1), 16));
      };

      const decodeHexSequences = function (value) {
        return value.replace(/\\[0-9a-f]+/gi, decodeSingleHexSequence);
      };

      const processUrl = function (match, url, url2, url3, str, str2) {
        str = str || str2;

        if (str) {
          str = decode(str);

          // Force strings into single quote format
          return '\'' + str.replace(/\'/g, '\\\'') + '\'';
        }

        url = decode(url || url2 || url3);

        if (!settings.allow_script_urls) {
          const scriptUrl = url.replace(/[\s\r\n]+/g, '');

          if (/(java|vb)script:/i.test(scriptUrl)) {
            return '';
          }

          if (!settings.allow_svg_data_urls && /^data:image\/svg/i.test(scriptUrl)) {
            return '';
          }
        }

        // Convert the URL to relative/absolute depending on config
        if (urlConverter) {
          url = urlConverter.call(urlConverterScope, url, 'style');
        }

        // Output new URL format
        return 'url(\'' + url.replace(/\'/g, '\\\'') + '\')';
      };

      if (css) {
        css = css.replace(/[\u0000-\u001F]/g, '');

        // Encode \" \' % and ; and : inside strings so they don't interfere with the style parsing
        css = css.replace(/\\[\"\';:\uFEFF]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, function (str) {
          return str.replace(/[;:]/g, encode);
        });

        // Parse styles
        while ((matches = styleRegExp.exec(css))) {
          styleRegExp.lastIndex = matches.index + matches[0].length;
          name = matches[1].replace(trimRightRegExp, '').toLowerCase();
          value = matches[2].replace(trimRightRegExp, '');

          if (name && value) {
            // Decode escaped sequences like \65 -> e
            name = decodeHexSequences(name);
            value = decodeHexSequences(value);

            // Skip properties with double quotes and sequences like \" \' in their names
            // See 'mXSS Attacks: Attacking well-secured Web-Applications by using innerHTML Mutations'
            // https://cure53.de/fp170.pdf
            if (name.indexOf(invisibleChar) !== -1 || name.indexOf('"') !== -1) {
              continue;
            }

            // Don't allow behavior name or expression/comments within the values
            if (!settings.allow_script_urls && (name === 'behavior' || /expression\s*\(|\/\*|\*\//.test(value))) {
              continue;
            }

            // Opera will produce 700 instead of bold in their style values
            if (name === 'font-weight' && value === '700') {
              value = 'bold';
            } else if (name === 'color' || name === 'background-color') { // Lowercase colors like RED
              value = value.toLowerCase();
            }

            // Convert RGB colors to HEX
            value = value.replace(rgbRegExp, toHex);

            // Convert URLs and force them into url('value') format
            value = value.replace(urlOrStrRegExp, processUrl);
            styles[name] = isEncoded ? decode(value, true) : value;
          }
        }
        // Compress the styles to reduce it's size for example IE will expand styles
        compress('border', '', true);
        compress('border', '-width');
        compress('border', '-color');
        compress('border', '-style');
        compress('padding', '');
        compress('margin', '');
        compress2('border', 'border-width', 'border-style', 'border-color');

        // Remove pointless border, IE produces these
        if (styles.border === 'medium none') {
          delete styles.border;
        }

        // IE 11 will produce a border-image: none when getting the style attribute from <p style="border: 1px solid red"></p>
        // So let us assume it shouldn't be there
        if (styles['border-image'] === 'none') {
          delete styles['border-image'];
        }
      }

      return styles;
    },

    /**
     * Serializes the specified style object into a string.
     *
     * @method serialize
     * @param {Object} styles Object to serialize as string for example: {border: '1px solid red'}
     * @param {String} elementName Optional element name, if specified only the styles that matches the schema will be serialized.
     * @return {String} String representation of the style object for example: border: 1px solid red.
     */
    serialize (styles: StyleMap, elementName?: string): string {
      let css = '', name, value;

      const serializeStyles = (name: string) => {
        let styleList, i, l, value;

        styleList = validStyles[name];
        if (styleList) {
          for (i = 0, l = styleList.length; i < l; i++) {
            name = styleList[i];
            value = styles[name];

            if (value) {
              css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
            }
          }
        }
      };

      const isValid = (name: string, elementName: string): boolean => {
        let styleMap;

        styleMap = invalidStyles['*'];
        if (styleMap && styleMap[name]) {
          return false;
        }

        styleMap = invalidStyles[elementName];
        if (styleMap && styleMap[name]) {
          return false;
        }

        return true;
      };

      // Serialize styles according to schema
      if (elementName && validStyles) {
        // Serialize global styles and element specific styles
        serializeStyles('*');
        serializeStyles(elementName);
      } else {
        // Output the styles in the order they are inside the object
        for (name in styles) {
          value = styles[name];

          if (value && (!invalidStyles || isValid(name, elementName))) {
            css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
          }
        }
      }

      return css;
    }
  };
};

export default Styles;