interface MockState {
  readonly get: () => boolean;
  readonly set: (nu: boolean) => void;
  readonly toggle: () => boolean;
}

const mockFeatureState = (): MockState => {
  // Why we need this mock?
  // Alloy toggle is stateless, it needs something to tell it what state it should be

  let demoState = false;

  const get = (): boolean => demoState;

  const set = (nu: boolean): void => {
    demoState = nu;
  };

  const toggle = (): boolean => {
    const nuState = !demoState;
    set(nuState);
    return get();
  };

  return {
    get,
    set,
    toggle
  };
};

export {
  mockFeatureState
};
