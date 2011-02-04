function fontFace(face) {
	if (tinymce.isOpera) {
		return '&quot;' + face + '&quot;';
	} else {
		return face;
	}
}

function trimContent(content) {
	if (tinymce.isOpera)
		return content.replace(/^<p>&nbsp;<\/p>/, '').replace(/<p>&nbsp;<\/p>$/, '');

	return content;
}


function normalizeContentWhitespace(content){
    return trimContent(content.replace(/[\r\n]+/g, ''));
}

function stripIEProblems(ed, html){
    //TODO: normalize styles instead
    var elem = $j("<div>" + html + "</div>").find("*").removeAttr("style").end()
            .find("img").removeAttr("height").removeAttr("width").end().get(0);
    return ed.serializer.serialize(elem, {format: "html", getInner: true});
}

function checkContent(ed, expected, message, stripProblems){
    if(message == null){
        message = "Document content";
    }

    var actual = normalizeContentWhitespace(ed.getContent());
    expected = normalizeContentWhitespace(expected);
    if(actual == expected){
        equal(actual, expected, message);
    }else{
        if(tinymce.isIE || stripProblems){
            actual = normalizeContentWhitespace(stripIEProblems(ed, actual));
            expected = normalizeContentWhitespace(stripIEProblems(ed, expected));
        }
        equal(actual, expected, message);
    }
}

function rangeEqual(value, expected){
    var result = equal(value.startContainer, expected.startContainer, "start container");
    if(!result){
        console.error("start container mismatch: actual, expected", value.startContainer, expected.startContainer);
    }
    equal(value.startOffset, expected.startOffset, "start offset");
    if(expected.collapsed && value.collapsed){
        ok(true, "collapsed");
    }else{
        result = equal(value.endContainer, expected.endContainer, "end container");
        if(!result){
            console.error("end container mismatch: actual, expected", value.endContainer, expected.endContainer);
        }
        equal(value.endOffset, expected.endOffset, "end offset");
    }
}

/**
 * Fakes a key event.
 *
 * @param {Element/String} e DOM element object or element id to send fake event to.
 * @param {String} na Event name to fake like "keydown".
 * @param {Object} o Optional object with data to send with the event like keyCode and charCode.
 */
function fakeKeyEvent(e, na, o) {
	var ev;

	o = tinymce.extend({
		keyCode : 13,
		charCode : 0
	}, o);

	e = tinymce.DOM.get(e);

	if (e.fireEvent) {
		ev = document.createEventObject();
		tinymce.extend(ev, o);
		e.fireEvent('on' + na, ev);
		return;
	}

    try {
        // Fails in Safari
        ev = document.createEvent('KeyEvents');
        ev.initKeyEvent(na, true, true, window,
                !!o.ctrlKey, !!o.altKey, !!o.shiftKey, !!o.metaKey,
                o.keyCode, o.charCode);
    } catch (ex) {
        try{
            ev = document.createEvent('Events');
            ev.initEvent(na, true, true);

            ev.ctrlKey = !!o.ctrlKey;
            ev.altKey = !!o.altKey;
            ev.shiftKey = !!o.shiftKey;
            ev.metaKey = !!o.metaKey;

            ev.keyCode = o.keyCode;
            ev.charCode = o.charCode;
        }catch(ex2){
            ev = document.createEvent('UIEvents');

            if (ev.initUIEvent)
                ev.initUIEvent(na, true, true, window, 1);
            ev.initEvent(na, true, true);

            ev.ctrlKey = !!o.ctrlKey;
            ev.altKey = !!o.altKey;
            ev.shiftKey = !!o.shiftKey;
            ev.metaKey = !!o.metaKey;

            ev.keyCode = o.keyCode;
            ev.charCode = o.charCode;
        }
    }

	e.dispatchEvent(ev);
}


function type(ed, keyCode, obj){
    if(!obj) obj = {};
    obj = tinymce.extend({ keyCode : keyCode }, obj);
    fakeKeyEvent(ed.selection.getNode(), "keydown", obj);
    fakeKeyEvent(ed.selection.getNode(), "keypress", obj);
    fakeKeyEvent(ed.selection.getNode(), "keyup", obj);
}
