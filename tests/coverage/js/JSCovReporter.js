JSCovFileReporter = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this);
        this.open  = '<tr class="{class}"><td class="line">{line_number}</td><td class="hits">{count}</td><td class="source">';
        this.close = '</td></tr>';

        this.coverObject = this.options.coverObject;

        this.error = 0;
        this.pass = 0;
        this.total = 0;
    },

    // substitute credits: MooTools
    substitute: function(string, object){
        return string.replace(/\\?\{([^{}]+)\}/g, function(match, name){
            if (match.charAt(0) == '\\') return match.slice(1);
            return (object[name] !== null) ? object[name] : '';
        });
    },

    generateClose: function(count){
        return this.substitute(this.close, {
            count: count
        });
    },

    generateOpen: function(hit_count, line_number){
        return this.substitute(this.open, {
            'count': hit_count,
            'line_number': line_number,
            'class': hit_count ? 'hit' : 'miss'
        });
    },

    report: function () {
        var thisview = this;
        var i, l, k;

        var code = this.coverObject.__code;

        // generate array of all tokens
        var codez = [];
        for (i = 0, l = code.length; i < l; i++){
            codez.push({
                pos: i,
                value: code.slice(i, i + 1)
            });
        }

        // CoverObject has keys like "12:200" which means from char 12 to 200
        // This orders all first gaps in a list of dictionaries to ease drawing table lines
        var gaps = Object.keys(this.coverObject);
        gaps = _.without(gaps, '__code');
        var first_gaps = _.map(gaps, function ( gap ) {
            return {
                gap: parseInt(gap.split(':')[0], 10),
                hit_count: thisview.coverObject[gap]
            };
        }).sort(function (a, b) {
            if (a['gap'] > b['gap']) return 1;
            if (b['gap'] > a['gap']) return -1;
            return 0;
        });

        var second_gaps = _.map(gaps, function ( gap ) {
            return {
                gap: parseInt(gap.split(':')[1], 10),
                hit_count: thisview.coverObject[gap]
            };
        }).sort(function (a, b) {
            if (a['gap'] > b['gap']) return 1;
            if (b['gap'] > a['gap']) return -1;
            return 0;
        });


        // If it doesn't start from 0 it's because there are comments in the beginning
        // We add a initial gap with one hit
        if (first_gaps[0] !== 0) {
            first_gaps.splice(0, 0, {gap: 0, hit_count: 1});
        }

        var result = '';
        var number_trailing_whitespaces = 0;
        var trailing_whitespaces = '';


        // We will go from one gap to the next wrapping them in table lines
        for (i=0, l = first_gaps.length; i < l; i++){

            var hit_count = first_gaps[i]['hit_count'];

            this.total++;
            if (hit_count) this.pass++;
            else this.error++;

            var limit = null;
            if (i+1 >= l) {
                limit = codez.length;
            }
            else {
                limit = first_gaps[i+1]['gap'];
            }

            // Table line opening
            result += this.generateOpen(hit_count, this.total);

            // Add trailing white space if it existed from previous line without carriage returns
            if (number_trailing_whitespaces > 0 ) {
                result += trailing_whitespaces.replace(/(\r\n|\n|\r)/gm,"");
            }

            // Add lines of code without initial white spaces, and replacing conflictive chars
            result += _.map(codez.slice(first_gaps[i]['gap'], limit), function (loc) {
                return loc['value'];
            }).join('').trimLeft().replace(/</g, '&lt;').replace(/>/g, '&gt;');

            // Count trailing white spaces for future line, then remove them
            var matches = result.match(/(\s+)$/);
            result = result.trimRight();

            if (matches !== null) {
                number_trailing_whitespaces = matches[0].length;
                trailing_whitespaces = matches[0];
            }
            else {
                number_trailing_whitespaces = 0;
            }

            // Generate table line closing
            result += this.generateClose(hit_count);
        }

        return result;
    }
});


JSCovReporter = Backbone.View.extend({
    initialize: function () {
        this.coverObject = this.options.coverObject;

        // Generate the report
        this.report();

        // Activate reporter.js scrolling UX
        onload();
    },

    report: function () {
        var result = '';
        var index = '';

        for (var file in this.coverObject) {
            var fileReporter = new JSCovFileReporter({ coverObject: this.coverObject[file] });

            var fileReport = fileReporter.report();
            var percentage = Math.round(fileReporter.pass / fileReporter.total * 100);

            this.error += fileReporter.error;
            this.pass  += fileReporter.pass;
            this.total += fileReporter.total;

            var type_coverage = "high";
            if (percentage < 75 && percentage >= 50) {
                type_coverage = 'medium';
            }
            else if (percentage < 50 && percentage >= 25) {
                type_coverage = 'low';
            }
            else if (percentage < 25) {
                type_coverage = 'terrible';
            }

            // Title
            result += '<h2 id="' + file + '" class="file-title">' + file + '</h2>';
            // Stats
            result += '<div class="stats ' + type_coverage + '"><div class="percentage">'+ percentage + '%</div>';
            result += '<div class="sloc">' + fileReporter.total + '</div><div class="hits">' + fileReporter.pass + '</div>';
            result += '<div class="misses">' + fileReporter.error + '</div></div>';
            // Report
            result += '<div class="file-report">';
            result += '<table id="source"><tbody>' + fileReport + '</tbody></table>';
            result += '</div>';

            // Menu index
            index += '<li><span class="cov ' + type_coverage + '">' + percentage + '</span><a href="#' + file+ '">' + file + '</a></li>';
        }

        $('#coverage').html(result);
        $('#menu').html('<ul id="toc">' + index + '</ul>');
    }
});
