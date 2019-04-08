import { Replication, Element, Css, Insert, Body, Remove, DomEvent, Traverse } from '@ephox/sugar';
import { DataTransfer, alert } from '@ephox/dom-globals';
import * as DataTransfers from './DataTransfers';
import { Arr, Option, Cell } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

const platform = PlatformDetection.detect();

export interface DragnDropImageClone {
  element: () => Element;
  x: () => number;
  y: () => number;
}

const createGhostClone = (image: DragnDropImageClone) => {
  const ghost = Replication.deep(image.element());

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
const setDragImageFromClone = (transfer: DataTransfer, parent: Element, image: DragnDropImageClone) => {
  const ghost = createGhostClone(image);

  Insert.append(parent, ghost);
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

// Edge doesn't have setDragImage support and just hiding the target element will position the drop icon incorrectly so we need custom ghost
// TODO: Get rid of this once Edge switches to Chromium we feature detect setDragImage support so once they have it should use that instead
const setDragImageFromCloneEdgeFallback = (image: DragnDropImageClone, parent: Element, target: Element) => {
  const ghostState = Cell(Option.none());

  const drag = DomEvent.bind(target, 'drag', (evt) => {
    const x = evt.x() + image.x() + 1;
    const y = evt.y() + image.y() + 1;

    const ghost = ghostState.get().getOrThunk(() => {
      const newGhost = createGhostClone(image);

      ghostState.set(Option.some(newGhost));
      Css.set(newGhost, 'position', 'fixed');

      Insert.append(parent, newGhost);

      return newGhost;
    });

    Css.setAll(ghost, {
      left: `${x}px`,
      top: `${y}px`,
      margin: '0',
      opacity: '0.6'
    })
  });

  const dragEnd = DomEvent.bind(target, 'dragend', (_) => {
    ghostState.get().each(Remove.remove);
    drag.unbind();
    dragEnd.unbind();
  });

  blockDefaultGhost(target);
};

const setImageClone = (transfer: DataTransfer, image: DragnDropImageClone, parent: Element, target: Element) => {
  if (DataTransfers.hasDragImageSupport(transfer)) {
    setDragImageFromClone(transfer, parent, image);
  } else if (platform.browser.isEdge()) {
    setDragImageFromCloneEdgeFallback(image, parent, target);
  } else {
    // We can't provide a fallback on IE 11 since the drag event doesn't update the mouse position
    blockDefaultGhost(target);
  }
};

export {
  setImageClone
};