import { Option } from '@ephox/katamari';
import { DomEvent, Insert, Position, Remove, Element, EventArgs } from '@ephox/sugar';
import { Blocker, BlockerOptions } from '../detect/Blocker';
import { DragApi, DragSink, DragMode, DragMutation } from './DragApis';

const compare = function (old: Position, nu: Position) {
  return Position(nu.left() - old.left(), nu.top() - old.top());
};

const extract = function (event: EventArgs) {
  return Option.some(Position(event.x(), event.y()));
};

const mutate = function (mutation: DragMutation, info: Position) {
  mutation.mutate(info.left(), info.top());
};

const sink = function (dragApi: DragApi, settings: Partial<BlockerOptions>) {
  const blocker = Blocker(settings);

  // Included for safety. If the blocker has stayed on the screen, get rid of it on a click.
  const mdown = DomEvent.bind(blocker.element(), 'mousedown', dragApi.forceDrop);

  const mup = DomEvent.bind(blocker.element(), 'mouseup', dragApi.drop);
  const mmove = DomEvent.bind(blocker.element(), 'mousemove', dragApi.move);
  const mout = DomEvent.bind(blocker.element(), 'mouseout', dragApi.delayDrop);

  const destroy = function () {
    blocker.destroy();
    mup.unbind();
    mmove.unbind();
    mout.unbind();
    mdown.unbind();
  };

  const start = function (parent: Element) {
    Insert.append(parent, blocker.element());
  };

  const stop = function () {
    Remove.remove(blocker.element());
  };

  return DragSink({
    element: blocker.element,
    start,
    stop,
    destroy
  });
};

export default DragMode({
  compare,
  extract,
  sink,
  mutate
});