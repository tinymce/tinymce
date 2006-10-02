var Search = {
	targetEl : null,
	contentEl : null,
	xmlDoc : null,

	exec : function(q, t, m) {
		var s = this;

		s.query = q;
		s.targetEl = document.getElementById(t);
		s.contentEl = document.getElementById(m);

		s.contentEl.style.display = 'none';
		s.targetEl.style.display = 'block';

		s.targetEl.innerHTML = 'Searching please wait...';

		if (s.searchXML == null)
			s.parseXML('search.xml');
		else {
			alert('cached');
			s._doSearch();
		}
	},

	open : function(u) {
		var s = this;

		s.contentEl.style.display = 'block';
		s.targetEl.style.display = 'none';

		document.location = u;
	},

	_doSearch : function () {
		var h = '', s = Search, nl, i, na, cl, co = 0;

		h += '<h4>Search results for: ' + s.query + '</h4>';
		h += '<div class="matches">';

		nl = s.xmlDoc.getElementsByTagName('*');
		for (i=0; i<nl.length; i++) {
			na = nl[i].getAttribute('n');
			cl = nl[i].getAttribute('c');

			if (na && new RegExp(s.query, 'gi').test(na)) {
				co++;

				switch (nl[i].nodeName) {
					case 'm':
						h += '<div><a href="javascript:Search.open(\'class_' + cl + '.htm#' + na + '\');">' + na + '</a> Method (<a href="javascript:Search.open(\'class_' + cl + '.htm\');">' + cl + '</a>)</div>';
						break;

					case 'f':
						h += '<div><a href="javascript:Search.open(\'class_' + cl + '.htm#' + na + '\');">' + na + '</a> Field (<a href="javascript:Search.open(\'class_' + cl + '.htm\');">' + cl + '</a>)</div>';
						break;

					case 'c':
						h += '<div><a href="javascript:Search.open(\'class_' + na + '.htm\');">' + na + '</a> Class</div>';
						break;

					case 'co':
						h += '<div><a href="javascript:Search.open(\'class_' + na + '.htm#' + na + '\');">' + na + '</a> Constructor</div>';
						break;

					case 'm':
						h += '<div><a href="javascript:Search.open(\'class_' + cl + '.htm#' + na + '\');">' + na + '</a> Method (<a href="javascript:Search.open(\'class_' + cl + '.htm\');">' + cl + '</a>)</div>';
						break;
				}
			}
		}

		if (co == 0)
			h += 'Search did not produce any results.';

		h += '</div>';

		s.targetEl.innerHTML = h;
	},

	parseXML : function(f) {
		var s = this, ex;

		try {
			if (window.ActiveXObject) {
				s.xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				s.xmlDoc.async = true;

				s.xmlDoc.onreadystatechange = function() {
					Search.xmlDoc.readyState == 4 && s._doSearch();
				};

				s.xmlDoc.load(f);
			} else if (document.implementation && document.implementation.createDocument) {
				s.xmlDoc = document.implementation.createDocument("", "", null);
				s.xmlDoc.onload = Search._doSearch;
				s.xmlDoc.load(f);
			} else
				s.targetEl.innerHTML = "XML parsing failed.";
		} catch (ex) {
			s.targetEl.innerHTML = "XML parsing failed.";
		}
	}
};
