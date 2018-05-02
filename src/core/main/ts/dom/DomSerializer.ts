/**
 * DomSerializer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun, Merger } from '@ephox/katamari';
import Events from '../api/Events';
import DOMUtils from '../api/dom/DOMUtils';
import DomSerializerFilters from './DomSerializerFilters';
import DomSerializerPreProcess from './DomSerializerPreProcess';
import DomParser from '../api/html/DomParser';
import Schema from '../api/html/Schema';
import Serializer from '../api/html/Serializer';
import Zwsp from '../text/Zwsp';
import Tools from '../api/util/Tools';
import { Element } from '@ephox/sugar';
import { isWsPreserveElement } from 'tinymce/core/dom/ElementType';
import Node from 'tinymce/core/api/html/Node';
import { Editor } from 'tinymce/core/api/Editor';
import { HTMLElement } from '@ephox/dom-globals';

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

const postProcess = function (editor, args, content) {
  if (!args.no_events && editor) {
    const outArgs = Events.firePostProcess(editor, Merger.merge(args, { content }));
    return outArgs.content;
  } else {
    return content;
  }
};

const getHtmlFromNode = function (dom: DOMUtils, node: HTMLElement, args) {
  const html = Zwsp.trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node));
  return args.selection || isWsPreserveElement(Element.fromDom(node)) ? html : Tools.trim(html);
};

const parseHtml = function (htmlParser, html: string, args) {
  const parserArgs = args.selection ? Merger.merge({ forced_root_block: false }, args) : args;
  const rootNode = htmlParser.parse(html, parserArgs);
  DomSerializerFilters.trimTrailingBr(rootNode);
  return rootNode;
};

const serializeNode = function (settings, schema: Schema, node: Node) {
  const htmlSerializer = Serializer(settings, schema);
  return htmlSerializer.serialize(node);
};

const toHtml = function (editor: Editor, settings, schema: Schema, rootNode: Node, args) {
  const content = serializeNode(settings, schema, rootNode);
  return postProcess(editor, args, content);
};

export default function (settings, editor: Editor) {
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
}