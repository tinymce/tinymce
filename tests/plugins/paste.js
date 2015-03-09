module("tinymce.plugins.Paste", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			indent: false,
			plugins: 'paste',
			setup: function(ed) {
				ed.on('NodeChange', false);
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	},

	teardown: function() {
		delete editor.settings.paste_remove_styles_if_webkit;
		delete editor.settings.paste_retain_style_properties;
		delete editor.settings.paste_enable_default_filters;
		delete editor.settings.paste_data_images;
		delete editor.settings.paste_webkit_styles;
	}
});

test("Paste simple text content", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	editor.focus();
	rng.setStart(editor.getBody().firstChild.firstChild, 1);
	rng.setEnd(editor.getBody().firstChild.firstChild, 3);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: 'TEST'});
	equal(editor.getContent(), '<p>1TEST4</p>');
});

test("Paste styled text content", function() {
	var rng = editor.dom.createRng();

	editor.settings.paste_remove_styles_if_webkit = false;

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 1);
	rng.setEnd(editor.getBody().firstChild.firstChild, 3);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<strong><em><span style="color: red;">TEST</span></em></strong>'});
	equal(editor.getContent(), '<p>1<strong><em><span style="color: red;">TEST</span></em></strong>4</p>');
});

test("Paste paragraph in paragraph", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 1);
	rng.setEnd(editor.getBody().firstChild.firstChild, 3);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<p>TEST</p>'});
	equal(editor.getContent(), '<p>1</p><p>TEST</p><p>4</p>');
});

test("Paste paragraphs in complex paragraph", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p><strong><em>1234</em></strong></p>');
	rng.setStart(editor.dom.select('em,i')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('em,i')[0].firstChild, 3);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<p>TEST 1</p><p>TEST 2</p>'});
	equal(editor.getContent(), '<p><strong><em>1</em></strong></p><p>TEST 1</p><p>TEST 2</p><p><strong><em>4</em></strong></p>');
});

test("Paste Word fake list", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 12"><meta name="Originator" content="Microsoft Word 12"><link rel="File-List" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_filelist.xml"><link rel="themeData" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_themedata.thmx"><link rel="colorSchemeMapping" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_colorschememapping.xml"><!--[if gte mso 9]><xml> <w:WordDocument> <w:View>Normal</w:View> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:HyphenationZone>21</w:HyphenationZone> <w:PunctuationKerning/> <w:ValidateAgainstSchemas/> <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid> <w:IgnoreMixedContent>false</w:IgnoreMixedContent> <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText> <w:DoNotPromoteQF/> <w:LidThemeOther>SV</w:LidThemeOther> <w:LidThemeAsian>X-NONE</w:LidThemeAsian> <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript> <w:Compatibility> <w:BreakWrappedTables/> <w:SnapToGridInCell/> <w:WrapTextWithPunct/> <w:UseAsianBreakRules/> <w:DontGrowAutofit/> <w:SplitPgBreakAndParaMark/> <w:DontVertAlignCellWithSp/> <w:DontBreakConstrainedForcedTables/> <w:DontVertAlignInTxbx/> <w:Word11KerningPairs/> <w:CachedColBalance/> </w:Compatibility> <w:BrowserLevel>MicrosoftInternetExplorer4</w:BrowserLevel> <m:mathPr> <m:mathFont m:val="Cambria Math"/> <m:brkBin m:val="before"/> <m:brkBinSub m:val="&#45;-"/> <m:smallFrac m:val="off"/> <m:dispDef/> <m:lMargin m:val="0"/> <m:rMargin m:val="0"/> <m:defJc m:val="centerGroup"/> <m:wrapIndent m:val="1440"/> <m:intLim m:val="subSup"/> <m:naryLim m:val="undOvr"/> </m:mathPr></w:WordDocument> </xml><![endif]--><!--[if gte mso 9]><xml> <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="true" DefSemiHidden="true" DefQFormat="false" DefPriority="99" LatentStyleCount="267"> <w:LsdException Locked="false" Priority="0" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Normal"/> <w:LsdException Locked="false" Priority="9" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="heading 1"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 2"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 3"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 4"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 5"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 6"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 7"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 8"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 9"/> <w:LsdException Locked="false" Priority="39" Name="toc 1"/> <w:LsdException Locked="false" Priority="39" Name="toc 2"/> <w:LsdException Locked="false" Priority="39" Name="toc 3"/> <w:LsdException Locked="false" Priority="39" Name="toc 4"/> <w:LsdException Locked="false" Priority="39" Name="toc 5"/> <w:LsdException Locked="false" Priority="39" Name="toc 6"/> <w:LsdException Locked="false" Priority="39" Name="toc 7"/> <w:LsdException Locked="false" Priority="39" Name="toc 8"/> <w:LsdException Locked="false" Priority="39" Name="toc 9"/> <w:LsdException Locked="false" Priority="35" QFormat="true" Name="caption"/> <w:LsdException Locked="false" Priority="10" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Title"/> <w:LsdException Locked="false" Priority="1" Name="Default Paragraph Font"/> <w:LsdException Locked="false" Priority="11" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtitle"/> <w:LsdException Locked="false" Priority="22" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Strong"/>  <w:LsdException Locked="false" Priority="20" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Emphasis"/>  <w:LsdException Locked="false" Priority="59" SemiHidden="false" UnhideWhenUsed="false" Name="Table Grid"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Placeholder Text"/>  <w:LsdException Locked="false" Priority="1" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="No Spacing"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 1"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 1"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 1"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 1"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 1"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Revision"/>  <w:LsdException Locked="false" Priority="34" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="List Paragraph"/>  <w:LsdException Locked="false" Priority="29" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Quote"/>  <w:LsdException Locked="false" Priority="30" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Quote"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 1"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 1"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 1"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 1"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 1"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 1"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 1"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 2"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 2"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 2"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 2"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 2"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 2"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 2"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 2"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 2"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 2"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 2"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 3"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 3"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 3"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 3"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 3"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 3"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 3"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 3"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 3"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 3"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 3"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 3"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 3"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 4"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 4"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 4"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 4"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 4"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 4"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 4"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 4"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 4"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 4"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 4"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 4"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 4"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 4"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 5"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 5"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 5"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 5"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 5"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 5"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 5"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 5"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 5"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 5"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 5"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 5"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 5"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 5"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 6"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 6"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 6"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 6"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 6"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 6"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 6"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 6"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 6"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 6"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 6"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 6"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 6"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 6"/>  <w:LsdException Locked="false" Priority="19" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Emphasis"/>  <w:LsdException Locked="false" Priority="21" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Emphasis"/>  <w:LsdException Locked="false" Priority="31" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Reference"/>  <w:LsdException Locked="false" Priority="32" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Reference"/>  <w:LsdException Locked="false" Priority="33" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Book Title"/>  <w:LsdException Locked="false" Priority="37" Name="Bibliography"/>  <w:LsdException Locked="false" Priority="39" QFormat="true" Name="TOC Heading"/>  </w:LatentStyles> </xml><![endif]--><style> <!-- /* Font Definitions */ @font-face {font-family:Wingdings; panose-1:5 0 0 0 0 0 0 0 0 0; mso-font-charset:2; mso-generic-font-family:auto; mso-font-pitch:variable; mso-font-signature:0 268435456 0 0 -2147483648 0;} @font-face {font-family:Wingdings; panose-1:5 0 0 0 0 0 0 0 0 0; mso-font-charset:2; mso-generic-font-family:auto; mso-font-pitch:variable; mso-font-signature:0 268435456 0 0 -2147483648 0;} @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-1610611985 1073750139 0 0 159 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:""; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoPapDefault {mso-style-type:export-only; margin-bottom:10.0pt; line-height:115%;} @page Section1 {size:595.3pt 841.9pt; margin:70.85pt 70.85pt 70.85pt 70.85pt; mso-header-margin:35.4pt; mso-footer-margin:35.4pt; mso-paper-source:0;} div.Section1 {page:Section1;} /* List Definitions */ @list l0 {mso-list-id:1742563504; mso-list-type:hybrid; mso-list-template-ids:-524928352 69009409 69009411 69009413 69009409 69009411 69009413 69009409 69009411 69009413;} @list l0:level1 {mso-level-number-format:bullet; mso-level-text:?; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt; font-family:Symbol;} ol {margin-bottom:0cm;} ul {margin-bottom:0cm;} --> </style><!--[if gte mso 10]> <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-qformat:yes; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin-top:0cm; mso-para-margin-right:0cm; mso-para-margin-bottom:10.0pt; mso-para-margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-fareast-language:EN-US;} </style> <![endif]--> <p class="MsoListParagraphCxSpFirst" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 1</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 2</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 3</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 4</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 5</p> <p class="MsoListParagraphCxSpLast" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 6</p>'});
	equal(editor.getContent(), '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>');

	editor.settings.paste_retain_style_properties = 'border';

	rng = editor.dom.createRng();
	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<p class="ListStyle" style="margin-top:0cm;margin-right:0cm;margin-bottom:3.0pt;margin-left:18.0pt;mso-add-space:auto;text-align:justify;text-indent:-18.0pt;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><span lang="DE" style="font-family:Verdana;mso-fareast-font-family:Verdana;mso-bidi-font-family:Verdana;color:black"><span style="mso-list:Ignore">\u25CF<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><span lang="DE" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black">Item&nbsp; Spaces.<o:p></o:p></span></p>'});
	equal(editor.getContent(), '<ul><li>Item&nbsp; Spaces.</li></ul>');

	rng = editor.dom.createRng();
	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<p class="ListStyle" style="margin-left:36.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level1 lfo1;tab-stops:list 36.0pt"><span lang="EN-US" style="color:black;mso-ansi-language:EN-US"><span style="mso-list:Ignore">1.<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span lang="EN-US" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black;mso-ansi-language:EN-US">Version 7.0</span><span lang="EN-US" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black;mso-ansi-language:EN-US">:<o:p></o:p></span></p>'});
	equal(editor.getContent(), '<ol><li>Version 7.0:</li></ol>');
});

