/**
 * DomSerializerPreProcess.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.DomSerializerPreProcess',
  [
    'global!document',
    'tinymce.core.api.Events',
    'tinymce.core.util.Tools'
  ],
  function (document, Events, Tools) {
    var processNode = function (editor, node, args) {
      var impl, doc, oldDoc;
      var dom = editor.dom;

      node = node.cloneNode(true);

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

        if (editor) {
          Events.firePreProcess(editor, args);
        }

        args.node = null;
      }

      // Restore the old document if it was changed
      if (oldDoc) {
        dom.doc = oldDoc;
      }

      return node;
    };

    var process = function (editor, node, args) {
      return editor ? processNode(editor, node, args) : node;
    };

    return {
      process: process
    };
  }
);
