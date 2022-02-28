import { SugarBody, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

export const getFullscreenRoot = (editor: Editor): SugarElement<Element> => {
  const elem = SugarElement.fromDom(editor.getElement());
  return SugarShadowDom.getShadowRoot(elem).map(SugarShadowDom.getShadowHost)
    .getOrThunk(() => SugarBody.getBody(Traverse.owner(elem)));
};

export const getFullscreenElement = (root: DocumentOrShadowRoot): Element | null => {
  if (root.fullscreenElement !== undefined) {
    return root.fullscreenElement;
  } else if ((root as any).msFullscreenElement !== undefined) {
    return (root as any).msFullscreenElement as Element | null;
  } else if ((root as any).webkitFullscreenElement !== undefined) {
    return (root as any).webkitFullscreenElement as Element | null;
  } else {
    return null;
  }
};

export const getFullscreenchangeEventName = (): string => {
  if (document.fullscreenElement !== undefined) {
    return 'fullscreenchange';
  } else if ((document as any).msFullscreenElement !== undefined) {
    return 'MSFullscreenChange'; // warning, seems to be case sensitive
  } else if ((document as any).webkitFullscreenElement !== undefined) {
    return 'webkitfullscreenchange';
  } else {
    return 'fullscreenchange';
  }
};

export const requestFullscreen = (sugarElem: SugarElement<Element>): void => {
  const elem = sugarElem.dom;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  } else if ((elem as any).webkitRequestFullScreen) {
    (elem as any).webkitRequestFullScreen();
  }
};

export const exitFullscreen = (sugarDoc: SugarElement<Document>): void => {
  const doc = sugarDoc.dom;
  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if ((doc as any).msExitFullscreen) {
    (doc as any).msExitFullscreen();
  } else if ((doc as any).webkitCancelFullScreen) {
    (doc as any).webkitCancelFullScreen();
  }
};

export const isFullscreenElement = (elem: SugarElement<Element>): boolean =>
  elem.dom === getFullscreenElement(Traverse.owner(elem).dom);
