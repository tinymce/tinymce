import { Arr, Fun, Obj, Type } from '@ephox/katamari';

import * as TransparentElements from '../../content/TransparentElements';
import * as NodeType from '../../dom/NodeType';
import * as FilterNode from '../../html/FilterNode';
import * as FilterRegistry from '../../html/FilterRegistry';
import * as InvalidNodes from '../../html/InvalidNodes';
import * as LegacyFilter from '../../html/LegacyFilter';
import * as Namespace from '../../html/Namespace';
import * as ParserFilters from '../../html/ParserFilters';
import { isEmpty, isLineBreakNode, isPaddedWithNbsp, paddEmptyNode } from '../../html/ParserUtils';
import { getSanitizer, internalElementAttr } from '../../html/Sanitization';
import { BlobCache } from '../file/BlobCache';
import Tools from '../util/Tools';
import AstNode from './Node';
import Schema, { getTextRootBlockElements, SchemaMap, SchemaRegExpMap } from './Schema';

/**
 * @summary
 * This class parses HTML code into a DOM like structure of nodes it will remove redundant whitespace and make
 * sure that the node tree is valid according to the specified schema.
 * So for example: `<p>a<p>b</p>c</p>` will become `<p>a</p><p>b</p><p>c</p>`.
 *
 * @example
 * const parser = tinymce.html.DomParser({ validate: true }, schema);
 * const rootNode = parser.parse('<h1>content</h1>');
 *
 * @class tinymce.html.DomParser
 * @version 3.4
 */

const makeMap = Tools.makeMap, extend = Tools.extend;

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

export interface ParserFilter extends FilterRegistry.Filter<ParserFilterCallback> {}

export interface DomParserSettings {
  allow_html_data_urls?: boolean;
  allow_svg_data_urls?: boolean;
  allow_conditional_comments?: boolean;
  allow_html_in_named_anchor?: boolean;
  allow_script_urls?: boolean;
  allow_unsafe_link_target?: boolean;
  blob_cache?: BlobCache;
  convert_fonts_to_spans?: boolean;
  convert_unsafe_embeds?: boolean;
  document?: Document;
  fix_list_elements?: boolean;
  font_size_legacy_values?: string;
  forced_root_block?: boolean | string;
  forced_root_block_attrs?: Record<string, string>;
  inline_styles?: boolean;
  pad_empty_with_br?: boolean;
  preserve_cdata?: boolean;
  /**
   * @deprecated Remove trailing <br> tags functionality has been added to tinymce.dom.Serializer and option will be removed in the next major release */
  remove_trailing_brs?: boolean;
  root_name?: string;
  sandbox_iframes?: boolean;
  sanitize?: boolean;
  validate?: boolean;
}

interface DomParser {
  schema: Schema;
  addAttributeFilter: (name: string, callback: ParserFilterCallback) => void;
  getAttributeFilters: () => ParserFilter[];
  removeAttributeFilter: (name: string, callback?: ParserFilterCallback) => void;
  addNodeFilter: (name: string, callback: ParserFilterCallback) => void;
  getNodeFilters: () => ParserFilter[];
  removeNodeFilter: (name: string, callback?: ParserFilterCallback) => void;
  parse: (html: string, args?: ParserArgs) => AstNode;
}

type WalkerCallback = (node: AstNode) => void;

const transferChildren = (parent: AstNode, nativeParent: Node, specialElements: SchemaRegExpMap, nsSanitizer: (el: Element) => void) => {
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

      if (Namespace.isNonHtmlElementRootName(child.name)) {
        nsSanitizer(nativeChild);
        child.value = nativeChild.innerHTML;
      }
    } else if (NodeType.isText(nativeChild)) {
      child.value = nativeChild.data;
      if (isSpecial) {
        child.raw = true;
      }
    } else if (NodeType.isComment(nativeChild) || NodeType.isCData(nativeChild) || NodeType.isPi(nativeChild)) {
      child.value = nativeChild.data;
    }

    if (!Namespace.isNonHtmlElementRootName(child.name)) {
      transferChildren(child, nativeChild, specialElements, nsSanitizer);
    }

    parent.append(child);
  }
};

