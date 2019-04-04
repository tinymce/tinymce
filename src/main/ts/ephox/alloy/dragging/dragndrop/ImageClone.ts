import { Replication, Element, Css, Insert, Body, Remove } from '@ephox/sugar';
import { DataTransfer } from '@ephox/dom-globals';
import * as DataTransfers from './DataTransfers';

export interface DragnDropImageClone {
  element: () => Element;
  x: () => number;
  y: () => number;
}

// Inspired by the ideas here. On mousedown, spawn an image at pageX, pageY
// Fire dragDrop on that image
// remove the image in a setTimeout( 0 )
// http://jsfiddle.net/stevendwood/akScu/21/
const setImageClone = (transfer: DataTransfer, image: DragnDropImageClone) => {
  const ghost = Replication.deep(image.element());

  Css.setAll(ghost, {
    'position': 'absolute',
    'top': '-300px',
    // Firefox will scale down non ghost images to 175px so lets limit the size to 175px in general
    'max-width': '175px',
    'max-height': '175px',
    'overflow': 'hidden'
  });

  Insert.append(Body.body(), ghost);

  DataTransfers.setDragImage(transfer, ghost.dom(), image.x(), image.y());

  setTimeout(() => {
    Remove.remove(ghost);
  }, 0);
};

export {
  setImageClone
};