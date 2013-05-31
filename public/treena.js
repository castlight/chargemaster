(function($) {
    var digestQueued = false;
    var digestRunning = false;

    var queueDigest = function() {
        if (!digestQueued) {
            digestQueued = true;

            if (!digestRunning) {
                setTimeout(function() {
                    var maxIters = 10;
                    digestRunning = true;
                    while (digestQueued && (maxIters-- > 0)) {
                        digestQueued = false;
                        $(".--treena-watched-element").triggerHandler('treena:data-change');
                    }
                    if (digestQueued) {
                        console.log('maxIters exceeded!');
                        digestQueued = false;
                    }
                    digestRunning = false;
                }, 0);
            }
        }
    };

    var addWatcher = function($e, ifF, thenF) {
        var oldValue = undefined;
        $e.on("treena:data-change", function() {
            var v = ifF.__watcher__ ? ifF.__watcher__() : ifF();
            var newValue = (typeof(v) === 'number') ? v : JSON.stringify(v);
            if (oldValue !== newValue) {
                oldValue = newValue;
                thenF && thenF(ifF(), $e);
                queueDigest();
            }
        });
        $e.addClass("--treena-watched-element");
        queueDigest();
        return $e;
    };

    var isWatcher = $.isFunction;

    var setCss = function($e, css) { 
        if (isWatcher(css)) {
            addWatcher($e, css, function(c) { 
                $e.css(c);
            } );
        } else if (typeof(css) === 'object') {
            $.each(css, function(k, val) {
                if (isWatcher(val)) {
                    addWatcher($e, val, function(c) { $e.css(k, c); } );
                } else {
                    $e.css(k, val);
                }
            });
        } else {
            $e.css(css);
        }
    };

    var setClass = function($e, val) {
        if (typeof(val) == 'string') {
            val = val.split(' ');
        } else if (!$.isArray(val)) {
            val = [ val ];
        }
        $.each(val, function(i, clas) {
            if (isWatcher(clas)) {
                var oldClass = null;
                addWatcher($e, clas, function(newClass) {
                    if (oldClass) {
                        $e.removeClass(oldClass);
                    }
                    if (newClass) {
                        $e.addClass(newClass);
                    }
                    oldClass = newClass;
                });
            } else {
                $e.addClass(clas);
            }
        });
    };

    /* fix some stupid IE capitalization bugs */
    var IEcaps = {
        "rowspan" : "rowSpan",
        "colspan" : "colSpan",
        "frameborder" : "frameBorder"
    };


    var setAttr = function($e, attr, val, initial) {
        attr = attr.toLowerCase();
        if ((attr === 'class') || (attr === 'clas') || (attr === 'clazz')) {
            if (val) setClass($e, val);
        } else if (attr === 'style') {
            if (val) setCss($e, val);
        } else {
            attr = IEcaps[attr] || attr;
            if (isWatcher(val)) {
                if (initial) {
                    addWatcher($e, val, function(v) { $e.attr(attr, v); } );
                } else {
                    $e.attr(attr, val());
                }
            } else {
                $e.attr(attr, val);
            }
        }
    };

    var setAttrs = function($e, attrs, initial) {
        if (isWatcher(attrs)) {
            if (initial) {
                addWatcher($e, attrs, function(a) { setAttrs($e, a, false); } );
            } else {
                attrs = attrs();
            }
        } else if ($.isPlainObject(attrs)) {
            $.each(attrs, function(k, v) {
                setAttr($e, k, v, initial);
            });
        }
    };

    var clickables = {
        'a' : true,
        'form' : true,
        'button' : true
    };

    var createNode = function(node_name, node_args) {
        var callback = (clickables[node_name] && node_args.length && $.isFunction(node_args[0])) ?
            node_args.shift() : null;
        var attrs = (node_args.length && ($.isPlainObject(node_args[0]) || isWatcher(node_args[0]))) ?
            node_args.shift() : {};

        var e =  ($.browser && $.browser.msie && (node_name === "input") && attrs.name) ? ('<input name="' + attrs.name + '"/>') :  node_name;
        
        var $e = $(document.createElement(e));

        setAttrs($e, attrs, true);

        var processChild = function($parent, arg) {
            if ((arg === null) || (arg === undefined)) {
                // skip it
            } else if ($.isArray(arg)) {
                $.each(arg, function(i, c) { 
                    processChild($parent, c);
                });
            } else {
                if ((typeof(arg) === 'string') || (typeof(arg) === 'number')) {
                    arg = document.createTextNode(arg);
                } else if (isWatcher(arg)) {
                    addWatcher($parent, arg, 
                               function(v) {
                                   $(arg).empty();
                                   processChild($(arg), v);
                               });
                    arg = document.createElement('span');
                }
                $parent.append(arg);
            }
        };

        processChild($e, node_args);

        if ((node_name === "a") && !attrs.href) {
            $e.attr("href", "#");
            callback = callback || function() {};
        };

        if (callback) {
            var f = function(ev) { 
                ev.preventDefault();
                callback.apply(this);
                queueDigest();
            };
            if (node_name === "form") {
                $e.submit(f);
            } else {
                $e.click(f);
            }
        }
        return $e;
    };

    var nodeNames = [ 'table', 'tbody','thead', 'tr', 'th', 'td', 'a', 'strong', 'div', 'img',
                      'br', 'b', 'span', 'li', 'ul', 'ol', 'iframe', 'form', 'h1',
                      'input', 'h2', 'h3', 'h4','h5','h6', 'p', 'br', 'select', 'option', 'optgroup',
                      'script', 'label', 'textarea', 'em', 'button', 'b', 'hr', 'fieldset', 'nobr',
                      'object', 'embed', 'param', 'style', 'tt', 'header', 'footer', 'section', 'i', 'small'];

    var treena = {};
    $.each(nodeNames, function(i, node_name) {
        treena[node_name.toUpperCase()] = function() {
            return createNode(node_name, $.map(arguments, function(x) { return x; }));
        };
    });
    treena.NBSP = '\u00a0';

    treena.px = function(n) {
        return n + "px";
    };
    treena.url = function(n) {
        return 'url("' + n + '")';
    };
    treena.setTimeout = function(f, tm) {
        return window.setTimeout(function(a) {
            f(a);
            queueDigest();
        }, tm || 0);
    };
    treena.setInterval = function(f, tm) {
        return window.setInterval(function(a) {
            f(a);
            queueDigest();
        }, tm);
    };
    treena.digest = function(cb) {
        if (cb) {
            return function(a,b,c) {
                // cb.apply(this, Array.prototype.slice.apply(arguments));
                cb(a,b,c);
                queueDigest();
            };
        } else {
            queueDigest();
        }
    };
    treena.watcher = function(source, transformOut, transformIn) {
        if (transformOut) {
            var st = function(n) {
                if (arguments.length) {
                    source(transformIn ? transformIn(n) : n);
                } else {
                    return transformOut(source());
                }
            };
            st.__watcher__ = function() {
                return source.__watcher__ ? source.__watcher__() : source();
            };
            return st;
        } else {
            return source;
        }
    };

    treena.watch = addWatcher;

    treena.watchField = function(source, field) {
        return treena.watcher(source, 
                              function(s) {
                                  return s && s[field];
                              },
                              function(n) {
                                  var d = $.extend({}, source())
                                  d[field] = n;
                                  return d;
                              });
    };

    treena.settable = function(name, onchange) {
        var statev = undefined;
        return function (n) {
            if (arguments.length === 0) {
                return statev;
            } else if (statev !== n) {
                statev = n;
                onchange && onchange();
                treena.digest();
            }
        };
    };

    treena.setter = function(settable, $e) {
        $e.change(function() {
            settable($e.val());
        });
        return $e;
    };

    $.t = treena;
})(window.jQuery || window.Zeptos);