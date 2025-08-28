import { Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Events from '../api/Events';
import { ParserArgs } from '../api/html/DomParser';
import Tools from '../api/util/Tools';

const preProcess = (editor: Editor, node: Element, args: ParserArgs): Node => {
  let oldDoc: Document | undefined;
  const dom = editor.dom;

  let clonedNode = node.cloneNode(true) as Element;

  // Nodes needs to be attached to something in WebKit/Opera
  // This fix will make DOM ranges and make Sizzle happy!
  const impl = document.implementation;
  if (impl.createHTMLDocument) {
    // Create an empty HTML document
    const doc = impl.createHTMLDocument('');

    // Add the element or it's children if it's a body element to the new document
    Tools.each(clonedNode.nodeName === 'BODY' ? clonedNode.childNodes : [ clonedNode ], (node) => {
      doc.body.appendChild(doc.importNode(node, true));
    });

    // Grab first child or body element for serialization
    if (clonedNode.nodeName !== 'BODY') {
      // We cast to a Element here, as this will be the cloned node imported and appended above
      clonedNode = doc.body.firstChild as Element;
    } else {
      clonedNode = doc.body;
    }

    // set the new document in DOMUtils so createElement etc works
    oldDoc = dom.doc;
    dom.doc = doc;
  }

  Events.firePreProcess(editor, { ...args, node: clonedNode });

  if (oldDoc) {
    dom.doc = oldDoc;
  }

  return clonedNode;
};

const shouldFireEvent = (editor: Editor | undefined, args: ParserArgs): editor is Editor => {
  return Type.isNonNullable(editor) && editor.hasEventListeners('PreProcess') && !args.no_events;
};

const process = (editor: Editor | undefined, node: Element, args: ParserArgs): Node => {
  return shouldFireEvent(editor, args) ? preProcess(editor, node, args) : node;
};

export {
  process
};
