configure({
  sources: [
    source('amd', 'tinymce.codesample', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/codesample\//, '');
		})
  ]
});
