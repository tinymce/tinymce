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
    var $ = editor.$;

    // these options will be saved as data attributes on each toc
    // so only lowercase letters allowed, underscores are ok
    var defaults = {
        title: "Table of Contents",
        maxlevel: "3",
        prefix: 'mce'
    };

    function isToc(elm) {
        return editor.dom.is(elm, '[data-mce-toc]') && editor.getBody().contains(elm);
    }


    function generateSelector(maxlevel) {
        var selector = [];

        maxlevel = parseInt(maxlevel, 10);
        if (isNaN(maxlevel)) {
            maxlevel = defaults.maxlevel;
        }

        for (var i = 1; i <= maxlevel; i++) {
            selector.push('h' + i);
        }
        return selector.join(',');
    }


    function prepareHeaders(maxlevel) {
        var selector = generateSelector(maxlevel);
        return tinymce.map($(selector), function(h) {
            if (!h.id) {
                h.id = editor.dom.uniqueId();
            }
            return {
                id: h.id,
                level: parseInt(h.nodeName.replace(/^H/i, ''), 10),
                title: $.text(h)
            };
        });
    }


    function generateTocHtml(o) {
        var html = generateTocContentHtml(o);
        return html ? '<div id="__mcetoc" class="' + o.prefix + '-toc" contenteditable="false" data-mce-toc="1">' + html + '</div>' : '';
    }


    function generateTocContentHtml(o) {
        var html = '';
        var headers = prepareHeaders(o.maxlevel);
        var i, ii, h, prevLevel = 0, nextLevel;
        var title = tinymce.trim(editor.dom.encode(o.title));

        if (!headers.length) {
            return;
        }

        if (title) {
            html += '<div class="' + o.prefix + '-toc-title"';
            html += ' style="font-size: 1.5em; font-weight: bold;">' + title + '</div>';
        }

        for (i = 0; i < headers.length; i++) {
            h = headers[i];
            nextLevel = headers[i+1] && headers[i+1].level;

            for (ii = prevLevel; ii < h.level; ii++) {
                html += '<ul class="' + o.prefix + '-toc-lvl-' + (ii+1) + '"><li style="list-style-type: none">';
            }

            html += '<a href="#' + h.id + '">' + h.title + '</a>';

            for (ii = h.level; ii > nextLevel; ii--) {
                html += '</li></ul><li style="list-style-type: none">';
            }

            if (!nextLevel) {
                html += '</ul>';
            }

            prevLevel = h.level;
        }

        return html;
    }


    function getSelectedToc() {
        return editor.dom.getParent(editor.selection.getStart(), '[data-mce-toc]') || null;
    }


    function getTocOptions(tocElm) {
        var o = {};
        if (tocElm) {
            tinymce.each(defaults, function(val, key) {
                o[key] = editor.dom.getAttrib(tocElm, 'data-mce-toc-' + key);
            });
            return o;
        } else {
            return null;
        }

    }


    function updateTocOptions(tocElm, o) {
        tinymce.each(defaults, function(val, key) {
            editor.dom.setAttrib(tocElm, 'data-mce-toc-' + key, editor.dom.encode(o[key]));
        });
    }


    function updateToc(tocElm, o) {
        var tocElm = tocElm || getSelectedToc();
        var o = o || getTocOptions(tocElm);

        if (o) {
            editor.undoManager.transact(function () {
                editor.dom.setHTML(tocElm, generateTocContentHtml(o));
                editor.dom.setAttrib(tocElm, 'class', o.prefix + '-toc');

                updateTocOptions(tocElm, o);
            });
        }
    }


    function insertToc(o) {
        editor.undoManager.transact(function() {
            var $tocElm;
            editor.insertContent(generateTocHtml(o));
            $tocElm = $('#__mcetoc');
            $tocElm.removeAttr('id');

            updateTocOptions($tocElm[0], o);
        });
    }


    function openInsertTocDialog() {
        var levels = '1,2,3,4,5,6,7,8,9';
        var tocElm = getSelectedToc();
        var options = getTocOptions(tocElm) || defaults;

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
                            name: 'maxlevel',
                            type: 'listbox',
                            text: options.maxlevel,
                            values: tinymce.map(levels.split(','), function(i) {
                                return { text: i, value: i };
                            })
                        },
                        {
                            label: 'className Prefix',
                            name: 'prefix',
                            type: 'textbox'
                        }
                    ]
                },
            ],

            onsubmit: function(e) {
                if (tocElm) {
                    updateToc(tocElm, e.data);
                } else {
                    insertToc(e.data);
                }
            }
        });
    }


    editor.on('PreProcess', function(e) {
        $('[data-mce-toc][contenteditable=false]', e.node).removeAttr('contentEditable');
    });

    editor.on('SetContent', function() {
        $('[data-mce-toc]').attr('contentEditable', false);
    });


    editor.addCommand('mceInsertToc', function() {
        insertToc(defaults);
    });


    editor.addCommand('mceUpdateToc', function() {
        updateToc();
    });


    editor.addButton('tocupdate', {
        title: 'Update',
        cmd: 'mceUpdateToc',
        icon: 'redo'
    });


    editor.addContextToolbar(
        isToc,
        'tocupdate'
    );

    editor.addMenuItem('toc', {
        text: 'Table of Contents',
        context: 'insert',
        onclick: openInsertTocDialog
    });
});
