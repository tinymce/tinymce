test(
  'browser.tinymce.plugins.spellchecker.alien.DetectProPluginTest',
  [
    'ephox.agar.api.Assertions',
    'tinymce.core.Editor',
    'tinymce.core.EditorManager',
    'tinymce.core.PluginManager',
    'tinymce.plugins.spellchecker.alien.DetectProPlugin'
  ],
  function (Assertions, Editor, EditorManager, PluginManager, DetectProPlugin) {
    // Fake loading of tinymcespellchecker
    PluginManager.add('tinymcespellchecker', function () { });

    Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste' }, EditorManager)));
    Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: '' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'tinymcespellchecker' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste tinymcespellchecker' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'tinymcespellchecker paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste tinymcespellchecker paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste,tinymcespellchecker,paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste  tinymcespellchecker  paste' }, EditorManager)));
  }
);
