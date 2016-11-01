define(
  'ephox.alloy.alien.EditableFields',

  [
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node'
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