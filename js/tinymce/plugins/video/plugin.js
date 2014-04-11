tinymce.PluginManager.requireLangPack('video');

tinymce.PluginManager.add('video', function(editor, url) {
	editor.addButton('video', {
        text: editor.translate('Insert video'),
        icon: 'media',
        onclick: function() {
            editor.windowManager.open({
                title: editor.translate('Insert video'),
                width: 500,
                height: 100,
                body: [
                    {type: 'combobox', name: 'url', label: editor.translate('Url'), tooltip: editor.translate('youtube_example')},
                    {
                        type: 'listbox',
                        name: 'size',
                        label: editor.translate('Format'),
                        'values': [
                            {text: '560 x 315', value:'560'},
                            {text: '640 x 360', value:'640'},
                            {text: '853 x 480', value:'853'},
                            {text: '1280 x 720', value:'1280'}
                        ]
                    }
                ],
                onsubmit: function(e) {
                    var videoId = getVideoId(e.data.url);

                    if (videoId == false) {
                        editor.windowManager.alert(editor.translate('youtube_invalidUrl'));
                        return;
                    }

                    var embedCode = generateIframeCode(videoId, e.data.size);

                    editor.execCommand('mceInsertContent', false, embedCode);
                }
            });
        }
	});

    /**
     * Generates the HTML Iframe Markup to include the YouTube Video.
     * @param           string      videoId
     * @param           string      size - Video Size
     * @return          string      Iframe HTML-Code
     */
    function generateIframeCode(videoId, size)
    {
        var factor = 0.5625;
        var x = size;
        var y = Math.round(x * factor);

        return '<div><iframe width="' + x + '" height="' + y + '" src="//www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe></div>';
    }

    /**
     * Returns the video id from a Youtube URL
     * @param       string          url
     * @return      string          Video ID
     * @example    https://www.youtube.com/watch?v=RVjYaFlPv-8 returns RVjYaFlPv-8
     */
    function getVideoId(url)
    {
        var regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regex);

        if (match && match[7]) {
            return match[7];
        } else {
            return false;
        }
    }
});
