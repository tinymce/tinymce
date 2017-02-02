configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.autolink.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/autolink\//, '');
		})
  ]
});

