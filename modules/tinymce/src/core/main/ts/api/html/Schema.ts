import { Arr, Fun, Obj, Optional, Strings, Type } from '@ephox/katamari';

import * as CustomElementsRuleParser from '../../schema/CustomElementsRuleParser';
import * as SchemaLookupTable from '../../schema/SchemaLookupTable';
import { ElementSettings, SchemaElement, SchemaMap, SchemaRegExpMap, SchemaSettings, SchemaType } from '../../schema/SchemaTypes';
import * as SchemaUtils from '../../schema/SchemaUtils';
import * as ValidChildrenRuleParser from '../../schema/ValidChildrenRuleParser';
import * as ValidElementsRuleParser from '../../schema/ValidElementsRuleParser';
import Tools from '../util/Tools';

export * from '../../schema/SchemaTypes';

interface Schema {
  type: SchemaType;
  children: Record<string, SchemaMap>;
  elements: Record<string, SchemaElement>;
  getValidStyles: () => Record<string, string[]> | undefined;
  getValidClasses: () => Record<string, SchemaMap> | undefined;
  getBlockElements: () => SchemaMap;
  getInvalidStyles: () => Record<string, SchemaMap> | undefined;
  getVoidElements: () => SchemaMap;
  getTextBlockElements: () => SchemaMap;
  getTextInlineElements: () => SchemaMap;
  getBoolAttrs: () => SchemaMap;
  getElementRule: (name: string) => SchemaElement | undefined;
  getSelfClosingElements: () => SchemaMap;
  getNonEmptyElements: () => SchemaMap;
  getMoveCaretBeforeOnEnterElements: () => SchemaMap;
  getWhitespaceElements: () => SchemaMap;
  getTransparentElements: () => SchemaMap;
  getSpecialElements: () => SchemaRegExpMap;
  isValidChild: (name: string, child: string) => boolean;
  isValid: (name: string, attr?: string) => boolean;
  isBlock: (name: string) => boolean;
  isInline: (name: string) => boolean;
  isWrapper: (name: string) => boolean;
  getCustomElements: () => SchemaMap;
  addValidElements: (validElements: string) => void;
  setValidElements: (validElements: string) => void;
  addCustomElements: (customElements: string) => void;
  addValidChildren: (validChildren: any) => void;
}

/**
 * Schema validator class.
 *
 * @class tinymce.html.Schema
 * @version 3.4
 * @example
 * if (tinymce.activeEditor.schema.isValidChild('p', 'span')) {
 *   alert('span is valid child of p.');
 * }
 *
 * if (tinymce.activeEditor.schema.getElementRule('p')) {
 *   alert('P is a valid element.');
 * }
 */

const mapCache: Record<string, SchemaMap> = {};
const makeMap = Tools.makeMap, each = Tools.each, extend = Tools.extend, explode = Tools.explode;

const createMap = (defaultValue: string, extendWith: SchemaMap = {}): SchemaMap => {
  const value = makeMap(defaultValue, ' ', makeMap(defaultValue.toUpperCase(), ' '));
  return extend(value, extendWith);
};

// A curated list using the textBlockElements map and parts of the blockElements map from the schema
// TODO: TINY-8728 Investigate if the extras can be added directly to the default text block elements
export const getTextRootBlockElements = (schema: Schema): SchemaMap =>
  createMap(
    'td th li dt dd figcaption caption details summary',
    schema.getTextBlockElements()
  );

const compileElementMap: {
  (value: string | Record<string, string> | undefined, mode: 'map'): Record<string, SchemaMap> | undefined;
  (value: string | Record<string, string> | undefined): Record<string, string[]> | undefined;
} = (value: string | Record<string, string> | undefined, mode?: string) => {
  if (value) {
    const styles: Record<string, any> = {};

    if (Type.isString(value)) {
      value = {
        '*': value
      };
    }

    // Convert styles into a rule list
    each(value, (value, key) => {
      styles[key] = styles[key.toUpperCase()] = mode === 'map' ? makeMap(value, /[, ]/) : explode(value, /[, ]/);
    });

    return styles;
  } else {
    return undefined;
  }
};

