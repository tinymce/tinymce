import { Arr, Optional, Obj, Type } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import URI from 'tinymce/core/api/util/URI';

import * as Options from '../api/Options';
import { AssumeExternalTargets } from '../api/Types';
import { AttachState, LinkDialogOutput } from '../ui/DialogTypes';
import * as Utils from './Utils';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type LinkAttrs = {
  href: string;
  title?: string | null;
  rel?: string | null;
  class?: string | null;
  target?: string | null;
};

const getLinkAttrs = (data: LinkDialogOutput): LinkAttrs => {
  const attrs: Array<keyof Omit<LinkAttrs, 'href'>> = [ 'title', 'rel', 'class', 'target' ];
  return Arr.foldl(attrs, (acc, key) => {
    data[key].each((value) => {
      // If dealing with an empty string, then treat that as being null so the attribute is removed
      acc[key] = value.length > 0 ? value : null;
    });
    return acc;
  }, {
    href: data.href
  } as LinkAttrs);
};

const handleExternalTargets = (href: string, assumeExternalTargets: AssumeExternalTargets): string => {
  if ((assumeExternalTargets === AssumeExternalTargets.ALWAYS_HTTP
        || assumeExternalTargets === AssumeExternalTargets.ALWAYS_HTTPS)
      && !Utils.hasProtocol(href)) {
    return assumeExternalTargets + '://' + href;
  }
  return href;
};

const applyLinkOverrides = (editor: Editor, linkAttrs: LinkAttrs): LinkAttrs => {
  const newLinkAttrs = { ...linkAttrs };
  if (Options.getRelList(editor).length === 0 && !Options.allowUnsafeLinkTarget(editor)) {
    const newRel = Utils.applyRelTargetRules(newLinkAttrs.rel, newLinkAttrs.target === '_blank');
    newLinkAttrs.rel = newRel ? newRel : null;
  }

  if (Optional.from(newLinkAttrs.target).isNone() && Options.getTargetList(editor) === false) {
    newLinkAttrs.target = Options.getDefaultLinkTarget(editor);
  }

  newLinkAttrs.href = handleExternalTargets(newLinkAttrs.href, Options.assumeExternalTargets(editor));

  return newLinkAttrs;
};

const updateLink = (editor: Editor, anchorElm: HTMLAnchorElement, text: Optional<string>, linkAttrs: LinkAttrs): void => {
  // If we have text, then update the anchor elements text content
  text.each((text) => {
    if (Obj.has(anchorElm, 'innerText')) {
      anchorElm.innerText = text;
    } else {
      anchorElm.textContent = text;
    }
  });

  editor.dom.setAttribs(anchorElm, linkAttrs);
  editor.selection.select(anchorElm);
};

const createLink = (editor: Editor, selectedElm: Element, text: Optional<string>, linkAttrs: LinkAttrs): void => {
  const dom = editor.dom;
  if (Utils.isImageFigure(selectedElm)) {
    linkImageFigure(dom, selectedElm, linkAttrs);
  } else {
    text.fold(
      () => {
        editor.execCommand('mceInsertLink', false, linkAttrs);
      },
      (text) => {
        editor.insertContent(dom.createHTML('a', linkAttrs, dom.encode(text)));
      }
    );
  }
};

const linkDomMutation = (editor: Editor, attachState: AttachState, data: LinkDialogOutput): void => {
  const selectedElm = editor.selection.getNode();
  const anchorElm = Utils.getAnchorElement(editor, selectedElm);
  const linkAttrs = applyLinkOverrides(editor, getLinkAttrs(data));

  editor.undoManager.transact(() => {
    if (data.href === attachState.href) {
      attachState.attach();
    }

    anchorElm.fold(
      () => {
        createLink(editor, selectedElm, data.text, linkAttrs);
      },
      (elm) => {
        editor.focus();
        updateLink(editor, elm, data.text, linkAttrs);
      });
  });
};

const unlinkSelection = (editor: Editor): void => {
  const dom = editor.dom, selection = editor.selection;
  const bookmark = selection.getBookmark();
  const rng = selection.getRng().cloneRange();

  // Extend the selection out to the entire anchor element
  const startAnchorElm = dom.getParent(rng.startContainer, 'a[href]', editor.getBody());
  const endAnchorElm = dom.getParent(rng.endContainer, 'a[href]', editor.getBody());
  if (startAnchorElm) {
    rng.setStartBefore(startAnchorElm);
  }
  if (endAnchorElm) {
    rng.setEndAfter(endAnchorElm);
  }
  selection.setRng(rng);

  // Remove the link
  editor.execCommand('unlink');
  selection.moveToBookmark(bookmark);
};

const unlinkDomMutation = (editor: Editor): void => {
  editor.undoManager.transact(() => {
    const node = editor.selection.getNode();
    if (Utils.isImageFigure(node)) {
      unlinkImageFigure(editor, node);
    } else {
      unlinkSelection(editor);
    }
    editor.focus();
  });
};

/*
 * RTC uses unwrapped options.
 *
 * To best simulate this, we unwrap to null and filter out empty values.
 */
const unwrapOptions = (data: LinkDialogOutput) => {
  const { class: cls, href, rel, target, text, title } = data;

  return Obj.filter({
    class: cls.getOrNull(),
    href,
    rel: rel.getOrNull(),
    target: target.getOrNull(),
    text: text.getOrNull(),
    title: title.getOrNull()
  }, (v, _k) => Type.isNull(v) === false);
};

const sanitizeData = (editor: Editor, data: LinkDialogOutput): LinkDialogOutput => {
  const getOption = editor.options.get;
  const uriOptions = {
    allow_html_data_urls: getOption('allow_html_data_urls'),
    allow_script_urls: getOption('allow_script_urls'),
    allow_svg_data_urls: getOption('allow_svg_data_urls')
  };
  // Sanitize the URL
  const href = data.href;
  return {
    ...data,
    href: URI.isDomSafe(href, 'a', uriOptions) ? href : ''
  };
};

const link = (editor: Editor, attachState: AttachState, data: LinkDialogOutput): void => {
  const sanitizedData = sanitizeData(editor, data);
  editor.hasPlugin('rtc', true) ? editor.execCommand('createlink', false, unwrapOptions(sanitizedData)) : linkDomMutation(editor, attachState, sanitizedData);
};

const unlink = (editor: Editor): void => {
  editor.hasPlugin('rtc', true) ? editor.execCommand('unlink') : unlinkDomMutation(editor);
};

const unlinkImageFigure = (editor: Editor, fig: Element): void => {
  const img = editor.dom.select('img', fig)[0];
  if (img) {
    const a = editor.dom.getParents(img, 'a[href]', fig)[0];
    if (a) {
      a.parentNode?.insertBefore(img, a);
      editor.dom.remove(a);
    }
  }
};

const linkImageFigure = (dom: DOMUtils, fig: Element, attrs: Record<string, string | null>) => {
  const img = dom.select('img', fig)[0];
  if (img) {
    const a = dom.create('a', attrs);
    img.parentNode?.insertBefore(a, img);
    a.appendChild(img);
  }
};

export {
  link,
  unlink
};
