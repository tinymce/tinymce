import { Fun, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import type Editor from '../api/Editor';
import * as Events from '../api/Events';
import DomParser, { type DomParserSettings, type ParserArgs, type ParserFilter, type ParserFilterCallback } from '../api/html/DomParser';
import type AstNode from '../api/html/Node';
import Schema, { type SchemaSettings } from '../api/html/Schema';
import HtmlSerializer, { type HtmlSerializerSettings } from '../api/html/Serializer';
import type { WriterSettings } from '../api/html/Writer';
import type { URLConverter } from '../api/OptionTypes';
import Tools from '../api/util/Tools';
import * as Zwsp from '../text/Zwsp';

import * as DomSerializerFilters from './DomSerializerFilters';
import * as DomSerializerPreProcess from './DomSerializerPreProcess';
import { isWsPreserveElement } from './ElementType';

interface DomSerializerSettings extends DomParserSettings, WriterSettings, SchemaSettings, HtmlSerializerSettings {
  remove_trailing_brs?: boolean;
  url_converter?: URLConverter;
  url_converter_scope?: {};
}

interface DomSerializerImpl {
  schema: Schema;
  addNodeFilter: (name: string, callback: ParserFilterCallback) => void;
  addAttributeFilter: (name: string, callback: ParserFilterCallback) => void;
  getNodeFilters: () => ParserFilter[];
  getAttributeFilters: () => ParserFilter[];
  removeNodeFilter: (name: string, callback?: ParserFilterCallback) => void;
  removeAttributeFilter: (name: string, callback?: ParserFilterCallback) => void;
  serialize: {
    (node: Element, parserArgs: { format: 'tree' } & ParserArgs): AstNode;
    (node: Element, domSerializerArgs?: DomSerializerArgs): string;
  };
  addRules: (rules: string) => void;
  setRules: (rules: string) => void;
  addTempAttr: (name: string) => void;
  getTempAttrs: () => string[];
}

export interface DomSerializerArgs extends ParserArgs {
  indent?: HtmlSerializerSettings['indent'];
  entity_encoding?: HtmlSerializerSettings['entity_encoding'];
}

const addTempAttr = (htmlParser: DomParser, tempAttrs: string[], name: string): void => {
  if (Tools.inArray(tempAttrs, name) === -1) {
    htmlParser.addAttributeFilter(name, (nodes, name) => {
      let i = nodes.length;

      while (i--) {
        nodes[i].attr(name, null);
      }
    });

    tempAttrs.push(name);
  }
};

const postProcess = (editor: Editor | undefined, args: ParserArgs, content: string): string => {
  if (!args.no_events && editor) {
    const outArgs = Events.firePostProcess(editor, { ...args, content });
    return outArgs.content;
  } else {
    return content;
  }
};

const getHtmlFromNode = (dom: DOMUtils, node: Node, args: ParserArgs): string => {
  // TODO: Investigate if using `innerHTML` is correct as DomSerializerPreProcess definitely returns a Node
  const html = Zwsp.trim(args.getInner ? (node as Element).innerHTML : dom.getOuterHTML(node));
  return args.selection || isWsPreserveElement(SugarElement.fromDom(node)) ? html : Tools.trim(html);
};

const parseHtml = (htmlParser: DomParser, html: string, args: ParserArgs) => {
  const parserArgs = args.selection ? { forced_root_block: false, ...args } : args;
  const rootNode = htmlParser.parse(html, parserArgs);
  DomSerializerFilters.trimTrailingBr(rootNode);
  return rootNode;
};

const serializeNode = (settings: HtmlSerializerSettings, schema: Schema, node: AstNode): string => {
  const htmlSerializer = HtmlSerializer(settings, schema);
  return htmlSerializer.serialize(node);
};

const toHtml = (editor: Editor | undefined, settings: HtmlSerializerSettings, schema: Schema, rootNode: AstNode, args: ParserArgs): string => {
  const content = serializeNode(settings, schema, rootNode);
  return postProcess(editor, args, content);
};

const DomSerializerImpl = (settings: DomSerializerSettings, editor?: Editor): DomSerializerImpl => {
  const tempAttrs = [ 'data-mce-selected' ];

  const defaultedSettings: DomSerializerSettings = {
    entity_encoding: 'named',
    remove_trailing_brs: true,
    pad_empty_with_br: false,
    ...settings
  };

  const dom = editor && editor.dom ? editor.dom : DOMUtils.DOM;
  const schema = editor && editor.schema ? editor.schema : Schema(defaultedSettings);

  const htmlParser = DomParser(defaultedSettings, schema);
  DomSerializerFilters.register(htmlParser, defaultedSettings, dom);

  const serialize = (node: Element, domSerializerArgs: DomSerializerArgs = {}): string | AstNode => {
    const { indent, entity_encoding, ...rest } = domSerializerArgs;

    const parserArgs = { format: 'html', ...rest };
    const targetNode = DomSerializerPreProcess.process(editor, node, parserArgs);
    const html = getHtmlFromNode(dom, targetNode, parserArgs);
    const rootNode = parseHtml(htmlParser, html, parserArgs);

    if (parserArgs.format === 'tree') {
      return rootNode;
    }

    const serializerSettings = {
      ...defaultedSettings,
      ...(Type.isNonNullable(indent) ? { indent } : {}),
      ...(Type.isNonNullable(entity_encoding) ? { entity_encoding } : {}),
    };
    return toHtml(editor, serializerSettings, schema, rootNode, parserArgs);
  };

  return {
    schema,
    addNodeFilter: htmlParser.addNodeFilter,
    addAttributeFilter: htmlParser.addAttributeFilter,
    serialize: serialize as DomSerializerImpl['serialize'],
    addRules: schema.addValidElements,
    setRules: schema.setValidElements,
    addTempAttr: Fun.curry(addTempAttr, htmlParser, tempAttrs),
    getTempAttrs: Fun.constant(tempAttrs),
    getNodeFilters: htmlParser.getNodeFilters,
    getAttributeFilters: htmlParser.getAttributeFilters,
    removeNodeFilter: htmlParser.removeNodeFilter,
    removeAttributeFilter: htmlParser.removeAttributeFilter
  };
};

export type { DomSerializerSettings };
export { DomSerializerImpl };