test("Paste Word fake list before BR", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertContent', false, '<br>a');

	rng = editor.dom.createRng();
	rng.setStart(editor.getBody().firstChild, 0);
	rng.setEnd(editor.getBody().firstChild, 0);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 12"><meta name="Originator" content="Microsoft Word 12"><link rel="File-List" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_filelist.xml"><link rel="themeData" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_themedata.thmx"><link rel="colorSchemeMapping" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_colorschememapping.xml"><!--[if gte mso 9]><xml> <w:WordDocument> <w:View>Normal</w:View> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:HyphenationZone>21</w:HyphenationZone> <w:PunctuationKerning/> <w:ValidateAgainstSchemas/> <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid> <w:IgnoreMixedContent>false</w:IgnoreMixedContent> <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText> <w:DoNotPromoteQF/> <w:LidThemeOther>SV</w:LidThemeOther> <w:LidThemeAsian>X-NONE</w:LidThemeAsian> <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript> <w:Compatibility> <w:BreakWrappedTables/> <w:SnapToGridInCell/> <w:WrapTextWithPunct/> <w:UseAsianBreakRules/> <w:DontGrowAutofit/> <w:SplitPgBreakAndParaMark/> <w:DontVertAlignCellWithSp/> <w:DontBreakConstrainedForcedTables/> <w:DontVertAlignInTxbx/> <w:Word11KerningPairs/> <w:CachedColBalance/> </w:Compatibility> <w:BrowserLevel>MicrosoftInternetExplorer4</w:BrowserLevel> <m:mathPr> <m:mathFont m:val="Cambria Math"/> <m:brkBin m:val="before"/> <m:brkBinSub m:val="&#45;-"/> <m:smallFrac m:val="off"/> <m:dispDef/> <m:lMargin m:val="0"/> <m:rMargin m:val="0"/> <m:defJc m:val="centerGroup"/> <m:wrapIndent m:val="1440"/> <m:intLim m:val="subSup"/> <m:naryLim m:val="undOvr"/> </m:mathPr></w:WordDocument> </xml><![endif]--><!--[if gte mso 9]><xml> <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="true" DefSemiHidden="true" DefQFormat="false" DefPriority="99" LatentStyleCount="267"> <w:LsdException Locked="false" Priority="0" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Normal"/> <w:LsdException Locked="false" Priority="9" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="heading 1"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 2"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 3"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 4"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 5"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 6"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 7"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 8"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 9"/> <w:LsdException Locked="false" Priority="39" Name="toc 1"/> <w:LsdException Locked="false" Priority="39" Name="toc 2"/> <w:LsdException Locked="false" Priority="39" Name="toc 3"/> <w:LsdException Locked="false" Priority="39" Name="toc 4"/> <w:LsdException Locked="false" Priority="39" Name="toc 5"/> <w:LsdException Locked="false" Priority="39" Name="toc 6"/> <w:LsdException Locked="false" Priority="39" Name="toc 7"/> <w:LsdException Locked="false" Priority="39" Name="toc 8"/> <w:LsdException Locked="false" Priority="39" Name="toc 9"/> <w:LsdException Locked="false" Priority="35" QFormat="true" Name="caption"/> <w:LsdException Locked="false" Priority="10" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Title"/> <w:LsdException Locked="false" Priority="1" Name="Default Paragraph Font"/> <w:LsdException Locked="false" Priority="11" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtitle"/> <w:LsdException Locked="false" Priority="22" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Strong"/>  <w:LsdException Locked="false" Priority="20" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Emphasis"/>  <w:LsdException Locked="false" Priority="59" SemiHidden="false" UnhideWhenUsed="false" Name="Table Grid"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Placeholder Text"/>  <w:LsdException Locked="false" Priority="1" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="No Spacing"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 1"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 1"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 1"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 1"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 1"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Revision"/>  <w:LsdException Locked="false" Priority="34" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="List Paragraph"/>  <w:LsdException Locked="false" Priority="29" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Quote"/>  <w:LsdException Locked="false" Priority="30" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Quote"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 1"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 1"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 1"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 1"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 1"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 1"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 1"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 2"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 2"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 2"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 2"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 2"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 2"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 2"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 2"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 2"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 2"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 2"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 3"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 3"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 3"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 3"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 3"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 3"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 3"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 3"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 3"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 3"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 3"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 3"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 3"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 4"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 4"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 4"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 4"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 4"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 4"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 4"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 4"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 4"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 4"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 4"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 4"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 4"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 4"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 5"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 5"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 5"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 5"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 5"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 5"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 5"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 5"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 5"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 5"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 5"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 5"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 5"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 5"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 6"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 6"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 6"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 6"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 6"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 6"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 6"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 6"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 6"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 6"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 6"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 6"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 6"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 6"/>  <w:LsdException Locked="false" Priority="19" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Emphasis"/>  <w:LsdException Locked="false" Priority="21" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Emphasis"/>  <w:LsdException Locked="false" Priority="31" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Reference"/>  <w:LsdException Locked="false" Priority="32" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Reference"/>  <w:LsdException Locked="false" Priority="33" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Book Title"/>  <w:LsdException Locked="false" Priority="37" Name="Bibliography"/>  <w:LsdException Locked="false" Priority="39" QFormat="true" Name="TOC Heading"/>  </w:LatentStyles> </xml><![endif]--><style> <!-- /* Font Definitions */ @font-face {font-family:Wingdings; panose-1:5 0 0 0 0 0 0 0 0 0; mso-font-charset:2; mso-generic-font-family:auto; mso-font-pitch:variable; mso-font-signature:0 268435456 0 0 -2147483648 0;} @font-face {font-family:Wingdings; panose-1:5 0 0 0 0 0 0 0 0 0; mso-font-charset:2; mso-generic-font-family:auto; mso-font-pitch:variable; mso-font-signature:0 268435456 0 0 -2147483648 0;} @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-1610611985 1073750139 0 0 159 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:""; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoPapDefault {mso-style-type:export-only; margin-bottom:10.0pt; line-height:115%;} @page Section1 {size:595.3pt 841.9pt; margin:70.85pt 70.85pt 70.85pt 70.85pt; mso-header-margin:35.4pt; mso-footer-margin:35.4pt; mso-paper-source:0;} div.Section1 {page:Section1;} /* List Definitions */ @list l0 {mso-list-id:1742563504; mso-list-type:hybrid; mso-list-template-ids:-524928352 69009409 69009411 69009413 69009409 69009411 69009413 69009409 69009411 69009413;} @list l0:level1 {mso-level-number-format:bullet; mso-level-text:?; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt; font-family:Symbol;} ol {margin-bottom:0cm;} ul {margin-bottom:0cm;} --> </style><!--[if gte mso 10]> <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-qformat:yes; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin-top:0cm; mso-para-margin-right:0cm; mso-para-margin-bottom:10.0pt; mso-para-margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-fareast-language:EN-US;} </style> <![endif]--> <p class="MsoListParagraphCxSpFirst" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 1</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 2</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 3</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 4</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 5</p> <p class="MsoListParagraphCxSpLast" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 6</p>'});

	equal(editor.getContent(), '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul><p><br />a</p>');
});

