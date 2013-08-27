Version 4.0.5 (2013-08-27)
	Added visuals for UL, LI and BR to visualblocks plugin. Patch contributed by Dan Ransom.
	Added new autosave_restore_when_empty option to autosave plugin. Enabled by default.
	Fixed bug where an exception was thrown when inserting images if valid_elements didn't include an ID for the image.
	Fixed bug where the advlist plugin wouldn't properly render the splitbutton controls.
	Fixed bug where visual blocks menu item wouldn't be marked checked when using the visualblocks_default_state option.
	Fixed bug where save button in save plugin wouldn't get properly enabled when contents was changed.
	Fixed bug where it was possible to insert images without any value for it's source attribute.
	Fixed bug where altering image attributes wouldn't add a new undo level.
	Fixed bug where import rules in CSS files wouldn't be properly imported by the importcss plugin.
	Fixed bug where selectors could be imported multiple times. Producing duplicate formats.
	Fixed bug where IE would throw exception if selection was changed while the editor was hidden.
	Fixed so complex rules like .class:before doesn't get imported by default in the importcss plugin.
	Fixed so it's possible to remove images by setting the src attribute to a blank value.
	Fixed so the save_enablewhendirty setting in the save plugin is enabled by default.
	Fixed so block formats drop down for classic mode can be translated properly using language packs.
	Fixed so hr menu item and toolbar button gets the same translation string.
	Fixed so bullet list toolbar button gets the correct translation from language packs.
	Fixed issue with Chrome logging CSS warning about border styling for combo boxes.
	Fixed issue with Chrome logging warnings about deprecated keyLocation property.
	Fixed issue where custom_elements would not remove the some of the default rules when cloning rules from div and span.
Version 4.0.4 (2013-08-21)
	Added new importcss plugin. Lets you auto import classes from CSS files similar to the 3.x behavior.
	Fixed bug where resize handles would be positioned incorrectly when inline element parent was using position: relative.
	Fixed bug where IE 8 would throw Unknown runtime error if the editor was placed within a P tag.
	Fixed bug where removing empty lists wouldn't produce blocks or brs where the old list was in the DOM.
	Fixed bug where IE 10 wouldn't properly initialize template dialog due to async loading issues.
	Fixed bug where autosave wouldn't properly display the warning about content not being saved due to isDirty changes.
	Fixed bug where it wouldn't be possible to type if a touchstart event was bound to the parent document.
	Fixed bug where code dialog in code plugin wouldn't wouldn't add a proper undo level.
	Fixed issue where resizing the editor in vertical mode would set the iframe width to a pixel value.
	Fixed issue with naming of insertdatetime settings. All are now prefixed with the plugin name.
	Fixed so an initial change event is fired when the user types the first character into the editor.
	Fixed so swf gets mapped to object element in media plugin. Enables embedding of flash with alternative poster.
Version 4.0.3 (2013-08-08)
	Added new code_dialog_width/code_dialog_height options to control code dialog size.
	Added missing pastetext button that works the same way as the pastetext menu item.
	Added missing smaller browse button for the classical smaller toolbars.
	Fixed bug where input method would produce new lines when inserting contents to an empty editor.
	Fixed bug where pasting single indented list items from Word would cause a JS exception.
	Fixed bug where applying block formats inside list elements in inline mode would apply them to whole document.
	Fixed bug where link editing in inline mode would cause exception on IE/WebKit.
	Fixed bug where IE 10 wouldn't render the last button group properly in inline mode due to wrapping.
	Fixed bug where localStorage initialization would fail on Firefox/Chrome with disabled support.
	Fixed bug where image elements would get an __mce id when undo/redo:ing to a level with image changes.
	Fixed bug where too long template names wouldn't fit the listbox in template plugin.
	Fixed bug where alignment format options would be marked disabled when forced_root_block was set to false.
	Fixed bug where UI listboxes such as fontsize, fontfamily wouldn't update properly when switching editors in inline mode.
	Fixed bug where the formats select box would mark the editable container DIV as a applied format in inline mode.
	Fixed bug where IE 7/8 would scroll to empty editors when initialized.
	Fixed bug where IE 7/8 wouldn't display previews of format options.
	Fixed bug where UI states wasn't properly updated after code was changed in the code dialog.
	Fixed bug with setting contents in IE would select all contents within the editor.
	Fixed so the undoManages transact function disables any other undo levels from being added while within the transaction.
	Fixed so sub/sup elements gets removed when the Clear formatting action is executed.
	Fixed so text/javascript type value get removed by default from script elements to match the HTML5 spec.
