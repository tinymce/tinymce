import { document } from '@ephox/dom-globals';
import { Attr, Element, Insert, Remove } from '@ephox/sugar';
import { Step } from 'ephox/agar/api/Step';

const mSetup = Step.stateful(function (state, next, die) {
  const container = Element.fromTag('div');
  Attr.set(container, 'tabindex', '-1');
  Attr.set(container, 'test-id', 'true');

  const input = Element.fromTag('input');
  Insert.append(container, input);

  Insert.append(Element.fromDom(document.body), container);
  next({
    container: container,
    input: input
  });
});

interface TeardownState {
  container: Element;
}

const mTeardown = Step.stateful<TeardownState, TeardownState>(function (state, next, die) {
  Remove.remove(state.container);
  next(state);
});

export default {
  mSetup: mSetup,
  mTeardown: mTeardown
};