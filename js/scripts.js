var languages = ["html", "css", "js"];
var theme = localStorage.getItem("theme") || "monokai";
var defaultTheme = "ace/theme/" + ( theme && theme.length > 0 ? theme : 'monokai' );
var defaultHTML = '<!DOCTYPE html>\n' +
    '<html>\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width">\n' +
    '  <title>Title</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '</body>\n' +
    '</html>';

var htmlObject = document.createElement('div'); //dummy element

function DOM(html, css, js) {
    this.html = html;
    this.css = css;
    this.js = js;
    this._DOM = document.createElement('html');
    this.head = document.createElement('head');
    this.body = document.createElement('body');
    this.style = document.createElement('style');
    this.script = document.createElement('script');
    this.head.appendChild(this.style);
    this._DOM.appendChild(this.head);
    this._DOM.appendChild(this.body);
    this.arrangeAll();
}

DOM.prototype.arrangeAll = function(){
    this.style.innerHTML = this.css;
    this.script.innerHTML = this.js;
    this.body.innerHTML = this.html;
    this.body.appendChild(this.script);
};

DOM.prototype.setCSS = function (css) {
    this.css = css;
    this.style.innerHTML = css;
};

DOM.prototype.setHTML = function (html) {
    this.html = html;
    this.arrangeAll();
};

DOM.prototype.setJS = function (js) {
    this.js = js;
    this.script.innerHTML = js;
};

DOM.prototype.set = function (key, value) {
    this[key] = [value];
    switch (key) {
        case 'html':
            this.setHTML(value);
            break;
        case 'css':
            this.setCSS(value);
            break;
        case 'js':
            this.setJS(value);
            break;
        default:
    }
};

DOM.prototype.getDOMString = function () {
    htmlObject.appendChild(this._DOM);
    return htmlObject.innerHTML;
};

var _DOM = new DOM(
    localStorage.getItem(languages[0]),
    localStorage.getItem(languages[1]),
    localStorage.getItem(languages[2])
);

var iframe = document.querySelector("iframe");
var runWithJSButton = document.querySelector('button');
var jsTitle = document.querySelector('#js-title');

var defaultCodes = {
    html: defaultHTML,
    css: '/*CSS*/',
    js: '//JavaScript'
};
//configure editors
languages.forEach(function (language) {
    var editor = ace.edit(language + "-editor", {
        mode: "ace/mode/" + (language === 'js' ? 'javascript' : language),
        theme: defaultTheme
    });
    editor.setValue(localStorage.getItem(language) || defaultCodes[language]);
    editor.session.on('change', function(delta) {
        var value = editor.getValue();
        localStorage.setItem(language, value);
        _DOM.set(language, value);
        if(language !== 'js'){
            renderDOMToIFrame();
        }else{
            runWithJSButton.style.display = 'block';
            jsTitle.style.display = 'none';
        }
    });
});

function renderDOMToIFrame(runJS){
    iframe.setAttribute('srcdoc', _DOM.getDOMString());
    if(runJS){
        runWithJSButton.style.display = 'none';
        jsTitle.style.display = 'block';
    }
}

renderDOMToIFrame();

(function() {
    if ('serviceWorker' in navigator) {
        console.info('CLIENT: service worker registration in progress.');
        navigator.serviceWorker.register('sw.js').then(function() {
            console.info('CLIENT: service worker registration complete.');
        }, function() {
            console.error('CLIENT: service worker registration failure.');
        });
    } else {
        console.info('CLIENT: service worker is not supported.');
    }
})();