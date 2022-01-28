/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Strings, Type } from '@ephox/katamari';
import { Attribute, NodeTypes, Remove, Replication, SugarElement } from '@ephox/sugar';
import createDompurify, { Config, DOMPurifyI } from 'dompurify';

import * as NodeType from '../../dom/NodeType';
import { cleanInvalidNodes } from '../../html/InvalidNodes';
import * as LegacyFilter from '../../html/LegacyFilter';
import * as ParserFilters from '../../html/ParserFilters';
import { isEmpty, isLineBreakNode, isPaddedWithNbsp, paddEmptyNode } from '../../html/ParserUtils';
import { BlobCache } from '../file/BlobCache';
import Tools from '../util/Tools';
import * as URI from '../util/URI';
import AstNode from './Node';
import Schema, { SchemaRegExpMap } from './Schema';

/**
 * This class parses HTML code into a DOM like structure of nodes it will remove redundant whitespace and make
 * sure that the node tree is valid according to the specified schema.
 * So for example: <p>a<p>b</p>c</p> will become <p>a</p><p>b</p><p>c</p>
 *
 * @example
 * var parser = new tinymce.html.DomParser({validate: true}, schema);
 * var rootNode = parser.parse('<h1>content</h1>');
 *
 * @class tinymce.html.DomParser
 * @version 3.4
 */

const makeMap = Tools.makeMap, each = Tools.each, explode = Tools.explode, extend = Tools.extend;

export interface ParserArgs {
  getInner?: boolean | number;
  forced_root_block?: boolean | string;
  context?: string;
  isRootContent?: boolean;
  format?: string;
  invalid?: boolean;
  no_events?: boolean;

  // TODO finish typing the parser args
  [key: string]: any;
}

export type ParserFilterCallback = (nodes: AstNode[], name: string, args: ParserArgs) => void;

export interface ParserFilter {
  name: string;
  callbacks: ParserFilterCallback[];
}

export interface DomParserSettings {
  allow_html_data_urls?: boolean;
  allow_svg_data_urls?: boolean;
  allow_conditional_comments?: boolean;
  allow_html_in_named_anchor?: boolean;
  allow_script_urls?: boolean;
  allow_unsafe_link_target?: boolean;
  convert_fonts_to_spans?: boolean;
  fix_list_elements?: boolean;
  font_size_legacy_values?: string;
  forced_root_block?: boolean | string;
  forced_root_block_attrs?: Record<string, string>;
  preserve_cdata?: boolean;
  remove_trailing_brs?: boolean;
  root_name?: string;
  validate?: boolean;
  inline_styles?: boolean;
  blob_cache?: BlobCache;
  document?: Document;
}

interface DomParser {
  schema: Schema;
  addAttributeFilter: (name: string, callback: (nodes: AstNode[], name: string, args: ParserArgs) => void) => void;
  getAttributeFilters: () => ParserFilter[];
  addNodeFilter: (name: string, callback: (nodes: AstNode[], name: string, args: ParserArgs) => void) => void;
  getNodeFilters: () => ParserFilter[];
  parse: (html: string, args?: ParserArgs) => AstNode;
}

// For internal parser use only - a summary of which nodes have been matched by which node/attribute filters
interface FilterMatches {
  readonly nodes: Record<string, AstNode[]>;
  readonly attributes: Record<string, AstNode[]>;
}

type WalkerCallback = (node: AstNode) => void;

const basePurifyConfig: Config = {
  IN_PLACE: true,
  ALLOW_UNKNOWN_PROTOCOLS: true,
  // Deliberately ban all tags and attributes by default, and then un-ban them on demand in hooks
  // #comment and #cdata-section are always allowed as they aren't controlled via the schema
  // body is also allowed due to the DOMPurify checking the root node before sanitizing
  ALLOWED_TAGS: [ '#comment', '#cdata-section', 'body' ],
  ALLOWED_ATTR: []
};

// A list of attributes that should be filtered further based on the parser settings
const filteredUrlAttrs = Tools.makeMap('src,href,data,background,action,formaction,poster,xlink:href');

