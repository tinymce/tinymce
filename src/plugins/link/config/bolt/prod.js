configure({
  sources: [
    source('amd', 'tinymce.plugins.link', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/link\//, '');
		})
  ]
});
