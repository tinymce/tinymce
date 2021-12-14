import { Optional } from '@ephox/katamari';
import { DomEvent, EventArgs, Insert, Remove, SugarElement, SugarPosition } from '@ephox/sugar';

import { Blocker, BlockerOptions } from '../detect/Blocker';
import { DragApi, DragMode, DragMutation, DragSink } from './DragApis';

const compare = (old: SugarPosition, nu: SugarPosition) => {
  return SugarPosition(nu.left - old.left, nu.top - old.top);
};

const extract = (event: EventArgs<MouseEvent>) => {
  return Optional.some(SugarPosition(event.x, event.y));
};

const mutate = (mutation: DragMutation, info: SugarPosition) => {
  mutation.mutate(info.left, info.top);
};

const sink = (dragApi: DragApi<MouseEvent>, settings: Partial<BlockerOptions>) => {
  const blocker = Blocker(settings);

  // Included for safety. If the blocker has stayed on the screen, get rid of it on a click.
  const mdown = DomEvent.bind(blocker.element(), 'mousedown', dragApi.forceDrop);

  const mup = DomEvent.bind(blocker.element(), 'mouseup', dragApi.drop);
  const mmove = DomEvent.bind(blocker.element(), 'mousemove', dragApi.move);
  const mout = DomEvent.bind(blocker.element(), 'mouseout', dragApi.delayDrop);

  const destroy = () => {
    blocker.destroy();
    mup.unbind();
    mmove.unbind();
    mout.unbind();
    mdown.unbind();
  };

  const start = (parent: SugarElement<Node>) => {
    Insert.append(parent, blocker.element());
  };

  const stop = () => {
    Remove.remove(blocker.element());
  };

  return DragSink({
    element: blocker.element,
    start,
    stop,
    destroy
  });
};

export default DragMode<MouseEvent>({
  compare,
  extract,
  sink,
  mutate
});
