test(
  'browser.tinymce.plugins.paste.alien.DetectProPluginTest',
  [
    'ephox.agar.api.Assertions',
    'tinymce.core.Editor',
    'tinymce.core.EditorManager',
    'tinymce.core.PluginManager',
    'tinymce.plugins.paste.alien.DetectProPlugin'
  ],
  function (Assertions, Editor, EditorManager, PluginManager, DetectProPlugin) {
    // Fake loading of powerpaste
    PluginManager.add('powerpaste', function () { });

    Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste' }, EditorManager)));
    Assertions.assertEq('Should not have pro plugin', false, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: '' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'powerpaste paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste powerpaste paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste,powerpaste,paste' }, EditorManager)));
    Assertions.assertEq('Should have pro plugin', true, DetectProPlugin.hasProPlugin(new Editor('id', { plugins: 'paste  powerpaste  paste' }, EditorManager)));
  }
);
