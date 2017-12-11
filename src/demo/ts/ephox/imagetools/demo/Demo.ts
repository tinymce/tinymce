import ResultConversions from 'ephox/imagetools/api/ResultConversions';
import ImageTransformations from 'ephox/imagetools/api/ImageTransformations';

function getValue(el) {
    var value;
    if (el.tagName == "SELECT") {
        value = el.options[el.selectedIndex].value;
    } else {
        value = el.value;
    }
    return value.trim();
}

function modify(image, op, args) {
    ResultConversions.imageToImageResult(image).then(function(ir) {
        args.unshift(ir);
        return ImageTransformations[op].apply(null, args)
            .then(function (imageResult) {
                image.src = imageResult.toDataURL();
            });
    });
}

var forms = document.querySelectorAll('.options');
for (var i = 0; i < forms.length; i++) {
    (function(form:any) {
        form.onsubmit = function (el) {
            var selector = document.getElementById('selector');
            var currOp = getValue(selector);
            var image = document.getElementById('editor');
            modify(image, currOp, [].slice.call(this.elements)
                    .filter(function(el) {
                        return el.tagName != 'BUTTON';
                    })
                    .map(function (el) {
                        return getValue(el);
                    })
            );
            return false;
        }
    }(forms[i]));
}
