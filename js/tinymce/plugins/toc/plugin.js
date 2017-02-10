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
    var opts;

    var defs = {
        depth: 3,
        headerTag: 'h2',
        className: 'mce-toc'
    };

    var guid = function(prefix) {
        var counter = 0;
        return function() {
            var guid = new Date().getTime().toString(32);
            return prefix + guid + (counter++).toString(32);
        };
    };

    var tocId = guid('mcetoc_');


    function isValidTag(tagName) {
        return editor.schema.isValidChild('div', tagName);
    }


    function isToc(elm) {
        return elm && editor.dom.is(elm, '.' + opts.className) && editor.getBody().contains(elm);
    }


    function toggleState() {
        var self = this;

        self.disabled(editor.readonly || !haveHeaders());

        editor.on('LoadContent SetContent change', function() {
            self.disabled(editor.readonly || !haveHeaders());
        });
    }


    function generateSelector(depth) {
        var i, selector = [];
        for (i = 1; i <= depth; i++) {
            selector.push('h' + i);
        }
        return selector.join(',');
    }


    function haveHeaders() {
        return !!(opts && prepareHeaders(opts).length);
    }


    function prepareHeaders(o) {
        var selector = generateSelector(o.depth);
        var headers = $(selector);

        // if headerTag is one of h1-9, we need to filter it out from the set
        if (headers.length && /^h[1-9]$/i.test(o.headerTag)) {
            headers = headers.filter(function(i, el) {
                return !editor.dom.hasClass(el.parentNode, o.className);
            });
        }

        return tinymce.map(headers, function(h) {
            if (!h.id) {
                h.id = tocId();
            }
            return {
                id: h.id,
                level: parseInt(h.nodeName.replace(/^H/i, ''), 10),
                title: $.text(h)
            };
        });
    }


    function getMinLevel(headers) {
        var i, minLevel = 9;

        for (i = 0; i < headers.length; i++) {
            if (headers[i].level < minLevel) {
                minLevel = headers[i].level;
            }

            // do not proceed if we have reached absolute minimum
            if (minLevel == 1) {
                return minLevel;
            }
        }
        return minLevel;
    }


    function generateTitle(tag, title) {
        var openTag = '<' + tag + ' contenteditable="true">';
        var closeTag = '</' + tag + '>';
        return openTag + editor.dom.encode(title) + closeTag;
    }


    function generateTocHtml(o) {
        var html = generateTocContentHtml(o);
        return '<div class="' + o.className + '" contenteditable="false">' + html + '</div>';
    }


    function generateTocContentHtml(o) {
        var html = '';
        var headers = prepareHeaders(o);
        var prevLevel = getMinLevel(headers) - 1;
        var i, ii, h, nextLevel;

        if (!headers.length) {
            return '';
        }

        html += generateTitle(o.headerTag, tinymce.translate("Table of Contents"));

        for (i = 0; i < headers.length; i++) {
            h = headers[i];
            nextLevel = headers[i + 1] && headers[i + 1].level;

            if (prevLevel === h.level) {
                html += '<li>';
            } else {
                for (ii = prevLevel; ii < h.level; ii++) {
                    html += '<ul><li>';
                }
            }

            html += '<a href="#' + h.id + '">' + h.title + '</a>';

            if (nextLevel === h.level || !nextLevel) {
                html += '</li>';

                if (!nextLevel) {
                    html += '</ul>';
                }
            } else {
                for (ii = h.level; ii > nextLevel; ii--) {
                    html += '</li></ul><li>';
                }
            }

            prevLevel = h.level;
        }

        return html;
    }


    editor.on('PreInit', function() {
        var s = editor.settings;
        var depth = parseInt(s.toc_depth, 10) || 0;

        opts = {
            depth: depth >= 1 && depth <= 9 ? depth : defs.depth,
            headerTag: isValidTag(s.toc_header) ? s.toc_header : defs.headerTag,
            className: s.toc_class ? editor.dom.encode(s.toc_class) : defs.className
        };
    });


    editor.on('PreProcess', function(e) {
        var $tocElm = $('.' + opts.className, e.node);
        if ($tocElm.length) {
            $tocElm.removeAttr('contentEditable');
            $tocElm.find('[contenteditable]').removeAttr('contentEditable');
        }
    });


    editor.on('SetContent', function() {
        var $tocElm = $('.' + opts.className);
        if ($tocElm.length) {
            $tocElm.attr('contentEditable', false);
            $tocElm.children(':first-child').attr('contentEditable', true);
        }
    });

    var isEmptyOrOffscren = function (nodes) {
        return !nodes.length || editor.dom.getParents(nodes[0], '.mce-offscreen-selection').length > 0;
    };

    editor.addCommand('mceInsertToc', function() {
        var $tocElm = $('.' + opts.className);

        if (isEmptyOrOffscren($tocElm)) {
            editor.insertContent(generateTocHtml(opts));
        } else {
            editor.execCommand('mceUpdateToc');
        }
    });


    editor.addCommand('mceUpdateToc', function() {
        var $tocElm = $('.' + opts.className);
        if ($tocElm.length) {
            editor.undoManager.transact(function () {
                $tocElm.html(generateTocContentHtml(opts));
            });
        }
    });


    editor.addButton('toc', {
        tooltip: 'Table of Contents',
        cmd: 'mceInsertToc',
        icon: 'toc',
        onPostRender: toggleState
    });

    editor.addButton('tocupdate', {
        tooltip: 'Update',
        cmd: 'mceUpdateToc',
        icon: 'reload'
    });

    editor.addContextToolbar(
        isToc,
        'tocupdate'
    );

    editor.addMenuItem('toc', {
        text: "Table of Contents",
        context: 'insert',
        cmd: 'mceInsertToc',
        onPostRender: toggleState
    });
});
