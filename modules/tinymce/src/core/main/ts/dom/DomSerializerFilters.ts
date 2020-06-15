/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option } from '@ephox/katamari';
import DOMUtils from '../api/dom/DOMUtils';
import DomParser from '../api/html/DomParser';
import Entities from '../api/html/Entities';
import * as Zwsp from '../text/Zwsp';
import { DomSerializerSettings } from './DomSerializer';

declare const unescape: any;

const register = (htmlParser: DomParser, settings: DomSerializerSettings, dom: DOMUtils) => {
  // Convert tabindex back to elements when serializing contents
  htmlParser.addAttributeFilter('data-mce-tabindex', function (nodes, name) {
    let i = nodes.length, node;

    while (i--) {
      node = nodes[i];
      node.attr('tabindex', node.attr('data-mce-tabindex'));
      node.attr(name, null);
    }
  });

  // Convert move data-mce-src, data-mce-href and data-mce-style into nodes or process them if needed
  htmlParser.addAttributeFilter('src,href,style', function (nodes, name) {
    let i = nodes.length, node, value;
    const internalName = 'data-mce-' + name;
    const urlConverter = settings.url_converter;
    const urlConverterScope = settings.url_converter_scope;

    while (i--) {
      node = nodes[i];

      value = node.attr(internalName);
      if (value !== undefined) {
        // Set external name to internal value and remove internal
        node.attr(name, value.length > 0 ? value : null);
        node.attr(internalName, null);
      } else {
        // No internal attribute found then convert the value we have in the DOM
        value = node.attr(name);

        if (name === 'style') {
          value = dom.serializeStyle(dom.parseStyle(value), node.name);
        } else if (urlConverter) {
          value = urlConverter.call(urlConverterScope, value, name, node.name);
        }

        node.attr(name, value.length > 0 ? value : null);
      }
    }
  });

  // Remove internal classes mceItem<..> or mceSelected
  htmlParser.addAttributeFilter('class', function (nodes) {
    let i = nodes.length, node, value;

    while (i--) {
      node = nodes[i];
      value = node.attr('class');

      if (value) {
        value = node.attr('class').replace(/(?:^|\s)mce-item-\w+(?!\S)/g, '');
        node.attr('class', value.length > 0 ? value : null);
      }
    }
  });

  // Remove bookmark elements
  htmlParser.addAttributeFilter('data-mce-type', function (nodes, name, args) {
    let i = nodes.length, node;

    while (i--) {
      node = nodes[i];

      if (node.attr('data-mce-type') === 'bookmark' && !args.cleanup) {
        // We maybe dealing with a "filled" bookmark. If so just remove the node, otherwise unwrap it
        const hasChildren = Option.from(node.firstChild).exists((firstChild) => !Zwsp.isZwsp(firstChild.value));
        if (hasChildren) {
          node.unwrap();
        } else {
          node.remove();
        }
      }
    }
  });

  htmlParser.addNodeFilter('noscript', function (nodes) {
    let i = nodes.length, node;

    while (i--) {
      node = nodes[i].firstChild;

      if (node) {
        node.value = Entities.decode(node.value);
      }
    }
  });

  // Force script into CDATA sections and remove the mce- prefix also add comments around styles
  htmlParser.addNodeFilter('script,style', function (nodes, name) {
    let i = nodes.length, node, value, type;

    const trim = function (value) {
      /* jshint maxlen:255 */
      /* eslint max-len:0 */
      return value.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n')
        .replace(/^[\r\n]*|[\r\n]*$/g, '')
        .replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi, '')
        .replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, '');
    };

    while (i--) {
      node = nodes[i];
      value = node.firstChild ? node.firstChild.value : '';

      if (name === 'script') {
        // Remove mce- prefix from script elements and remove default type since the user specified
        // a script element without type attribute
        type = node.attr('type');
        if (type) {
          node.attr('type', type === 'mce-no/type' ? null : type.replace(/^mce\-/, ''));
        }

        if (settings.element_format === 'xhtml' && value.length > 0) {
          node.firstChild.value = '// <![CDATA[\n' + trim(value) + '\n// ]]>';
        }
      } else {
        if (settings.element_format === 'xhtml' && value.length > 0) {
          node.firstChild.value = '<!--\n' + trim(value) + '\n-->';
        }
      }
    }
  });

  // Convert comments to cdata and handle protected comments
  htmlParser.addNodeFilter('#comment', function (nodes) {
    let i = nodes.length, node;

    while (i--) {
      node = nodes[i];

      if (settings.preserve_cdata && node.value.indexOf('[CDATA[') === 0) {
        node.name = '#cdata';
        node.type = 4;
        node.value = dom.decode(node.value.replace(/^\[CDATA\[|\]\]$/g, ''));
      } else if (node.value.indexOf('mce:protected ') === 0) {
        node.name = '#text';
        node.type = 3;
        node.raw = true;
        node.value = unescape(node.value).substr(14);
      }
    }
  });

  htmlParser.addNodeFilter('xml:namespace,input', function (nodes, name) {
    let i = nodes.length, node;

    while (i--) {
      node = nodes[i];
      if (node.type === 7) {
        node.remove();
      } else if (node.type === 1) {
        if (name === 'input' && !node.attr('type')) {
          node.attr('type', 'text');
        }
      }
    }
  });

  htmlParser.addAttributeFilter('data-mce-type', function (nodes) {
    Arr.each(nodes, function (node) {
      if (node.attr('data-mce-type') === 'format-caret') {
        if (node.isEmpty(htmlParser.schema.getNonEmptyElements())) {
          node.remove();
        } else {
          node.unwrap();
        }
      }
    });
  });

  // Remove internal data attributes
  htmlParser.addAttributeFilter(
    'data-mce-src,data-mce-href,data-mce-style,' +
    'data-mce-selected,data-mce-expando,' +
    'data-mce-type,data-mce-resize,data-mce-placeholder',

    function (nodes, name) {
      let i = nodes.length;

      while (i--) {
        nodes[i].attr(name, null);
      }
    }
  );
};

/**
 * IE 11 has a fantastic bug where it will produce two trailing BR elements to iframe bodies when
 * the iframe is hidden by display: none on a parent container. The DOM is actually out of sync
 * with innerHTML in this case. It's like IE adds shadow DOM BR elements that appears on innerHTML
 * but not as the lastChild of the body. So this fix simply removes the last two
 * BR elements at the end of the document.
 *
 * Example of what happens: <body>text</body> becomes <body>text<br><br></body>
 */
const trimTrailingBr = function (rootNode) {
  const isBr = function (node) {
    return node && node.name === 'br';
  };

  const brNode1 = rootNode.lastChild;
  if (isBr(brNode1)) {
    const brNode2 = brNode1.prev;

    if (isBr(brNode2)) {
      brNode1.remove();
      brNode2.remove();
    }
  }
};

export {
  register,
  trimTrailingBr
};
