configure({
  sources: [
    source('amd', 'tinymce.fullpage', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/fullpage\//, '');
		})
  ]
});
