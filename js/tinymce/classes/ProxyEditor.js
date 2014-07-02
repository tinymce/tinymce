define("tinymce/ProxyEditor", [
	"tinymce/dom/DOMUtils",
	"tinymce/Editor",
	"tinymce/Proxy"
], function (DOMUtils, Editor, Proxy) {
	var DOM = DOMUtils.DOM;

	function ProxyEditor(id, settings, editorManager) {
		var self = this;

		self.settings = settings;
		self.settings.content_element = self.settings.content_element || id;

		self.iframe = createIframe();
		var proxy = new Proxy(self.iframe.contentWindow, "*", true);

		proxy.on("ready", function () {
			proxy.send("init", [settings, self.getElement().value]);
		});

		proxy.on("newContent", function (value) {
			self.getElement().value = value;
		});

		proxy.on("setHeight", function (value) {
			self.iframe.style.height = value;
		});

		self.getElement().style.visibility = "hidden";
		self.getElement().style.display = "none";

		function createContainer() {
			var element = self.getElement();
			var container = document.createElement("div");
			element.parentNode.insertBefore(container, element);

			self.container = container;
			return container;
		}

		function createIframe() {
			var elm = self.getElement();
			var w = settings.width || elm.style.width || elm.offsetWidth;
			var h = settings.height || elm.style.height || elm.offsetHeight;
			var container = createContainer();

			return DOM.add(container, 'iframe', {
				id: id + "_ifr",
				src: settings.sandbox,
				frameBorder: '0',
				allowTransparency: "true",
				style: {
					width: '100%',
					height: h,
					display: 'block' // Important for Gecko to render the iframe correctly
				}
			});
		}

		function getURIDomain(uri) {
			var a = document.createElement("a");
			a.href = uri;

			var domain = a.hostname;
			return domain;
		}
	}

	ProxyEditor.prototype.getElement = Editor.prototype.getElement;
	ProxyEditor.prototype.render = function () {};

	return ProxyEditor;
});