Version 4.0.2 (2013-07-18)
	Fixed bug where formatting using menus or toolbars wasn't possible on Opera 12.15.
	Fixed bug where IE 8 keyboard input would break after paste using the paste plugin.
	Fixed bug where IE 8 would throw an error when populating image size in image dialog.
	Fixed bug where image resizing wouldn't work properly on latest IE 10.0.9 version.
	Fixed bug where focus wasn't moved to the hovered menu button in a menubar container.
	Fixed bug where paste would produce an extra uneeded undo level on IE and Gecko.
	Fixed so anchors gets listed in the link dialog as they where in TinyMCE 3.x.
	Fixed so sub, sup and strike though gets passed through when pasting from Word.
	Fixed so Ctrl+P can be used to print the current document. Patch contributed by jashua212.
Version 4.0.1 (2013-06-26)
	Added new paste_as_text config option to force paste as plaintext mode.
	Added new pastetext menu item that lets you toggle paste as plain text mode on/off.
	Added new insertdatetime_element option to insertdatetime plugin. Enables HTML5 time element support.
	Added new spellchecker_wordchar_pattern option to allow configuration of language specific characters.
	Added new marker to formats menu displaying the formats used at the current selection/caret location.
	Fixed bug where the position of the text color picker would be wrong if you switched to fullscreen.
	Fixed bug where the link plugin would ask to add the mailto: prefix multiple times.
	Fixed bug where list outdent operation could produce empty list elements on specific selections.
	Fixed bug where element path wouldn't properly select parent elements on IE.
	Fixed bug where IE would sometimes throw an exception when extrancting the current selection range.
	Fixed bug where line feeds wasn't properly rendered in source view on IE.
	Fixed bug where word count wouldn't be properly rendered on IE 7.
	Fixed bug where menubuttons/listboxes would have an incorrect height on IE 7.
	Fixed bug where browser spellchecking was enabled while editing inline on IE 10.
	Fixed bug where spellchecker wouldn't properly find non English words.
	Fixed bug where deactivating inline editor instances would force padding-top: 0 on page body.
	Fixed bug where jQuery would initialize editors multiple times since it didn't check if the editor already existed.
	Fixed bug where it wasn't possible to paste contents on IE 10 in modern UI mode when paste filtering was enabled.
	Fixed bug where tabfocus plugin wouldn't work properly on inline editor instances.
	Fixed bug where fullpage plugin would clear the existing HTML head if contents where inserted into the editor.
	Fixed bug where deleting all table rows/columns in a table would cause an exception to be thrown on IE.
	Fixed so color button panels gets toggled on/off when activated/deactivated.
	Fixed so format menu items that can't be applied to the current selection gets disabled.
	Fixed so the icon parameter for addButton isn't automatically filled if a button text is provided.
	Fixed so image size fields gets updated when selecting a new image in the image dialog.
	Fixed so it doesn't load any language pack if the language option is set to "en".
	Fixed so ctrl+shift+z works as an alternative redo shortcut to match a common Mac OS X shortcut.
	Fixed so it's not possible to drag/drop in images in Gecko by default when paste plugin is enabled.
	Fixed so format menu item texts gets translated using the specified language pack.
	Fixed so the image dialog title is the same as the insert/edit image button text.
	Fixed so paste as plain text produces BR:s in PRE block and when forced_root_block is disabled.
