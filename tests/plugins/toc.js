(function() {
    module("tinymce.plugins.ToC", {
        setupModule: function() {
            QUnit.stop();

            tinymce.init({
                selector: "textarea",
                add_unload_trigger: false,
                skin: false,
                indent: false,
                plugins: 'toc',
                toc_class: 'tst-toc',
                toc_depth: 2,
                toc_header: 'h3',
                init_instance_callback: function(ed) {
                    window.editor = ed;
                    QUnit.start();
                }
            });
        },
        teardown: function() {
            var win = Utils.getFrontmostWindow();

            if (win) {
                win.close();
            }
        }
    });


    function stripAttribs($el, attr) {
        if (tinymce.isArray(attr)) {
            tinymce.each(attr, function(attr) {
                stripAttribs($el, attr);
            });
            return;
        }

        $el.removeAttr(attr);
        $el.find('[' + attr + ']').removeAttr(attr);
    }

	function trimBr(html) {
		return html.replace(/<br data-mce-bogus="1" \/>/g, '');
	}

    test("mceInsertToc", function() {
        editor.getBody().innerHTML =
            '<h1 id="h1">H1</h1>' +
            '<p>This is some text.</p><br />' +
            '<h2 id="h2">H2</h2>' +
            '<p>This is some text.</p><hr />' +
            '<h1 id="h3">H1</h1>' +
            '<p>This is some text.</p>' +
            '<h3 id="h4">H3</h3>' +
            '<p>This is some text.</p>'
        ;

        Utils.setSelection('h1', 0);
        editor.execCommand('mceInsertToc');

        var $toc = editor.$('.tst-toc');

        ok($toc.length, "ToC inserted");
        equal($toc.attr('contentEditable'), "false", "cE=false");

        ok(!$toc.find('ul ul ul').length, "no levels beyond 2 are included");

        stripAttribs($toc, ['data-mce-href', 'data-mce-selected']);

        equal(trimBr(Utils.normalizeHtml($toc[0].outerHTML)),
            '<div class="tst-toc" contenteditable="false">' +
                '<h3 contenteditable="true">Table of Contents</h3>' +
                '<ul>' +
                    '<li>' +
                        '<a href="#h1">H1</a>' +
                        '<ul>' +
                            '<li><a href="#h2">H2</a></li>' +
                        '</ul>' +
                    '</li>' +
                    '<li>' +
                        '<a href="#h3">H1</a>' +
                    '</li>' +
                '</ul>' +
            '</div>',
            "no surprises in ToC structure"
        );
    });

    test("mceInsertToc - flat structure", function() {
        editor.getBody().innerHTML =
            '<h1 id="h1">H1</h1>' +
            '<p>This is some text.</p><br />' +
            '<h1 id="h2">H1</h1>' +
            '<p>This is some text.</p><hr />' +
            '<h1 id="h3">H1</h1>' +
            '<p>This is some text.</p>' +
            '<h2 id="h4">H2</h2>' +
            '<p>This is some text.</p>'
        ;

        Utils.setSelection('h1', 0);
        editor.execCommand('mceInsertToc');

        var $toc = editor.$('.tst-toc');

        stripAttribs($toc, ['data-mce-href', 'data-mce-selected']);

        equal(trimBr(Utils.normalizeHtml($toc[0].innerHTML)),
            '<h3 contenteditable="true">Table of Contents</h3>' +
            '<ul>' +
                '<li>' +
                    '<a href="#h1">H1</a>' +
                '</li>' +
                '<li>' +
                    '<a href="#h2">H1</a>' +
                '</li>' +
                '<li>' +
                    '<a href="#h3">H1</a>' +
                    '<ul>' +
                        '<li><a href="#h4">H2</a></li>' +
                    '</ul>' +
                '</li>' +
            '</ul>',
            "no surprises in ToC structure"
        );
    });

    test("mceUpdateToc", function() {
        editor.getBody().innerHTML =
            '<h1 id="h1">H1</h1>' +
            '<p>This is some text.</p><br />' +
            '<h2 id="h2">H2</h2>' +
            '<p>This is some text.</p><hr />' +
            '<h1 id="h3">H1</h1>' +
            '<p>This is some text.</p>' +
            '<h3 id="h4">H3</h3>' +
            '<p>This is some text.</p>'
        ;

        Utils.setSelection('h1', 0);
        editor.execCommand('mceInsertToc');

        // add one more heading
        editor.$().append('<h1 id="h5">H1</h1><p>This is some text.</p>');

        Utils.setSelection('li', 0);
        editor.execCommand('mceUpdateToc');

        equal(editor.$('.tst-toc > ul a[href="#h5"]').length, 1,
            "ToC has been successfully updated");
    });

    test("Misc.", function() {
        var contents, $toc;

        editor.getBody().innerHTML =
            '<h2 id="h1">H2</h2>' +
            '<p>This is some text.</p><br />' +
            '<h2 id="h2">H2</h2>' +
            '<p>This is some text.</p>' +
            '<h3 id="h4">H3</h3>' +
            '<p>This is some text.</p>'
        ;

        Utils.setSelection('h2', 0);
        editor.execCommand('mceInsertToc');

        contents = editor.getContent();
        ok(!/contenteditable/i.test(contents), "cE stripped for getContent()");

        editor.setContent(contents);

        $toc = editor.$('.tst-toc');
        deepEqual($toc.attr('contentEditable'), "false", "cE added back after setContent()");
        deepEqual($toc.find(':first-child').attr('contentEditable'), "true",
            "cE added back to title after setContent()");

        stripAttribs($toc, ['data-mce-href', 'data-mce-selected']);

        equal(trimBr(Utils.normalizeHtml($toc[0].innerHTML)),
            '<h3 contenteditable="true">Table of Contents</h3>' +
            '<ul>' +
                '<li>' +
                    '<a href="#h1">H2</a>' +
                '</li>' +
                '<li>' +
                    '<a href="#h2">H2</a>' +
                '</li>' +
            '</ul>',
            "the largest available header becomes first ToC level"
        );
    });

})();