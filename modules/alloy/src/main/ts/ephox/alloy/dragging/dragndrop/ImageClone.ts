import { DataTransfer, setTimeout } from '@ephox/dom-globals';
import { Arr, Cell, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Css, DomEvent, Element, Insert, Remove, Replication } from '@ephox/sugar';

import * as DataTransfers from './DataTransfers';

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

// IE and Edge doesn't support setDragImage so this fallback will hide the target from being used as a ghost
const blockDefaultGhost = (target: Element) => {
  const targetClone = Replication.deep(target);
  const oldStyles = Arr.map(['position', 'visibility'], (name) => {
    return { name, value: Css.getRaw(target, name) };
  });

  Insert.before(target, targetClone);
  Css.setAll(target, {
    position: 'fixed',
    visibility: 'hidden'
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
  const ghostState = Cell(Option.none<Element<any>>());

  const drag = DomEvent.bind(target, 'drag', (evt) => {
    // The calculated position needs to at least be cord + 1 since it would otherwise interfere with dropping
    const x = evt.x() + Math.max(image.x() + 1, 1);
    const y = evt.y() + Math.max(image.y() + 1, 1);

    const ghost = ghostState.get().getOrThunk(() => {
      const newGhost = createGhostClone(image);

      ghostState.set(Option.some(newGhost));

      Css.setAll(newGhost, {
        position: 'fixed',
        margin: '0',
        opacity: '0.6'
      });

      Attr.set(newGhost, 'role', 'presentation');

      Insert.append(parent, newGhost);

      return newGhost;
    });

    Css.setAll(ghost, {
      left: `${x}px`,
      top: `${y}px`
    });
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

export { setImageClone };
