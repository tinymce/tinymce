export interface BehaviourState {
  /** This is for debug purposes only, and only used by the Alloy Inspector Chrome Plugin */
  readState: () => any;
}

export interface BehaviourStateInitialiser<C, S extends BehaviourState> {
  init: (config: C) => S;
}

const NoState: BehaviourStateInitialiser<any, BehaviourState> = {
  init: () => nu({
    readState() {
      return 'No State required';
    }
  })
};

export interface Stateless extends BehaviourState {
  // Add placeholder here.
}

const nu = <T extends BehaviourState>(spec: T): T => spec;

export {
  nu as nuState,
  NoState
};
