/**
 * DomSerializer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.DomSerializer',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'tinymce.core.api.Events',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.DomSerializerFilters',
    'tinymce.core.dom.DomSerializerPreProcess',
    'tinymce.core.html.DomParser',
    'tinymce.core.html.Schema',
    'tinymce.core.html.Serializer',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Tools'
  ],
  function (Fun, Merger, Events, DOMUtils, DomSerializerFilters, DomSerializerPreProcess, DomParser, Schema, Serializer, Zwsp, Tools) {
    var addTempAttr = function (htmlParser, tempAttrs, name) {
      if (Tools.inArray(tempAttrs, name) === -1) {
        htmlParser.addAttributeFilter(name, function (nodes, name) {
          var i = nodes.length;

          while (i--) {
            nodes[i].attr(name, null);
          }
        });

        tempAttrs.push(name);
      }
    };

    var postProcess = function (editor, args, content) {
      if (!args.no_events && editor) {
        var outArgs = Events.firePostProcess(editor, Merger.merge(args, { content: content }));
        return outArgs.content;
      } else {
        return content;
      }
    };

    var getHtmlFromNode = function (dom, node, args) {
      var html = Zwsp.trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node));
      return args.selection ? html : Tools.trim(html);
    };

    var parseHtml = function (htmlParser, dom, html, args) {
      var parserArgs = args.selection ? Merger.merge({ forced_root_block: false }, args) : args;
      var rootNode = htmlParser.parse(html, parserArgs);
      DomSerializerFilters.trimTrailingBr(rootNode);
      return rootNode;
    };

    var serializeNode = function (settings, schema, node) {
      var htmlSerializer = new Serializer(settings, schema);
      return htmlSerializer.serialize(node);
    };

    var toHtml = function (editor, settings, schema, rootNode, args) {
      var content = serializeNode(settings, schema, rootNode);
      return postProcess(editor, args, content);
    };

    return function (settings, editor) {
      var dom, schema, htmlParser, tempAttrs = ['data-mce-selected'];

      dom = editor && editor.dom ? editor.dom : DOMUtils.DOM;
      schema = editor && editor.schema ? editor.schema : new Schema(settings);
      settings.entity_encoding = settings.entity_encoding || 'named';
      settings.remove_trailing_brs = "remove_trailing_brs" in settings ? settings.remove_trailing_brs : true;

      htmlParser = new DomParser(settings, schema);
      DomSerializerFilters.register(htmlParser, settings, dom);

      var serialize = function (node, parserArgs) {
        var args = Merger.merge({ format: 'html' }, parserArgs ? parserArgs : {});
        var targetNode = DomSerializerPreProcess.process(editor, node, args);
        var html = getHtmlFromNode(dom, targetNode, args);
        var rootNode = parseHtml(htmlParser, dom, html, args);
        return args.format === 'tree' ? rootNode : toHtml(editor, settings, schema, rootNode, args);
      };

      return {
        schema: schema,
        addNodeFilter: htmlParser.addNodeFilter,
        addAttributeFilter: htmlParser.addAttributeFilter,
        serialize: serialize,
        addRules: function (rules) {
          schema.addValidElements(rules);
        },
        setRules: function (rules) {
          schema.setValidElements(rules);
        },
        addTempAttr: Fun.curry(addTempAttr, htmlParser, tempAttrs),
        getTempAttrs: function () {
          return tempAttrs;
        }
      };
    };
  }
);
