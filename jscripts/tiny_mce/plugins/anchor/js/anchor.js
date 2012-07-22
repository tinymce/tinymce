var AnchorDialog = {
    preInit : function() {
        tinyMCEPopup.requireLangPack();
    },
    
    init : function() {
        var ed = tinyMCEPopup.editor, action, n, v, f = document.forms[0];
        
        tinyMCEPopup.resizeToInnerSize();
        
        n = ed.selection.getNode();

        if (n.nodeName == 'SPAN' && /mceItemAnchor/.test(n.className)) {
            v = ed.dom.getAttrib(n, 'data-mce-name') || ed.dom.getAttrib(n, 'id');
        } else {
            n = ed.dom.getParent(n, 'A');
            v = ed.dom.getAttrib(n, 'name') || ed.dom.getAttrib(n, 'id');
        }

        if (v) {
            this.action = 'update';	
            f.anchorName.value = v;
        }
        
        f.insert.value = ed.getLang(n ? 'update' : 'insert');
    },

    update : function() {
        var ed = tinyMCEPopup.editor, n, attrib, v = document.forms[0].anchorName.value;

        if (!v || !/^[a-z][a-z0-9\-\_:\.]*$/i.test(v)) {
            tinyMCEPopup.alert('anchor_dlg.anchor_invalid');
            return;
        }

        tinyMCEPopup.restoreSelection();

        var aRule = ed.schema.getElementRule('a');
        if (!aRule || aRule.attributes.name) {
            attrib = 'name';
        } else {
            attrib = 'id';
        }
                
        n = ed.selection.getNode();
        
        var at = {
            'class' :  'mceItemAnchor' 
        };

        if (n.nodeName == 'SPAN' && /mceItemAnchor/.test(n.className)) {
            if (attrib == 'name') {
                attrib = 'data-mce-name';
            }
            
            at[attrib] = v;
            
            ed.dom.setAttribs(n, at); 
            ed.undoManager.add();
        } else {
            if (n = ed.dom.getParent(n, 'A')) {
                at[attrib] = v;
                
                ed.dom.setAttribs(n, at); 
                ed.undoManager.add();
            } else {                                
                // caret
                if (ed.selection.isCollapsed()) {                        
                    if (attrib == 'name') {
                        attrib = 'data-mce-name';
                    }
            
                    at[attrib] = v;                   
                    ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('span', at, '<!--anchor-->')); // Opera needs the span to have some content...
                } else {                    
                    at[attrib] = v;
                    
                    ed.execCommand('mceInsertLink', false, '#mce_temp_url#', {
                        skip_undo : 1
                    });
                    
                    at.href = at['data-mce-href'] = null;
            
                    tinymce.each(ed.dom.select('a[href="#mce_temp_url#"]'), function(link) {
                        ed.dom.setAttribs(link, at);
                    });
                }

                ed.nodeChanged();
            }
        }

        tinyMCEPopup.close();
    }
};
AnchorDialog.preInit();
tinyMCEPopup.onInit.add(AnchorDialog.init, AnchorDialog);
