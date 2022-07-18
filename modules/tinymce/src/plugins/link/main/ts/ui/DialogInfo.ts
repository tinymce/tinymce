import { Optional } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import * as Utils from '../core/Utils';
import { LinkDialogInfo } from './DialogTypes';
import { AnchorListOptions } from './sections/AnchorListOptions';
import { ClassListOptions } from './sections/ClassListOptions';
import { LinkListOptions } from './sections/LinkListOptions';
import { RelOptions } from './sections/RelOptions';
import { TargetOptions } from './sections/TargetOptions';

const nonEmptyAttr = (dom: DOMUtils, elem: string | Element, name: string): Optional<string> => {
  const val: string | null = dom.getAttrib(elem, name);
  return val !== null && val.length > 0 ? Optional.some(val) : Optional.none();
};

const extractFromAnchor = (editor: Editor, anchor: Optional<HTMLAnchorElement>): LinkDialogInfo['anchor'] => {
  const dom = editor.dom;
  const onlyText = Utils.isOnlyTextSelected(editor);
  const text: Optional<string> = onlyText ? Optional.some(Utils.getAnchorText(editor.selection, anchor)) : Optional.none();
  const url: Optional<string> = anchor.bind((anchorElm) => Optional.from(dom.getAttrib(anchorElm, 'href')));
  const target: Optional<string> = anchor.bind((anchorElm) => Optional.from(dom.getAttrib(anchorElm, 'target')));
  const rel = anchor.bind((anchorElm) => nonEmptyAttr(dom, anchorElm, 'rel'));
  const linkClass = anchor.bind((anchorElm) => nonEmptyAttr(dom, anchorElm, 'class'));
  const title = anchor.bind((anchorElm) => nonEmptyAttr(dom, anchorElm, 'title'));

  return {
    url,
    text,
    title,
    target,
    rel,
    linkClass
  };
};

const collect = (editor: Editor, linkNode: Optional<HTMLAnchorElement>): Promise<LinkDialogInfo> =>
  LinkListOptions.getLinks(editor).then((links) => {
    const anchor = extractFromAnchor(editor, linkNode);
    return {
      anchor,
      catalogs: {
        targets: TargetOptions.getTargets(editor),
        // This should be initial target. Is anchor.target that?
        rels: RelOptions.getRels(editor, anchor.target),
        classes: ClassListOptions.getClasses(editor),
        anchor: AnchorListOptions.getAnchors(editor),
        link: links
      },
      optNode: linkNode,
      flags: {
        titleEnabled: Options.shouldShowLinkTitle(editor)
      }
    };
  });

export const DialogInfo = {
  collect
};
