import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.charmap.CharMapPluginTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  CharmapPlugin();
  SilverTheme();

  suite.test('TestCase-TBA: Charmap: Replace characters by array', function (editor) {
    editor.settings.charmap = [
      [65, 'Latin A'],
      [66, 'Latin B']
    ];

    LegacyUnit.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [65, 'Latin A'],
          [66, 'Latin B']
        ]
      }
    ]);
  });

  suite.test('TestCase-TBA: Charmap: Replace characters by function', function (editor) {
    editor.settings.charmap = function () {
      return [
        [65, 'Latin A fun'],
        [66, 'Latin B fun']
      ];
    };

    LegacyUnit.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [65, 'Latin A fun'],
          [66, 'Latin B fun']
        ]
      }
    ]);
  });

  suite.test('TestCase-TBA: Charmap: Append characters by array', function (editor) {
    editor.settings.charmap = [
      [67, 'Latin C']
    ];

    editor.settings.charmap_append = [
      [65, 'Latin A'],
      [66, 'Latin B']
    ];

    LegacyUnit.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [67, 'Latin C'],
          [65, 'Latin A'],
          [66, 'Latin B']
        ]
      }
    ]);
  });

  suite.test('TestCase-TBA: Charmap: Append characters by function', function (editor) {
    editor.settings.charmap = [
      [67, 'Latin C']
    ];

    editor.settings.charmap_append = function () {
      return [
        [65, 'Latin A fun'],
        [66, 'Latin B fun']
      ];
    };

    LegacyUnit.deepEqual(editor.plugins.charmap.getCharMap(), [
      {
        name: 'User Defined',
        characters: [
          [67, 'Latin C'],
          [65, 'Latin A fun'],
          [66, 'Latin B fun']]
      }
    ]);
  });

  suite.test('TestCase-TBA: Charmap: Insert character', function (editor) {
    let lastEvt;

    editor.on('InsertCustomChar', function (e) {
      lastEvt = e;
    });

    editor.plugins.charmap.insertChar('A');
    LegacyUnit.equal(lastEvt.chr, 'A');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Charmap: Test replacing, appending and inserting characters', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'charmap',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
