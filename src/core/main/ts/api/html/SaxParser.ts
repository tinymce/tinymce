/**
 * SaxParser.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Schema from './Schema';
import Entities from './Entities';
import Tools from '../util/Tools';

declare const unescape: any;

/**
 * This class parses HTML code using pure JavaScript and executes various events for each item it finds. It will
 * always execute the events in the right order for tag soup code like <b><p></b></p>. It will also remove elements
 * and attributes that doesn't fit the schema if the validate setting is enabled.
 *
 * @example
 * var parser = new tinymce.html.SaxParser({
 *     validate: true,
 *
 *     comment: function(text) {
 *         console.log('Comment:', text);
 *     },
 *
 *     cdata: function(text) {
 *         console.log('CDATA:', text);
 *     },
 *
 *     text: function(text, raw) {
 *         console.log('Text:', text, 'Raw:', raw);
 *     },
 *
 *     start: function(name, attrs, empty) {
 *         console.log('Start:', name, attrs, empty);
 *     },
 *
 *     end: function(name) {
 *         console.log('End:', name);
 *     },
 *
 *     pi: function(name, text) {
 *         console.log('PI:', name, text);
 *     },
 *
 *     doctype: function(text) {
 *         console.log('DocType:', text);
 *     }
 * }, schema);
 * @class tinymce.html.SaxParser
 * @version 3.4
 */

const isValidPrefixAttrName = function (name) {
  return name.indexOf('data-') === 0 || name.indexOf('aria-') === 0;
};

const trimComments = function (text) {
  return text.replace(/<!--|-->/g, '');
};

const isInvalidUri = (settings, uri: string) => {
  if (settings.allow_html_data_urls) {
    return false;
  } else if (/^data:image\//i.test(uri)) {
    return settings.allow_svg_data_urls === false && /^data:image\/svg\+xml/i.test(uri);
  } else {
    return /^data:/i.test(uri);
  }
};

/**
 * Returns the index of the end tag for a specific start tag. This can be
 * used to skip all children of a parent element from being processed.
 *
 * @private
 * @method findEndTag
 * @param {tinymce.html.Schema} schema Schema instance to use to match short ended elements.
 * @param {String} html HTML string to find the end tag in.
 * @param {Number} startIndex Indext to start searching at should be after the start tag.
 * @return {Number} Index of the end tag.
 */
