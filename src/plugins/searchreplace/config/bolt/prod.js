configure({
  sources: [
    source('amd', 'tinymce.plugins.searchreplace', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/searchreplace\//, '');
		})
  ]
});
