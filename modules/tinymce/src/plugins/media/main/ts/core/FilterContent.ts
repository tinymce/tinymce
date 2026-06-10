import { Arr, Obj, Optional, Type } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import type AstNode from 'tinymce/core/api/html/Node';

import * as Nodes from './Nodes';
import * as Sanitize from './Sanitize';

declare let unescape: any;

const buildMediaElement = (editor: Editor, node: AstNode) => {
  const realElmName = node.attr('data-mce-object') as string;
  const element = document.createElement(realElmName);

  // Add width/height to everything but audio
  if (realElmName !== 'audio') {
    const className = node.attr('class');
    const firstChild = node.firstChild;

    if (className && className.indexOf('mce-preview-object') !== -1 && firstChild) {
      const width = firstChild.attr('width');
      const height = firstChild.attr('height');

      if (Type.isString(width)) {
        element.setAttribute('width', width);
      }

      if (Type.isString(height)) {
        element.setAttribute('height', height);
      }
    } else {
      const width = node.attr('width');
      const height = node.attr('height');

      if (Type.isString(width)) {
        element.setAttribute('width', width);
      }

      if (Type.isString(height)) {
        element.setAttribute('height', height);
      }
    }
  }

  const style = node.attr('style');
  if (Type.isString(style)) {
    element.setAttribute('style', style);
  }

  // Unprefix all placeholder attributes
  const attribs = node.attributes ?? [];
  let ai = attribs.length;
  while (ai--) {
    const attrName = attribs[ai].name;

    if (attrName.indexOf('data-mce-p-') === 0) {
      element.setAttribute(attrName.substr(11), attribs[ai].value);
    }
  }

  // Inject innerhtml
  const innerHtml = node.attr('data-mce-html');
  if (Type.isString(innerHtml)) {
    element.innerHTML = unescape(innerHtml);
  } else {
    element.innerHTML = '\u00a0';
  }

  const fragment = Sanitize.parseAndSanitize(editor, element.outerHTML);
  const newElement = fragment.getAll(realElmName)[0];

  if (Type.isNonNullable(newElement)) {
    if (!Type.isString(innerHtml)) {
      newElement.empty();
    }

    return Optional.some(newElement);
  } else {
    return Optional.none();
  }
};

const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    const { schema, serializer, parser } = editor;
    // Set browser specific allowFullscreen attribs as boolean
    const boolAttrs = schema.getBoolAttrs();
    Arr.each('webkitallowfullscreen mozallowfullscreen'.split(' '), (name) => {
      boolAttrs[name] = {};
    });

    // Add some non-standard attributes to the schema
    Obj.each({
      embed: [ 'wmode' ]
    }, (attrs, name) => {
      const rule = schema.getElementRule(name);
      if (rule) {
        Arr.each(attrs, (attr) => {
          rule.attributes[attr] = {};
          rule.attributesOrder.push(attr);
        });
      }
    });

    // Converts iframe, video etc into placeholder images
    parser.addNodeFilter('iframe,video,audio,object,embed', Nodes.placeHolderConverter(editor));

    // Replaces placeholder images with real elements for video, object, iframe etc
    serializer.addAttributeFilter('data-mce-object', (nodes) => {
      let i = nodes.length;
      while (i--) {
        const node = nodes[i];
        if (!node.parent) {
          continue;
        }

        buildMediaElement(editor, node).fold(
          () => node.remove(),
          (realElm) => node.replace(realElm)
        );
      }
    });
  });

  editor.on('SetContent', () => {
    // TODO: This shouldn't be needed there should be a way to mark bogus
    // elements so they are never removed except external save
    const dom = editor.dom;
    Arr.each(dom.select('span.mce-preview-object'), (elm) => {
      if (dom.select('span.mce-shim', elm).length === 0) {
        dom.add(elm, 'span', { class: 'mce-shim' });
      }
    });
  });
};

export {
  setup
};
