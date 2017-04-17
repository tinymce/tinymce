asynctest(
  'browser.tinymce.core.JqueryIntegrationTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'global!document',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.ScriptLoader',
    'tinymce.core.Editor',
    'tinymce.core.EditorManager',
    'tinymce.core.JqueryIntegration',
    'tinymce.core.PluginManager',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.ThemeManager',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Tools',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Pipeline, LegacyUnit, document, window, DOMUtils, ScriptLoader, Editor, EditorManager, JqueryIntegration, PluginManager, ViewBlock, ThemeManager, Delay,
    Tools, Theme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();
    var $;

    Theme();

    var setup = function () {
      viewBlock.attach();
      viewBlock.update(
        '<textarea id="elm1"></textarea>' +
        '<textarea id="elm2"></textarea>' +
        '<textarea id="elm3">Textarea</textarea>'
      );
    };

    var loadJquery = function (done) {
      var script = document.createElement('script');
      script.src = '/project/node_modules/jquery/dist/jquery.min.js';
      script.onload = function () {
        script.parentNode.removeChild(script);
        $ = window.jQuery.noConflict(true);
        JqueryIntegration({ tinymce: EditorManager, jQuery: $ });
        done();
      };
      document.body.appendChild(script);
    };

    suite.asyncTest('Setup editors', function (_, done) {
      $(function () {
        $('#elm1,#elm2').tinymce({
          skin_url: '/project/src/skins/lightgray/dist/lightgray',
          init_instance_callback: function () {
            var ed1 = EditorManager.get('elm1'), ed2 = EditorManager.get('elm2');

            // When both editors are initialized
            if (ed1 && ed1.initialized && ed2 && ed2.initialized) {
              done();
            }
          }
        });
      });
    });

    suite.test("Get editor instance", function () {
      LegacyUnit.equal($('#elm1').tinymce().id, 'elm1');
      LegacyUnit.equal($('#elm2').tinymce().id, 'elm2');
      LegacyUnit.equal($('#elm3').tinymce(), null);
    });

    suite.test("Get contents using jQuery", function () {
      EditorManager.get('elm1').setContent('<p>Editor 1</p>');

      LegacyUnit.equal($('#elm1').html(), '<p>Editor 1</p>');
      LegacyUnit.equal($('#elm1').val(), '<p>Editor 1</p>');
      LegacyUnit.equal($('#elm1').attr('value'), '<p>Editor 1</p>');
      LegacyUnit.equal($('#elm1').text(), 'Editor 1');
    });

    suite.test("Set contents using jQuery", function () {
      $('#elm1').html('Test 1');
      LegacyUnit.equal($('#elm1').html(), '<p>Test 1</p>');

      $('#elm1').val('Test 2');
      LegacyUnit.equal($('#elm1').html(), '<p>Test 2</p>');

      $('#elm1').text('Test 3');
      LegacyUnit.equal($('#elm1').html(), '<p>Test 3</p>');

      $('#elm1').attr('value', 'Test 4');
      LegacyUnit.equal($('#elm1').html(), '<p>Test 4</p>');
    });

    suite.test("append/prepend contents using jQuery", function () {
      EditorManager.get('elm1').setContent('<p>Editor 1</p>');

      $('#elm1').append('<p>Test 1</p>');
      LegacyUnit.equal($('#elm1').html(), '<p>Editor 1</p>\n<p>Test 1</p>');

      $('#elm1').prepend('<p>Test 2</p>');
      LegacyUnit.equal($('#elm1').html(), '<p>Test 2</p>\n<p>Editor 1</p>\n<p>Test 1</p>');
    });

    suite.test("Find using :tinymce selector", function () {
      LegacyUnit.equal($('textarea:tinymce').length, 2);
    });

    suite.test("Set contents using :tinymce selector", function () {
      $('textarea:tinymce').val('Test 1');
      LegacyUnit.equal($('#elm1').val(), '<p>Test 1</p>');
      LegacyUnit.equal($('#elm2').val(), '<p>Test 1</p>');
      LegacyUnit.equal($('#elm3').val(), 'Textarea');
    });

    suite.test("Get contents using :tinymce selector", function () {
      $('textarea:tinymce').val('Test get');
      LegacyUnit.equal($('textarea:tinymce').val(), '<p>Test get</p>');
    });

    suite.test("applyPatch is only called once", function () {
      var options = {}, oldValFn;

      $('#elm1').tinymce(options);

      oldValFn = $.fn.val = function () {
        // no-op
      };

      $('#elm2').tinymce(options);

      LegacyUnit.equal($.fn.val, oldValFn);
    });

    loadJquery(function () {
      setup();
      Pipeline.async({}, suite.toSteps({}), function () {
        EditorManager.remove();
        viewBlock.detach();
        success();
      }, failure);
    });
  }
);
