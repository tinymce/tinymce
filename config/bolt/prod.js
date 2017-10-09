configure({
  sources: [
    source('amd', 'ephox', '../../node_modules/@ephox', mapper.repo('src/main/js', mapper.hierarchical)),
    source('amd', 'tinymce.core', '../../src/core', function (id) {
      var parts = id.split('.');
      var suffix = parts.slice(2);

      if (parts[2] === 'test') return ['src/test/js/module'].concat(suffix).join('/');
      if (parts[2] === 'demo') return ['src/demo/js'].concat(suffix).join('/');
      else return ['src/main/js'].concat(suffix).join('/');
    }),
    source('amd', 'tinymce.ui', '../../src/ui', function (id) {
      var parts = id.split('.');
      var suffix = parts.slice(2);

      if (parts[2] === 'test') return ['src/test/js/module'].concat(suffix).join('/');
      if (parts[2] === 'demo') return ['src/demo/js'].concat(suffix).join('/');
      else return ['src/main/js'].concat(suffix).join('/');
    }),
    source('amd', 'tinymce.plugins', '../../src/plugins', function (id) {
      var parts = id.split('.');
      var suffix = parts.slice(3);
      var plugin = parts[2];

      if (parts[3] === 'test') return [plugin, 'src/test/js/module'].concat(suffix).join('/');
      if (parts[3] === 'demo') return [plugin, 'src/demo/js'].concat(suffix).join('/');
      else return [plugin, 'src/main/js'].concat(suffix).join('/');
    }),
    source('amd', 'tinymce.themes', '../../src/themes', function (id) {
      var parts = id.split('.');
      var suffix = parts.slice(3);
      var theme = parts[2];

      if (parts[3] === 'test') return [theme, 'src/test/js/module'].concat(suffix).join('/');
      if (parts[3] === 'demo') return [theme, 'src/demo/js'].concat(suffix).join('/');
      else return [theme, 'src/main/js'].concat(suffix).join('/');
    })
  ]
});
