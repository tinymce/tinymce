import { Attribute, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import { Step } from 'ephox/agar/api/Step';

const createContainer = () => {
  const container = SugarElement.fromTag('div');
  Attribute.set(container, 'tabindex', '-1');
  Attribute.set(container, 'test-id', 'true');

  const input = SugarElement.fromTag('input');
  Insert.append(container, input);

  return {
    container,
    input
  };
};

const mSetup = Step.stateful((state, next, _die) => {
  const { container, input } = createContainer();
  Insert.append(SugarBody.body(), container);
  next({
    container,
    input
  });
});

const mSetupShadowRoot = Step.stateful((state, next, _die) => {
  const { container, input } = createContainer();

  const shadowHost = SugarElement.fromTag('div');
  const shadowRoot = SugarElement.fromDom(shadowHost.dom.attachShadow({ mode: 'open' }));
  Insert.append(shadowRoot, container);

  Insert.append(SugarBody.body(), shadowHost);
  next({
    container,
    input,
    shadowRoot
  });
});

interface TeardownState {
  container: SugarElement<HTMLElement>;
}

const mTeardown = Step.stateful<TeardownState, TeardownState>((state, next, _die) => {
  Remove.remove(state.container);
  next(state);
});

export {
  mSetup,
  mSetupShadowRoot,
  mTeardown
};
