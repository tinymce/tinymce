asynctest(
  'browser.tinymce.plugins.table.TableAsBodyTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Cursors',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Selectors',
    'ephox.sugar.api.search.Traverse',
    'global!document',
    'global!setTimeout',
    'tinymce.core.EditorManager',
    'tinymce.plugins.table.Plugin'
  ],
  function (
    Assertions, Chain, Cursors, GeneralSteps, Logger, Pipeline, Id, Merger, Insert, Remove, Element, Attr, Selectors, Traverse, document, setTimeout, EditorManager,
    Plugin
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();

    var toDomRange = function (range) {
      var doc = Traverse.owner(range.start());
      var rng = doc.dom().createRange();
      rng.setStart(range.start().dom(), range.soffset());
      rng.setEnd(range.finish().dom(), range.foffset());
      return rng;
    };

    var createDomSelection = function (container, sPath, soffset, fPath, foffset) {
      var path = Cursors.path({
        startPath: sPath,
        soffset: soffset,
        finishPath: fPath,
        foffset: foffset
      });
      return toDomRange(Cursors.calculate(container, path));
    };

    var cFromSettings = function (settings, html) {
      return Chain.on(function (_, next, die) {
        var randomId = Id.generate('tiny-loader');
        settings = settings || {};
        var target = Element.fromHtml(html);

        Attr.set(target, 'id', randomId);
        Insert.append(Element.fromDom(document.body), target);

        EditorManager.init(Merger.merge(settings, {
          selector: '#' + randomId,
          init_instance_callback: function (editor) {
            setTimeout(function () {
              next(Chain.wrap(editor));
            }, 0);
          }
        }));
      });
    };

    var cExecCommand = function (command, value) {
      return Chain.op(function (editor) {
        editor.execCommand(command, false, value);
      });
    };

    var cAssertContent = function (expected) {
      return Chain.op(function (editor) {
        Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
      });
    };

    var cRemove = Chain.op(function (editor) {
      var id = editor.id;
      editor.remove();
      Selectors.one('#' + id).bind(Remove.remove);
    });

    var lazyBody = function (editor) {
      return Element.fromDom(editor.getBody());
    };

    var cSetSelection = function (startPath, soffset, finishPath, foffset) {
      return Chain.op(function (editor) {
        var range = createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
        editor.selection.setRng(range);
        editor.nodeChanged();
      });
    };

    var settings = {
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
  }
);