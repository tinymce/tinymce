/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import DomParser from 'tinymce/core/api/html/DomParser';
import Node from 'tinymce/core/api/html/Node';
import Serializer from 'tinymce/core/api/html/Serializer';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';

const parseHeader = function (head: string) {
  // Parse the contents with a DOM parser
  return DomParser({
    validate: false,
    root_name: '#document'
  // Parse as XHTML to allow for inclusion of the XML processing instruction
  }).parse(head, { format: 'xhtml' });
};

const htmlToData = function (editor: Editor, head: string) {
  const headerFragment = parseHeader(head);
  const data: any = {};
  let elm, matches;

  function getAttr(elm, name) {
    const value = elm.attr(name);

    return value || '';
  }

  // Default some values
  // TODO: Not sure these are used anymore
  data.fontface = Settings.getDefaultFontFamily(editor);
  data.fontsize = Settings.getDefaultFontSize(editor);

  // Parse XML PI
  elm = headerFragment.firstChild;
  if (elm.type === 7) {
    data.xml_pi = true;
    matches = /encoding="([^"]+)"/.exec(elm.value);
    if (matches) {
      data.docencoding = matches[1];
    }
  }

  // Parse doctype
  elm = headerFragment.getAll('#doctype')[0];
  if (elm) {
    data.doctype = '<!DOCTYPE' + elm.value + '>';
  }

  // Parse title element
  elm = headerFragment.getAll('title')[0];
  if (elm && elm.firstChild) {
    data.title = elm.firstChild.value;
  }

  // Parse meta elements
  Tools.each<Node>(headerFragment.getAll('meta'), function (meta) {
    const name = meta.attr('name');
    const httpEquiv = meta.attr('http-equiv');
    let matches;

    if (name) {
      data[name.toLowerCase()] = meta.attr('content');
    } else if (httpEquiv === 'Content-Type') {
      matches = /charset\s*=\s*(.*)\s*/gi.exec(meta.attr('content'));

      if (matches) {
        data.docencoding = matches[1];
      }
    }
  });

  // Parse html attribs
  elm = headerFragment.getAll('html')[0];
  if (elm) {
    data.langcode = getAttr(elm, 'lang') || getAttr(elm, 'xml:lang');
  }

  // Parse stylesheets
  data.stylesheets = [];
  Tools.each(headerFragment.getAll('link'), function (link) {
    if (link.attr('rel') === 'stylesheet') {
      data.stylesheets.push(link.attr('href'));
    }
  });

  // Parse body parts
  elm = headerFragment.getAll('body')[0];
  if (elm) {
    data.langdir = getAttr(elm, 'dir');
    data.style = getAttr(elm, 'style');
    data.visited_color = getAttr(elm, 'vlink');
    data.link_color = getAttr(elm, 'link');
    data.active_color = getAttr(elm, 'alink');
  }

  return data;
};