test("Paste Word fake lists interrupted by header", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<p class=MsoListParagraphCxSpFirst style=\'text-indent:-.25in;mso-list:l0 level1 lfo1\'><![if !supportLists]><span style=\'font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol\'><span style=\'mso-list:Ignore\'>·<span style=\'font:7.0pt "Times New Roman"\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List before heading A<o:p></o:p></p>  <p class=MsoListParagraphCxSpLast style=\'text-indent:-.25in;mso-list:l0 level1 lfo1\'><![if !supportLists]><span style=\'font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol\'><span style=\'mso-list:Ignore\'>·<span style=\'font:7.0pt "Times New Roman"\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List before heading B<o:p></o:p></p>  <h1>heading<o:p></o:p></h1>  <p class=MsoListParagraphCxSpFirst style=\'text-indent:-.25in;mso-list:l0 level1 lfo1\'><![if !supportLists]><span style=\'font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol\'><span style=\'mso-list:Ignore\'>·<span style=\'font:7.0pt "Times New Roman"\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List after heading A<o:p></o:p></p>  <p class=MsoListParagraphCxSpLast style=\'text-indent:-.25in;mso-list:l0 level1 lfo1\'><![if !supportLists]><span style=\'font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol\'><span style=\'mso-list:Ignore\'>·<span style=\'font:7.0pt "Times New Roman"\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List after heading B<o:p></o:p></p>'});
	equal(editor.getContent(), '<ul><li>List before heading A</li><li>List before heading B</li></ul><h1>heading</h1><ul><li>List after heading A</li><li>List after heading B</li></ul>');
});

