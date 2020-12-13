/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { Attribute, SelectorFind, SugarElement, TextContent } from '@ephox/sugar';

const isNotEmpty = (val) => {
  return val.length > 0;
};

const defaultToEmpty = (str) => {
  return str === undefined || str === null ? '' : str;
};

const noLink = (editor) => {
  const text = editor.selection.getContent({ format: 'text' });
  return {
    url: '',
    text,
    title: '',
    target: '',
    link: Optional.none()
  };
};

const fromLink = (link) => {
  const text = TextContent.get(link);
  const url = Attribute.get(link, 'href');
  const title = Attribute.get(link, 'title');
  const target = Attribute.get(link, 'target');
  return {
    url: defaultToEmpty(url),
    text: text !== url ? defaultToEmpty(text) : '',
    title: defaultToEmpty(title),
    target: defaultToEmpty(target),
    link: Optional.some(link)
  };
};

const getInfo = (editor) => {
  // TODO: Improve with more of tiny's link logic?
  return query(editor).fold(
    () => {
      return noLink(editor);
    },
    (link) => {
      return fromLink(link);
    }
  );
};

const wasSimple = (link) => {
  const prevHref = Attribute.get(link, 'href');
  const prevText = TextContent.get(link);
  return prevHref === prevText;
};

const getTextToApply = (link, url, info) => {
  return info.text.toOptional().filter(isNotEmpty).fold(() => {
    return wasSimple(link) ? Optional.some(url) : Optional.none();
  }, Optional.some);
};

const unlinkIfRequired = (editor, info) => {
  const activeLink = info.link.bind(Fun.identity);
  activeLink.each((_link) => {
    editor.execCommand('unlink');
  });
};

const getAttrs = (url, info) => {
  const attrs: any = { };
  attrs.href = url;

  info.title.toOptional().filter(isNotEmpty).each((title) => {
    attrs.title = title;
  });
  info.target.toOptional().filter(isNotEmpty).each((target) => {
    attrs.target = target;
  });
  return attrs;
};

const applyInfo = (editor, info) => {
  info.url.toOptional().filter(isNotEmpty).fold(() => {
    // Unlink if there is something to unlink
    unlinkIfRequired(editor, info);
  }, (url) => {
    // We must have a non-empty URL to insert a link
    const attrs = getAttrs(url, info);

    const activeLink = info.link.bind(Fun.identity);
    activeLink.fold(() => {
      const text = info.text.toOptional().filter(isNotEmpty).getOr(url);
      editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
    }, (link) => {
      const text = getTextToApply(link, url, info);
      Attribute.setAll(link, attrs);
      text.each((newText) => {
        TextContent.set(link, newText);
      });
    });
  });
};

const query = (editor) => {
  const start = SugarElement.fromDom(editor.selection.getStart());
  return SelectorFind.closest(start, 'a');
};

export {
  getInfo,
  applyInfo,
  query
};
