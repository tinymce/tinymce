configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.textpattern.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/textpattern\//, '');
		})
  ]
});

