/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../api/Settings';
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

const extractFromAnchor = (editor: Editor, anchor: HTMLAnchorElement) => {
  const dom = editor.dom;
  const onlyText = Utils.isOnlyTextSelected(editor);
  const text: Optional<string> = onlyText ? Optional.some(Utils.getAnchorText(editor.selection, anchor)) : Optional.none();
  const url: Optional<string> = anchor ? Optional.some(dom.getAttrib(anchor, 'href')) : Optional.none();
  const target: Optional<string> = anchor ? Optional.from(dom.getAttrib(anchor, 'target')) : Optional.none();
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

const collect = (editor: Editor, linkNode: HTMLAnchorElement): Promise<LinkDialogInfo> => LinkListOptions.getLinks(editor).then((links) => {
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
    optNode: Optional.from(linkNode),
    flags: {
      titleEnabled: Settings.shouldShowLinkTitle(editor)
    }
  };
});

export const DialogInfo = {
  collect
};