const getPurifyConfig = (settings: DomParserSettings, mimeType: string): Config => {
  const config = { ...basePurifyConfig };

  // Set the relevant parser mimetype
  config.PARSER_MEDIA_TYPE = mimeType;

  // Allow any URI when allowing script urls
  if (settings.allow_script_urls) {
    config.ALLOWED_URI_REGEXP = /.*/;
  // Allow anything except javascript (or similar) URIs if all html data urls are allowed
  } else if (settings.allow_html_data_urls) {
    config.ALLOWED_URI_REGEXP = /^(?!(\w+script|mhtml):)/i;
  }

  return config;
};

const setupPurify = (settings: DomParserSettings, schema: Schema): DOMPurifyI => {
  const purify = createDompurify();
  const validate = settings.validate;
  let uid = 0;

  // We use this to add new tags to the allow-list as we parse, if we notice that a tag has been banned but it's still in the schema
  purify.addHook('uponSanitizeElement', (ele, evt) => {
    // Just leave non-elements such as text and comments up to dompurify
    const tagName = evt.tagName;
    if (ele.nodeType !== NodeTypes.ELEMENT || tagName === 'body') {
      return;
    }

    // Construct the sugar element wrapper
    const element = SugarElement.fromDom(ele);

    // Determine if the schema allows the element and either add it or remove it
    const rule = schema.getElementRule(tagName.toLowerCase());
    if (validate && !rule) {
      Remove.unwrap(element);
      return;
    } else {
      evt.allowedTags[tagName] = true;
    }

    // Determine if we're dealing with an internal attribute
    const isInternalElement = Attribute.has(element, 'data-mce-type');

    // Cleanup bogus elements
    const bogus = Attribute.get(element, 'data-mce-bogus');
    if (!isInternalElement && Type.isString(bogus)) {
      if (bogus === 'all') {
        Remove.remove(element);
      } else {
        Remove.unwrap(element);
      }
      return;
    }

    // Validate the element using the attribute rules
    if (validate && !isInternalElement) {
      // Fix the attributes for the element, unwrapping it if we have to
      Arr.each(rule.attributesForced ?? [], (attr) => {
        Attribute.set(element, attr.name, attr.value === '{$uid}' ? `mce_${uid++}` : attr.value);
      });
      Arr.each(rule.attributesDefault ?? [], (attr) => {
        if (!Attribute.has(element, attr.name)) {
          Attribute.set(element, attr.name, attr.value === '{$uid}' ? `mce_${uid++}` : attr.value);
        }
      });

      // If none of the required attributes were found then remove
      if (rule.attributesRequired && !Arr.exists(rule.attributesRequired, (attr) => Attribute.has(element, attr))) {
        Remove.unwrap(element);
        return;
      }

      // If there are no attributes then remove
      if (rule.removeEmptyAttrs && Attribute.hasNone(element)) {
        Remove.unwrap(element);
        return;
      }

      // Change the node name if the schema says to
      if (rule.outputName && rule.outputName !== tagName.toLowerCase()) {
        Replication.mutate(element, rule.outputName as keyof HTMLElementTagNameMap);
      }
    }
  });

  // Let's do the same thing for attributes
  purify.addHook('uponSanitizeAttribute', (ele, evt) => {
    const tagName = ele.tagName.toLowerCase();
    const { attrName, attrValue } = evt;

    evt.keepAttr = !validate || Strings.startsWith(attrName, 'data-') || schema.isValid(tagName, attrName);
    if (!settings.allow_script_urls && attrName in filteredUrlAttrs && URI.isInvalidUri(settings, attrValue, tagName)) {
      evt.keepAttr = false;
    }

    if (evt.keepAttr) {
      evt.allowedAttributes[attrName] = true;

      if (attrName in schema.getBoolAttrs()) {
        evt.attrValue = attrName;
      }

      // We need to tell DOMPurify to forcibly keep the attribute if it's an SVG data URI and svg data URIs are allowed
      if (settings.allow_svg_data_urls && Strings.startsWith(attrValue, 'data:image/svg+xml')) {
        evt.forceKeepAttr = true;
      }
    }
  });

  return purify;
};

