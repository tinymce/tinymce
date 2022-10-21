// So boundosaurus is going to do bounding things.

import { Boxes } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Num, Optional, Singleton } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstageShared } from '../backstage/Backstage';
import * as ContextToolbarAnchor from '../ui/context/ContextToolbarAnchor';
import * as ContextToolbarBounds from '../ui/context/ContextToolbarBounds';

const getNotificationBounds = (editor: Editor): Optional<Boxes.Bounds> => {
  /* Attempt to ensure that the notifications render below the top of the header and between
    * whichever is the larger between the bottom of the content area and the bottom of the viewport
    *
    * Note: This isn't perfect, but we have a plan to fix it now that TinyMCE 6 removed public methods restricting
    * our ability to change anything (TINY-6679).
    *
    * TODO TINY-8128: use docking and associate the notifications together so they update position automatically
    * during UI refresh updates.
    */
  const contentArea = Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()));
  const win = Boxes.win();
  const x = Num.clamp(win.x, contentArea.x, contentArea.right);
  const y = Num.clamp(win.y, contentArea.y, contentArea.bottom);
  const right = Math.max(contentArea.right, win.right);
  const bottom = Math.max(contentArea.bottom, win.bottom);
  return Optional.some(Boxes.bounds(x, y, right - x, bottom - y));
};

const getInlineDialogBounds = (_editor: Editor): Optional<Boxes.Bounds> => {
  // At the moment the inline dialog is just put anywhere in the body, and docking is what is used to make
  // sure that it stays onscreen
  const bounds = Boxes.box(SugarBody.body());
  return Optional.some(bounds);
};

const getContextToolbarBounds = (
  editor: Editor,
  sharedBackstage: UiFactoryBackstageShared,
  lastContextPosition: Singleton.Value<InlineContent.ContextPosition>
): Boxes.Bounds => {
  const position = lastContextPosition.get().getOr('node');
  // Use a 1px margin for the bounds to keep the context toolbar from butting directly against
  // the header, etc... when switching to inset layouts
  const margin = ContextToolbarAnchor.shouldUseInsetLayouts(position) ? 1 : 0;
  return ContextToolbarBounds.getContextToolbarBounds(editor, sharedBackstage, position, margin);
};

// ContextMenu doesn't use any particular bounds, so that will just be the "viewport"

// Autocompleter doesn't use any particular bounds, so that will just be the "viewport"

// Sticky Toolbar just uses docking which won't even use positioning. It will just be
// where it is.

// Inline Editor is just having its CSS values tweaked directly. No Positioning or InlineView.
export {
  getNotificationBounds,
  getInlineDialogBounds,
  getContextToolbarBounds
};
