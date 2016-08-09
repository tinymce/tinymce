test(
  'DomDefinitionTest',

  [
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification'
  ],

  function (DomDefinition, DomModification) {
    // TODO: Add property based tests.
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
      value: '<none>'
    }, DomDefinition.defToRaw(
      DomModification.modify(definition, addStyles)
    ));
  }
);