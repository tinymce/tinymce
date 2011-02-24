/*!
 * editor_plugin_src.js
 *
 * Email Output Plugin for TinyMCE v1.0
 * http://www.marketo.com/
 *
 * Copyright 2011, Marketo
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * In other words, leave this credit and do whatever you want with the rest
 *
 * Date: Sat Feb 13 22:33:48 2010 -0500
 */

(function(tinymce) {
  // Added for compression purposes
  var each = tinymce.each, undefined, TRUE = true, FALSE = false;

  // Override inline_styles setting to force TinyMCE to produce deprecated contents
	tinymce.onAddEditor.addToTop(function(tinymce, editor) {
		editor.settings.inline_styles = false;
	});

  // Add the legacy input code in here without the check for .inline_styles
  tinymce.onAddEditor.add(function(tinymce, ed) {
    var filters, fontSizes, dom, settings = ed.settings;

    fontSizes = tinymce.explode(settings.font_size_style_values);
  
    function replaceWithSpan(node, styles) {
      tinymce.each(styles, function(value, name) {
        if (value)
          dom.setStyle(node, name, value);
      });
  
      dom.rename(node, 'span');
    };
  
    filters = {
      font : function(dom, node) {
        replaceWithSpan(node, {
          backgroundColor : node.style.backgroundColor,
          color : node.color,
          fontFamily : node.face,
          fontSize : fontSizes[parseInt(node.size) - 1]
        });
      },
  
      u : function(dom, node) {
        replaceWithSpan(node, {
          textDecoration : 'underline'
        });
      },
  
      strike : function(dom, node) {
        replaceWithSpan(node, {
          textDecoration : 'line-through'
        });
      }
    };
  
    function convert(editor, params) {
      dom = editor.dom;
  
      if (settings.convert_fonts_to_spans) {
        tinymce.each(dom.select('font', params.node), function(node) {
          filters[node.nodeName.toLowerCase()](ed.dom, node);
        });
      }
    };
  
    ed.onPreProcess.add(convert);
  
    ed.onInit.add(function() {
      ed.selection.onSetContent.add(convert);
    });
  });	
	
  // Load plugin specific language pack
  tinymce.PluginManager.requireLangPack('emailoutput');

  // Create the legacy ouput plugin
	tinymce.create('tinymce.plugins.EmailOutput', {
		init : function(editor) {
			editor.onInit.add(function() {
				var alignElements = 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
					fontSizes = tinymce.explode(editor.settings.font_size_style_values),
					serializer = editor.serializer;

				// Override some internal formats to produce legacy elements and attributes
				editor.formatter.register({
					// Change alignment formats to use the deprecated align attribute
          alignleft : [
            {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'left'}},
            {selector : 'img,table', attributes : {align : 'left'}}
          ],

          aligncenter : [
            {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'center'}},
            {selector : 'img,table', attributes : {align : 'center'}}
          ],

          alignright : [
            {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'right'}},
            {selector : 'img,table', attributes : {align : 'right'}}
          ],

          alignfull : [
            {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'justify'}},
            {selector : 'img,table', attributes : {align : 'full'}}
          ],

					// Change the basic formatting elements to use deprecated element types
					bold : [{inline : 'b'},{inline : 'strong'}],
					italic : [{inline : 'i'},{inline : 'em'}],
					underline : {inline : 'u'},
					strikethrough : {inline : 'strike'}
				});

				// Force parsing of the serializer rules
				serializer._setup();

				// Check that deprecated elements are allowed if not add them
				each('b,i,u,strike'.split(','), function(name) {
					var rule = serializer.rules[name];

					if (!rule)
						serializer.addRules(name);
				});

				// Add the missing and depreacted align attribute for the serialization engine
				tinymce.each(alignElements.split(','), function(name) {
					var rule = serializer.rules[name], found;

					if (rule) {
						tinymce.each(rule.attribs, function(name, attr) {
							if (attr.name == 'align') {
								found = true;
								return false;
							}
						});

						if (!found)
							rule.attribs.push({name : 'align'});
					}
				});
			});

	    function handleIndentAction(command) {
	      var intentValue, indentUnit, value, dom = editor.dom, selection = editor.selection;

	      // Setup indent level
	      intentValue = editor.settings.indentation;
	      indentUnit = /[a-z%]+$/i.exec(intentValue);
	      intentValue = parseInt(intentValue);

	      if (!editor.queryCommandState('InsertUnorderedList') && !editor.queryCommandState('InsertOrderedList')) {
	        tinymce.each(selection.getSelectedBlocks(), function(element) {
	          if (command == 'emailoutdent') {
	            value = Math.max(0, parseInt(element.style.marginLeft || 0) - intentValue);
	            dom.setStyle(element, 'marginLeft', value ? value + indentUnit : '');
	          } else
	            dom.setStyle(element, 'marginLeft', (parseInt(element.style.marginLeft || 0) + intentValue) + indentUnit);
	        });
	      } else
	        execNativeCommand(command);
	    };

	    editor.addCommand('mceEmailIndent', function(command) {
        handleIndentAction('emailindent');
      });
      
      editor.addCommand('mceEmailOutdent', function(command) {
        handleIndentAction('emailoutdent');
      });
      
      // Listen for the onNodeChange event so that we can do special logic for the font size and font name drop boxes
      editor.onNodeChange.add(function(editor, control_manager) {
        var node, dom = editor.dom, selection = editor.selection;
        // This is the same as the function defined in EditorCommands except it is done whether inline_styles is true or not
        if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.marginLeft) > 0) {
          control_manager.setDisabled('emailoutdent', false);
          return;
        }

        if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.marginLeft) > 0) {
          control_manager.setDisabled('emailoutdent', false);
          return;
        }

        enabled = editor.queryCommandState('InsertUnorderedList') || editor.queryCommandState('InsertOrderedList') || (!editor.settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'));
        control_manager.setDisabled('emailoutdent', !enabled);

      });
      
      // Register example button
      editor.addButton('emailindent', {
        title : 'emailoutput.indent_desc',
        cmd : 'mceEmailIndent',
        'class' : 'mceIcon mce_indent'
      });

      // Register example button
      editor.addButton('emailoutdent', {
        title : 'emailoutput.outdent_desc',
        cmd : 'mceEmailOutdent',
        'class' : 'mceIcon mce_outdent'
      });

	  },

		getInfo : function() {
			return {
				longname : 'EmailOutput',
				author : 'Marketo Inc',
				authorurl : 'http://www.marketo.com',
				infourl : 'http://www.marketo.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('emailoutput', tinymce.plugins.EmailOutput);
})(tinymce);