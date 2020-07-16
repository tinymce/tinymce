import { document } from '@ephox/dom-globals';
import { Attribute, Insert, Remove, SugarElement } from '@ephox/sugar';
import { Step } from 'ephox/agar/api/Step';

const mSetup = Step.stateful((state, next, _die) => {
  const container = SugarElement.fromTag('div');
  Attribute.set(container, 'tabindex', '-1');
  Attribute.set(container, 'test-id', 'true');

  const input = SugarElement.fromTag('input');
  Insert.append(container, input);

  Insert.append(SugarElement.fromDom(document.body), container);
  next({
    container,
    input
  });
});

interface TeardownState {
  container: SugarElement<any>;
}

const mTeardown = Step.stateful<TeardownState, TeardownState>((state, next, _die) => {
  Remove.remove(state.container);
  next(state);
});

export {
  mSetup,
  mTeardown
};