const dataToHtml = function (editor: Editor, data, head) {
  let headElement, elm, value;
  const dom = editor.dom;

  function setAttr(elm, name, value) {
    elm.attr(name, value ? value : undefined);
  }

  function addHeadNode(node) {
    if (headElement.firstChild) {
      headElement.insert(node, headElement.firstChild);
    } else {
      headElement.append(node);
    }
  }

  const headerFragment = parseHeader(head);
  headElement = headerFragment.getAll('head')[0];
  if (!headElement) {
    elm = headerFragment.getAll('html')[0];
    headElement = new Node('head', 1);

    if (elm.firstChild) {
      elm.insert(headElement, elm.firstChild, true);
    } else {
      elm.append(headElement);
    }
  }

  // Add/update/remove XML-PI
  elm = headerFragment.firstChild;
  if (data.xml_pi) {
    value = 'version="1.0"';

    if (data.docencoding) {
      value += ' encoding="' + data.docencoding + '"';
    }

    if (elm.type !== 7) {
      elm = new Node('xml', 7);
      headerFragment.insert(elm, headerFragment.firstChild, true);
    }

    elm.value = value;
  } else if (elm && elm.type === 7) {
    elm.remove();
  }

  // Add/update/remove doctype
  elm = headerFragment.getAll('#doctype')[0];
  if (data.doctype) {
    if (!elm) {
      elm = new Node('#doctype', 10);

      if (data.xml_pi) {
        headerFragment.insert(elm, headerFragment.firstChild);
      } else {
        addHeadNode(elm);
      }
    }

    elm.value = data.doctype.substring(9, data.doctype.length - 1);
  } else if (elm) {
    elm.remove();
  }

  // Add meta encoding
  elm = null;
  Tools.each(headerFragment.getAll('meta'), function (meta) {
    if (meta.attr('http-equiv') === 'Content-Type') {
      elm = meta;
    }
  });

  if (data.docencoding) {
    if (!elm) {
      elm = new Node('meta', 1);
      elm.attr('http-equiv', 'Content-Type');
      elm.shortEnded = true;
      addHeadNode(elm);
    }

    elm.attr('content', 'text/html; charset=' + data.docencoding);
  } else if (elm) {
    elm.remove();
  }

  // Add/update/remove title
  elm = headerFragment.getAll('title')[0];
  if (data.title) {
    if (!elm) {
      elm = new Node('title', 1);
      addHeadNode(elm);
    } else {
      elm.empty();
    }

    elm.append(new Node('#text', 3)).value = data.title;
  } else if (elm) {
    elm.remove();
  }

  // Add/update/remove meta
  Tools.each('keywords,description,author,copyright,robots'.split(','), function (name) {
    const nodes = headerFragment.getAll('meta');
    let i, meta;
    const value = data[name];

    for (i = 0; i < nodes.length; i++) {
      meta = nodes[i];

      if (meta.attr('name') === name) {
        if (value) {
          meta.attr('content', value);
        } else {
          meta.remove();
        }

        return;
      }
    }

    if (value) {
      elm = new Node('meta', 1);
      elm.attr('name', name);
      elm.attr('content', value);
      elm.shortEnded = true;

      addHeadNode(elm);
    }
  });

  const currentStyleSheetsMap: Record<string, Node> = {};
  Tools.each(headerFragment.getAll('link'), function (stylesheet) {
    if (stylesheet.attr('rel') === 'stylesheet') {
      currentStyleSheetsMap[stylesheet.attr('href')] = stylesheet;
    }
  });

  // Add new
  Tools.each(data.stylesheets, function (stylesheet) {
    if (!currentStyleSheetsMap[stylesheet]) {
      elm = new Node('link', 1);
      elm.attr({
        rel: 'stylesheet',
        text: 'text/css',
        href: stylesheet
      });
      elm.shortEnded = true;
      addHeadNode(elm);
    }

    delete currentStyleSheetsMap[stylesheet];
  });

  // Delete old
  Tools.each(currentStyleSheetsMap, function (stylesheet) {
    stylesheet.remove();
  });

  // Update body attributes
  elm = headerFragment.getAll('body')[0];
  if (elm) {
    setAttr(elm, 'dir', data.langdir);
    setAttr(elm, 'style', data.style);
    setAttr(elm, 'vlink', data.visited_color);
    setAttr(elm, 'link', data.link_color);
    setAttr(elm, 'alink', data.active_color);

    // Update iframe body as well
    dom.setAttribs(editor.getBody(), {
      style: data.style,
      dir: data.dir,
      vLink: data.visited_color,
      link: data.link_color,
      aLink: data.active_color
    });
  }

  // Set html attributes
  elm = headerFragment.getAll('html')[0];
  if (elm) {
    setAttr(elm, 'lang', data.langcode);
    setAttr(elm, 'xml:lang', data.langcode);
  }

  // No need for a head element
  if (!headElement.firstChild) {
    headElement.remove();
  }

  // Serialize header fragment and crop away body part
  const html = Serializer({
    validate: false,
    indent: true,
    indent_before: 'head,html,body,meta,title,script,link,style',
    indent_after: 'head,html,body,meta,title,script,link,style'
  }).serialize(headerFragment);

  return html.substring(0, html.indexOf('</body>'));
};

export {
  parseHeader,
  htmlToData,
  dataToHtml
};