test("Paste list like paragraph and list", function() {
	editor.setContent('');

	editor.execCommand('mceInsertClipboardContent', false, {
		content: '<p class=MsoNormal><span style=\'font-size:10.0pt;line-height:115%;font-family:"Trebuchet MS","sans-serif";color:#666666\'>ABC. X<o:p></o:p></span></p><p class=MsoListParagraph style=\'text-indent:-.25in;mso-list:l0 level1 lfo1\'><![if !supportLists]><span style=\'mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin\'><span style=\'mso-list:Ignore\'>1.<span style=\'font:7.0pt "Times New Roman"\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Y</p>'
	});

	equal(editor.getContent(), '<p>ABC. X</p><ol><li>Y</li></ol>');
});

test("Paste list like paragraph and list (disabled)", function() {
	editor.setContent('');

	editor.settings.paste_convert_word_fake_lists = false;

	editor.execCommand('mceInsertClipboardContent', false, {
		content: '<p class=MsoNormal><span style=\'font-size:10.0pt;line-height:115%;font-family:"Trebuchet MS","sans-serif";color:#666666\'>ABC. X<o:p></o:p></span></p><p class=MsoListParagraph style=\'text-indent:-.25in;mso-list:l0 level1 lfo1\'><![if !supportLists]><span style=\'mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin\'><span style=\'mso-list:Ignore\'>1.<span style=\'font:7.0pt "Times New Roman"\'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Y</p>'
	});

	delete editor.settings.paste_convert_word_fake_lists;

	equal(editor.getContent(), '<p>ABC. X</p><p>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y</p>');
});

test("Paste Word table", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 12"><meta name="Originator" content="Microsoft Word 12"><link rel="File-List" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_filelist.xml"><link rel="themeData" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_themedata.thmx"><link rel="colorSchemeMapping" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_colorschememapping.xml"><!--[if gte mso 9]><xml> <w:WordDocument> <w:View>Normal</w:View> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:HyphenationZone>21</w:HyphenationZone> <w:PunctuationKerning/> <w:ValidateAgainstSchemas/> <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid> <w:IgnoreMixedContent>false</w:IgnoreMixedContent> <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText> <w:DoNotPromoteQF/> <w:LidThemeOther>SV</w:LidThemeOther> <w:LidThemeAsian>X-NONE</w:LidThemeAsian> <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript> <w:Compatibility> <w:BreakWrappedTables/> <w:SnapToGridInCell/> <w:WrapTextWithPunct/> <w:UseAsianBreakRules/> <w:DontGrowAutofit/> <w:SplitPgBreakAndParaMark/> <w:DontVertAlignCellWithSp/> <w:DontBreakConstrainedForcedTables/> <w:DontVertAlignInTxbx/> <w:Word11KerningPairs/> <w:CachedColBalance/> </w:Compatibility> <w:BrowserLevel>MicrosoftInternetExplorer4</w:BrowserLevel> <m:mathPr> <m:mathFont m:val="Cambria Math"/> <m:brkBin m:val="before"/> <m:brkBinSub m:val="&#45;-"/> <m:smallFrac m:val="off"/> <m:dispDef/> <m:lMargin m:val="0"/> <m:rMargin m:val="0"/> <m:defJc m:val="centerGroup"/> <m:wrapIndent m:val="1440"/> <m:intLim m:val="subSup"/> <m:naryLim m:val="undOvr"/> </m:mathPr></w:WordDocument> </xml><![endif]--><!--[if gte mso 9]><xml> <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="true" DefSemiHidden="true" DefQFormat="false" DefPriority="99" LatentStyleCount="267"> <w:LsdException Locked="false" Priority="0" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Normal"/> <w:LsdException Locked="false" Priority="9" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="heading 1"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 2"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 3"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 4"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 5"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 6"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 7"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 8"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 9"/> <w:LsdException Locked="false" Priority="39" Name="toc 1"/> <w:LsdException Locked="false" Priority="39" Name="toc 2"/> <w:LsdException Locked="false" Priority="39" Name="toc 3"/> <w:LsdException Locked="false" Priority="39" Name="toc 4"/> <w:LsdException Locked="false" Priority="39" Name="toc 5"/> <w:LsdException Locked="false" Priority="39" Name="toc 6"/> <w:LsdException Locked="false" Priority="39" Name="toc 7"/> <w:LsdException Locked="false" Priority="39" Name="toc 8"/> <w:LsdException Locked="false" Priority="39" Name="toc 9"/> <w:LsdException Locked="false" Priority="35" QFormat="true" Name="caption"/> <w:LsdException Locked="false" Priority="10" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Title"/> <w:LsdException Locked="false" Priority="1" Name="Default Paragraph Font"/> <w:LsdException Locked="false" Priority="11" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtitle"/> <w:LsdException Locked="false" Priority="22" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Strong"/>  <w:LsdException Locked="false" Priority="20" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Emphasis"/>  <w:LsdException Locked="false" Priority="59" SemiHidden="false" UnhideWhenUsed="false" Name="Table Grid"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Placeholder Text"/>  <w:LsdException Locked="false" Priority="1" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="No Spacing"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 1"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 1"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 1"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 1"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 1"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Revision"/>  <w:LsdException Locked="false" Priority="34" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="List Paragraph"/>  <w:LsdException Locked="false" Priority="29" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Quote"/>  <w:LsdException Locked="false" Priority="30" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Quote"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 1"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 1"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 1"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 1"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 1"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 1"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 1"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 2"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 2"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 2"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 2"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 2"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 2"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 2"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 2"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 2"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 2"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 2"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 3"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 3"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 3"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 3"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 3"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 3"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 3"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 3"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 3"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 3"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 3"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 3"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 3"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 4"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 4"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 4"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 4"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 4"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 4"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 4"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 4"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 4"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 4"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 4"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 4"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 4"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 4"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 5"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 5"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 5"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 5"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 5"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 5"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 5"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 5"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 5"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 5"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 5"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 5"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 5"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 5"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 6"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 6"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 6"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 6"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 6"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 6"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 6"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 6"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 6"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 6"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 6"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 6"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 6"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 6"/>  <w:LsdException Locked="false" Priority="19" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Emphasis"/>  <w:LsdException Locked="false" Priority="21" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Emphasis"/>  <w:LsdException Locked="false" Priority="31" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Reference"/>  <w:LsdException Locked="false" Priority="32" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Reference"/>  <w:LsdException Locked="false" Priority="33" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Book Title"/>  <w:LsdException Locked="false" Priority="37" Name="Bibliography"/>  <w:LsdException Locked="false" Priority="39" QFormat="true" Name="TOC Heading"/>  </w:LatentStyles> </xml><![endif]--><style> <!-- /* Font Definitions */ @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-1610611985 1073750139 0 0 159 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:""; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoPapDefault {mso-style-type:export-only; margin-bottom:10.0pt; line-height:115%;} @page Section1 {size:595.3pt 841.9pt; margin:70.85pt 70.85pt 70.85pt 70.85pt; mso-header-margin:35.4pt; mso-footer-margin:35.4pt; mso-paper-source:0;} div.Section1 {page:Section1;} --> </style><!--[if gte mso 10]> <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-qformat:yes; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin-top:0cm; mso-para-margin-right:0cm; mso-para-margin-bottom:10.0pt; mso-para-margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-fareast-language:EN-US;} table.MsoTableGrid {mso-style-name:"Table Grid"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-priority:59; mso-style-unhide:no; border:solid black 1.0pt; mso-border-themecolor:text1; mso-border-alt:solid black .5pt; mso-border-themecolor:text1; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-border-insideh:.5pt solid black; mso-border-insideh-themecolor:text1; mso-border-insidev:.5pt solid black; mso-border-insidev-themecolor:text1; mso-para-margin:0cm; mso-para-margin-bottom:.0001pt; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-fareast-language:EN-US;} </style> <![endif]--> <table class="MsoTableGrid" style="border: medium none ; margin-left: 36pt; border-collapse: collapse;" border="1" cellpadding="0" cellspacing="0"> <tbody><tr style=""> <td style="border: 1pt solid black; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpFirst" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 1</p> </td> <td style="border-style: solid solid solid none; border-color: black black black -moz-use-text-color; border-width: 1pt 1pt 1pt medium; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpLast" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 2</p> </td> </tr> <tr style=""> <td style="border-style: none solid solid; border-color: -moz-use-text-color black black; border-width: medium 1pt 1pt; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpFirst" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 3</p> </td> <td style="border-style: none solid solid none; border-color: -moz-use-text-color black black -moz-use-text-color; border-width: medium 1pt 1pt medium; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpLast" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 4</p> </td> </tr> </tbody></table> <p class="MsoListParagraph"><o:p>&nbsp;</o:p></p>'});
	equal(editor.getContent(), '<table><tbody><tr><td width="307"><p>Cell 1</p></td><td width="307"><p>Cell 2</p></td></tr><tr><td width="307"><p>Cell 3</p></td><td width="307"><p>Cell 4</p></td></tr></tbody></table><p>&nbsp;</p>');
});