Version 4.0 (2013-06-13)
	Added new insertdate_dateformat, insertdate_timeformat and insertdate_formats options to insertdatetime.
	Added new font_formats, fontsize_formats and block_formats options to configure fontselect, fontsizeselect and formatselect.
	Added new table_clone_elements option to table plugin. Enables you to specify what elements to clone when adding columns/rows.
	Added new auto detect logic for site and email urls in link plugin to match the logic found in 3.x.
	Added new getParams/setParams to WindowManager to make it easier to handle params to iframe based dialogs. Contributed by Ryan Demmer.
	Added new textcolor options that enables you to specify the colors you want to display. Contributed by Jennifer Arsenault.
	Added new external file support for link_list and image_list options. The file format is a simple JSON file.
	Added new "both" mode for the resize option. Enables resizing in both width and height.
	Added new paste_data_images option that allows you to enable/disable paste of data images.
	Added new fixed_toolbar_container option that allows you to add a fixed container for the inline toolbar.
	Fixed so font name, font size and block format select boxes gets updated with the current format.
	Fixed so the resizeTo/resizeBy methods for the theme are exposed as it as in 3.x.
	Fixed so the textcolor controls are splitbuttons as in 3.x. Patch contributed by toxalot/jashua212.
	Fixed bug where the theme content css wasn't loaded into the preview dialog.
	Fixed bug where the template description in template dialog wouldn't display the text correctly.
	Fixed bug where various UI elements wasn't properly removed when an editor instance was removed.
	Fixed bug where editing links in inline mode would fail on WebKit.
	Fixed bug where the pagebreak_separator option in the pagebreak plugin wasn't working properly.
	Fixed bug where the child panels of the float panel in inline mode wasn't properly placed.
	Fixed bug where the float panel children of windows wasn't position fixed.
	Fixed bug where the size of the ok button was hardcoded, caused issues with i18n.
	Fixed bug where single comment in editor would cause exceptions due to resolve path logic not detecting elements only.
	Fixed bug where switching alignment of tables in dialogs wouldn't properly remove existing alignments.
	Fixed bug where the table properties dialog would show columns/rows textboxes.
	Fixed bug where jQuery wasn't used instead of Sizzle in the jQuery version of TinyMCE.
	Fixed bug where setting resize option to false whouldn't properly render the word count.
	Fixed bug where table row type change would produce multiple table section elements.
	Fixed bug where table row type change on multiple rows would add them in incorrect order.
	Fixed bug where fullscreen plugin would maximize the editor on resize after toggling it off.
	Fixed bug where context menu would be position at an incorrect coordinate in inline mode.
	Fixed bug where inserting lists in inline mode on IE would produce errors since the body would be converted.
	Fixed bug where the body couldn't be styled properly in custom content_css files.
	Fixed bug where template plugins menu item would override the image menu item.
	Fixed bug where IE 7-8 would render the text inside inputs at the wrong vertical location.
	Fixed bug where IE configured to IE 7 compatibility mode wouldn't render the icons properly.
	Fixed bug where editor.focus wouldn't properly fire the focusin event on WebKit.
	Fixed bug where some keyboard shortcuts wouldn't work on IE 8.
	Fixed bug where the undo state wasn't updated until the end of a typing level.
	Fixed bug where keyboard shortcuts on Mac OS wasn't working correctly.
	Fixed bug where empty inline elements would be created when toggling formatting of in empty block.
	Fixed bug where applying styles on WebKit would fail in inline mode if the user released the mouse button outside the body.
	Fixed bug where the visual aids menu item wasn't selected if the editor was empty.
	Fixed so the isDirty/isNotDirty states gets updated to true/false on save() and change events.
	Fixed so skins have separate CSS files for inline and iframe mode.
	Fixed so menus and tool tips gets constrained to the current viewport.
	Fixed so an error is thrown if users load jQuery after the jQuery version of TinyMCE.
	Fixed so the filetype for media dialog passes out media instead of image as file type.
	Fixed so it's possible to disable the toolbar by setting it to false.
	Fixed so autoresize plugin isn't initialized when the editor is in inline mode.
	Fixed so the inline editing toolbar will be rendered below elements if it doesn't fit above it.
