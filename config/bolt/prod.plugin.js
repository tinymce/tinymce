configure({
  sources: [
    source('amd', 'ephox', '../../node_modules/@ephox', mapper.repo('src/main/js', mapper.hierarchical)),
    source('amd', 'tinymce.core', '../../src/core/dist/globals', mapper.hierarchical),
    source('amd', 'tinymce.plugins', '../../src/plugins', function (id) {
      var parts = id.split('.');
      var suffix = parts.slice(3);
      var plugin = parts[2];

      if (parts[3] === 'test') return [plugin, 'src/test/js/module'].concat(suffix).join('/');
      if (parts[3] === 'demo') return [plugin, 'src/demo/js'].concat(suffix).join('/');
      else return [plugin, 'src/main/js'].concat(suffix).join('/');
    })
  ]
});
