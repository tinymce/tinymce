/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLAnchorElement, Element } from '@ephox/dom-globals';
import { Future, Option } from '@ephox/katamari';

import Settings from '../api/Settings';
import Utils from '../core/Utils';
import { LinkDialogInfo } from './DialogTypes';
import { AnchorListOptions } from './sections/AnchorListOptions';
import { ClassListOptions } from './sections/ClassListOptions';
import { LinkListOptions } from './sections/LinkListOptions';
import { RelOptions } from './sections/RelOptions';
import { TargetOptions } from './sections/TargetOptions';
import Editor from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const nonEmptyAttr = (dom: DOMUtils, elem: string | Element, name: string): Option<string> => {
  const val: string | null = dom.getAttrib(elem, name);
  return val !== null && val.length > 0 ? Option.some(val) : Option.none();
};

const extractFromAnchor = (editor: Editor, anchor: HTMLAnchorElement) => {
  const dom = editor.dom;
  const onlyText = Utils.isOnlyTextSelected(editor.selection.getContent());
  const text: Option<string> = onlyText ? Option.some(Utils.getAnchorText(editor.selection, anchor)) : Option.none();
  const url: Option<string> = anchor ? Option.some(dom.getAttrib(anchor, 'href')) : Option.none();
  const target: Option<string> = anchor ? Option.from(dom.getAttrib(anchor, 'target')) : Option.none();
  const rel = nonEmptyAttr(dom, anchor, 'rel');
  const linkClass = nonEmptyAttr(dom, anchor, 'class');
  const title = nonEmptyAttr(dom, anchor, 'title');

  return {
    url,
    text,
    title,
    target,
    rel,
    linkClass
  };
};

const collect = (editor: Editor, linkNode: HTMLAnchorElement): Future<LinkDialogInfo> => {
  return LinkListOptions.getLinks(editor).map((links) => {
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
      optNode: Option.from(linkNode),
      flags: {
        titleEnabled: Settings.shouldShowLinkTitle(editor)
      }
    };
  });
};

export const DialogInfo = {
  collect
};