const walkTree = (root: AstNode, preprocessors: WalkerCallback[], postprocessors: WalkerCallback[]) => {
  const traverseOrder: AstNode[] = [];

  for (let node: AstNode | null | undefined = root, lastNode = node; node; lastNode = node, node = node.walk()) {
    const tempNode = node;
    Arr.each(preprocessors, (preprocess) => preprocess(tempNode));

    if (Type.isNullable(tempNode.parent) && tempNode !== root) {
      // The node has been detached, so rewind a little and don't add it to our traversal
      node = lastNode;
    } else {
      traverseOrder.push(tempNode);
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
  const whitespaceElements = schema.getWhitespaceElements();
  const blockElements: Record<string, string> = extend(makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
  const textRootBlockElements = getTextRootBlockElements(schema);
  const allWhiteSpaceRegExp = /[ \t\r\n]+/g;
  const startWhiteSpaceRegExp = /^[ \t\r\n]+/;
  const endWhiteSpaceRegExp = /[ \t\r\n]+$/;

  const hasWhitespaceParent = (node: AstNode) => {
    let tempNode = node.parent;
    while (Type.isNonNullable(tempNode)) {
      if (tempNode.name in whitespaceElements) {
        return true;
      } else {
        tempNode = tempNode.parent;
      }
    }
    return false;
  };

  const isTextRootBlockEmpty = (node: AstNode) => {
    let tempNode: AstNode | null | undefined = node;
    while (Type.isNonNullable(tempNode)) {
      if (tempNode.name in textRootBlockElements) {
        return isEmpty(schema, nonEmptyElements, whitespaceElements, tempNode);
      } else {
        tempNode = tempNode.parent;
      }
    }
    return false;
  };

  const isBlock = (node: AstNode) =>
    node.name in blockElements || TransparentElements.isTransparentAstBlock(schema, node) || (Namespace.isNonHtmlElementRootName(node.name) && node.parent === root);

  const isAtEdgeOfBlock = (node: AstNode, start: boolean): boolean => {
    const neighbour = start ? node.prev : node.next;
    if (Type.isNonNullable(neighbour) || Type.isNullable(node.parent)) {
      return false;
    }

    // Make sure our parent is actually a block, and also make sure it isn't a temporary "context" element
    // that we're probably going to unwrap as soon as we insert this content into the editor
    return isBlock(node.parent) && (node.parent !== root || args.isRootContent === true);
  };

  const preprocess = (node: AstNode) => {
    if (node.type === 3) {
      // Remove leading whitespace here, so that all whitespace in nodes to the left of us has already been fixed
      if (!hasWhitespaceParent(node)) {
        let text = node.value ?? '';
        text = text.replace(allWhiteSpaceRegExp, ' ');

        if (isLineBreakNode(node.prev, isBlock) || isAtEdgeOfBlock(node, true)) {
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

        if (elementRule.paddInEmptyBlock && isNodeEmpty && isTextRootBlockEmpty(node)) {
          paddEmptyNode(settings, args, isBlock, node);
        } else if (elementRule.removeEmpty && isNodeEmpty) {
          if (isBlock(node)) {
            node.remove();
          } else {
            node.unwrap();
          }
        } else if (elementRule.paddEmpty && (isNodeEmpty || isPaddedWithNbsp(node))) {
          paddEmptyNode(settings, args, isBlock, node);
        }
      }
    } else if (node.type === 3) {
      // Removing trailing whitespace here, so that all whitespace in nodes to the right of us has already been fixed
      if (!hasWhitespaceParent(node)) {
        let text = node.value ?? '';
        if (node.next && isBlock(node.next) || isAtEdgeOfBlock(node, false)) {
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
  const nodeFilterRegistry = FilterRegistry.create<ParserFilterCallback>();
  const attributeFilterRegistry = FilterRegistry.create<ParserFilterCallback>();

  // Apply setting defaults
  const defaultedSettings = {
    validate: true,
    root_name: 'body',
    sanitize: true,
    ...settings
  };

  const parser = new DOMParser();
  const sanitizer = getSanitizer(defaultedSettings, schema);

  const parseAndSanitizeWithContext = (html: string, rootName: string, format: string = 'html'): Element => {
    const mimeType = format === 'xhtml' ? 'application/xhtml+xml' : 'text/html';
    // Determine the root element to wrap the HTML in when parsing. If we're dealing with a
    // special element then we need to wrap it so the internal content is handled appropriately.
    const isSpecialRoot = Obj.has(schema.getSpecialElements(), rootName.toLowerCase());
    const content = isSpecialRoot ? `<${rootName}>${html}</${rootName}>` : html;
    // If parsing XHTML then the content must contain the xmlns declaration, see https://www.w3.org/TR/xhtml1/normative.html#strict
    const wrappedHtml = format === 'xhtml' ? `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${content}</body></html>` : `<body>${content}</body>`;
    const body = parser.parseFromString(wrappedHtml, mimeType).body;
    sanitizer.sanitizeHtmlElement(body, mimeType);
    return isSpecialRoot ? body.firstChild as Element : body;
  };

  /**
   * Adds a node filter function to the parser, the parser will collect the specified nodes by name
   * and then execute the callback once it has finished parsing the document.
   *
   * @method addNodeFilter
   * @param {String} name Comma separated list of nodes to collect.
   * @param {Function} callback Callback function to execute once it has collected nodes.
   * @example
   * parser.addNodeFilter('p,h1', (nodes, name) => {
   *   for (var i = 0; i < nodes.length; i++) {
   *     console.log(nodes[i].name);
   *   }
   * });
   */
  const addNodeFilter = nodeFilterRegistry.addFilter;

  const getNodeFilters = nodeFilterRegistry.getFilters;

  /**
   * Removes a node filter function or removes all filter functions from the parser for the node names provided.
   *
   * @method removeNodeFilter
   * @param {String} name Comma separated list of node names to remove filters for.
   * @param {Function} callback Optional callback function to only remove a specific callback.
   * @example
   * // Remove a single filter
   * parser.removeNodeFilter('p,h1', someCallback);
   *
   * // Remove all filters
   * parser.removeNodeFilter('p,h1');
   */
  const removeNodeFilter = nodeFilterRegistry.removeFilter;

  /**
   * Adds an attribute filter function to the parser, the parser will collect nodes that has the specified attributes
   * and then execute the callback once it has finished parsing the document.
   *
   * @method addAttributeFilter
   * @param {String} name Comma separated list of attributes to collect.
   * @param {Function} callback Callback function to execute once it has collected nodes.
   * @example
   * parser.addAttributeFilter('src,href', (nodes, name) => {
   *   for (let i = 0; i < nodes.length; i++) {
   *     console.log(nodes[i].name);
   *   }
   * });
   */
  const addAttributeFilter = attributeFilterRegistry.addFilter;

  const getAttributeFilters = attributeFilterRegistry.getFilters;

  /**
   * Removes an attribute filter function or removes all filter functions from the parser for the attribute names provided.
   *
   * @method removeAttributeFilter
   * @param {String} name Comma separated list of attribute names to remove filters for.
   * @param {Function} callback Optional callback function to only remove a specific callback.
   * @example
   * // Remove a single filter
   * parser.removeAttributeFilter('src,href', someCallback);
   *
   * // Remove all filters
   * parser.removeAttributeFilter('src,href');
   */
  const removeAttributeFilter = attributeFilterRegistry.removeFilter;

  const findInvalidChildren = (node: AstNode, invalidChildren: AstNode[]): void => {
    if (InvalidNodes.isInvalid(schema, node)) {
      invalidChildren.push(node);
    }
  };

  const isWrappableNode = (blockElements: SchemaMap, node: AstNode) => {
    const isInternalElement = Type.isString(node.attr(internalElementAttr));
    const isInlineElement = node.type === 1 && (!Obj.has(blockElements, node.name) && !TransparentElements.isTransparentAstBlock(schema, node)) && !Namespace.isNonHtmlElementRootName(node.name);

    return node.type === 3 || (isInlineElement && !isInternalElement);
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
          node.value = node.value?.replace(startWhiteSpaceRegExp, '');
        }

        node = rootBlock.lastChild;
        if (node && node.type === 3) {
          node.value = node.value?.replace(endWhiteSpaceRegExp, '');
        }
      }
    };

    // Check if rootBlock is valid within rootNode for example if P is valid in H1 if H1 is the contentEditable root
    if (!schema.isValidChild(rootNode.name, rootBlockName.toLowerCase())) {
      return;
    }

    while (node) {
      const next = node.next;

      if (isWrappableNode(blockElements, node)) {
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
   * @method parse
   * @param {String} html Html string to sax parse.
   * @param {Object} args Optional args object that gets passed to all filter functions.
   * @return {tinymce.html.Node} Root node containing the tree.
   * @example
   * const rootNode = tinymce.html.DomParser({...}).parse('<b>text</b>');
   */
  const parse = (html: string, args: ParserArgs = {}): AstNode => {
    const validate = defaultedSettings.validate;
    const rootName = args.context ?? defaultedSettings.root_name;

    // Parse and sanitize the content
    const element = parseAndSanitizeWithContext(html, rootName, args.format);

    TransparentElements.updateChildren(schema, element);

    // Create the AST representation
    const rootNode = new AstNode(rootName, 11);
    transferChildren(rootNode, element, schema.getSpecialElements(), sanitizer.sanitizeNamespaceElement);

    // This next line is needed to fix a memory leak in chrome and firefox.
    // For more information see TINY-9186
    element.innerHTML = '';

    // Set up whitespace fixes
    const [ whitespacePre, whitespacePost ] = whitespaceCleaner(rootNode, schema, defaultedSettings, args);

    // Find the invalid children in the tree
    const invalidChildren: AstNode[] = [];
    const invalidFinder = validate ? (node: AstNode) => findInvalidChildren(node, invalidChildren) : Fun.noop;

    // Set up attribute and node matching
    const matches: FilterNode.FilterMatches = { nodes: {}, attributes: {}};
    const matchFinder = (node: AstNode) => FilterNode.matchNode(getNodeFilters(), getAttributeFilters(), node, matches);

    // Walk the dom, apply all of the above things
    walkTree(rootNode, [ whitespacePre, matchFinder ], [ whitespacePost, invalidFinder ]);

    // Because we collected invalid children while walking backwards, we need to reverse the list before operating on them
    invalidChildren.reverse();

    // Fix invalid children or report invalid children in a contextual parsing
    if (validate && invalidChildren.length > 0) {
      if (args.context) {
        const { pass: topLevelChildren, fail: otherChildren } = Arr.partition(invalidChildren, (child) => child.parent === rootNode);
        InvalidNodes.cleanInvalidNodes(otherChildren, schema, rootNode, matchFinder);
        args.invalid = topLevelChildren.length > 0;
      } else {
        InvalidNodes.cleanInvalidNodes(invalidChildren, schema, rootNode, matchFinder);
      }
    }

    // Wrap nodes in the root into block elements if the root is body
    const rootBlockName = getRootBlockName(defaultedSettings, args);
    if (rootBlockName && (rootNode.name === 'body' || args.isRootContent)) {
      addRootBlocks(rootNode, rootBlockName);
    }

    // Run filters only when the contents is valid
    if (!args.invalid) {
      FilterNode.runFilters(matches, args);
    }

    return rootNode;
  };

  const exports = {
    schema,
    addAttributeFilter,
    getAttributeFilters,
    removeAttributeFilter,
    addNodeFilter,
    getNodeFilters,
    removeNodeFilter,
    parse
  };

  ParserFilters.register(exports, defaultedSettings);
  LegacyFilter.register(exports, defaultedSettings, schema);

  return exports;
};

export default DomParser;
