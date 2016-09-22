/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('toc', function(editor) {
    var defaultOptions = {
        title: "Table of Contents",
        maxLevel: 3,
        autorefresh: false
    };
    var options = tinymce.extend({}, defaultOptions);


    function isToc(elm) {
        return editor.dom.is(elm, '.mce-toc') && editor.getBody().contains(elm);
    }


    function onSubmit(e) {
        options = tinymce.extend(options, e.data);
        insertToc();
    }


    function generateSelector(maxLevel) {
        var selector = [];
        for (var i = 1; i <= maxLevel; i++) {
            selector.push('h' + i);
        }
        return selector.join(',');
    }


    function getHeaders(levels) {
        var selector = generateSelector(levels);
        return tinymce.map(editor.$(selector), function(h) {
            if (!h.id) {
                h.id = editor.dom.uniqueId();
            }
            return {
                id: h.id,
                level: +h.nodeName.replace(/^H/, ''),
                title: editor.$.text(h)
            };
        });
    }


    function generateTocHtml(maxLevel, title) {
        var html = generateTocContentHtml.apply(null, arguments);
        return html ? '<div class="mce-toc" contenteditable="false">' + html + '</div>' : '';
    }


    function generateTocContentHtml(maxLevel, title) {
        var html = '';
        var headers = getHeaders(maxLevel);
        var i, ii, h, prevLevel = 0, nextLevel;

        title = tinymce.trim(title);

        if (!headers.length) {
            return;
        }

        if (tinymce.trim(title)) {
            html += '<div class="mce-toc-title">' + title + '</div>';
        }

        for (i = 0; i < headers.length; i++) {
            h = headers[i];
            nextLevel = headers[i+1] && headers[i+1].level;

            for (ii = prevLevel; ii < h.level; ii++) {
                html += '<ul class="mce-toc-lvl-' + (ii+1) + '"><li>';
            }

            html += '<a href="#' + h.id + '">' + h.title + '</a>';

            for (ii = h.level; ii > nextLevel; ii--) {
                html += '</li></ul><li>';
            }

            if (!nextLevel) {
                html += '</ul>';
            }

            prevLevel = h.level;
        }

        return html;
    }



    function insertToc() {
        var tocElm;
        var maxLevel = options.maxLevel;
        var title = options.title;

        tocElm = editor.$('.mce-toc');

        editor.undoManager.transact(function() {
            if (tocElm.length) {
                editor.dom.setHTML(tocElm[0], generateTocContentHtml(maxLevel, title));
            } else {
                editor.insertContent(generateTocHtml(maxLevel, title));
            }
        });
    }


    function openInsertTocDialog() {
        var levels = '1,2,3,4,5,6,7,8,9';

        editor.windowManager.open({
            title: "Table of Contents",
            bodyType: 'tabpanel',
            body: [
                {
                    title: 'Properties',
                    type: 'form',
                    padding: 20,
                    data: options,
                    items: [
                        {
                            label: 'Title',
                            name: 'title',
                            type: 'textbox'
                        },
                        {
                            label: 'Show levels',
                            name: 'maxLevel',
                            type: 'listbox',
                            text: options.maxLevel,
                            values: tinymce.map(levels.split(','), function(i) {
                                return { text: i, value: i };
                            })
                        }
                    ]
                },
            ],

            onsubmit: onSubmit
        });
    }

    editor.contentStyles.push(
        '.mce-toc {' +
            'padding: 10px;'+
        '}' +

        '.mce-toc-title {' +
            'font-size: 1.5em;' +
            'font-weight: bold;' +
        '}' +

        '.mce-toc li {' +
            'list-style-type: none;' +
        '}' +

        '.mce-toc-lvl-1 {' +
            'padding-left: 0px;' +
        '}'
    );


    editor.addCommand('mceInsertToc', function() {
        insertToc();
    });


    editor.addButton('tocupdate', {
        title: 'Update',
        onclick: insertToc,
        icon: 'redo'
    });


    editor.addContextToolbar(
        isToc,
        'tocupdate'
    );

    editor.addMenuItem('toc', {
        text: 'Table of Contents',
        icon: 'print',
        context: 'insert',
        onclick: openInsertTocDialog
    });
});
