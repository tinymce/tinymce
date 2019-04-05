import { Replication, Element, Css, Insert, Body, Remove } from '@ephox/sugar';
import { DataTransfer } from '@ephox/dom-globals';
import * as DataTransfers from './DataTransfers';
import { Arr, Obj } from '@ephox/katamari';

export interface DragnDropImageClone {
  element: () => Element;
  x: () => number;
  y: () => number;
}

// Inspired by the ideas here. On mousedown, spawn an image at pageX, pageY
// Fire dragDrop on that image
// remove the image in a setTimeout( 0 )
// http://jsfiddle.net/stevendwood/akScu/21/
const setDragImageFromClone = (transfer: DataTransfer, image: DragnDropImageClone) => {
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

// IE and Edge doesn't support setDragImage so this code simply hides the clone in theory we could
// manage our own clone using dragover etc but not sure it's worth the effort on dying browsers.
const blockDefaultGhost = (target: Element) => {
  const targetClone = Replication.deep(target);
  const oldStyles = Arr.map(['position', 'visibility'], (name) => {
    return { name, value: Css.getRaw(target, name) };
  });

  Insert.before(target, targetClone);
  Css.setAll(target, {
    'position': 'fixed',
    'visibility': 'hidden'
  });

  setTimeout(() => {
    Arr.each(oldStyles, (prop) => {
      prop.value.fold(
        () => Css.remove(target, prop.name),
        (value) => Css.set(target, prop.name, value)
      );
    });

    Remove.remove(targetClone);
  }, 0);
};

const setImageClone = (transfer: DataTransfer, image: DragnDropImageClone, target: Element) => {
  if (DataTransfers.hasDragImageSupport(transfer)) {
    setDragImageFromClone(transfer, image);
  } else {
    blockDefaultGhost(target);
  }
};

export {
  setImageClone
};