const findEndTagIndex = function (schema, html, startIndex) {
  let count = 1, index, matches, tokenRegExp, shortEndedElements;

  shortEndedElements = schema.getShortEndedElements();
  tokenRegExp = /<([!?\/])?([A-Za-z0-9\-_\:\.]+)((?:\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\/|\s+)>/g;
  tokenRegExp.lastIndex = index = startIndex;

  while ((matches = tokenRegExp.exec(html))) {
    index = tokenRegExp.lastIndex;

    if (matches[1] === '/') { // End element
      count--;
    } else if (!matches[1]) { // Start element
      if (matches[2] in shortEndedElements) {
        continue;
      }

      count++;
    }

    if (count === 0) {
      break;
    }
  }

  return index;
};

/**
 * Constructs a new SaxParser instance.
 *
 * @constructor
 * @method SaxParser
 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
 */
export function SaxParser(settings, schema = Schema()) {
  const noop = function () { };

  settings = settings || {};

  if (settings.fix_self_closing !== false) {
    settings.fix_self_closing = true;
  }

  const comment = settings.comment ? settings.comment : noop;
  const cdata = settings.cdata ? settings.cdata : noop;
  const text = settings.text ? settings.text : noop;
  const start = settings.start ? settings.start : noop;
  const end = settings.end ? settings.end : noop;
  const pi = settings.pi ? settings.pi : noop;
  const doctype = settings.doctype ? settings.doctype : noop;

  /**
   * Parses the specified HTML string and executes the callbacks for each item it finds.
   *
   * @example
   * SaxParser({...}).parse('<b>text</b>');
   * @method parse
   * @param {String} html Html string to sax parse.
   */
  const parse = (html: string) => {
    let matches, index = 0, value, endRegExp;
    const stack = [];
    let attrList, i, textData, name;
    let isInternalElement, removeInternalElements, shortEndedElements, fillAttrsMap, isShortEnded;
    let validate, elementRule, isValidElement, attr, attribsValue, validAttributesMap, validAttributePatterns;
    let attributesRequired, attributesDefault, attributesForced, processHtml;
    let anyAttributesRequired, selfClosing, tokenRegExp, attrRegExp, specialElements, attrValue, idCount = 0;
    const decode = Entities.decode;
    let fixSelfClosing;
    const filteredUrlAttrs = Tools.makeMap('src,href,data,background,formaction,poster,xlink:href');
    const scriptUriRegExp = /((java|vb)script|mhtml):/i;

    const processEndTag = function (name) {
      let pos, i;

      // Find position of parent of the same type
      pos = stack.length;
      while (pos--) {
        if (stack[pos].name === name) {
          break;
        }
      }

      // Found parent
      if (pos >= 0) {
        // Close all the open elements
        for (i = stack.length - 1; i >= pos; i--) {
          name = stack[i];

          if (name.valid) {
            end(name.name);
          }
        }

        // Remove the open elements from the stack
        stack.length = pos;
      }
    };

    const parseAttribute = function (match, name, value, val2, val3) {
      let attrRule, i;
      const trimRegExp = /[\s\u0000-\u001F]+/g;

      name = name.toLowerCase();
      value = name in fillAttrsMap ? name : decode(value || val2 || val3 || ''); // Handle boolean attribute than value attribute

      // Validate name and value pass through all data- attributes
      if (validate && !isInternalElement && isValidPrefixAttrName(name) === false) {
        attrRule = validAttributesMap[name];

        // Find rule by pattern matching
        if (!attrRule && validAttributePatterns) {
          i = validAttributePatterns.length;
          while (i--) {
            attrRule = validAttributePatterns[i];
            if (attrRule.pattern.test(name)) {
              break;
            }
          }

          // No rule matched
          if (i === -1) {
            attrRule = null;
          }
        }

        // No attribute rule found
        if (!attrRule) {
          return;
        }

        // Validate value
        if (attrRule.validValues && !(value in attrRule.validValues)) {
          return;
        }
      }

      // Block any javascript: urls or non image data uris
      if (filteredUrlAttrs[name] && !settings.allow_script_urls) {
        let uri = value.replace(trimRegExp, '');

        try {
          // Might throw malformed URI sequence
          uri = decodeURIComponent(uri);
        } catch (ex) {
          // Fallback to non UTF-8 decoder
          uri = unescape(uri);
        }

        if (scriptUriRegExp.test(uri)) {
          return;
        }

        if (isInvalidUri(settings, uri)) {
          return;
        }
      }

      // Block data or event attributes on elements marked as internal
      if (isInternalElement && (name in filteredUrlAttrs || name.indexOf('on') === 0)) {
        return;
      }

      // Add attribute to list and map
      attrList.map[name] = value;
      attrList.push({
        name,
        value
      });
    };

    // Precompile RegExps and map objects
    tokenRegExp = new RegExp('<(?:' +
      '(?:!--([\\w\\W]*?)-->)|' + // Comment
      '(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + // CDATA
      '(?:!DOCTYPE([\\w\\W]*?)>)|' + // DOCTYPE
      '(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|' + // PI
      '(?:\\/([A-Za-z][A-Za-z0-9\\-_\\:\\.]*)>)|' + // End element
      '(?:([A-Za-z][A-Za-z0-9\\-_\\:\\.]*)((?:\\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\\/|\\s+)>)' + // Start element
      ')', 'g');

    attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:[^\"])*)\")|(?:\'((?:[^\'])*)\')|([^>\s]+)))?/g;

    // Setup lookup tables for empty elements and boolean attributes
    shortEndedElements = schema.getShortEndedElements();
    selfClosing = settings.self_closing_elements || schema.getSelfClosingElements();
    fillAttrsMap = schema.getBoolAttrs();
    validate = settings.validate;
    removeInternalElements = settings.remove_internals;
    fixSelfClosing = settings.fix_self_closing;
    specialElements = schema.getSpecialElements();
    processHtml = html + '>';

    while ((matches = tokenRegExp.exec(processHtml))) { // Adds and extra '>' to keep regexps from doing catastrofic backtracking on malformed html
      // Text
      if (index < matches.index) {
        text(decode(html.substr(index, matches.index - index)));
      }

      if ((value = matches[6])) { // End element
        value = value.toLowerCase();

        // IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
        if (value.charAt(0) === ':') {
          value = value.substr(1);
        }

        processEndTag(value);
      } else if ((value = matches[7])) { // Start element
        // Did we consume the extra character then treat it as text
        // This handles the case with html like this: "text a<b text"
        if (matches.index + matches[0].length > html.length) {
          text(decode(html.substr(matches.index)));
          index = matches.index + matches[0].length;
          continue;
        }

        value = value.toLowerCase();

        // IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
        if (value.charAt(0) === ':') {
          value = value.substr(1);
        }

        isShortEnded = value in shortEndedElements;

        // Is self closing tag for example an <li> after an open <li>
        if (fixSelfClosing && selfClosing[value] && stack.length > 0 && stack[stack.length - 1].name === value) {
          processEndTag(value);
        }

        // Validate element
        if (!validate || (elementRule = schema.getElementRule(value))) {
          isValidElement = true;

          // Grab attributes map and patters when validation is enabled
          if (validate) {
            validAttributesMap = elementRule.attributes;
            validAttributePatterns = elementRule.attributePatterns;
          }

          // Parse attributes
          if ((attribsValue = matches[8])) {
            isInternalElement = attribsValue.indexOf('data-mce-type') !== -1; // Check if the element is an internal element

            // If the element has internal attributes then remove it if we are told to do so
            if (isInternalElement && removeInternalElements) {
              isValidElement = false;
            }

            attrList = [];
            attrList.map = {};

            attribsValue.replace(attrRegExp, parseAttribute);
          } else {
            attrList = [];
            attrList.map = {};
          }

          // Process attributes if validation is enabled
          if (validate && !isInternalElement) {
            attributesRequired = elementRule.attributesRequired;
            attributesDefault = elementRule.attributesDefault;
            attributesForced = elementRule.attributesForced;
            anyAttributesRequired = elementRule.removeEmptyAttrs;

            // Check if any attribute exists
            if (anyAttributesRequired && !attrList.length) {
              isValidElement = false;
            }

            // Handle forced attributes
            if (attributesForced) {
              i = attributesForced.length;
              while (i--) {
                attr = attributesForced[i];
                name = attr.name;
                attrValue = attr.value;

                if (attrValue === '{$uid}') {
                  attrValue = 'mce_' + idCount++;
                }

                attrList.map[name] = attrValue;
                attrList.push({ name, value: attrValue });
              }
            }

            // Handle default attributes
            if (attributesDefault) {
              i = attributesDefault.length;
              while (i--) {
                attr = attributesDefault[i];
                name = attr.name;

                if (!(name in attrList.map)) {
                  attrValue = attr.value;

                  if (attrValue === '{$uid}') {
                    attrValue = 'mce_' + idCount++;
                  }

                  attrList.map[name] = attrValue;
                  attrList.push({ name, value: attrValue });
                }
              }
            }

            // Handle required attributes
            if (attributesRequired) {
              i = attributesRequired.length;
              while (i--) {
                if (attributesRequired[i] in attrList.map) {
                  break;
                }
              }

              // None of the required attributes where found
              if (i === -1) {
                isValidElement = false;
              }
            }

            // Invalidate element if it's marked as bogus
            if ((attr = attrList.map['data-mce-bogus'])) {
              if (attr === 'all') {
                index = findEndTagIndex(schema, html, tokenRegExp.lastIndex);
                tokenRegExp.lastIndex = index;
                continue;
              }

              isValidElement = false;
            }
          }

          if (isValidElement) {
            start(value, attrList, isShortEnded);
          }
        } else {
          isValidElement = false;
        }

        // Treat script, noscript and style a bit different since they may include code that looks like elements
        if ((endRegExp = specialElements[value])) {
          endRegExp.lastIndex = index = matches.index + matches[0].length;

          if ((matches = endRegExp.exec(html))) {
            if (isValidElement) {
              textData = html.substr(index, matches.index - index);
            }

            index = matches.index + matches[0].length;
          } else {
            textData = html.substr(index);
            index = html.length;
          }

          if (isValidElement) {
            if (textData.length > 0) {
              text(textData, true);
            }

            end(value);
          }

          tokenRegExp.lastIndex = index;
          continue;
        }

        // Push value on to stack
        if (!isShortEnded) {
          if (!attribsValue || attribsValue.indexOf('/') !== attribsValue.length - 1) {
            stack.push({ name: value, valid: isValidElement });
          } else if (isValidElement) {
            end(value);
          }
        }
      } else if ((value = matches[1])) { // Comment
        // Padd comment value to avoid browsers from parsing invalid comments as HTML
        if (value.charAt(0) === '>') {
          value = ' ' + value;
        }

        if (!settings.allow_conditional_comments && value.substr(0, 3).toLowerCase() === '[if') {
          value = ' ' + value;
        }

        comment(value);
      } else if ((value = matches[2])) { // CDATA
        cdata(trimComments(value));
      } else if ((value = matches[3])) { // DOCTYPE
        doctype(value);
      } else if ((value = matches[4])) { // PI
        pi(value, matches[5]);
      }

      index = matches.index + matches[0].length;
    }

    // Text
    if (index < html.length) {
      text(decode(html.substr(index)));
    }

    // Close any open elements
    for (i = stack.length - 1; i >= 0; i--) {
      value = stack[i];

      if (value.valid) {
        end(value.name);
      }
    }
  };

  return {
    parse
  };
}

export namespace SaxParser {
  export const findEndTag = findEndTagIndex;
}

export default SaxParser;
