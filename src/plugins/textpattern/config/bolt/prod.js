configure({
  sources: [
    source('amd', 'tinymce.textpattern', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/textpattern\//, '');
		})
  ]
});
