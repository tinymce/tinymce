configure({
  configs: [
    './prod.js'
  ],
  sources: [
		source('amd', 'tinymce.core.test', '../../src/test/js/module', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/core\//, '');
		}),
    source('amd', 'tinymce.core.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox', '../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
