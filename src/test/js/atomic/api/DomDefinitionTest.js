test(
  'DomDefinitionTest',

  [
    'ephox.agar.api.Logger',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification'
  ],

  function (Logger, DomDefinition, DomModification) {
    // TODO: Add property based tests.

    Logger.sync(
      'Testing definition without any children or childspecs',
      function () {
        var definition = DomDefinition.nu({
          tag: 'person',
          attributes: {
            'name': 'john',
            'age': '14'
          }
        });

        var addStyles = DomModification.nu({
          styles: {
            'fighting': 'drunken'
          }
        });

        assert.eq({
          tag: 'person',
          classes: [],
          attributes: {
            name: 'john',
            age: '14'
          },
          styles: {
            fighting: 'drunken'
          },
          innerHtml: '<none>',
          value: '<none>',
          defChildren: '<none>',
          domChildren: '<none>'
        }, DomDefinition.defToRaw(
          DomModification.merge(definition, addStyles)
        ));
      }
    );

    Logger.sync(
      'Testing definition with children supplied',
      function () {

      }
    );
  }
);