test("Paste Office 365", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<div class="OutlineElement Ltr SCX195156559">Test</div>'});
	equal(editor.getContent(), '<p>Test</p>');
});

test("Paste Google Docs 1", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {content: '<span id="docs-internal-guid-94e46f1a-1c88-b42b-d502-1d19da30dde7"></span><p dir="ltr>Test</p>'});
	equal(editor.getContent(), '<p>Test</p>');
});

test("Paste Google Docs 2", function() {
	var rng = editor.dom.createRng();

	editor.setContent('<p>1234</p>');
	rng.setStart(editor.getBody().firstChild.firstChild, 0);
	rng.setEnd(editor.getBody().firstChild.firstChild, 4);
	editor.selection.setRng(rng);

	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			'<meta charset="utf-8">' +
			'<b style="font-weight:normal;" id="docs-internal-guid-adeb6845-fec6-72e6-6831-5e3ce002727c">' +
			'<p dir="ltr">a</p>' +
			'<p dir="ltr">b</p>' +
			'<p dir="ltr">c</p>' +
			'</b>' +
			'<br class="Apple-interchange-newline">'
		)
	});
	equal(editor.getContent(), '<p>a</p><p>b</p><p>c</p>');
});

test("Paste Word without mso markings", function() {
	editor.setContent('');
	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			'<font face="Times New Roman" size="3"></font>' +
			'<p style="margin: 0in 0in 10pt;">' +
			'<span style=\'line-height: 115%; font-family: "Comic Sans MS"; font-size: 22pt;\'>Comic Sans MS</span>' +
			'</p>' +
			'<font face="Times New Roman" size="3"></font>'
		)
	});

	equal(editor.getContent(), (
		'<p>Comic Sans MS</p>'
	));
});

