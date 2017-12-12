import BehaviourState from './BehaviourState';

var init = function () {
  return BehaviourState({
    readState: function () {
      return 'No State required';
    }
  });
};

export default <any> {
  init: init
};