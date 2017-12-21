import { Logger } from '@ephox/agar';
import DomDefinition from 'ephox/alloy/dom/DomDefinition';
import DomModification from 'ephox/alloy/dom/DomModification';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('DomDefinitionTest', function() {
  /* global assert */
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
    'Testing definition without any children or childspecs, but innerHtml',
    function () {
      var definition = DomDefinition.nu({
        tag: 'person',
        attributes: {
          'name': 'john',
          'age': '14'
        }
      });

      var addInnerHtml = DomModification.nu({
        styles: {
          'fighting': 'drunken'
        },
        innerHtml: 'sailor'
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
        innerHtml: 'sailor',
        value: '<none>',
        defChildren: '<none>',
        domChildren: '<none>'
      }, DomDefinition.defToRaw(
        DomModification.merge(definition, addInnerHtml)
      ));
    }
  );

  Logger.sync(
    'Testing definition without any children or childspecs, but value',
    function () {
      var definition = DomDefinition.nu({
        tag: 'person',
        attributes: {
          'name': 'john',
          'age': '14'
        }
      });

      var addValue = DomModification.nu({
        styles: {
          'fighting': 'drunken'
        },
        value: 'sailor'
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
        value: 'sailor',
        defChildren: '<none>',
        domChildren: '<none>'
      }, DomDefinition.defToRaw(
        DomModification.merge(definition, addValue)
      ));
    }
  );

  Logger.sync(
    'Testing definition with children supplied',
    function () {
      // TODO: add test
    }
  );
});

