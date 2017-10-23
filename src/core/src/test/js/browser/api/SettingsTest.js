test(
  'browser.tinymce.core.api.SettingsTest',
  [
    'ephox.agar.api.Assertions',
    'tinymce.core.Editor',
    'tinymce.core.EditorManager',
    'tinymce.core.api.Settings'
  ],
  function (Assertions, Editor, EditorManager, Settings) {
    Assertions.assertEq('Should be default id', 'tinymce', Settings.getBodyId(new Editor('id', {}, EditorManager)));
    Assertions.assertEq('Should be specified id', 'x', Settings.getBodyId(new Editor('id', { body_id: 'x' }, EditorManager)));
    Assertions.assertEq('Should be specified id for ida', 'a', Settings.getBodyId(new Editor('ida', { body_id: 'ida=a,idb=b' }, EditorManager)));
    Assertions.assertEq('Should be specified id for idb', 'b', Settings.getBodyId(new Editor('idb', { body_id: 'ida=a,idb=b' }, EditorManager)));
    Assertions.assertEq('Should be default id for idc', 'tinymce', Settings.getBodyId(new Editor('idc', { body_id: 'ida=a,idb=b' }, EditorManager)));

    Assertions.assertEq('Should be default class', '', Settings.getBodyClass(new Editor('id', {}, EditorManager)));
    Assertions.assertEq('Should be specified class', 'x', Settings.getBodyClass(new Editor('id', { body_class: 'x' }, EditorManager)));
    Assertions.assertEq('Should be specified class for ida', 'a', Settings.getBodyClass(new Editor('ida', { body_class: 'ida=a,idb=b' }, EditorManager)));
    Assertions.assertEq('Should be specified class for idb', 'b', Settings.getBodyClass(new Editor('idb', { body_class: 'ida=a,idb=b' }, EditorManager)));
    Assertions.assertEq('Should be default class for idc', '', Settings.getBodyClass(new Editor('idc', { body_class: 'ida=a,idb=b' }, EditorManager)));
  }
);
