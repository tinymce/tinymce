define(
  'ephox.alloy.alien.EditableFields',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Node'
  ],

  function (Attr, Node) {
    var inside = function (target) {
      return (
        (Node.name(target) === 'input' && Attr.get(target, 'type') !== 'radio') ||
        Node.name(target) === 'textarea'
      );
    };

    return {
      inside: inside
    };
  }
);