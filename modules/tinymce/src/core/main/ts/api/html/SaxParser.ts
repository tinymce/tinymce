/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Strings } from '@ephox/katamari';
import Tools from '../util/Tools';
import Entities from './Entities';
import Schema from './Schema';

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

type AttrList = Array<{ name: string, value: string }> & { map: Record<string, string> };

export interface SaxParserSettings {
  allow_conditional_comments?: boolean;
  allow_html_data_urls?: boolean;
  allow_script_urls?: boolean;
  allow_svg_data_urls?: boolean;
  fix_self_closing?: boolean;
  preserve_cdata?: boolean;
  remove_internals?: boolean;
  self_closing_elements?: Record<string, {}>;
  validate?: boolean;

  cdata? (text: string): void;
  comment? (text: string): void;
  doctype? (text: string): void;
  end? (name: string): void;
  pi? (name: string, text: string): void;
  start? (name: string, attrs: AttrList, empty: boolean): void;
  text? (text: string, raw?: boolean): void;
}

type ParserFormat = 'html' | 'xhtml' | 'xml';

interface SaxParser {
  parse (html: string, format?: ParserFormat): void;
}

const enum ParsingMode {
  Html,
  Xml
}

const enum MatchType {
  Comment = 1,
  CData = 2,
  Doctype = 3,
  MalformedComment = 4,
  ProcessingInstruction = 5,
  ProcessingInstructionContent = 6,
  ElementEnd = 7,
  ElementStart = 8,
  Attribute = 9
}

const isValidPrefixAttrName = (name: string): boolean => {
  return name.indexOf('data-') === 0 || name.indexOf('aria-') === 0;
};

