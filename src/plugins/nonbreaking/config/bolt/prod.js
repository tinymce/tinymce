configure({
  sources: [
    source('amd', 'tinymce.nonbreaking', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/nonbreaking\//, '');
		})
  ]
});
