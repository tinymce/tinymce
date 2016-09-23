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


    function fillAndSubmitWindowForm(data) {
        var win = Utils.getFrontmostWindow();

        win.fromJSON(data);
        win.find('form')[0].submit();
        win.close();
    }


    function stripAttribs($el, attr) {
        if (tinymce.isArray(attr)) {
            tinymce.each(attr, function(attr) {
                stripAttribs($el, attr);
            });
            return;
        }

        $el.removeAttr(attr);
        $el.find('['+attr+']').removeAttr(attr);
    }


    test("mceTocProps", function() {
        editor.getBody().innerHTML =
            '<div class="tst-toc" data-mce-toc="1" data-mce-toc-title="ToC" data-mce-toc-maxlevel="4" data-mce-toc-prefix="tst">' +
                '<div>Table of Contents</div>' +
                '<ul class="tst-toc-lvl-1">' +
                    '<li>' +
                        '<ul class="tst-toc-lvl-2">' +
                            '<li></li>' +
                        '</ul>' +
                    '</li>' +
                '</ul>' +
            '</div>'
        ;

        Utils.setSelection('li', 0);
        editor.execCommand('mceTocProps');

        deepEqual(Utils.getFrontmostWindow().toJSON(), {
                maxlevel: "4",
                prefix: "tst",
                title: "ToC"
            }, 
            "Properties dialog populates values from HTML ToC attributes"
        );
    });


    test("mceTocProps - test with custom properties", function() {
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
        editor.execCommand('mceTocProps');

        fillAndSubmitWindowForm({
            maxlevel: "2",
            prefix: "ins",
            title: "ToC"
        });

        var $toc = editor.$('[data-mce-toc]');

        ok($toc.length, "ToC inserted");
        equal($toc.attr('contentEditable'), "false", "cE=false");


        stripAttribs($toc, ['style', 'data-mce-style', 'data-mce-href']);


        equal($toc[0].outerHTML, 
            '<div class="ins-toc" contenteditable="false" data-mce-toc="1" data-mce-selected="1" data-mce-toc-title="ToC" data-mce-toc-maxlevel="2" data-mce-toc-prefix="ins">' +
                '<div class="ins-toc-title">ToC</div>' +
                '<ul class="ins-toc-lvl-1">' +
                    '<li>' +
                        '<a href="#h1">H1</a>' +
                        '<ul class="ins-toc-lvl-2">' +
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

        var $toc = editor.$('[data-mce-toc]');

        ok($toc.length, "ToC inserted");
        equal($toc.attr('contentEditable'), "false", "cE=false");

        // strip extra attributes
       stripAttribs($toc, ['style', 'data-mce-style', 'data-mce-href']);

        equal($toc[0].outerHTML, 
            '<div class="mce-toc" contenteditable="false" data-mce-toc="1" data-mce-selected="1" data-mce-toc-title="Table of Contents" data-mce-toc-maxlevel="3" data-mce-toc-prefix="mce">' +
                '<div class="mce-toc-title">Table of Contents</div>' +
                '<ul class="mce-toc-lvl-1">' +
                    '<li>' +
                        '<a href="#h1">H1</a>' +
                        '<ul class="mce-toc-lvl-2">' +
                            '<li><a href="#h2">H2</a></li>' +
                        '</ul>' +
                    '</li>' +
                    '<li>' +
                        '<a href="#h3">H1</a>' +
                        '<ul class="mce-toc-lvl-2">' +
                            '<li>' +
                                '<ul class="mce-toc-lvl-3">' +
                                    '<li><a href="#h4">H3</a></li>' +
                                '</ul>' +
                            '</li>' +
                        '</ul>' +
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

        var $toc = editor.$('[data-mce-toc]');


        // strip extra attributes
        stripAttribs($toc, ['style', 'data-mce-style', 'data-mce-href']);

        equal($toc[0].innerHTML, 
            '<div class="mce-toc-title">Table of Contents</div>' +
            '<ul class="mce-toc-lvl-1">' +
                '<li>' +
                    '<a href="#h1">H1</a>' +
                '</li>' +
                '<li>' +
                    '<a href="#h2">H1</a>' +
                '</li>' +
                '<li>' +
                    '<a href="#h3">H1</a>' +
                    '<ul class="mce-toc-lvl-2">' +
                        '<li><a href="#h4">H2</a></li>' +
                    '</ul>' +
                '</li>' +
            '</ul>',
            "no surprises in ToC structure"
        );
    });
    


    test("mceUpdateToc", function() {
        var $toc;

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
        editor.execCommand('mceTocProps');

        fillAndSubmitWindowForm({
            maxlevel: "2"
        });

        $toc = editor.$('[data-mce-toc]');

        equal($toc.find('.mce-toc-title').text(), "Table of Contents", 
            "default properties used were user defined are missing");

        // add one more heading
        editor.getBody().innerHTML += '<h1 id="h5">H1</h1><p>This is some text.</p>';


        Utils.setSelection('li', 0);
        editor.execCommand('mceUpdateToc');
        $toc = editor.$('[data-mce-toc]');

        equal($toc.find('ul.mce-toc-lvl-1 a[href="#h5"]').length, 1, "ToC has been successfully updated");
    });

}());