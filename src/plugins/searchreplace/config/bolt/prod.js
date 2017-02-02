configure({
  sources: [
    source('amd', 'tinymce.searchreplace', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/searchreplace\//, '');
		})
  ]
});
