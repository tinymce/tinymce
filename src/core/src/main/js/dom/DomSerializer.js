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
    'global!document',
    'tinymce.core.Env',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.DomSerializerFilters',
    'tinymce.core.html.DomParser',
    'tinymce.core.html.SaxParser',
    'tinymce.core.html.Schema',
    'tinymce.core.html.Serializer',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Tools'
  ],
  function (document, Env, DOMUtils, DomSerializerFilters, DomParser, SaxParser, Schema, Serializer, Zwsp, Tools) {
    /**
     * IE 11 has a fantastic bug where it will produce two trailing BR elements to iframe bodies when
     * the iframe is hidden by display: none on a parent container. The DOM is actually out of sync
     * with innerHTML in this case. It's like IE adds shadow DOM BR elements that appears on innerHTML
     * but not as the lastChild of the body. So this fix simply removes the last two
     * BR elements at the end of the document.
     *
     * Example of what happens: <body>text</body> becomes <body>text<br><br></body>
     */
    var trimTrailingBr = function (rootNode) {
      var brNode1, brNode2;

      var isBr = function (node) {
        return node && node.name === 'br';
      };

      brNode1 = rootNode.lastChild;
      if (isBr(brNode1)) {
        brNode2 = brNode1.prev;

        if (isBr(brNode2)) {
          brNode1.remove();
          brNode2.remove();
        }
      }
    };

    var firePreProcess = function (editor, args) {
      if (editor) {
        editor.fire('PreProcess', args);
      }
    };

    var firePostProcess = function (editor, args) {
      if (editor) {
        editor.fire('PostProcess', args);
      }
    };

    return function (settings, editor) {
      var dom, schema, htmlParser, tempAttrs = ["data-mce-selected"];

      var trimHtml = function (html) {
        var trimContentRegExp = new RegExp([
          '<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\\/span>', // Trim bogus spans like caret containers
          '\\s?(' + tempAttrs.join('|') + ')="[^"]+"' // Trim temporaty data-mce prefixed attributes like data-mce-selected
        ].join('|'), 'gi');

        html = Zwsp.trim(html.replace(trimContentRegExp, ''));

        return html;
      };

      var trimContent = function (html) {
        var content = html;
        var bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
        var endTagIndex, index, matchLength, matches, shortEndedElements, schema = editor.schema;

        content = trimHtml(content);
        shortEndedElements = schema.getShortEndedElements();

        // Remove all bogus elements marked with "all"
        while ((matches = bogusAllRegExp.exec(content))) {
          index = bogusAllRegExp.lastIndex;
          matchLength = matches[0].length;

          if (shortEndedElements[matches[1]]) {
            endTagIndex = index;
          } else {
            endTagIndex = SaxParser.findEndTag(schema, content, index);
          }

          content = content.substring(0, index - matchLength) + content.substring(endTagIndex);
          bogusAllRegExp.lastIndex = index - matchLength;
        }

        return content;
      };

      var getTrimmedContent = function () {
        return trimContent(editor.getBody().innerHTML);
      };

      var addTempAttr = function (name) {
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

      dom = editor && editor.dom ? editor.dom : DOMUtils.DOM;
      schema = editor && editor.schema ? editor.schema : new Schema(settings);
      settings.entity_encoding = settings.entity_encoding || 'named';
      settings.remove_trailing_brs = "remove_trailing_brs" in settings ? settings.remove_trailing_brs : true;

      htmlParser = new DomParser(settings, schema);
      DomSerializerFilters.register(htmlParser, settings, dom);

      var serialize = function (node, args) {
        var impl, doc, oldDoc, htmlSerializer, content, rootNode;

        // Explorer won't clone contents of script and style and the
        // selected index of select elements are cleared on a clone operation.
        if (Env.ie && dom.select('script,style,select,map').length > 0) {
          content = node.innerHTML;
          node = node.cloneNode(false);
          dom.setHTML(node, content);
        } else {
          node = node.cloneNode(true);
        }

        // Nodes needs to be attached to something in WebKit/Opera
        // This fix will make DOM ranges and make Sizzle happy!
        impl = document.implementation;
        if (impl.createHTMLDocument) {
          // Create an empty HTML document
          doc = impl.createHTMLDocument("");

          // Add the element or it's children if it's a body element to the new document
          Tools.each(node.nodeName === 'BODY' ? node.childNodes : [node], function (node) {
            doc.body.appendChild(doc.importNode(node, true));
          });

          // Grab first child or body element for serialization
          if (node.nodeName !== 'BODY') {
            node = doc.body.firstChild;
          } else {
            node = doc.body;
          }

          // set the new document in DOMUtils so createElement etc works
          oldDoc = dom.doc;
          dom.doc = doc;
        }

        args = args || {};
        args.format = args.format || 'html';

        // Don't wrap content if we want selected html
        if (args.selection) {
          args.forced_root_block = '';
        }

        // Pre process
        if (!args.no_events) {
          args.node = node;
          firePreProcess(editor, args);
        }

        // Parse HTML
        content = Zwsp.trim(Tools.trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node)));
        rootNode = htmlParser.parse(content, args);
        trimTrailingBr(rootNode);

        // Serialize HTML
        htmlSerializer = new Serializer(settings, schema);
        args.content = htmlSerializer.serialize(rootNode);

        // Post process
        if (!args.no_events) {
          firePostProcess(editor, args);
        }

        // Restore the old document if it was changed
        if (oldDoc) {
          dom.doc = oldDoc;
        }

        args.node = null;

        return args.content;
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
        addTempAttr: addTempAttr,

        // Internal
        trimHtml: trimHtml,
        getTrimmedContent: getTrimmedContent,
        trimContent: trimContent
      };
    };
  }
);
