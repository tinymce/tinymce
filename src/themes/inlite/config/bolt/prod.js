configure({
  sources: [
    source('amd', 'tinymce.themes.inlite', '../../src/main/js', function (id) {
			console.log(id, mapper.hierarchical(id).replace(/^tinymce\/themes\/inlite\//, ''));
			return mapper.hierarchical(id).replace(/^tinymce\/themes\/inlite\//, '');
		})
  ]
});
