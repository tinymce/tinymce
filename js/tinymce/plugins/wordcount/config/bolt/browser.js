configure({
  configs: [
    './prod.js'
  ],
	sources: [
		source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../tinymce'))
	]
});
