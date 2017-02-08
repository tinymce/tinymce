configure({
  sources: [
    source('amd', 'tinymce.plugins.visualblocks', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/visualblocks\//, '');
    })
  ]
});
