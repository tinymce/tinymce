configure({
  sources: [
    source('amd', 'tinymce.plugins.textpattern', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/textpattern\//, '');
		})
  ]
});
