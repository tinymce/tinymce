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
	tab.onclick=function(){t.displayTab(tab.id)};
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
    return tabElm.getAttribute("aria-controls");
}

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
        tabContainerElm.setAttribute("role", "tablist"); 
        
        tabContainerElm.onkeydown=function (event) {t.doNavigation(event)};
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

//key bindings
//TODO add extra keys?
MCTabs.prototype.KEY_UP = 38;
MCTabs.prototype.KEY_DOWN = 40;
MCTabs.prototype.KEY_LEFT = 37;
MCTabs.prototype.KEY_RIGHT = 39;

MCTabs.prototype.NAV_KEYS = [MCTabs.prototype.KEY_UP, MCTabs.prototype.KEY_DOWN, MCTabs.prototype.KEY_LEFT, MCTabs.prototype.KEY_RIGHT];
MCTabs.prototype.PREVIOUS_KEYS = [MCTabs.prototype.KEY_UP, MCTabs.prototype.KEY_LEFT];
MCTabs.prototype.NEXT_KEYS = [MCTabs.prototype.KEY_DOWN, MCTabs.prototype.KEY_RIGHT];

MCTabs.prototype.listContains = function(items, item) {
    for(var i = 0; i < items.length; i++) {
        if(items[i] === item){
            return true;
        }
    }
    return false;
}

MCTabs.prototype.doNavigation = function(event){
    var element, keyCode, container, newElement;
    element = event.srcElement;
    keyCode = event.keyCode;
    container = element.parentNode;

    if (!this.listContains(this.NAV_KEYS, event.keyCode)){
        return;
    }
    if (this.listContains(this.NEXT_KEYS, event.keyCode)){
        newElement = this.findNextTab(element);
    } else if (this.listContains(this.PREVIOUS_KEYS, event.keyCode)) {
        newElement = this.findPreviousTab(element);
    }
    this.displayTab(newElement.id);
} 

MCTabs.prototype.findNextTab = function(element){
    var next = element.nextSibling;
    while (next!==null && next.nodeType!=1){
        next = next.nextSibling;
    } 
    if (next===null){
        return element.parentNode.children[0];
    }
    return next;
}
MCTabs.prototype.findPreviousTab = function(element){
    var prev = element.previousSibling;
    while (prev!==null && prev.nodeType!=1){
        prev = prev.previousSibling;
    } 
    if (prev===null){
        return element.parentNode.children[element.parentNode.children.length-1];
    }
    return prev;
}

// Global instance
var mcTabs = new MCTabs();