const Schema = (settings: SchemaSettings = {}): Schema => {
  const elements: Record<string, SchemaElement> = {};
  const children: Record<string, SchemaMap> = {};
  let patternElements: Array<SchemaElement & { pattern: RegExp }> = [];
  const customElementsMap: SchemaMap = {};
  const specialElements: SchemaRegExpMap = {};

  // Creates an lookup table map object for the specified option or the default value
  const createLookupTable = (option: keyof ElementSettings, defaultValue: string, extendWith?: SchemaMap): SchemaMap => {
    const value = settings[option];

    if (!value) {
      // Get cached default map or make it if needed
      let newValue = mapCache[option];

      if (!newValue) {
        newValue = createMap(defaultValue, extendWith);
        mapCache[option] = newValue;
      }

      return newValue;
    } else {
      // Create custom map
      return makeMap(value, /[, ]/, makeMap(value.toUpperCase(), /[, ]/));
    }
  };

  const schemaType = settings.schema ?? 'html5';
  const schemaItems = SchemaLookupTable.makeSchema(schemaType);

  // Allow all elements and attributes if verify_html is set to false
  if (settings.verify_html === false) {
    settings.valid_elements = '*[*]';
  }

  const validStyles = compileElementMap(settings.valid_styles);
  const invalidStyles = compileElementMap(settings.invalid_styles, 'map');
  const validClasses = compileElementMap(settings.valid_classes, 'map');

  // Setup map objects
  const whitespaceElementsMap = createLookupTable(
    'whitespace_elements',
    'pre script noscript style textarea video audio iframe object code'
  );
  const selfClosingElementsMap = createLookupTable('self_closing_elements', 'colgroup dd dt li option p td tfoot th thead tr');
  const voidElementsMap = createLookupTable('void_elements', 'area base basefont br col frame hr img input isindex link ' +
    'meta param embed source wbr track');
  const boolAttrMap = createLookupTable('boolean_attributes', 'checked compact declare defer disabled ismap multiple nohref noresize ' +
    'noshade nowrap readonly selected autoplay loop controls allowfullscreen');

  const nonEmptyOrMoveCaretBeforeOnEnter = 'td th iframe video audio object script code';
  const nonEmptyElementsMap = createLookupTable('non_empty_elements', nonEmptyOrMoveCaretBeforeOnEnter + ' pre svg', voidElementsMap);
  const moveCaretBeforeOnEnterElementsMap = createLookupTable('move_caret_before_on_enter_elements', nonEmptyOrMoveCaretBeforeOnEnter + ' table', voidElementsMap);

  const headings = 'h1 h2 h3 h4 h5 h6';
  const textBlockElementsMap = createLookupTable('text_block_elements', headings + ' p div address pre form ' +
    'blockquote center dir fieldset header footer article section hgroup aside main nav figure');
  const blockElementsMap = createLookupTable('block_elements', 'hr table tbody thead tfoot ' +
    'th tr td li ol ul caption dl dt dd noscript menu isindex option ' +
    'datalist select optgroup figcaption details summary html body multicol listing', textBlockElementsMap);
  const textInlineElementsMap = createLookupTable('text_inline_elements', 'span strong b em i font s strike u var cite ' +
    'dfn code mark q sup sub samp');

  const transparentElementsMap = createLookupTable('transparent_elements', 'a ins del canvas map');

  const wrapBlockElementsMap = createLookupTable('wrap_block_elements', 'pre ' + headings);

  // See https://html.spec.whatwg.org/multipage/parsing.html#parsing-html-fragments
  each(('script noscript iframe noframes noembed title style textarea xmp plaintext').split(' '), (name) => {
    specialElements[name] = new RegExp('<\/' + name + '[^>]*>', 'gi');
  });

  // Parses the specified valid_elements string and adds to the current rules
  const addValidElements = (validElements: string | undefined) => {
    const globalElement = Optional.from(elements['@']);
    const hasPatternsRegExp = /[*?+]/;

    Arr.each(ValidElementsRuleParser.parseValidElementsRules(globalElement, validElements ?? ''), ({ name, element, aliasName }) => {
      if (aliasName) {
        elements[aliasName] = element;
      }

      // Add pattern or exact element
      if (hasPatternsRegExp.test(name)) {
        const patternElement = element as (SchemaElement & { pattern: RegExp });
        patternElement.pattern = SchemaUtils.patternToRegExp(name);
        patternElements.push(patternElement);
      } else {
        elements[name] = element;
      }
    });
  };

  const setValidElements = (validElements: string) => {
    // Clear any existing rules. Note that since `elements` is exposed we can't
    // overwrite it, so instead we delete all the properties
    patternElements = [];
    Arr.each(Obj.keys(elements), (name) => {
      delete elements[name];
    });

    addValidElements(validElements);
  };

  // Adds custom non HTML elements to the schema
  const addCustomElements = (customElements: string | undefined) => {
    // Flush cached items since we are altering the default maps
    delete mapCache.text_block_elements;
    delete mapCache.block_elements;

    Arr.each(CustomElementsRuleParser.parseCustomElementsRules(customElements ?? ''), ({ inline, name, cloneName }) => {
      children[name] = children[cloneName];
      customElementsMap[name] = cloneName;

      // Treat all custom elements as being non-empty by default
      nonEmptyElementsMap[name.toUpperCase()] = {};
      nonEmptyElementsMap[name] = {};

      // If it's not marked as inline then add it to valid block elements
      if (!inline) {
        blockElementsMap[name.toUpperCase()] = {};
        blockElementsMap[name] = {};
      }

      // Add elements clone if needed
      if (!elements[name]) {
        let customRule = elements[cloneName];

        customRule = extend({}, customRule);
        delete customRule.removeEmptyAttrs;
        delete customRule.removeEmpty;

        elements[name] = customRule;
      }

      // Add custom elements at span/div positions
      Obj.each(children, (element, elmName) => {
        if (element[cloneName]) {
          children[elmName] = element = extend({}, children[elmName]);
          element[name] = element[cloneName];
        }
      });
    });
  };

  // Adds valid children to the schema object
  const addValidChildren = (validChildren: string | undefined) => {
    Arr.each(ValidChildrenRuleParser.parseValidChildrenRules(validChildren ?? ''), ({ operation, name, validChildren }) => {
      const parent = operation === 'replace' ? { '#comment': {}} : children[name];

      Arr.each(validChildren, (child) => {
        if (operation === 'remove') {
          delete parent[child];
        } else {
          parent[child] = {};
        }
      });

      children[name] = parent;
    });
  };

  const getElementRule = (name: string): SchemaElement | undefined => {
    const element = elements[name];

    // Exact match found
    if (element) {
      return element;
    }

    // No exact match then try the patterns
    let i = patternElements.length;
    while (i--) {
      const patternElement = patternElements[i];

      if (patternElement.pattern.test(name)) {
        return patternElement;
      }
    }

    return undefined;
  };

  if (!settings.valid_elements) {
    // No valid elements defined then clone the elements from the schema spec
    each(schemaItems, (element, name) => {
      elements[name] = {
        attributes: element.attributes,
        attributesOrder: element.attributesOrder
      };

      children[name] = element.children;
    });

    // Prefer strong/em over b/i
    each(SchemaUtils.split('strong/b em/i'), (item) => {
      const items = SchemaUtils.split(item, '/');
      elements[items[1]].outputName = items[0];
    });

    // Add default alt attribute for images, removed since alt="" is treated as presentational.
    // elements.img.attributesDefault = [{name: 'alt', value: ''}];

    // By default,
    // - padd the text inline element if it is empty and also a child of an empty root block
    // - in all other cases, remove the text inline element if it is empty
    each(textInlineElementsMap, (_val, name) => {
      if (elements[name]) {
        if (settings.padd_empty_block_inline_children) {
          elements[name].paddInEmptyBlock = true;
        }
        elements[name].removeEmpty = true;
      }
    });

    // Remove these if they are empty by default
    each(SchemaUtils.split('ol ul blockquote a table tbody'), (name) => {
      if (elements[name]) {
        elements[name].removeEmpty = true;
      }
    });

    // Padd these by default
    each(SchemaUtils.split('p h1 h2 h3 h4 h5 h6 th td pre div address caption li summary'), (name) => {
      if (elements[name]) {
        elements[name].paddEmpty = true;
      }
    });

    // Remove these if they have no attributes
    each(SchemaUtils.split('span'), (name) => {
      elements[name].removeEmptyAttrs = true;
    });

    // Remove these by default
    // TODO: Reenable in 4.1
    /* each(split('script style'), function(name) {
     delete elements[name];
     });*/
  } else {
    setValidElements(settings.valid_elements);

    each(schemaItems, (element, name) => {
      children[name] = element.children;
    });
  }

  // Opt in is done with options like `extended_valid_elements`
  delete elements.svg;

  addCustomElements(settings.custom_elements);
  addValidChildren(settings.valid_children);
  addValidElements(settings.extended_valid_elements);

  // Todo: Remove this when we fix list handling to be valid
  addValidChildren('+ol[ul|ol],+ul[ul|ol]');

  // Some elements are not valid by themselves - require parents
  each({
    dd: 'dl',
    dt: 'dl',
    li: 'ul ol',
    td: 'tr',
    th: 'tr',
    tr: 'tbody thead tfoot',
    tbody: 'table',
    thead: 'table',
    tfoot: 'table',
    legend: 'fieldset',
    area: 'map',
    param: 'video audio object'
  }, (parents, item) => {
    if (elements[item]) {
      elements[item].parentsRequired = SchemaUtils.split(parents);
    }
  });

  // Delete invalid elements
  if (settings.invalid_elements) {
    each(explode(settings.invalid_elements), (item) => {
      if (elements[item]) {
        delete elements[item];
      }
    });
  }

  // If the user didn't allow span only allow internal spans
  if (!getElementRule('span')) {
    addValidElements('span[!data-mce-type|*]');
  }

  /**
   * Name/value map object with valid parents and children to those parents.
   *
   * @field children
   * @type Object
   * @example
   * children = {
   *    div: { p:{}, h1:{} }
   * };
   */

  /**
   * Name/value map object with valid styles for each element.
   *
   * @method getValidStyles
   * @type Object
   */
  const getValidStyles = Fun.constant(validStyles);

  /**
   * Name/value map object with valid styles for each element.
   *
   * @method getInvalidStyles
   * @type Object
   */
  const getInvalidStyles = Fun.constant(invalidStyles);

  /**
   * Name/value map object with valid classes for each element.
   *
   * @method getValidClasses
   * @type Object
   */
  const getValidClasses = Fun.constant(validClasses);

  /**
   * Returns a map with boolean attributes.
   *
   * @method getBoolAttrs
   * @return {Object} Name/value lookup map for boolean attributes.
   */
  const getBoolAttrs = Fun.constant(boolAttrMap);

  /**
   * Returns a map with block elements.
   *
   * @method getBlockElements
   * @return {Object} Name/value lookup map for block elements.
   */
  const getBlockElements = Fun.constant(blockElementsMap);

  /**
   * Returns a map with text block elements. For example: <code>&#60;p&#62;</code>, <code>&#60;h1&#62;</code> to <code>&#60;h6&#62;</code>, <code>&#60;div&#62;</code> or <code>&#60;address&#62;</code>.
   *
   * @method getTextBlockElements
   * @return {Object} Name/value lookup map for block elements.
   */
  const getTextBlockElements = Fun.constant(textBlockElementsMap);

  /**
   * Returns a map of inline text format nodes. For example: <code>&#60;strong&#62;</code>, <code>&#60;span&#62;</code> or <code>&#60;ins&#62;</code>.
   *
   * @method getTextInlineElements
   * @return {Object} Name/value lookup map for text format elements.
   */
  const getTextInlineElements = Fun.constant(textInlineElementsMap);

  /**
   * Returns a map with void elements. For example: <code>&#60;br&#62;</code> or <code>&#60;img&#62;</code>.
   *
   * @method getVoidElements
   * @return {Object} Name/value lookup map for void elements.
   */
  const getVoidElements = Fun.constant(Object.seal(voidElementsMap));

  /**
   * Returns a map with self closing tags. For example: <code>&#60;li&#62;</code>.
   *
   * @method getSelfClosingElements
   * @return {Object} Name/value lookup map for self closing tags elements.
   */
  const getSelfClosingElements = Fun.constant(selfClosingElementsMap);

  /**
   * Returns a map with elements that should be treated as contents regardless if it has text
   * content in them or not. For example: <code>&#60;td&#62;</code>, <code>&#60;video&#62;</code> or <code>&#60;img&#62;</code>.
   *
   * @method getNonEmptyElements
   * @return {Object} Name/value lookup map for non empty elements.
   */
  const getNonEmptyElements = Fun.constant(nonEmptyElementsMap);

  /**
   * Returns a map with elements that the caret should be moved in front of after enter is
   * pressed.
   *
   * @method getMoveCaretBeforeOnEnterElements
   * @return {Object} Name/value lookup map for elements to place the caret in front of.
   */
  const getMoveCaretBeforeOnEnterElements = Fun.constant(moveCaretBeforeOnEnterElementsMap);

  /**
   * Returns a map with elements where white space is to be preserved. For example: <code>&#60;pre&#62;</code> or <code>&#60;script&#62;</code>.
   *
   * @method getWhitespaceElements
   * @return {Object} Name/value lookup map for white space elements.
   */
  const getWhitespaceElements = Fun.constant(whitespaceElementsMap);

  /**
   * Returns a map with elements that should be treated as transparent.
   *
   * @method getTransparentElements
   * @return {Object} Name/value lookup map for special elements.
   */
  const getTransparentElements = Fun.constant(transparentElementsMap);

  const getWrapBlockElements = Fun.constant(wrapBlockElementsMap);

  /**
   * Returns a map with special elements. These are elements that needs to be parsed
   * in a special way such as script, style, textarea etc. The map object values
   * are regexps used to find the end of the element.
   *
   * @method getSpecialElements
   * @return {Object} Name/value lookup map for special elements.
   */
  const getSpecialElements = Fun.constant(Object.seal(specialElements));

  /**
   * Returns true/false if the specified element and it's child is valid or not
   * according to the schema.
   *
   * @method isValidChild
   * @param {String} name Element name to check for.
   * @param {String} child Element child to verify.
   * @return {Boolean} True/false if the element is a valid child of the specified parent.
   */
  const isValidChild = (name: string, child: string): boolean => {
    const parent = children[name.toLowerCase()];
    return !!(parent && parent[child.toLowerCase()]);
  };

  /**
   * Returns true/false if the specified element name and optional attribute is
   * valid according to the schema.
   *
   * @method isValid
   * @param {String} name Name of element to check.
   * @param {String} attr Optional attribute name to check for.
   * @return {Boolean} True/false if the element and attribute is valid.
   */
  const isValid = (name: string, attr?: string): boolean => {
    const rule = getElementRule(name);

    // Check if it's a valid element
    if (rule) {
      if (attr) {
        // Check if attribute name exists
        if (rule.attributes[attr]) {
          return true;
        }

        // Check if attribute matches a regexp pattern
        const attrPatterns = rule.attributePatterns;
        if (attrPatterns) {
          let i = attrPatterns.length;
          while (i--) {
            if (attrPatterns[i].pattern.test(attr)) {
              return true;
            }
          }
        }
      } else {
        return true;
      }
    }

    // No match
    return false;
  };

  const isBlock = (name: string): boolean => Obj.has(getBlockElements(), name);

  // Check if name starts with # to detect non-element node names like #text and #comment
  const isInline = (name: string): boolean => !Strings.startsWith(name, '#') && isValid(name) && !isBlock(name);

  const isWrapper = (name: string): boolean => Obj.has(getWrapBlockElements(), name) || isInline(name);

  /**
   * Returns true/false if the specified element is valid or not
   * according to the schema.
   *
   * @method getElementRule
   * @param {String} name Element name to check for.
   * @return {Object} Element object or undefined if the element isn't valid.
   */

  /**
   * Returns an map object of all custom elements.
   *
   * @method getCustomElements
   * @return {Object} Name/value map object of all custom elements.
   */
  const getCustomElements = Fun.constant(customElementsMap);

  /**
   * Parses a valid elements string and adds it to the schema. The valid elements
   * format is for example <code>element[attr=default|otherattr]</code>.
   * Existing rules will be replaced with the ones specified, so this extends the schema.
   *
   * @method addValidElements
   * @param {String} valid_elements String in the valid elements format to be parsed.
   */

  /**
   * Parses a valid elements string and sets it to the schema. The valid elements
   * format is for example <code>element[attr=default|otherattr]</code>.
   * Existing rules will be replaced with the ones specified, so this extends the schema.
   *
   * @method setValidElements
   * @param {String} valid_elements String in the valid elements format to be parsed.
   */

  /**
   * Adds custom non-HTML elements to the schema.
   *
   * @method addCustomElements
   * @param {String} custom_elements Comma separated list of custom elements to add.
   */

  /**
   * Parses a valid children string and adds them to the schema structure. The valid children
   * format is for example <code>element[child1|child2]</code>.
   *
   * @method addValidChildren
   * @param {String} valid_children Valid children elements string to parse
   */

  return {
    type: schemaType,
    children,
    elements,
    getValidStyles,
    getValidClasses,
    getBlockElements,
    getInvalidStyles,
    getVoidElements,
    getTextBlockElements,
    getTextInlineElements,
    getBoolAttrs,
    getElementRule,
    getSelfClosingElements,
    getNonEmptyElements,
    getMoveCaretBeforeOnEnterElements,
    getWhitespaceElements,
    getTransparentElements,
    getSpecialElements,
    isValidChild,
    isValid,
    isBlock,
    isInline,
    isWrapper,
    getCustomElements,
    addValidElements,
    setValidElements,
    addCustomElements,
    addValidChildren
  };
};

export default Schema;
