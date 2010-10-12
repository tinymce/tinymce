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
	function Node(name, type) {
		this.name = name;
		this.type = type;
	}

	tinymce.extend(Node.prototype, {
		replace : function(node) {
			var self = this;

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
				i = selfAttrs.length - 1;
				cloneAttrs = [];

				while (i--) {
					selfAttr = selfAttrs[i];

					// Clone everything except id
					if (selfAttr.name !== 'id')
						cloneAttrs[cloneAttrs.length] = {name: selfAttr.name, value: selfAttr.value};
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
			var self = this, parent = this.parent, refParent = ref_node.parent;

			self.remove(node);

			if (before) {
				if (ref_node === parent.firstChild)
					parent.firstChild = node;
				else
					ref_node.prev.next = node;

				node.prev = ref_node.prev;
				node.next = ref_node;
				ref_node.previous = node;
			} else {
				if (ref_node === parent.lastChild)
					parent.lastChild = node;
				else
					ref_node.next.prev = node;

				node.next = ref_node.next;
				node.prev = ref_node;
				ref_node.next = node;
			}

			return node;
		}
	});

	tinymce.html.Node = Node;
})(tinymce);
