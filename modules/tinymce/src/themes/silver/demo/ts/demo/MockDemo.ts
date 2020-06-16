const mockFeatureState = () => {
  // Why we need this mock?
  // Alloy toggle is stateless, it needs somthing to tell it what state it should be

  let demoState = false;

  const get = (): boolean => demoState;

  const set = (nu: boolean): void => {
    demoState = nu;
  };

  const toggle = (): boolean => {
    const nuState = demoState === true ? false : true;
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