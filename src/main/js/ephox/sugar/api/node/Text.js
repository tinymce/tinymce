define(
  'ephox.sugar.api.node.Text',

  [
    'ephox.sugar.api.node.Node',
    'ephox.sugar.impl.NodeValue'
  ],

  function (Node, NodeValue) {
    var api = NodeValue(Node.isText, 'text');

    var get = function (element) {
      return api.get(element);
    };

    var getOption = function (element) {
      return api.getOption(element);
    };

    var set = function (element, value) {
      api.set(element, value);
    };

    return {
      get: get,
      getOption: getOption,
      set: set
    };
  }
);
