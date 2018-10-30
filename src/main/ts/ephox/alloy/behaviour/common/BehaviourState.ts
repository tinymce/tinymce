export interface BehaviourState {
  readState: () => any;
}

export interface BehaviourStateInitialiser<C> {
  init: (config: C) => BehaviourState;
}

const NoState: BehaviourStateInitialiser<any> = {
  init: () => {
    return nu({
      readState () {
        return 'No State required';
      }
    });
  }
};

export interface Stateless extends BehaviourState {
  // Add placeholder here.
}

const nu = (spec): BehaviourState => {
  return spec;
};

export {
  nu as nuState,
  NoState
};