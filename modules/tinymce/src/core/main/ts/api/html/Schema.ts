import { Arr, Fun, Obj, Type } from '@ephox/katamari';

import Tools from '../util/Tools';

export type SchemaType = 'html4' | 'html5' | 'html5-strict';

interface ElementSettings {
  block_elements?: string;
  boolean_attributes?: string;
  move_caret_before_on_enter_elements?: string;
  non_empty_elements?: string;
  self_closing_elements?: string;
  text_block_elements?: string;
  text_inline_elements?: string;
  void_elements?: string;
  whitespace_elements?: string;
  transparent_elements?: string;
}

export interface SchemaSettings extends ElementSettings {
  custom_elements?: string;
  extended_valid_elements?: string;
  invalid_elements?: string;
  invalid_styles?: string | Record<string, string>;
  schema?: SchemaType;
  valid_children?: string;
  valid_classes?: string | Record<string, string>;
  valid_elements?: string;
  valid_styles?: string | Record<string, string>;
  verify_html?: boolean;
  padd_empty_block_inline_children?: boolean;
}

export interface Attribute {
  required?: boolean;
  defaultValue?: string;
  forcedValue?: string;
  validValues?: Record<string, {}>;
}

export interface DefaultAttribute {
  name: string;
  value: string;
}

export interface AttributePattern extends Attribute {
  pattern: RegExp;
}

export interface ElementRule {
  attributes: Record<string, Attribute>;
  attributesDefault?: DefaultAttribute[];
  attributesForced?: DefaultAttribute[];
  attributesOrder: string[];
  attributePatterns?: AttributePattern[];
  attributesRequired?: string[];
  paddEmpty?: boolean;
  removeEmpty?: boolean;
  removeEmptyAttrs?: boolean;
  paddInEmptyBlock?: boolean;
}

export interface SchemaElement extends ElementRule {
  outputName?: string;
  parentsRequired?: string[];
  pattern?: RegExp;
}

export interface SchemaMap {
  [name: string]: {};
}

export interface SchemaRegExpMap {
  [name: string]: RegExp;
}

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
  getCustomElements: () => SchemaMap;
  addValidElements: (validElements: string) => void;
  setValidElements: (validElements: string) => void;
  addCustomElements: (customElements: string) => void;
  addValidChildren: (validChildren: any) => void;
}