const transferChildren = (parent: AstNode, nativeParent: Node, specialElements: SchemaRegExpMap) => {
  const parentName = parent.name;
  // Exclude the special elements where the content is RCDATA as their content needs to be parsed instead of being left as plain text
  // See: https://html.spec.whatwg.org/multipage/parsing.html#parsing-html-fragments
  const isSpecial = parentName in specialElements && parentName !== 'title' && parentName !== 'textarea';

  const childNodes = nativeParent.childNodes;
  for (let ni = 0, nl = childNodes.length; ni < nl; ni++) {
    const nativeChild = childNodes[ni];
    const child = new AstNode(nativeChild.nodeName.toLowerCase(), nativeChild.nodeType);

    if (NodeType.isElement(nativeChild)) {
      const attributes = nativeChild.attributes;
      for (let ai = 0, al = attributes.length; ai < al; ai++) {
        const attr = attributes[ai];
        child.attr(attr.name, attr.value);
      }
    } else if (NodeType.isText(nativeChild)) {
      child.value = nativeChild.data;
      if (isSpecial) {
        child.raw = true;
      }
    } else if (NodeType.isComment(nativeChild) || NodeType.isCData(nativeChild) || NodeType.isPi(nativeChild)) {
      child.value = nativeChild.data;
    }

    transferChildren(child, nativeChild, specialElements);
    parent.append(child);
  }
};

const walkTree = (root: AstNode, preprocessors: WalkerCallback[], postprocessors: WalkerCallback[]) => {
  const traverseOrder: AstNode[] = [];

  for (let node = root, lastNode = node; Type.isNonNullable(node); lastNode = node, node = node.walk()) {
    Arr.each(preprocessors, (preprocess) => preprocess(node));

    if (Type.isNullable(node.parent) && node !== root) {
      // The node has been detached, so rewind a little and don't add it to our traversal
      node = lastNode;
    } else {
      traverseOrder.push(node);
    }
  }

  for (let i = traverseOrder.length - 1; i >= 0; i--) {
    const node = traverseOrder[i];
    Arr.each(postprocessors, (postprocess) => postprocess(node));
  }
};

