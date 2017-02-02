configure({
  sources: [
    source('amd', 'tinymce.plugins.codesample', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/codesample\//, '');
		})
  ]
});
