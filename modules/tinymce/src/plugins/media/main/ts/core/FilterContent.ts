import { Arr, Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';

import * as Nodes from './Nodes';
import * as Sanitize from './Sanitize';

declare let unescape: any;

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
    serializer.addAttributeFilter('data-mce-object', (nodes, name) => {
      let i = nodes.length;
      while (i--) {
        const node = nodes[i];
        if (!node.parent) {
          continue;
        }

        const realElmName = node.attr(name) as string;
        const realElm = new AstNode(realElmName, 1);

        // Add width/height to everything but audio
        if (realElmName !== 'audio') {
          const className = node.attr('class');
          if (className && className.indexOf('mce-preview-object') !== -1 && node.firstChild) {
            realElm.attr({
              width: node.firstChild.attr('width'),
              height: node.firstChild.attr('height')
            });
          } else {
            realElm.attr({
              width: node.attr('width'),
              height: node.attr('height')
            });
          }
        }

        realElm.attr({
          style: node.attr('style')
        });

        // Unprefix all placeholder attributes
        const attribs = node.attributes ?? [];
        let ai = attribs.length;
        while (ai--) {
          const attrName = attribs[ai].name;

          if (attrName.indexOf('data-mce-p-') === 0) {
            realElm.attr(attrName.substr(11), attribs[ai].value);
          }
        }

        // Inject innerhtml
        const innerHtml = node.attr('data-mce-html');
        if (innerHtml) {
          const fragment = Sanitize.parseAndSanitize(editor, realElmName, unescape(innerHtml));
          Arr.each(fragment.children(), (child) => realElm.append(child));
        }

        node.replace(realElm);
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