test("Paste Word links", function() {
	editor.setContent('');
	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			'<p class="MsoNormal">' +
				'<a href="file:///C:/somelocation/filename.doc#_Toc238571849">1</a>' +
				'<a href="#_Toc238571849">2</a>' +
				'<a name="Toc238571849">3</a>' +
				'<a name="_Toc238571849">4</a>' +
				'<a href="#_ftn238571849" name="_ftnref238571849">[5]</a>' +
				'<a href="#_ftnref238571849" name="_ftn238571849">[5]</a>' +
				'<a href="#_edn238571849" name="_ednref238571849">[6]</a>' +
				'<a href="#_ednref238571849" name="_edn238571849">[7]</a>' +
				'<a href="http://domain.tinymce.com/someurl">8</a>' +
				'<a name="#unknown">9</a>' +
				'<a href="http://domain.tinymce.com/someurl" name="named_link">named_link</a>' +
				'<a>5</a>' +
			'</p>'
		)
	});

	equal(editor.getContent(), (
		'<p>' +
			'<a href="#_Toc238571849">1</a>' +
			'<a href="#_Toc238571849">2</a>' +
			'<a name="Toc238571849"></a>3' +
			'<a name="_Toc238571849"></a>4' +
			'<a href="#_ftn238571849" name="_ftnref238571849">[5]</a>' +
			'<a href="#_ftnref238571849" name="_ftn238571849">[5]</a>' +
			'<a href="#_edn238571849" name="_ednref238571849">[6]</a>' +
			'<a href="#_ednref238571849" name="_edn238571849">[7]</a>' +
			'<a href="http://domain.tinymce.com/someurl">8</a>' +
			'9' +
			'named_link' +
			'5' +
		'</p>'
	));
});

test("Paste Word retain styles", function() {
	editor.settings.paste_retain_style_properties = 'color,background-color,font-family';

	// Test color
	editor.setContent('');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertClipboardContent', false, {content: '<p class="MsoNormal" style="color: #ff0000">Test</p>'});
	equal(editor.getContent(), '<p style=\"color: #ff0000;\">Test</p>');

	// Test background-color
	editor.setContent('');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertClipboardContent', false, {content: '<p class="MsoNormal" style="background-color: #ff0000">Test</p>'});
	equal(editor.getContent(), '<p style=\"background-color: #ff0000;\">Test</p>');
});

test("Paste Word retain bold/italic styles to elements", function() {
	editor.settings.paste_retain_style_properties = 'color';

	editor.setContent('');

	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			'<p class="MsoNormal">' +
				'<span style="font-weight: bold">bold</span>' +
				'<span style="font-style: italic">italic</span>' +
				'<span style="font-weight: bold; font-style: italic">bold + italic</span>' +
				'<span style="font-weight: bold; color: red">bold + color</span>' +
			'</p>'
		)
	});

	equal(editor.getContent(), '<p><strong>bold</strong><em>italic</em><strong><em>bold + italic</em></strong><strong><span style="color: red;">bold + color</span></strong></p>');
});

test('paste track changes comment', function() {
	editor.setContent('');

	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			'<p class="MsoNormal">1</p>' +
			'<div style="mso-element: comment;">2</div>' +
			'<span class="msoDel">3</span>' +
			'<del>4</del>'
		)
	});

	equal(editor.getContent(), '<p>1</p>');
});

test('paste nested (UL) word list', function() {
	editor.setContent('');

	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			"<p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>" +
			"<![if !supportLists]><span	style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'>" +
			"<span style='mso-list:Ignore'>·<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			"</span></span></span><![endif]>a</p>" +

			"<p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>" +
			"<![if !supportLists]><span style='font-family:\"Courier New\";mso-fareast-font-family:\"Courier New\"'>" +
			"<span style='mso-list:Ignore'>o<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;</span></span></span><![endif]>b</p>" +

			"<p class=MsoListParagraphCxSpLast style='margin-left:108.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level3 lfo1'>" +
			"<![if !supportLists]><span style='font-family:Wingdings;mso-fareast-font-family:Wingdings;mso-bidi-font-family:Wingdings'>" +
			"<span style='mso-list:Ignore'>§<span style='font:7.0pt \"Times New Roman\"'>&nbsp;</span></span></span><![endif]>c 1. x</p>"
		)
	});

	equal(
		editor.getContent(),
		'<ul>'+
			'<li>a' +
				'<ul>' +
					'<li>b' +
						'<ul>' +
							'<li>c 1. x</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
			'</li>' +
		'</ul>'
	);
});

test('paste nested (OL) word list', function() {
	editor.setContent('');

	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			"<p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>" +
			"<![if !supportLists]><span style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'>" +
			"<span style='mso-list:Ignore'>1.<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>" +
			"</span></span><![endif]>a</p>" +

			"<p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>" +
			"<![if !supportLists]><span style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>a." +
			"<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>b</p>" +

			"<p class=MsoListParagraphCxSpLast style='margin-left:108.0pt;mso-add-space:auto;text-indent:-108.0pt;mso-text-indent-alt:-9.0pt;mso-list:l0 level3 lfo1'>" +
			"<![if !supportLists]><span style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>" +
			"<span style='font:7.0pt \"Times New Roman\"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>i.<span style='font:7.0pt \"Times New Roman\"'>" +
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>c</p>"
		)
	});

	equal(
		editor.getContent(),
		'<ol>'+
			'<li>a' +
				'<ol>' +
					'<li>b' +
						'<ol>' +
							'<li>c</li>' +
						'</ol>' +
					'</li>' +
				'</ol>' +
			'</li>' +
		'</ol>'
	);
});

test("Paste list start index", function() {
	editor.settings.paste_merge_formats = true;

	editor.setContent('');

	editor.execCommand('mceInsertClipboardContent', false, {
		content: (
			'<p class=MsoListParagraphCxSpMiddle style="text-indent:-18.0pt;mso-list:l0 level1 lfo1">' +
			'<![if !supportLists]><span style="mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;' +
			'mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin"><span style="mso-list:Ignore">10.' +
			'<span style="font:7.0pt Times>&nbsp;&nbsp;</span></span></span><![endif]>J<o:p></o:p></p>'
		)
	});
	equal(editor.getContent(), '<ol start="10"><li>J</li></ol>');
});

test("Paste paste_merge_formats: true", function() {
	editor.settings.paste_merge_formats = true;

	editor.setContent('<p><strong>a</strong></p>');
	Utils.setSelection('p', 1);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<em><strong>b</strong></em>'});
	equal(editor.getContent(), '<p><strong>a<em>b</em></strong></p>');
});

test("Paste paste_merge_formats: false", function() {
	editor.settings.paste_merge_formats = false;

	editor.setContent('<p><strong>a</strong></p>');
	Utils.setSelection('p', 1);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<em><strong>b</strong></em>'});
	equal(editor.getContent(), '<p><strong>a<em><strong>b</strong></em></strong></p>');
});

