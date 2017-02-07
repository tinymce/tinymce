define(
  'ephox.alloy.docs.BehaviourDocumentation',

  [
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.docs.SchemaView',
    'ephox.compass.Arr'
  ],

  function (Container, SchemaView, Arr) {
    var make = function (bs) {
      return Arr.map(bs, function (b) {
        var heading = Container.build({
          dom: {
            tag: 'h3',
            innerHtml: b.name()
          }
        });

        var description = Container.build({
          dom: {
            tag: 'p',
            innerHtml: SchemaView.getDescription(b.name())
          }
        });

        var schema = b.schema().fold(function (name, output, presence, value) {
          var dsl = value.toDsl();
          return SchemaView.build([ b.name() ], dsl);
        }, function () {
          return Container.build({ });
        });

        var wrapper = Container.build({
          dom: {
            tag: 'div'
          },
          components: [
            heading,
            description,
            schema
          ]
        });

        return {
          value: b.name(),
          wrapper: wrapper
        };
      });
    };

    return {
      make: make
    };
  }
);