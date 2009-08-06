(function($){
	var currentPage, currentHash;

	function resizeUI() {
		$('#doc3').css('height', (window.innerHeight || document.documentElement.clientHeight) - $('#hd').height() - 12);
	}

	function scrollToHash(hash) {
		if (hash) {
			$(hash).each(function() {
				$(this)[0].scrollIntoView();
			});
		}
	}

	function loadURL(url) {
		var parts = /^([^#]+)(#.+)?$/.exec(url), hash = parts[2];

		// In page link, no need to load anything
		if (parts[1] == currentPage) {
			if (hash)
				scrollToHash(hash);
			else
				 $('#detailsView')[0].scrollTop = 0;

			return;
		}

		currentPage = parts[1];

		$("#classView a.selected").removeClass('selected');
		$("#classView a[href='" + currentPage.replace(/^.*\/([^\/]+)$/, '$1') + "']").addClass('selected').focus().parents("li.expandable").each(function() {
			var li = $(this).removeClass("expandable").addClass("collapsable");

			li.find("> div.expandable-hitarea").removeClass("expandable-hitarea").addClass("collapsable-hitarea");
			li.find("> ul").show();
		});

		$.get(parts[1], "", function(data) {
			data = /<body[^>]*>([\s\S]+)<\/body>/.exec(data);

			if (data) {
				$('#detailsView').html(data[1])[0].scrollTop = 0;

				SyntaxHighlighter.config.clipboardSwf = 'js/clipboard.swf';
				SyntaxHighlighter.highlight({gutter : false});

				scrollToHash(hash);
			}
		});
	}

	$().ready(function(){
		$("#browser").treeview();
		$(window).resize(resizeUI).trigger('resize');

		window.setInterval(function() {
			var hash = document.location.hash;

			if (hash != currentHash && hash) {
				loadURL(hash.replace(/\-/g, '#').substring(1));
				currentHash = hash;
			}
		}, 100);

		$("a").live("click", function(e) {
			var url = e.target.href;

			if (e.button == 0) {
				if (url.indexOf('class_') != -1 || url.indexOf('alias_') != -1 || url.indexOf('member_') != -1) {
					document.location.hash = e.target.href.replace(/^.*\/([^\/]+)/, '$1').replace(/#/g, '-');

					loadURL(url);
				}

				e.preventDefault();
			}
		});
	});
})(jQuery);