interface SchemaLookupTable {
  [key: string]: {
    attributes: Record<string, {}>;
    attributesOrder: string[];
    children: Record<string, {}>;
  };
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

const lookupCache: Record<string, SchemaLookupTable> = {};
const mapCache: Record<string, SchemaMap> = {};
const dummyObj = {};
const makeMap = Tools.makeMap, each = Tools.each, extend = Tools.extend, explode = Tools.explode, inArray = Tools.inArray;

const split = (items: string | undefined, delim?: string): string[] => {
  items = Tools.trim(items);
  return items ? items.split(delim || ' ') : [];
};

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

/**
 * Builds a schema lookup table
 *
 * @private
 * @param {String} type html4, html5 or html5-strict schema type.
 * @return {Object} Schema lookup table.
 */
const compileSchema = (type: SchemaType): SchemaLookupTable => {
  const schema: SchemaLookupTable = {};
  let globalAttributes: string, blockContent: string;
  let phrasingContent: string, flowContent: string | undefined;

  const add = (name: string, attributes: string = '', children: string = '') => {
    const childNames = split(children);
    const names = split(name);
    let ni = names.length;
    while (ni--) {
      const attributesOrder = split([ globalAttributes, attributes ].join(' '));

      schema[names[ni]] = {
        attributes: Arr.mapToObject(attributesOrder, () => ({})),
        attributesOrder,
        children: Arr.mapToObject(childNames, Fun.constant(dummyObj))
      };
    }
  };

  const addAttrs = (name: string, attributes?: string) => {
    const names = split(name);
    const attrs = split(attributes);
    let ni = names.length;
    while (ni--) {
      const schemaItem = schema[names[ni]];
      for (let i = 0, l = attrs.length; i < l; i++) {
        schemaItem.attributes[attrs[i]] = {};
        schemaItem.attributesOrder.push(attrs[i]);
      }
    }
  };

  // Use cached schema
  if (lookupCache[type]) {
    return lookupCache[type];
  }

  // Attributes present on all elements
  globalAttributes = 'id accesskey class dir lang style tabindex title role';

  // Event attributes can be opt-in/opt-out
  /* eventAttributes = split("onabort onblur oncancel oncanplay oncanplaythrough onchange onclick onclose oncontextmenu oncuechange " +
   "ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended " +
   "onerror onfocus oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart " +
   "onmousedown onmousemove onmouseout onmouseover onmouseup onmousewheel onpause onplay onplaying onprogress onratechange " +
   "onreset onscroll onseeked onseeking onseeking onselect onshow onstalled onsubmit onsuspend ontimeupdate onvolumechange " +
   "onwaiting"
   );*/

  // Block content elements
  blockContent =
    'address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul';

  // Phrasing content elements from the HTML5 spec (inline)
  phrasingContent =
    'a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd ' +
    'label map noscript object q s samp script select small span strong sub sup ' +
    'textarea u var #text #comment';

  // Add HTML5 items to globalAttributes, blockContent, phrasingContent
  if (type !== 'html4') {
    const transparentContent = 'a ins del canvas map';
    globalAttributes += ' contenteditable contextmenu draggable dropzone ' +
      'hidden spellcheck translate';
    blockContent += ' article aside details dialog figure main header footer hgroup section nav ' + transparentContent;
    phrasingContent += ' audio canvas command datalist mark meter output picture ' +
      'progress time wbr video ruby bdi keygen';
  }

  // Add HTML4 elements unless it's html5-strict
  if (type !== 'html5-strict') {
    globalAttributes += ' xml:lang';

    const html4PhrasingContent = 'acronym applet basefont big font strike tt';
    phrasingContent = [ phrasingContent, html4PhrasingContent ].join(' ');

    each(split(html4PhrasingContent), (name) => {
      add(name, '', phrasingContent);
    });

    const html4BlockContent = 'center dir isindex noframes';
    blockContent = [ blockContent, html4BlockContent ].join(' ');

    // Flow content elements from the HTML5 spec (block+inline)
    flowContent = [ blockContent, phrasingContent ].join(' ');

    each(split(html4BlockContent), (name) => {
      add(name, '', flowContent);
    });
  }

  // Flow content elements from the HTML5 spec (block+inline)
  flowContent = flowContent || [ blockContent, phrasingContent ].join(' ');

  // HTML4 base schema TODO: Move HTML5 specific attributes to HTML5 specific if statement
  // Schema items <element name>, <specific attributes>, <children ..>
  add('html', 'manifest', 'head body');
  add('head', '', 'base command link meta noscript script style title');
  add('title hr noscript br');
  add('base', 'href target');
  add('link', 'href rel media hreflang type sizes hreflang');
  add('meta', 'name http-equiv content charset');
  add('style', 'media type scoped');
  add('script', 'src async defer type charset');
  add('body', 'onafterprint onbeforeprint onbeforeunload onblur onerror onfocus ' +
    'onhashchange onload onmessage onoffline ononline onpagehide onpageshow ' +
    'onpopstate onresize onscroll onstorage onunload', flowContent);
  add('address dt dd div caption', '', flowContent);
  add('h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn', '', phrasingContent);
  add('blockquote', 'cite', flowContent);
  add('ol', 'reversed start type', 'li');
  add('ul', '', 'li');
  add('li', 'value', flowContent);
  add('dl', '', 'dt dd');
  add('a', 'href target rel media hreflang type', flowContent);
  add('q', 'cite', phrasingContent);
  add('ins del', 'cite datetime', flowContent);
  add('img', 'src sizes srcset alt usemap ismap width height');
  add('iframe', 'src name width height', flowContent);
  add('embed', 'src type width height');
  add('object', 'data type typemustmatch name usemap form width height', [ flowContent, 'param' ].join(' '));
  add('param', 'name value');
  add('map', 'name', [ flowContent, 'area' ].join(' '));
  add('area', 'alt coords shape href target rel media hreflang type');
  add('table', 'border', 'caption colgroup thead tfoot tbody tr' + (type === 'html4' ? ' col' : ''));
  add('colgroup', 'span', 'col');
  add('col', 'span');
  add('tbody thead tfoot', '', 'tr');
  add('tr', '', 'td th');
  add('td', 'colspan rowspan headers', flowContent);
  add('th', 'colspan rowspan headers scope abbr', flowContent);
  add('form', 'accept-charset action autocomplete enctype method name novalidate target', flowContent);
  add('fieldset', 'disabled form name', [ flowContent, 'legend' ].join(' '));
  add('label', 'form for', phrasingContent);
  add('input', 'accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate ' +
    'formtarget height list max maxlength min multiple name pattern readonly required size src step type value width'
  );
  add('button', 'disabled form formaction formenctype formmethod formnovalidate formtarget name type value',
    type === 'html4' ? flowContent : phrasingContent);
  add('select', 'disabled form multiple name required size', 'option optgroup');
  add('optgroup', 'disabled label', 'option');
  add('option', 'disabled label selected value');
  add('textarea', 'cols dirname disabled form maxlength name readonly required rows wrap');
  add('menu', 'type label', [ flowContent, 'li' ].join(' '));
  add('noscript', '', flowContent);

  // Extend with HTML5 elements
  if (type !== 'html4') {
    add('wbr');
    add('ruby', '', [ phrasingContent, 'rt rp' ].join(' '));
    add('figcaption', '', flowContent);
    add('mark rt rp summary bdi', '', phrasingContent);
    add('canvas', 'width height', flowContent);
    add('video', 'src crossorigin poster preload autoplay mediagroup loop ' +
      'muted controls width height buffered', [ flowContent, 'track source' ].join(' '));
    add('audio', 'src crossorigin preload autoplay mediagroup loop muted controls ' +
      'buffered volume', [ flowContent, 'track source' ].join(' '));
    add('picture', '', 'img source');
    add('source', 'src srcset type media sizes');
    add('track', 'kind src srclang label default');
    add('datalist', '', [ phrasingContent, 'option' ].join(' '));
    add('article section nav aside main header footer', '', flowContent);
    add('hgroup', '', 'h1 h2 h3 h4 h5 h6');
    add('figure', '', [ flowContent, 'figcaption' ].join(' '));
    add('time', 'datetime', phrasingContent);
    add('dialog', 'open', flowContent);
    add('command', 'type label icon disabled checked radiogroup command');
    add('output', 'for form name', phrasingContent);
    add('progress', 'value max', phrasingContent);
    add('meter', 'value min max low high optimum', phrasingContent);
    add('details', 'open', [ flowContent, 'summary' ].join(' '));
    add('keygen', 'autofocus challenge disabled form keytype name');
  }

  // Extend with HTML4 attributes unless it's html5-strict
  if (type !== 'html5-strict') {
    addAttrs('script', 'language xml:space');
    addAttrs('style', 'xml:space');
    addAttrs('object', 'declare classid code codebase codetype archive standby align border hspace vspace');
    addAttrs('embed', 'align name hspace vspace');
    addAttrs('param', 'valuetype type');
    addAttrs('a', 'charset name rev shape coords');
    addAttrs('br', 'clear');
    addAttrs('applet', 'codebase archive code object alt name width height align hspace vspace');
    addAttrs('img', 'name longdesc align border hspace vspace');
    addAttrs('iframe', 'longdesc frameborder marginwidth marginheight scrolling align');
    addAttrs('font basefont', 'size color face');
    addAttrs('input', 'usemap align');
    addAttrs('select');
    addAttrs('textarea');
    addAttrs('h1 h2 h3 h4 h5 h6 div p legend caption', 'align');
    addAttrs('ul', 'type compact');
    addAttrs('li', 'type');
    addAttrs('ol dl menu dir', 'compact');
    addAttrs('pre', 'width xml:space');
    addAttrs('hr', 'align noshade size width');
    addAttrs('isindex', 'prompt');
    addAttrs('table', 'summary width frame rules cellspacing cellpadding align bgcolor');
    addAttrs('col', 'width align char charoff valign');
    addAttrs('colgroup', 'width align char charoff valign');
    addAttrs('thead', 'align char charoff valign');
    addAttrs('tr', 'align char charoff valign bgcolor');
    addAttrs('th', 'axis align char charoff valign nowrap bgcolor width height');
    addAttrs('form', 'accept');
    addAttrs('td', 'abbr axis scope align char charoff valign nowrap bgcolor width height');
    addAttrs('tfoot', 'align char charoff valign');
    addAttrs('tbody', 'align char charoff valign');
    addAttrs('area', 'nohref');
    addAttrs('body', 'background bgcolor text link vlink alink');
  }

  // Extend with HTML5 attributes unless it's html4
  if (type !== 'html4') {
    addAttrs('input button select textarea', 'autofocus');
    addAttrs('input textarea', 'placeholder');
    addAttrs('a', 'download');
    addAttrs('link script img', 'crossorigin');
    addAttrs('img', 'loading');
    addAttrs('iframe', 'sandbox seamless allow allowfullscreen loading'); // Excluded: srcdoc
  }

  // Special: iframe, ruby, video, audio, label
  if (type !== 'html4') {
    // Video/audio elements cannot have nested children
    Arr.each([ schema.video, schema.audio ], (item) => {
      delete item.children.audio;
      delete item.children.video;
    });
  }

  // Delete children of the same name from it's parent
  // For example: form can't have a child of the name form
  each(split('a form meter progress dfn'), (name) => {
    if (schema[name]) {
      delete schema[name].children[name];
    }
  });

  // Delete header, footer, sectioning and heading content descendants
  /* each('dt th address', function(name) {
   delete schema[name].children[name];
   });*/

  // Caption can't have tables
  delete schema.caption.children.table;

  // Delete scripts by default due to possible XSS
  delete schema.script;

  // TODO: LI:s can only have value if parent is OL

  lookupCache[type] = schema;

  return schema;
};

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
  const schemaItems = compileSchema(schemaType);

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
  const nonEmptyElementsMap = createLookupTable('non_empty_elements', nonEmptyOrMoveCaretBeforeOnEnter + ' pre', voidElementsMap);
  const moveCaretBeforeOnEnterElementsMap = createLookupTable('move_caret_before_on_enter_elements', nonEmptyOrMoveCaretBeforeOnEnter + ' table', voidElementsMap);

