test(
  'browser.tinymce.plugins.toc.api.SettingsTest',
  [
    'ephox.agar.api.Assertions',
    'tinymce.core.Editor',
    'tinymce.core.EditorManager',
    'tinymce.plugins.toc.api.Settings'
  ],
  function (Assertions, Editor, EditorManager, Settings) {
    Assertions.assertEq('Should be default toc class', 'mce-toc', Settings.getTocClass(new Editor('x', {}, EditorManager)));
    Assertions.assertEq('Should be specified toc class', 'c', Settings.getTocClass(new Editor('x', { toc_class: 'c' }, EditorManager)));

    Assertions.assertEq('Should be default h2', 'h2', Settings.getTocHeader(new Editor('x', {}, EditorManager)));
    Assertions.assertEq('Should be h3', 'h3', Settings.getTocHeader(new Editor('x', { toc_header: 'h3' }, EditorManager)));
    Assertions.assertEq('Should be h2 since h75 is invalid', 'h2', Settings.getTocHeader(new Editor('x', { toc_header: 'h75' }, EditorManager)));

    Assertions.assertEq('Should be default 3', 3, Settings.getTocDepth(new Editor('x', {}, EditorManager)));
    Assertions.assertEq('Should be specified toc depth (string)', 5, Settings.getTocDepth(new Editor('x', { toc_depth: '5' }, EditorManager)));
    Assertions.assertEq('Should be specified toc depth', 5, Settings.getTocDepth(new Editor('x', { toc_depth: 5 }, EditorManager)));
    Assertions.assertEq('Should be default toc depth for invalid', 3, Settings.getTocDepth(new Editor('x', { toc_depth: '53' }, EditorManager)));
  }
);
