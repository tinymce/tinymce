configure({
  sources: [
    source('amd', 'tinymce.plugins.paste', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/paste\//, '');
		})
  ]
});
