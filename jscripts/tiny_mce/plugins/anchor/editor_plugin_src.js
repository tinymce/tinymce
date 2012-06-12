(function() {
    var each = tinymce.each, extend = tinymce.extend, Event = tinymce.dom.Event;
    var Node = tinymce.html.Node;
    var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;
	
    tinymce.create('tinymce.plugins.AnchorPlugin', {
        init : function(ed, url) {
            this.editor = ed, self = this;
            
            function isAnchor(n) {
                return ed.dom.is(n, 'a.mceItemAnchor, span.mceItemAnchor') || (n = ed.dom.getParent(n, 'A') && ed.dom.is(n, 'a.mceItemAnchor'));
            }
            
            ed.settings.allow_html_in_named_anchor = true;

            // Register commands
            ed.addCommand('mceInsertAnchor', function() {
                var se = ed.selection, n = se.getNode();

                ed.windowManager.open({
                    url : url + '/anchor.htm',
                    width : 320 + parseInt(ed.getLang('advanced.anchor_delta_width', 0)),
                    height : 90 + parseInt(ed.getLang('advanced.anchor_delta_height', 0)),
                    inline : true
                }, {
                    plugin_url : url
                });
            });
            // Register buttons
            ed.addButton('anchor', {
                title : 'advanced.anchor_desc',
                cmd : 'mceInsertAnchor'
            });
            
            ed.onNodeChange.add( function(ed, cm, n, co) {                
                cm.setActive('anchor', isAnchor(n));
                
                ed.dom.removeClass(ed.dom.select('span.mceItemAnchor.mceItemSelected'), 'mceItemSelected');
                
                if (isAnchor(n) && n.nodeName == 'SPAN') {                 
                    ed.dom.addClass(n, 'mceItemSelected');
                }
            });
            
            ed.onKeyDown.add(function(ed, e) {				
                if (e.keyCode == BACKSPACE || e.keyCode == DELETE) {                                        
                    var s = ed.selection;
                    
                    if (ed.dom.is(s.getNode(), 'span.mceItemAnchor')) {
                        ed.dom.remove(s.getNode());
                        e.preventDefault();
                    }
                    
                    if (!s.isCollapsed() && ed.dom.is(s.getNode(), 'a.mceItemAnchor')) {
                        ed.formatter.remove('link');
                        e.preventDefault();
                    }
                }
            });

            ed.onInit.add(function() {                
                // Display "a#name" instead of "span" in element path
                if (ed.theme && ed.theme.onResolveName) {
                    ed.theme.onResolveName.add( function(theme, o) {
                        var n = o.node, v;

                        if (o.name === 'span' && /mceItemAnchor/.test(n.className)) {
                            v = ed.dom.getAttrib(n, 'data-mce-name') || n.id;
                        }

                        if (o.name === 'a' && !n.href && (n.name || n.id)) {
                            v = n.name || n.id;
                        }
                        
                        if (v) {
                            o.name = 'a#' + v;
                        }
                    });
                }

                ed.dom.loadCSS(url + "/css/content.css");
            });
            
            
            // Pre-init			
            ed.onPreInit.add(function() {                	
                // Convert anchor elements to image placeholder
                ed.parser.addNodeFilter('a', function(nodes) {
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        var node = nodes[i];
    						
                        if (!node.firstChild &&!node.attr('href') && (node.attr('name') || node.attr('id'))) {
                            self._createAnchorSpan(node);
                        }
                    }
                });

                // Convert image placeholders to anchor elements
                ed.serializer.addNodeFilter('span', function(nodes, name, args) {
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        var node = nodes[i];
                        if (/mceItemAnchor/.test(node.attr('class'))) {
                            self._restoreAnchor(node, args);
                        }
                    }
                });
            });
            
            function _cancelResize() {
                each(ed.dom.select('span.mceItemAnchor'), function(n) {
                    n.onresizestart = function() {
                        return false;
                    };
                
                    n.onbeforeeditfocus = function() {
                        return false;
                    };
                });
            };
            
            ed.onSetContent.add(function() {                              
                if (tinymce.isIE) {
                    _cancelResize();
                }
            });
            
            ed.onGetContent.add(function() {                              
                if (tinymce.isIE) {
                    _cancelResize();
                }
            });
        },

        _restoreAnchor : function(n) {
            var self = this, ed = this.editor, at, v, node, text;

            if (!n.parent)
                return;

            // get data
            at = {
                name    : n.attr('data-mce-name'),
                id      : n.attr('id')
            };
			
            node = new Node('a', 1);

            node.attr(at);
            n.replace(node);
        },
        
        _createAnchorSpan: function(n) {
            var self = this, ed = this.editor, dom = ed.dom, at = {};

            if (!n.parent)
                return;
			
            at = {
                'data-mce-name'   : n.attr('name'),
                id                : n.attr('id')
            };
			
            // get classes as array
            var classes = [];

            if (n.attr('class')) {
                classes = n.attr('class').split(' ');
            }
        
            if (classes.indexOf('mceItemAnchor') == -1) {
                // add identifier
                classes.push('mceItemAnchor');
            }

            var span = new Node('span', 1);
			
            span.attr(tinymce.extend(at, {
                'class'  : classes.join(' ')
                }));
            
            var text = new Node('#text', 3);
            text.value = '<!--anchor-->';
            
            span.append(text);

            n.replace(span);
        },

        getInfo : function() {
            return {
                longname : 'Anchor',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }
    });
    // Register plugin
    tinymce.PluginManager.add('anchor', tinymce.plugins.AnchorPlugin);
})();