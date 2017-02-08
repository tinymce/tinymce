configure({
  sources: [
    source('amd', 'tinymce.plugins.textcolor', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/textcolor\//, '');
    })
  ]
});
