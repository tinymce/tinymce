/**
 * Node.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var whiteSpaceRegExp = /^[ \t\r\n]*$/;

	function Node(name, type) {
		this.name = name;
		this.type = type;

		if (type === 1) {
			this.attributes = [];
			this.attributes.map = {};
		}
	}

	tinymce.extend(Node.prototype, {
		replace : function(node) {
			var self = this;

			if (node.parent)
				node.remove();

			self.insert(node, self);
			self.remove();

			return self;
		},

		attr : function(name, value) {
			var self = this, attrs, i, undef;

			if (attrs = self.attributes) {
				if (value !== undef) {
					if (name in attrs.map) {
						// Remove attribute
						if (value === null) {
							delete attrs.map[name];

							i = attrs.length;
							while (i--) {
								if (attrs[i].name === name) {
									attrs = attrs.splice(i, 1);
									return;
								}
							}
						}

						// Set attribute
						i = attrs.length;
						while (i--) {
							if (attrs[i].name === name) {
								attrs[i].value = value;
								break;
							}
						}
					} else
						attrs.push({name: name, value: value});

					attrs.map[name] = value;
				} else {
					return attrs.map[name];
				}
			}
		},

		clone : function() {
			var self = this, clone = new Node(self.name, self.type), i, selfAttrs, selfAttr, cloneAttrs;

			// Clone element attributes
			if (selfAttrs = self.attributes) {
				i = selfAttrs.length;
				cloneAttrs = [];
				cloneAttrs.map = {};

				while (i--) {
					selfAttr = selfAttrs[i];

					// Clone everything except id
					if (selfAttr.name !== 'id') {
						cloneAttrs[cloneAttrs.length] = {name: selfAttr.name, value: selfAttr.value};
						cloneAttrs.map[selfAttr.name] = selfAttr.value;
					}
				}

				clone.attributes = cloneAttrs;
			}

			clone.value = self.value;
			clone.empty = self.empty;

			return clone;
		},

		unwrap : function() {
			var self = this, node;

			for (node = self.firstChild; node; node = node.next) {
				self.insert(node, self);
			}

			self.remove();
		},

		remove : function() {
			var self = this, parent = self.parent, next = self.next, prev = self.prev;

			if (parent.firstChild === self) {
				parent.firstChild = next;

				if (next)
					next.prev = null;
			} else {
				prev.next = next;
			}

			if (parent.lastChild === self) {
				parent.lastChild = prev;

				if (prev)
					prev.next = null;
			} else {
				next.prev = prev;
			}

			self.parent = self.next = self.prev = null;

			return self;
		},

		append : function(node) {
			var self = this, last = self.lastChild;

			if (node.parent)
				node.remove();

			if (last) {
				last.next = node;
				node.prev = last;
				self.lastChild = node;
			} else
				self.lastChild = self.firstChild = node;

			node.parent = self;

			return node;
		},

		insert : function(node, ref_node, before) {
			var self = this, parent = self.parent || self, refParent = ref_node.parent;

			if (node.parent)
				node.remove();

			if (before) {
				if (ref_node === parent.firstChild)
					parent.firstChild = node;
				else
					ref_node.prev.next = node;

				node.prev = ref_node.prev;
				node.next = ref_node;
				ref_node.prev = node;
			} else {
				if (ref_node === parent.lastChild)
					parent.lastChild = node;
				else
					ref_node.next.prev = node;

				node.next = ref_node.next;
				node.prev = ref_node;
				ref_node.next = node;
			}

			node.parent = self;

			return node;
		},

		walk : function(node, root_node, prev, shallow) {
			var sibling, parent, startName = prev ? 'lastChild' : 'firstChild', siblingName = prev ? 'prev' : 'next';

			// Walk into nodes if it has a start
			if (!shallow && node[startName])
				return node[startName];

			// Return the sibling if it has one
			if (node !== root_node) {
				sibling = node[siblingName];

				if (sibling)
					return sibling;

				// Walk up the parents to look for siblings
				for (parent = node.parentNode; parent && parent !== root_node; parent = parent.parentNode) {
					sibling = parent[siblingName];

					if (sibling)
						return sibling;
				}
			}
		},

		clear : function() {
			var self = this;

			self.firstChild = self.lastChild = null;

			return self;
		},

		isEmpty : function(empty_elements) {
			var self = this, node = self;

			while (node = self.walk(node, self)) {
				if ((node.type === 3 && !whiteSpaceRegExp.test(node.value)) || empty_elements[node.name])
					return false;
			}

			return true;
		}
	});

	tinymce.html.Node = Node;
})(tinymce);
