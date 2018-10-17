import { Logger } from '@ephox/agar';
import { assert, UnitTest } from '@ephox/bedrock';
import * as DomDefinition from 'ephox/alloy/dom/DomDefinition';
import * as DomModification from 'ephox/alloy/dom/DomModification';

UnitTest.test('DomDefinitionTest', () => {
  /* global assert */
  // TODO: Add property based tests.

  Logger.sync(
    'Testing definition without any children or childspecs',
    () => {
      const definition = DomDefinition.nu({
        uid: 'john-uid',
        tag: 'person',
        attributes: {
          name: 'john',
          age: '14'
        }
      });

      const addStyles = DomModification.nu({
        styles: {
          fighting: 'drunken'
        }
      });

      assert.eq({
        uid: 'john-uid',
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
        defChildren: ['<none>'],
        domChildren: '<none>'
      }, DomDefinition.defToRaw(
        // "as any" used because I'm not using real elements when testing
        DomModification.merge(definition, addStyles) as any
      ));
    }
  );

  Logger.sync(
    'Testing definition without any children or childspecs, but innerHtml',
    () => {
      const definition = DomDefinition.nu({
        uid: 'john-uid',
        tag: 'person',
        attributes: {
          name: 'john',
          age: '14'
        }
      });

      const addInnerHtml = DomModification.nu({
        styles: {
          fighting: 'drunken'
        },
        innerHtml: 'sailor'
      });

      assert.eq({
        uid: 'john-uid',
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
        defChildren: ['<none>'],
        domChildren: '<none>'
      }, DomDefinition.defToRaw(
        DomModification.merge(definition, addInnerHtml) as any
      ));
    }
  );

  Logger.sync(
    'Testing definition without any children or childspecs, but value',
    () => {
      const definition = DomDefinition.nu({
        uid: 'john-uid',
        tag: 'person',
        attributes: {
          name: 'john',
          age: '14'
        }
      });

      const addValue = DomModification.nu({
        styles: {
          fighting: 'drunken'
        },
        value: 'sailor'
      });

      assert.eq({
        uid: 'john-uid',
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
        defChildren: ['<none>'],
        domChildren: '<none>'
      }, DomDefinition.defToRaw(
        DomModification.merge(definition, addValue) as any
      ));
    }
  );

  Logger.sync(
    'Testing definition with children supplied',
    () => {
      // TODO: add test
    }
  );
});
