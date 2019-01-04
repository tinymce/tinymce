import { Assertions, Chain, Cursors, Pipeline, Guard, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Merger } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Element, Traverse } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/table/Plugin';

UnitTest.asynctest('browser.tinymce.plugins.table.TableAsBodyTest', (success, failure) => {
  Plugin();

  const toDomRange = function (range) {
    const doc = Traverse.owner(range.start());
    const rng = doc.dom().createRange();
    rng.setStart(range.start().dom(), range.soffset());
    rng.setEnd(range.finish().dom(), range.foffset());
    return rng;
  };

  const createDomSelection = function (container, sPath, soffset, fPath, foffset) {
    const path = Cursors.path({
      startPath: sPath,
      soffset,
      finishPath: fPath,
      foffset
    });
    return toDomRange(Cursors.calculate(container, path));
  };

  const cFromSettings = function (settings, html) {
    return Chain.control(
      McEditor.cFromHtml(html, Merger.merge(settings, {
        base_url: '/project/js/tinymce'
      })),
      Guard.addLogging('Create editor with settings ' + settings)
    );
  };

  const cExecCommand = function (command, value?) {
    return Chain.control(
      Chain.op(function (editor: any) {
        editor.execCommand(command, false, value);
      }),
      Guard.addLogging('Execute command ' + command)
    );
  };

  const cAssertContent = function (expected) {
    return Chain.control(
      Chain.op(function (editor: any) {
        Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
      }),
      Guard.addLogging('Assert TinyMCE content ' + expected)
    );
  };

  const cRemove = Chain.control(
    McEditor.cRemove,
    Guard.addLogging('Remove editor')
  );

  const lazyBody = function (editor) {
    return Element.fromDom(editor.getBody());
  };

  const cSetSelection = function (startPath, soffset, finishPath, foffset) {
    return Chain.control(
      Chain.op(function (editor: any) {
      const range = createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
      editor.selection.setRng(range);
      editor.nodeChanged();
      }),
      Guard.addLogging('Set selection range')
    );
  };

  const settings = {
    inline: true,
    indent: false,
    plugins: 'table',
    valid_styles: 'border'
  };

  Pipeline.async({}, [
    Log.step('TBA', 'Table: Should remove table row on table, with multiple rows, as body', Chain.asStep({}, [
      cFromSettings(settings, '<table><tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody></table>'),
      cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
      cExecCommand('mceTableDeleteRow'),
      cAssertContent('<tbody><tr><td>b</td></tr></tbody>'),
      cRemove
    ])),
    Log.step('TBA', 'Table: Should not remove last table row on table as body', Chain.asStep({}, [
      cFromSettings(settings, '<table><tbody><tr><td>a</td></tr></tbody></table>'),
      cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
      cExecCommand('mceTableDeleteRow'),
      cAssertContent('<tbody><tr><td>a</td></tr></tbody>'),
      cRemove
    ])),
    Log.step('TBA', 'Table: Should remove table column on table, with multiple rows, as body', Chain.asStep({}, [
      cFromSettings(settings, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
      cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
      cExecCommand('mceTableDeleteCol'),
      cAssertContent('<tbody><tr><td>b</td></tr></tbody>'),
      cRemove
    ])),
    Log.step('TBA', 'Table: Should not remove last table column on table as body', Chain.asStep({}, [
      cFromSettings(settings, '<table><tbody><tr><td>a</td></tr></tbody></table>'),
      cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
      cExecCommand('mceTableDeleteCol'),
      cAssertContent('<tbody><tr><td>a</td></tr></tbody>'),
      cRemove
    ]))
  ], function () {
    success();
  }, failure);
});
