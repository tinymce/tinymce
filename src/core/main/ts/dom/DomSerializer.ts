/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element as DOMElement } from '@ephox/dom-globals';
import { Fun, Merger } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Events from '../api/Events';
import DOMUtils from '../api/dom/DOMUtils';
import DomSerializerFilters from './DomSerializerFilters';
import DomSerializerPreProcess from './DomSerializerPreProcess';
import DomParser, { DomParserSettings, ParserArgs } from '../api/html/DomParser';
import Schema, { SchemaSettings } from '../api/html/Schema';
import Serializer, { SerializerSettings } from '../api/html/Serializer';
import Zwsp from '../text/Zwsp';
import Tools from '../api/util/Tools';
import { isWsPreserveElement } from './ElementType';
import Node from '../api/html/Node';
import Editor from '../api/Editor';

export interface SerializerArgs extends ParserArgs {
  format?: string;
}

interface DomSerializerSettings extends DomParserSettings, SchemaSettings, SerializerSettings {
  entity_encoding?: string;
}

interface DomSerializer {
  schema: Schema;
  addNodeFilter (name: string, callback: (nodes: Node[], name: string, args: ParserArgs) => void): void;
  addAttributeFilter (name: string, callback: (nodes: Node[], name: string, args: ParserArgs) => void): void;
  serialize (node: DOMElement, parserArgs: { format: 'tree' } & SerializerArgs): Node;
  serialize (node: DOMElement, parserArgs?: SerializerArgs): string;
  addRules (rules: string): void;
  setRules (rules: string): void;
  addTempAttr (name: string): void;
  getTempAttrs (): string[];
}

const addTempAttr = function (htmlParser, tempAttrs, name) {
  if (Tools.inArray(tempAttrs, name) === -1) {
    htmlParser.addAttributeFilter(name, function (nodes, name) {
      let i = nodes.length;

      while (i--) {
        nodes[i].attr(name, null);
      }
    });

    tempAttrs.push(name);
  }
};

const postProcess = function (editor: Editor, args, content: string) {
  if (!args.no_events && editor) {
    const outArgs = Events.firePostProcess(editor, Merger.merge(args, { content }));
    return outArgs.content;
  } else {
    return content;
  }
};

const getHtmlFromNode = function (dom: DOMUtils, node: DOMElement, args) {
  const html = Zwsp.trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node));
  return args.selection || isWsPreserveElement(Element.fromDom(node)) ? html : Tools.trim(html);
};

const parseHtml = function (htmlParser, html: string, args) {
  const parserArgs = args.selection ? Merger.merge({ forced_root_block: false }, args) : args;
  const rootNode = htmlParser.parse(html, parserArgs);
  DomSerializerFilters.trimTrailingBr(rootNode);
  return rootNode;
};

const serializeNode = function (settings: SerializerSettings, schema: Schema, node: Node) {
  const htmlSerializer = Serializer(settings, schema);
  return htmlSerializer.serialize(node);
};

const toHtml = function (editor: Editor, settings: SerializerSettings, schema: Schema, rootNode: Node, args) {
  const content = serializeNode(settings, schema, rootNode);
  return postProcess(editor, args, content);
};

const DomSerializer = function (settings: DomSerializerSettings, editor: Editor): DomSerializer {
  let dom: DOMUtils, schema: Schema, htmlParser;
  const tempAttrs = ['data-mce-selected'];

  dom = editor && editor.dom ? editor.dom : DOMUtils.DOM;
  schema = editor && editor.schema ? editor.schema : Schema(settings);
  settings.entity_encoding = settings.entity_encoding || 'named';
  settings.remove_trailing_brs = 'remove_trailing_brs' in settings ? settings.remove_trailing_brs : true;

  htmlParser = DomParser(settings, schema);
  DomSerializerFilters.register(htmlParser, settings, dom);

  const serialize = function (node, parserArgs?) {
    const args = Merger.merge({ format: 'html' }, parserArgs ? parserArgs : {});
    const targetNode = DomSerializerPreProcess.process(editor, node, args);
    const html = getHtmlFromNode(dom, targetNode, args);
    const rootNode = parseHtml(htmlParser, html, args);
    return args.format === 'tree' ? rootNode : toHtml(editor, settings, schema, rootNode, args);
  };

  return {
    schema,
    addNodeFilter: htmlParser.addNodeFilter,
    addAttributeFilter: htmlParser.addAttributeFilter,
    serialize,
    addRules (rules) {
      schema.addValidElements(rules);
    },
    setRules (rules) {
      schema.setValidElements(rules);
    },
    addTempAttr: Fun.curry(addTempAttr, htmlParser, tempAttrs),
    getTempAttrs () {
      return tempAttrs;
    }
  };
};

export {
  DomSerializer,
  DomSerializerSettings
};