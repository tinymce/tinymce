configure({
  sources: [
    source('amd', 'tinymce.themes', '../../src/themes', function (id) {
      var parts = id.split('.');
      var suffix = parts.slice(3);
      var theme = parts[2];

      if (parts[3] === 'test') return [theme, 'src/test/js/module'].concat(suffix).join('/');
      if (parts[3] === 'demo') return [theme, 'src/demo/js'].concat(suffix).join('/');
      else return [theme, 'src/main/js'].concat(suffix).join('/');
    }),
    source('amd', 'ephox', '../../node_modules/@ephox', mapper.repo('js', mapper.flat)),
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical)
  ]
});