// All the dom operations we want to perform, regardless of whether we're trying to properly validate things
// e.g. removing excess whitespace
// e.g. removing empty nodes (or padding them with <br>)
//
// Returns [ preprocess, postprocess ]
const whitespaceCleaner = (root: AstNode, schema: Schema, settings: DomParserSettings, args: ParserArgs): [WalkerCallback, WalkerCallback] => {
  const validate = settings.validate;
  const nonEmptyElements = schema.getNonEmptyElements();
  const whitespaceElements = schema.getWhiteSpaceElements();
  const blockElements: Record<string, string> = extend(makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
  const allWhiteSpaceRegExp = /[ \t\r\n]+/g;
  const startWhiteSpaceRegExp = /^[ \t\r\n]+/;
  const endWhiteSpaceRegExp = /[ \t\r\n]+$/;

  const hasWhitespaceParent = (node: AstNode) => {
    node = node.parent;
    while (Type.isNonNullable(node)) {
      if (node.name in whitespaceElements) {
        return true;
      } else {
        node = node.parent;
      }
    }
    return false;
  };

  const isAtEdgeOfBlock = (node: AstNode, start: boolean): boolean => {
    const neighbour = start ? node.prev : node.next;
    if (Type.isNonNullable(neighbour)) {
      return false;
    }

    // Make sure our parent is actually a block, and also make sure it isn't a temporary "context" element
    // that we're probably going to unwrap as soon as we insert this content into the editor
    return node.parent.name in blockElements && (node.parent !== root || args.isRootContent);
  };

  const preprocess = (node: AstNode) => {
    if (node.type === 3) {
      // Remove leading whitespace here, so that all whitespace in nodes to the left of us has already been fixed
      if (!hasWhitespaceParent(node)) {
        let text = node.value;
        text = text.replace(allWhiteSpaceRegExp, ' ');

        if (isLineBreakNode(node.prev, blockElements) || isAtEdgeOfBlock(node, true)) {
          text = text.replace(startWhiteSpaceRegExp, '');
        }

        if (text.length === 0) {
          node.remove();
        } else {
          node.value = text;
        }
      }
    }
  };

  const postprocess = (node: AstNode) => {
    if (node.type === 1) {
      // Check for empty nodes here, because children will have been processed and (if necessary) emptied / removed already
      const elementRule = schema.getElementRule(node.name);
      if (validate && elementRule) {
        const isNodeEmpty = isEmpty(schema, nonEmptyElements, whitespaceElements, node);
        if (elementRule.removeEmpty && isNodeEmpty) {
          if (blockElements[node.name]) {
            node.remove();
          } else {
            node.unwrap();
          }
        } else if (elementRule.paddEmpty && (isNodeEmpty || isPaddedWithNbsp(node))) {
          paddEmptyNode(settings, args, blockElements, node);
        }
      }
    } else if (node.type === 3) {
      // Removing trailing whitespace here, so that all whitespace in nodes to the right of us has already been fixed
      if (!hasWhitespaceParent(node)) {
        let text = node.value;
        if (blockElements[node.next?.name] || isAtEdgeOfBlock(node, false)) {
          text = text.replace(endWhiteSpaceRegExp, '');
        }

        if (text.length === 0) {
          node.remove();
        } else {
          node.value = text;
        }
      }
    }
  };

  return [ preprocess, postprocess ];
};

const getRootBlockName = (settings: DomParserSettings, args: ParserArgs) => {
  const name = args.forced_root_block ?? settings.forced_root_block;
  if (name === false) {
    return '';
  } else if (name === true) {
    return 'p';
  } else {
    return name;
  }
};

const DomParser = (settings: DomParserSettings = {}, schema = Schema()): DomParser => {
  const nodeFilters: Record<string, ParserFilterCallback[]> = {};
  const attributeFilters: ParserFilter[] = [];

  // Apply setting defaults
  const defaultedSettings = {
    validate: true,
    root_name: 'body',
    ...settings
  };

  const parser = new DOMParser();
  const purify = setupPurify(defaultedSettings, schema);

  const parseAndSanitizeWithContext = (html: string, rootName: string, format: string = 'html') => {
    const mimeType = format === 'xhtml' ? 'application/xhtml+xml' : 'text/html';
    // Determine the root element to wrap the HTML in when parsing. If we're dealing with a
    // special element then we need to wrap it so the internal content is handled appropriately.
    const isSpecialRoot = Obj.has(schema.getSpecialElements(), rootName.toLowerCase());
    const content = isSpecialRoot ? `<${rootName}>${html}</${rootName}>` : html;
    // If parsing XHTML then the content must contain the xmlns declaration, see https://www.w3.org/TR/xhtml1/normative.html#strict
    const wrappedHtml = format === 'xhtml' ? `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${content}</body></html>` : `<body>${content}</body>`;
    const body = parser.parseFromString(wrappedHtml, mimeType).body;

    // Sanitize the content
    purify.sanitize(body, getPurifyConfig(defaultedSettings, mimeType));
    purify.removed = [];

    return isSpecialRoot ? body.firstChild : body;
  };

  /**
   * Adds a node filter function to the parser, the parser will collect the specified nodes by name
   * and then execute the callback once it has finished parsing the document.
   *
   * @example
   * parser.addNodeFilter('p,h1', function(nodes, name) {
   *  for (var i = 0; i < nodes.length; i++) {
   *   console.log(nodes[i].name);
   *  }
   * });
   * @method addNodeFilter
   * @param {String} name Comma separated list of nodes to collect.
   * @param {function} callback Callback function to execute once it has collected nodes.
   */
  const addNodeFilter = (name: string, callback: ParserFilterCallback) => {
    each(explode(name), (name) => {
      let list = nodeFilters[name];

      if (!list) {
        nodeFilters[name] = list = [];
      }

      list.push(callback);
    });
  };

  const getNodeFilters = (): ParserFilter[] => {
    const out = [];

    for (const name in nodeFilters) {
      if (Obj.has(nodeFilters, name)) {
        out.push({ name, callbacks: nodeFilters[name] });
      }
    }

    return out;
  };

  /**
   * Adds a attribute filter function to the parser, the parser will collect nodes that has the specified attributes
   * and then execute the callback once it has finished parsing the document.
   *
   * @example
   * parser.addAttributeFilter('src,href', function(nodes, name) {
   *  for (var i = 0; i < nodes.length; i++) {
   *   console.log(nodes[i].name);
   *  }
   * });
   * @method addAttributeFilter
   * @param {String} name Comma separated list of nodes to collect.
   * @param {function} callback Callback function to execute once it has collected nodes.
   */
  const addAttributeFilter = (name: string, callback: ParserFilterCallback) => {
    each(explode(name), (name) => {
      let i;

      for (i = 0; i < attributeFilters.length; i++) {
        if (attributeFilters[i].name === name) {
          attributeFilters[i].callbacks.push(callback);
          return;
        }
      }

      attributeFilters.push({ name, callbacks: [ callback ] });
    });
  };

  const getAttributeFilters = (): ParserFilter[] => [].concat(attributeFilters);

  // Test a single node against the current filters, and add it to any match lists if necessary
  const filterNode = (node: AstNode, matches: FilterMatches): void => {
    const name = node.name;
    // Run element filters
    if (name in nodeFilters) {
      const list = matches.nodes[name];

      if (list) {
        list.push(node);
      } else {
        matches.nodes[name] = [ node ];
      }
    }

    // Run attribute filters
    if (node.attributes) {
      let i = attributeFilters.length;
      while (i--) {
        const attrName = attributeFilters[i].name;

        if (attrName in node.attributes.map) {
          const list = matches.attributes[attrName];

          if (list) {
            list.push(node);
          } else {
            matches.attributes[attrName] = [ node ];
          }
        }
      }
    }
  };

  // Run all necessary node filters and attribute filters, based on a match set
  const runFilters = (matches: FilterMatches, args: ParserArgs): void => {
    // Run node filters
    for (const name in matches.nodes) {
      if (Obj.has(matches.nodes, name)) {
        const list = nodeFilters[name];
        const nodes = matches.nodes[name];

        // Remove already removed children
        let fi = nodes.length;
        while (fi--) {
          if (!nodes[fi].parent) {
            nodes.splice(fi, 1);
          }
        }

        const l = list.length;
        for (let i = 0; i < l; i++) {
          list[i](nodes, name, args);
        }
      }
    }

    // Run attribute filters
    const l = attributeFilters.length;
    for (let i = 0; i < l; i++) {
      const list = attributeFilters[i];

      if (list.name in matches.attributes) {
        const nodes = matches.attributes[list.name];

        // Remove already removed children
        let fi = nodes.length;
        while (fi--) {
          if (!nodes[fi].parent) {
            nodes.splice(fi, 1);
          }
        }

        const callbacks = list.callbacks;
        for (let fi = 0, fl = callbacks.length; fi < fl; fi++) {
          callbacks[fi](nodes, list.name, args);
        }
      }
    }
  };

  const findInvalidChildren = (node: AstNode, invalidChildren: AstNode[]): void => {
    // Check if the node is a valid child of the parent node. If the child is
    // unknown we don't collect it since it's probably a custom element
    const parent = node.parent;
    if (parent && schema.children[node.name] && !schema.isValidChild(parent.name, node.name)) {
      invalidChildren.push(node);
    }
  };

  const addRootBlocks = (rootNode: AstNode, rootBlockName: string): void => {
    const blockElements = extend(makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
    const startWhiteSpaceRegExp = /^[ \t\r\n]+/;
    const endWhiteSpaceRegExp = /[ \t\r\n]+$/;

    let node = rootNode.firstChild, rootBlockNode: AstNode | null = null;

    // Removes whitespace at beginning and end of block so:
    // <p> x </p> -> <p>x</p>
    const trim = (rootBlock: AstNode | null) => {
      if (rootBlock) {
        node = rootBlock.firstChild;
        if (node && node.type === 3) {
          node.value = node.value.replace(startWhiteSpaceRegExp, '');
        }

        node = rootBlock.lastChild;
        if (node && node.type === 3) {
          node.value = node.value.replace(endWhiteSpaceRegExp, '');
        }
      }
    };

    // Check if rootBlock is valid within rootNode for example if P is valid in H1 if H1 is the contentEditable root
    if (!schema.isValidChild(rootNode.name, rootBlockName.toLowerCase())) {
      return;
    }

    while (node) {
      const next = node.next;

      if (node.type === 3 || (node.type === 1 && node.name !== 'p' &&
        !blockElements[node.name] && !node.attr('data-mce-type'))) {
        if (!rootBlockNode) {
          // Create a new root block element
          rootBlockNode = new AstNode(rootBlockName, 1);
          rootBlockNode.attr(defaultedSettings.forced_root_block_attrs);
          rootNode.insert(rootBlockNode, node);
          rootBlockNode.append(node);
        } else {
          rootBlockNode.append(node);
        }
      } else {
        trim(rootBlockNode);
        rootBlockNode = null;
      }

      node = next;
    }

    trim(rootBlockNode);
  };

  /**
   * Parses the specified HTML string into a DOM like node tree and returns the result.
   *
   * @example
   * var rootNode = new DomParser({...}).parse('<b>text</b>');
   * @method parse
   * @param {String} html Html string to sax parse.
   * @param {Object} args Optional args object that gets passed to all filter functions.
   * @return {tinymce.html.Node} Root node containing the tree.
   */
  const parse = (html: string, args: ParserArgs = {}): AstNode => {
    const validate = defaultedSettings.validate;
    const rootName = args.context ?? defaultedSettings.root_name;

    // Parse and sanitize the content
    const element = parseAndSanitizeWithContext(html, rootName, args.format);

    // Create the AST representation
    const rootNode = new AstNode(rootName, 11);
    transferChildren(rootNode, element, schema.getSpecialElements());

    // Set up whitespace fixes
    const [ whitespacePre, whitespacePost ] = whitespaceCleaner(rootNode, schema, defaultedSettings, args);

    // Find the invalid children in the tree
    const invalidChildren: AstNode[] = [];
    const invalidFinder = validate ? (node: AstNode) => findInvalidChildren(node, invalidChildren) : Fun.noop;

    // Set up attribute and node matching
    const matches: FilterMatches = { nodes: {}, attributes: {}};
    const matchFinder = (node: AstNode) => filterNode(node, matches);

    // Walk the dom, apply all of the above things
    walkTree(rootNode, [ whitespacePre, matchFinder ], [ whitespacePost, invalidFinder ]);

    // Because we collected invalid children while walking backwards, we need to reverse the list before operating on them
    invalidChildren.reverse();

    // Fix invalid children or report invalid children in a contextual parsing
    if (validate && invalidChildren.length > 0) {
      if (args.context) {
        const { pass: topLevelChildren, fail: otherChildren } = Arr.partition(invalidChildren, (child) => child.parent === rootNode);
        cleanInvalidNodes(otherChildren, schema, matchFinder);
        args.invalid = topLevelChildren.length > 0;
      } else {
        cleanInvalidNodes(invalidChildren, schema, matchFinder);
      }
    }

    // Wrap nodes in the root into block elements if the root is body
    const rootBlockName = getRootBlockName(defaultedSettings, args);
    if (rootBlockName && (rootNode.name === 'body' || args.isRootContent)) {
      addRootBlocks(rootNode, rootBlockName);
    }

    // Run filters only when the contents is valid
    if (!args.invalid) {
      runFilters(matches, args);
    }

    return rootNode;
  };

  const exports = {
    schema,
    addAttributeFilter,
    getAttributeFilters,
    addNodeFilter,
    getNodeFilters,
    parse
  };

  ParserFilters.register(exports, defaultedSettings);
  LegacyFilter.register(exports, defaultedSettings);

  return exports;
};

export default DomParser;
