/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import { cleanInvalidNodes } from '../../html/InvalidNodes';
import * as LegacyFilter from '../../html/LegacyFilter';
import * as ParserFilters from '../../html/ParserFilters';
import { isEmpty, isLineBreakNode, isPaddedWithNbsp, paddEmptyNode } from '../../html/ParserUtils';
import { BlobCache } from '../file/BlobCache';
import Tools from '../util/Tools';
import AstNode from './Node';
import SaxParser, { ParserFormat } from './SaxParser';
import Schema, { SchemaElement, SchemaMap } from './Schema';

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
  padd_empty_with_br?: boolean;
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

// For internal parser use only: a summary of the nodes that have been parsed
interface WalkResult {
  readonly invalidChildren: AstNode[];
  readonly matchedNodes: Record<string, AstNode[]>;
  readonly matchedAttributes: Record<string, AstNode[]>;
}

const builder = (rootNode: AstNode, html: string, settings: DomParserSettings, schema: Schema, args: ParserArgs) => {
  const blockElements = extend(makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
  const whiteSpaceElements = schema.getWhiteSpaceElements();
  const nonEmptyElements = schema.getNonEmptyElements();
  const allWhiteSpaceRegExp = /[ \t\r\n]+/g;
  const isAllWhiteSpaceRegExp = /^[ \t\r\n]+$/;
  const startWhiteSpaceRegExp = /^[ \t\r\n]+/;
  const endWhiteSpaceRegExp = /[ \t\r\n]+$/;

  let node = rootNode;
  let isInWhiteSpacePreservedElement = Obj.has(whiteSpaceElements, args.context) || Obj.has(whiteSpaceElements, settings.root_name);

  const removeWhitespaceBefore = (node: AstNode): void => {
    const blockElements = schema.getBlockElements();

    for (let textNode = node.prev; textNode && textNode.type === 3;) {
      const textVal = textNode.value.replace(endWhiteSpaceRegExp, '');

      // Found a text node with non whitespace then trim that and break
      if (textVal.length > 0) {
        textNode.value = textVal;
        return;
      }

      const textNodeNext = textNode.next;

      // Fix for bug #7543 where bogus nodes would produce empty
      // text nodes and these would be removed if a nested list was before it
      if (textNodeNext) {
        if (textNodeNext.type === 3 && textNodeNext.value.length) {
          textNode = textNode.prev;
          continue;
        }

        if (!blockElements[textNodeNext.name] && textNodeNext.name !== 'script' && textNodeNext.name !== 'style') {
          textNode = textNode.prev;
          continue;
        }
      }

      const sibling = textNode.prev;
      textNode.remove();
      textNode = sibling;
    }
  };

  const cloneAndExcludeBlocks = (input: SchemaMap) => {
    const output: SchemaMap = {};

    for (const name in input) {
      if (name !== 'li' && name !== 'p') {
        output[name] = input[name];
      }
    }

    return output;
  };

  const parser = SaxParser({
    validate: settings.validate,
    document: settings.document,
    allow_html_data_urls: settings.allow_html_data_urls,
    allow_svg_data_urls: settings.allow_svg_data_urls,
    allow_script_urls: settings.allow_script_urls,
    allow_conditional_comments: settings.allow_conditional_comments,
    preserve_cdata: settings.preserve_cdata,

    // Exclude P and LI from DOM parsing since it's treated better by the DOM parser
    self_closing_elements: cloneAndExcludeBlocks(schema.getSelfClosingElements()),

    cdata: (text) => {
      node.append(new AstNode('#cdata', 4)).value = text;
    },

    text: (text, raw) => {
      let textNode;

      // Trim all redundant whitespace on non white space elements
      if (!isInWhiteSpacePreservedElement) {
        text = text.replace(allWhiteSpaceRegExp, ' ');

        if (isLineBreakNode(node.lastChild, blockElements)) {
          text = text.replace(startWhiteSpaceRegExp, '');
        }
      }

      // Do we need to create the node
      if (text.length !== 0) {
        textNode = new AstNode('#text', 3);
        textNode.raw = !!raw;
        node.append(textNode).value = text;
      }
    },

    comment: (text) => {
      node.append(new AstNode('#comment', 8)).value = text;
    },

    pi: (name, text) => {
      node.append(new AstNode(name, 7)).value = text;
      removeWhitespaceBefore(node);
    },

    doctype: (text) => {
      const newNode = node.append(new AstNode('#doctype', 10));
      newNode.value = text;
      removeWhitespaceBefore(node);
    },

    start: (name, attrs, empty) => {
      const newNode = new AstNode(name, 1);
      newNode.attributes = attrs;

      node.append(newNode);

      // Trim whitespace before block
      if (blockElements[name]) {
        removeWhitespaceBefore(newNode);
      }

      // Change current node if the element wasn't empty i.e not <br /> or <img />
      if (!empty) {
        node = newNode;
      }

      // Check if we are inside a whitespace preserved element
      if (!isInWhiteSpacePreservedElement && whiteSpaceElements[name]) {
        isInWhiteSpacePreservedElement = true;
      }
    },

    end: (name) => {
      let textNode, text, sibling, tempNode;

      const elementRule = settings.validate && schema.getElementRule(node.name) || {} as SchemaElement;
      if (blockElements[name]) {
        if (!isInWhiteSpacePreservedElement) {
          // Trim whitespace of the first node in a block
          textNode = node.firstChild;
          if (textNode && textNode.type === 3) {
            text = textNode.value.replace(startWhiteSpaceRegExp, '');

            // Any characters left after trim or should we remove it
            if (text.length > 0) {
              textNode.value = text;
              textNode = textNode.next;
            } else {
              sibling = textNode.next;
              textNode.remove();
              textNode = sibling;

              // Remove any pure whitespace siblings
              while (textNode && textNode.type === 3) {
                text = textNode.value;
                sibling = textNode.next;

                if (text.length === 0 || isAllWhiteSpaceRegExp.test(text)) {
                  textNode.remove();
                  textNode = sibling;
                }

                textNode = sibling;
              }
            }
          }

          // Trim whitespace of the last node in a block
          textNode = node.lastChild;
          if (textNode && textNode.type === 3) {
            text = textNode.value.replace(endWhiteSpaceRegExp, '');

            // Any characters left after trim or should we remove it
            if (text.length > 0) {
              textNode.value = text;
              textNode = textNode.prev;
            } else {
              sibling = textNode.prev;
              textNode.remove();
              textNode = sibling;

              // Remove any pure whitespace siblings
              while (textNode && textNode.type === 3) {
                text = textNode.value;
                sibling = textNode.prev;

                if (text.length === 0 || isAllWhiteSpaceRegExp.test(text)) {
                  textNode.remove();
                  textNode = sibling;
                }

                textNode = sibling;
              }
            }
          }
        }

        // Trim start white space
        // Removed due to: #5424
        /* textNode = node.prev;
        if (textNode && textNode.type === 3) {
          text = textNode.value.replace(startWhiteSpaceRegExp, '');

          if (text.length > 0)
            textNode.value = text;
          else
            textNode.remove();
        }*/
      }

      // Check if we exited a whitespace preserved element
      if (isInWhiteSpacePreservedElement && whiteSpaceElements[name]) {
        isInWhiteSpacePreservedElement = false;
      }

      if (elementRule.removeEmpty && isEmpty(schema, nonEmptyElements, whiteSpaceElements, node)) {
        tempNode = node.parent;

        if (blockElements[node.name]) {
          node.empty().remove();
        } else {
          node.unwrap();
        }

        node = tempNode;
        return;
      }

      if (elementRule.paddEmpty && (isPaddedWithNbsp(node) || isEmpty(schema, nonEmptyElements, whiteSpaceElements, node))) {
        paddEmptyNode(settings, args, blockElements, node);
      }

      node = node.parent;
    }
  }, schema);

  parser.parse(html, args.format as ParserFormat);
};

const walker = (root: AstNode, settings: DomParserSettings, schema: Schema, nodeFilters: Record<string, ParserFilterCallback[]>, attributeFilters: ParserFilter[]): WalkResult => {
  const state = { invalidChildren: [], matchedNodes: {}, matchedAttributes: {}};

  let node = root;
  while ((node = node.walk())) {
    if (node.type === 1) {
      const elementRule = settings.validate ? schema.getElementRule(node.name) : {} as SchemaElement;
      if (!elementRule) {
        const previous = node.walk(true);
        node.unwrap();
        node = previous;
        continue;
      }
      if (elementRule.outputName) {
        node.name = elementRule.outputName;
      }
    }
    filterNode(node, nodeFilters, attributeFilters, state);

    const parent = node.parent;
    if (!parent) {
      continue;
    }

    // Check if node is valid child of the parent node is the child is
    // unknown we don't collect it since it's probably a custom element
    if (schema.children[parent.name] && schema.children[node.name] && !schema.children[parent.name][node.name]) {
      state.invalidChildren.push(node);
    }
  }

  return state;
};

const filterNode = (node: AstNode, nodeFilters: Record<string, ParserFilterCallback[]>, attributeFilters: ParserFilter[], state: WalkResult): AstNode => {
  const name = node.name;
  // Run element filters
  if (name in nodeFilters) {
    const list = state.matchedNodes[name];

    if (list) {
      list.push(node);
    } else {
      state.matchedNodes[name] = [ node ];
    }
  }

  // Run attribute filters
  if (node.attributes) {
    let i = attributeFilters.length;
    while (i--) {
      const attrName = attributeFilters[i].name;

      if (attrName in node.attributes.map) {
        const list = state.matchedAttributes[attrName];

        if (list) {
          list.push(node);
        } else {
          state.matchedAttributes[attrName] = [ node ];
        }
      }
    }
  }

  return node;
};

const DomParser = (settings?: DomParserSettings, schema = Schema()): DomParser => {
  const nodeFilters: Record<string, ParserFilterCallback[]> = {};
  const attributeFilters: ParserFilter[] = [];

  settings = settings || {};
  settings.validate = 'validate' in settings ? settings.validate : true;
  settings.root_name = settings.root_name || 'body';

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
  const parse = (html: string, args?: ParserArgs): AstNode => {
    let nodes, i, l, fi, fl, name;

    const getRootBlockName = (name: string | boolean) => {
      if (name === false) {
        return '';
      } else if (name === true) {
        return 'p';
      } else {
        return name;
      }
    };

    args = args || {};
    const blockElements = extend(makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
    const validate = settings.validate;
    const forcedRootBlockName = 'forced_root_block' in args ? args.forced_root_block : settings.forced_root_block;
    const rootBlockName = getRootBlockName(forcedRootBlockName);
    const startWhiteSpaceRegExp = /^[ \t\r\n]+/;
    const endWhiteSpaceRegExp = /[ \t\r\n]+$/;

    const addRootBlocks = (): void => {
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

      // Check if rootBlock is valid within rootNode for example if P is valid in H1 if H1 is the contentEditabe root
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
            rootBlockNode.attr(settings.forced_root_block_attrs);
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

    const rootNode = new AstNode(args.context || settings.root_name, 11);
    builder(rootNode, html, settings, schema, args);
    const state = walker(rootNode, settings, schema, nodeFilters, attributeFilters);

    // Fix invalid children or report invalid children in a contextual parsing
    if (validate && state.invalidChildren.length) {
      if (args.context) {
        const { pass: topLevelChildren, fail: otherChildren } = Arr.partition(state.invalidChildren, (child) => child.parent === rootNode);
        cleanInvalidNodes(otherChildren, schema, (newNode) => filterNode(newNode, nodeFilters, attributeFilters, state));
        args.invalid = topLevelChildren.length > 0;
      } else {
        cleanInvalidNodes(state.invalidChildren, schema, (newNode) => filterNode(newNode, nodeFilters, attributeFilters, state));
      }
    }

    // Wrap nodes in the root into block elements if the root is body
    if (rootBlockName && (rootNode.name === 'body' || args.isRootContent)) {
      addRootBlocks();
    }

    // Run filters only when the contents is valid
    if (!args.invalid) {
      // Run node filters
      for (name in state.matchedNodes) {
        if (!Obj.has(state.matchedNodes, name)) {
          continue;
        }
        const list = nodeFilters[name];
        nodes = state.matchedNodes[name];

        // Remove already removed children
        fi = nodes.length;
        while (fi--) {
          if (!nodes[fi].parent) {
            nodes.splice(fi, 1);
          }
        }

        for (i = 0, l = list.length; i < l; i++) {
          list[i](nodes, name, args);
        }
      }

      // Run attribute filters
      for (i = 0, l = attributeFilters.length; i < l; i++) {
        const list = attributeFilters[i];

        if (list.name in state.matchedAttributes) {
          nodes = state.matchedAttributes[list.name];

          // Remove already removed children
          fi = nodes.length;
          while (fi--) {
            if (!nodes[fi].parent) {
              nodes.splice(fi, 1);
            }
          }

          for (fi = 0, fl = list.callbacks.length; fi < fl; fi++) {
            list.callbacks[fi](nodes, list.name, args);
          }
        }
      }
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

  ParserFilters.register(exports, settings);
  LegacyFilter.register(exports, settings);

  return exports;
};

export default DomParser;
