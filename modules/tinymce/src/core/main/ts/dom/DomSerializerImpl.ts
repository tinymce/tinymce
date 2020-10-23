/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Events from '../api/Events';
import DomParser, { DomParserSettings, ParserArgs, ParserFilter } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema, { SchemaSettings } from '../api/html/Schema';
import HtmlSerializer, { HtmlSerializerSettings } from '../api/html/Serializer';
import { WriterSettings } from '../api/html/Writer';
import { URLConverter } from '../api/SettingsTypes';
import Tools from '../api/util/Tools';
import * as Zwsp from '../text/Zwsp';
import * as DomSerializerFilters from './DomSerializerFilters';
import * as DomSerializerPreProcess from './DomSerializerPreProcess';
import { isWsPreserveElement } from './ElementType';

export interface DomSerializerArgs extends ParserArgs {
  format?: string;
}

interface DomSerializerSettings extends DomParserSettings, WriterSettings, SchemaSettings, HtmlSerializerSettings {
  url_converter?: URLConverter;
  url_converter_scope?: {};
}

interface DomSerializerImpl {
  schema: Schema;
  addNodeFilter (name: string, callback: (nodes: AstNode[], name: string, args: ParserArgs) => void): void;
  addAttributeFilter (name: string, callback: (nodes: AstNode[], name: string, args: ParserArgs) => void): void;
  getNodeFilters (): ParserFilter[];
  getAttributeFilters (): ParserFilter[];
  serialize (node: Element, parserArgs: { format: 'tree' } & DomSerializerArgs): AstNode;
  serialize (node: Element, parserArgs?: DomSerializerArgs): string;
  addRules (rules: string): void;
  setRules (rules: string): void;
  addTempAttr (name: string): void;
  getTempAttrs (): string[];
}

const addTempAttr = function (htmlParser: DomParser, tempAttrs: string[], name: string) {
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

const postProcess = function (editor: Editor, args: ParserArgs, content: string) {
  if (!args.no_events && editor) {
    const outArgs = Events.firePostProcess(editor, { ...args, content });
    return outArgs.content;
  } else {
    return content;
  }
};

const getHtmlFromNode = function (dom: DOMUtils, node: Element, args) {
  const html = Zwsp.trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node));
  return args.selection || isWsPreserveElement(SugarElement.fromDom(node)) ? html : Tools.trim(html);
};

const parseHtml = function (htmlParser: DomParser, html: string, args: ParserArgs) {
  const parserArgs = args.selection ? { forced_root_block: false, ...args } : args;
  const rootNode = htmlParser.parse(html, parserArgs);
  DomSerializerFilters.trimTrailingBr(rootNode);
  return rootNode;
};

const serializeNode = function (settings: HtmlSerializerSettings, schema: Schema, node: AstNode) {
  const htmlSerializer = HtmlSerializer(settings, schema);
  return htmlSerializer.serialize(node);
};

const toHtml = function (editor: Editor, settings: HtmlSerializerSettings, schema: Schema, rootNode: AstNode, args: ParserArgs) {
  const content = serializeNode(settings, schema, rootNode);
  return postProcess(editor, args, content);
};

const DomSerializerImpl = function (settings: DomSerializerSettings, editor: Editor): DomSerializerImpl {
  const tempAttrs = [ 'data-mce-selected' ];

  const dom = editor && editor.dom ? editor.dom : DOMUtils.DOM;
  const schema = editor && editor.schema ? editor.schema : Schema(settings);
  settings.entity_encoding = settings.entity_encoding || 'named';
  settings.remove_trailing_brs = 'remove_trailing_brs' in settings ? settings.remove_trailing_brs : true;

  const htmlParser = DomParser(settings, schema);
  DomSerializerFilters.register(htmlParser, settings, dom);

  const serialize = function (node: Element, parserArgs = {}) {
    const args = { format: 'html', ...parserArgs };
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
    addRules(rules) {
      schema.addValidElements(rules);
    },
    setRules(rules) {
      schema.setValidElements(rules);
    },
    addTempAttr: Fun.curry(addTempAttr, htmlParser, tempAttrs),
    getTempAttrs() {
      return tempAttrs;
    },
    getNodeFilters: htmlParser.getNodeFilters,
    getAttributeFilters: htmlParser.getAttributeFilters
  };
};

export {
  DomSerializerImpl,
  DomSerializerSettings
};