Version 4.0b3 (2013-05-15)
	Added new optional advanced tab for image dialog with hspace, vspace, border and style.
	Added new change event that gets fired when undo levels are added to editor instances.
	Added new removed_menuitems option enables you to list menu items to remove from menus.
	Added new external_plugins option enables you to specify external locations for plugins.
	Added new language_url option enables you to specify an external location for the language pack.
	Added new table toolbar control that displays a menu for inserting/editing menus.
	Fixed bug where IE 10 wouldn't load files properly from cache.
	Fixed bug where image dialog wouldn't properly remove width/height if blanked.
	Fixed bug where all events wasn't properly unbound when editor instances where removed.
	Fixed bug where data- attributes wasn't working properly in the SaxParser.
	Fixed bug where Gecko wouldn't properly render broken images.
	Fixed bug where Gecko wouldn't produce the same error dialog on paste as other browsers.
	Fixed bug where is wasn't possible to prevent execCommands in beforeExecCommand event.
	Fixed bug where the fullpage_hide_in_source_view option wasn't working in the fullpage plugin.
	Fixed bug where the WindowManager close method wouldn't properly close the top most window.
	Fixed bug where it wasn't possible to paste in IE 10 due to JS exception.
	Fixed bug where tab key didn't move to the right child control in tabpanels.
	Fixed bug where enter inside a form would focus the first button like control in TinyMCE.
	Fixed bug where it would match scripts that looked like the tinymce base directory incorrectly.
	Fixed bug where the spellchecker wouldn't properly toggle off the spellcheck mode if no errors where found.
	Fixed bug in searchreplace plugin where it would remove all spans instead of the marker spans.
	Fixed issue where selector wouldn't disable existing mode setting.
	Fixed so it's easier to configure the menu and menubar.
	Fixed so bodyId/bodyClass is applied to preview as it's done to the editor iframe.
Version 4.0b2 (2013-04-24)
	Added new rel_list option to link plugin. Enables you to specify values for a rel drop down.
	Added new target_list option to link plugin. Enables you to add to or disable the link targets.
	Added new link_list option to link plugin. Enables you to specify a list of links to pick from.
	Added new image_list option to image pluigin. Enables you to specify a list of images to pick from.
	Added new textcolor plugin. This plugin holds the text color and text background color buttons.
	Fixed bug where alignment of images wasn't working properly on Firefox.
	Fixed bug where IE 8 would throw error when inserting a table.
	Fixed bug where IE 8 wouldn't render the element path properly.
	Fixed bug where old IE versions would render a red focus border.
	Fixed bug where old IE versions would render a frameborder for iframes.
	Fixed bug where WebKit wouldn't properly open the cell properties dialog on edge case selection.
	Fixed bug where charmap wouldn't correctly render all characters in grid.
	Fixed bug where link dialog wouldn't update the link text properly.
	Fixed bug where the focus/blur states on inline editors wasn't handled correctly on IE.
	Fixed bug where IE would throw "unknown error" exception sometimes in ForceBlocks logic.
	Fixed bug where IE would't properly render disabled buttons in button groups.
	Fixed bug where tab key wouldn't properly move to next input field in dialogs.
	Fixed bug where resize handles for tables and images would appear at wrong positions on IE 8.
	Fixed bug where dialogs would produce stack overflow if title was wider than content.
	Fixed bug with table cell/row menu items being enabled even if no cell was selected.
	Fixed so the text to display is after the URL field in the link dialog.
	Fixed so the width setting applies to the editor panel in modern theme.
	Fixed so it's easier to make custom icons for buttons using plain old images.
Version 4.0b1 (2013-04-11)
	Added new node.js based build process used uglify, amdlc, jake etc.
	Added new package.json to enable easy installation of dependent npm packages used for building.
	Added new link, image, charmap, anchor, code, hr plugins since these are now moved out of the theme.
	Rewrote all plugins and themes from scratch so they match the new UI framework.
	Replaced all events to use the more common <target>.on/off(<event>) methods instead of <target>.<event>.add/remove.
	Rewrote the TinyMCE core to use AMD style modules. Gets compiled to an inline library using amdlc.
	Rewrote all core logic to pass jshint rules. Each file has specific jshint rules.
	Removed all IE6 specific logic since 4.x will no longer support such an old browser.
	Reworked the file names and directory structure of the whole project to be more similar to other JS projects.
	Replaced tinymce.util.Cookie with tinymce.util.LocalStorage. Fallback to userData for IE 7 native localStorage for the rest.
	Replaced the old 3.x UI with a new modern UI framework.
	Removed "simple" theme and added new "modern" theme.
	Removed advhr, advimage, advlink, iespell, inlinepopups, xhtmlxtras and style plugins.
	Updated Sizzle to the latest version.
