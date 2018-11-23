/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Option } from '@ephox/katamari';
import { Attr, Element, SelectorFind, TextContent } from '@ephox/sugar';

const isNotEmpty = function (val) {
  return val.length > 0;
};

const defaultToEmpty = function (str) {
  return str === undefined || str === null ? '' : str;
};

const noLink = function (editor) {
  const text = editor.selection.getContent({ format: 'text' });
  return {
    url: '',
    text,
    title: '',
    target: '',
    link: Option.none()
  };
};

const fromLink = function (link) {
  const text = TextContent.get(link);
  const url = Attr.get(link, 'href');
  const title = Attr.get(link, 'title');
  const target = Attr.get(link, 'target');
  return {
    url: defaultToEmpty(url),
    text: text !== url ? defaultToEmpty(text) : '',
    title: defaultToEmpty(title),
    target: defaultToEmpty(target),
    link: Option.some(link)
  };
};

const getInfo = function (editor) {
  // TODO: Improve with more of tiny's link logic?
  return query(editor).fold(
    function () {
      return noLink(editor);
    },
    function (link) {
      return fromLink(link);
    }
  );
};

const wasSimple = function (link) {
  const prevHref = Attr.get(link, 'href');
  const prevText = TextContent.get(link);
  return prevHref === prevText;
};

const getTextToApply = function (link, url, info) {
  return info.text.filter(isNotEmpty).fold(function () {
    return wasSimple(link) ? Option.some(url) : Option.none();
  }, Option.some);
};

const unlinkIfRequired = function (editor, info) {
  const activeLink = info.link.bind(Fun.identity);
  activeLink.each(function (link) {
    editor.execCommand('unlink');
  });
};

const getAttrs = function (url, info) {
  const attrs: any = { };
  attrs.href = url;

  info.title.filter(isNotEmpty).each(function (title) {
    attrs.title = title;
  });
  info.target.filter(isNotEmpty).each(function (target) {
    attrs.target = target;
  });
  return attrs;
};

const applyInfo = function (editor, info) {
  info.url.filter(isNotEmpty).fold(function () {
    // Unlink if there is something to unlink
    unlinkIfRequired(editor, info);
  }, function (url) {
    // We must have a non-empty URL to insert a link
    const attrs = getAttrs(url, info);

    const activeLink = info.link.bind(Fun.identity);
    activeLink.fold(function () {
      const text = info.text.filter(isNotEmpty).getOr(url);
      editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
    }, function (link) {
      const text = getTextToApply(link, url, info);
      Attr.setAll(link, attrs);
      text.each(function (newText) {
        TextContent.set(link, newText);
      });
    });
  });
};

const query = function (editor) {
  const start = Element.fromDom(editor.selection.getStart());
  return SelectorFind.closest(start, 'a');
};

export default {
  getInfo,
  applyInfo,
  query
};