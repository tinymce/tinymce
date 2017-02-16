define(
  'ephox.mcagar.api.TinyApis',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Cursors',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.mcagar.selection.TinySelections',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'global!JSON'
  ],

  function (
    Assertions, Chain, Cursors, FocusTools, Step, UiFinder, Waiter, TinySelections, Hierarchy,
    Element, Html, JSON
  ) {
    return function (editor) {
      var setContent = function (html) {
        editor.setContent(html);
      };

      var sSetContent = function (html) {
        return Step.sync(function () {
          setContent(html);
        });
      };

      var lazyBody = function () {
        return Element.fromDom(editor.getBody());
      };

      var cNodeChanged = Chain.op(function () {
        editor.nodeChanged();
      });

      var cSetDomSelection = Chain.op(function (range) {
        editor.selection.setRng(range);
      });

      var cSelectElement = Chain.op(function (target) {
        editor.selection.select(target.dom());
      });

      var sSetSelectionFrom = function (spec) {
        var path = Cursors.pathFrom(spec);
        return sSetSelection(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
      };

      var sSetCursor = function (elementPath, offset) {
        return sSetSelection(elementPath, offset, elementPath, offset);
      };

      var sSetSelection = function (startPath, soffset, finishPath, foffset) {
        return Chain.asStep(lazyBody(), [
          TinySelections.cCreateDomSelection(startPath, soffset, finishPath, foffset),
          cSetDomSelection,
          cNodeChanged
        ]);
      };

      var sSetSetting = function (key, value) {
        return Step.sync(function () {
          editor.settings[key] = value;
        });
      };

      var sSelect = function (selector, path) {
        return Chain.asStep(lazyBody(), [
          UiFinder.cFindIn(selector),
          Cursors.cFollow(path),
          cSelectElement
        ]);
      };

      var cGetContent = Chain.mapper(function (input) {
        // Technically not mapping value.
        return editor.getContent();
      });

      var sExecCommand = function (command, value) {
        return Step.sync(function () {
          editor.execCommand(command, false, value);
        });
      };

      var sAssertContent = function (expected) {
        return Chain.asStep({}, [
          cGetContent,
          Assertions.cAssertHtml('Checking TinyMCE content', expected)
        ]);
      };

      var sAssertContentPresence = function (expected) {
        return Assertions.sAssertPresence(
          'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
          expected,
          lazyBody()
        );
      };

      var sAssertContentStructure = function (expected) {
        return Assertions.sAssertStructure(
          'Asserting the structure of tiny content.',
          expected,
          lazyBody()
        );
      };

      var sAssertSelectionFrom = function (expected) {
        // TODO
      };

      var assertPath = function (label, root, expPath, expOffset, actElement, actOffset) {
        var expected = Cursors.calculateOne(root, expPath);
        var message = function () {
          var actual = Element.fromDom(actElement);
          var actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
          return 'Expected path: '  + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
        };
        Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
        Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
      };

      var sAssertSelection = function (startPath, soffset, finishPath, foffset) {
        return Step.sync(function () {
          var actual = editor.selection.getRng();
          assertPath('start', lazyBody(), startPath, soffset, actual.startContainer, actual.startOffset);
          assertPath('finish', lazyBody(), finishPath, foffset, actual.endContainer, actual.endOffset);
        });
      };

      var sFocus = Step.sync(function () {
        editor.focus();
      });

      var sNodeChanged = Step.sync(function () {
        editor.nodeChanged();
      });

      var sTryAssertFocus = Waiter.sTryUntil(
        'Waiting for focus on tinymce editor',
        FocusTools.sIsOnSelector(
          'iframe focus',
          Element.fromDom(document),
          'iframe'
        ),
        100,
        1000
      );

      return {
        sSetContent: sSetContent,
        cGetContent: cGetContent,
        cNodeChanged: cNodeChanged,

        sAssertContent: sAssertContent,
        sAssertContentPresence: sAssertContentPresence,
        sAssertContentStructure: sAssertContentStructure,
        sSetSelectionFrom: sSetSelectionFrom,
        sSetSelection: sSetSelection,
        sSetSetting: sSetSetting,
        sSetCursor: sSetCursor,
        sSelect: sSelect,
        sExecCommand: sExecCommand,
        sAssertSelectionFrom: sAssertSelectionFrom,
        sAssertSelection: sAssertSelection,
        sTryAssertFocus: sTryAssertFocus,
        sFocus: sFocus,
        sNodeChanged: sNodeChanged
      };
    };
  }
);