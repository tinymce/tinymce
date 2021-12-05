import { Css, Insert, Remove, Replication, SugarElement } from '@ephox/sugar';

import * as DataTransfers from './DataTransfers';

export interface DragnDropImageClone {
  readonly element: SugarElement<HTMLElement>;
  readonly x: number;
  readonly y: number;
}

const createGhostClone = (image: DragnDropImageClone): SugarElement<HTMLElement> => {
  const ghost = Replication.deep(image.element);

  // Firefox will scale down non ghost images to 175px so lets limit the size to 175px in general
  Css.setAll(ghost, {
    'position': 'absolute',
    'top': '-300px',
    'max-width': '175px',
    'max-height': '175px',
    'overflow': 'hidden'
  });

  return ghost;
};

// Inspired by the ideas here. On mousedown, spawn an image at pageX, pageY
// Fire dragDrop on that image
// remove the image in a setTimeout( 0 )
// http://jsfiddle.net/stevendwood/akScu/21/
const setDragImageFromClone = (transfer: DataTransfer, parent: SugarElement<Element>, image: DragnDropImageClone): void => {
  const ghost = createGhostClone(image);

  Insert.append(parent, ghost);
  DataTransfers.setDragImage(transfer, ghost.dom, image.x, image.y);

  setTimeout(() => {
    Remove.remove(ghost);
  }, 0);
};

const setImageClone = (transfer: DataTransfer, image: DragnDropImageClone, parent: SugarElement<Element>): void => {
  setDragImageFromClone(transfer, parent, image);
};

export { setImageClone };
