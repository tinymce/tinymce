import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.NewCellRowEventsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  suite.test('Table newcell/newrow events', function (editor) {
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

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
