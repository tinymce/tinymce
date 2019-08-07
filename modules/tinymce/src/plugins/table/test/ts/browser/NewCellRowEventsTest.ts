import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.NewCellRowEventsTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  Plugin();
  SilverTheme();

  suite.test('TestCase-TBA: Table: Table newcell/newrow events', function (editor) {
    const cells = [];
    const rows = [];
    let counter = 0;

    editor.on('newcell', function (e) {
      cells.push(e.node);
      e.node.setAttribute('data-counter', counter++);
    });

    editor.on('newrow', function (e) {
      rows.push(e.node);
      e.node.setAttribute('data-counter', counter++);
    });

    editor.plugins.table.insertTable(2, 3);

    LegacyUnit.equal(cells.length, 6);
    LegacyUnit.equal(rows.length, 3);

    LegacyUnit.equal(cells[cells.length - 1].getAttribute('data-counter'), '8');
    LegacyUnit.equal(rows[rows.length - 1].getAttribute('data-counter'), '6');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Table: Test new cell/new row events', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