  const textBlockElementsMap = createLookupTable('text_block_elements', 'h1 h2 h3 h4 h5 h6 p div address pre form ' +
    'blockquote center dir fieldset header footer article section hgroup aside main nav figure');
  const blockElementsMap = createLookupTable('block_elements', 'hr table tbody thead tfoot ' +
    'th tr td li ol ul caption dl dt dd noscript menu isindex option ' +
    'datalist select optgroup figcaption details summary', textBlockElementsMap);
  const textInlineElementsMap = createLookupTable('text_inline_elements', 'span strong b em i font s strike u var cite ' +
    'dfn code mark q sup sub samp');

  const transparentElementsMap = createLookupTable('transparent_elements', 'a ins del canvas map');

  // See https://html.spec.whatwg.org/multipage/parsing.html#parsing-html-fragments
  each(('script noscript iframe noframes noembed title style textarea xmp plaintext').split(' '), (name) => {
    specialElements[name] = new RegExp('<\/' + name + '[^>]*>', 'gi');
  });

  // Converts a wildcard expression string to a regexp for example *a will become /.*a/.
  const patternToRegExp = (str: string) => new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');

  // Parses the specified valid_elements string and adds to the current rules
  // This function is a bit hard to read since it's heavily optimized for speed
  const addValidElements = (validElements: string | undefined) => {
    const elementRuleRegExp = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)])?$/;
    const attrRuleRegExp = /^([!\-])?(\w+[\\:]:\w+|[^=~<]+)?(?:([=~<])(.*))?$/;
    const hasPatternsRegExp = /[*?+]/;

    if (validElements) {
      // Split valid elements into an array with rules
      const validElementsArr = split(validElements, ',');

      let globalAttributes: Record<string, Attribute> | undefined;
      let globalAttributesOrder: string[] | undefined;
      if (elements['@']) {
        globalAttributes = elements['@'].attributes;
        globalAttributesOrder = elements['@'].attributesOrder;
      }

      // Loop all rules
      for (let ei = 0, el = validElementsArr.length; ei < el; ei++) {
        // Parse element rule
        let matches = elementRuleRegExp.exec(validElementsArr[ei]);
        if (matches) {
          // Setup local names for matches
          const prefix = matches[1];
          const elementName = matches[2];
          const outputName = matches[3];
          const attrData = matches[5];

          // Create new attributes and attributesOrder
          const attributes: Record<string, Attribute> = {};
          const attributesOrder: string[] = [];

          // Create the new element
          const element = {
            attributes,
            attributesOrder
          } as SchemaElement;

          // Padd empty elements prefix
          if (prefix === '#') {
            element.paddEmpty = true;
          }

          // Remove empty elements prefix
          if (prefix === '-') {
            element.removeEmpty = true;
          }

          if (matches[4] === '!') {
            element.removeEmptyAttrs = true;
          }

          // Copy attributes from global rule into current rule
          if (globalAttributes) {
            Obj.each(globalAttributes, (value, key) => {
              attributes[key] = value;
            });

            if (globalAttributesOrder) {
              attributesOrder.push(...globalAttributesOrder);
            }
          }

          // Attributes defined
          if (attrData) {
            const attrDatas = split(attrData, '|');
            for (let ai = 0, al = attrDatas.length; ai < al; ai++) {
              matches = attrRuleRegExp.exec(attrDatas[ai]);
              if (matches) {
                const attr: Attribute = {};
                const attrType = matches[1];
                const attrName = matches[2].replace(/[\\:]:/g, ':');
                const attrPrefix = matches[3];
                const value = matches[4];

                // Required
                if (attrType === '!') {
                  element.attributesRequired = element.attributesRequired || [];
                  element.attributesRequired.push(attrName);
                  attr.required = true;
                }

                // Denied from global
                if (attrType === '-') {
                  delete attributes[attrName];
                  attributesOrder.splice(inArray(attributesOrder, attrName), 1);
                  continue;
                }

                // Default value
                if (attrPrefix) {
                  // Default value
                  if (attrPrefix === '=') {
                    element.attributesDefault = element.attributesDefault || [];
                    element.attributesDefault.push({ name: attrName, value });
                    attr.defaultValue = value;
                  }

                  // Forced value
                  if (attrPrefix === '~') {
                    element.attributesForced = element.attributesForced || [];
                    element.attributesForced.push({ name: attrName, value });
                    attr.forcedValue = value;
                  }

                  // Required values
                  if (attrPrefix === '<') {
                    attr.validValues = makeMap(value, '?');
                  }
                }

                // Check for attribute patterns
                if (hasPatternsRegExp.test(attrName)) {
                  const attrPattern = attr as AttributePattern;
                  element.attributePatterns = element.attributePatterns || [];
                  attrPattern.pattern = patternToRegExp(attrName);
                  element.attributePatterns.push(attrPattern);
                } else {
                  // Add attribute to order list if it doesn't already exist
                  if (!attributes[attrName]) {
                    attributesOrder.push(attrName);
                  }

                  attributes[attrName] = attr;
                }
              }
            }
          }

          // Global rule, store away these for later usage
          if (!globalAttributes && elementName === '@') {
            globalAttributes = attributes;
            globalAttributesOrder = attributesOrder;
          }

          // Handle substitute elements such as b/strong
          if (outputName) {
            element.outputName = elementName;
            elements[outputName] = element;
          }

          // Add pattern or exact element
          if (hasPatternsRegExp.test(elementName)) {
            const patternElement = element as (SchemaElement & { pattern: RegExp });
            patternElement.pattern = patternToRegExp(elementName);
            patternElements.push(patternElement);
          } else {
            elements[elementName] = element;
          }
        }
      }
    }
  };

  const setValidElements = (validElements: string) => {
    // Clear any existing rules. Note that since `elements` is exposed we can't
    // overwrite it, so instead we delete all the properties
    patternElements = [];
    Arr.each(Obj.keys(elements), (name) => {
      delete elements[name];
    });

    addValidElements(validElements);

    each(schemaItems, (element, name) => {
      children[name] = element.children;
    });
  };

  // Adds custom non HTML elements to the schema
  const addCustomElements = (customElements: string | undefined) => {
    const customElementRegExp = /^(~)?(.+)$/;

    if (customElements) {
      // Flush cached items since we are altering the default maps
      delete mapCache.text_block_elements;
      delete mapCache.block_elements;

      each(split(customElements, ','), (rule) => {
        const matches = customElementRegExp.exec(rule);
        if (matches) {
          const inline = matches[1] === '~';
          const cloneName = inline ? 'span' : 'div';
          const name = matches[2];

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
          each(children, (element, elmName) => {
            if (element[cloneName]) {
              children[elmName] = element = extend({}, children[elmName]);
              element[name] = element[cloneName];
            }
          });
        }
      });
    }
  };

  // Adds valid children to the schema object
  const addValidChildren = (validChildren: string | undefined) => {
    // see: https://html.spec.whatwg.org/#valid-custom-element-name
    const childRuleRegExp = /^([+\-]?)([A-Za-z0-9_\-.\u00b7\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u037d\u037f-\u1fff\u200c-\u200d\u203f-\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]+)\[([^\]]+)]$/; // from w3c's custom grammar (above)

    // Invalidate the schema cache if the schema is mutated
    delete lookupCache[schemaType];

    if (validChildren) {
      each(split(validChildren, ','), (rule) => {
        const matches = childRuleRegExp.exec(rule);

        if (matches) {
          const prefix = matches[1];
          let parent: SchemaMap;

          // Add/remove items from default
          if (prefix) {
            parent = children[matches[2]];
          } else {
            parent = children[matches[2]] = { '#comment': {}};
          }

          parent = children[matches[2]];

          each(split(matches[3], '|'), (child) => {
            if (prefix === '-') {
              delete parent[child];
            } else {
              parent[child] = {};
            }
          });
        }
      });
    }
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
    each(split('strong/b em/i'), (item) => {
      const items = split(item, '/');
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
    each(split('ol ul blockquote a table tbody'), (name) => {
      if (elements[name]) {
        elements[name].removeEmpty = true;
      }
    });

    // Padd these by default
    each(split('p h1 h2 h3 h4 h5 h6 th td pre div address caption li'), (name) => {
      elements[name].paddEmpty = true;
    });

    // Remove these if they have no attributes
    each(split('span'), (name) => {
      elements[name].removeEmptyAttrs = true;
    });

    // Remove these by default
    // TODO: Reenable in 4.1
    /* each(split('script style'), function(name) {
     delete elements[name];
     });*/
  } else {
    setValidElements(settings.valid_elements);
  }

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
      elements[item].parentsRequired = split(parents);
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
    getCustomElements,
    addValidElements,
    setValidElements,
    addCustomElements,
    addValidChildren
  };
};

export default Schema;
