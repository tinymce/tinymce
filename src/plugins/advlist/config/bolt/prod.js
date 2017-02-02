configure({
  sources: [
    source('amd', 'tinymce.plugins.advlist', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/advlist\//, '');
		})
  ]
});
