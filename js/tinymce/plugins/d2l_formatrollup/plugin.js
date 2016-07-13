/*global tinymce:true */

tinymce.PluginManager.add('d2l_formatrollup', function(editor) {
    editor.addMenuItem('custom_numlist', {
        text: 'Ordered List',
        context: 'format',
        icon: 'numlist',
        cmd: 'InsertOrderedList'
    });
    editor.addMenuItem('custom_indent', {
        text: 'Indent',
        context: 'format',
        icon: 'indent',
        cmd: 'Indent'
    });
    editor.addMenuItem('custom_outdent', {
        text: 'Outdent',
        context: 'format',
        icon: 'outdent',
        cmd: 'Outdent'
    });
    editor.addMenuItem('custom_alignleft', {
        text: 'Align Left',
        context: 'format',
        icon: 'alignleft',
        cmd: 'JustifyLeft'
    });
    editor.addMenuItem('custom_alignright', {
        text: 'Align Right',
        context: 'format',
        icon: 'alignright',
        cmd: 'JustifyRight'
    });
    editor.addMenuItem('custom_aligncenter', {
        text: 'Align Center',
        context: 'format',
        icon: 'aligncenter',
        cmd: 'JustifyCenter'
    });
    editor.addMenuItem('custom_alignjustify', {
        text: 'Align Full',
        context: 'format',
        icon: 'alignjustify',
        cmd: 'JustifyFull'
    });
    editor.addMenuItem('custom_ltr', {
        text: 'Left to Right',
        context: 'format',
        icon: 'ltr',
        cmd: 'mceDirectionLTR'
    });
    editor.addMenuItem('custom_rtl', {
        text: 'Right to Left',
        context: 'format',
        icon: 'rtl',
        cmd: 'mceDirectionRTL'
    });

    editor.addButton('d2l_formatrollup',
              {type   : 'MenuButton',
               icon   : 'arrowdown',
               title  : 'Format Stuff',
                menu   : [editor.menuItems.custom_numlist,
                          editor.menuItems.custom_indent,
                          editor.menuItems.custom_outdent,
                          editor.menuItems.custom_alignleft,
                          editor.menuItems.custom_alignright,
                          editor.menuItems.custom_aligncenter,
                          editor.menuItems.custom_alignjustify,
                          editor.menuItems.custom_ltr,
                          editor.menuItems.custom_rtl]
       });
});

