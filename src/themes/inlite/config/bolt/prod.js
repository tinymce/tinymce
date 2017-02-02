configure({
  sources: [
    source('amd', 'tinymce.themes.inlite', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/themes\/inlite\//, '');
		})
  ]
});
