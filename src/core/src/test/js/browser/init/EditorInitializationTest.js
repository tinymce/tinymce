asynctest(
  'browser.tinymce.core.init.EditorInitializationTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFilter',
    'global!document',
    'global!window',
    'tinymce.core.EditorManager',
    'tinymce.core.Env',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.util.Tools',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Assertions, GeneralSteps, Logger, Pipeline, Step, Arr, LegacyUnit, Element, Attr, SelectorFilter, document, window, EditorManager, Env, ViewBlock, Tools,
    Theme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    Theme();

    var setup = function () {
      var i, htmlReset = '', odd;
      for (i = 1; i < 9; i++) {
        odd = i % 2 !== 0;
        htmlReset += '<textarea id="elm-' + i + '" class="' + (odd ? 'elm-odd' : 'elm-even') + '"></textarea>';
      }

      viewBlock.attach();
      viewBlock.update(htmlReset);
    };

    var teardown = function (done) {
      window.setTimeout(function () {
        EditorManager.remove();
        done();
      }, 0);
    };

    suite.asyncTest("target (initialised properly)", function (_, done) {
      var elm1 = viewBlock.get().querySelector('#elm-1');

      EditorManager.init({
        target: elm1,
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        init_instance_callback: function (ed) {
          LegacyUnit.equalDom(ed.targetElm, elm1);
          teardown(done);
        }
      });
    });

    suite.asyncTest("target (initialise on element without id)", function (_, done) {
      var elm = document.createElement('textarea');
      viewBlock.get().appendChild(elm);

      EditorManager.init({
        target: elm,
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        init_instance_callback: function (ed) {
          LegacyUnit.equal(ed.id.length > 0, true, "editors id set to: " + ed.id);
          LegacyUnit.equalDom(ed.targetElm, elm);
          teardown(done);
        }
      });
    });

    suite.asyncTest("target (selector option takes precedence over target option)", function (_, done) {
      var elm1 = document.getElementById('elm-1');
      var elm2 = document.getElementById('elm-2');

      EditorManager.init({
        selector: '#elm-2',
        target: elm1,
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        init_instance_callback: function (ed) {
          LegacyUnit.equalDom(ed.targetElm, elm2);
          teardown(done);
        }
      });
    });

    suite.asyncTest("selector on non existing targets", function (_, done) {
      EditorManager.init({
        selector: '#non-existing-id',
        skin_url: '/project/src/skins/lightgray/dist/lightgray'
      }).then(function (result) {
        Assertions.assertEq('Should be an result that is zero length', 0, result.length);
        teardown(done);
      });
    });

    suite.asyncTest("selector on an unsupported browser", function (_, done) {
      // Fake IE 8
      var oldIeValue = Env.ie;
      Env.ie = 8;

      EditorManager.init({
        selector: '#elm-2',
        skin_url: '/project/src/skins/lightgray/dist/lightgray'
      }).then(function (result) {
        Assertions.assertEq('Should be an result that is zero length', 0, result.length);
        Env.ie = oldIeValue;
        teardown(done);
      });
    });

    suite.asyncTest("target (each editor should have a different target)", function (_, done) {
      var maxCount = document.querySelectorAll('.elm-even').length;
      var elm1 = document.getElementById('elm-1');
      var count = 0;
      var targets = [];

      EditorManager.init({
        selector: '.elm-even',
        target: elm1,
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        init_instance_callback: function (ed) {
          LegacyUnit.equal(ed.targetElm !== elm1, true, "target option ignored");
          LegacyUnit.equal(Tools.inArray(ed.targetElm, targets), -1);

          targets.push(ed.targetElm);

          if (++count >= maxCount) {
            teardown(done);
          }
        }
      });
    });

    var getSkinCssFilenames = function () {
      return Arr.bind(SelectorFilter.descendants(Element.fromDom(document), 'link'), function (link) {
        var href = Attr.get(link, 'href');
        var fileName = href.split('/').slice(-1).join('');
        var isSkin = href.indexOf('lightgray/') > -1;
        return isSkin ? [ fileName ] : [ ];
      });
    };

    var mCreateInlineModeMultipleInstances = Step.stateful(function (value, next, die) {
      viewBlock.update('<div class="tinymce-editor"><p>a</p></div><div class="tinymce-editor"><p>b</p></div>');

      EditorManager.init({
        selector: '.tinymce-editor',
        inline: true,
        skin_url: '/project/src/skins/lightgray/dist/lightgray'
      }).then(next, die);
    });

    var mAssertEditors = Step.stateful(function (editors, next, die) {
      Assertions.assertHtml('Editor contents should be the first div content', '<p>a</p>', editors[0].getContent());
      Assertions.assertHtml('Editor contents should be the second div content', '<p>b</p>', editors[1].getContent());
      Assertions.assertEq('Editor container should be null', null, editors[0].editorContainer);
      Assertions.assertEq('Editor container should be null', null, editors[1].editorContainer);

      Assertions.assertEq(
        'Should only be two skin files the skin and the content for inline mode',
        ["skin.min.css", "content.inline.min.css"],
        getSkinCssFilenames()
      );

      var targets = Arr.map(editors, function (editor) {
        return editor.getElement();
      });

      Assertions.assertEq('Targets should be two since there are two editors', 2, targets.length);

      next(targets);
    });

    var sRemoveAllEditors = Step.sync(function () {
      EditorManager.remove();
    });

    var mAssertTargets = Step.stateful(function (targets, next, die) {
      Assertions.assertEq('Targets should be two since there are two editors', 2, targets.length);

      Arr.each(targets, function (target) {
        Assertions.assertEq('Target parent should not be null', true, target.parentNode !== null);
      });

      next({});
    });

    setup();
    Pipeline.async({}, [
      Logger.t('Initialize multiple inline editors and remove them', GeneralSteps.sequence([
        mCreateInlineModeMultipleInstances,
        mAssertEditors,
        sRemoveAllEditors,
        mAssertTargets
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