test("Paste word DIV as P", function() {
	editor.setContent('');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertClipboardContent', false, {content: '<p class="MsoNormal">1</p><div>2</div>'});
	equal(editor.getContent(), '<p>1</p><p>2</p>');
});

test("Paste part of list from IE", function() {
	editor.setContent('');
	editor.execCommand('SelectAll');
	editor.execCommand('mceInsertClipboardContent', false, {content: '<li>item2</li><li>item3</li>'});
	equal(Utils.trimContent(editor.getContent()), '<ul><li>item2</li><li>item3</li></ul>', 'List tags are inferred when pasting LI');
});

test("Disable default filters", function() {
	editor.settings.paste_enable_default_filters = false;

	// Test color
	editor.setContent('');
	editor.execCommand('SelectAll');

	editor.execCommand('mceInsertClipboardContent', false, {content: '<p class="MsoNormal" style="color: #ff0000;">Test</p>'});
	equal(editor.getContent(), '<p class="MsoNormal" style="color: #ff0000;">Test</p>');
});

test('paste invalid content with spans on page', function() {
	var startingContent = '<p>123 testing <span id="x">span later in document</span></p>',
		insertedContent = '<ul><li>u</li><li>l</li></ul>';
	editor.setContent(startingContent);
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 0);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 0);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {content: insertedContent});

	equal(editor.getContent(), insertedContent + startingContent);
});

test('paste plain text with space', function() {
	editor.setContent('<p>text</p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {text: ' a '});

	equal(editor.getContent(), '<p>t a xt</p>');
});

test('paste plain text with linefeeds', function() {
	editor.setContent('<p>text</p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {text: 'a\nb\nc\n'});

	equal(editor.getContent(), '<p>ta<br />b<br />c<br />xt</p>');
});

test('paste plain text with double linefeeds', function() {
	editor.setContent('<p>text</p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {text: 'a\n\nb\n\nc'});

	equal(editor.getContent(), '<p>t</p><p>a</p><p>b</p><p>c</p><p>xt</p>');
});

test('paste plain text with entities', function() {
	editor.setContent('<p>text</p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {text: '< & >'});

	equal(editor.getContent(), '<p>t&lt; &amp; &gt;xt</p>');
});

test('paste plain text with paragraphs', function() {
	editor.setContent('<p>text</p>');
	var rng = editor.dom.createRng();
	rng.setStart(editor.dom.select('p')[0].firstChild, 1);
	rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
	editor.selection.setRng(rng);
	editor.execCommand('mceInsertClipboardContent', false, {text: 'a\n<b>b</b>\n\nc'});

	equal(editor.getContent(), '<p>t</p><p>a<br />&lt;b&gt;b&lt;/b&gt;</p><p>c</p><p>xt</p>');
});

test('paste data image with paste_data_images: false', function() {
	editor.setContent('');

	editor.execCommand('mceInsertClipboardContent', false, {content: '<img src="data:image/png;base64,...">'});
	equal(editor.getContent(), '');

	editor.execCommand('mceInsertClipboardContent', false, {content: '<img alt="alt" src="data:image/png;base64,...">'});
	equal(editor.getContent(), '');
});

test('paste data image with paste_data_images: true', function() {
	editor.settings.paste_data_images = true;

	editor.setContent('');
	editor.execCommand('mceInsertClipboardContent', false, {content: '<img src="data:image/png;base64,...">'});

	equal(editor.getContent(), '<p><img src="data:image/png;base64,..." alt="" /></p>');
});

test('paste pre process text (event)', function() {
	function callback(e) {
		e.content = 'PRE:' + e.content;
	}

	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.on('PastePreProcess', callback);
	editor.execCommand('mceInsertClipboardContent', false, {text: 'b\n2'});
	equal(editor.getContent(), '<p>PRE:b<br />2</p>');

	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.off('PastePreProcess', callback);
	editor.execCommand('mceInsertClipboardContent', false, {text: 'c'});
	equal(editor.getContent(), '<p>c</p>');
});

test('paste pre process html (event)', function() {
	function callback(e) {
		e.content = 'PRE:' + e.content;
	}

	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.on('PastePreProcess', callback);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<em>b</em>'});
	equal(editor.getContent(), '<p>PRE:<em>b</em></p>');

	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.off('PastePreProcess', callback);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<em>c</em>'});
	equal(editor.getContent(), '<p><em>c</em></p>');
});

test('paste post process (event)', function() {
	function callback(e) {
		e.node.innerHTML += ':POST';
	}

	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.on('PastePostProcess', callback);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<em>b</em>'});
	equal(editor.getContent(), '<p><em>b</em>:POST</p>');

	editor.setContent('<p>a</p>');
	Utils.setSelection('p', 0, 'p', 1);
	editor.off('PastePostProcess', callback);
	editor.execCommand('mceInsertClipboardContent', false, {content: '<em>c</em>'});
	equal(editor.getContent(), '<p><em>c</em></p>');
});

test('paste innerText of conditional comments', function() {
	equal(tinymce.pasteplugin.Utils.innerText('<![if !supportLists]>X<![endif]>'), 'X');
});

test('paste innerText of single P', function() {
	editor.setContent('<p>a</p>');
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().innerHTML), 'a');
});

test('paste innerText of single P with whitespace wrapped content', function() {
	editor.setContent('<p>   a   </p>');
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().innerHTML), 'a');
});

test('paste innerText of two P', function() {
	editor.setContent('<p>a</p><p>b</p>');
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().innerHTML), 'a\n\nb');
});

test('paste innerText of H1 and P', function() {
	editor.setContent('<h1>a</h1><p>b</p>');
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().innerHTML), 'a\nb');
});

test('paste innerText of P with BR', function() {
	editor.setContent('<p>a<br>b</p>');
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().innerHTML), 'a\nb');
});

test('paste innerText of P with VIDEO', function() {
	editor.setContent('<p>a<video>b<br>c</video>d</p>');
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().innerHTML), 'a d');
});

