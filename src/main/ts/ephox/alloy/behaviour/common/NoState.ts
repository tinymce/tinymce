import BehaviourState from './BehaviourState';

const init = function () {
  return BehaviourState({
    readState () {
      return 'No State required';
    }
  });
};

export {
  init
};