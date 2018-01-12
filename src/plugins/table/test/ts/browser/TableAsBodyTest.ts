import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Selectors } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import EditorManager from 'tinymce/core/EditorManager';
import Plugin from 'tinymce/plugins/table/Plugin';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.table.TableAsBodyTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

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
    return Chain.on(function (_, next, die) {
      const randomId = Id.generate('tiny-loader');
      settings = settings || {};
      const target = Element.fromHtml(html);

      Attr.set(target, 'id', randomId);
      Insert.append(Element.fromDom(document.body), target);

      EditorManager.init(Merger.merge(settings, {
        selector: '#' + randomId,
        init_instance_callback (editor) {
          setTimeout(function () {
            next(Chain.wrap(editor));
          }, 0);
        }
      }));
    });
  };

  const cExecCommand = function (command, value?) {
    return Chain.op(function (editor) {
      editor.execCommand(command, false, value);
    });
  };

  const cAssertContent = function (expected) {
    return Chain.op(function (editor) {
      Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
    });
  };

  const cRemove = Chain.op(function (editor) {
    const id = editor.id;
    editor.remove();
    Selectors.one('#' + id).bind(Remove.remove);
  });

  const lazyBody = function (editor) {
    return Element.fromDom(editor.getBody());
  };

  const cSetSelection = function (startPath, soffset, finishPath, foffset) {
    return Chain.op(function (editor) {
      const range = createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
      editor.selection.setRng(range);
      editor.nodeChanged();
    });
  };

  const settings = {
    theme: false,
    inline: true,
    indent: false,
    plugins: 'table',
    valid_styles: 'border'
  };

  Pipeline.async({}, [
    Logger.t('Remove table rows', GeneralSteps.sequence([
      Logger.t('Should remove table row on table as body', Chain.asStep({}, [
        cFromSettings(settings, '<table><tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody></table>'),
        cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
        cExecCommand('mceTableDeleteRow'),
        cAssertContent('<tbody><tr><td>b</td></tr></tbody>'),
        cRemove
      ])),
      Logger.t('Should not remove last table row on table as body', Chain.asStep({}, [
        cFromSettings(settings, '<table><tbody><tr><td>a</td></tr></tbody></table>'),
        cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
        cExecCommand('mceTableDeleteRow'),
        cAssertContent('<tbody><tr><td>a</td></tr></tbody>'),
        cRemove
      ]))
    ])),
    Logger.t('Remove table columns', GeneralSteps.sequence([
      Logger.t('Should remove table column on table as body', Chain.asStep({}, [
        cFromSettings(settings, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
        cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
        cExecCommand('mceTableDeleteCol'),
        cAssertContent('<tbody><tr><td>b</td></tr></tbody>'),
        cRemove
      ])),
      Logger.t('Should not remove last table column on table as body', Chain.asStep({}, [
        cFromSettings(settings, '<table><tbody><tr><td>a</td></tr></tbody></table>'),
        cSetSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
        cExecCommand('mceTableDeleteCol'),
        cAssertContent('<tbody><tr><td>a</td></tr></tbody>'),
        cRemove
      ]))
    ]))
  ], function () {
    success();
  }, failure);
});
