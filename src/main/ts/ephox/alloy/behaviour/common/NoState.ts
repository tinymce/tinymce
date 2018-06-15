import BehaviourState from './BehaviourState';

export interface Stateless { }

const init = () => {
  return BehaviourState({
    readState () {
      return 'No State required';
    }
  });
};

export {
  init
};