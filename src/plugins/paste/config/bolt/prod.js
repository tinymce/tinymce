configure({
  sources: [
    source('amd', 'tinymce.paste', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/paste\//, '');
		})
  ]
});
