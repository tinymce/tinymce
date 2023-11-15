/**
 * This class is used to parse CSS styles. It also compresses styles to reduce the output size.
 *
 * @class tinymce.html.Styles
 * @version 3.4
 * @example
 * const Styles = tinymce.html.Styles({
 *   url_converter: (url) => {
 *     return url;
 *   }
 * });
 *
 * styles = Styles.parse('border: 1px solid red');
 * styles.color = 'red';
 *
 * console.log(tinymce.html.Styles().serialize(styles));
 */

import { RgbaColour, Transformations } from '@ephox/acid';
import { Obj, Type, Unicode } from '@ephox/katamari';

import { ForceHexColor, URLConverter } from '../OptionTypes';
import Schema, { SchemaMap } from './Schema';

export type StyleMap = Record<string, string | number>;

export interface StylesSettings {
  allow_script_urls?: boolean;
  allow_svg_data_urls?: boolean;
  url_converter?: URLConverter;
  url_converter_scope?: any;
  force_hex_color?: ForceHexColor;
}

interface Styles {
  parse: (css: string | undefined) => Record<string, string>;
  serialize: (styles: StyleMap, elementName?: string) => string;
}

const Styles = (settings: StylesSettings = {}, schema?: Schema): Styles => {
  /* jshint maxlen:255 */
  /* eslint max-len:0 */
  const urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi;
  const styleRegExp = /\s*([^:]+):\s*([^;]+);?/g;
  const trimRightRegExp = /\s+$/;
  const encodingLookup: Record<string, string> = {};
  let validStyles: Record<string, string[]> | undefined;
  let invalidStyles: Record<string, SchemaMap> | undefined;
  const invisibleChar = Unicode.zeroWidth;

  if (schema) {
    validStyles = schema.getValidStyles();
    invalidStyles = schema.getInvalidStyles();
  }

  const encodingItems = (`\\" \\' \\; \\: ; : ` + invisibleChar).split(' ');
  for (let i = 0; i < encodingItems.length; i++) {
    encodingLookup[encodingItems[i]] = invisibleChar + i;
    encodingLookup[invisibleChar + i] = encodingItems[i];
  }

  const self: Styles = {
    /**
     * Parses the specified style value into an object collection. This parser will also
     * merge and remove any redundant items that browsers might have added. URLs inside
     * the styles will also be converted to absolute/relative based on the settings.
     *
     * @method parse
     * @param {String} css Style value to parse. For example: `border:1px solid red;`
     * @return {Object} Object representation of that style. For example: `{ border: '1px solid red' }`
     */
    parse: (css: string | undefined): Record<string, string> => {
      const styles: Record<string, string> = {};
      let isEncoded = false;
      const urlConverter = settings.url_converter;
      const urlConverterScope = settings.url_converter_scope || self;

      const compress = (prefix: string, suffix: string, noJoin?: boolean) => {
        const top = styles[prefix + '-top' + suffix];
        if (!top) {
          return;
        }

        const right = styles[prefix + '-right' + suffix];
        if (!right) {
          return;
        }

        const bottom = styles[prefix + '-bottom' + suffix];
        if (!bottom) {
          return;
        }

        const left = styles[prefix + '-left' + suffix];
        if (!left) {
          return;
        }

        const box = [ top, right, bottom, left ];
        let i = box.length - 1;
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
      const canCompress = (key: string) => {
        const value = styles[key];

        if (!value) {
          return;
        }

        // Make sure not to split values like 'rgb(100, 50, 100);
        const values = value.indexOf(',') > -1 ? [ value ] : value.split(' ');
        let i = values.length;
        while (i--) {
          if (values[i] !== values[0]) {
            return false;
          }
        }

        styles[key] = values[0];

        return true;
      };

      /**
       * Compresses multiple styles into one style.
       */
      const compress2 = (target: string, a: string, b: string, c: string) => {
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
      const encode = (str: string): string => {
        isEncoded = true;

        return encodingLookup[str];
      };

      // Decodes the specified string by replacing all _<num> with it's original value \" \' etc
      // It will also decode the \" \' if keepSlashes is set to false or omitted
      const decode = (str: string, keepSlashes?: boolean) => {
        if (isEncoded) {
          str = str.replace(/\uFEFF[0-9]/g, (str) => {
            return encodingLookup[str];
          });
        }

        if (!keepSlashes) {
          str = str.replace(/\\([\'\";:])/g, '$1');
        }

        return str;
      };

      const decodeSingleHexSequence = (escSeq: string) => {
        return String.fromCharCode(parseInt(escSeq.slice(1), 16));
      };

      const decodeHexSequences = (value: string) => {
        return value.replace(/\\[0-9a-f]+/gi, decodeSingleHexSequence);
      };

      const processUrl = (match: string, url?: string, url2?: string, url3?: string, str?: string, str2?: string) => {
        str = str || str2;

        if (str) {
          str = decode(str);

          // Force strings into single quote format
          return `'` + str.replace(/\'/g, `\\'`) + `'`;
        }

        url = decode(url || url2 || url3 || '');

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
        return `url('` + url.replace(/\'/g, `\\'`) + `')`;
      };

      if (css) {
        css = css.replace(/[\u0000-\u001F]/g, '');

        // Encode \" \' % and ; and : inside strings so they don't interfere with the style parsing
        css = css.replace(/\\[\"\';:\uFEFF]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, (str) => {
          return str.replace(/[;:]/g, encode);
        });

        // Parse styles
        let matches: RegExpExecArray | null;
        while ((matches = styleRegExp.exec(css))) {
          styleRegExp.lastIndex = matches.index + matches[0].length;
          let name = matches[1].replace(trimRightRegExp, '').toLowerCase();
          let value = matches[2].replace(trimRightRegExp, '');

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

            // Convert RGB/RGBA colors to HEX
            if (Type.isString(settings.force_hex_color) && settings.force_hex_color !== 'off') {
              RgbaColour.fromString(value).each((rgba) => {
                //  Always convert or only convert if there will be no loss of information from the alpha channel
                if (settings.force_hex_color === 'always' || rgba.alpha === 1) {
                  value = Transformations.rgbaToHexString(RgbaColour.toString(rgba));
                }
              });
            }

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
     * @param {Object} styles Object to serialize as string. For example: `{ border: '1px solid red' }`
     * @param {String} elementName Optional element name, if specified only the styles that matches the schema will be serialized.
     * @return {String} String representation of the style object. For example: `border: 1px solid red`
     */
    serialize: (styles: StyleMap, elementName?: string): string => {
      let css = '';

      const serializeStyles = (elemName: string, validStyleList: Record<string, string[]>) => {
        const styleList = validStyleList[elemName];
        if (styleList) {
          for (let i = 0, l = styleList.length; i < l; i++) {
            const name = styleList[i];
            const value = styles[name];

            if (value) {
              css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
            }
          }
        }
      };

      const isValid = (name: string, elemName: string | undefined): boolean => {
        if (!invalidStyles || !elemName) {
          return true;
        }

        let styleMap = invalidStyles['*'];
        if (styleMap && styleMap[name]) {
          return false;
        }

        styleMap = invalidStyles[elemName];
        return !(styleMap && styleMap[name]);
      };

      // Serialize styles according to schema
      if (elementName && validStyles) {
        // Serialize global styles and element specific styles
        serializeStyles('*', validStyles);
        serializeStyles(elementName, validStyles);
      } else {
        // Output the styles in the order they are inside the object
        Obj.each(styles, (value, name) => {
          if (value && isValid(name, elementName)) {
            css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
          }
        });
      }

      return css;
    }
  };

  return self;
};

export default Styles;
