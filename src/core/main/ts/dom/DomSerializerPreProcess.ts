/**
 * DomSerializerPreProcess.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Merger } from '@ephox/katamari';
import Events from '../api/Events';
import Tools from '../api/util/Tools';
import { Editor } from 'tinymce/core/api/Editor';

const preProcess = function (editor: Editor, node, args) {
  let impl, doc, oldDoc;
  const dom = editor.dom;

  node = node.cloneNode(true);

  // Nodes needs to be attached to something in WebKit/Opera
  // This fix will make DOM ranges and make Sizzle happy!
  impl = document.implementation;
  if (impl.createHTMLDocument) {
    // Create an empty HTML document
    doc = impl.createHTMLDocument('');

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

  Events.firePreProcess(editor, Merger.merge(args, { node }));

  if (oldDoc) {
    dom.doc = oldDoc;
  }

  return node;
};

const shouldFireEvent = function (editor, args) {
  return editor && editor.hasEventListeners('PreProcess') && !args.no_events;
};

const process = function (editor, node, args) {
  return shouldFireEvent(editor, args) ? preProcess(editor, node, args) : node;
};

export default {
  process
};