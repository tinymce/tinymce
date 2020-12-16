/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import * as Events from '../api/Events';
import Tools from '../api/util/Tools';

const preProcess = (editor: Editor, node: Element, args) => {
  let doc, oldDoc;
  const dom = editor.dom;

  node = node.cloneNode(true) as Element;

  // Nodes needs to be attached to something in WebKit/Opera
  // This fix will make DOM ranges and make Sizzle happy!
  const impl = document.implementation;
  if (impl.createHTMLDocument) {
    // Create an empty HTML document
    doc = impl.createHTMLDocument('');

    // Add the element or it's children if it's a body element to the new document
    Tools.each(node.nodeName === 'BODY' ? node.childNodes : [ node ], (node) => {
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

  Events.firePreProcess(editor, { ...args, node });

  if (oldDoc) {
    dom.doc = oldDoc;
  }

  return node;
};

const shouldFireEvent = (editor: Editor, args) => {
  return editor && editor.hasEventListeners('PreProcess') && !args.no_events;
};

const process = (editor: Editor, node: Element, args) => {
  return shouldFireEvent(editor, args) ? preProcess(editor, node, args) : node;
};

export {
  process
};