const isInvalidUri = (settings: SaxParserSettings, uri: string) => {
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
 * @method findEndTagIndex
 * @param {tinymce.html.Schema} schema Schema instance to use to match short ended elements.
 * @param {String} html HTML string to find the end tag in.
 * @param {Number} startIndex Index to start searching at should be after the start tag.
 * @return {Number} Index of the end tag.
 */
const findEndTagIndex = (schema: Schema, html: string, startIndex: number): number => {
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

const isConditionalComment = (html: string, startIndex: number) => /^\s*\[if [\w\W]+\]>.*<!\[endif\](--!?)?>/.test(html.substr(startIndex));

const findCommentEndIndex = (html: string, isBogus: boolean, startIndex: number = 0) => {
  const lcHtml = html.toLowerCase();
  if (lcHtml.indexOf('[if ', startIndex) !== -1 && isConditionalComment(lcHtml, startIndex)) {
    const endIfIndex = lcHtml.indexOf('[endif]', startIndex);
    return lcHtml.indexOf('>', endIfIndex);
  } else {
    if (isBogus) {
      const endIndex = lcHtml.indexOf('>', startIndex);
      return endIndex !== -1 ? endIndex : lcHtml.length;
    } else {
      const endCommentRegexp = /--!?>/;
      endCommentRegexp.lastIndex = startIndex;
      const match = endCommentRegexp.exec(html);
      return match ? match.index + match[0].length : lcHtml.length;
    }
  }
};

const checkBogusAttribute = (regExp: RegExp, attrString: string): string | null => {
  const matches = regExp.exec(attrString);

  if (matches) {
    const name = matches[1];
    const value = matches[2];

    return typeof name === 'string' && name.toLowerCase() === 'data-mce-bogus' ? value : null;
  } else {
    return null;
  }
};

/**
 * Constructs a new SaxParser instance.
 *
 * @constructor
 * @method SaxParser
 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
 */
function SaxParser(settings?: SaxParserSettings, schema = Schema()): SaxParser {
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
  const parse = (html: string, format: ParserFormat = 'html') => {
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
    const parsingMode = format === 'html' ? ParsingMode.Html : ParsingMode.Xml;

    const processEndTag = (name: { name: string; valid: boolean }) => {
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

    const processComment = (value: string) => {
      // Ignore empty comments
      if (value === '') {
        return;
      }

      // Padd comment value to avoid browsers from parsing invalid comments as HTML
      if (value.charAt(0) === '>') {
        value = ' ' + value;
      }

      if (!settings.allow_conditional_comments && value.substr(0, 3).toLowerCase() === '[if') {
        value = ' ' + value;
      }

      comment(value);
    };

    const processMalformedComment = (value: string, startIndex: number) => {
      const startTag = value || '';
      const isBogus = !Strings.startsWith(startTag, '--');

      // Find the end of the malformed/bogus comment
      const endIndex = findCommentEndIndex(html, isBogus, startIndex);
      value = html.substr(startIndex, endIndex - startIndex);

      processComment(isBogus ? startTag + value : value);

      return endIndex + 1;
    };

    const parseAttribute = (match: RegExp, name: string, value?: string, val2?: string, val3?: string) => {
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
      '(?:!--([\\w\\W]*?)--!?>)|' + // Comment
      '(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + // CDATA
      '(?:![Dd][Oo][Cc][Tt][Yy][Pp][Ee]([\\w\\W]*?)>)|' + // DOCTYPE (case insensitive)
      '(?:!(--)?)|' + // Start malformed comment
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
      const matchText = matches[0];

      // Text
      if (index < matches.index) {
        text(decode(html.substr(index, matches.index - index)));
      }

      if ((value = matches[MatchType.ElementEnd])) { // End element
        value = value.toLowerCase();

        // IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
        if (value.charAt(0) === ':') {
          value = value.substr(1);
        }

        processEndTag(value);
      } else if ((value = matches[MatchType.ElementStart])) { // Start element
        // Did we consume the extra character then treat it as text
        // This handles the case with html like this: "text a<b text"
        if (matches.index + matchText.length > html.length) {
          text(decode(html.substr(matches.index)));
          index = matches.index + matchText.length;
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

        // Always invalidate element if it's marked as bogus
        const bogusValue = checkBogusAttribute(attrRegExp, matches[MatchType.Attribute]);
        if (bogusValue !== null) {
          if (bogusValue === 'all') {
            index = findEndTagIndex(schema, html, tokenRegExp.lastIndex);
            tokenRegExp.lastIndex = index;
            continue;
          }

          isValidElement = false;
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
          if ((attribsValue = matches[MatchType.Attribute])) {
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
          endRegExp.lastIndex = index = matches.index + matchText.length;

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
      } else if ((value = matches[MatchType.Comment])) { // Comment
        processComment(value);
      } else if ((value = matches[MatchType.CData])) { // CDATA
        // Ensure we are in a valid CDATA context (eg child of svg or mathml). If we aren't in a valid context then the cdata should
        // be treated as a bogus comment. See https://html.spec.whatwg.org/multipage/parsing.html#markup-declaration-open-state
        const isValidCdataSection = parsingMode === ParsingMode.Xml || settings.preserve_cdata || stack.length > 0 && schema.isValidChild(stack[stack.length - 1].name, '#cdata');
        if (isValidCdataSection) {
          cdata(value);
        } else {
          index = processMalformedComment('', matches.index + 2 );
          tokenRegExp.lastIndex = index;
          continue;
        }
      } else if ((value = matches[MatchType.Doctype])) { // DOCTYPE
        doctype(value);
      } else if ((value = matches[MatchType.MalformedComment]) || matchText === '<!') { // Malformed comment
        index = processMalformedComment(value, matches.index + matchText.length);
        tokenRegExp.lastIndex = index;
        continue;
      } else if ((value = matches[MatchType.ProcessingInstruction])) { // PI
        if (parsingMode === ParsingMode.Xml) {
          pi(value, matches[MatchType.ProcessingInstructionContent]);
        } else {
          // Processing Instructions aren't valid in HTML so it should be treated as a bogus comment.
          // See https://html.spec.whatwg.org/multipage/parsing.html#tag-open-state
          index = processMalformedComment('?', matches.index + 2); // <? === 2 chars
          tokenRegExp.lastIndex = index;
          continue;
        }
      }

      index = matches.index + matchText.length;
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

namespace SaxParser {
  export const findEndTag = findEndTagIndex;
}

export default SaxParser;