test('paste innerText of PRE', function() {
	editor.getBody().innerHTML = '<pre>a\nb\n</pre>';
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().innerHTML).replace(/\r\n/g, '\n'), 'a\nb\n');
});

test('paste innerText of textnode with whitespace', function() {
	editor.getBody().innerHTML = '<pre> a </pre>';
	equal(tinymce.pasteplugin.Utils.innerText(editor.getBody().firstChild.innerHTML), ' a ');
});

test('trim html from clipboard fragments', function() {
	equal(tinymce.pasteplugin.Utils.trimHtml('<!--StartFragment-->a<!--EndFragment-->'), 'a');
	equal(tinymce.pasteplugin.Utils.trimHtml('a\n<body>\n<!--StartFragment-->\nb\n<!--EndFragment-->\n</body>\nc'), '\nb\n');
	equal(tinymce.pasteplugin.Utils.trimHtml('a<!--StartFragment-->b<!--EndFragment-->c'), 'abc');
	equal(tinymce.pasteplugin.Utils.trimHtml('a<body>b</body>c'), 'b');
	equal(tinymce.pasteplugin.Utils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>b'), 'a b');
	equal(tinymce.pasteplugin.Utils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>b'), ' b');
	equal(tinymce.pasteplugin.Utils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>'), 'a ');
	equal(tinymce.pasteplugin.Utils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>'), ' ');
});

if (tinymce.Env.webkit) {
	test('paste webkit retains text styles runtime styles internal', function() {
		editor.settings.paste_webkit_styles = 'color';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;'});
		equal(editor.getContent(), '<p>&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;</p>');
	});

	test('paste webkit remove runtime styles internal', function() {
		editor.settings.paste_webkit_styles = 'color';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="color:red; font-size: 42px" data-mce-style="color: red;">Test</span>'});
		equal(editor.getContent(), '<p><span style="color: red;">Test</span></p>');
	});

	test('paste webkit remove runtime styles (color)', function() {
		editor.settings.paste_webkit_styles = 'color';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="color:red; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p><span style="color: red;">Test</span></p>');
	});

	test('paste webkit remove runtime styles keep before attr', function() {
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span class="c" style="color:red; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p><span class="c">Test</span></p>');
	});

	test('paste webkit remove runtime styles keep after attr', function() {
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="color:red; text-indent: 10px" title="t">Test</span>'});
		equal(editor.getContent(), '<p><span title="t">Test</span></p>');
	});

	test('paste webkit remove runtime styles keep before/after attr', function() {
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span class="c" style="color:red; text-indent: 10px" title="t">Test</span>'});
		equal(editor.getContent(), '<p><span class="c" title="t">Test</span></p>');
	});

	test('paste webkit remove runtime styles (background-color)', function() {
		editor.settings.paste_webkit_styles = 'background-color';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="background-color:red; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p><span style="background-color: red;">Test</span></p>');
	});

	test('paste webkit remove runtime styles (font-size)', function() {
		editor.settings.paste_webkit_styles = 'font-size';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="font-size:42px; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p><span style="font-size: 42px;">Test</span></p>');
	});

	test('paste webkit remove runtime styles (font-family)', function() {
		editor.settings.paste_webkit_styles = 'font-family';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="font-family:Arial; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p><span style="font-family: Arial;">Test</span></p>');
	});

	test('paste webkit remove runtime styles font-family allowed but not specified', function() {
		editor.settings.paste_webkit_styles = 'font-family';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<p title="x" style="text-indent: 10px">Test</p>'});
		equal(editor.getContent(), '<p title="x">Test</p>');
	});

	test('paste webkit remove runtime styles (custom styles)', function() {
		editor.settings.paste_webkit_styles = 'color font-style';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p><span style="color: red; font-style: italic;">Test</span></p>');
	});

	test('paste webkit remove runtime styles (all)', function() {
		editor.settings.paste_webkit_styles = 'all';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p><span style=\"color: red; font-style: italic; text-indent: 10px;\">Test</span></p>');
	});

	test('paste webkit remove runtime styles (none)', function() {
		editor.settings.paste_webkit_styles = 'none';
		editor.setContent('');
		editor.execCommand('mceInsertClipboardContent', false, {content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>'});
		equal(editor.getContent(), '<p>Test</p>');
	});

	test('paste webkit remove runtime styles (color) in the same (color) (named)', function() {
		editor.settings.paste_webkit_styles = 'color';

		editor.setContent('<p style="color:red">Test</span>');
		Utils.setSelection('p', 0, 'p', 4);

		editor.execCommand('mceInsertClipboardContent', false, {
			content: (
				'<span style="color:#ff0000; text-indent: 10px">a</span>' +
				'<span style="color:rgb(255, 0, 0); text-indent: 10px">b</span>'
			)
		});

		equal(editor.getContent(), '<p style="color: red;">ab</p>');
	});

	test('paste webkit remove runtime styles (color) in the same (color) (hex)', function() {
		editor.setContent('<p style="color:#ff0000">Test</span>');
		Utils.setSelection('p', 0, 'p', 4);

		editor.execCommand('mceInsertClipboardContent', false, {
			content: (
				'<span style="color:red; text-indent: 10px">a</span>' +
				'<span style="color:#ff0000; text-indent: 10px">b</span>' +
				'<span style="color:rgb(255, 0, 0); text-indent: 10px">c</span>'
			)
		});

		equal(editor.getContent(), '<p style="color: #ff0000;">abc</p>');
	});

	test('paste webkit remove runtime styles (color) in the same (color) (rgb)', function() {
		editor.setContent('<p style="color:rgb(255, 0, 0)">Test</span>');
		Utils.setSelection('p', 0, 'p', 4);

		editor.execCommand('mceInsertClipboardContent', false, {
			content: (
				'<span style="color:red; text-indent: 10px">a</span>' +
				'<span style="color:#ff0000; text-indent: 10px">b</span>' +
				'<span style="color:rgb(255, 0, 0); text-indent: 10px">c</span>'
			)
		});

		equal(editor.getContent(), '<p style="color: #ff0000;">abc</p>');
	});
}