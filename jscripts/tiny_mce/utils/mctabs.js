/**
 * mctabs.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

function MCTabs() {
	this.settings = [];
};

MCTabs.prototype.init = function(settings) {
	this.settings = settings;
};

MCTabs.prototype.getParam = function(name, default_value) {
	var value = null;

	value = (typeof(this.settings[name]) == "undefined") ? default_value : this.settings[name];

	// Fix bool values
	if (value == "true" || value == "false")
		return (value == "true");

	return value;
};

MCTabs.prototype.showTab =function(tab){
	tab.className = 'current';
	tab.setAttribute("aria-selected", true);
    tab.tabIndex=0;
};

MCTabs.prototype.hideTab =function(tab){
    var t=this;
    tab.className = '';  
	tab.setAttribute("aria-selected",false);  
	tab.setAttribute("role","tab") ;
	tab.tabIndex=-1;
};

MCTabs.prototype.showPanel = function(panel) {
	panel.className = 'current'; 
	panel.setAttribute("aria-hidden", false);
};

MCTabs.prototype.hidePanel = function(panel) {
    panel.className = 'panel';   
	panel.setAttribute("aria-hidden", true);
}; 

MCTabs.prototype.getPanelForTab = function(tabElm) {
    return tinyMCEPopup.dom.getAttrib(tabElm, "aria-controls");
};

MCTabs.prototype.displayTab = function(tab_id, panel_id, avoid_focus) {
	var panelElm, panelContainerElm, tabElm, tabContainerElm, selectionClass, nodes, i, t;
	t = this;
	tabElm = document.getElementById(tab_id);
    if (panel_id===undefined){    
        panel_id = this.getPanelForTab(tabElm);
    }
	panelElm= document.getElementById(panel_id);
	panelContainerElm = panelElm ? panelElm.parentNode : null;
	tabContainerElm = tabElm ? tabElm.parentNode : null;
	selectionClass = this.getParam('selection_class', 'current');
    
	if (tabElm && tabContainerElm) {
		nodes = tabContainerElm.childNodes;
        
		// Hide all other tabs
		for (i = 0; i < nodes.length; i++) {
			if (nodes[i].nodeName == "LI") {
			    this.hideTab(nodes[i]);
			}
		}

		// Show selected tab
		this.showTab(tabElm);
	}

	if (panelElm && panelContainerElm) {
		nodes = panelContainerElm.childNodes;

		// Hide all other panels
		for (i = 0; i < nodes.length; i++) {
			if (nodes[i].nodeName == "DIV")
			    this.hidePanel(nodes[i]);
		}
		if (!avoid_focus) { 
		    //todo - should this be done in a timer?
		    tabElm.focus();
		}
		// Show selected panel
        this.showPanel(panelElm);
	}
};

MCTabs.prototype.getAnchor = function() {
	var pos, url = document.location.href;

	if ((pos = url.lastIndexOf('#')) != -1)
		return url.substring(pos + 1);

	return "";
};

// Global instance
var mcTabs = new MCTabs();

tinyMCEPopup.onInit.add(function() {
	var tinymce = tinyMCEPopup.getWin().tinymce, dom = tinyMCEPopup.dom, each = tinymce.each;
	each(dom.select('div.tabs'), function(tabContainerElm) {
        dom.setAttrib(tabContainerElm, "role", "tablist"); 
		var items = tinyMCEPopup.dom.select('li', tabContainerElm);
		var action = function(id) {
			mcTabs.displayTab(id, mcTabs.getPanelForTab(id));
		};
		each(items, function(item) {
			dom.setAttrib(item, 'role', 'tab');
			dom.bind(item, 'click', function(evt) {
				action(item.id);
			});
		});
		
		each(dom.select('a', tabContainerElm), function(a) {
			dom.setAttrib(a, 'tabindex', '-1');
		});
		
	    tinyMCEPopup.editor.windowManager.createInstance('tinymce.ui.KeyboardNavigation',
	    		tinyMCEPopup.dom, tabContainerElm, items, null, action);
	});
});