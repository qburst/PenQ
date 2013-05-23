"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
const Cr = Components.results;

Cu.import("resource:///modules/tabview/utils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyGetter(this, "tabviewBundle", function() {
  return Services.strings.
    createBundle("chrome://browser/locale/tabview.properties");
});

function tabviewString(name) tabviewBundle.GetStringFromName('tabview.' + name);

XPCOMUtils.defineLazyGetter(this, "gPrefBranch", function() {
  return Services.prefs.getBranch("browser.panorama.");
});

XPCOMUtils.defineLazyGetter(this, "gPrivateBrowsing", function() {
  return Cc["@mozilla.org/privatebrowsing;1"].
           getService(Ci.nsIPrivateBrowsingService);
});

XPCOMUtils.defineLazyGetter(this, "gFavIconService", function() {
  return Cc["@mozilla.org/browser/favicon-service;1"].
           getService(Ci.nsIFaviconService);
});

XPCOMUtils.defineLazyGetter(this, "gNetUtil", function() {
  var obj = {};
  Cu.import("resource://gre/modules/NetUtil.jsm", obj);
  return obj.NetUtil;
});

var gWindow = window.parent;
var gBrowser = gWindow.gBrowser;
var gTabView = gWindow.TabView;
var gTabViewDeck = gWindow.document.getElementById("tab-view-deck");
var gBrowserPanel = gWindow.document.getElementById("browser-panel");
var gTabViewFrame = gWindow.document.getElementById("tab-view");

let AllTabs = {
  _events: {
    attrModified: "TabAttrModified",
    close:        "TabClose",
    move:         "TabMove",
    open:         "TabOpen",
    select:       "TabSelect",
    pinned:       "TabPinned",
    unpinned:     "TabUnpinned"
  },

  get tabs() {
    return Array.filter(gBrowser.tabs, function (tab) !tab.closing);
  },

  register: function AllTabs_register(eventName, callback) {
    gBrowser.tabContainer.addEventListener(this._events[eventName], callback, false);
  },

  unregister: function AllTabs_unregister(eventName, callback) {
    gBrowser.tabContainer.removeEventListener(this._events[eventName], callback, false);
  }
};

//@line 71 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/tabview.js"

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is iq.js.
 *
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Ian Gilman <ian@iangilman.com>
 * Aza Raskin <aza@mozilla.com>
 * Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 * Tim Taubert <tim.taubert@gmx.de>
 *
 * This file incorporates work from:
 * jQuery JavaScript Library v1.4.2: http://code.jquery.com/jquery-1.4.2.js
 * This incorporated work is covered by the following copyright and
 * permission notice:
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: iq.js
// Various helper functions, in the vein of jQuery.

// ----------
// Function: iQ
// Returns an iQClass object which represents an individual element or a group
// of elements. It works pretty much like jQuery(), with a few exceptions,
// most notably that you can't use strings with complex html,
// just simple tags like '<div>'.
function iQ(selector, context) {
  // The iQ object is actually just the init constructor 'enhanced'
  return new iQClass(selector, context);
};

// A simple way to check for HTML strings or ID strings
// (both of which we optimize for)
let quickExpr = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/;

// Match a standalone tag
let rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

// ##########
// Class: iQClass
// The actual class of iQ result objects, representing an individual element
// or a group of elements.
//
// ----------
// Function: iQClass
// You don't call this directly; this is what's called by iQ().
function iQClass(selector, context) {

  // Handle $(""), $(null), or $(undefined)
  if (!selector) {
    return this;
  }

  // Handle $(DOMElement)
  if (selector.nodeType) {
    this.context = selector;
    this[0] = selector;
    this.length = 1;
    return this;
  }

  // The body element only exists once, optimize finding it
  if (selector === "body" && !context) {
    this.context = document;
    this[0] = document.body;
    this.selector = "body";
    this.length = 1;
    return this;
  }

  // Handle HTML strings
  if (typeof selector === "string") {
    // Are we dealing with HTML string or an ID?

    let match = quickExpr.exec(selector);

    // Verify a match, and that no context was specified for #id
    if (match && (match[1] || !context)) {

      // HANDLE $(html) -> $(array)
      if (match[1]) {
        let doc = (context ? context.ownerDocument || context : document);

        // If a single string is passed in and it's a single tag
        // just do a createElement and skip the rest
        let ret = rsingleTag.exec(selector);

        if (ret) {
          if (Utils.isPlainObject(context)) {
            Utils.assert(false, 'does not support HTML creation with context');
          } else {
            selector = [doc.createElement(ret[1])];
          }

        } else {
          Utils.assert(false, 'does not support complex HTML creation');
        }

        return Utils.merge(this, selector);

      // HANDLE $("#id")
      } else {
        let elem = document.getElementById(match[2]);

        if (elem) {
          this.length = 1;
          this[0] = elem;
        }

        this.context = document;
        this.selector = selector;
        return this;
      }

    // HANDLE $("TAG")
    } else if (!context && /^\w+$/.test(selector)) {
      this.selector = selector;
      this.context = document;
      selector = document.getElementsByTagName(selector);
      return Utils.merge(this, selector);

    // HANDLE $(expr, $(...))
    } else if (!context || context.iq) {
      return (context || iQ(document)).find(selector);

    // HANDLE $(expr, context)
    // (which is just equivalent to: $(context).find(expr)
    } else {
      return iQ(context).find(selector);
    }

  // HANDLE $(function)
  // Shortcut for document ready
  } else if (typeof selector == "function") {
    Utils.log('iQ does not support ready functions');
    return null;
  }

  if ("selector" in selector) {
    this.selector = selector.selector;
    this.context = selector.context;
  }

  let ret = this || [];
  if (selector != null) {
    // The window, strings (and functions) also have 'length'
    if (selector.length == null || typeof selector == "string" || selector.setInterval) {
      Array.push(ret, selector);
    } else {
      Utils.merge(ret, selector);
    }
  }
  return ret;
};
  
iQClass.prototype = {

  // ----------
  // Function: toString
  // Prints [iQ...] for debug use
  toString: function iQClass_toString() {
    if (this.length > 1) {
      if (this.selector)
        return "[iQ (" + this.selector + ")]";
      else
        return "[iQ multi-object]";
    }

    if (this.length == 1)
      return "[iQ (" + this[0].toString() + ")]";

    return "[iQ non-object]";
  },

  // Start with an empty selector
  selector: "",

  // The default length of a iQ object is 0
  length: 0,

  // ----------
  // Function: each
  // Execute a callback for every element in the matched set.
  each: function iQClass_each(callback) {
    if (typeof callback != "function") {
      Utils.assert(false, "each's argument must be a function");
      return null;
    }
    for (let i = 0; this[i] != null && callback(this[i]) !== false; i++) {}
    return this;
  },

  // ----------
  // Function: addClass
  // Adds the given class(es) to the receiver.
  addClass: function iQClass_addClass(value) {
    Utils.assertThrow(typeof value == "string" && value,
                      'requires a valid string argument');

    let length = this.length;
    for (let i = 0; i < length; i++) {
      let elem = this[i];
      if (elem.nodeType === 1) {
        value.split(/\s+/).forEach(function(className) {
          elem.classList.add(className);
        });
      }
    }

    return this;
  },

  // ----------
  // Function: removeClass
  // Removes the given class(es) from the receiver.
  removeClass: function iQClass_removeClass(value) {
    if (typeof value != "string" || !value) {
      Utils.assert(false, 'does not support function argument');
      return null;
    }

    let length = this.length;
    for (let i = 0; i < length; i++) {
      let elem = this[i];
      if (elem.nodeType === 1 && elem.className) {
        value.split(/\s+/).forEach(function(className) {
          elem.classList.remove(className);
        });
      }
    }

    return this;
  },

  // ----------
  // Function: hasClass
  // Returns true is the receiver has the given css class.
  hasClass: function iQClass_hasClass(singleClassName) {
    let length = this.length;
    for (let i = 0; i < length; i++) {
      if (this[i].classList.contains(singleClassName)) {
        return true;
      }
    }
    return false;
  },

  // ----------
  // Function: find
  // Searches the receiver and its children, returning a new iQ object with
  // elements that match the given selector.
  find: function iQClass_find(selector) {
    let ret = [];
    let length = 0;

    let l = this.length;
    for (let i = 0; i < l; i++) {
      length = ret.length;
      try {
        Utils.merge(ret, this[i].querySelectorAll(selector));
      } catch(e) {
        Utils.log('iQ.find error (bad selector)', e);
      }

      if (i > 0) {
        // Make sure that the results are unique
        for (let n = length; n < ret.length; n++) {
          for (let r = 0; r < length; r++) {
            if (ret[r] === ret[n]) {
              ret.splice(n--, 1);
              break;
            }
          }
        }
      }
    }

    return iQ(ret);
  },

  // ----------
  // Function: contains
  // Check to see if a given DOM node descends from the receiver.
  contains: function iQClass_contains(selector) {
    Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');

    // fast path when querySelector() can be used
    if ('string' == typeof selector)
      return null != this[0].querySelector(selector);

    let object = iQ(selector);
    Utils.assert(object.length <= 1, 'does not yet support multi-objects');

    let elem = object[0];
    if (!elem || !elem.parentNode)
      return false;

    do {
      elem = elem.parentNode;
    } while (elem && this[0] != elem);

    return this[0] == elem;
  },

  // ----------
  // Function: remove
  // Removes the receiver from the DOM.
  remove: function iQClass_remove(options) {
    if (!options || !options.preserveEventHandlers)
      this.unbindAll();
    for (let i = 0; this[i] != null; i++) {
      let elem = this[i];
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    }
    return this;
  },

  // ----------
  // Function: empty
  // Removes all of the reciever's children and HTML content from the DOM.
  empty: function iQClass_empty() {
    for (let i = 0; this[i] != null; i++) {
      let elem = this[i];
      while (elem.firstChild) {
        iQ(elem.firstChild).unbindAll();
        elem.removeChild(elem.firstChild);
      }
    }
    return this;
  },

  // ----------
  // Function: width
  // Returns the width of the receiver, including padding and border.
  width: function iQClass_width() {
    return Math.floor(this[0].offsetWidth);
  },

  // ----------
  // Function: height
  // Returns the height of the receiver, including padding and border.
  height: function iQClass_height() {
    return Math.floor(this[0].offsetHeight);
  },

  // ----------
  // Function: position
  // Returns an object with the receiver's position in left and top
  // properties.
  position: function iQClass_position() {
    let bounds = this.bounds();
    return new Point(bounds.left, bounds.top);
  },

  // ----------
  // Function: bounds
  // Returns a <Rect> with the receiver's bounds.
  bounds: function iQClass_bounds() {
    Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');
    let rect = this[0].getBoundingClientRect();
    return new Rect(Math.floor(rect.left), Math.floor(rect.top),
                    Math.floor(rect.width), Math.floor(rect.height));
  },

  // ----------
  // Function: data
  // Pass in both key and value to attach some data to the receiver;
  // pass in just key to retrieve it.
  data: function iQClass_data(key, value) {
    let data = null;
    if (value === undefined) {
      Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');
      data = this[0].iQData;
      if (data)
        return data[key];
      else
        return null;
    }

    for (let i = 0; this[i] != null; i++) {
      let elem = this[i];
      data = elem.iQData;

      if (!data)
        data = elem.iQData = {};

      data[key] = value;
    }

    return this;
  },

  // ----------
  // Function: html
  // Given a value, sets the receiver's innerHTML to it; otherwise returns
  // what's already there.
  html: function iQClass_html(value) {
    Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');
    if (value === undefined)
      return this[0].innerHTML;

    this[0].innerHTML = value;
    return this;
  },

  // ----------
  // Function: text
  // Given a value, sets the receiver's textContent to it; otherwise returns
  // what's already there.
  text: function iQClass_text(value) {
    Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');
    if (value === undefined) {
      return this[0].textContent;
    }

    return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
  },

  // ----------
  // Function: val
  // Given a value, sets the receiver's value to it; otherwise returns what's already there.
  val: function iQClass_val(value) {
    Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');
    if (value === undefined) {
      return this[0].value;
    }

    this[0].value = value;
    return this;
  },

  // ----------
  // Function: appendTo
  // Appends the receiver to the result of iQ(selector).
  appendTo: function iQClass_appendTo(selector) {
    Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');
    iQ(selector).append(this);
    return this;
  },

  // ----------
  // Function: append
  // Appends the result of iQ(selector) to the receiver.
  append: function iQClass_append(selector) {
    let object = iQ(selector);
    Utils.assert(object.length == 1 && this.length == 1, 
        'does not yet support multi-objects (or null objects)');
    this[0].appendChild(object[0]);
    return this;
  },

  // ----------
  // Function: attr
  // Sets or gets an attribute on the element(s).
  attr: function iQClass_attr(key, value) {
    Utils.assert(typeof key === 'string', 'string key');
    if (value === undefined) {
      Utils.assert(this.length == 1, 'retrieval does not support multi-objects (or null objects)');
      return this[0].getAttribute(key);
    }

    for (let i = 0; this[i] != null; i++)
      this[i].setAttribute(key, value);

    return this;
  },

  // ----------
  // Function: css
  // Sets or gets CSS properties on the receiver. When setting certain numerical properties,
  // will automatically add "px". A property can be removed by setting it to null.
  //
  // Possible call patterns:
  //   a: object, b: undefined - sets with properties from a
  //   a: string, b: undefined - gets property specified by a
  //   a: string, b: string/number - sets property specified by a to b
  css: function iQClass_css(a, b) {
    let properties = null;

    if (typeof a === 'string') {
      let key = a;
      if (b === undefined) {
        Utils.assert(this.length == 1, 'retrieval does not support multi-objects (or null objects)');

        return window.getComputedStyle(this[0], null).getPropertyValue(key);
      }
      properties = {};
      properties[key] = b;
    } else if (a instanceof Rect) {
      properties = {
        left: a.left,
        top: a.top,
        width: a.width,
        height: a.height
      };
    } else {
      properties = a;
    }

    let pixels = {
      'left': true,
      'top': true,
      'right': true,
      'bottom': true,
      'width': true,
      'height': true
    };

    for (let i = 0; this[i] != null; i++) {
      let elem = this[i];
      for (let key in properties) {
        let value = properties[key];

        if (pixels[key] && typeof value != 'string')
          value += 'px';

        if (value == null) {
          elem.style.removeProperty(key);
        } else if (key.indexOf('-') != -1)
          elem.style.setProperty(key, value, '');
        else
          elem.style[key] = value;
      }
    }

    return this;
  },

  // ----------
  // Function: animate
  // Uses CSS transitions to animate the element.
  //
  // Parameters:
  //   css - an object map of the CSS properties to change
  //   options - an object with various properites (see below)
  //
  // Possible "options" properties:
  //   duration - how long to animate, in milliseconds
  //   easing - easing function to use. Possibilities include
  //     "tabviewBounce", "easeInQuad". Default is "ease".
  //   complete - function to call once the animation is done, takes nothing
  //     in, but "this" is set to the element that was animated.
  animate: function iQClass_animate(css, options) {
    Utils.assert(this.length == 1, 'does not yet support multi-objects (or null objects)');

    if (!options)
      options = {};

    let easings = {
      tabviewBounce: "cubic-bezier(0.0, 0.63, .6, 1.29)", 
      easeInQuad: 'ease-in', // TODO: make it a real easeInQuad, or decide we don't care
      fast: 'cubic-bezier(0.7,0,1,1)'
    };

    let duration = (options.duration || 400);
    let easing = (easings[options.easing] || 'ease');

    if (css instanceof Rect) {
      css = {
        left: css.left,
        top: css.top,
        width: css.width,
        height: css.height
      };
    }


    // The latest versions of Firefox do not animate from a non-explicitly
    // set css properties. So for each element to be animated, go through
    // and explicitly define 'em.
    let rupper = /([A-Z])/g;
    this.each(function(elem) {
      let cStyle = window.getComputedStyle(elem, null);
      for (let prop in css) {
        prop = prop.replace(rupper, "-$1").toLowerCase();
        iQ(elem).css(prop, cStyle.getPropertyValue(prop));
      }
    });

    this.css({
      '-moz-transition-property': Object.keys(css).join(", "),
      '-moz-transition-duration': (duration / 1000) + 's',
      '-moz-transition-timing-function': easing
    });

    this.css(css);

    let self = this;
    setTimeout(function() {
      self.css({
        '-moz-transition-property': 'none',
        '-moz-transition-duration': '',
        '-moz-transition-timing-function': ''
      });

      if (typeof options.complete == "function")
        options.complete.apply(self);
    }, duration);

    return this;
  },

  // ----------
  // Function: fadeOut
  // Animates the receiver to full transparency. Calls callback on completion.
  fadeOut: function iQClass_fadeOut(callback) {
    Utils.assert(typeof callback == "function" || callback === undefined, 
        'does not yet support duration');

    this.animate({
      opacity: 0
    }, {
      duration: 400,
      complete: function() {
        iQ(this).css({display: 'none'});
        if (typeof callback == "function")
          callback.apply(this);
      }
    });

    return this;
  },

  // ----------
  // Function: fadeIn
  // Animates the receiver to full opacity.
  fadeIn: function iQClass_fadeIn() {
    this.css({display: ''});
    this.animate({
      opacity: 1
    }, {
      duration: 400
    });

    return this;
  },

  // ----------
  // Function: hide
  // Hides the receiver.
  hide: function iQClass_hide() {
    this.css({display: 'none', opacity: 0});
    return this;
  },

  // ----------
  // Function: show
  // Shows the receiver.
  show: function iQClass_show() {
    this.css({display: '', opacity: 1});
    return this;
  },

  // ----------
  // Function: bind
  // Binds the given function to the given event type. Also wraps the function
  // in a try/catch block that does a Utils.log on any errors.
  bind: function iQClass_bind(type, func) {
    let handler = function(event) func.apply(this, [event]);

    for (let i = 0; this[i] != null; i++) {
      let elem = this[i];
      if (!elem.iQEventData)
        elem.iQEventData = {};

      if (!elem.iQEventData[type])
        elem.iQEventData[type] = [];

      elem.iQEventData[type].push({
        original: func,
        modified: handler
      });

      elem.addEventListener(type, handler, false);
    }

    return this;
  },

  // ----------
  // Function: one
  // Binds the given function to the given event type, but only for one call;
  // automatically unbinds after the event fires once.
  one: function iQClass_one(type, func) {
    Utils.assert(typeof func == "function", 'does not support eventData argument');

    let handler = function(e) {
      iQ(this).unbind(type, handler);
      return func.apply(this, [e]);
    };

    return this.bind(type, handler);
  },

  // ----------
  // Function: unbind
  // Unbinds the given function from the given event type.
  unbind: function iQClass_unbind(type, func) {
    Utils.assert(typeof func == "function", 'Must provide a function');

    for (let i = 0; this[i] != null; i++) {
      let elem = this[i];
      let handler = func;
      if (elem.iQEventData && elem.iQEventData[type]) {
        let count = elem.iQEventData[type].length;
        for (let a = 0; a < count; a++) {
          let pair = elem.iQEventData[type][a];
          if (pair.original == func) {
            handler = pair.modified;
            elem.iQEventData[type].splice(a, 1);
            break;
          }
        }
      }

      elem.removeEventListener(type, handler, false);
    }

    return this;
  },

  // ----------
  // Function: unbindAll
  // Unbinds all event handlers.
  unbindAll: function iQClass_unbindAll() {
    for (let i = 0; this[i] != null; i++) {
      let elem = this[i];

      for (let j = 0; j < elem.childElementCount; j++)
        iQ(elem.children[j]).unbindAll();

      if (!elem.iQEventData)
        continue;

      for (let type in elem.iQEventData) {
        while (elem.iQEventData[type].length)
          this.unbind(type, elem.iQEventData[type][0].original);
      }
    }

    return this;
  }
};

// ----------
// Create various event aliases
let events = [
  'keyup',
  'keydown',
  'keypress',
  'mouseup',
  'mousedown',
  'mouseover',
  'mouseout',
  'mousemove',
  'click',
  'resize',
  'change',
  'blur',
  'focus'
];

events.forEach(function(event) {
  iQClass.prototype[event] = function(func) {
    return this.bind(event, func);
  };
});
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is storage.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Ehsan Akhgari <ehsan@mozilla.com>
 * Ian Gilman <ian@iangilman.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: storage.js

// ##########
// Class: Storage
// Singleton for permanent storage of TabView data.
let Storage = {
  GROUP_DATA_IDENTIFIER: "tabview-group",
  GROUPS_DATA_IDENTIFIER: "tabview-groups",
  TAB_DATA_IDENTIFIER: "tabview-tab",
  UI_DATA_IDENTIFIER: "tabview-ui",

  // ----------
  // Function: toString
  // Prints [Storage] for debug use
  toString: function Storage_toString() {
    return "[Storage]";
  },

  // ----------
  // Function: init
  // Sets up the object.
  init: function Storage_init() {
    this._sessionStore =
      Cc["@mozilla.org/browser/sessionstore;1"].
        getService(Ci.nsISessionStore);
  },

  // ----------
  // Function: uninit
  uninit: function Storage_uninit () {
    this._sessionStore = null;
  },

  // ----------
  // Function: wipe
  // Cleans out all the stored data, leaving empty objects.
  wipe: function Storage_wipe() {
    try {
      var self = this;

      // ___ Tabs
      AllTabs.tabs.forEach(function(tab) {
        self.saveTab(tab, null);
      });

      // ___ Other
      this.saveGroupItemsData(gWindow, {});
      this.saveUIData(gWindow, {});

      this._sessionStore.setWindowValue(gWindow, this.GROUP_DATA_IDENTIFIER,
        JSON.stringify({}));
    } catch (e) {
      Utils.log("Error in wipe: "+e);
    }
  },

  // ----------
  // Function: saveTab
  // Saves the data for a single tab.
  saveTab: function Storage_saveTab(tab, data) {
    Utils.assert(tab, "tab");

    this._sessionStore.setTabValue(tab, this.TAB_DATA_IDENTIFIER,
      JSON.stringify(data));
  },

  // ----------
  // Function: getTabData
  // Load tab data from session store and return it.
  getTabData: function Storage_getTabData(tab) {
    Utils.assert(tab, "tab");

    let existingData = null;

    try {
      let tabData = this._sessionStore.getTabValue(tab, this.TAB_DATA_IDENTIFIER);
      if (tabData != "")
        existingData = JSON.parse(tabData);
    } catch (e) {
      // getTabValue will fail if the property doesn't exist.
      Utils.log(e);
    }

    return existingData;
  },

  // ----------
  // Function: saveGroupItem
  // Saves the data for a single groupItem, associated with a specific window.
  saveGroupItem: function Storage_saveGroupItem(win, data) {
    var id = data.id;
    var existingData = this.readGroupItemData(win);
    existingData[id] = data;
    this._sessionStore.setWindowValue(win, this.GROUP_DATA_IDENTIFIER,
      JSON.stringify(existingData));
  },

  // ----------
  // Function: deleteGroupItem
  // Deletes the data for a single groupItem from the given window.
  deleteGroupItem: function Storage_deleteGroupItem(win, id) {
    var existingData = this.readGroupItemData(win);
    delete existingData[id];
    this._sessionStore.setWindowValue(win, this.GROUP_DATA_IDENTIFIER,
      JSON.stringify(existingData));
  },

  // ----------
  // Function: readGroupItemData
  // Returns the data for all groupItems associated with the given window.
  readGroupItemData: function Storage_readGroupItemData(win) {
    var existingData = {};
    let data;
    try {
      data = this._sessionStore.getWindowValue(win, this.GROUP_DATA_IDENTIFIER);
      if (data)
        existingData = JSON.parse(data);
    } catch (e) {
      // getWindowValue will fail if the property doesn't exist
      Utils.log("Error in readGroupItemData: "+e, data);
    }
    return existingData;
  },

  // ----------
  // Function: readWindowBusyState
  // Returns the current busyState for the given window.
  readWindowBusyState: function Storage_readWindowBusyState(win) {
    let state;

    try {
      let data = this._sessionStore.getWindowState(win);
      if (data)
        state = JSON.parse(data);
    } catch (e) {
      Utils.log("Error while parsing window state");
    }

    return (state && state.windows[0].busy);
  },

  // ----------
  // Function: saveGroupItemsData
  // Saves the global data for the <GroupItems> singleton for the given window.
  saveGroupItemsData: function Storage_saveGroupItemsData(win, data) {
    this.saveData(win, this.GROUPS_DATA_IDENTIFIER, data);
  },

  // ----------
  // Function: readGroupItemsData
  // Reads the global data for the <GroupItems> singleton for the given window.
  readGroupItemsData: function Storage_readGroupItemsData(win) {
    return this.readData(win, this.GROUPS_DATA_IDENTIFIER);
  },

  // ----------
  // Function: saveUIData
  // Saves the global data for the <UIManager> singleton for the given window.
  saveUIData: function Storage_saveUIData(win, data) {
    this.saveData(win, this.UI_DATA_IDENTIFIER, data);
  },

  // ----------
  // Function: readUIData
  // Reads the global data for the <UIManager> singleton for the given window.
  readUIData: function Storage_readUIData(win) {
    return this.readData(win, this.UI_DATA_IDENTIFIER);
  },

  // ----------
  // Function: saveVisibilityData
  // Saves visibility for the given window.
  saveVisibilityData: function Storage_saveVisibilityData(win, data) {
    this._sessionStore.setWindowValue(
      win, win.TabView.VISIBILITY_IDENTIFIER, data);
  },

  // ----------
  // Function: saveData
  // Generic routine for saving data to a window.
  saveData: function Storage_saveData(win, id, data) {
    try {
      this._sessionStore.setWindowValue(win, id, JSON.stringify(data));
    } catch (e) {
      Utils.log("Error in saveData: "+e);
    }
  },

  // ----------
  // Function: readData
  // Generic routine for reading data from a window.
  readData: function Storage_readData(win, id) {
    var existingData = {};
    try {
      var data = this._sessionStore.getWindowValue(win, id);
      if (data)
        existingData = JSON.parse(data);
    } catch (e) {
      Utils.log("Error in readData: "+e);
    }

    return existingData;
  }
};

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is storagePolicy.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Tim Taubert <ttaubert@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: storagePolicy.js

// ##########
// Class: StoragePolicy
// Singleton for implementing a storage policy for sensitive data.
let StoragePolicy = {
  // Pref that controls whether we can store SSL content on disk
  PREF_DISK_CACHE_SSL: "browser.cache.disk_cache_ssl",

  // Used to keep track of disk_cache_ssl preference
  _enablePersistentHttpsCaching: null,

  // Used to keep track of browsers whose data we shouldn't store permanently
  _deniedBrowsers: [],

  // ----------
  // Function: toString
  // Prints [StoragePolicy] for debug use.
  toString: function StoragePolicy_toString() {
    return "[StoragePolicy]";
  },

  // ----------
  // Function: init
  // Initializes the StoragePolicy object.
  init: function StoragePolicy_init() {
    // store the preference value
    this._enablePersistentHttpsCaching =
      Services.prefs.getBoolPref(this.PREF_DISK_CACHE_SSL);

    Services.prefs.addObserver(this.PREF_DISK_CACHE_SSL, this, false);

    // tabs are already loaded before UI is initialized so cache-control
    // values are unknown. We add browsers with https to the list for now.
    if (!this._enablePersistentHttpsCaching)
      Array.forEach(gBrowser.browsers, this._initializeBrowser.bind(this));

    // make sure to remove tab browsers when tabs get closed
    this._onTabClose = this._onTabClose.bind(this);
    gBrowser.tabContainer.addEventListener("TabClose", this._onTabClose, false);

    let mm = gWindow.messageManager;

    // add message listeners for storage granted
    this._onGranted = this._onGranted.bind(this);
    mm.addMessageListener("Panorama:StoragePolicy:granted", this._onGranted);

    // add message listeners for storage denied
    this._onDenied = this._onDenied.bind(this);
    mm.addMessageListener("Panorama:StoragePolicy:denied", this._onDenied);
  },

  // ----------
  // Function: _initializeBrowser
  // Initializes the given browser and checks if we need to add it to our
  // internal exclusion list.
  _initializeBrowser: function StoragePolicy__initializeBrowser(browser) {
    let self = this;

    function checkExclusion() {
      if (browser.currentURI.schemeIs("https"))
        self._deniedBrowsers.push(browser);
    }

    function waitForDocumentLoad() {
      let mm = browser.messageManager;

      mm.addMessageListener("Panorama:DOMContentLoaded", function onLoad(cx) {
        mm.removeMessageListener(cx.name, onLoad);
        checkExclusion(browser);
      });
    }

    this._isDocumentLoaded(browser, function (isLoaded) {
      if (isLoaded)
        checkExclusion();
      else
        waitForDocumentLoad();
    });
  },

  // ----------
  // Function: _isDocumentLoaded
  // Check if the given browser's document is loaded.
  _isDocumentLoaded: function StoragePolicy__isDocumentLoaded(browser, callback) {
    let mm = browser.messageManager;
    let message = "Panorama:isDocumentLoaded";

    mm.addMessageListener(message, function onMessage(cx) {
      mm.removeMessageListener(cx.name, onMessage);
      callback(cx.json.isLoaded);
    });

    mm.sendAsyncMessage(message);
  },

  // ----------
  // Function: uninit
  // Is called by UI.init() when the browser windows is closed.
  uninit: function StoragePolicy_uninit() {
    Services.prefs.removeObserver(this.PREF_DISK_CACHE_SSL, this);
    gBrowser.removeTabsProgressListener(this);
    gBrowser.tabContainer.removeEventListener("TabClose", this._onTabClose, false);

    let mm = gWindow.messageManager;

    // remove message listeners
    mm.removeMessageListener("Panorama:StoragePolicy:granted", this._onGranted);
    mm.removeMessageListener("Panorama:StoragePolicy:denied", this._onDenied);
  },

  // ----------
  // Function: _onGranted
  // Handle the 'granted' message and remove the given browser from the list
  // of denied browsers.
  _onGranted: function StoragePolicy__onGranted(cx) {
    let index = this._deniedBrowsers.indexOf(cx.target);

    if (index > -1)
      this._deniedBrowsers.splice(index, 1);
  },

  // ----------
  // Function: _onDenied
  // Handle the 'denied' message and add the given browser to the list of denied
  // browsers.
  _onDenied: function StoragePolicy__onDenied(cx) {
    // exclusion is optional because cache-control is not no-store or public and
    // the protocol is https. don't exclude when persistent https caching is
    // enabled.
    if ("https" == cx.json.reason && this._enablePersistentHttpsCaching)
      return;

    let browser = cx.target;

    if (this._deniedBrowsers.indexOf(browser) == -1)
      this._deniedBrowsers.push(browser);
  },

  // ----------
  // Function: _onTabClose
  // Remove the browser from our internal exclusion list when a tab gets closed.
  _onTabClose: function StoragePolicy__onTabClose(event) {
    let browser = event.target.linkedBrowser;
    let index = this._deniedBrowsers.indexOf(browser);

    if (index > -1)
      this._deniedBrowsers.splice(index, 1);
  },

  // ----------
  // Function: canStoreThumbnailForTab
  // Returns whether we're allowed to store the thumbnail of the given tab.
  canStoreThumbnailForTab: function StoragePolicy_canStoreThumbnailForTab(tab) {
    // deny saving thumbnails in private browsing mode
    if (gPrivateBrowsing.privateBrowsingEnabled &&
        UI._privateBrowsing.transitionMode != "enter")
      return false;

    return (this._deniedBrowsers.indexOf(tab.linkedBrowser) == -1);
  },

  // ----------
  // Function: observe
  // Observe pref changes.
  observe: function StoragePolicy_observe(subject, topic, data) {
    this._enablePersistentHttpsCaching =
      Services.prefs.getBoolPref(this.PREF_DISK_CACHE_SSL);
  }
};
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is items.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Ian Gilman <ian@iangilman.com>
 * Aza Raskin <aza@mozilla.com>
 * Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 * Sean Dunn <seanedunn@yahoo.com>
 * Tim Taubert <tim.taubert@gmx.de>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: items.js

// ##########
// Class: Item
// Superclass for all visible objects (<TabItem>s and <GroupItem>s).
//
// If you subclass, in addition to the things Item provides, you need to also provide these methods:
//   setBounds - function(rect, immediately, options)
//   setZ - function(value)
//   close - function()
//   save - function()
//
// Subclasses of Item must also provide the <Subscribable> interface.
//
// ... and this property:
//   defaultSize - a Point
//
// Make sure to call _init() from your subclass's constructor.
function Item() {
  // Variable: isAnItem
  // Always true for Items
  this.isAnItem = true;

  // Variable: bounds
  // The position and size of this Item, represented as a <Rect>.
  // This should never be modified without using setBounds()
  this.bounds = null;

  // Variable: zIndex
  // The z-index for this item.
  this.zIndex = 0;

  // Variable: container
  // The outermost DOM element that describes this item on screen.
  this.container = null;

  // Variable: parent
  // The groupItem that this item is a child of
  this.parent = null;

  // Variable: userSize
  // A <Point> that describes the last size specifically chosen by the user.
  // Used by unsquish.
  this.userSize = null;

  // Variable: dragOptions
  // Used by <draggable>
  //
  // Possible properties:
  //   cancelClass - A space-delimited list of classes that should cancel a drag
  //   start - A function to be called when a drag starts
  //   drag - A function to be called each time the mouse moves during drag
  //   stop - A function to be called when the drag is done
  this.dragOptions = null;

  // Variable: dropOptions
  // Used by <draggable> if the item is set to droppable.
  //
  // Possible properties:
  //   accept - A function to determine if a particular item should be accepted for dropping
  //   over - A function to be called when an item is over this item
  //   out - A function to be called when an item leaves this item
  //   drop - A function to be called when an item is dropped in this item
  this.dropOptions = null;

  // Variable: resizeOptions
  // Used by <resizable>
  //
  // Possible properties:
  //   minWidth - Minimum width allowable during resize
  //   minHeight - Minimum height allowable during resize
  //   aspectRatio - true if we should respect aspect ratio; default false
  //   start - A function to be called when resizing starts
  //   resize - A function to be called each time the mouse moves during resize
  //   stop - A function to be called when the resize is done
  this.resizeOptions = null;

  // Variable: isDragging
  // Boolean for whether the item is currently being dragged or not.
  this.isDragging = false;
};

Item.prototype = {
  // ----------
  // Function: _init
  // Initializes the object. To be called from the subclass's intialization function.
  //
  // Parameters:
  //   container - the outermost DOM element that describes this item onscreen.
  _init: function Item__init(container) {
    Utils.assert(typeof this.addSubscriber == 'function' && 
        typeof this.removeSubscriber == 'function' && 
        typeof this._sendToSubscribers == 'function',
        'Subclass must implement the Subscribable interface');
    Utils.assert(Utils.isDOMElement(container), 'container must be a DOM element');
    Utils.assert(typeof this.setBounds == 'function', 'Subclass must provide setBounds');
    Utils.assert(typeof this.setZ == 'function', 'Subclass must provide setZ');
    Utils.assert(typeof this.close == 'function', 'Subclass must provide close');
    Utils.assert(typeof this.save == 'function', 'Subclass must provide save');
    Utils.assert(Utils.isPoint(this.defaultSize), 'Subclass must provide defaultSize');
    Utils.assert(Utils.isRect(this.bounds), 'Subclass must provide bounds');

    this.container = container;
    this.$container = iQ(container);

    iQ(this.container).data('item', this);

    // ___ drag
    this.dragOptions = {
      cancelClass: 'close stackExpander',
      start: function(e, ui) {
        UI.setActive(this);
        if (this.isAGroupItem)
          this._unfreezeItemSize();
        // if we start dragging a tab within a group, start with dropSpace on.
        else if (this.parent != null)
          this.parent._dropSpaceActive = true;
        drag.info = new Drag(this, e);
      },
      drag: function(e) {
        drag.info.drag(e);
      },
      stop: function() {
        drag.info.stop();

        if (!this.isAGroupItem && !this.parent) {
          new GroupItem([drag.info.$el], {focusTitle: true});
          gTabView.firstUseExperienced = true;
        }

        drag.info = null;
      },
      // The minimum the mouse must move after mouseDown in order to move an 
      // item
      minDragDistance: 3
    };

    // ___ drop
    this.dropOptions = {
      over: function() {},
      out: function() {
        let groupItem = drag.info.item.parent;
        if (groupItem)
          groupItem.remove(drag.info.$el, {dontClose: true});
        iQ(this.container).removeClass("acceptsDrop");
      },
      drop: function(event) {
        iQ(this.container).removeClass("acceptsDrop");
      },
      // Function: dropAcceptFunction
      // Given a DOM element, returns true if it should accept tabs being dropped on it.
      // Private to this file.
      accept: function dropAcceptFunction(item) {
        return (item && item.isATabItem && (!item.parent || !item.parent.expanded));
      }
    };

    // ___ resize
    var self = this;
    this.resizeOptions = {
      aspectRatio: self.keepProportional,
      minWidth: 90,
      minHeight: 90,
      start: function(e,ui) {
        UI.setActive(this);
        resize.info = new Drag(this, e);
      },
      resize: function(e,ui) {
        resize.info.snap(UI.rtl ? 'topright' : 'topleft', false, self.keepProportional);
      },
      stop: function() {
        self.setUserSize();
        self.pushAway();
        resize.info.stop();
        resize.info = null;
      }
    };
  },

  // ----------
  // Function: getBounds
  // Returns a copy of the Item's bounds as a <Rect>.
  getBounds: function Item_getBounds() {
    Utils.assert(Utils.isRect(this.bounds), 'this.bounds should be a rect');
    return new Rect(this.bounds);
  },

  // ----------
  // Function: overlapsWithOtherItems
  // Returns true if this Item overlaps with any other Item on the screen.
  overlapsWithOtherItems: function Item_overlapsWithOtherItems() {
    var self = this;
    var items = Items.getTopLevelItems();
    var bounds = this.getBounds();
    return items.some(function(item) {
      if (item == self) // can't overlap with yourself.
        return false;
      var myBounds = item.getBounds();
      return myBounds.intersects(bounds);
    } );
  },

  // ----------
  // Function: setPosition
  // Moves the Item to the specified location.
  //
  // Parameters:
  //   left - the new left coordinate relative to the window
  //   top - the new top coordinate relative to the window
  //   immediately - if false or omitted, animates to the new position;
  //   otherwise goes there immediately
  setPosition: function Item_setPosition(left, top, immediately) {
    Utils.assert(Utils.isRect(this.bounds), 'this.bounds');
    this.setBounds(new Rect(left, top, this.bounds.width, this.bounds.height), immediately);
  },

  // ----------
  // Function: setSize
  // Resizes the Item to the specified size.
  //
  // Parameters:
  //   width - the new width in pixels
  //   height - the new height in pixels
  //   immediately - if false or omitted, animates to the new size;
  //   otherwise resizes immediately
  setSize: function Item_setSize(width, height, immediately) {
    Utils.assert(Utils.isRect(this.bounds), 'this.bounds');
    this.setBounds(new Rect(this.bounds.left, this.bounds.top, width, height), immediately);
  },

  // ----------
  // Function: setUserSize
  // Remembers the current size as one the user has chosen.
  setUserSize: function Item_setUserSize() {
    Utils.assert(Utils.isRect(this.bounds), 'this.bounds');
    this.userSize = new Point(this.bounds.width, this.bounds.height);
    this.save();
  },

  // ----------
  // Function: getZ
  // Returns the zIndex of the Item.
  getZ: function Item_getZ() {
    return this.zIndex;
  },

  // ----------
  // Function: setRotation
  // Rotates the object to the given number of degrees.
  setRotation: function Item_setRotation(degrees) {
    var value = degrees ? "rotate(%deg)".replace(/%/, degrees) : null;
    iQ(this.container).css({"-moz-transform": value});
  },

  // ----------
  // Function: setParent
  // Sets the receiver's parent to the given <Item>.
  setParent: function Item_setParent(parent) {
    this.parent = parent;
    this.removeTrenches();
    this.save();
  },

  // ----------
  // Function: pushAway
  // Pushes all other items away so none overlap this Item.
  //
  // Parameters:
  //  immediately - boolean for doing the pushAway without animation
  pushAway: function Item_pushAway(immediately) {
    var items = Items.getTopLevelItems();

    // we need at least two top-level items to push something away
    if (items.length < 2)
      return;

    var buffer = Math.floor(Items.defaultGutter / 2);

    // setup each Item's pushAwayData attribute:
    items.forEach(function pushAway_setupPushAwayData(item) {
      var data = {};
      data.bounds = item.getBounds();
      data.startBounds = new Rect(data.bounds);
      // Infinity = (as yet) unaffected
      data.generation = Infinity;
      item.pushAwayData = data;
    });

    // The first item is a 0-generation pushed item. It all starts here.
    var itemsToPush = [this];
    this.pushAwayData.generation = 0;

    var pushOne = function Item_pushAway_pushOne(baseItem) {
      // the baseItem is an n-generation pushed item. (n could be 0)
      var baseData = baseItem.pushAwayData;
      var bb = new Rect(baseData.bounds);

      // make the bounds larger, adding a +buffer margin to each side.
      bb.inset(-buffer, -buffer);
      // bbc = center of the base's bounds
      var bbc = bb.center();

      items.forEach(function Item_pushAway_pushOne_pushEach(item) {
        if (item == baseItem)
          return;

        var data = item.pushAwayData;
        // if the item under consideration has already been pushed, or has a lower
        // "generation" (and thus an implictly greater placement priority) then don't move it.
        if (data.generation <= baseData.generation)
          return;

        // box = this item's current bounds, with a +buffer margin.
        var bounds = data.bounds;
        var box = new Rect(bounds);
        box.inset(-buffer, -buffer);

        // if the item under consideration overlaps with the base item...
        if (box.intersects(bb)) {

          // Let's push it a little.

          // First, decide in which direction and how far to push. This is the offset.
          var offset = new Point();
          // center = the current item's center.
          var center = box.center();

          // Consider the relationship between the current item (box) + the base item.
          // If it's more vertically stacked than "side by side"...
          if (Math.abs(center.x - bbc.x) < Math.abs(center.y - bbc.y)) {
            // push vertically.
            if (center.y > bbc.y)
              offset.y = bb.bottom - box.top;
            else
              offset.y = bb.top - box.bottom;
          } else { // if they're more "side by side" than stacked vertically...
            // push horizontally.
            if (center.x > bbc.x)
              offset.x = bb.right - box.left;
            else
              offset.x = bb.left - box.right;
          }

          // Actually push the Item.
          bounds.offset(offset);

          // This item now becomes an (n+1)-generation pushed item.
          data.generation = baseData.generation + 1;
          // keep track of who pushed this item.
          data.pusher = baseItem;
          // add this item to the queue, so that it, in turn, can push some other things.
          itemsToPush.push(item);
        }
      });
    };

    // push each of the itemsToPush, one at a time.
    // itemsToPush starts with just [this], but pushOne can add more items to the stack.
    // Maximally, this could run through all Items on the screen.
    while (itemsToPush.length)
      pushOne(itemsToPush.shift());

    // ___ Squish!
    var pageBounds = Items.getSafeWindowBounds();
    items.forEach(function Item_pushAway_squish(item) {
      var data = item.pushAwayData;
      if (data.generation == 0)
        return;

      let apply = function Item_pushAway_squish_apply(item, posStep, posStep2, sizeStep) {
        var data = item.pushAwayData;
        if (data.generation == 0)
          return;

        var bounds = data.bounds;
        bounds.width -= sizeStep.x;
        bounds.height -= sizeStep.y;
        bounds.left += posStep.x;
        bounds.top += posStep.y;

        let validSize;
        if (item.isAGroupItem) {
          validSize = GroupItems.calcValidSize(
            new Point(bounds.width, bounds.height));
          bounds.width = validSize.x;
          bounds.height = validSize.y;
        } else {
          if (sizeStep.y > sizeStep.x) {
            validSize = TabItems.calcValidSize(new Point(-1, bounds.height));
            bounds.left += (bounds.width - validSize.x) / 2;
            bounds.width = validSize.x;
          } else {
            validSize = TabItems.calcValidSize(new Point(bounds.width, -1));
            bounds.top += (bounds.height - validSize.y) / 2;
            bounds.height = validSize.y;        
          }
        }

        var pusher = data.pusher;
        if (pusher) {
          var newPosStep = new Point(posStep.x + posStep2.x, posStep.y + posStep2.y);
          apply(pusher, newPosStep, posStep2, sizeStep);
        }
      }

      var bounds = data.bounds;
      var posStep = new Point();
      var posStep2 = new Point();
      var sizeStep = new Point();

      if (bounds.left < pageBounds.left) {
        posStep.x = pageBounds.left - bounds.left;
        sizeStep.x = posStep.x / data.generation;
        posStep2.x = -sizeStep.x;
      } else if (bounds.right > pageBounds.right) { // this may be less of a problem post-601534
        posStep.x = pageBounds.right - bounds.right;
        sizeStep.x = -posStep.x / data.generation;
        posStep.x += sizeStep.x;
        posStep2.x = sizeStep.x;
      }

      if (bounds.top < pageBounds.top) {
        posStep.y = pageBounds.top - bounds.top;
        sizeStep.y = posStep.y / data.generation;
        posStep2.y = -sizeStep.y;
      } else if (bounds.bottom > pageBounds.bottom) { // this may be less of a problem post-601534
        posStep.y = pageBounds.bottom - bounds.bottom;
        sizeStep.y = -posStep.y / data.generation;
        posStep.y += sizeStep.y;
        posStep2.y = sizeStep.y;
      }

      if (posStep.x || posStep.y || sizeStep.x || sizeStep.y)
        apply(item, posStep, posStep2, sizeStep);        
    });

    // ___ Unsquish
    var pairs = [];
    items.forEach(function Item_pushAway_setupUnsquish(item) {
      var data = item.pushAwayData;
      pairs.push({
        item: item,
        bounds: data.bounds
      });
    });

    Items.unsquish(pairs);

    // ___ Apply changes
    items.forEach(function Item_pushAway_setBounds(item) {
      var data = item.pushAwayData;
      var bounds = data.bounds;
      if (!bounds.equals(data.startBounds)) {
        item.setBounds(bounds, immediately);
      }
    });
  },

  // ----------
  // Function: setTrenches
  // Sets up/moves the trenches for snapping to this item.
  setTrenches: function Item_setTrenches(rect) {
    if (this.parent !== null)
      return;

    if (!this.borderTrenches)
      this.borderTrenches = Trenches.registerWithItem(this,"border");

    var bT = this.borderTrenches;
    Trenches.getById(bT.left).setWithRect(rect);
    Trenches.getById(bT.right).setWithRect(rect);
    Trenches.getById(bT.top).setWithRect(rect);
    Trenches.getById(bT.bottom).setWithRect(rect);

    if (!this.guideTrenches)
      this.guideTrenches = Trenches.registerWithItem(this,"guide");

    var gT = this.guideTrenches;
    Trenches.getById(gT.left).setWithRect(rect);
    Trenches.getById(gT.right).setWithRect(rect);
    Trenches.getById(gT.top).setWithRect(rect);
    Trenches.getById(gT.bottom).setWithRect(rect);

  },

  // ----------
  // Function: removeTrenches
  // Removes the trenches for snapping to this item.
  removeTrenches: function Item_removeTrenches() {
    for (var edge in this.borderTrenches) {
      Trenches.unregister(this.borderTrenches[edge]); // unregister can take an array
    }
    this.borderTrenches = null;
    for (var edge in this.guideTrenches) {
      Trenches.unregister(this.guideTrenches[edge]); // unregister can take an array
    }
    this.guideTrenches = null;
  },

  // ----------
  // Function: snap
  // The snap function used during groupItem creation via drag-out
  //
  // Parameters:
  //  immediately - bool for having the drag do the final positioning without animation
  snap: function Item_snap(immediately) {
    // make the snapping work with a wider range!
    var defaultRadius = Trenches.defaultRadius;
    Trenches.defaultRadius = 2 * defaultRadius; // bump up from 10 to 20!

    var FauxDragInfo = new Drag(this, {});
    FauxDragInfo.snap('none', false);
    FauxDragInfo.stop(immediately);

    Trenches.defaultRadius = defaultRadius;
  },

  // ----------
  // Function: draggable
  // Enables dragging on this item. Note: not to be called multiple times on the same item!
  draggable: function Item_draggable() {
    try {
      Utils.assert(this.dragOptions, 'dragOptions');

      var cancelClasses = [];
      if (typeof this.dragOptions.cancelClass == 'string')
        cancelClasses = this.dragOptions.cancelClass.split(' ');

      var self = this;
      var $container = iQ(this.container);
      var startMouse;
      var startPos;
      var startSent;
      var startEvent;
      var droppables;
      var dropTarget;

      // determine the best drop target based on the current mouse coordinates
      let determineBestDropTarget = function (e, box) {
        // drop events
        var best = {
          dropTarget: null,
          score: 0
        };

        droppables.forEach(function(droppable) {
          var intersection = box.intersection(droppable.bounds);
          if (intersection && intersection.area() > best.score) {
            var possibleDropTarget = droppable.item;
            var accept = true;
            if (possibleDropTarget != dropTarget) {
              var dropOptions = possibleDropTarget.dropOptions;
              if (dropOptions && typeof dropOptions.accept == "function")
                accept = dropOptions.accept.apply(possibleDropTarget, [self]);
            }

            if (accept) {
              best.dropTarget = possibleDropTarget;
              best.score = intersection.area();
            }
          }
        });

        return best.dropTarget;
      }

      // ___ mousemove
      var handleMouseMove = function(e) {
        // global drag tracking
        drag.lastMoveTime = Date.now();

        // positioning
        var mouse = new Point(e.pageX, e.pageY);
        if (!startSent) {
          if(Math.abs(mouse.x - startMouse.x) > self.dragOptions.minDragDistance ||
             Math.abs(mouse.y - startMouse.y) > self.dragOptions.minDragDistance) {
            if (typeof self.dragOptions.start == "function")
              self.dragOptions.start.apply(self,
                  [startEvent, {position: {left: startPos.x, top: startPos.y}}]);
            startSent = true;
          }
        }
        if (startSent) {
          // drag events
          var box = self.getBounds();
          box.left = startPos.x + (mouse.x - startMouse.x);
          box.top = startPos.y + (mouse.y - startMouse.y);
          self.setBounds(box, true);

          if (typeof self.dragOptions.drag == "function")
            self.dragOptions.drag.apply(self, [e]);

          let bestDropTarget = determineBestDropTarget(e, box);

          if (bestDropTarget != dropTarget) {
            var dropOptions;
            if (dropTarget) {
              dropOptions = dropTarget.dropOptions;
              if (dropOptions && typeof dropOptions.out == "function")
                dropOptions.out.apply(dropTarget, [e]);
            }

            dropTarget = bestDropTarget;

            if (dropTarget) {
              dropOptions = dropTarget.dropOptions;
              if (dropOptions && typeof dropOptions.over == "function")
                dropOptions.over.apply(dropTarget, [e]);
            }
          }
          if (dropTarget) {
            dropOptions = dropTarget.dropOptions;
            if (dropOptions && typeof dropOptions.move == "function")
              dropOptions.move.apply(dropTarget, [e]);
          }
        }

        e.preventDefault();
      };

      // ___ mouseup
      var handleMouseUp = function(e) {
        iQ(gWindow)
          .unbind('mousemove', handleMouseMove)
          .unbind('mouseup', handleMouseUp);

        if (startSent && dropTarget) {
          var dropOptions = dropTarget.dropOptions;
          if (dropOptions && typeof dropOptions.drop == "function")
            dropOptions.drop.apply(dropTarget, [e]);
        }

        if (startSent && typeof self.dragOptions.stop == "function")
          self.dragOptions.stop.apply(self, [e]);

        e.preventDefault();
      };

      // ___ mousedown
      $container.mousedown(function(e) {
        if (!Utils.isLeftClick(e))
          return;

        var cancel = false;
        var $target = iQ(e.target);
        cancelClasses.forEach(function(className) {
          if ($target.hasClass(className))
            cancel = true;
        });

        if (cancel) {
          e.preventDefault();
          return;
        }

        startMouse = new Point(e.pageX, e.pageY);
        let bounds = self.getBounds();
        startPos = bounds.position();
        startEvent = e;
        startSent = false;

        droppables = [];
        iQ('.iq-droppable').each(function(elem) {
          if (elem != self.container) {
            var item = Items.item(elem);
            droppables.push({
              item: item,
              bounds: item.getBounds()
            });
          }
        });

        dropTarget = determineBestDropTarget(e, bounds);

        iQ(gWindow)
          .mousemove(handleMouseMove)
          .mouseup(handleMouseUp);

        e.preventDefault();
      });
    } catch(e) {
      Utils.log(e);
    }
  },

  // ----------
  // Function: droppable
  // Enables or disables dropping on this item.
  droppable: function Item_droppable(value) {
    try {
      var $container = iQ(this.container);
      if (value) {
        Utils.assert(this.dropOptions, 'dropOptions');
        $container.addClass('iq-droppable');
      } else
        $container.removeClass('iq-droppable');
    } catch(e) {
      Utils.log(e);
    }
  },

  // ----------
  // Function: resizable
  // Enables or disables resizing of this item.
  resizable: function Item_resizable(value) {
    try {
      var $container = iQ(this.container);
      iQ('.iq-resizable-handle', $container).remove();

      if (!value) {
        $container.removeClass('iq-resizable');
      } else {
        Utils.assert(this.resizeOptions, 'resizeOptions');

        $container.addClass('iq-resizable');

        var self = this;
        var startMouse;
        var startSize;
        var startAspect;

        // ___ mousemove
        var handleMouseMove = function(e) {
          // global resize tracking
          resize.lastMoveTime = Date.now();

          var mouse = new Point(e.pageX, e.pageY);
          var box = self.getBounds();
          if (UI.rtl) {
            var minWidth = (self.resizeOptions.minWidth || 0);
            var oldWidth = box.width;
            if (minWidth != oldWidth || mouse.x < startMouse.x) {
              box.width = Math.max(minWidth, startSize.x - (mouse.x - startMouse.x));
              box.left -= box.width - oldWidth;
            }
          } else {
            box.width = Math.max(self.resizeOptions.minWidth || 0, startSize.x + (mouse.x - startMouse.x));
          }
          box.height = Math.max(self.resizeOptions.minHeight || 0, startSize.y + (mouse.y - startMouse.y));

          if (self.resizeOptions.aspectRatio) {
            if (startAspect < 1)
              box.height = box.width * startAspect;
            else
              box.width = box.height / startAspect;
          }

          self.setBounds(box, true);

          if (typeof self.resizeOptions.resize == "function")
            self.resizeOptions.resize.apply(self, [e]);

          e.preventDefault();
          e.stopPropagation();
        };

        // ___ mouseup
        var handleMouseUp = function(e) {
          iQ(gWindow)
            .unbind('mousemove', handleMouseMove)
            .unbind('mouseup', handleMouseUp);

          if (typeof self.resizeOptions.stop == "function")
            self.resizeOptions.stop.apply(self, [e]);

          e.preventDefault();
          e.stopPropagation();
        };

        // ___ handle + mousedown
        iQ('<div>')
          .addClass('iq-resizable-handle iq-resizable-se')
          .appendTo($container)
          .mousedown(function(e) {
            if (!Utils.isLeftClick(e))
              return;

            startMouse = new Point(e.pageX, e.pageY);
            startSize = self.getBounds().size();
            startAspect = startSize.y / startSize.x;

            if (typeof self.resizeOptions.start == "function")
              self.resizeOptions.start.apply(self, [e]);

            iQ(gWindow)
              .mousemove(handleMouseMove)
              .mouseup(handleMouseUp);

            e.preventDefault();
            e.stopPropagation();
          });
        }
    } catch(e) {
      Utils.log(e);
    }
  }
};

// ##########
// Class: Items
// Keeps track of all Items.
let Items = {
  // ----------
  // Function: toString
  // Prints [Items] for debug use
  toString: function Items_toString() {
    return "[Items]";
  },

  // ----------
  // Variable: defaultGutter
  // How far apart Items should be from each other and from bounds
  defaultGutter: 15,

  // ----------
  // Function: item
  // Given a DOM element representing an Item, returns the Item.
  item: function Items_item(el) {
    return iQ(el).data('item');
  },

  // ----------
  // Function: getTopLevelItems
  // Returns an array of all Items not grouped into groupItems.
  getTopLevelItems: function Items_getTopLevelItems() {
    var items = [];

    iQ('.tab, .groupItem').each(function(elem) {
      var $this = iQ(elem);
      var item = $this.data('item');
      if (item && !item.parent && !$this.hasClass('phantom'))
        items.push(item);
    });

    return items;
  },

  // ----------
  // Function: getPageBounds
  // Returns a <Rect> defining the area of the page <Item>s should stay within.
  getPageBounds: function Items_getPageBounds() {
    var width = Math.max(100, window.innerWidth);
    var height = Math.max(100, window.innerHeight);
    return new Rect(0, 0, width, height);
  },

  // ----------
  // Function: getSafeWindowBounds
  // Returns the bounds within which it is safe to place all non-stationary <Item>s.
  getSafeWindowBounds: function Items_getSafeWindowBounds() {
    // the safe bounds that would keep it "in the window"
    var gutter = Items.defaultGutter;
    // Here, I've set the top gutter separately, as the top of the window has its own
    // extra chrome which makes a large top gutter unnecessary.
    // TODO: set top gutter separately, elsewhere.
    var topGutter = 5;
    return new Rect(gutter, topGutter,
        window.innerWidth - 2 * gutter, window.innerHeight - gutter - topGutter);

  },

  // ----------
  // Function: arrange
  // Arranges the given items in a grid within the given bounds,
  // maximizing item size but maintaining standard tab aspect ratio for each
  //
  // Parameters:
  //   items - an array of <Item>s. Can be null, in which case we won't
  //     actually move anything.
  //   bounds - a <Rect> defining the space to arrange within
  //   options - an object with various properites (see below)
  //
  // Possible "options" properties:
  //   animate - whether to animate; default: true.
  //   z - the z index to set all the items; default: don't change z.
  //   return - if set to 'widthAndColumns', it'll return an object with the
  //     width of children and the columns.
  //   count - overrides the item count for layout purposes;
  //     default: the actual item count
  //   columns - (int) a preset number of columns to use
  //   dropPos - a <Point> which should have a one-tab space left open, used
  //             when a tab is dragged over.
  //
  // Returns:
  //   By default, an object with three properties: `rects`, the list of <Rect>s,
  //   `dropIndex`, the index which a dragged tab should have if dropped
  //   (null if no `dropPos` was specified), and the number of columns (`columns`).
  //   If the `return` option is set to 'widthAndColumns', an object with the
  //   width value of the child items (`childWidth`) and the number of columns
  //   (`columns`) is returned.
  arrange: function Items_arrange(items, bounds, options) {
    if (!options)
      options = {};
    var animate = "animate" in options ? options.animate : true;
    var immediately = !animate;

    var rects = [];

    var count = options.count || (items ? items.length : 0);
    if (options.addTab)
      count++;
    if (!count) {
      let dropIndex = (Utils.isPoint(options.dropPos)) ? 0 : null;
      return {rects: rects, dropIndex: dropIndex};
    }

    var columns = options.columns || 1;
    // We'll assume for the time being that all the items have the same styling
    // and that the margin is the same width around.
    var itemMargin = items && items.length ?
                       parseInt(iQ(items[0].container).css('margin-left')) : 0;
    var padding = itemMargin * 2;
    var rows;
    var tabWidth;
    var tabHeight;
    var totalHeight;

    function figure() {
      rows = Math.ceil(count / columns);
      let validSize = TabItems.calcValidSize(
        new Point((bounds.width - (padding * columns)) / columns, -1),
        options);
      tabWidth = validSize.x;
      tabHeight = validSize.y;

      totalHeight = (tabHeight * rows) + (padding * rows);    
    }

    figure();

    while (rows > 1 && totalHeight > bounds.height) {
      columns++;
      figure();
    }

    if (rows == 1) {
      let validSize = TabItems.calcValidSize(new Point(tabWidth,
        bounds.height - 2 * itemMargin), options);
      tabWidth = validSize.x;
      tabHeight = validSize.y;
    }
    
    if (options.return == 'widthAndColumns')
      return {childWidth: tabWidth, columns: columns};

    let initialOffset = 0;
    if (UI.rtl) {
      initialOffset = bounds.width - tabWidth - padding;
    }
    var box = new Rect(bounds.left + initialOffset, bounds.top, tabWidth, tabHeight);

    var column = 0;

    var dropIndex = false;
    var dropRect = false;
    if (Utils.isPoint(options.dropPos))
      dropRect = new Rect(options.dropPos.x, options.dropPos.y, 1, 1);
    for (let a = 0; a < count; a++) {
      // If we had a dropPos, see if this is where we should place it
      if (dropRect) {
        let activeBox = new Rect(box);
        activeBox.inset(-itemMargin - 1, -itemMargin - 1);
        // if the designated position (dropRect) is within the active box,
        // this is where, if we drop the tab being dragged, it should land!
        if (activeBox.contains(dropRect))
          dropIndex = a;
      }
      
      // record the box.
      rects.push(new Rect(box));

      box.left += (UI.rtl ? -1 : 1) * (box.width + padding);
      column++;
      if (column == columns) {
        box.left = bounds.left + initialOffset;
        box.top += box.height + padding;
        column = 0;
      }
    }

    return {rects: rects, dropIndex: dropIndex, columns: columns};
  },

  // ----------
  // Function: unsquish
  // Checks to see which items can now be unsquished.
  //
  // Parameters:
  //   pairs - an array of objects, each with two properties: item and bounds. The bounds are
  //     modified as appropriate, but the items are not changed. If pairs is null, the
  //     operation is performed directly on all of the top level items.
  //   ignore - an <Item> to not include in calculations (because it's about to be closed, for instance)
  unsquish: function Items_unsquish(pairs, ignore) {
    var pairsProvided = (pairs ? true : false);
    if (!pairsProvided) {
      var items = Items.getTopLevelItems();
      pairs = [];
      items.forEach(function(item) {
        pairs.push({
          item: item,
          bounds: item.getBounds()
        });
      });
    }

    var pageBounds = Items.getSafeWindowBounds();
    pairs.forEach(function(pair) {
      var item = pair.item;
      if (item == ignore)
        return;

      var bounds = pair.bounds;
      var newBounds = new Rect(bounds);

      var newSize;
      if (Utils.isPoint(item.userSize))
        newSize = new Point(item.userSize);
      else if (item.isAGroupItem)
        newSize = GroupItems.calcValidSize(
          new Point(GroupItems.minGroupWidth, -1));
      else
        newSize = TabItems.calcValidSize(
          new Point(TabItems.tabWidth, -1));

      if (item.isAGroupItem) {
          newBounds.width = Math.max(newBounds.width, newSize.x);
          newBounds.height = Math.max(newBounds.height, newSize.y);
      } else {
        if (bounds.width < newSize.x) {
          newBounds.width = newSize.x;
          newBounds.height = newSize.y;
        }
      }

      newBounds.left -= (newBounds.width - bounds.width) / 2;
      newBounds.top -= (newBounds.height - bounds.height) / 2;

      var offset = new Point();
      if (newBounds.left < pageBounds.left)
        offset.x = pageBounds.left - newBounds.left;
      else if (newBounds.right > pageBounds.right)
        offset.x = pageBounds.right - newBounds.right;

      if (newBounds.top < pageBounds.top)
        offset.y = pageBounds.top - newBounds.top;
      else if (newBounds.bottom > pageBounds.bottom)
        offset.y = pageBounds.bottom - newBounds.bottom;

      newBounds.offset(offset);

      if (!bounds.equals(newBounds)) {
        var blocked = false;
        pairs.forEach(function(pair2) {
          if (pair2 == pair || pair2.item == ignore)
            return;

          var bounds2 = pair2.bounds;
          if (bounds2.intersects(newBounds))
            blocked = true;
          return;
        });

        if (!blocked) {
          pair.bounds.copy(newBounds);
        }
      }
      return;
    });

    if (!pairsProvided) {
      pairs.forEach(function(pair) {
        pair.item.setBounds(pair.bounds);
      });
    }
  }
};
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is groupItems.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Ian Gilman <ian@iangilman.com>
 * Aza Raskin <aza@mozilla.com>
 * Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 * Ehsan Akhgari <ehsan@mozilla.com>
 * Raymond Lee <raymond@appcoast.com>
 * Tim Taubert <tim.taubert@gmx.de>
 * Sean Dunn <seanedunn@yahoo.com>
 * Mihai Sucan <mihai.sucan@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: groupItems.js

// ##########
// Class: GroupItem
// A single groupItem in the TabView window. Descended from <Item>.
// Note that it implements the <Subscribable> interface.
//
// ----------
// Constructor: GroupItem
//
// Parameters:
//   listOfEls - an array of DOM elements for tabs to be added to this groupItem
//   options - various options for this groupItem (see below). In addition, gets passed
//     to <add> along with the elements provided.
//
// Possible options:
//   id - specifies the groupItem's id; otherwise automatically generated
//   userSize - see <Item.userSize>; default is null
//   bounds - a <Rect>; otherwise based on the locations of the provided elements
//   container - a DOM element to use as the container for this groupItem; otherwise will create
//   title - the title for the groupItem; otherwise blank
//   focusTitle - focus the title's input field after creation
//   dontPush - true if this groupItem shouldn't push away or snap on creation; default is false
//   immediately - true if we want all placement immediately, not with animation
function GroupItem(listOfEls, options) {
  if (!options)
    options = {};

  this._inited = false;
  this._uninited = false;
  this._children = []; // an array of Items
  this.defaultSize = new Point(TabItems.tabWidth * 1.5, TabItems.tabHeight * 1.5);
  this.isAGroupItem = true;
  this.id = options.id || GroupItems.getNextID();
  this._isStacked = false;
  this.expanded = null;
  this.hidden = false;
  this.fadeAwayUndoButtonDelay = 15000;
  this.fadeAwayUndoButtonDuration = 300;

  this.keepProportional = false;
  this._frozenItemSizeData = {};

  this._onChildClose = this._onChildClose.bind(this);

  // Variable: _activeTab
  // The <TabItem> for the groupItem's active tab.
  this._activeTab = null;

  if (Utils.isPoint(options.userSize))
    this.userSize = new Point(options.userSize);

  var self = this;

  var rectToBe;
  if (options.bounds) {
    Utils.assert(Utils.isRect(options.bounds), "options.bounds must be a Rect");
    rectToBe = new Rect(options.bounds);
  }

  if (!rectToBe) {
    rectToBe = GroupItems.getBoundingBox(listOfEls);
    rectToBe.inset(-42, -42);
  }

  var $container = options.container;
  let immediately = options.immediately || $container ? true : false;
  if (!$container) {
    $container = iQ('<div>')
      .addClass('groupItem')
      .css({position: 'absolute'})
      .css(rectToBe);
  }

  this.bounds = $container.bounds();

  this.isDragging = false;
  $container
    .css({zIndex: -100})
    .attr("data-id", this.id)
    .appendTo("body");

  // ___ Resizer
  this.$resizer = iQ("<div>")
    .addClass('resizer')
    .appendTo($container)
    .hide();

  // ___ Titlebar
  var html =
    "<div class='title-container'>" +
      "<input class='name' placeholder='" + this.defaultName + "'/>" +
      "<div class='title-shield' />" +
    "</div>";

  this.$titlebar = iQ('<div>')
    .addClass('titlebar')
    .html(html)
    .appendTo($container);

  this.$closeButton = iQ('<div>')
    .addClass('close')
    .click(function() {
      self.closeAll();
    })
    .appendTo($container);

  // ___ Title
  this.$titleContainer = iQ('.title-container', this.$titlebar);
  this.$title = iQ('.name', this.$titlebar);
  this.$titleShield = iQ('.title-shield', this.$titlebar);
  this.setTitle(options.title);

  var handleKeyPress = function (e) {
    if (e.keyCode == KeyEvent.DOM_VK_ESCAPE ||
        e.keyCode == KeyEvent.DOM_VK_RETURN ||
        e.keyCode == KeyEvent.DOM_VK_ENTER) {
      (self.$title)[0].blur();
      self.$title
        .addClass("transparentBorder")
        .one("mouseout", function() {
          self.$title.removeClass("transparentBorder");
        });
      e.stopPropagation();
      e.preventDefault();
    }
  };

  var handleKeyUp = function(e) {
    // NOTE: When user commits or cancels IME composition, the last key
    //       event fires only a keyup event.  Then, we shouldn't take any
    //       reactions but we should update our status.
    self.save();
  };

  this.$title
    .blur(function() {
      self._titleFocused = false;
      self.$title[0].setSelectionRange(0, 0);
      self.$titleShield.show();
      if (self.getTitle())
        gTabView.firstUseExperienced = true;
      self.save();
    })
    .focus(function() {
      self._unfreezeItemSize();
      if (!self._titleFocused) {
        (self.$title)[0].select();
        self._titleFocused = true;
      }
    })
    .mousedown(function(e) {
      e.stopPropagation();
    })
    .keypress(handleKeyPress)
    .keyup(handleKeyUp);

  this.$titleShield
    .mousedown(function(e) {
      self.lastMouseDownTarget = (Utils.isLeftClick(e) ? e.target : null);
    })
    .mouseup(function(e) {
      var same = (e.target == self.lastMouseDownTarget);
      self.lastMouseDownTarget = null;
      if (!same)
        return;

      if (!self.isDragging)
        self.focusTitle();
    });

  if (options.focusTitle)
    this.focusTitle();

  // ___ Stack Expander
  this.$expander = iQ("<div/>")
    .addClass("stackExpander")
    .appendTo($container)
    .hide();

  // ___ app tabs: create app tab tray and populate it
  let appTabTrayContainer = iQ("<div/>")
    .addClass("appTabTrayContainer")
    .appendTo($container);
  this.$appTabTray = iQ("<div/>")
    .addClass("appTabTray")
    .appendTo(appTabTrayContainer);

  AllTabs.tabs.forEach(function(xulTab) {
    if (xulTab.pinned)
      self.addAppTab(xulTab, {dontAdjustTray: true});
  });

  // ___ Undo Close
  this.$undoContainer = null;
  this._undoButtonTimeoutId = null;

  // ___ Superclass initialization
  this._init($container[0]);

  // ___ Children
  // We explicitly set dontArrange=true to prevent the groupItem from
  // re-arranging its children after a tabItem has been added. This saves us a
  // group.arrange() call per child and therefore some tab.setBounds() calls.
  options.dontArrange = true;
  listOfEls.forEach(function (el) {
    self.add(el, options);
  });

  // ___ Finish Up
  this._addHandlers($container);

  this.setResizable(true, immediately);

  GroupItems.register(this);

  // ___ Position
  this.setBounds(rectToBe, immediately);
  if (options.dontPush) {
    this.setZ(drag.zIndex);
    drag.zIndex++; 
  } else {
    // Calling snap will also trigger pushAway
    this.snap(immediately);
  }

  if (!options.immediately && listOfEls.length > 0)
    $container.hide().fadeIn();

  this._inited = true;
  this.save();

  GroupItems.updateGroupCloseButtons();
};

// ----------
GroupItem.prototype = Utils.extend(new Item(), new Subscribable(), {
  // ----------
  // Function: toString
  // Prints [GroupItem id=id] for debug use
  toString: function GroupItem_toString() {
    return "[GroupItem id=" + this.id + "]";
  },

  // ----------
  // Variable: defaultName
  // The prompt text for the title field.
  defaultName: tabviewString('groupItem.defaultName'),

  // -----------
  // Function: setActiveTab
  // Sets the active <TabItem> for this groupItem; can be null, but only
  // if there are no children.
  setActiveTab: function GroupItem_setActiveTab(tab) {
    Utils.assertThrow((!tab && this._children.length == 0) || tab.isATabItem,
        "tab must be null (if no children) or a TabItem");

    this._activeTab = tab;

    if (this.isStacked())
      this.arrange({immediately: true});
  },

  // -----------
  // Function: getActiveTab
  // Gets the active <TabItem> for this groupItem; can be null, but only
  // if there are no children.
  getActiveTab: function GroupItem_getActiveTab() {
    return this._activeTab;
  },

  // ----------
  // Function: getStorageData
  // Returns all of the info worth storing about this groupItem.
  getStorageData: function GroupItem_getStorageData() {
    var data = {
      bounds: this.getBounds(),
      userSize: null,
      title: this.getTitle(),
      id: this.id
    };

    if (Utils.isPoint(this.userSize))
      data.userSize = new Point(this.userSize);

    return data;
  },

  // ----------
  // Function: isEmpty
  // Returns true if the tab groupItem is empty and unnamed.
  isEmpty: function GroupItem_isEmpty() {
    return !this._children.length && !this.getTitle();
  },

  // ----------
  // Function: isStacked
  // Returns true if this item is in a stacked groupItem.
  isStacked: function GroupItem_isStacked() {
    return this._isStacked;
  },

  // ----------
  // Function: isTopOfStack
  // Returns true if the item is showing on top of this group's stack,
  // determined by whether the tab is this group's topChild, or
  // if it doesn't have one, its first child.
  isTopOfStack: function GroupItem_isTopOfStack(item) {
    return this.isStacked() && item == this.getTopChild();
  },

  // ----------
  // Function: save
  // Saves this groupItem to persistent storage.
  save: function GroupItem_save() {
    if (!this._inited || this._uninited) // too soon/late to save
      return;

    var data = this.getStorageData();
    if (GroupItems.groupItemStorageSanity(data))
      Storage.saveGroupItem(gWindow, data);
  },

  // ----------
  // Function: deleteData
  // Deletes the groupItem in the persistent storage.
  deleteData: function GroupItem_deleteData() {
    this._uninited = true;
    Storage.deleteGroupItem(gWindow, this.id);
  },

  // ----------
  // Function: getTitle
  // Returns the title of this groupItem as a string.
  getTitle: function GroupItem_getTitle() {
    return this.$title ? this.$title.val() : '';
  },

  // ----------
  // Function: setTitle
  // Sets the title of this groupItem with the given string
  setTitle: function GroupItem_setTitle(value) {
    this.$title.val(value);
    this.save();
  },

  // ----------
  // Function: focusTitle
  // Hide the title's shield and focus the underlying input field.
  focusTitle: function GroupItem_focusTitle() {
    this.$titleShield.hide();
    this.$title[0].focus();
  },

  // ----------
  // Function: adjustAppTabTray
  // Used to adjust the appTabTray size, to split the appTabIcons across
  // multiple columns when needed - if the groupItem size is too small.
  //
  // Parameters:
  //   arrangeGroup - rearrange the groupItem if the number of appTab columns
  //   changes. If true, then this.arrange() is called, otherwise not.
  adjustAppTabTray: function GroupItem_adjustAppTabTray(arrangeGroup) {
    let icons = iQ(".appTabIcon", this.$appTabTray);
    let container = iQ(this.$appTabTray[0].parentNode);
    if (!icons.length) {
      // There are no icons, so hide the appTabTray if needed.
      if (parseInt(container.css("width")) != 0) {
        this.$appTabTray.css("-moz-column-count", "auto");
        this.$appTabTray.css("height", 0);
        container.css("width", 0);
        container.css("height", 0);

        if (container.hasClass("appTabTrayContainerTruncated"))
          container.removeClass("appTabTrayContainerTruncated");

        if (arrangeGroup)
          this.arrange();
      }
      return;
    }

    let iconBounds = iQ(icons[0]).bounds();
    let boxBounds = this.getBounds();
    let contentHeight = boxBounds.height -
                        parseInt(container.css("top")) -
                        this.$resizer.height();
    let rows = Math.floor(contentHeight / iconBounds.height);
    let columns = Math.ceil(icons.length / rows);
    let columnsGap = parseInt(this.$appTabTray.css("-moz-column-gap"));
    let iconWidth = iconBounds.width + columnsGap;
    let maxColumns = Math.floor((boxBounds.width * 0.20) / iconWidth);

    Utils.assert(rows > 0 && columns > 0 && maxColumns > 0,
      "make sure the calculated rows, columns and maxColumns are correct");

    if (columns > maxColumns)
      container.addClass("appTabTrayContainerTruncated");
    else if (container.hasClass("appTabTrayContainerTruncated"))
      container.removeClass("appTabTrayContainerTruncated");

    // Need to drop the -moz- prefix when Gecko makes it obsolete.
    // See bug 629452.
    if (parseInt(this.$appTabTray.css("-moz-column-count")) != columns)
      this.$appTabTray.css("-moz-column-count", columns);

    if (parseInt(this.$appTabTray.css("height")) != contentHeight) {
      this.$appTabTray.css("height", contentHeight + "px");
      container.css("height", contentHeight + "px");
    }

    let fullTrayWidth = iconWidth * columns - columnsGap;
    if (parseInt(this.$appTabTray.css("width")) != fullTrayWidth)
      this.$appTabTray.css("width", fullTrayWidth + "px");

    let trayWidth = iconWidth * Math.min(columns, maxColumns) - columnsGap;
    if (parseInt(container.css("width")) != trayWidth) {
      container.css("width", trayWidth + "px");

      // Rearrange the groupItem if the width changed.
      if (arrangeGroup)
        this.arrange();
    }
  },

  // ----------
  // Function: getContentBounds
  // Returns a <Rect> for the groupItem's content area (which doesn't include the title, etc).
  //
  // Parameters:
  //   options - an object with additional parameters, see below
  //
  // Possible options:
  //   stacked - true to get content bounds for stacked mode
  getContentBounds: function GroupItem_getContentBounds(options) {
    let box = this.getBounds();
    let titleHeight = this.$titlebar.height();
    box.top += titleHeight;
    box.height -= titleHeight;

    let appTabTrayContainer = iQ(this.$appTabTray[0].parentNode);
    let appTabTrayWidth = appTabTrayContainer.width();
    if (appTabTrayWidth)
      appTabTrayWidth += parseInt(appTabTrayContainer.css(UI.rtl ? "left" : "right"));

    box.width -= appTabTrayWidth;
    if (UI.rtl) {
      box.left += appTabTrayWidth;
    }

    // Make the computed bounds' "padding" and expand button margin actually be
    // themeable --OR-- compute this from actual bounds. Bug 586546
    box.inset(6, 6);

    // make some room for the expand button in stacked mode
    if (options && options.stacked)
      box.height -= this.$expander.height() + 9; // the button height plus padding

    return box;
  },

  // ----------
  // Function: setBounds
  // Sets the bounds with the given <Rect>, animating unless "immediately" is false.
  //
  // Parameters:
  //   inRect - a <Rect> giving the new bounds
  //   immediately - true if it should not animate; default false
  //   options - an object with additional parameters, see below
  //
  // Possible options:
  //   force - true to always update the DOM even if the bounds haven't changed; default false
  setBounds: function GroupItem_setBounds(inRect, immediately, options) {
      Utils.assert(Utils.isRect(inRect), 'GroupItem.setBounds: rect is not a real rectangle!');

    // Validate and conform passed in size
    let validSize = GroupItems.calcValidSize(
      new Point(inRect.width, inRect.height));
    let rect = new Rect(inRect.left, inRect.top, validSize.x, validSize.y);

    if (!options)
      options = {};

    var titleHeight = this.$titlebar.height();

    // ___ Determine what has changed
    var css = {};
    var titlebarCSS = {};
    var contentCSS = {};

    if (rect.left != this.bounds.left || options.force)
      css.left = rect.left;

    if (rect.top != this.bounds.top || options.force)
      css.top = rect.top;

    if (rect.width != this.bounds.width || options.force) {
      css.width = rect.width;
      titlebarCSS.width = rect.width;
      contentCSS.width = rect.width;
    }

    if (rect.height != this.bounds.height || options.force) {
      css.height = rect.height;
      contentCSS.height = rect.height - titleHeight;
    }

    if (Utils.isEmptyObject(css))
      return;

    var offset = new Point(rect.left - this.bounds.left, rect.top - this.bounds.top);
    this.bounds = new Rect(rect);

    // Make sure the AppTab icons fit the new groupItem size.
    if (css.width || css.height)
      this.adjustAppTabTray();

    // ___ Deal with children
    if (css.width || css.height) {
      this.arrange({animate: !immediately}); //(immediately ? 'sometimes' : true)});
    } else if (css.left || css.top) {
      this._children.forEach(function(child) {
        if (!child.getHidden()) {
          var box = child.getBounds();
          child.setPosition(box.left + offset.x, box.top + offset.y, immediately);
        }
      });
    }

    // ___ Update our representation
    if (immediately) {
      iQ(this.container).css(css);
      this.$titlebar.css(titlebarCSS);
    } else {
      TabItems.pausePainting();
      iQ(this.container).animate(css, {
        duration: 350,
        easing: "tabviewBounce",
        complete: function() {
          TabItems.resumePainting();
        }
      });

      this.$titlebar.animate(titlebarCSS, {
        duration: 350
      });
    }

    UI.clearShouldResizeItems();
    this.setTrenches(rect);
    this.save();
  },

  // ----------
  // Function: setZ
  // Set the Z order for the groupItem's container, as well as its children.
  setZ: function GroupItem_setZ(value) {
    this.zIndex = value;

    iQ(this.container).css({zIndex: value});

    var count = this._children.length;
    if (count) {
      var topZIndex = value + count + 1;
      var zIndex = topZIndex;
      var self = this;
      this._children.forEach(function(child) {
        if (child == self.getTopChild())
          child.setZ(topZIndex + 1);
        else {
          child.setZ(zIndex);
          zIndex--;
        }
      });
    }
  },

  // ----------
  // Function: close
  // Closes the groupItem, removing (but not closing) all of its children.
  //
  // Parameters:
  //   options - An object with optional settings for this call.
  //
  // Options:
  //   immediately - (bool) if true, no animation will be used
  close: function GroupItem_close(options) {
    this.removeAll({dontClose: true});
    GroupItems.unregister(this);

    // remove unfreeze event handlers, if item size is frozen
    this._unfreezeItemSize({dontArrange: true});

    let self = this;
    let destroyGroup = function () {
      iQ(self.container).remove();
      if (self.$undoContainer) {
        self.$undoContainer.remove();
        self.$undoContainer = null;
      }
      self.removeTrenches();
      Items.unsquish();
      self._sendToSubscribers("close");
      GroupItems.updateGroupCloseButtons();
    }

    if (this.hidden || (options && options.immediately)) {
      destroyGroup();
    } else {
      iQ(this.container).animate({
        opacity: 0,
        "-moz-transform": "scale(.3)",
      }, {
        duration: 170,
        complete: destroyGroup
      });
    }

    this.deleteData();
  },

  // ----------
  // Function: closeAll
  // Closes the groupItem and all of its children.
  closeAll: function GroupItem_closeAll() {
    if (this._children.length > 0) {
      this._unfreezeItemSize();
      this._children.forEach(function(child) {
        iQ(child.container).hide();
      });

      iQ(this.container).animate({
         opacity: 0,
         "-moz-transform": "scale(.3)",
      }, {
        duration: 170,
        complete: function() {
          iQ(this).hide();
        }
      });

      this.droppable(false);
      this.removeTrenches();
      this._createUndoButton();
    } else
      this.close();

    this._makeLastActiveGroupItemActive();
  },
  
  // ----------
  // Function: _makeClosestTabActive
  // Make the closest tab external to this group active.
  // Used when closing the group.
  _makeClosestTabActive: function GroupItem__makeClosestTabActive() {
    let closeCenter = this.getBounds().center();
    // Find closest tab to make active
    let closestTabItem = UI.getClosestTab(closeCenter);
    if (closestTabItem)
      UI.setActive(closestTabItem);
  },

  // ----------
  // Function: _makeLastActiveGroupItemActive
  // Makes the last active group item active.
  _makeLastActiveGroupItemActive: function GroupItem__makeLastActiveGroupItemActive() {
    let groupItem = GroupItems.getLastActiveGroupItem();
    if (groupItem)
      UI.setActive(groupItem);
    else
      this._makeClosestTabActive();
  },

  // ----------
  // Function: closeIfEmpty
  // Closes the group if it's empty, is closable, and autoclose is enabled
  // (see pauseAutoclose()). Returns true if the close occurred and false
  // otherwise.
  closeIfEmpty: function GroupItem_closeIfEmpty() {
    if (this.isEmpty() && !UI._closedLastVisibleTab &&
        !GroupItems.getUnclosableGroupItemId() && !GroupItems._autoclosePaused) {
      this.close();
      return true;
    }
    return false;
  },

  // ----------
  // Function: _unhide
  // Shows the hidden group.
  //
  // Parameters:
  //   options - various options (see below)
  //
  // Possible options:
  //   immediately - true when no animations should be used
  _unhide: function GroupItem__unhide(options) {
    this._cancelFadeAwayUndoButtonTimer();
    this.hidden = false;
    this.$undoContainer.remove();
    this.$undoContainer = null;
    this.droppable(true);
    this.setTrenches(this.bounds);

    let self = this;

    let finalize = function () {
      self._children.forEach(function(child) {
        iQ(child.container).show();
      });

      UI.setActive(self);
      self._sendToSubscribers("groupShown", { groupItemId: self.id });
    };

    let $container = iQ(this.container).show();

    if (!options || !options.immediately) {
      $container.animate({
        "-moz-transform": "scale(1)",
        "opacity": 1
      }, {
        duration: 170,
        complete: finalize
      });
    } else {
      $container.css({"-moz-transform": "none", opacity: 1});
      finalize();
    }

    GroupItems.updateGroupCloseButtons();
  },

  // ----------
  // Function: closeHidden
  // Removes the group item, its children and its container.
  closeHidden: function GroupItem_closeHidden() {
    let self = this;

    this._cancelFadeAwayUndoButtonTimer();

    // When the last non-empty groupItem is closed and there are no
    // pinned tabs then create a new group with a blank tab.
    let remainingGroups = GroupItems.groupItems.filter(function (groupItem) {
      return (groupItem != self && groupItem.getChildren().length);
    });

    let tab = null;

    if (!gBrowser._numPinnedTabs && !remainingGroups.length) {
      let emptyGroups = GroupItems.groupItems.filter(function (groupItem) {
        return (groupItem != self && !groupItem.getChildren().length);
      });
      let group = (emptyGroups.length ? emptyGroups[0] : GroupItems.newGroup());
      tab = group.newTab(null, {dontZoomIn: true});
    }

    let closed = this.destroy();

    if (!tab)
      return;

    if (closed) {
      // Let's make the new tab the selected tab.
      UI.goToTab(tab);
    } else {
      // Remove the new tab and group, if this group is no longer closed.
      tab._tabViewTabItem.parent.destroy({immediately: true});
    }
  },

  // ----------
  // Function: destroy
  // Close all tabs linked to children (tabItems), removes all children and 
  // close the groupItem.
  //
  // Parameters:
  //   options - An object with optional settings for this call.
  //
  // Options:
  //   immediately - (bool) if true, no animation will be used
  //
  // Returns true if the groupItem has been closed, or false otherwise. A group
  // could not have been closed due to a tab with an onUnload handler (that
  // waits for user interaction).
  destroy: function GroupItem_destroy(options) {
    let self = this;

    // when "TabClose" event is fired, the browser tab is about to close and our 
    // item "close" event is fired.  And then, the browser tab gets closed. 
    // In other words, the group "close" event is fired before all browser
    // tabs in the group are closed.  The below code would fire the group "close"
    // event only after all browser tabs in that group are closed.
    this._children.concat().forEach(function(child) {
      child.removeSubscriber("close", self._onChildClose);

      if (child.close(true)) {
        self.remove(child, { dontArrange: true });
      } else {
        // child.removeSubscriber() must be called before child.close(), 
        // therefore we call child.addSubscriber() if the tab is not removed.
        child.addSubscriber("close", self._onChildClose);
      }
    });

    if (this._children.length) {
      if (this.hidden)
        this.$undoContainer.fadeOut(function() { self._unhide() });

      return false;
    } else {
      this.close(options);
      return true;
    }
  },

  // ----------
  // Function: _fadeAwayUndoButton
  // Fades away the undo button
  _fadeAwayUndoButton: function GroupItem__fadeAwayUndoButton() {
    let self = this;

    if (this.$undoContainer) {
      // if there is more than one group and other groups are not empty,
      // fade away the undo button.
      let shouldFadeAway = false;

      if (GroupItems.groupItems.length > 1) {
        shouldFadeAway = 
          GroupItems.groupItems.some(function(groupItem) {
            return (groupItem != self && groupItem.getChildren().length > 0);
          });
      }

      if (shouldFadeAway) {
        self.$undoContainer.animate({
          color: "transparent",
          opacity: 0
        }, {
          duration: this._fadeAwayUndoButtonDuration,
          complete: function() { self.closeHidden(); }
        });
      }
    }
  },

  // ----------
  // Function: _createUndoButton
  // Makes the affordance for undo a close group action
  _createUndoButton: function GroupItem__createUndoButton() {
    let self = this;
    this.$undoContainer = iQ("<div/>")
      .addClass("undo")
      .attr("type", "button")
      .attr("data-group-id", this.id)
      .appendTo("body");
    iQ("<span/>")
      .text(tabviewString("groupItem.undoCloseGroup"))
      .appendTo(this.$undoContainer);
    let undoClose = iQ("<span/>")
      .addClass("close")
      .appendTo(this.$undoContainer);

    this.$undoContainer.css({
      left: this.bounds.left + this.bounds.width/2 - iQ(self.$undoContainer).width()/2,
      top:  this.bounds.top + this.bounds.height/2 - iQ(self.$undoContainer).height()/2,
      "-moz-transform": "scale(.1)",
      opacity: 0
    });
    this.hidden = true;

    // hide group item and show undo container.
    setTimeout(function() {
      self.$undoContainer.animate({
        "-moz-transform": "scale(1)",
        "opacity": 1
      }, {
        easing: "tabviewBounce",
        duration: 170,
        complete: function() {
          self._sendToSubscribers("groupHidden", { groupItemId: self.id });
        }
      });
    }, 50);

    // add click handlers
    this.$undoContainer.click(function(e) {
      // don't do anything if the close button is clicked.
      if (e.target == undoClose[0])
        return;

      self.$undoContainer.fadeOut(function() { self._unhide(); });
    });

    undoClose.click(function() {
      self.$undoContainer.fadeOut(function() { self.closeHidden(); });
    });

    this.setupFadeAwayUndoButtonTimer();
    // Cancel the fadeaway if you move the mouse over the undo
    // button, and restart the countdown once you move out of it.
    this.$undoContainer.mouseover(function() { 
      self._cancelFadeAwayUndoButtonTimer();
    });
    this.$undoContainer.mouseout(function() {
      self.setupFadeAwayUndoButtonTimer();
    });

    GroupItems.updateGroupCloseButtons();
  },

  // ----------
  // Sets up fade away undo button timeout. 
  setupFadeAwayUndoButtonTimer: function GroupItem_setupFadeAwayUndoButtonTimer() {
    let self = this;

    if (!this._undoButtonTimeoutId) {
      this._undoButtonTimeoutId = setTimeout(function() { 
        self._fadeAwayUndoButton(); 
      }, this.fadeAwayUndoButtonDelay);
    }
  },
  
  // ----------
  // Cancels the fade away undo button timeout. 
  _cancelFadeAwayUndoButtonTimer: function GroupItem__cancelFadeAwayUndoButtonTimer() {
    clearTimeout(this._undoButtonTimeoutId);
    this._undoButtonTimeoutId = null;
  }, 

  // ----------
  // Function: add
  // Adds an item to the groupItem.
  // Parameters:
  //
  //   a - The item to add. Can be an <Item>, a DOM element or an iQ object.
  //       The latter two must refer to the container of an <Item>.
  //   options - An object with optional settings for this call.
  //
  // Options:
  //
  //   index - (int) if set, add this tab at this index
  //   immediately - (bool) if true, no animation will be used
  //   dontArrange - (bool) if true, will not trigger an arrange on the group
  add: function GroupItem_add(a, options) {
    try {
      var item;
      var $el;
      if (a.isAnItem) {
        item = a;
        $el = iQ(a.container);
      } else {
        $el = iQ(a);
        item = Items.item($el);
      }

      // safeguard to remove the item from its previous group
      if (item.parent && item.parent !== this)
        item.parent.remove(item);

      item.removeTrenches();

      if (!options)
        options = {};

      var self = this;

      var wasAlreadyInThisGroupItem = false;
      var oldIndex = this._children.indexOf(item);
      if (oldIndex != -1) {
        this._children.splice(oldIndex, 1);
        wasAlreadyInThisGroupItem = true;
      }

      // Insert the tab into the right position.
      var index = ("index" in options) ? options.index : this._children.length;
      this._children.splice(index, 0, item);

      item.setZ(this.getZ() + 1);

      if (!wasAlreadyInThisGroupItem) {
        item.droppable(false);
        item.groupItemData = {};

        item.addSubscriber("close", this._onChildClose);
        item.setParent(this);
        $el.attr("data-group-id", this.id);

        if (typeof item.setResizable == 'function')
          item.setResizable(false, options.immediately);

        if (item == UI.getActiveTab() || !this._activeTab)
          this.setActiveTab(item);

        // if it matches the selected tab or no active tab and the browser
        // tab is hidden, the active group item would be set.
        if (item.tab == gBrowser.selectedTab ||
            (!GroupItems.getActiveGroupItem() && !item.tab.hidden))
          UI.setActive(this);
      }

      if (!options.dontArrange)
        this.arrange({animate: !options.immediately});

      this._unfreezeItemSize({dontArrange: true});
      this._sendToSubscribers("childAdded",{ groupItemId: this.id, item: item });

      UI.setReorderTabsOnHide(this);
    } catch(e) {
      Utils.log('GroupItem.add error', e);
    }
  },

  // ----------
  // Function: _onChildClose
  // Handles "close" events from the group's children.
  //
  // Parameters:
  //   tabItem - The tabItem that is closed.
  _onChildClose: function GroupItem__onChildClose(tabItem) {
    let count = this._children.length;
    let dontArrange = tabItem.closedManually &&
                      (this.expanded || !this.shouldStack(count));
    let dontClose = !tabItem.closedManually && gBrowser._numPinnedTabs > 0;
    this.remove(tabItem, {dontArrange: dontArrange, dontClose: dontClose});

    if (dontArrange)
      this._freezeItemSize(count);

    if (this._children.length > 0 && this._activeTab)
      UI.setActive(this);
  },

  // ----------
  // Function: remove
  // Removes an item from the groupItem.
  // Parameters:
  //
  //   a - The item to remove. Can be an <Item>, a DOM element or an iQ object.
  //       The latter two must refer to the container of an <Item>.
  //   options - An optional object with settings for this call. See below.
  //
  // Possible options: 
  //   dontArrange - don't rearrange the remaining items
  //   dontClose - don't close the group even if it normally would
  //   immediately - don't animate
  remove: function GroupItem_remove(a, options) {
    try {
      var $el;
      var item;

      if (a.isAnItem) {
        item = a;
        $el = iQ(item.container);
      } else {
        $el = iQ(a);
        item = Items.item($el);
      }

      if (!options)
        options = {};

      var index = this._children.indexOf(item);
      if (index != -1)
        this._children.splice(index, 1);

      if (item == this._activeTab || !this._activeTab) {
        if (this._children.length > 0)
          this._activeTab = this._children[0];
        else
          this._activeTab = null;
      }

      $el[0].removeAttribute("data-group-id");
      item.setParent(null);
      item.removeClass("stacked");
      item.isStacked = false;
      item.setHidden(false);
      item.removeClass("stack-trayed");
      item.setRotation(0);

      // Force tabItem resize if it's dragged out of a stacked groupItem.
      // The tabItems's title will be visible and that's why we need to
      // recalculate its height.
      if (item.isDragging && this.isStacked())
        item.setBounds(item.getBounds(), true, {force: true});

      item.droppable(true);
      item.removeSubscriber("close", this._onChildClose);

      if (typeof item.setResizable == 'function')
        item.setResizable(true, options.immediately);

      // if a blank tab is selected while restoring a tab the blank tab gets
      // removed. we need to keep the group alive for the restored tab.
      if (item.isRemovedAfterRestore)
        options.dontClose = true;

      let closed = options.dontClose ? false : this.closeIfEmpty();
      if (closed) {
        this._makeLastActiveGroupItemActive();
      } else if (!options.dontArrange) {
        this.arrange({animate: !options.immediately});
        this._unfreezeItemSize({dontArrange: true});
      }

      this._sendToSubscribers("childRemoved",{ groupItemId: this.id, item: item });
    } catch(e) {
      Utils.log(e);
    }
  },

  // ----------
  // Function: removeAll
  // Removes all of the groupItem's children.
  // The optional "options" param is passed to each remove call. 
  removeAll: function GroupItem_removeAll(options) {
    let self = this;
    let newOptions = {dontArrange: true};
    if (options)
      Utils.extend(newOptions, options);
      
    let toRemove = this._children.concat();
    toRemove.forEach(function(child) {
      self.remove(child, newOptions);
    });
  },

  // ----------
  // Adds the given xul:tab as an app tab in this group's apptab tray
  //
  // Parameters:
  //   options - change how the app tab is added.
  //
  // Options:
  //   dontAdjustTray - (boolean) if true, the $appTabTray size is not adjusted,
  //                    which means that the adjustAppTabTray() method is not
  //                    called.
  addAppTab: function GroupItem_addAppTab(xulTab, options) {
    let self = this;

    let iconUrl = GroupItems.getAppTabFavIconUrl(xulTab);
    let $appTab = iQ("<img>")
      .addClass("appTabIcon")
      .attr("src", iconUrl)
      .data("xulTab", xulTab)
      .appendTo(this.$appTabTray)
      .mousedown(function onAppTabMousedown(event) {
        // stop mousedown propagation to disable group dragging on app tabs
        event.stopPropagation();
      })
      .click(function(event) {
        if (!Utils.isLeftClick(event))
          return;

        UI.setActive(self, { dontSetActiveTabInGroup: true });
        UI.goToTab(iQ(this).data("xulTab"));
      });

    // adjust the tray, if needed.
    if (!options || !options.dontAdjustTray)
      this.adjustAppTabTray(true);
  },

  // ----------
  // Removes the given xul:tab as an app tab in this group's apptab tray
  removeAppTab: function GroupItem_removeAppTab(xulTab) {
    // remove the icon
    iQ(".appTabIcon", this.$appTabTray).each(function(icon) {
      let $icon = iQ(icon);
      if ($icon.data("xulTab") != xulTab)
        return true;
        
      $icon.remove();
      return false;
    });
    
    // adjust the tray
    this.adjustAppTabTray(true);
  },

  // ----------
  // Arranges the given xul:tab as an app tab in the group's apptab tray
  arrangeAppTab: function GroupItem_arrangeAppTab(xulTab) {
    let self = this;

    let elements = iQ(".appTabIcon", this.$appTabTray);
    let length = elements.length;

    elements.each(function(icon) {
      let $icon = iQ(icon);
      if ($icon.data("xulTab") != xulTab)
        return true;

      let targetIndex = xulTab._tPos;

      $icon.remove({ preserveEventHandlers: true });
      if (targetIndex < (length - 1))
        self.$appTabTray[0].insertBefore(
          icon,
          iQ(".appTabIcon:nth-child(" + (targetIndex + 1) + ")", self.$appTabTray)[0]);
      else
        $icon.appendTo(self.$appTabTray);
      return false;
    });
  },

  // ----------
  // Function: hideExpandControl
  // Hide the control which expands a stacked groupItem into a quick-look view.
  hideExpandControl: function GroupItem_hideExpandControl() {
    this.$expander.hide();
  },

  // ----------
  // Function: showExpandControl
  // Show the control which expands a stacked groupItem into a quick-look view.
  showExpandControl: function GroupItem_showExpandControl() {
    let parentBB = this.getBounds();
    let childBB = this.getChild(0).getBounds();
    this.$expander
        .show()
        .css({
          left: parentBB.width/2 - this.$expander.width()/2
        });
  },

  // ----------
  // Function: shouldStack
  // Returns true if the groupItem, given "count", should stack (instead of 
  // grid).
  shouldStack: function GroupItem_shouldStack(count) {
    let bb = this.getContentBounds();
    let options = {
      return: 'widthAndColumns',
      count: count || this._children.length,
      hideTitle: false
    };
    let arrObj = Items.arrange(this._children, bb, options);

    let shouldStack = arrObj.childWidth < TabItems.minTabWidth * 1.35;
    this._columns = shouldStack ? null : arrObj.columns;

    return shouldStack;
  },

  // ----------
  // Function: _freezeItemSize
  // Freezes current item size (when removing a child).
  //
  // Parameters:
  //   itemCount - the number of children before the last one was removed
  _freezeItemSize: function GroupItem__freezeItemSize(itemCount) {
    let data = this._frozenItemSizeData;

    if (!data.lastItemCount) {
      let self = this;
      data.lastItemCount = itemCount;

      // unfreeze item size when tabview is hidden
      data.onTabViewHidden = function () self._unfreezeItemSize();
      window.addEventListener('tabviewhidden', data.onTabViewHidden, false);

      // we don't need to observe mouse movement when expanded because the
      // tray is closed when we leave it and collapse causes unfreezing
      if (!self.expanded) {
        // unfreeze item size when cursor is moved out of group bounds
        data.onMouseMove = function (e) {
          let cursor = new Point(e.pageX, e.pageY);
          if (!self.bounds.contains(cursor))
            self._unfreezeItemSize();
        }
        iQ(window).mousemove(data.onMouseMove);
      }
    }

    this.arrange({animate: true, count: data.lastItemCount});
  },

  // ----------
  // Function: _unfreezeItemSize
  // Unfreezes and updates item size.
  //
  // Parameters:
  //   options - various options (see below)
  //
  // Possible options:
  //   dontArrange - do not arrange items when unfreezing
  _unfreezeItemSize: function GroupItem__unfreezeItemSize(options) {
    let data = this._frozenItemSizeData;
    if (!data.lastItemCount)
      return;

    if (!options || !options.dontArrange)
      this.arrange({animate: true});

    // unbind event listeners
    window.removeEventListener('tabviewhidden', data.onTabViewHidden, false);
    if (data.onMouseMove)
      iQ(window).unbind('mousemove', data.onMouseMove);

    // reset freeze status
    this._frozenItemSizeData = {};
  },

  // ----------
  // Function: arrange
  // Lays out all of the children.
  //
  // Parameters:
  //   options - passed to <Items.arrange> or <_stackArrange>, except those below
  //
  // Options:
  //   addTab - (boolean) if true, we add one to the child count
  //   oldDropIndex - if set, we will only set any bounds if the dropIndex has
  //                  changed
  //   dropPos - (<Point>) a position where a tab is currently positioned, above
  //             this group.
  //   animate - (boolean) if true, movement of children will be animated.
  //
  // Returns:
  //   dropIndex - an index value for where an item would be dropped, if 
  //               options.dropPos is given.
  arrange: function GroupItem_arrange(options) {
    if (!options)
      options = {};

    let childrenToArrange = [];
    this._children.forEach(function(child) {
      if (child.isDragging)
        options.addTab = true;
      else
        childrenToArrange.push(child);
    });

    if (GroupItems._arrangePaused) {
      GroupItems.pushArrange(this, options);
      return false;
    }

    let shouldStack = this.shouldStack(childrenToArrange.length + (options.addTab ? 1 : 0));
    let shouldStackArrange = (shouldStack && !this.expanded);
    let box;

    // if we should stack and we're not expanded
    if (shouldStackArrange) {
      this.showExpandControl();
      box = this.getContentBounds({stacked: true});
      this._stackArrange(childrenToArrange, box, options);
      return false;
    } else {
      this.hideExpandControl();
      box = this.getContentBounds();
      // a dropIndex is returned
      return this._gridArrange(childrenToArrange, box, options);
    }
  },

  // ----------
  // Function: _stackArrange
  // Arranges the children in a stack.
  //
  // Parameters:
  //   childrenToArrange - array of <TabItem> children
  //   bb - <Rect> to arrange within
  //   options - see below
  //
  // Possible "options" properties:
  //   animate - whether to animate; default: true.
  _stackArrange: function GroupItem__stackArrange(childrenToArrange, bb, options) {
    if (!options)
      options = {};
    var animate = "animate" in options ? options.animate : true;

    var count = childrenToArrange.length;
    if (!count)
      return;

    let itemAspect = TabItems.tabHeight / TabItems.tabWidth;
    let zIndex = this.getZ() + count + 1;
    let maxRotation = 35; // degress
    let scale = 0.7;
    let newTabsPad = 10;
    let bbAspect = bb.height / bb.width;
    let numInPile = 6;
    let angleDelta = 3.5; // degrees

    // compute size of the entire stack, modulo rotation.
    let size;
    if (bbAspect > itemAspect) { // Tall, thin groupItem
      size = TabItems.calcValidSize(new Point(bb.width * scale, -1),
        {hideTitle:true});
     } else { // Short, wide groupItem
      size = TabItems.calcValidSize(new Point(-1, bb.height * scale),
        {hideTitle:true});
     }

    // x is the left margin that the stack will have, within the content area (bb)
    // y is the vertical margin
    var x = (bb.width - size.x) / 2;
    var y = Math.min(size.x, (bb.height - size.y) / 2);
    var box = new Rect(bb.left + x, bb.top + y, size.x, size.y);

    var self = this;
    var children = [];

    // ensure topChild is the first item in childrenToArrange
    let topChild = this.getTopChild();
    let topChildPos = childrenToArrange.indexOf(topChild);
    if (topChildPos > 0) {
      childrenToArrange.splice(topChildPos, 1);
      childrenToArrange.unshift(topChild);
    }

    childrenToArrange.forEach(function GroupItem__stackArrange_order(child) {
      // Children are still considered stacked even if they're hidden later.
      child.addClass("stacked");
      child.isStacked = true;
      if (numInPile-- > 0) {
        children.push(child);
      } else {
        child.setHidden(true);
      }
    });

    self._isStacked = true;

    let angleAccum = 0;
    children.forEach(function GroupItem__stackArrange_apply(child, index) {
      child.setZ(zIndex);
      zIndex--;

      // Force a recalculation of height because we've changed how the title
      // is shown.
      child.setBounds(box, !animate || child.getHidden(), {force:true});
      child.setRotation((UI.rtl ? -1 : 1) * angleAccum);
      child.setHidden(false);
      angleAccum += angleDelta;
    });
  },
  
  // ----------
  // Function: _gridArrange
  // Arranges the children into a grid.
  //
  // Parameters:
  //   childrenToArrange - array of <TabItem> children
  //   box - <Rect> to arrange within
  //   options - see below
  //
  // Possible "options" properties:
  //   animate - whether to animate; default: true.
  //   z - (int) a z-index to assign the children
  //   columns - the number of columns to use in the layout, if known in advance
  //
  // Returns:
  //   dropIndex - (int) the index at which a dragged item (if there is one) should be added
  //               if it is dropped. Otherwise (boolean) false.
  _gridArrange: function GroupItem__gridArrange(childrenToArrange, box, options) {
    let arrangeOptions;
    if (this.expanded) {
      // if we're expanded, we actually want to use the expanded tray's bounds.
      box = new Rect(this.expanded.bounds);
      box.inset(8, 8);
      arrangeOptions = Utils.extend({}, options, {z: 99999});
    } else {
      this._isStacked = false;
      arrangeOptions = Utils.extend({}, options, {
        columns: this._columns
      });

      childrenToArrange.forEach(function(child) {
        child.removeClass("stacked");
        child.isStacked = false;
        child.setHidden(false);
      });
    }
  
    if (!childrenToArrange.length)
      return false;

    // Items.arrange will determine where/how the child items should be
    // placed, but will *not* actually move them for us. This is our job.
    let result = Items.arrange(childrenToArrange, box, arrangeOptions);
    let {dropIndex, rects, columns} = result;
    if ("oldDropIndex" in options && options.oldDropIndex === dropIndex)
      return dropIndex;

    this._columns = columns;
    let index = 0;
    let self = this;
    childrenToArrange.forEach(function GroupItem_arrange_children_each(child, i) {
      // If dropIndex spacing is active and this is a child after index,
      // bump it up one so we actually use the correct rect
      // (and skip one for the dropPos)
      if (self._dropSpaceActive && index === dropIndex)
        index++;
      child.setBounds(rects[index], !options.animate);
      child.setRotation(0);
      if (arrangeOptions.z)
        child.setZ(arrangeOptions.z);
      index++;
    });

    return dropIndex;
  },

  expand: function GroupItem_expand() {
    var self = this;
    // ___ we're stacked, and command is held down so expand
    UI.setActive(this.getTopChild());
    
    var startBounds = this.getChild(0).getBounds();
    var $tray = iQ("<div>").css({
      top: startBounds.top,
      left: startBounds.left,
      width: startBounds.width,
      height: startBounds.height,
      position: "absolute",
      zIndex: 99998
    }).appendTo("body");
    $tray[0].id = "expandedTray";

    var w = 180;
    var h = w * (TabItems.tabHeight / TabItems.tabWidth) * 1.1;
    var padding = 20;
    var col = Math.ceil(Math.sqrt(this._children.length));
    var row = Math.ceil(this._children.length/col);

    var overlayWidth = Math.min(window.innerWidth - (padding * 2), w*col + padding*(col+1));
    var overlayHeight = Math.min(window.innerHeight - (padding * 2), h*row + padding*(row+1));

    var pos = {left: startBounds.left, top: startBounds.top};
    pos.left -= overlayWidth / 3;
    pos.top  -= overlayHeight / 3;

    if (pos.top < 0)
      pos.top = 20;
    if (pos.left < 0)
      pos.left = 20;
    if (pos.top + overlayHeight > window.innerHeight)
      pos.top = window.innerHeight - overlayHeight - 20;
    if (pos.left + overlayWidth > window.innerWidth)
      pos.left = window.innerWidth - overlayWidth - 20;

    $tray
      .animate({
        width:  overlayWidth,
        height: overlayHeight,
        top: pos.top,
        left: pos.left
      }, {
        duration: 200,
        easing: "tabviewBounce",
        complete: function GroupItem_expand_animate_complete() {
          self._sendToSubscribers("expanded");
        }
      })
      .addClass("overlay");

    this._children.forEach(function(child) {
      child.addClass("stack-trayed");
      child.setHidden(false);
    });

    var $shield = iQ('<div>')
      .addClass('shield')
      .css({
        zIndex: 99997
      })
      .appendTo('body')
      .click(function() { // just in case
        self.collapse();
      });

    // There is a race-condition here. If there is
    // a mouse-move while the shield is coming up
    // it will collapse, which we don't want. Thus,
    // we wait a little bit before adding this event
    // handler.
    setTimeout(function() {
      $shield.mouseover(function() {
        self.collapse();
      });
    }, 200);

    this.expanded = {
      $tray: $tray,
      $shield: $shield,
      bounds: new Rect(pos.left, pos.top, overlayWidth, overlayHeight)
    };

    this.arrange();
  },

  // ----------
  // Function: collapse
  // Collapses the groupItem from the expanded "tray" mode.
  collapse: function GroupItem_collapse() {
    if (this.expanded) {
      var z = this.getZ();
      var box = this.getBounds();
      let self = this;
      this.expanded.$tray
        .css({
          zIndex: z + 1
        })
        .animate({
          width:  box.width,
          height: box.height,
          top: box.top,
          left: box.left,
          opacity: 0
        }, {
          duration: 350,
          easing: "tabviewBounce",
          complete: function GroupItem_collapse_animate_complete() {
            iQ(this).remove();
            self._sendToSubscribers("collapsed");
          }
        });

      this.expanded.$shield.remove();
      this.expanded = null;

      this._children.forEach(function(child) {
        child.removeClass("stack-trayed");
      });

      this.arrange({z: z + 2});
      this._unfreezeItemSize({dontArrange: true});
    }
  },

  // ----------
  // Function: _addHandlers
  // Helper routine for the constructor; adds various event handlers to the container.
  _addHandlers: function GroupItem__addHandlers(container) {
    let self = this;
    let lastMouseDownTarget;

    container.mousedown(function(e) {
      let target = e.target;
      // only set the last mouse down target if it is a left click, not on the
      // close button, not on the expand button, not on the title bar and its
      // elements
      if (Utils.isLeftClick(e) &&
          self.$closeButton[0] != target &&
          self.$titlebar[0] != target &&
          self.$expander[0] != target &&
          !self.$titlebar.contains(target) &&
          !self.$appTabTray.contains(target)) {
        lastMouseDownTarget = target;
      } else {
        lastMouseDownTarget = null;
      }
    });
    container.mouseup(function(e) {
      let same = (e.target == lastMouseDownTarget);
      lastMouseDownTarget = null;

      if (same && !self.isDragging) {
        if (gBrowser.selectedTab.pinned &&
            UI.getActiveTab() != self.getActiveTab() &&
            self.getChildren().length > 0) {
          UI.setActive(self, { dontSetActiveTabInGroup: true });
          UI.goToTab(gBrowser.selectedTab);
        } else {
          let tabItem = self.getTopChild();
          if (tabItem)
            tabItem.zoomIn();
          else
            self.newTab();
        }
      }
    });

    let dropIndex = false;
    let dropSpaceTimer = null;

    // When the _dropSpaceActive flag is turned on on a group, and a tab is
    // dragged on top, a space will open up.
    this._dropSpaceActive = false;

    this.dropOptions.over = function GroupItem_dropOptions_over(event) {
      iQ(this.container).addClass("acceptsDrop");
    };
    this.dropOptions.move = function GroupItem_dropOptions_move(event) {
      let oldDropIndex = dropIndex;
      let dropPos = drag.info.item.getBounds().center();
      let options = {dropPos: dropPos,
                     addTab: self._dropSpaceActive && drag.info.item.parent != self,
                     oldDropIndex: oldDropIndex};
      let newDropIndex = self.arrange(options);
      // If this is a new drop index, start a timer!
      if (newDropIndex !== oldDropIndex) {
        dropIndex = newDropIndex;
        if (this._dropSpaceActive)
          return;
          
        if (dropSpaceTimer) {
          clearTimeout(dropSpaceTimer);
          dropSpaceTimer = null;
        }

        dropSpaceTimer = setTimeout(function GroupItem_arrange_evaluateDropSpace() {
          // Note that dropIndex's scope is GroupItem__addHandlers, but
          // newDropIndex's scope is GroupItem_dropOptions_move. Thus,
          // dropIndex may change with other movement events before we come
          // back and check this. If it's still the same dropIndex, activate
          // drop space display!
          if (dropIndex === newDropIndex) {
            self._dropSpaceActive = true;
            dropIndex = self.arrange({dropPos: dropPos,
                                      addTab: drag.info.item.parent != self,
                                      animate: true});
          }
          dropSpaceTimer = null;
        }, 250);
      }
    };
    this.dropOptions.drop = function GroupItem_dropOptions_drop(event) {
      iQ(this.container).removeClass("acceptsDrop");
      let options = {};
      if (this._dropSpaceActive)
        this._dropSpaceActive = false;

      if (dropSpaceTimer) {
        clearTimeout(dropSpaceTimer);
        dropSpaceTimer = null;
        // If we drop this item before the timed rearrange was executed,
        // we won't have an accurate dropIndex value. Get that now.
        let dropPos = drag.info.item.getBounds().center();
        dropIndex = self.arrange({dropPos: dropPos,
                                  addTab: drag.info.item.parent != self,
                                  animate: true});
      }

      if (dropIndex !== false)
        options = {index: dropIndex};
      this.add(drag.info.$el, options);
      UI.setActive(this);
      dropIndex = false;
    };
    this.dropOptions.out = function GroupItem_dropOptions_out(event) {
      dropIndex = false;
      if (this._dropSpaceActive)
        this._dropSpaceActive = false;

      if (dropSpaceTimer) {
        clearTimeout(dropSpaceTimer);
        dropSpaceTimer = null;
      }
      self.arrange();
      var groupItem = drag.info.item.parent;
      if (groupItem)
        groupItem.remove(drag.info.$el, {dontClose: true});
      iQ(this.container).removeClass("acceptsDrop");
    }

    this.draggable();
    this.droppable(true);

    this.$expander.click(function() {
      self.expand();
    });
  },

  // ----------
  // Function: setResizable
  // Sets whether the groupItem is resizable and updates the UI accordingly.
  setResizable: function GroupItem_setResizable(value, immediately) {
    var self = this;

    this.resizeOptions.minWidth = GroupItems.minGroupWidth;
    this.resizeOptions.minHeight = GroupItems.minGroupHeight;

    let start = this.resizeOptions.start;
    this.resizeOptions.start = function (event) {
      start.call(self, event);
      self._unfreezeItemSize();
    }

    if (value) {
      immediately ? this.$resizer.show() : this.$resizer.fadeIn();
      this.resizable(true);
    } else {
      immediately ? this.$resizer.hide() : this.$resizer.fadeOut();
      this.resizable(false);
    }
  },

  // ----------
  // Function: newTab
  // Creates a new tab within this groupItem.
  // Parameters:
  //  url - the new tab should open this url as well
  //  options - the options object
  //    dontZoomIn - set to true to not zoom into the newly created tab
  //    closedLastTab - boolean indicates the last tab has just been closed
  newTab: function GroupItem_newTab(url, options) {
    if (options && options.closedLastTab)
      UI.closedLastTabInTabView = true;

    UI.setActive(this, { dontSetActiveTabInGroup: true });

    let dontZoomIn = !!(options && options.dontZoomIn);
    return gBrowser.loadOneTab(url || "about:blank", { inBackground: dontZoomIn });
  },

  // ----------
  // Function: reorderTabItemsBasedOnTabOrder
  // Reorders the tabs in a groupItem based on the arrangment of the tabs
  // shown in the tab bar. It does it by sorting the children
  // of the groupItem by the positions of their respective tabs in the
  // tab bar.
  reorderTabItemsBasedOnTabOrder: function GroupItem_reorderTabItemsBasedOnTabOrder() {
    this._children.sort(function(a,b) a.tab._tPos - b.tab._tPos);

    this.arrange({animate: false});
    // this.arrange calls this.save for us
  },

  // Function: reorderTabsBasedOnTabItemOrder
  // Reorders the tabs in the tab bar based on the arrangment of the tabs
  // shown in the groupItem.
  reorderTabsBasedOnTabItemOrder: function GroupItem_reorderTabsBasedOnTabItemOrder() {
    let indices;
    let tabs = this._children.map(function (tabItem) tabItem.tab);

    tabs.forEach(function (tab, index) {
      if (!indices)
        indices = tabs.map(function (tab) tab._tPos);

      let start = index ? indices[index - 1] + 1 : 0;
      let end = index + 1 < indices.length ? indices[index + 1] - 1 : Infinity;
      let targetRange = new Range(start, end);

      if (!targetRange.contains(tab._tPos)) {
        gBrowser.moveTabTo(tab, start);
        indices = null;
      }
    });
  },

  // ----------
  // Function: getTopChild
  // Gets the <Item> that should be displayed on top when in stack mode.
  getTopChild: function GroupItem_getTopChild() {
    if (!this.getChildren().length) {
      return null;
    }

    return this.getActiveTab() || this.getChild(0);
  },

  // ----------
  // Function: getChild
  // Returns the nth child tab or null if index is out of range.
  //
  // Parameters:
  //  index - the index of the child tab to return, use negative
  //          numbers to index from the end (-1 is the last child)
  getChild: function GroupItem_getChild(index) {
    if (index < 0)
      index = this._children.length + index;
    if (index >= this._children.length || index < 0)
      return null;
    return this._children[index];
  },

  // ----------
  // Function: getChildren
  // Returns all children.
  getChildren: function GroupItem_getChildren() {
    return this._children;
  }
});

// ##########
// Class: GroupItems
// Singleton for managing all <GroupItem>s.
let GroupItems = {
  groupItems: [],
  nextID: 1,
  _inited: false,
  _activeGroupItem: null,
  _cleanupFunctions: [],
  _arrangePaused: false,
  _arrangesPending: [],
  _removingHiddenGroups: false,
  _delayedModUpdates: [],
  _autoclosePaused: false,
  minGroupHeight: 110,
  minGroupWidth: 125,
  _lastActiveList: null,

  // ----------
  // Function: toString
  // Prints [GroupItems] for debug use
  toString: function GroupItems_toString() {
    return "[GroupItems count=" + this.groupItems.length + "]";
  },

  // ----------
  // Function: init
  init: function GroupItems_init() {
    let self = this;

    // setup attr modified handler, and prepare for its uninit
    function handleAttrModified(event) {
      self._handleAttrModified(event.target);
    }

    // make sure any closed tabs are removed from the delay update list
    function handleClose(event) {
      let idx = self._delayedModUpdates.indexOf(event.target);
      if (idx != -1)
        self._delayedModUpdates.splice(idx, 1);
    }

    this._lastActiveList = new MRUList();

    AllTabs.register("attrModified", handleAttrModified);
    AllTabs.register("close", handleClose);
    this._cleanupFunctions.push(function() {
      AllTabs.unregister("attrModified", handleAttrModified);
      AllTabs.unregister("close", handleClose);
    });
  },

  // ----------
  // Function: uninit
  uninit: function GroupItems_uninit() {
    // call our cleanup functions
    this._cleanupFunctions.forEach(function(func) {
      func();
    });

    this._cleanupFunctions = [];

    // additional clean up
    this.groupItems = null;
  },

  // ----------
  // Function: newGroup
  // Creates a new empty group.
  newGroup: function GroupItems_newGroup() {
    let bounds = new Rect(20, 20, 250, 200);
    return new GroupItem([], {bounds: bounds, immediately: true});
  },

  // ----------
  // Function: pauseArrange
  // Bypass arrange() calls and collect for resolution in
  // resumeArrange()
  pauseArrange: function GroupItems_pauseArrange() {
    Utils.assert(this._arrangePaused == false, 
      "pauseArrange has been called while already paused");
    Utils.assert(this._arrangesPending.length == 0, 
      "There are bypassed arrange() calls that haven't been resolved");
    this._arrangePaused = true;
  },

  // ----------
  // Function: pushArrange
  // Push an arrange() call and its arguments onto an array
  // to be resolved in resumeArrange()
  pushArrange: function GroupItems_pushArrange(groupItem, options) {
    Utils.assert(this._arrangePaused, 
      "Ensure pushArrange() called while arrange()s aren't paused"); 
    let i;
    for (i = 0; i < this._arrangesPending.length; i++)
      if (this._arrangesPending[i].groupItem === groupItem)
        break;
    let arrangeInfo = {
      groupItem: groupItem,
      options: options
    };
    if (i < this._arrangesPending.length)
      this._arrangesPending[i] = arrangeInfo;
    else
      this._arrangesPending.push(arrangeInfo);
  },

  // ----------
  // Function: resumeArrange
  // Resolve bypassed and collected arrange() calls
  resumeArrange: function GroupItems_resumeArrange() {
    this._arrangePaused = false;
    for (let i = 0; i < this._arrangesPending.length; i++) {
      let g = this._arrangesPending[i];
      g.groupItem.arrange(g.options);
    }
    this._arrangesPending = [];
  },

  // ----------
  // Function: _handleAttrModified
  // watch for icon changes on app tabs
  _handleAttrModified: function GroupItems__handleAttrModified(xulTab) {
    if (!UI.isTabViewVisible()) {
      if (this._delayedModUpdates.indexOf(xulTab) == -1) {
        this._delayedModUpdates.push(xulTab);
      }
    } else
      this._updateAppTabIcons(xulTab); 
  },

  // ----------
  // Function: flushTabUpdates
  // Update apptab icons based on xulTabs which have been updated
  // while the TabView hasn't been visible 
  flushAppTabUpdates: function GroupItems_flushAppTabUpdates() {
    let self = this;
    this._delayedModUpdates.forEach(function(xulTab) {
      self._updateAppTabIcons(xulTab);
    });
    this._delayedModUpdates = [];
  },

  // ----------
  // Function: _updateAppTabIcons
  // Update images of any apptab icons that point to passed in xultab 
  _updateAppTabIcons: function GroupItems__updateAppTabIcons(xulTab) {
    if (!xulTab.pinned)
      return;

    let iconUrl = this.getAppTabFavIconUrl(xulTab);
    this.groupItems.forEach(function(groupItem) {
      iQ(".appTabIcon", groupItem.$appTabTray).each(function(icon) {
        let $icon = iQ(icon);
        if ($icon.data("xulTab") != xulTab)
          return true;

        if (iconUrl != $icon.attr("src"))
          $icon.attr("src", iconUrl);
        return false;
      });
    });
  },

  // ----------
  // Function: getAppTabFavIconUrl
  // Gets the fav icon url for app tab.
  getAppTabFavIconUrl: function GroupItems_getAppTabFavIconUrl(xulTab) {
    let iconUrl;

    if (UI.shouldLoadFavIcon(xulTab.linkedBrowser))
      iconUrl = UI.getFavIconUrlForTab(xulTab);
    else
      iconUrl = gFavIconService.defaultFavicon.spec;

    return iconUrl;
  },

  // ----------
  // Function: addAppTab
  // Adds the given xul:tab to the app tab tray in all groups
  addAppTab: function GroupItems_addAppTab(xulTab) {
    this.groupItems.forEach(function(groupItem) {
      groupItem.addAppTab(xulTab);
    });
    this.updateGroupCloseButtons();
  },

  // ----------
  // Function: removeAppTab
  // Removes the given xul:tab from the app tab tray in all groups
  removeAppTab: function GroupItems_removeAppTab(xulTab) {
    this.groupItems.forEach(function(groupItem) {
      groupItem.removeAppTab(xulTab);
    });
    this.updateGroupCloseButtons();
  },

  // ----------
  // Function: arrangeAppTab
  // Arranges the given xul:tab as an app tab from app tab tray in all groups
  arrangeAppTab: function GroupItems_arrangeAppTab(xulTab) {
    this.groupItems.forEach(function(groupItem) {
      groupItem.arrangeAppTab(xulTab);
    });
  },

  // ----------
  // Function: getNextID
  // Returns the next unused groupItem ID.
  getNextID: function GroupItems_getNextID() {
    var result = this.nextID;
    this.nextID++;
    this._save();
    return result;
  },

  // ----------
  // Function: getStorageData
  // Returns an object for saving GroupItems state to persistent storage.
  getStorageData: function GroupItems_getStorageData() {
    var data = {nextID: this.nextID, groupItems: []};
    this.groupItems.forEach(function(groupItem) {
      data.groupItems.push(groupItem.getStorageData());
    });

    return data;
  },

  // ----------
  // Function: saveAll
  // Saves GroupItems state, as well as the state of all of the groupItems.
  saveAll: function GroupItems_saveAll() {
    this._save();
    this.groupItems.forEach(function(groupItem) {
      groupItem.save();
    });
  },

  // ----------
  // Function: _save
  // Saves GroupItems state.
  _save: function GroupItems__save() {
    if (!this._inited) // too soon to save now
      return;

    let activeGroupId = this._activeGroupItem ? this._activeGroupItem.id : null;
    Storage.saveGroupItemsData(
      gWindow,
      { nextID: this.nextID, activeGroupId: activeGroupId,
        totalNumber: this.groupItems.length });
  },

  // ----------
  // Function: getBoundingBox
  // Given an array of DOM elements, returns a <Rect> with (roughly) the union of their locations.
  getBoundingBox: function GroupItems_getBoundingBox(els) {
    var bounds = [iQ(el).bounds() for each (el in els)];
    var left   = Math.min.apply({},[ b.left   for each (b in bounds) ]);
    var top    = Math.min.apply({},[ b.top    for each (b in bounds) ]);
    var right  = Math.max.apply({},[ b.right  for each (b in bounds) ]);
    var bottom = Math.max.apply({},[ b.bottom for each (b in bounds) ]);

    return new Rect(left, top, right-left, bottom-top);
  },

  // ----------
  // Function: reconstitute
  // Restores to stored state, creating groupItems as needed.
  reconstitute: function GroupItems_reconstitute(groupItemsData, groupItemData) {
    try {
      let activeGroupId;

      if (groupItemsData) {
        if (groupItemsData.nextID)
          this.nextID = Math.max(this.nextID, groupItemsData.nextID);
        if (groupItemsData.activeGroupId)
          activeGroupId = groupItemsData.activeGroupId;
      }

      if (groupItemData) {
        var toClose = this.groupItems.concat();
        for (var id in groupItemData) {
          let data = groupItemData[id];
          if (this.groupItemStorageSanity(data)) {
            let groupItem = this.groupItem(data.id); 
            if (groupItem && !groupItem.hidden) {
              groupItem.userSize = data.userSize;
              groupItem.setTitle(data.title);
              groupItem.setBounds(data.bounds, true);
              
              let index = toClose.indexOf(groupItem);
              if (index != -1)
                toClose.splice(index, 1);
            } else {
              var options = {
                dontPush: true,
                immediately: true
              };
  
              new GroupItem([], Utils.extend({}, data, options));
            }
          }
        }

        toClose.forEach(function(groupItem) {
          // All remaining children in to-be-closed groups are re-used by
          // session restore. Reconnect them so that they're put into their
          // right groups.
          groupItem.getChildren().forEach(function (tabItem) {
            if (tabItem.parent && tabItem.parent.hidden)
              iQ(tabItem.container).show();
            tabItem._reconnected = false;
            tabItem._reconnect();
          });
          groupItem.close({immediately: true});
        });
      }

      // set active group item
      if (activeGroupId) {
        let activeGroupItem = this.groupItem(activeGroupId);
        if (activeGroupItem)
          UI.setActive(activeGroupItem);
      }

      this._inited = true;
      this._save(); // for nextID
    } catch(e) {
      Utils.log("error in recons: "+e);
    }
  },

  // ----------
  // Function: load
  // Loads the storage data for groups. 
  // Returns true if there was global group data.
  load: function GroupItems_load() {
    let groupItemsData = Storage.readGroupItemsData(gWindow);
    let groupItemData = Storage.readGroupItemData(gWindow);
    this.reconstitute(groupItemsData, groupItemData);
    
    return (groupItemsData && !Utils.isEmptyObject(groupItemsData));
  },

  // ----------
  // Function: groupItemStorageSanity
  // Given persistent storage data for a groupItem, returns true if it appears to not be damaged.
  groupItemStorageSanity: function GroupItems_groupItemStorageSanity(groupItemData) {
    let sane = true;
    if (!groupItemData.bounds || !Utils.isRect(groupItemData.bounds)) {
      Utils.log('GroupItems.groupItemStorageSanity: bad bounds', groupItemData.bounds);
      sane = false;
    } else if ((groupItemData.userSize && 
               !Utils.isPoint(groupItemData.userSize)) ||
               !groupItemData.id) {
      sane = false;
    }

    return sane;
  },

  // ----------
  // Function: register
  // Adds the given <GroupItem> to the list of groupItems we're tracking.
  register: function GroupItems_register(groupItem) {
    Utils.assert(groupItem, 'groupItem');
    Utils.assert(this.groupItems.indexOf(groupItem) == -1, 'only register once per groupItem');
    this.groupItems.push(groupItem);
    UI.updateTabButton();
  },

  // ----------
  // Function: unregister
  // Removes the given <GroupItem> from the list of groupItems we're tracking.
  unregister: function GroupItems_unregister(groupItem) {
    var index = this.groupItems.indexOf(groupItem);
    if (index != -1)
      this.groupItems.splice(index, 1);

    if (groupItem == this._activeGroupItem)
      this._activeGroupItem = null;

    this._arrangesPending = this._arrangesPending.filter(function (pending) {
      return groupItem != pending.groupItem;
    });

    this._lastActiveList.remove(groupItem);
    UI.updateTabButton();
  },

  // ----------
  // Function: groupItem
  // Given some sort of identifier, returns the appropriate groupItem.
  // Currently only supports groupItem ids.
  groupItem: function GroupItems_groupItem(a) {
    var result = null;
    this.groupItems.forEach(function(candidate) {
      if (candidate.id == a)
        result = candidate;
    });

    return result;
  },

  // ----------
  // Function: removeAll
  // Removes all tabs from all groupItems (which automatically closes all unnamed groupItems).
  removeAll: function GroupItems_removeAll() {
    var toRemove = this.groupItems.concat();
    toRemove.forEach(function(groupItem) {
      groupItem.removeAll();
    });
  },

  // ----------
  // Function: newTab
  // Given a <TabItem>, files it in the appropriate groupItem.
  newTab: function GroupItems_newTab(tabItem, options) {
    let activeGroupItem = this.getActiveGroupItem();

    // 1. Active group
    // 2. First visible non-app tab (that's not the tab in question)
    // 3. First group
    // 4. At this point there should be no groups or tabs (except for app tabs and the
    // tab in question): make a new group

    if (activeGroupItem && !activeGroupItem.hidden) {
      activeGroupItem.add(tabItem, options);
      return;
    }

    let targetGroupItem;
    // find first non-app visible tab belongs a group, and add the new tabItem
    // to that group
    gBrowser.visibleTabs.some(function(tab) {
      if (!tab.pinned && tab != tabItem.tab) {
        if (tab._tabViewTabItem && tab._tabViewTabItem.parent &&
            !tab._tabViewTabItem.parent.hidden) {
          targetGroupItem = tab._tabViewTabItem.parent;
        }
        return true;
      }
      return false;
    });

    let visibleGroupItems;
    if (targetGroupItem) {
      // add the new tabItem to the first group item
      targetGroupItem.add(tabItem);
      UI.setActive(targetGroupItem);
      return;
    } else {
      // find the first visible group item
      visibleGroupItems = this.groupItems.filter(function(groupItem) {
        return (!groupItem.hidden);
      });
      if (visibleGroupItems.length > 0) {
        visibleGroupItems[0].add(tabItem);
        UI.setActive(visibleGroupItems[0]);
        return;
      }
    }

    // create new group for the new tabItem
    tabItem.setPosition(60, 60, true);
    let newGroupItemBounds = tabItem.getBounds();

    newGroupItemBounds.inset(-40,-40);
    let newGroupItem = new GroupItem([tabItem], { bounds: newGroupItemBounds });
    newGroupItem.snap();
    UI.setActive(newGroupItem);
  },

  // ----------
  // Function: getActiveGroupItem
  // Returns the active groupItem. Active means its tabs are
  // shown in the tab bar when not in the TabView interface.
  getActiveGroupItem: function GroupItems_getActiveGroupItem() {
    return this._activeGroupItem;
  },

  // ----------
  // Function: setActiveGroupItem
  // Sets the active groupItem, thereby showing only the relevant tabs and
  // setting the groupItem which will receive new tabs.
  //
  // Paramaters:
  //  groupItem - the active <GroupItem>
  setActiveGroupItem: function GroupItems_setActiveGroupItem(groupItem) {
    Utils.assert(groupItem, "groupItem must be given");

    if (this._activeGroupItem)
      iQ(this._activeGroupItem.container).removeClass('activeGroupItem');

    iQ(groupItem.container).addClass('activeGroupItem');

    this._lastActiveList.update(groupItem);
    this._activeGroupItem = groupItem;
    this._save();
  },

  // ----------
  // Function: getLastActiveGroupItem
  // Gets last active group item.
  // Returns the <groupItem>. If nothing is found, return null.
  getLastActiveGroupItem: function GroupItem_getLastActiveGroupItem() {
    return this._lastActiveList.peek(function(groupItem) {
      return (groupItem && !groupItem.hidden && groupItem.getChildren().length > 0)
    });
  },

  // ----------
  // Function: _updateTabBar
  // Hides and shows tabs in the tab bar based on the active groupItem
  _updateTabBar: function GroupItems__updateTabBar() {
    if (!window.UI)
      return; // called too soon

    Utils.assert(this._activeGroupItem, "There must be something to show in the tab bar!");

    let tabItems = this._activeGroupItem._children;
    gBrowser.showOnlyTheseTabs(tabItems.map(function(item) item.tab));
  },

  // ----------
  // Function: updateActiveGroupItemAndTabBar
  // Sets active TabItem and GroupItem, and updates tab bar appropriately.
  updateActiveGroupItemAndTabBar: function GroupItems_updateActiveGroupItemAndTabBar(tabItem) {
    Utils.assertThrow(tabItem && tabItem.isATabItem, "tabItem must be a TabItem");

    UI.setActive(tabItem);
    this._updateTabBar();
  },

  // ----------
  // Function: getNextGroupItemTab
  // Paramaters:
  //  reverse - the boolean indicates the direction to look for the next groupItem.
  // Returns the <tabItem>. If nothing is found, return null.
  getNextGroupItemTab: function GroupItems_getNextGroupItemTab(reverse) {
    var groupItems = Utils.copy(GroupItems.groupItems);
    var activeGroupItem = GroupItems.getActiveGroupItem();
    var tabItem = null;

    if (reverse)
      groupItems = groupItems.reverse();

    if (!activeGroupItem) {
      if (groupItems.length > 0) {
        groupItems.some(function(groupItem) {
          if (!groupItem.hidden) {
            // restore the last active tab in the group
            let activeTab = groupItem.getActiveTab();
            if (activeTab) {
              tabItem = activeTab;
              return true;
            }
            // if no tab is active, use the first one
            var child = groupItem.getChild(0);
            if (child) {
              tabItem = child;
              return true;
            }
          }
          return false;
        });
      }
    } else {
      var currentIndex;
      groupItems.some(function(groupItem, index) {
        if (!groupItem.hidden && groupItem == activeGroupItem) {
          currentIndex = index;
          return true;
        }
        return false;
      });
      var firstGroupItems = groupItems.slice(currentIndex + 1);
      firstGroupItems.some(function(groupItem) {
        if (!groupItem.hidden) {
          // restore the last active tab in the group
          let activeTab = groupItem.getActiveTab();
          if (activeTab) {
            tabItem = activeTab;
            return true;
          }
          // if no tab is active, use the first one
          var child = groupItem.getChild(0);
          if (child) {
            tabItem = child;
            return true;
          }
        }
        return false;
      });
      if (!tabItem) {
        var secondGroupItems = groupItems.slice(0, currentIndex);
        secondGroupItems.some(function(groupItem) {
          if (!groupItem.hidden) {
            // restore the last active tab in the group
            let activeTab = groupItem.getActiveTab();
            if (activeTab) {
              tabItem = activeTab;
              return true;
            }
            // if no tab is active, use the first one
            var child = groupItem.getChild(0);
            if (child) {
              tabItem = child;
              return true;
            }
          }
          return false;
        });
      }
    }
    return tabItem;
  },

  // ----------
  // Function: moveTabToGroupItem
  // Used for the right click menu in the tab strip; moves the given tab
  // into the given group. Does nothing if the tab is an app tab.
  // Paramaters:
  //  tab - the <xul:tab>.
  //  groupItemId - the <groupItem>'s id.  If nothing, create a new <groupItem>.
  moveTabToGroupItem : function GroupItems_moveTabToGroupItem(tab, groupItemId) {
    if (tab.pinned)
      return;

    Utils.assertThrow(tab._tabViewTabItem, "tab must be linked to a TabItem");

    // given tab is already contained in target group
    if (tab._tabViewTabItem.parent && tab._tabViewTabItem.parent.id == groupItemId)
      return;

    let shouldUpdateTabBar = false;
    let shouldShowTabView = false;
    let groupItem;

    // switch to the appropriate tab first.
    if (gBrowser.selectedTab == tab) {
      if (gBrowser.visibleTabs.length > 1) {
        gBrowser._blurTab(tab);
        shouldUpdateTabBar = true;
      } else {
        shouldShowTabView = true;
      }
    } else {
      shouldUpdateTabBar = true
    }

    // remove tab item from a groupItem
    if (tab._tabViewTabItem.parent)
      tab._tabViewTabItem.parent.remove(tab._tabViewTabItem);

    // add tab item to a groupItem
    if (groupItemId) {
      groupItem = GroupItems.groupItem(groupItemId);
      groupItem.add(tab._tabViewTabItem);
      groupItem.reorderTabsBasedOnTabItemOrder()
    } else {
      let pageBounds = Items.getPageBounds();
      pageBounds.inset(20, 20);

      let box = new Rect(pageBounds);
      box.width = 250;
      box.height = 200;

      new GroupItem([ tab._tabViewTabItem ], { bounds: box, immediately: true });
    }

    if (shouldUpdateTabBar)
      this._updateTabBar();
    else if (shouldShowTabView)
      UI.showTabView();
  },

  // ----------
  // Function: removeHiddenGroups
  // Removes all hidden groups' data and its browser tabs.
  removeHiddenGroups: function GroupItems_removeHiddenGroups() {
    if (this._removingHiddenGroups)
      return;
    this._removingHiddenGroups = true;

    let groupItems = this.groupItems.concat();
    groupItems.forEach(function(groupItem) {
      if (groupItem.hidden)
        groupItem.closeHidden();
     });

    this._removingHiddenGroups = false;
  },

  // ----------
  // Function: getUnclosableGroupItemId
  // If there's only one (non-hidden) group, and there are app tabs present, 
  // returns that group.
  // Return the <GroupItem>'s Id
  getUnclosableGroupItemId: function GroupItems_getUnclosableGroupItemId() {
    let unclosableGroupItemId = null;

    if (gBrowser._numPinnedTabs > 0) {
      let hiddenGroupItems = 
        this.groupItems.concat().filter(function(groupItem) {
          return !groupItem.hidden;
        });
      if (hiddenGroupItems.length == 1)
        unclosableGroupItemId = hiddenGroupItems[0].id;
    }

    return unclosableGroupItemId;
  },

  // ----------
  // Function: updateGroupCloseButtons
  // Updates group close buttons.
  updateGroupCloseButtons: function GroupItems_updateGroupCloseButtons() {
    let unclosableGroupItemId = this.getUnclosableGroupItemId();

    if (unclosableGroupItemId) {
      let groupItem = this.groupItem(unclosableGroupItemId);

      if (groupItem) {
        groupItem.$closeButton.hide();
      }
    } else {
      this.groupItems.forEach(function(groupItem) {
        groupItem.$closeButton.show();
      });
    }
  },
  
  // ----------
  // Function: calcValidSize
  // Basic measure rules. Assures that item is a minimum size.
  calcValidSize: function GroupItems_calcValidSize(size, options) {
    Utils.assert(Utils.isPoint(size), 'input is a Point');
    Utils.assert((size.x>0 || size.y>0) && (size.x!=0 && size.y!=0), 
      "dimensions are valid:"+size.x+","+size.y);
    return new Point(
      Math.max(size.x, GroupItems.minGroupWidth),
      Math.max(size.y, GroupItems.minGroupHeight));
  },

  // ----------
  // Function: pauseAutoclose()
  // Temporarily disable the behavior that closes groups when they become
  // empty. This is used when entering private browsing, to avoid trashing the
  // user's groups while private browsing is shuffling things around.
  pauseAutoclose: function GroupItems_pauseAutoclose() {
    this._autoclosePaused = true;
  },

  // ----------
  // Function: unpauseAutoclose()
  // Re-enables the auto-close behavior.
  resumeAutoclose: function GroupItems_resumeAutoclose() {
    this._autoclosePaused = false;
  }
};
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is tabitems.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Ian Gilman <ian@iangilman.com>
 * Aza Raskin <aza@mozilla.com>
 * Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 * Ehsan Akhgari <ehsan@mozilla.com>
 * Raymond Lee <raymond@appcoast.com>
 * Tim Taubert <tim.taubert@gmx.de>
 * Sean Dunn <seanedunn@yahoo.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: tabitems.js

// ##########
// Class: TabItem
// An <Item> that represents a tab. Also implements the <Subscribable> interface.
//
// Parameters:
//   tab - a xul:tab
function TabItem(tab, options) {
  Utils.assert(tab, "tab");

  this.tab = tab;
  // register this as the tab's tabItem
  this.tab._tabViewTabItem = this;

  if (!options)
    options = {};

  // ___ set up div
  document.body.appendChild(TabItems.fragment().cloneNode(true));
  
  // The document fragment contains just one Node
  // As per DOM3 appendChild: it will then be the last child
  let div = document.body.lastChild;
  let $div = iQ(div);

  this._cachedImageData = null;
  this._thumbnailNeedsSaving = false;
  this.canvasSizeForced = false;
  this.$thumb = iQ('.thumb', $div);
  this.$fav   = iQ('.favicon', $div);
  this.$tabTitle = iQ('.tab-title', $div);
  this.$canvas = iQ('.thumb canvas', $div);
  this.$cachedThumb = iQ('img.cached-thumb', $div);
  this.$favImage = iQ('.favicon>img', $div);
  this.$close = iQ('.close', $div);

  this.tabCanvas = new TabCanvas(this.tab, this.$canvas[0]);

  let self = this;

  // when we paint onto the canvas make sure our thumbnail gets saved
  this.tabCanvas.addSubscriber("painted", function () {
    self._thumbnailNeedsSaving = true;
  });

  this.defaultSize = new Point(TabItems.tabWidth, TabItems.tabHeight);
  this._hidden = false;
  this.isATabItem = true;
  this.keepProportional = true;
  this._hasBeenDrawn = false;
  this._reconnected = false;
  this.isDragging = false;
  this.isStacked = false;
  this.url = "";

  // Read off the total vertical and horizontal padding on the tab container
  // and cache this value, as it must be the same for every TabItem.
  if (Utils.isEmptyObject(TabItems.tabItemPadding)) {
    TabItems.tabItemPadding.x = parseInt($div.css('padding-left'))
        + parseInt($div.css('padding-right'));
  
    TabItems.tabItemPadding.y = parseInt($div.css('padding-top'))
        + parseInt($div.css('padding-bottom'));
  }
  
  this.bounds = new Rect(0,0,1,1);

  this._lastTabUpdateTime = Date.now();

  // ___ superclass setup
  this._init(div);

  // ___ drag/drop
  // override dropOptions with custom tabitem methods
  this.dropOptions.drop = function(e) {
    let groupItem = drag.info.item.parent;
    groupItem.add(drag.info.$el);
  };

  this.draggable();

  // ___ more div setup
  $div.mousedown(function(e) {
    if (!Utils.isRightClick(e))
      self.lastMouseDownTarget = e.target;
  });

  $div.mouseup(function(e) {
    var same = (e.target == self.lastMouseDownTarget);
    self.lastMouseDownTarget = null;
    if (!same)
      return;

    // press close button or middle mouse click
    if (iQ(e.target).hasClass("close") || Utils.isMiddleClick(e)) {
      self.closedManually = true;
      self.close();
    } else {
      if (!Items.item(this).isDragging)
        self.zoomIn();
    }
  });

  this.droppable(true);

  TabItems.register(this);

  // ___ reconnect to data from Storage
  if (!TabItems.reconnectingPaused())
    this._reconnect(options);
};

TabItem.prototype = Utils.extend(new Item(), new Subscribable(), {
  // ----------
  // Function: toString
  // Prints [TabItem (tab)] for debug use
  toString: function TabItem_toString() {
    return "[TabItem (" + this.tab + ")]";
  },

  // ----------
  // Function: forceCanvasSize
  // Repaints the thumbnail with the given resolution, and forces it
  // to stay that resolution until unforceCanvasSize is called.
  forceCanvasSize: function TabItem_forceCanvasSize(w, h) {
    this.canvasSizeForced = true;
    this.$canvas[0].width = w;
    this.$canvas[0].height = h;
    this.tabCanvas.paint();
  },

  // ----------
  // Function: unforceCanvasSize
  // Stops holding the thumbnail resolution; allows it to shift to the
  // size of thumbnail on screen. Note that this call does not nest, unlike
  // <TabItems.resumePainting>; if you call forceCanvasSize multiple
  // times, you just need a single unforce to clear them all.
  unforceCanvasSize: function TabItem_unforceCanvasSize() {
    this.canvasSizeForced = false;
  },

  // ----------
  // Function: isShowingCachedData
  // Returns a boolean indicates whether the cached data is being displayed or
  // not. 
  isShowingCachedData: function TabItem_isShowingCachedData() {
    return (this._cachedImageData != null);
  },

  // ----------
  // Function: showCachedData
  // Shows the cached data i.e. image and title.  Note: this method should only
  // be called at browser startup with the cached data avaliable.
  //
  // Parameters:
  //   tabData - the tab data
  //   imageData - the image data
  showCachedData: function TabItem_showCachedData(tabData, imageData) {
    this._cachedImageData = imageData;
    this.$cachedThumb.attr("src", this._cachedImageData).show();
    this.$canvas.css({opacity: 0});
    this.$tabTitle.text(tabData.title ? tabData.title : "");

    this._sendToSubscribers("showingCachedData");
  },

  // ----------
  // Function: hideCachedData
  // Hides the cached data i.e. image and title and show the canvas.
  hideCachedData: function TabItem_hideCachedData() {
    this.$cachedThumb.hide();
    this.$canvas.css({opacity: 1.0});
    if (this._cachedImageData)
      this._cachedImageData = null;
  },

  // ----------
  // Function: getStorageData
  // Get data to be used for persistent storage of this object.
  getStorageData: function TabItem_getStorageData() {
    let data = {
      url: this.tab.linkedBrowser.currentURI.spec,
      groupID: (this.parent ? this.parent.id : 0),
      title: this.tab.label
    };
    if (this.parent && this.parent.getActiveTab() == this)
      data.active = true;

    return data;
  },

  // ----------
  // Function: save
  // Store persistent for this object.
  save: function TabItem_save() {
    try {
      if (!this.tab || this.tab.parentNode == null || !this._reconnected) // too soon/late to save
        return;

      let data = this.getStorageData();
      if (TabItems.storageSanity(data))
        Storage.saveTab(this.tab, data);
    } catch(e) {
      Utils.log("Error in saving tab value: "+e);
    }
  },

  // ----------
  // Function: loadThumbnail
  // Loads the tabItems thumbnail.
  loadThumbnail: function TabItem_loadThumbnail(tabData) {
    Utils.assert(tabData, "invalid or missing argument <tabData>");

    let self = this;

    function TabItem_loadThumbnail_callback(error, imageData) {
      // we could have been unlinked while waiting for the thumbnail to load
      if (error || !imageData || !self.tab)
        return;

      self._sendToSubscribers("loadedCachedImageData");

      // If we have a cached image, then show it if the loaded URL matches
      // what the cache is from, OR the loaded URL is blank, which means
      // that the page hasn't loaded yet.
      let currentUrl = self.tab.linkedBrowser.currentURI.spec;
      if (tabData.url == currentUrl || currentUrl == "about:blank")
        self.showCachedData(tabData, imageData);
    }

    ThumbnailStorage.loadThumbnail(tabData.url, TabItem_loadThumbnail_callback);
  },

  // ----------
  // Function: saveThumbnail
  // Saves the tabItems thumbnail.
  saveThumbnail: function TabItem_saveThumbnail(options) {
    if (!this.tabCanvas)
      return;

    // nothing to do if the thumbnail hasn't changed
    if (!this._thumbnailNeedsSaving)
      return;

    // check the storage policy to see if we're allowed to store the thumbnail
    if (!StoragePolicy.canStoreThumbnailForTab(this.tab)) {
      this._sendToSubscribers("deniedToSaveImageData");
      return;
    }

    let url = this.tab.linkedBrowser.currentURI.spec;
    let delayed = this._saveThumbnailDelayed;
    let synchronously = (options && options.synchronously);

    // is there a delayed save waiting?
    if (delayed) {
      // check if url has changed since last call to saveThumbnail
      if (!synchronously && url == delayed.url)
        return;

      // url has changed in the meantime, clear the timeout
      clearTimeout(delayed.timeout);
    }

    let self = this;

    function callback(error) {
      if (!error) {
        self._thumbnailNeedsSaving = false;
        self._sendToSubscribers("savedCachedImageData");
      }
    }

    function doSaveThumbnail() {
      self._saveThumbnailDelayed = null;

      // we could have been unlinked in the meantime
      if (!self.tabCanvas)
        return;

      let imageData = self.tabCanvas.toImageData();
      ThumbnailStorage.saveThumbnail(url, imageData, callback, options);
    }

    if (synchronously) {
      doSaveThumbnail();
    } else {
      let timeout = setTimeout(doSaveThumbnail, 2000);
      this._saveThumbnailDelayed = {url: url, timeout: timeout};
    }
  },

  // ----------
  // Function: _reconnect
  // Load the reciever's persistent data from storage. If there is none, 
  // treats it as a new tab. 
  //
  // Parameters:
  //   options - an object with additional parameters, see below
  //
  // Possible options:
  //   groupItemId - if the tab doesn't have any data associated with it and
  //                 groupItemId is available, add the tab to that group.
  _reconnect: function TabItem__reconnect(options) {
    Utils.assertThrow(!this._reconnected, "shouldn't already be reconnected");
    Utils.assertThrow(this.tab, "should have a xul:tab");

    let tabData = Storage.getTabData(this.tab);
    let groupItem;

    if (tabData && TabItems.storageSanity(tabData)) {
      this.loadThumbnail(tabData);

      if (this.parent)
        this.parent.remove(this, {immediately: true});

      if (tabData.groupID)
        groupItem = GroupItems.groupItem(tabData.groupID);
      else
        groupItem = new GroupItem([], {immediately: true, bounds: tabData.bounds});

      if (groupItem) {
        groupItem.add(this, {immediately: true});

        // restore the active tab for each group between browser sessions
        if (tabData.active)
          groupItem.setActiveTab(this);

        // if it matches the selected tab or no active tab and the browser
        // tab is hidden, the active group item would be set.
        if (this.tab == gBrowser.selectedTab ||
            (!GroupItems.getActiveGroupItem() && !this.tab.hidden))
          UI.setActive(this.parent);
      }
    } else {
      if (options && options.groupItemId)
        groupItem = GroupItems.groupItem(options.groupItemId);

      if (groupItem) {
        groupItem.add(this, {immediately: true});
      } else {
        // create tab group by double click is handled in UI_init().
        GroupItems.newTab(this, {immediately: true});
      }
    }

    this._reconnected = true;
    this.save();
    this._sendToSubscribers("reconnected");
  },

  // ----------
  // Function: setHidden
  // Hide/unhide this item
  setHidden: function TabItem_setHidden(val) {
    if (val)
      this.addClass("tabHidden");
    else
      this.removeClass("tabHidden");
    this._hidden = val;
  },

  // ----------
  // Function: getHidden
  // Return hide state of item
  getHidden: function TabItem_getHidden() {
    return this._hidden;
  },

  // ----------
  // Function: setBounds
  // Moves this item to the specified location and size.
  //
  // Parameters:
  //   rect - a <Rect> giving the new bounds
  //   immediately - true if it should not animate; default false
  //   options - an object with additional parameters, see below
  //
  // Possible options:
  //   force - true to always update the DOM even if the bounds haven't changed; default false
  setBounds: function TabItem_setBounds(inRect, immediately, options) {
    Utils.assert(Utils.isRect(inRect), 'TabItem.setBounds: rect is not a real rectangle!');

    if (!options)
      options = {};

    // force the input size to be valid
    let validSize = TabItems.calcValidSize(
      new Point(inRect.width, inRect.height), 
      {hideTitle: (this.isStacked || options.hideTitle === true)});
    let rect = new Rect(inRect.left, inRect.top, 
      validSize.x, validSize.y);

    var css = {};

    if (rect.left != this.bounds.left || options.force)
      css.left = rect.left;

    if (rect.top != this.bounds.top || options.force)
      css.top = rect.top;

    if (rect.width != this.bounds.width || options.force) {
      css.width = rect.width - TabItems.tabItemPadding.x;
      css.fontSize = TabItems.getFontSizeFromWidth(rect.width);
      css.fontSize += 'px';
    }

    if (rect.height != this.bounds.height || options.force) {
      css.height = rect.height - TabItems.tabItemPadding.y;
      if (!this.isStacked)
        css.height -= TabItems.fontSizeRange.max;
    }

    if (Utils.isEmptyObject(css))
      return;

    this.bounds.copy(rect);

    // If this is a brand new tab don't animate it in from
    // a random location (i.e., from [0,0]). Instead, just
    // have it appear where it should be.
    if (immediately || (!this._hasBeenDrawn)) {
      this.$container.css(css);
    } else {
      TabItems.pausePainting();
      this.$container.animate(css, {
          duration: 200,
        easing: "tabviewBounce",
        complete: function() {
          TabItems.resumePainting();
        }
      });
    }

    if (css.fontSize && !(this.parent && this.parent.isStacked())) {
      if (css.fontSize < TabItems.fontSizeRange.min)
        immediately ? this.$tabTitle.hide() : this.$tabTitle.fadeOut();
      else
        immediately ? this.$tabTitle.show() : this.$tabTitle.fadeIn();
    }

    if (css.width) {
      TabItems.update(this.tab);

      let widthRange, proportion;

      if (this.parent && this.parent.isStacked()) {
        if (UI.rtl) {
          this.$fav.css({top:0, right:0});
        } else {
          this.$fav.css({top:0, left:0});
        }
        widthRange = new Range(70, 90);
        proportion = widthRange.proportion(css.width); // between 0 and 1
      } else {
        if (UI.rtl) {
          this.$fav.css({top:4, right:2});
        } else {
          this.$fav.css({top:4, left:4});
        }
        widthRange = new Range(40, 45);
        proportion = widthRange.proportion(css.width); // between 0 and 1
      }

      if (proportion <= .1)
        this.$close.hide();
      else
        this.$close.show().css({opacity:proportion});

      var pad = 1 + 5 * proportion;
      var alphaRange = new Range(0.1,0.2);
      this.$fav.css({
       "-moz-padding-start": pad + "px",
       "-moz-padding-end": pad + 2 + "px",
       "padding-top": pad + "px",
       "padding-bottom": pad + "px",
       "border-color": "rgba(0,0,0,"+ alphaRange.scale(proportion) +")",
      });
    }

    this._hasBeenDrawn = true;

    UI.clearShouldResizeItems();

    rect = this.getBounds(); // ensure that it's a <Rect>

    Utils.assert(Utils.isRect(this.bounds), 'TabItem.setBounds: this.bounds is not a real rectangle!');

    if (!this.parent && this.tab.parentNode != null)
      this.setTrenches(rect);

    this.save();
  },

  // ----------
  // Function: setZ
  // Sets the z-index for this item.
  setZ: function TabItem_setZ(value) {
    this.zIndex = value;
    this.$container.css({zIndex: value});
  },

  // ----------
  // Function: close
  // Closes this item (actually closes the tab associated with it, which automatically
  // closes the item.
  // Parameters:
  //   groupClose - true if this method is called by group close action.
  // Returns true if this tab is removed.
  close: function TabItem_close(groupClose) {
    // When the last tab is closed, put a new tab into closing tab's group. If
    // closing tab doesn't belong to a group and no empty group, create a new 
    // one for the new tab.
    if (!groupClose && gBrowser.tabs.length == 1) {
      let group = this.tab._tabViewTabItem.parent;
      group.newTab(null, { closedLastTab: true });
    }

    // when "TabClose" event is fired, the browser tab is about to close and our 
    // item "close" is fired before the browser tab actually get closed. 
    // Therefore, we need "tabRemoved" event below.
    gBrowser.removeTab(this.tab);
    let tabClosed = !this.tab;

    if (tabClosed)
      this._sendToSubscribers("tabRemoved");

    // No need to explicitly delete the tab data, becasue sessionstore data
    // associated with the tab will automatically go away
    return tabClosed;
  },

  // ----------
  // Function: addClass
  // Adds the specified CSS class to this item's container DOM element.
  addClass: function TabItem_addClass(className) {
    this.$container.addClass(className);
  },

  // ----------
  // Function: removeClass
  // Removes the specified CSS class from this item's container DOM element.
  removeClass: function TabItem_removeClass(className) {
    this.$container.removeClass(className);
  },

  // ----------
  // Function: makeActive
  // Updates this item to visually indicate that it's active.
  makeActive: function TabItem_makeActive() {
    this.$container.addClass("focus");

    if (this.parent)
      this.parent.setActiveTab(this);
  },

  // ----------
  // Function: makeDeactive
  // Updates this item to visually indicate that it's not active.
  makeDeactive: function TabItem_makeDeactive() {
    this.$container.removeClass("focus");
  },

  // ----------
  // Function: zoomIn
  // Allows you to select the tab and zoom in on it, thereby bringing you
  // to the tab in Firefox to interact with.
  // Parameters:
  //   isNewBlankTab - boolean indicates whether it is a newly opened blank tab.
  zoomIn: function TabItem_zoomIn(isNewBlankTab) {
    // don't allow zoom in if its group is hidden
    if (this.parent && this.parent.hidden)
      return;

    let self = this;
    let $tabEl = this.$container;
    let $canvas = this.$canvas;

    Search.hide();

    UI.setActive(this);
    TabItems._update(this.tab, {force: true});

    // Zoom in!
    let tab = this.tab;

    function onZoomDone() {
      $canvas.css({ '-moz-transform': null });
      $tabEl.removeClass("front");

      UI.goToTab(tab);

      // tab might not be selected because hideTabView() is invoked after 
      // UI.goToTab() so we need to setup everything for the gBrowser.selectedTab
      if (tab != gBrowser.selectedTab) {
        UI.onTabSelect(gBrowser.selectedTab);
      } else { 
        if (isNewBlankTab)
          gWindow.gURLBar.focus();
      }
      if (self.parent && self.parent.expanded)
        self.parent.collapse();

      self._sendToSubscribers("zoomedIn");
    }

    let animateZoom = gPrefBranch.getBoolPref("animate_zoom");
    if (animateZoom) {
      let transform = this.getZoomTransform();
      TabItems.pausePainting();

      if (this.parent && this.parent.expanded)
        $tabEl.removeClass("stack-trayed");
      $tabEl.addClass("front");
      $canvas
        .css({ '-moz-transform-origin': transform.transformOrigin })
        .animate({ '-moz-transform': transform.transform }, {
          duration: 230,
          easing: 'fast',
          complete: function() {
            onZoomDone();

            setTimeout(function() {
              TabItems.resumePainting();
            }, 0);
          }
        });
    } else {
      setTimeout(onZoomDone, 0);
    }
  },

  // ----------
  // Function: zoomOut
  // Handles the zoom down animation after returning to TabView.
  // It is expected that this routine will be called from the chrome thread
  //
  // Parameters:
  //   complete - a function to call after the zoom down animation
  zoomOut: function TabItem_zoomOut(complete) {
    let $tab = this.$container, $canvas = this.$canvas;
    var self = this;
    
    let onZoomDone = function onZoomDone() {
      $tab.removeClass("front");
      $canvas.css("-moz-transform", null);

      if (typeof complete == "function")
        complete();
    };

    UI.setActive(this);
    TabItems._update(this.tab, {force: true});

    $tab.addClass("front");

    let animateZoom = gPrefBranch.getBoolPref("animate_zoom");
    if (animateZoom) {
      // The scaleCheat of 2 here is a clever way to speed up the zoom-out
      // code. See getZoomTransform() below.
      let transform = this.getZoomTransform(2);
      TabItems.pausePainting();

      $canvas.css({
        '-moz-transform': transform.transform,
        '-moz-transform-origin': transform.transformOrigin
      });

      $canvas.animate({ "-moz-transform": "scale(1.0)" }, {
        duration: 300,
        easing: 'cubic-bezier', // note that this is legal easing, even without parameters
        complete: function() {
          TabItems.resumePainting();
          onZoomDone();
        }
      });
    } else {
      onZoomDone();
    }
  },

  // ----------
  // Function: getZoomTransform
  // Returns the transform function which represents the maximum bounds of the
  // tab thumbnail in the zoom animation.
  getZoomTransform: function TabItem_getZoomTransform(scaleCheat) {
    // Taking the bounds of the container (as opposed to the canvas) makes us
    // immune to any transformations applied to the canvas.
    let { left, top, width, height, right, bottom } = this.$container.bounds();

    let { innerWidth: windowWidth, innerHeight: windowHeight } = window;

    // The scaleCheat is a clever way to speed up the zoom-in code.
    // Because image scaling is slowest on big images, we cheat and stop
    // the image at scaled-down size and placed accordingly. Because the
    // animation is fast, you can't see the difference but it feels a lot
    // zippier. The only trick is choosing the right animation function so
    // that you don't see a change in percieved animation speed from frame #1
    // (the tab) to frame #2 (the half-size image) to frame #3 (the first frame
    // of real animation). Choosing an animation that starts fast is key.

    if (!scaleCheat)
      scaleCheat = 1.7;

    let zoomWidth = width + (window.innerWidth - width) / scaleCheat;
    let zoomScaleFactor = zoomWidth / width;

    let zoomHeight = height * zoomScaleFactor;
    let zoomTop = top * (1 - 1/scaleCheat);
    let zoomLeft = left * (1 - 1/scaleCheat);

    let xOrigin = (left - zoomLeft) / ((left - zoomLeft) + (zoomLeft + zoomWidth - right)) * 100;
    let yOrigin = (top - zoomTop) / ((top - zoomTop) + (zoomTop + zoomHeight - bottom)) * 100;

    return {
      transformOrigin: xOrigin + "% " + yOrigin + "%",
      transform: "scale(" + zoomScaleFactor + ")"
    };
  }
});

// ##########
// Class: TabItems
// Singleton for managing <TabItem>s
let TabItems = {
  minTabWidth: 40,
  tabWidth: 160,
  tabHeight: 120,
  tabAspect: 0, // set in init
  invTabAspect: 0, // set in init  
  fontSize: 9,
  fontSizeRange: new Range(8,15),
  _fragment: null,
  items: [],
  paintingPaused: 0,
  _tabsWaitingForUpdate: null,
  _heartbeat: null, // see explanation at startHeartbeat() below
  _heartbeatTiming: 200, // milliseconds between calls
  _maxTimeForUpdating: 200, // milliseconds that consecutive updates can take
  _lastUpdateTime: Date.now(),
  _eventListeners: [],
  _pauseUpdateForTest: false,
  tempCanvas: null,
  _reconnectingPaused: false,
  tabItemPadding: {},

  // ----------
  // Function: toString
  // Prints [TabItems count=count] for debug use
  toString: function TabItems_toString() {
    return "[TabItems count=" + this.items.length + "]";
  },

  // ----------
  // Function: init
  // Set up the necessary tracking to maintain the <TabItems>s.
  init: function TabItems_init() {
    Utils.assert(window.AllTabs, "AllTabs must be initialized first");
    let self = this;
    
    // Set up tab priority queue
    this._tabsWaitingForUpdate = new TabPriorityQueue();
    this.minTabHeight = this.minTabWidth * this.tabHeight / this.tabWidth;
    this.tabAspect = this.tabHeight / this.tabWidth;
    this.invTabAspect = 1 / this.tabAspect;

    let $canvas = iQ("<canvas>")
      .attr('moz-opaque', '');
    $canvas.appendTo(iQ("body"));
    $canvas.hide();
    this.tempCanvas = $canvas[0];
    // 150 pixels is an empirical size, below which FF's drawWindow()
    // algorithm breaks down
    this.tempCanvas.width = 150;
    this.tempCanvas.height = 112;

    // When a tab is opened, create the TabItem
    this._eventListeners.open = function (event) {
      let tab = event.target;

      if (!tab.pinned)
        self.link(tab);
    }
    // When a tab's content is loaded, show the canvas and hide the cached data
    // if necessary.
    this._eventListeners.attrModified = function (event) {
      let tab = event.target;

      if (!tab.pinned)
        self.update(tab);
    }
    // When a tab is closed, unlink.
    this._eventListeners.close = function (event) {
      let tab = event.target;

      // XXX bug #635975 - don't unlink the tab if the dom window is closing.
      if (!tab.pinned && !UI.isDOMWindowClosing)
        self.unlink(tab);
    }
    for (let name in this._eventListeners) {
      AllTabs.register(name, this._eventListeners[name]);
    }

    let activeGroupItem = GroupItems.getActiveGroupItem();
    let activeGroupItemId = activeGroupItem ? activeGroupItem.id : null;
    // For each tab, create the link.
    AllTabs.tabs.forEach(function (tab) {
      if (tab.pinned)
        return;

      let options = {immediately: true};
      // if tab is visible in the tabstrip and doesn't have any data stored in 
      // the session store (see TabItem__reconnect), it implies that it is a 
      // new tab which is created before Panorama is initialized. Therefore, 
      // passing the active group id to the link() method for setting it up.
      if (!tab.hidden && activeGroupItemId)
         options.groupItemId = activeGroupItemId;
      self.link(tab, options);
      self.update(tab);
    });
  },

  // ----------
  // Function: uninit
  uninit: function TabItems_uninit() {
    for (let name in this._eventListeners) {
      AllTabs.unregister(name, this._eventListeners[name]);
    }
    this.items.forEach(function(tabItem) {
      for (let x in tabItem) {
        if (typeof tabItem[x] == "object")
          tabItem[x] = null;
      }
    });

    this.items = null;
    this._eventListeners = null;
    this._lastUpdateTime = null;
    this._tabsWaitingForUpdate.clear();
  },

  // ----------
  // Function: fragment
  // Return a DocumentFragment which has a single <div> child. This child node
  // will act as a template for all TabItem containers.
  // The first call of this function caches the DocumentFragment in _fragment.
  fragment: function TabItems_fragment() {
    if (this._fragment)
      return this._fragment;

    let div = document.createElement("div");
    div.classList.add("tab");
    div.innerHTML = "<div class='thumb'>" +
            "<img class='cached-thumb' style='display:none'/><canvas moz-opaque/></div>" +
            "<div class='favicon'><img/></div>" +
            "<span class='tab-title'>&nbsp;</span>" +
            "<div class='close'></div>";
    this._fragment = document.createDocumentFragment();
    this._fragment.appendChild(div);

    return this._fragment;
  },

  // ----------
  // Function: isComplete
  // Return whether the xul:tab has fully loaded.
  isComplete: function TabItems_isComplete(tab) {
    // If our readyState is complete, but we're showing about:blank,
    // and we're not loading about:blank, it means we haven't really
    // started loading. This can happen to the first few tabs in a
    // page.
    Utils.assertThrow(tab, "tab");
    return (
      tab.linkedBrowser.contentDocument.readyState == 'complete' &&
      !(tab.linkedBrowser.contentDocument.URL == 'about:blank' &&
        tab._tabViewTabItem.url != 'about:blank')
    );
  },

  // ----------
  // Function: update
  // Takes in a xul:tab.
  update: function TabItems_update(tab) {
    try {
      Utils.assertThrow(tab, "tab");
      Utils.assertThrow(!tab.pinned, "shouldn't be an app tab");
      Utils.assertThrow(tab._tabViewTabItem, "should already be linked");

      let shouldDefer = (
        this.isPaintingPaused() ||
        this._tabsWaitingForUpdate.hasItems() ||
        Date.now() - this._lastUpdateTime < this._heartbeatTiming
      );

      if (shouldDefer) {
        this._tabsWaitingForUpdate.push(tab);
        this.startHeartbeat();
      } else
        this._update(tab);
    } catch(e) {
      Utils.log(e);
    }
  },

  // ----------
  // Function: _update
  // Takes in a xul:tab.
  //
  // Parameters:
  //   tab - a xul tab to update
  //   options - an object with additional parameters, see below
  //
  // Possible options:
  //   force - true to always update the tab item even if it's incomplete
  _update: function TabItems__update(tab, options) {
    try {
      if (this._pauseUpdateForTest)
        return;

      Utils.assertThrow(tab, "tab");

      // ___ get the TabItem
      Utils.assertThrow(tab._tabViewTabItem, "must already be linked");
      let tabItem = tab._tabViewTabItem;

      // Even if the page hasn't loaded, display the favicon and title

      // ___ icon
      if (UI.shouldLoadFavIcon(tab.linkedBrowser)) {
        let iconUrl = UI.getFavIconUrlForTab(tab);

        if (tabItem.$favImage[0].src != iconUrl)
          tabItem.$favImage[0].src = iconUrl;

        iQ(tabItem.$fav[0]).show();
      } else {
        if (tabItem.$favImage[0].hasAttribute("src"))
          tabItem.$favImage[0].removeAttribute("src");
        iQ(tabItem.$fav[0]).hide();
      }

      // ___ label
      let label = tab.label;
      let $name = tabItem.$tabTitle;
      if ($name.text() != label)
        $name.text(label);

      // ___ remove from waiting list now that we have no other
      // early returns
      this._tabsWaitingForUpdate.remove(tab);

      // ___ URL
      let tabUrl = tab.linkedBrowser.currentURI.spec;
      if (tabUrl != tabItem.url) {
        let oldURL = tabItem.url;
        tabItem.url = tabUrl;
        tabItem.save();
      }

      // ___ Make sure the tab is complete and ready for updating.
      if (!this.isComplete(tab) && (!options || !options.force)) {
        // If it's incomplete, stick it on the end of the queue
        this._tabsWaitingForUpdate.push(tab);
        return;
      }

      // ___ thumbnail
      let $canvas = tabItem.$canvas;
      if (!tabItem.canvasSizeForced) {
        let w = $canvas.width();
        let h = $canvas.height();
        if (w != tabItem.$canvas[0].width || h != tabItem.$canvas[0].height) {
          tabItem.$canvas[0].width = w;
          tabItem.$canvas[0].height = h;
        }
      }

      this._lastUpdateTime = Date.now();
      tabItem._lastTabUpdateTime = this._lastUpdateTime;

      tabItem.tabCanvas.paint();
      tabItem.saveThumbnail();

      // ___ cache
      if (tabItem.isShowingCachedData())
        tabItem.hideCachedData();

      // ___ notify subscribers that a full update has completed.
      tabItem._sendToSubscribers("updated");
    } catch(e) {
      Utils.log(e);
    }
  },

  // ----------
  // Function: link
  // Takes in a xul:tab, creates a TabItem for it and adds it to the scene. 
  link: function TabItems_link(tab, options) {
    try {
      Utils.assertThrow(tab, "tab");
      Utils.assertThrow(!tab.pinned, "shouldn't be an app tab");
      Utils.assertThrow(!tab._tabViewTabItem, "shouldn't already be linked");
      new TabItem(tab, options); // sets tab._tabViewTabItem to itself
    } catch(e) {
      Utils.log(e);
    }
  },

  // ----------
  // Function: unlink
  // Takes in a xul:tab and destroys the TabItem associated with it. 
  unlink: function TabItems_unlink(tab) {
    try {
      Utils.assertThrow(tab, "tab");
      Utils.assertThrow(tab._tabViewTabItem, "should already be linked");
      // note that it's ok to unlink an app tab; see .handleTabUnpin

      this.unregister(tab._tabViewTabItem);
      tab._tabViewTabItem._sendToSubscribers("close");
      tab._tabViewTabItem.$container.remove();
      tab._tabViewTabItem.removeTrenches();
      Items.unsquish(null, tab._tabViewTabItem);

      tab._tabViewTabItem.tab = null;
      tab._tabViewTabItem.tabCanvas.tab = null;
      tab._tabViewTabItem.tabCanvas = null;
      tab._tabViewTabItem = null;
      Storage.saveTab(tab, null);

      this._tabsWaitingForUpdate.remove(tab);
    } catch(e) {
      Utils.log(e);
    }
  },

  // ----------
  // when a tab becomes pinned, destroy its TabItem
  handleTabPin: function TabItems_handleTabPin(xulTab) {
    this.unlink(xulTab);
  },

  // ----------
  // when a tab becomes unpinned, create a TabItem for it
  handleTabUnpin: function TabItems_handleTabUnpin(xulTab) {
    this.link(xulTab);
    this.update(xulTab);
  },

  // ----------
  // Function: startHeartbeat
  // Start a new heartbeat if there isn't one already started.
  // The heartbeat is a chain of setTimeout calls that allows us to spread
  // out update calls over a period of time.
  // _heartbeat is used to make sure that we don't add multiple 
  // setTimeout chains.
  startHeartbeat: function TabItems_startHeartbeat() {
    if (!this._heartbeat) {
      let self = this;
      this._heartbeat = setTimeout(function() {
        self._checkHeartbeat();
      }, this._heartbeatTiming);
    }
  },

  // ----------
  // Function: _checkHeartbeat
  // This periodically checks for tabs waiting to be updated, and calls
  // _update on them.
  // Should only be called by startHeartbeat and resumePainting.
  _checkHeartbeat: function TabItems__checkHeartbeat() {
    this._heartbeat = null;

    if (this.isPaintingPaused())
      return;

    // restart the heartbeat to update all waiting tabs once the UI becomes idle
    if (!UI.isIdle()) {
      this.startHeartbeat();
      return;
    }

    let accumTime = 0;
    let items = this._tabsWaitingForUpdate.getItems();
    // Do as many updates as we can fit into a "perceived" amount
    // of time, which is tunable.
    while (accumTime < this._maxTimeForUpdating && items.length) {
      let updateBegin = Date.now();
      this._update(items.pop());
      let updateEnd = Date.now();

      // Maintain a simple average of time for each tabitem update
      // We can use this as a base by which to delay things like
      // tab zooming, so there aren't any hitches.
      let deltaTime = updateEnd - updateBegin;
      accumTime += deltaTime;
    }

    if (this._tabsWaitingForUpdate.hasItems())
      this.startHeartbeat();
  },

  // ----------
  // Function: pausePainting
  // Tells TabItems to stop updating thumbnails (so you can do
  // animations without thumbnail paints causing stutters).
  // pausePainting can be called multiple times, but every call to
  // pausePainting needs to be mirrored with a call to <resumePainting>.
  pausePainting: function TabItems_pausePainting() {
    this.paintingPaused++;
    if (this._heartbeat) {
      clearTimeout(this._heartbeat);
      this._heartbeat = null;
    }
  },

  // ----------
  // Function: resumePainting
  // Undoes a call to <pausePainting>. For instance, if you called
  // pausePainting three times in a row, you'll need to call resumePainting
  // three times before TabItems will start updating thumbnails again.
  resumePainting: function TabItems_resumePainting() {
    this.paintingPaused--;
    Utils.assert(this.paintingPaused > -1, "paintingPaused should not go below zero");
    if (!this.isPaintingPaused())
      this.startHeartbeat();
  },

  // ----------
  // Function: isPaintingPaused
  // Returns a boolean indicating whether painting
  // is paused or not.
  isPaintingPaused: function TabItems_isPaintingPaused() {
    return this.paintingPaused > 0;
  },

  // ----------
  // Function: pauseReconnecting
  // Don't reconnect any new tabs until resume is called.
  pauseReconnecting: function TabItems_pauseReconnecting() {
    Utils.assertThrow(!this._reconnectingPaused, "shouldn't already be paused");

    this._reconnectingPaused = true;
  },
  
  // ----------
  // Function: resumeReconnecting
  // Reconnect all of the tabs that were created since we paused.
  resumeReconnecting: function TabItems_resumeReconnecting() {
    Utils.assertThrow(this._reconnectingPaused, "should already be paused");

    this._reconnectingPaused = false;
    this.items.forEach(function(item) {
      if (!item._reconnected)
        item._reconnect();
    });
  },
  
  // ----------
  // Function: reconnectingPaused
  // Returns true if reconnecting is paused.
  reconnectingPaused: function TabItems_reconnectingPaused() {
    return this._reconnectingPaused;
  },
  
  // ----------
  // Function: register
  // Adds the given <TabItem> to the master list.
  register: function TabItems_register(item) {
    Utils.assert(item && item.isAnItem, 'item must be a TabItem');
    Utils.assert(this.items.indexOf(item) == -1, 'only register once per item');
    this.items.push(item);
  },

  // ----------
  // Function: unregister
  // Removes the given <TabItem> from the master list.
  unregister: function TabItems_unregister(item) {
    var index = this.items.indexOf(item);
    if (index != -1)
      this.items.splice(index, 1);
  },

  // ----------
  // Function: getItems
  // Returns a copy of the master array of <TabItem>s.
  getItems: function TabItems_getItems() {
    return Utils.copy(this.items);
  },

  // ----------
  // Function: saveAll
  // Saves all open <TabItem>s.
  saveAll: function TabItems_saveAll() {
    let tabItems = this.getItems();

    tabItems.forEach(function TabItems_saveAll_forEach(tabItem) {
      tabItem.save();
    });
  },

  // ----------
  // Function: saveAllThumbnails
  // Saves thumbnails of all open <TabItem>s.
  saveAllThumbnails: function TabItems_saveAllThumbnails(options) {
    let tabItems = this.getItems();

    tabItems.forEach(function TabItems_saveAllThumbnails_forEach(tabItem) {
      tabItem.saveThumbnail(options);
    });
  },

  // ----------
  // Function: storageSanity
  // Checks the specified data (as returned by TabItem.getStorageData or loaded from storage)
  // and returns true if it looks valid.
  // TODO: this is a stub, please implement
  storageSanity: function TabItems_storageSanity(data) {
    return true;
  },

  // ----------
  // Function: getFontSizeFromWidth
  // Private method that returns the fontsize to use given the tab's width
  getFontSizeFromWidth: function TabItem_getFontSizeFromWidth(width) {
    let widthRange = new Range(0, TabItems.tabWidth);
    let proportion = widthRange.proportion(width - TabItems.tabItemPadding.x, true);
    // proportion is in [0,1]
    return TabItems.fontSizeRange.scale(proportion);
  },

  // ----------
  // Function: _getWidthForHeight
  // Private method that returns the tabitem width given a height.
  _getWidthForHeight: function TabItems__getWidthForHeight(height) {
    return height * TabItems.invTabAspect;
  },

  // ----------
  // Function: _getHeightForWidth
  // Private method that returns the tabitem height given a width.
  _getHeightForWidth: function TabItems__getHeightForWidth(width) {
    return width * TabItems.tabAspect;
  },

  // ----------
  // Function: calcValidSize
  // Pass in a desired size, and receive a size based on proper title
  // size and aspect ratio.
  calcValidSize: function TabItems_calcValidSize(size, options) {
    Utils.assert(Utils.isPoint(size), 'input is a Point');

    let width = Math.max(TabItems.minTabWidth, size.x);
    let showTitle = !options || !options.hideTitle;
    let titleSize = showTitle ? TabItems.fontSizeRange.max : 0;
    let height = Math.max(TabItems.minTabHeight, size.y - titleSize);
    let retSize = new Point(width, height);

    if (size.x > -1)
      retSize.y = this._getHeightForWidth(width);
    if (size.y > -1)
      retSize.x = this._getWidthForHeight(height);

    if (size.x > -1 && size.y > -1) {
      if (retSize.x < size.x)
        retSize.y = this._getHeightForWidth(retSize.x);
      else
        retSize.x = this._getWidthForHeight(retSize.y);
    }

    if (showTitle)
      retSize.y += titleSize;

    return retSize;
  }
};

// ##########
// Class: TabPriorityQueue
// Container that returns tab items in a priority order
// Current implementation assigns tab to either a high priority
// or low priority queue, and toggles which queue items are popped
// from. This guarantees that high priority items which are constantly
// being added will not eclipse changes for lower priority items.
function TabPriorityQueue() {
};

TabPriorityQueue.prototype = {
  _low: [], // low priority queue
  _high: [], // high priority queue

  // ----------
  // Function: toString
  // Prints [TabPriorityQueue count=count] for debug use
  toString: function TabPriorityQueue_toString() {
    return "[TabPriorityQueue count=" + (this._low.length + this._high.length) + "]";
  },

  // ----------
  // Function: clear
  // Empty the update queue
  clear: function TabPriorityQueue_clear() {
    this._low = [];
    this._high = [];
  },

  // ----------
  // Function: hasItems
  // Return whether pending items exist
  hasItems: function TabPriorityQueue_hasItems() {
    return (this._low.length > 0) || (this._high.length > 0);
  },

  // ----------
  // Function: getItems
  // Returns all queued items, ordered from low to high priority
  getItems: function TabPriorityQueue_getItems() {
    return this._low.concat(this._high);
  },

  // ----------
  // Function: push
  // Add an item to be prioritized
  push: function TabPriorityQueue_push(tab) {
    // Push onto correct priority queue.
    // It's only low priority if it's in a stack, and isn't the top,
    // and the stack isn't expanded.
    // If it already exists in the destination queue,
    // leave it. If it exists in a different queue, remove it first and push
    // onto new queue.
    let item = tab._tabViewTabItem;
    if (item.parent && (item.parent.isStacked() &&
      !item.parent.isTopOfStack(item) &&
      !item.parent.expanded)) {
      let idx = this._high.indexOf(tab);
      if (idx != -1) {
        this._high.splice(idx, 1);
        this._low.unshift(tab);
      } else if (this._low.indexOf(tab) == -1)
        this._low.unshift(tab);
    } else {
      let idx = this._low.indexOf(tab);
      if (idx != -1) {
        this._low.splice(idx, 1);
        this._high.unshift(tab);
      } else if (this._high.indexOf(tab) == -1)
        this._high.unshift(tab);
    }
  },

  // ----------
  // Function: pop
  // Remove and return the next item in priority order
  pop: function TabPriorityQueue_pop() {
    let ret = null;
    if (this._high.length)
      ret = this._high.pop();
    else if (this._low.length)
      ret = this._low.pop();
    return ret;
  },

  // ----------
  // Function: peek
  // Return the next item in priority order, without removing it
  peek: function TabPriorityQueue_peek() {
    let ret = null;
    if (this._high.length)
      ret = this._high[this._high.length-1];
    else if (this._low.length)
      ret = this._low[this._low.length-1];
    return ret;
  },

  // ----------
  // Function: remove
  // Remove the passed item
  remove: function TabPriorityQueue_remove(tab) {
    let index = this._high.indexOf(tab);
    if (index != -1)
      this._high.splice(index, 1);
    else {
      index = this._low.indexOf(tab);
      if (index != -1)
        this._low.splice(index, 1);
    }
  }
};

// ##########
// Class: TabCanvas
// Takes care of the actual canvas for the tab thumbnail
// Does not need to be accessed from outside of tabitems.js
function TabCanvas(tab, canvas) {
  this.tab = tab;
  this.canvas = canvas;
};

TabCanvas.prototype = Utils.extend(new Subscribable(), {
  // ----------
  // Function: toString
  // Prints [TabCanvas (tab)] for debug use
  toString: function TabCanvas_toString() {
    return "[TabCanvas (" + this.tab + ")]";
  },

  // ----------
  // Function: paint
  paint: function TabCanvas_paint(evt) {
    var w = this.canvas.width;
    var h = this.canvas.height;
    if (!w || !h)
      return;

    if (!this.tab.linkedBrowser.contentWindow) {
      Utils.log('no tab.linkedBrowser.contentWindow in TabCanvas.paint()');
      return;
    }

    let ctx = this.canvas.getContext("2d");
    let tempCanvas = TabItems.tempCanvas;
    let bgColor = '#fff';

    if (w < tempCanvas.width) {
      // Small draw case where nearest-neighbor algorithm breaks down in Windows
      // First draw to a larger canvas (150px wide), and then draw that image
      // to the destination canvas.
      let tempCtx = tempCanvas.getContext("2d");
      this._drawWindow(tempCtx, tempCanvas.width, tempCanvas.height, bgColor);

      // Now copy to tabitem canvas.
      try {
        this._fillCanvasBackground(ctx, w, h, bgColor);
        ctx.drawImage(tempCanvas, 0, 0, w, h);
      } catch (e) {
        Utils.error('paint', e);
      }
    } else {
      // General case where nearest neighbor algorithm looks good
      // Draw directly to the destination canvas
      this._drawWindow(ctx, w, h, bgColor);
    }

    this._sendToSubscribers("painted");
  },

  // ----------
  // Function: _fillCanvasBackground
  // Draws a rectangle of <width>x<height> with color <bgColor> to the given
  // canvas context.
  _fillCanvasBackground: function TabCanvas__fillCanvasBackground(ctx, width, height, bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  },

  // ----------
  // Function: _drawWindow
  // Draws contents of the tabs' browser window to the given canvas context.
  _drawWindow: function TabCanvas__drawWindow(ctx, width, height, bgColor) {
    this._fillCanvasBackground(ctx, width, height, bgColor);

    let rect = this._calculateClippingRect(width, height);
    let scaler = width / rect.width;

    ctx.save();
    ctx.scale(scaler, scaler);

    try {
      let win = this.tab.linkedBrowser.contentWindow;
      ctx.drawWindow(win, rect.left, rect.top, rect.width, rect.height,
                     bgColor, ctx.DRAWWINDOW_DO_NOT_FLUSH);
    } catch (e) {
      Utils.error('paint', e);
    }

    ctx.restore();
  },

  // ----------
  // Function: _calculateClippingRect
  // Calculate the clipping rect that will be projected to the tab's
  // thumbnail canvas.
  _calculateClippingRect: function TabCanvas__calculateClippingRect(origWidth, origHeight) {
    let win = this.tab.linkedBrowser.contentWindow;

    // TODO BUG 631593: retrieve actual scrollbar width
    // 25px is supposed to be width of the vertical scrollbar
    let maxWidth = Math.max(1, win.innerWidth - 25);
    let maxHeight = win.innerHeight;

    let height = Math.min(maxHeight, Math.floor(origHeight * maxWidth / origWidth));
    let width = Math.floor(origWidth * height / origHeight);

    // very short pages in combination with a very wide browser window force us
    // to extend the clipping rect and add some empty space around the thumb
    let factor = 0.7;
    if (width < maxWidth * factor) {
      width = maxWidth * factor;
      height = Math.floor(origHeight * width / origWidth);
    }

    let left = win.scrollX + Math.max(0, Math.round((maxWidth - width) / 2));
    let top = win.scrollY;

    return new Rect(left, top, width, height);
  },

  // ----------
  // Function: toImageData
  toImageData: function TabCanvas_toImageData() {
    return this.canvas.toDataURL("image/png");
  }
});
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is drag.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: drag.js

// ----------
// Variable: drag
// The Drag that's currently in process.
var drag = {
  info: null,
  zIndex: 100,
  lastMoveTime: 0
};

//----------
//Variable: resize
//The resize (actually a Drag) that is currently in process
var resize = {
  info: null,
  lastMoveTime: 0
};

// ##########
// Class: Drag (formerly DragInfo)
// Helper class for dragging <Item>s
//
// ----------
// Constructor: Drag
// Called to create a Drag in response to an <Item> draggable "start" event.
// Note that it is also used partially during <Item>'s resizable method as well.
//
// Parameters:
//   item - The <Item> being dragged
//   event - The DOM event that kicks off the drag
function Drag(item, event) {
  Utils.assert(item && (item.isAnItem || item.isAFauxItem), 
      'must be an item, or at least a faux item');

  this.item = item;
  this.el = item.container;
  this.$el = iQ(this.el);
  this.parent = this.item.parent;
  this.startPosition = new Point(event.clientX, event.clientY);
  this.startTime = Date.now();

  this.item.isDragging = true;
  this.item.setZ(999999);

  this.safeWindowBounds = Items.getSafeWindowBounds();

  Trenches.activateOthersTrenches(this.el);
};

Drag.prototype = {
  // ----------
  // Function: toString
  // Prints [Drag (item)] for debug use
  toString: function Drag_toString() {
    return "[Drag (" + this.item + ")]";
  },

  // ----------
  // Function: snapBounds
  // Adjusts the given bounds according to the currently active trenches. Used by <Drag.snap>
  //
  // Parameters:
  //   bounds             - (<Rect>) bounds
  //   stationaryCorner   - which corner is stationary? by default, the top left in LTR mode,
  //                        and top right in RTL mode.
  //                        "topleft", "bottomleft", "topright", "bottomright"
  //   assumeConstantSize - (boolean) whether the bounds' dimensions are sacred or not.
  //   keepProportional   - (boolean) if assumeConstantSize is false, whether we should resize
  //                        proportionally or not
  //   checkItemStatus    - (boolean) make sure this is a valid item which should be snapped
  snapBounds: function Drag_snapBounds(bounds, stationaryCorner, assumeConstantSize, keepProportional, checkItemStatus) {
    if (!stationaryCorner)
      stationaryCorner = UI.rtl ? 'topright' : 'topleft';
    var update = false; // need to update
    var updateX = false;
    var updateY = false;
    var newRect;
    var snappedTrenches = {};

    // OH SNAP!

    // if we aren't holding down the meta key or have trenches disabled...
    if (!Keys.meta && !Trenches.disabled) {
      // snappable = true if we aren't a tab on top of something else, and
      // there's no active drop site...
      let snappable = !(this.item.isATabItem &&
                       this.item.overlapsWithOtherItems()) &&
                       !iQ(".acceptsDrop").length;
      if (!checkItemStatus || snappable) {
        newRect = Trenches.snap(bounds, stationaryCorner, assumeConstantSize,
                                keepProportional);
        if (newRect) { // might be false if no changes were made
          update = true;
          snappedTrenches = newRect.snappedTrenches || {};
          bounds = newRect;
        }
      }
    }

    // make sure the bounds are in the window.
    newRect = this.snapToEdge(bounds, stationaryCorner, assumeConstantSize,
                              keepProportional);
    if (newRect) {
      update = true;
      bounds = newRect;
      Utils.extend(snappedTrenches, newRect.snappedTrenches);
    }

    Trenches.hideGuides();
    for (var edge in snappedTrenches) {
      var trench = snappedTrenches[edge];
      if (typeof trench == 'object') {
        trench.showGuide = true;
        trench.show();
      }
    }

    return update ? bounds : false;
  },

  // ----------
  // Function: snap
  // Called when a drag or mousemove occurs. Set the bounds based on the mouse move first, then
  // call snap and it will adjust the item's bounds if appropriate. Also triggers the display of
  // trenches that it snapped to.
  //
  // Parameters:
  //   stationaryCorner   - which corner is stationary? by default, the top left in LTR mode,
  //                        and top right in RTL mode.
  //                        "topleft", "bottomleft", "topright", "bottomright"
  //   assumeConstantSize - (boolean) whether the bounds' dimensions are sacred or not.
  //   keepProportional   - (boolean) if assumeConstantSize is false, whether we should resize
  //                        proportionally or not
  snap: function Drag_snap(stationaryCorner, assumeConstantSize, keepProportional) {
    var bounds = this.item.getBounds();
    bounds = this.snapBounds(bounds, stationaryCorner, assumeConstantSize, keepProportional, true);
    if (bounds) {
      this.item.setBounds(bounds, true);
      return true;
    }
    return false;
  },

  // --------
  // Function: snapToEdge
  // Returns a version of the bounds snapped to the edge if it is close enough. If not,
  // returns false. If <Keys.meta> is true, this function will simply enforce the
  // window edges.
  //
  // Parameters:
  //   rect - (<Rect>) current bounds of the object
  //   stationaryCorner   - which corner is stationary? by default, the top left in LTR mode,
  //                        and top right in RTL mode.
  //                        "topleft", "bottomleft", "topright", "bottomright"
  //   assumeConstantSize - (boolean) whether the rect's dimensions are sacred or not
  //   keepProportional   - (boolean) if we are allowed to change the rect's size, whether the
  //                                  dimensions should scaled proportionally or not.
  snapToEdge: function Drag_snapToEdge(rect, stationaryCorner, assumeConstantSize, keepProportional) {

    var swb = this.safeWindowBounds;
    var update = false;
    var updateX = false;
    var updateY = false;
    var snappedTrenches = {};

    var snapRadius = (Keys.meta ? 0 : Trenches.defaultRadius);
    if (rect.left < swb.left + snapRadius ) {
      if (stationaryCorner.indexOf('right') > -1 && !assumeConstantSize)
        rect.width = rect.right - swb.left;
      rect.left = swb.left;
      update = true;
      updateX = true;
      snappedTrenches.left = 'edge';
    }

    if (rect.right > swb.right - snapRadius) {
      if (updateX || !assumeConstantSize) {
        var newWidth = swb.right - rect.left;
        if (keepProportional)
          rect.height = rect.height * newWidth / rect.width;
        rect.width = newWidth;
        update = true;
      } else if (!updateX || !Trenches.preferLeft) {
        rect.left = swb.right - rect.width;
        update = true;
      }
      snappedTrenches.right = 'edge';
      delete snappedTrenches.left;
    }
    if (rect.top < swb.top + snapRadius) {
      if (stationaryCorner.indexOf('bottom') > -1 && !assumeConstantSize)
        rect.height = rect.bottom - swb.top;
      rect.top = swb.top;
      update = true;
      updateY = true;
      snappedTrenches.top = 'edge';
    }
    if (rect.bottom > swb.bottom - snapRadius) {
      if (updateY || !assumeConstantSize) {
        var newHeight = swb.bottom - rect.top;
        if (keepProportional)
          rect.width = rect.width * newHeight / rect.height;
        rect.height = newHeight;
        update = true;
      } else if (!updateY || !Trenches.preferTop) {
        rect.top = swb.bottom - rect.height;
        update = true;
      }
      snappedTrenches.top = 'edge';
      delete snappedTrenches.bottom;
    }

    if (update) {
      rect.snappedTrenches = snappedTrenches;
      return rect;
    }
    return false;
  },

  // ----------
  // Function: drag
  // Called in response to an <Item> draggable "drag" event.
  drag: function Drag_drag(event) {
    this.snap(UI.rtl ? 'topright' : 'topleft', true);

    if (this.parent && this.parent.expanded) {
      var distance = this.startPosition.distance(new Point(event.clientX, event.clientY));
      if (distance > 100) {
        this.parent.remove(this.item);
        this.parent.collapse();
      }
    }
  },

  // ----------
  // Function: stop
  // Called in response to an <Item> draggable "stop" event.
  //
  // Parameters:
  //  immediately - bool for doing the pushAway immediately, without animation
  stop: function Drag_stop(immediately) {
    Trenches.hideGuides();
    this.item.isDragging = false;

    if (this.parent && this.parent != this.item.parent)
      this.parent.closeIfEmpty();

    if (this.parent && this.parent.expanded)
      this.parent.arrange();

    if (this.item.parent)
      this.item.parent.arrange();

    if (this.item.isAGroupItem) {
      this.item.setZ(drag.zIndex);
      drag.zIndex++;

      this.item.pushAway(immediately);
    }

    Trenches.disactivate();
  }
};
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is trench.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 * Ian Gilman <ian@iangilman.com>
 * Aza Raskin <aza@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: trench.js

// ##########
// Class: Trench
//
// Class for drag-snapping regions; called "trenches" as they are long and narrow.

// Constructor: Trench
//
// Parameters:
//   element - the DOM element for Item (GroupItem or TabItem) from which the trench is projected
//   xory - either "x" or "y": whether the trench's <position> is along the x- or y-axis.
//     In other words, if "x", the trench is vertical; if "y", the trench is horizontal.
//   type - either "border" or "guide". Border trenches mark the border of an Item.
//     Guide trenches extend out (unless they are intercepted) and act as "guides".
//   edge - which edge of the Item that this trench corresponds to.
//     Either "top", "left", "bottom", or "right".
function Trench(element, xory, type, edge) {
  //----------
  // Variable: id
  // (integer) The id for the Trench. Set sequentially via <Trenches.nextId>
  this.id = Trenches.nextId++;

  // ---------
  // Variables: Initial parameters
  //   element - (DOMElement)
  //   parentItem - <Item> which projects this trench; to be set with setParentItem
  //   xory - (string) "x" or "y"
  //   type - (string) "border" or "guide"
  //   edge - (string) "top", "left", "bottom", or "right"
  this.el = element;
  this.parentItem = null;
  this.xory = xory; // either "x" or "y"
  this.type = type; // "border" or "guide"
  this.edge = edge; // "top", "left", "bottom", or "right"

  this.$el = iQ(this.el);

  //----------
  // Variable: dom
  // (array) DOM elements for visible reflexes of the Trench
  this.dom = [];

  //----------
  // Variable: showGuide
  // (boolean) Whether this trench will project a visible guide (dotted line) or not.
  this.showGuide = false;

  //----------
  // Variable: active
  // (boolean) Whether this trench is currently active or not.
  // Basically every trench aside for those projected by the Item currently being dragged
  // all become active.
  this.active = false;
  this.gutter = Items.defaultGutter;

  //----------
  // Variable: position
  // (integer) position is the position that we should snap to.
  this.position = 0;

  //----------
  // Variables: some Ranges
  //   range - (<Range>) explicit range; this is along the transverse axis
  //   minRange - (<Range>) the minimum active range
  //   activeRange - (<Range>) the currently active range
  this.range = new Range(0,10000);
  this.minRange = new Range(0,0);
  this.activeRange = new Range(0,10000);
};

Trench.prototype = {
  // ----------
  // Function: toString
  // Prints [Trench edge type (parentItem)] for debug use
  toString: function Trench_toString() {
    return "[Trench " + this.edge + " " + this.type +
           (this.parentItem ? " (" + this.parentItem + ")" : "") +
           "]";
  },

  //----------
  // Variable: radius
  // (integer) radius is how far away we should snap from
  get radius() this.customRadius || Trenches.defaultRadius,

  setParentItem: function Trench_setParentItem(item) {
    if (!item.isAnItem) {
      Utils.assert(false, "parentItem must be an Item");
      return false;
    }
    this.parentItem = item;
    return true;
  },

  //----------
  // Function: setPosition
  // set the trench's position.
  //
  // Parameters:
  //   position - (integer) px center position of the trench
  //   range - (<Range>) the explicit active range of the trench
  //   minRange - (<Range>) the minimum range of the trench
  setPosition: function Trench_setPosition(position, range, minRange) {
    this.position = position;

    var page = Items.getPageBounds(true);

    // optionally, set the range.
    if (Utils.isRange(range)) {
      this.range = range;
    } else {
      this.range = new Range(0, (this.xory == 'x' ? page.height : page.width));
    }

    // if there's a minRange, set that too.
    if (Utils.isRange(minRange))
      this.minRange = minRange;

    // set the appropriate bounds as a rect.
    if (this.xory == "x") // vertical
      this.rect = new Rect(this.position - this.radius, this.range.min, 2 * this.radius, this.range.extent);
    else // horizontal
      this.rect = new Rect(this.range.min, this.position - this.radius, this.range.extent, 2 * this.radius);

    this.show(); // DEBUG
  },

  //----------
  // Function: setActiveRange
  // set the trench's currently active range.
  //
  // Parameters:
  //   activeRange - (<Range>)
  setActiveRange: function Trench_setActiveRange(activeRange) {
    if (!Utils.isRange(activeRange))
      return false;
    this.activeRange = activeRange;
    if (this.xory == "x") { // horizontal
      this.activeRect = new Rect(this.position - this.radius, this.activeRange.min, 2 * this.radius, this.activeRange.extent);
      this.guideRect = new Rect(this.position, this.activeRange.min, 0, this.activeRange.extent);
    } else { // vertical
      this.activeRect = new Rect(this.activeRange.min, this.position - this.radius, this.activeRange.extent, 2 * this.radius);
      this.guideRect = new Rect(this.activeRange.min, this.position, this.activeRange.extent, 0);
    }
    return true;
  },

  //----------
  // Function: setWithRect
  // Set the trench's position using the given rect. We know which side of the rect we should match
  // because we've already recorded this information in <edge>.
  //
  // Parameters:
  //   rect - (<Rect>)
  setWithRect: function Trench_setWithRect(rect) {

    if (!Utils.isRect(rect))
      Utils.error('argument must be Rect');

    // First, calculate the range for this trench.
    // Border trenches are always only active for the length of this range.
    // Guide trenches, however, still use this value as its minRange.
    if (this.xory == "x")
      var range = new Range(rect.top - this.gutter, rect.bottom + this.gutter);
    else
      var range = new Range(rect.left - this.gutter, rect.right + this.gutter);

    if (this.type == "border") {
      // border trenches have a range, so set that too.
      if (this.edge == "left")
        this.setPosition(rect.left - this.gutter, range);
      else if (this.edge == "right")
        this.setPosition(rect.right + this.gutter, range);
      else if (this.edge == "top")
        this.setPosition(rect.top - this.gutter, range);
      else if (this.edge == "bottom")
        this.setPosition(rect.bottom + this.gutter, range);
    } else if (this.type == "guide") {
      // guide trenches have no range, but do have a minRange.
      if (this.edge == "left")
        this.setPosition(rect.left, false, range);
      else if (this.edge == "right")
        this.setPosition(rect.right, false, range);
      else if (this.edge == "top")
        this.setPosition(rect.top, false, range);
      else if (this.edge == "bottom")
        this.setPosition(rect.bottom, false, range);
    }
  },

  //----------
  // Function: show
  //
  // Show guide (dotted line), if <showGuide> is true.
  //
  // If <Trenches.showDebug> is true, we will draw the trench. Active portions are drawn with 0.5
  // opacity. If <active> is false, the entire trench will be
  // very translucent.
  show: function Trench_show() { // DEBUG
    if (this.active && this.showGuide) {
      if (!this.dom.guideTrench)
        this.dom.guideTrench = iQ("<div/>").addClass('guideTrench').css({id: 'guideTrench'+this.id});
      var guideTrench = this.dom.guideTrench;
      guideTrench.css(this.guideRect);
      iQ("body").append(guideTrench);
    } else {
      if (this.dom.guideTrench) {
        this.dom.guideTrench.remove();
        delete this.dom.guideTrench;
      }
    }

    if (!Trenches.showDebug) {
      this.hide(true); // true for dontHideGuides
      return;
    }

    if (!this.dom.visibleTrench)
      this.dom.visibleTrench = iQ("<div/>")
        .addClass('visibleTrench')
        .addClass(this.type) // border or guide
        .css({id: 'visibleTrench'+this.id});
    var visibleTrench = this.dom.visibleTrench;

    if (!this.dom.activeVisibleTrench)
      this.dom.activeVisibleTrench = iQ("<div/>")
        .addClass('activeVisibleTrench')
        .addClass(this.type) // border or guide
        .css({id: 'activeVisibleTrench'+this.id});
    var activeVisibleTrench = this.dom.activeVisibleTrench;

    if (this.active)
      activeVisibleTrench.addClass('activeTrench');
    else
      activeVisibleTrench.removeClass('activeTrench');

    visibleTrench.css(this.rect);
    activeVisibleTrench.css(this.activeRect || this.rect);
    iQ("body").append(visibleTrench);
    iQ("body").append(activeVisibleTrench);
  },

  //----------
  // Function: hide
  // Hide the trench.
  hide: function Trench_hide(dontHideGuides) {
    if (this.dom.visibleTrench)
      this.dom.visibleTrench.remove();
    if (this.dom.activeVisibleTrench)
      this.dom.activeVisibleTrench.remove();
    if (!dontHideGuides && this.dom.guideTrench)
      this.dom.guideTrench.remove();
  },

  //----------
  // Function: rectOverlaps
  // Given a <Rect>, compute whether it overlaps with this trench. If it does, return an
  // adjusted ("snapped") <Rect>; if it does not overlap, simply return false.
  //
  // Note that simply overlapping is not all that is required to be affected by this function.
  // Trenches can only affect certain edges of rectangles... for example, a "left"-edge guide
  // trench should only affect left edges of rectangles. We don't snap right edges to left-edged
  // guide trenches. For border trenches, the logic is a bit different, so left snaps to right and
  // top snaps to bottom.
  //
  // Parameters:
  //   rect - (<Rect>) the rectangle in question
  //   stationaryCorner   - which corner is stationary? by default, the top left.
  //                        "topleft", "bottomleft", "topright", "bottomright"
  //   assumeConstantSize - (boolean) whether the rect's dimensions are sacred or not
  //   keepProportional - (boolean) if we are allowed to change the rect's size, whether the
  //                                dimensions should scaled proportionally or not.
  //
  // Returns:
  //   false - if rect does not overlap with this trench
  //   newRect - (<Rect>) an adjusted version of rect, if it is affected by this trench
  rectOverlaps: function Trench_rectOverlaps(rect,stationaryCorner,assumeConstantSize,keepProportional) {
    var edgeToCheck;
    if (this.type == "border") {
      if (this.edge == "left")
        edgeToCheck = "right";
      else if (this.edge == "right")
        edgeToCheck = "left";
      else if (this.edge == "top")
        edgeToCheck = "bottom";
      else if (this.edge == "bottom")
        edgeToCheck = "top";
    } else { // if trench type is guide or barrier...
      edgeToCheck = this.edge;
    }

    rect.adjustedEdge = edgeToCheck;

    switch (edgeToCheck) {
      case "left":
        if (this.ruleOverlaps(rect.left, rect.yRange)) {
          if (stationaryCorner.indexOf('right') > -1)
            rect.width = rect.right - this.position;
          rect.left = this.position;
          return rect;
        }
        break;
      case "right":
        if (this.ruleOverlaps(rect.right, rect.yRange)) {
          if (assumeConstantSize) {
            rect.left = this.position - rect.width;
          } else {
            var newWidth = this.position - rect.left;
            if (keepProportional)
              rect.height = rect.height * newWidth / rect.width;
            rect.width = newWidth;
          }
          return rect;
        }
        break;
      case "top":
        if (this.ruleOverlaps(rect.top, rect.xRange)) {
          if (stationaryCorner.indexOf('bottom') > -1)
            rect.height = rect.bottom - this.position;
          rect.top = this.position;
          return rect;
        }
        break;
      case "bottom":
        if (this.ruleOverlaps(rect.bottom, rect.xRange)) {
          if (assumeConstantSize) {
            rect.top = this.position - rect.height;
          } else {
            var newHeight = this.position - rect.top;
            if (keepProportional)
              rect.width = rect.width * newHeight / rect.height;
            rect.height = newHeight;
          }
          return rect;
        }
    }

    return false;
  },

  //----------
  // Function: ruleOverlaps
  // Computes whether the given "rule" (a line segment, essentially), given by the position and
  // range arguments, overlaps with the current trench. Note that this function assumes that
  // the rule and the trench are in the same direction: both horizontal, or both vertical.
  //
  // Parameters:
  //   position - (integer) a position in px
  //   range - (<Range>) the rule's range
  ruleOverlaps: function Trench_ruleOverlaps(position, range) {
    return (this.position - this.radius < position &&
           position < this.position + this.radius &&
           this.activeRange.overlaps(range));
  },

  //----------
  // Function: adjustRangeIfIntercept
  // Computes whether the given boundary (given as a position and its active range), perpendicular
  // to the trench, intercepts the trench or not. If it does, it returns an adjusted <Range> for
  // the trench. If not, it returns false.
  //
  // Parameters:
  //   position - (integer) the position of the boundary
  //   range - (<Range>) the target's range, on the trench's transverse axis
  adjustRangeIfIntercept: function Trench_adjustRangeIfIntercept(position, range) {
    if (this.position - this.radius > range.min && this.position + this.radius < range.max) {
      var activeRange = new Range(this.activeRange);

      // there are three ways this can go:
      // 1. position < minRange.min
      // 2. position > minRange.max
      // 3. position >= minRange.min && position <= minRange.max

      if (position < this.minRange.min) {
        activeRange.min = Math.min(this.minRange.min,position);
      } else if (position > this.minRange.max) {
        activeRange.max = Math.max(this.minRange.max,position);
      } else {
        // this should be impossible because items can't overlap and we've already checked
        // that the range intercepts.
      }
      return activeRange;
    }
    return false;
  },

  //----------
  // Function: calculateActiveRange
  // Computes and sets the <activeRange> for the trench, based on the <GroupItems> around.
  // This makes it so trenches' active ranges don't extend through other groupItems.
  calculateActiveRange: function Trench_calculateActiveRange() {

    // set it to the default: just the range itself.
    this.setActiveRange(this.range);

    // only guide-type trenches need to set a separate active range
    if (this.type != 'guide')
      return;

    var groupItems = GroupItems.groupItems;
    var trench = this;
    groupItems.forEach(function(groupItem) {
      if (groupItem.isDragging) // floating groupItems don't block trenches
        return;
      if (trench.el == groupItem.container) // groupItems don't block their own trenches
        return;
      var bounds = groupItem.getBounds();
      var activeRange = new Range();
      if (trench.xory == 'y') { // if this trench is horizontal...
        activeRange = trench.adjustRangeIfIntercept(bounds.left, bounds.yRange);
        if (activeRange)
          trench.setActiveRange(activeRange);
        activeRange = trench.adjustRangeIfIntercept(bounds.right, bounds.yRange);
        if (activeRange)
          trench.setActiveRange(activeRange);
      } else { // if this trench is vertical...
        activeRange = trench.adjustRangeIfIntercept(bounds.top, bounds.xRange);
        if (activeRange)
          trench.setActiveRange(activeRange);
        activeRange = trench.adjustRangeIfIntercept(bounds.bottom, bounds.xRange);
        if (activeRange)
          trench.setActiveRange(activeRange);
      }
    });
  }
};

// ##########
// Class: Trenches
// Singelton for managing all <Trench>es.
var Trenches = {
  // ---------
  // Variables:
  //   nextId - (integer) a counter for the next <Trench>'s <Trench.id> value.
  //   showDebug - (boolean) whether to draw the <Trench>es or not.
  //   defaultRadius - (integer) the default radius for new <Trench>es.
  //   disabled - (boolean) whether trench-snapping is disabled or not.
  nextId: 0,
  showDebug: false,
  defaultRadius: 10,
  disabled: false,

  // ---------
  // Variables: snapping preferences; used to break ties in snapping.
  //   preferTop - (boolean) prefer snapping to the top to the bottom
  //   preferLeft - (boolean) prefer snapping to the left to the right
  preferTop: true,
  get preferLeft() { return !UI.rtl; },

  trenches: [],

  // ----------
  // Function: toString
  // Prints [Trenches count=count] for debug use
  toString: function Trenches_toString() {
    return "[Trenches count=" + this.trenches.length + "]";
  },

  // ---------
  // Function: getById
  // Return the specified <Trench>.
  //
  // Parameters:
  //   id - (integer)
  getById: function Trenches_getById(id) {
    return this.trenches[id];
  },

  // ---------
  // Function: register
  // Register a new <Trench> and returns the resulting <Trench> ID.
  //
  // Parameters:
  // See the constructor <Trench.Trench>'s parameters.
  //
  // Returns:
  //   id - (int) the new <Trench>'s ID.
  register: function Trenches_register(element, xory, type, edge) {
    var trench = new Trench(element, xory, type, edge);
    this.trenches[trench.id] = trench;
    return trench.id;
  },

  // ---------
  // Function: registerWithItem
  // Register a whole set of <Trench>es using an <Item> and returns the resulting <Trench> IDs.
  //
  // Parameters:
  //   item - the <Item> to project trenches
  //   type - either "border" or "guide"
  //
  // Returns:
  //   ids - array of the new <Trench>es' IDs.
  registerWithItem: function Trenches_registerWithItem(item, type) {
    var container = item.container;
    var ids = {};
    ids.left = Trenches.register(container,"x",type,"left");
    ids.right = Trenches.register(container,"x",type,"right");
    ids.top = Trenches.register(container,"y",type,"top");
    ids.bottom = Trenches.register(container,"y",type,"bottom");

    this.getById(ids.left).setParentItem(item);
    this.getById(ids.right).setParentItem(item);
    this.getById(ids.top).setParentItem(item);
    this.getById(ids.bottom).setParentItem(item);

    return ids;
  },

  // ---------
  // Function: unregister
  // Unregister one or more <Trench>es.
  //
  // Parameters:
  //   ids - (integer) a single <Trench> ID or (array) a list of <Trench> IDs.
  unregister: function Trenches_unregister(ids) {
    if (!Array.isArray(ids))
      ids = [ids];
    var self = this;
    ids.forEach(function(id) {
      self.trenches[id].hide();
      delete self.trenches[id];
    });
  },

  // ---------
  // Function: activateOthersTrenches
  // Activate all <Trench>es other than those projected by the current element.
  //
  // Parameters:
  //   element - (DOMElement) the DOM element of the Item being dragged or resized.
  activateOthersTrenches: function Trenches_activateOthersTrenches(element) {
    this.trenches.forEach(function(t) {
      if (t.el === element)
        return;
      if (t.parentItem && (t.parentItem.isAFauxItem || t.parentItem.isDragging))
        return;
      t.active = true;
      t.calculateActiveRange();
      t.show(); // debug
    });
  },

  // ---------
  // Function: disactivate
  // After <activateOthersTrenches>, disactivates all the <Trench>es again.
  disactivate: function Trenches_disactivate() {
    this.trenches.forEach(function(t) {
      t.active = false;
      t.showGuide = false;
      t.show();
    });
  },

  // ---------
  // Function: hideGuides
  // Hide all guides (dotted lines) en masse.
  hideGuides: function Trenches_hideGuides() {
    this.trenches.forEach(function(t) {
      t.showGuide = false;
      t.show();
    });
  },

  // ---------
  // Function: snap
  // Used to "snap" an object's bounds to active trenches and to the edge of the window.
  // If the meta key is down (<Key.meta>), it will not snap but will still enforce the rect
  // not leaving the safe bounds of the window.
  //
  // Parameters:
  //   rect               - (<Rect>) the object's current bounds
  //   stationaryCorner   - which corner is stationary? by default, the top left.
  //                        "topleft", "bottomleft", "topright", "bottomright"
  //   assumeConstantSize - (boolean) whether the rect's dimensions are sacred or not
  //   keepProportional   - (boolean) if we are allowed to change the rect's size, whether the
  //                                  dimensions should scaled proportionally or not.
  //
  // Returns:
  //   (<Rect>) - the updated bounds, if they were updated
  //   false - if the bounds were not updated
  snap: function Trenches_snap(rect,stationaryCorner,assumeConstantSize,keepProportional) {
    // hide all the guide trenches, because the correct ones will be turned on later.
    Trenches.hideGuides();

    var updated = false;
    var updatedX = false;
    var updatedY = false;

    var snappedTrenches = {};

    for (var i in this.trenches) {
      var t = this.trenches[i];
      if (!t.active)
        continue;
      // newRect will be a new rect, or false
      var newRect = t.rectOverlaps(rect,stationaryCorner,assumeConstantSize,keepProportional);

      if (newRect) { // if rectOverlaps returned an updated rect...

        if (assumeConstantSize && updatedX && updatedY)
          break;
        if (assumeConstantSize && updatedX && (newRect.adjustedEdge == "left"||newRect.adjustedEdge == "right"))
          continue;
        if (assumeConstantSize && updatedY && (newRect.adjustedEdge == "top"||newRect.adjustedEdge == "bottom"))
          continue;

        rect = newRect;
        updated = true;

        // register this trench as the "snapped trench" for the appropriate edge.
        snappedTrenches[newRect.adjustedEdge] = t;

        // if updatedX, we don't need to update x any more.
        if (newRect.adjustedEdge == "left" && this.preferLeft)
          updatedX = true;
        if (newRect.adjustedEdge == "right" && !this.preferLeft)
          updatedX = true;

        // if updatedY, we don't need to update x any more.
        if (newRect.adjustedEdge == "top" && this.preferTop)
          updatedY = true;
        if (newRect.adjustedEdge == "bottom" && !this.preferTop)
          updatedY = true;

      }
    }

    if (updated) {
      rect.snappedTrenches = snappedTrenches;
      return rect;
    }
    return false;
  },

  // ---------
  // Function: show
  // <Trench.show> all <Trench>es.
  show: function Trenches_show() {
    this.trenches.forEach(function(t) {
      t.show();
    });
  },

  // ---------
  // Function: toggleShown
  // Toggle <Trenches.showDebug> and trigger <Trenches.show>
  toggleShown: function Trenches_toggleShown() {
    this.showDebug = !this.showDebug;
    this.show();
  }
};
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is thumbnailStorage.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Raymond Lee <raymond@appcoast.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: thumbnailStorage.js

// ##########
// Class: ThumbnailStorage
// Singleton for persistent storage of thumbnail data.
let ThumbnailStorage = {
  CACHE_CLIENT_IDENTIFIER: "tabview-cache",
  CACHE_PREFIX: "moz-panorama:",

  // Holds the cache session reference
  _cacheSession: null,

  // Holds the string input stream reference
  _stringInputStream: null,

  // Holds the storage stream reference
  _storageStream: null,

  // ----------
  // Function: toString
  // Prints [ThumbnailStorage] for debug use.
  toString: function ThumbnailStorage_toString() {
    return "[ThumbnailStorage]";
  },

  // ----------
  // Function: init
  // Should be called when UI is initialized.
  init: function ThumbnailStorage_init() {
    // Create stream-based cache session for tabview
    let cacheService = 
      Cc["@mozilla.org/network/cache-service;1"].
        getService(Ci.nsICacheService);
    this._cacheSession = cacheService.createSession(
      this.CACHE_CLIENT_IDENTIFIER, Ci.nsICache.STORE_ON_DISK, true);
    this._stringInputStream = Components.Constructor(
      "@mozilla.org/io/string-input-stream;1", "nsIStringInputStream",
      "setData");
    this._storageStream = Components.Constructor(
      "@mozilla.org/storagestream;1", "nsIStorageStream", 
      "init");
  },

  // ----------
  // Function: _openCacheEntry
  // Opens a cache entry for the given <url> and requests access <access>.
  // Calls <successCallback>(entry) when the entry was successfully opened with
  // requested access rights. Otherwise calls <errorCallback>().
  //
  // Parameters:
  //   url - the url to use as the storage key
  //   access - access flags, see Ci.nsICache.ACCESS_*
  //   successCallback - the callback to be called on success
  //   errorCallback - the callback to be called when an error occured
  //   options - an object with additional parameters, see below
  //
  // Possible options:
  //   synchronously - set to true to force sync mode
  _openCacheEntry:
    function ThumbnailStorage__openCacheEntry(url, access, successCallback,
                                              errorCallback, options) {
    Utils.assert(url, "invalid or missing argument <url>");
    Utils.assert(access, "invalid or missing argument <access>");
    Utils.assert(successCallback, "invalid or missing argument <successCallback>");
    Utils.assert(errorCallback, "invalid or missing argument <errorCallback>");

    function onCacheEntryAvailable(entry, accessGranted, status) {
      if (entry && access == accessGranted && Components.isSuccessCode(status)) {
        successCallback(entry);
      } else {
        if (entry)
          entry.close();

        errorCallback();
      }
    }

    let key = this.CACHE_PREFIX + url;

    if (options && options.synchronously) {
      let entry = this._cacheSession.openCacheEntry(key, access, true);
      let status = Cr.NS_OK;
      onCacheEntryAvailable(entry, entry.accessGranted, status);
    } else {
      let listener = new CacheListener(onCacheEntryAvailable);
      this._cacheSession.asyncOpenCacheEntry(key, access, listener);
    }
  },

  // ----------
  // Function: saveThumbnail
  // Saves the given thumbnail in the cache.
  //
  // Parameters:
  //   url - the url to use as the storage key
  //   imageData - the image data to save for the given key
  //   callback - the callback that is called when the operation is finished
  //   options - an object with additional parameters, see below
  //
  // Possible options:
  //   synchronously - set to true to force sync mode
  saveThumbnail:
    function ThumbnailStorage_saveThumbnail(url, imageData, callback, options) {
    Utils.assert(url, "invalid or missing argument <url>");
    Utils.assert(imageData, "invalid or missing argument <imageData>");
    Utils.assert(callback, "invalid or missing argument <callback>");

    let synchronously = (options && options.synchronously);
    let self = this;

    function onCacheEntryAvailable(entry) {
      let outputStream = entry.openOutputStream(0);

      function cleanup() {
        outputStream.close();
        entry.close();
      }

      // synchronous mode
      if (synchronously) {
        outputStream.write(imageData, imageData.length);
        cleanup();
        callback();
        return;
      }

      // asynchronous mode
      let inputStream = new self._stringInputStream(imageData, imageData.length);
      gNetUtil.asyncCopy(inputStream, outputStream, function (result) {
        cleanup();
        inputStream.close();
        callback(Components.isSuccessCode(result) ? "" : "failure");
      });
    }

    function onCacheEntryUnavailable() {
      callback("unavailable");
    }

    this._openCacheEntry(url, Ci.nsICache.ACCESS_WRITE, onCacheEntryAvailable,
                         onCacheEntryUnavailable, options);
  },

  // ----------
  // Function: loadThumbnail
  // Loads a thumbnail from the cache.
  //
  // Parameters:
  //   url - the url to use as the storage key
  //   callback - the callback that is called when the operation is finished
  loadThumbnail: function ThumbnailStorage_loadThumbnail(url, callback) {
    Utils.assert(url, "invalid or missing argument <url>");
    Utils.assert(callback, "invalid or missing argument <callback>");

    let self = this;

    function onCacheEntryAvailable(entry) {
      let imageChunks = [];
      let nativeInputStream = entry.openInputStream(0);

      const CHUNK_SIZE = 0x10000; // 65k
      const PR_UINT32_MAX = 0xFFFFFFFF;
      let storageStream = new self._storageStream(CHUNK_SIZE, PR_UINT32_MAX, null);
      let storageOutStream = storageStream.getOutputStream(0);

      let cleanup = function () {
        nativeInputStream.close();
        storageStream.close();
        storageOutStream.close();
        entry.close();
      }

      gNetUtil.asyncCopy(nativeInputStream, storageOutStream, function (result) {
        // cancel if parent window has already been closed
        if (typeof UI == "undefined") {
          cleanup();
          return;
        }

        let imageData = null;
        let isSuccess = Components.isSuccessCode(result);

        if (isSuccess) {
          let storageInStream = storageStream.newInputStream(0);
          imageData = gNetUtil.readInputStreamToString(storageInStream,
            storageInStream.available());
          storageInStream.close();
        }

        cleanup();
        callback(isSuccess ? "" : "failure", imageData);
      });
    }

    function onCacheEntryUnavailable() {
      callback("unavailable");
    }

    this._openCacheEntry(url, Ci.nsICache.ACCESS_READ, onCacheEntryAvailable,
                         onCacheEntryUnavailable);
  }
}

// ##########
// Class: CacheListener
// Generic CacheListener for feeding to asynchronous cache calls.
// Calls <callback>(entry, access, status) when the requested cache entry
// is available.
function CacheListener(callback) {
  Utils.assert(typeof callback == "function", "callback arg must be a function");
  this.callback = callback;
};

CacheListener.prototype = {
  // ----------
  // Function: toString
  // Prints [CacheListener] for debug use
  toString: function CacheListener_toString() {
    return "[CacheListener]";
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nsICacheListener]),
  onCacheEntryAvailable: function CacheListener_onCacheEntryAvailable(
    entry, access, status) {
    this.callback(entry, access, status);
  }
};

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is search.js.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Aza Raskin <aza@mozilla.com>
 * Raymond Lee <raymond@raysquare.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/* ******************************
 *
 * This file incorporates work from:
 * Quicksilver Score (qs_score):
 * http://rails-oceania.googlecode.com/svn/lachiecox/qs_score/trunk/qs_score.js
 * This incorporated work is covered by the following copyright and
 * permission notice:
 * Copyright 2008 Lachie Cox
 * Licensed under the MIT license.
 * http://jquery.org/license
 *
 *  ***************************** */

// **********
// Title: search.js
// Implementation for the search functionality of Firefox Panorama.

// ##########
// Class: TabUtils
//
// A collection of helper functions for dealing with both <TabItem>s and
// <xul:tab>s without having to worry which one is which.
let TabUtils = {
  // ----------
  // Function: toString
  // Prints [TabUtils] for debug use.
  toString: function TabUtils_toString() {
    return "[TabUtils]";
  },

  // ---------
  // Function: nameOfTab
  // Given a <TabItem> or a <xul:tab> returns the tab's name.
  nameOf: function TabUtils_nameOf(tab) {
    // We can have two types of tabs: A <TabItem> or a <xul:tab>
    // because we have to deal with both tabs represented inside
    // of active Panoramas as well as for windows in which
    // Panorama has yet to be activated. We uses object sniffing to
    // determine the type of tab and then returns its name.     
    return tab.label != undefined ? tab.label : tab.$tabTitle[0].textContent;
  },

  // ---------
  // Function: URLOf
  // Given a <TabItem> or a <xul:tab> returns the URL of tab.
  URLOf: function TabUtils_URLOf(tab) {
    // Convert a <TabItem> to <xul:tab>
    if ("tab" in tab)
      tab = tab.tab;
    return tab.linkedBrowser.currentURI.spec;
  },

  // ---------
  // Function: faviconURLOf
  // Given a <TabItem> or a <xul:tab> returns the URL of tab's favicon.
  faviconURLOf: function TabUtils_faviconURLOf(tab) {
    return tab.image != undefined ? tab.image : tab.$favImage[0].src;
  },

  // ---------
  // Function: focus
  // Given a <TabItem> or a <xul:tab>, focuses it and it's window.
  focus: function TabUtils_focus(tab) {
    // Convert a <TabItem> to a <xul:tab>
    if ("tab" in tab)
      tab = tab.tab;
    tab.ownerDocument.defaultView.gBrowser.selectedTab = tab;
    tab.ownerDocument.defaultView.focus();
  }
};

// ##########
// Class: TabMatcher
//
// A class that allows you to iterate over matching and not-matching tabs, 
// given a case-insensitive search term.
function TabMatcher(term) {
  this.term = term;
}

TabMatcher.prototype = {
  // ----------
  // Function: toString
  // Prints [TabMatcher (term)] for debug use.
  toString: function TabMatcher_toString() {
    return "[TabMatcher (" + this.term + ")]";
  },

  // ---------
  // Function: _filterAndSortForMatches
  // Given an array of <TabItem>s and <xul:tab>s returns a new array
  // of tabs whose name matched the search term, sorted by lexical
  // closeness.
  _filterAndSortForMatches: function TabMatcher__filterAndSortForMatches(tabs) {
    let self = this;
    tabs = tabs.filter(function TabMatcher__filterAndSortForMatches_filter(tab) {
      let name = TabUtils.nameOf(tab);
      let url = TabUtils.URLOf(tab);
      return name.match(self.term, "i") || url.match(self.term, "i");
    });

    tabs.sort(function TabMatcher__filterAndSortForMatches_sort(x, y) {
      let yScore = self._scorePatternMatch(self.term, TabUtils.nameOf(y));
      let xScore = self._scorePatternMatch(self.term, TabUtils.nameOf(x));
      return yScore - xScore;
    });

    return tabs;
  },

  // ---------
  // Function: _filterForUnmatches
  // Given an array of <TabItem>s returns an unsorted array of tabs whose name
  // does not match the the search term.
  _filterForUnmatches: function TabMatcher__filterForUnmatches(tabs) {
    let self = this;
    return tabs.filter(function TabMatcher__filterForUnmatches_filter(tab) {
      let name = tab.$tabTitle[0].textContent;
      let url = TabUtils.URLOf(tab);
      return !name.match(self.term, "i") && !url.match(self.term, "i");
    });
  },

  // ---------
  // Function: _getTabsForOtherWindows
  // Returns an array of <TabItem>s and <xul:tabs>s representing tabs
  // from all windows but the current window. <TabItem>s will be returned
  // for windows in which Panorama has been activated at least once, while
  // <xul:tab>s will be returned for windows in which Panorama has never
  // been activated.
  _getTabsForOtherWindows: function TabMatcher__getTabsForOtherWindows() {
    let enumerator = Services.wm.getEnumerator("navigator:browser");
    let allTabs = [];

    while (enumerator.hasMoreElements()) {
      let win = enumerator.getNext();
      // This function gets tabs from other windows, not from the current window
      if (win != gWindow)
        allTabs.push.apply(allTabs, win.gBrowser.tabs);
    }
    return allTabs;
  },

  // ----------
  // Function: matchedTabsFromOtherWindows
  // Returns an array of <TabItem>s and <xul:tab>s that match the search term
  // from all windows but the current window. <TabItem>s will be returned for
  // windows in which Panorama has been activated at least once, while
  // <xul:tab>s will be returned for windows in which Panorama has never
  // been activated.
  // (new TabMatcher("app")).matchedTabsFromOtherWindows();
  matchedTabsFromOtherWindows: function TabMatcher_matchedTabsFromOtherWindows() {
    if (this.term.length < 2)
      return [];

    let tabs = this._getTabsForOtherWindows();
    return this._filterAndSortForMatches(tabs);
  },

  // ----------
  // Function: matched
  // Returns an array of <TabItem>s which match the current search term.
  // If the term is less than 2 characters in length, it returns nothing.
  matched: function TabMatcher_matched() {
    if (this.term.length < 2)
      return [];

    let tabs = TabItems.getItems();
    return this._filterAndSortForMatches(tabs);
  },

  // ----------
  // Function: unmatched
  // Returns all of <TabItem>s that .matched() doesn't return.
  unmatched: function TabMatcher_unmatched() {
    let tabs = TabItems.getItems();
    if (this.term.length < 2)
      return tabs;

    return this._filterForUnmatches(tabs);
  },

  // ----------
  // Function: doSearch
  // Performs the search. Lets you provide three functions.
  // The first is on all matched tabs in the window, the second on all unmatched
  // tabs in the window, and the third on all matched tabs in other windows.
  // The first two functions take two parameters: A <TabItem> and its integer index
  // indicating the absolute rank of the <TabItem> in terms of match to
  // the search term. The last function also takes two paramaters, but can be
  // passed both <TabItem>s and <xul:tab>s and the index is offset by the
  // number of matched tabs inside the window.
  doSearch: function TabMatcher_doSearch(matchFunc, unmatchFunc, otherFunc) {
    let matches = this.matched();
    let unmatched = this.unmatched();
    let otherMatches = this.matchedTabsFromOtherWindows();
    
    matches.forEach(function(tab, i) {
      matchFunc(tab, i);
    });

    otherMatches.forEach(function(tab,i) {
      otherFunc(tab, i+matches.length);
    });

    unmatched.forEach(function(tab, i) {
      unmatchFunc(tab, i);
    });
  },

  // ----------
  // Function: _scorePatternMatch
  // Given a pattern string, returns a score between 0 and 1 of how well
  // that pattern matches the original string. It mimics the heuristics
  // of the Mac application launcher Quicksilver.
  _scorePatternMatch: function TabMatcher__scorePatternMatch(pattern, matched, offset) {
    offset = offset || 0;
    pattern = pattern.toLowerCase();
    matched = matched.toLowerCase();

    if (pattern.length == 0)
      return 0.9;
    if (pattern.length > matched.length)
      return 0.0;

    for (let i = pattern.length; i > 0; i--) {
      let sub_pattern = pattern.substring(0,i);
      let index = matched.indexOf(sub_pattern);

      if (index < 0)
        continue;
      if (index + pattern.length > matched.length + offset)
        continue;

      let next_string = matched.substring(index+sub_pattern.length);
      let next_pattern = null;

      if (i >= pattern.length)
        next_pattern = '';
      else
        next_pattern = pattern.substring(i);

      let remaining_score = this._scorePatternMatch(next_pattern, next_string, offset + index);

      if (remaining_score > 0) {
        let score = matched.length-next_string.length;

        if (index != 0) {
          let c = matched.charCodeAt(index-1);
          if (c == 32 || c == 9) {
            for (let j = (index - 2); j >= 0; j--) {
              c = matched.charCodeAt(j);
              score -= ((c == 32 || c == 9) ? 1 : 0.15);
            }
          } else {
            score -= index;
          }
        }

        score += remaining_score * next_string.length;
        score /= matched.length;
        return score;
      }
    }
    return 0.0;
  }
};

// ##########
// Class: TabHandlers
// 
// A object that handles all of the event handlers.
let TabHandlers = {
  _mouseDownLocation: null,

  // ---------
  // Function: onMatch
  // Adds styles and event listeners to the matched tab items.
  onMatch: function TabHandlers_onMatch(tab, index) {
    tab.addClass("onTop");
    index != 0 ? tab.addClass("notMainMatch") : tab.removeClass("notMainMatch");

    // Remove any existing handlers before adding the new ones.
    // If we don't do this, then we may add more handlers than
    // we remove.
    tab.$canvas
      .unbind("mousedown", TabHandlers._hideHandler)
      .unbind("mouseup", TabHandlers._showHandler);

    tab.$canvas
      .mousedown(TabHandlers._hideHandler)
      .mouseup(TabHandlers._showHandler);
  },

  // ---------
  // Function: onUnmatch
  // Removes styles and event listeners from the unmatched tab items.
  onUnmatch: function TabHandlers_onUnmatch(tab, index) {
    tab.$container.removeClass("onTop");
    tab.removeClass("notMainMatch");

    tab.$canvas
      .unbind("mousedown", TabHandlers._hideHandler)
      .unbind("mouseup", TabHandlers._showHandler);
  },

  // ---------
  // Function: onOther
  // Removes styles and event listeners from the unmatched tabs.
  onOther: function TabHandlers_onOther(tab, index) {
    // Unlike the other on* functions, in this function tab can
    // either be a <TabItem> or a <xul:tab>. In other functions
    // it is always a <TabItem>. Also note that index is offset
    // by the number of matches within the window.
    let item = iQ("<div/>")
      .addClass("inlineMatch")
      .click(function TabHandlers_onOther_click(event) {
        Search.hide(event);
        TabUtils.focus(tab);
      });

    iQ("<img/>")
      .attr("src", TabUtils.faviconURLOf(tab))
      .appendTo(item);

    iQ("<span/>")
      .text(TabUtils.nameOf(tab))
      .appendTo(item);

    index != 0 ? item.addClass("notMainMatch") : item.removeClass("notMainMatch");
    item.appendTo("#results");
    iQ("#otherresults").show();
  },

  // ---------
  // Function: _hideHandler
  // Performs when mouse down on a canvas of tab item.
  _hideHandler: function TabHandlers_hideHandler(event) {
    iQ("#search").fadeOut();
    iQ("#searchshade").fadeOut();
    TabHandlers._mouseDownLocation = {x:event.clientX, y:event.clientY};
  },

  // ---------
  // Function: _showHandler
  // Performs when mouse up on a canvas of tab item.
  _showHandler: function TabHandlers_showHandler(event) {
    // If the user clicks on a tab without moving the mouse then
    // they are zooming into the tab and we need to exit search
    // mode.
    if (TabHandlers._mouseDownLocation.x == event.clientX &&
        TabHandlers._mouseDownLocation.y == event.clientY) {
      Search.hide();
      return;
    }

    iQ("#searchshade").show();
    iQ("#search").show();
    iQ("#searchbox")[0].focus();
    // Marshal the search.
    setTimeout(Search.perform, 0);
  }
};

// ##########
// Class: Search
// 
// A object that handles the search feature.
let Search = {
  _initiatedBy: "",
  _blockClick: false,
  _currentHandler: null,

  // ----------
  // Function: toString
  // Prints [Search] for debug use.
  toString: function Search_toString() {
    return "[Search]";
  },

  // ----------
  // Function: init
  // Initializes the searchbox to be focused, and everything else to be hidden,
  // and to have everything have the appropriate event handlers.
  init: function Search_init() {
    let self = this;

    iQ("#search").hide();
    iQ("#searchshade").hide().mousedown(function Search_init_shade_mousedown(event) {
      if (event.target.id != "searchbox" && !self._blockClick)
        self.hide();
    });

    iQ("#searchbox").keyup(function Search_init_box_keyup() {
      self.perform();
    });

    iQ("#searchbutton").mousedown(function Search_init_button_mousedown() {
      self._initiatedBy = "buttonclick";
      self.ensureShown();
      self.switchToInMode();
    });

    window.addEventListener("focus", function Search_init_window_focus() {
      if (self.isEnabled()) {
        self._blockClick = true;
        setTimeout(function() {
          self._blockClick = false;
        }, 0);
      }
    }, false);

    this.switchToBeforeMode();
  },

  // ----------
  // Function: _beforeSearchKeyHandler
  // Handles all keydown before the search interface is brought up.
  _beforeSearchKeyHandler: function Search__beforeSearchKeyHandler(event) {
    // Only match reasonable text-like characters for quick search.
    if (event.altKey || event.ctrlKey || event.metaKey)
      return;

    if ((event.keyCode > 0 && event.keyCode <= event.DOM_VK_DELETE) ||
        event.keyCode == event.DOM_VK_CONTEXT_MENU ||
        event.keyCode == event.DOM_VK_SLEEP ||
        (event.keyCode >= event.DOM_VK_F1 &&
         event.keyCode <= event.DOM_VK_SCROLL_LOCK) ||
        event.keyCode == event.DOM_VK_META ||
        event.keyCode == 91 || // 91 = left windows key
        event.keyCode == 92 || // 92 = right windows key
        (!event.keyCode && !event.charCode)) {
      return;
    }

    // If we are already in an input field, allow typing as normal.
    if (event.target.nodeName == "INPUT")
      return;

    // / is used to activate the search feature so the key shouldn't be entered 
    // into the search box.
    if (event.keyCode == KeyEvent.DOM_VK_SLASH) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.switchToInMode();
    this._initiatedBy = "keydown";
    this.ensureShown(true);
  },

  // ----------
  // Function: _inSearchKeyHandler
  // Handles all keydown while search mode.
  _inSearchKeyHandler: function Search__inSearchKeyHandler(event) {
    let term = iQ("#searchbox").val();
    if ((event.keyCode == event.DOM_VK_ESCAPE) ||
        (event.keyCode == event.DOM_VK_BACK_SPACE && term.length <= 1 &&
         this._initiatedBy == "keydown")) {
      this.hide(event);
      return;
    }

    let matcher = this.createSearchTabMatcher();
    let matches = matcher.matched();
    let others =  matcher.matchedTabsFromOtherWindows();
    if ((event.keyCode == event.DOM_VK_RETURN ||
         event.keyCode == event.DOM_VK_ENTER) &&
         (matches.length > 0 || others.length > 0)) {
      this.hide(event);
      if (matches.length > 0) 
        matches[0].zoomIn();
      else
        TabUtils.focus(others[0]);
    }
  },

  // ----------
  // Function: switchToBeforeMode
  // Make sure the event handlers are appropriate for the before-search mode.
  switchToBeforeMode: function Search_switchToBeforeMode() {
    let self = this;
    if (this._currentHandler)
      iQ(window).unbind("keydown", this._currentHandler);
    this._currentHandler = function Search_switchToBeforeMode_handler(event) {
      self._beforeSearchKeyHandler(event);
    }
    iQ(window).keydown(this._currentHandler);
  },

  // ----------
  // Function: switchToInMode
  // Make sure the event handlers are appropriate for the in-search mode.
  switchToInMode: function Search_switchToInMode() {
    let self = this;
    if (this._currentHandler)
      iQ(window).unbind("keydown", this._currentHandler);
    this._currentHandler = function Search_switchToInMode_handler(event) {
      self._inSearchKeyHandler(event);
    }
    iQ(window).keydown(this._currentHandler);
  },

  createSearchTabMatcher: function Search_createSearchTabMatcher() {
    return new TabMatcher(iQ("#searchbox").val());
  },

  // ----------
  // Function: isEnabled
  // Checks whether search mode is enabled or not.
  isEnabled: function Search_isEnabled() {
    return iQ("#search").css("display") != "none";
  },

  // ----------
  // Function: hide
  // Hides search mode.
  hide: function Search_hide(event) {
    if (!this.isEnabled())
      return;

    iQ("#searchbox").val("");
    iQ("#searchshade").hide();
    iQ("#search").hide();

    iQ("#searchbutton").css({ opacity:.8 });

//@line 569 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/search.js"

    this.perform();
    this.switchToBeforeMode();

    if (event) {
      // when hiding the search mode, we need to prevent the keypress handler
      // in UI__setTabViewFrameKeyHandlers to handle the key press again. e.g. Esc
      // which is already handled by the key down in this class.
      if (event.type == "keydown")
        UI.ignoreKeypressForSearch = true;
      event.preventDefault();
      event.stopPropagation();
    }

    // Return focus to the tab window
    UI.blurAll();
    gTabViewFrame.contentWindow.focus();

    let newEvent = document.createEvent("Events");
    newEvent.initEvent("tabviewsearchdisabled", false, false);
    dispatchEvent(newEvent);
  },

  // ----------
  // Function: perform
  // Performs a search.
  perform: function Search_perform() {
    let matcher =  this.createSearchTabMatcher();

    // Remove any previous other-window search results and
    // hide the display area.
    iQ("#results").empty();
    iQ("#otherresults").hide();
    iQ("#otherresults>.label").text(tabviewString("search.otherWindowTabs"));

    matcher.doSearch(TabHandlers.onMatch, TabHandlers.onUnmatch, TabHandlers.onOther);
  },

  // ----------
  // Function: ensureShown
  // Ensures the search feature is displayed.  If not, display it.
  // Parameters:
  //  - a boolean indicates whether this is triggered by a keypress or not
  ensureShown: function Search_ensureShown(activatedByKeypress) {
    let $search = iQ("#search");
    let $searchShade = iQ("#searchshade");
    let $searchbox = iQ("#searchbox");
    iQ("#searchbutton").css({ opacity: 1 });

    // NOTE: when this function is called by keydown handler, next keypress
    // event or composition events of IME will be fired on the focused editor.
    function dispatchTabViewSearchEnabledEvent() {
      let newEvent = document.createEvent("Events");
      newEvent.initEvent("tabviewsearchenabled", false, false);
      dispatchEvent(newEvent);
    };

    if (!this.isEnabled()) {
      $searchShade.show();
      $search.show();

//@line 633 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/search.js"

      if (activatedByKeypress) {
        // set the focus so key strokes are entered into the textbox.
        $searchbox[0].focus();
        dispatchTabViewSearchEnabledEvent();
      } else {
        // marshal the focusing, otherwise it ends up with searchbox[0].focus gets
        // called before the search button gets the focus after being pressed.
        setTimeout(function setFocusAndDispatchSearchEnabledEvent() {
          $searchbox[0].focus();
          dispatchTabViewSearchEnabledEvent();
        }, 0);
      }
    }
  }
};

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is ui.js.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Ian Gilman <ian@iangilman.com>
 * Aza Raskin <aza@mozilla.com>
 * Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 * Ehsan Akhgari <ehsan@mozilla.com>
 * Raymond Lee <raymond@appcoast.com>
 * Sean Dunn <seanedunn@yahoo.com>
 * Tim Taubert <tim.taubert@gmx.de>
 * Mihai Sucan <mihai.sucan@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// **********
// Title: ui.js

let Keys = { meta: false };

// ##########
// Class: UI
// Singleton top-level UI manager.
let UI = {
  // Constant: DBLCLICK_INTERVAL
  // Defines the maximum time (in ms) between two clicks for it to count as
  // a double click.
  DBLCLICK_INTERVAL: 500,

  // Constant: DBLCLICK_OFFSET
  // Defines the maximum offset (in pixels) between two clicks for it to count as
  // a double click.
  DBLCLICK_OFFSET: 5,

  // Variable: _frameInitialized
  // True if the Tab View UI frame has been initialized.
  _frameInitialized: false,

  // Variable: _pageBounds
  // Stores the page bounds.
  _pageBounds: null,

  // Variable: _closedLastVisibleTab
  // If true, the last visible tab has just been closed in the tab strip.
  _closedLastVisibleTab: false,

  // Variable: _closedSelectedTabInTabView
  // If true, a select tab has just been closed in TabView.
  _closedSelectedTabInTabView: false,

  // Variable: restoredClosedTab
  // If true, a closed tab has just been restored.
  restoredClosedTab: false,

  // Variable: _isChangingVisibility
  // Tracks whether we're currently in the process of showing/hiding the tabview.
  _isChangingVisibility: false,

  // Variable: _reorderTabItemsOnShow
  // Keeps track of the <GroupItem>s which their tab items' tabs have been moved
  // and re-orders the tab items when switching to TabView.
  _reorderTabItemsOnShow: [],

  // Variable: _reorderTabsOnHide
  // Keeps track of the <GroupItem>s which their tab items have been moved in
  // TabView UI and re-orders the tabs when switcing back to main browser.
  _reorderTabsOnHide: [],

  // Variable: _currentTab
  // Keeps track of which xul:tab we are currently on.
  // Used to facilitate zooming down from a previous tab.
  _currentTab: null,

  // Variable: _lastClick
  // Keeps track of the time of last click event to detect double click.
  // Used to create tabs on double-click since we cannot attach 'dblclick'
  _lastClick: 0,

  // Variable: _eventListeners
  // Keeps track of event listeners added to the AllTabs object.
  _eventListeners: {},

  // Variable: _cleanupFunctions
  // An array of functions to be called at uninit time
  _cleanupFunctions: [],
  
  // Constant: _maxInteractiveWait
  // If the UI is in the middle of an operation, this is the max amount of
  // milliseconds to wait between input events before we no longer consider
  // the operation interactive.
  _maxInteractiveWait: 250,

  // Variable: _privateBrowsing
  // Keeps track of info related to private browsing, including: 
  //   transitionMode - whether we're entering or exiting PB
  //   wasInTabView - whether TabView was visible before we went into PB
  _privateBrowsing: {
    transitionMode: "",
    wasInTabView: false 
  },
  
  // Variable: _storageBusy
  // Tells whether the storage is currently busy or not.
  _storageBusy: false,

  // Variable: isDOMWindowClosing
  // Tells wether the parent window is about to close
  isDOMWindowClosing: false,

  // Variable: _browserKeys
  // Used to keep track of allowed browser keys.
  _browserKeys: null,

  // Variable: _browserKeysWithShift
  // Used to keep track of allowed browser keys with Shift key combination.
  _browserKeysWithShift: null,

  // Variable: ignoreKeypressForSearch
  // Used to prevent keypress being handled after quitting search mode.
  ignoreKeypressForSearch: false,

  // Variable: _lastOpenedTab
  // Used to keep track of the last opened tab.
  _lastOpenedTab: null,

  // ----------
  // Function: toString
  // Prints [UI] for debug use
  toString: function UI_toString() {
    return "[UI]";
  },

  // ----------
  // Function: init
  // Must be called after the object is created.
  init: function UI_init() {
    try {
      let self = this;

      // initialize the direction of the page
      this._initPageDirection();

      // ___ thumbnail storage
      ThumbnailStorage.init();

      // ___ storage
      Storage.init();

      // ___ storage policy
      StoragePolicy.init();

      if (Storage.readWindowBusyState(gWindow))
        this.storageBusy();

      let data = Storage.readUIData(gWindow);
      this._storageSanity(data);
      this._pageBounds = data.pageBounds;

      // ___ search
      Search.init();

      // ___ currentTab
      this._currentTab = gBrowser.selectedTab;

      // ___ exit button
      iQ("#exit-button").click(function() {
        self.exit();
        self.blurAll();
      });

      // When you click on the background/empty part of TabView,
      // we create a new groupItem.
      iQ(gTabViewFrame.contentDocument).mousedown(function(e) {
        if (iQ(":focus").length > 0) {
          iQ(":focus").each(function(element) {
            // don't fire blur event if the same input element is clicked.
            if (e.target != element && element.nodeName == "INPUT")
              element.blur();
          });
        }
        if (e.originalTarget.id == "content") {
          if (!Utils.isLeftClick(e)) {
            self._lastClick = 0;
            self._lastClickPositions = null;
          } else {
            // Create a group with one tab on double click
            if (Date.now() - self._lastClick <= self.DBLCLICK_INTERVAL && 
                (self._lastClickPositions.x - self.DBLCLICK_OFFSET) <= e.clientX &&
                (self._lastClickPositions.x + self.DBLCLICK_OFFSET) >= e.clientX &&
                (self._lastClickPositions.y - self.DBLCLICK_OFFSET) <= e.clientY &&
                (self._lastClickPositions.y + self.DBLCLICK_OFFSET) >= e.clientY) {

              let box =
                new Rect(e.clientX - Math.floor(TabItems.tabWidth/2),
                         e.clientY - Math.floor(TabItems.tabHeight/2),
                         TabItems.tabWidth, TabItems.tabHeight);
              box.inset(-30, -30);

              let opts = {immediately: true, bounds: box};
              let groupItem = new GroupItem([], opts);
              groupItem.newTab();

              self._lastClick = 0;
              self._lastClickPositions = null;
              gTabView.firstUseExperienced = true;
            } else {
              self._lastClick = Date.now();
              self._lastClickPositions = new Point(e.clientX, e.clientY);
              self._createGroupItemOnDrag(e);
            }
          }
        }
      });

      iQ(window).bind("unload", function() {
        self.uninit();
      });

      // ___ setup DOMWillOpenModalDialog message handler
      let mm = gWindow.messageManager;
      let callback = this._onDOMWillOpenModalDialog.bind(this);
      mm.addMessageListener("Panorama:DOMWillOpenModalDialog", callback);

      this._cleanupFunctions.push(function () {
        mm.removeMessageListener("Panorama:DOMWillOpenModalDialog", callback);
      });

      // ___ setup key handlers
      this._setTabViewFrameKeyHandlers();

      // ___ add tab action handlers
      this._addTabActionHandlers();

      // ___ groups
      GroupItems.init();
      GroupItems.pauseArrange();
      let hasGroupItemsData = GroupItems.load();

      // ___ tabs
      TabItems.init();
      TabItems.pausePainting();

      if (!hasGroupItemsData)
        this.reset();

      // ___ resizing
      if (this._pageBounds)
        this._resize(true);
      else
        this._pageBounds = Items.getPageBounds();

      iQ(window).resize(function() {
        self._resize();
      });

      // ___ setup event listener to save canvas images
      gWindow.addEventListener("SSWindowClosing", function onWindowClosing() {
        gWindow.removeEventListener("SSWindowClosing", onWindowClosing, false);

        // XXX bug #635975 - don't unlink the tab if the dom window is closing.
        self.isDOMWindowClosing = true;

        if (self.isTabViewVisible())
          GroupItems.removeHiddenGroups();

        TabItems.saveAll();
        TabItems.saveAllThumbnails({synchronously: true});

        self._save();
      }, false);

      // ___ load frame script
      let frameScript = "chrome://browser/content/tabview-content.js";
      gWindow.messageManager.loadFrameScript(frameScript, true);

      // ___ Done
      this._frameInitialized = true;
      this._save();

      // fire an iframe initialized event so everyone knows tab view is 
      // initialized.
      let event = document.createEvent("Events");
      event.initEvent("tabviewframeinitialized", true, false);
      dispatchEvent(event);
    } catch(e) {
      Utils.log(e);
    } finally {
      GroupItems.resumeArrange();
    }
  },

  // Function: uninit
  // Should be called when window is unloaded.
  uninit: function UI_uninit() {
    // call our cleanup functions
    this._cleanupFunctions.forEach(function(func) {
      func();
    });
    this._cleanupFunctions = [];

    // additional clean up
    TabItems.uninit();
    GroupItems.uninit();
    Storage.uninit();
    StoragePolicy.uninit();

    this._removeTabActionHandlers();
    this._currentTab = null;
    this._pageBounds = null;
    this._reorderTabItemsOnShow = null;
    this._reorderTabsOnHide = null;
    this._frameInitialized = false;
  },

  // Property: rtl
  // Returns true if we are in RTL mode, false otherwise
  rtl: false,

  // Function: reset
  // Resets the Panorama view to have just one group with all tabs
  reset: function UI_reset() {
    let padding = Trenches.defaultRadius;
    let welcomeWidth = 300;
    let pageBounds = Items.getPageBounds();
    pageBounds.inset(padding, padding);

    let $actions = iQ("#actions");
    if ($actions) {
      pageBounds.width -= $actions.width();
      if (UI.rtl)
        pageBounds.left += $actions.width() - padding;
    }

    // ___ make a fresh groupItem
    let box = new Rect(pageBounds);
    box.width = Math.min(box.width * 0.667,
                         pageBounds.width - (welcomeWidth + padding));
    box.height = box.height * 0.667;
    if (UI.rtl) {
      box.left = pageBounds.left + welcomeWidth + 2 * padding;
    }

    GroupItems.groupItems.forEach(function(group) {
      group.close();
    });
    
    let options = {
      bounds: box,
      immediately: true
    };
    let groupItem = new GroupItem([], options);
    let items = TabItems.getItems();
    items.forEach(function(item) {
      if (item.parent)
        item.parent.remove(item);
      groupItem.add(item, {immediately: true});
    });
    this.setActive(groupItem);
  },

  // ----------
  // Function: blurAll
  // Blurs any currently focused element
  blurAll: function UI_blurAll() {
    iQ(":focus").each(function(element) {
      element.blur();
    });
  },

  // ----------
  // Function: isIdle
  // Returns true if the last interaction was long enough ago to consider the
  // UI idle. Used to determine whether interactivity would be sacrificed if 
  // the CPU was to become busy.
  //
  isIdle: function UI_isIdle() {
    let time = Date.now();
    let maxEvent = Math.max(drag.lastMoveTime, resize.lastMoveTime);
    return (time - maxEvent) > this._maxInteractiveWait;
  },

  // ----------
  // Function: getActiveTab
  // Returns the currently active tab as a <TabItem>
  getActiveTab: function UI_getActiveTab() {
    return this._activeTab;
  },

  // ----------
  // Function: _setActiveTab
  // Sets the currently active tab. The idea of a focused tab is useful
  // for keyboard navigation and returning to the last zoomed-in tab.
  // Hitting return/esc brings you to the focused tab, and using the
  // arrow keys lets you navigate between open tabs.
  //
  // Parameters:
  //  - Takes a <TabItem>
  _setActiveTab: function UI__setActiveTab(tabItem) {
    if (tabItem == this._activeTab)
      return;

    if (this._activeTab) {
      this._activeTab.makeDeactive();
      this._activeTab.removeSubscriber("close", this._onActiveTabClosed);
    }

    this._activeTab = tabItem;

    if (this._activeTab) {
      this._activeTab.addSubscriber("close", this._onActiveTabClosed);
      this._activeTab.makeActive();
    }
  },

  // ----------
  // Function: _onActiveTabClosed
  // Handles when the currently active tab gets closed.
  //
  // Parameters:
  //  - the <TabItem> that is closed
  _onActiveTabClosed: function UI__onActiveTabClosed(tabItem){
    if (UI._activeTab == tabItem)
      UI._setActiveTab(null);
  },

  // ----------
  // Function: setActive
  // Sets the active tab item or group item
  // Parameters:
  //
  // options
  //  dontSetActiveTabInGroup bool for not setting active tab in group
  setActive: function UI_setActive(item, options) {
    Utils.assert(item, "item must be given");

    if (item.isATabItem) {
      if (item.parent)
        GroupItems.setActiveGroupItem(item.parent);
      this._setActiveTab(item);
    } else {
      GroupItems.setActiveGroupItem(item);
      if (!options || !options.dontSetActiveTabInGroup) {
        let activeTab = item.getActiveTab()
        if (activeTab)
          this._setActiveTab(activeTab);
      }
    }
  },

  // ----------
  // Function: clearActiveTab
  // Sets the active tab to 'null'.
  clearActiveTab: function UI_clearActiveTab() {
    this._setActiveTab(null);
  },

  // ----------
  // Function: isTabViewVisible
  // Returns true if the TabView UI is currently shown.
  isTabViewVisible: function UI_isTabViewVisible() {
    return gTabViewDeck.selectedPanel == gTabViewFrame;
  },

  // ---------
  // Function: _initPageDirection
  // Initializes the page base direction
  _initPageDirection: function UI__initPageDirection() {
    let chromeReg = Cc["@mozilla.org/chrome/chrome-registry;1"].
                    getService(Ci.nsIXULChromeRegistry);
    let dir = chromeReg.isLocaleRTL("global");
    document.documentElement.setAttribute("dir", dir ? "rtl" : "ltr");
    this.rtl = dir;
  },

  // ----------
  // Function: showTabView
  // Shows TabView and hides the main browser UI.
  // Parameters:
  //   zoomOut - true for zoom out animation, false for nothing.
  showTabView: function UI_showTabView(zoomOut) {
    if (this.isTabViewVisible() || this._isChangingVisibility)
      return;

    this._isChangingVisibility = true;

    // initialize the direction of the page
    this._initPageDirection();

    var self = this;
    var currentTab = this._currentTab;

    this._reorderTabItemsOnShow.forEach(function(groupItem) {
      groupItem.reorderTabItemsBasedOnTabOrder();
    });
    this._reorderTabItemsOnShow = [];

//@line 530 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
    gTabViewDeck.selectedPanel = gTabViewFrame;
    gWindow.TabsInTitlebar.allowedBy("tabview-open", false);
    gTabViewFrame.contentWindow.focus();

    gBrowser.updateTitlebar();
//@line 538 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
    let event = document.createEvent("Events");
    event.initEvent("tabviewshown", true, false);

    Storage.saveVisibilityData(gWindow, "true");

    if (zoomOut && currentTab && currentTab._tabViewTabItem) {
      let item = currentTab._tabViewTabItem;
      // If there was a previous currentTab we want to animate
      // its thumbnail (canvas) for the zoom out.
      // Note that we start the animation on the chrome thread.

      // Zoom out!
      item.zoomOut(function() {
        if (!currentTab._tabViewTabItem) // if the tab's been destroyed
          item = null;

        self.setActive(item);

        self._resize(true);
        self._isChangingVisibility = false;
        dispatchEvent(event);

        // Flush pending updates
        GroupItems.flushAppTabUpdates();

        TabItems.resumePainting();
      });
    } else {
      self.clearActiveTab();
      self._isChangingVisibility = false;
      dispatchEvent(event);

      // Flush pending updates
      GroupItems.flushAppTabUpdates();

      TabItems.resumePainting();
    }

    if (gTabView.firstUseExperienced)
      gTabView.enableSessionRestore();
  },

  // ----------
  // Function: hideTabView
  // Hides TabView and shows the main browser UI.
  hideTabView: function UI_hideTabView() {
    if (!this.isTabViewVisible() || this._isChangingVisibility)
      return;

    this._isChangingVisibility = true;

    // another tab might be select if user decides to stay on a page when
    // a onclose confirmation prompts.
    GroupItems.removeHiddenGroups();
    TabItems.pausePainting();

    this._reorderTabsOnHide.forEach(function(groupItem) {
      groupItem.reorderTabsBasedOnTabItemOrder();
    });
    this._reorderTabsOnHide = [];

//@line 605 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
    gTabViewDeck.selectedPanel = gBrowserPanel;
    gWindow.TabsInTitlebar.allowedBy("tabview-open", true);
    gBrowser.selectedBrowser.focus();

    gBrowser.updateTitlebar();
//@line 613 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
    Storage.saveVisibilityData(gWindow, "false");

    this._isChangingVisibility = false;

    let event = document.createEvent("Events");
    event.initEvent("tabviewhidden", true, false);
    dispatchEvent(event);
  },

//@line 647 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"

  // ----------
  // Function: storageBusy
  // Pauses the storage activity that conflicts with sessionstore updates and 
  // private browsing mode switches. Calls can be nested. 
  storageBusy: function UI_storageBusy() {
    if (this._storageBusy)
      return;

    this._storageBusy = true;

    TabItems.pauseReconnecting();
    GroupItems.pauseAutoclose();
  },
  
  // ----------
  // Function: storageReady
  // Resumes the activity paused by storageBusy, and updates for any new group
  // information in sessionstore. Calls can be nested. 
  storageReady: function UI_storageReady() {
    if (!this._storageBusy)
      return;

    this._storageBusy = false;

    let hasGroupItemsData = GroupItems.load();
    if (!hasGroupItemsData)
      this.reset();

    TabItems.resumeReconnecting();
    GroupItems._updateTabBar();
    GroupItems.resumeAutoclose();
  },

  // ----------
  // Function: _addTabActionHandlers
  // Adds handlers to handle tab actions.
  _addTabActionHandlers: function UI__addTabActionHandlers() {
    var self = this;

    // session restore events
    function handleSSWindowStateBusy() {
      self.storageBusy();
    }
    
    function handleSSWindowStateReady() {
      self.storageReady();
    }
    
    gWindow.addEventListener("SSWindowStateBusy", handleSSWindowStateBusy, false);
    gWindow.addEventListener("SSWindowStateReady", handleSSWindowStateReady, false);

    this._cleanupFunctions.push(function() {
      gWindow.removeEventListener("SSWindowStateBusy", handleSSWindowStateBusy, false);
      gWindow.removeEventListener("SSWindowStateReady", handleSSWindowStateReady, false);
    });

    // Private Browsing:
    // When transitioning to PB, we exit Panorama if necessary (making note of the
    // fact that we were there so we can return after PB) and make sure we
    // don't reenter Panorama due to all of the session restore tab
    // manipulation (which otherwise we might). When transitioning away from
    // PB, we reenter Panorama if we had been there directly before PB.
    function pbObserver(subject, topic, data) {
      if (topic == "private-browsing") {
        // We could probably do this in private-browsing-change-granted, but
        // this seems like a nicer spot, right in the middle of the process.
        if (data == "enter") {
          // If we are in Tab View, exit. 
          self._privateBrowsing.wasInTabView = self.isTabViewVisible();
          if (self.isTabViewVisible())
            self.goToTab(gBrowser.selectedTab);
        }
      } else if (topic == "private-browsing-change-granted") {
        if (data == "enter" || data == "exit") {
          Search.hide();
          self._privateBrowsing.transitionMode = data;

          // make sure to save all thumbnails that haven't been saved yet
          // before we enter the private browsing mode
          if (data == "enter")
            TabItems.saveAllThumbnails({synchronously: true});
        }
      } else if (topic == "private-browsing-transition-complete") {
        // We use .transitionMode here, as aData is empty.
        if (self._privateBrowsing.transitionMode == "exit" &&
            self._privateBrowsing.wasInTabView)
          self.showTabView(false);

        self._privateBrowsing.transitionMode = "";
      }
    }

    Services.obs.addObserver(pbObserver, "private-browsing", false);
    Services.obs.addObserver(pbObserver, "private-browsing-change-granted", false);
    Services.obs.addObserver(pbObserver, "private-browsing-transition-complete", false);

    this._cleanupFunctions.push(function() {
      Services.obs.removeObserver(pbObserver, "private-browsing");
      Services.obs.removeObserver(pbObserver, "private-browsing-change-granted");
      Services.obs.removeObserver(pbObserver, "private-browsing-transition-complete");
    });

    // TabOpen
    this._eventListeners.open = function (event) {
      let tab = event.target;

      // if it's an app tab, add it to all the group items
      if (tab.pinned)
        GroupItems.addAppTab(tab);
      else if (self.isTabViewVisible() && !self._storageBusyCount)
        self._lastOpenedTab = tab;
    };
    
    // TabClose
    this._eventListeners.close = function (event) {
      let tab = event.target;

      // if it's an app tab, remove it from all the group items
      if (tab.pinned)
        GroupItems.removeAppTab(tab);
        
      if (self.isTabViewVisible()) {
        // just closed the selected tab in the TabView interface.
        if (self._currentTab == tab)
          self._closedSelectedTabInTabView = true;
      } else {
        // If we're currently in the process of entering private browsing,
        // we don't want to go to the Tab View UI. 
        if (self._storageBusy)
          return;

        // if not closing the last tab
        if (gBrowser.tabs.length > 1) {
          // Don't return to TabView if there are any app tabs
          for (let a = 0; a < gBrowser._numPinnedTabs; a++) {
            if (!gBrowser.tabs[a].closing)
              return;
          }

          var groupItem = GroupItems.getActiveGroupItem();

          // 1) Only go back to the TabView tab when there you close the last
          // tab of a groupItem.
          let closingLastOfGroup = (groupItem && 
              groupItem._children.length == 1 && 
              groupItem._children[0].tab == tab);

          // 2) When a blank tab is active while restoring a closed tab the
          // blank tab gets removed. The active group is not closed as this is
          // where the restored tab goes. So do not show the TabView.
          let tabItem = tab && tab._tabViewTabItem;
          let closingBlankTabAfterRestore =
            (tabItem && tabItem.isRemovedAfterRestore);

          if (closingLastOfGroup && !closingBlankTabAfterRestore) {
            // for the tab focus event to pick up.
            self._closedLastVisibleTab = true;
            self.showTabView();
          }
        }
      }
    };

    // TabMove
    this._eventListeners.move = function (event) {
      let tab = event.target;

      if (GroupItems.groupItems.length > 0) {
        if (tab.pinned) {
          if (gBrowser._numPinnedTabs > 1)
            GroupItems.arrangeAppTab(tab);
        } else {
          let activeGroupItem = GroupItems.getActiveGroupItem();
          if (activeGroupItem)
            self.setReorderTabItemsOnShow(activeGroupItem);
        }
      }
    };

    // TabSelect
    this._eventListeners.select = function (event) {
      self.onTabSelect(event.target);
    };

    // TabPinned
    this._eventListeners.pinned = function (event) {
      let tab = event.target;

      TabItems.handleTabPin(tab);
      GroupItems.addAppTab(tab);
    };

    // TabUnpinned
    this._eventListeners.unpinned = function (event) {
      let tab = event.target;

      TabItems.handleTabUnpin(tab);
      GroupItems.removeAppTab(tab);

      let groupItem = tab._tabViewTabItem.parent;
      if (groupItem)
        self.setReorderTabItemsOnShow(groupItem);
    };

    // Actually register the above handlers
    for (let name in this._eventListeners)
      AllTabs.register(name, this._eventListeners[name]);
  },

  // ----------
  // Function: _removeTabActionHandlers
  // Removes handlers to handle tab actions.
  _removeTabActionHandlers: function UI__removeTabActionHandlers() {
    for (let name in this._eventListeners)
      AllTabs.unregister(name, this._eventListeners[name]);
  },

  // ----------
  // Function: goToTab
  // Selects the given xul:tab in the browser.
  goToTab: function UI_goToTab(xulTab) {
    // If it's not focused, the onFocus listener would handle it.
    if (gBrowser.selectedTab == xulTab)
      this.onTabSelect(xulTab);
    else
      gBrowser.selectedTab = xulTab;
  },

  // ----------
  // Function: onTabSelect
  // Called when the user switches from one tab to another outside of the TabView UI.
  onTabSelect: function UI_onTabSelect(tab) {
    this._currentTab = tab;

    if (this.isTabViewVisible()) {
      // We want to zoom in if:
      // 1) we didn't just restore a tab via Ctrl+Shift+T
      // 2) we're not in the middle of switching from/to private browsing
      // 3) the currently selected tab is the last created tab and has a tabItem
      if (!this.restoredClosedTab && !this._privateBrowsing.transitionMode &&
          this._lastOpenedTab == tab && tab._tabViewTabItem) {
        tab._tabViewTabItem.zoomIn(true);
        this._lastOpenedTab = null;
        return;
      }
      if (this._closedLastVisibleTab ||
          (this._closedSelectedTabInTabView && !this.closedLastTabInTabView) ||
          this.restoredClosedTab) {
        if (this.restoredClosedTab) {
          // when the tab view UI is being displayed, update the thumb for the 
          // restored closed tab after the page load
          tab.linkedBrowser.addEventListener("load", function onLoad(event) {
            tab.linkedBrowser.removeEventListener("load", onLoad, true);
            TabItems._update(tab);
          }, true);
        }
        this._closedLastVisibleTab = false;
        this._closedSelectedTabInTabView = false;
        this.closedLastTabInTabView = false;
        this.restoredClosedTab = false;
        return;
      }
    }
    // reset these vars, just in case.
    this._closedLastVisibleTab = false;
    this._closedSelectedTabInTabView = false;
    this.closedLastTabInTabView = false;
    this.restoredClosedTab = false;
    this._lastOpenedTab = null;

    // if TabView is visible but we didn't just close the last tab or
    // selected tab, show chrome.
    if (this.isTabViewVisible()) {
      // Unhide the group of the tab the user is activating.
      if (tab && tab._tabViewTabItem && tab._tabViewTabItem.parent &&
          tab._tabViewTabItem.parent.hidden)
        tab._tabViewTabItem.parent._unhide({immediately: true});

      this.hideTabView();
    }

    // another tab might be selected when hideTabView() is invoked so a
    // validation is needed.
    if (this._currentTab != tab)
      return;

    let newItem = null;
    // update the tab bar for the new tab's group
    if (tab && tab._tabViewTabItem) {
      if (!TabItems.reconnectingPaused()) {
        newItem = tab._tabViewTabItem;
        GroupItems.updateActiveGroupItemAndTabBar(newItem);
      }
    } else {
      // No tabItem; must be an app tab. Base the tab bar on the current group.
      // If no current group, figure it out based on what's already in the tab
      // bar.
      if (!GroupItems.getActiveGroupItem()) {
        for (let a = 0; a < gBrowser.tabs.length; a++) {
          let theTab = gBrowser.tabs[a];
          if (!theTab.pinned) {
            let tabItem = theTab._tabViewTabItem;
            this.setActive(tabItem.parent);
            break;
          }
        }
      }

      if (GroupItems.getActiveGroupItem())
        GroupItems._updateTabBar();
    }
  },

  // ----------
  // Function: _onDOMWillOpenModalDialog
  // Called when a web page is about to show a modal dialog.
  _onDOMWillOpenModalDialog: function UI__onDOMWillOpenModalDialog(cx) {
    if (!this.isTabViewVisible())
      return;

    let index = gBrowser.browsers.indexOf(cx.target);
    if (index == -1)
      return;

    let tab = gBrowser.tabs[index];

    // When TabView is visible, we need to call onTabSelect to make sure that
    // TabView is hidden and that the correct group is activated. When a modal
    // dialog is shown for currently selected tab the onTabSelect event handler
    // is not called, so we need to do it.
    if (gBrowser.selectedTab == tab && this._currentTab == tab)
      this.onTabSelect(tab);
  },

  // ----------
  // Function: setReorderTabsOnHide
  // Sets the groupItem which the tab items' tabs should be re-ordered when
  // switching to the main browser UI.
  // Parameters:
  //   groupItem - the groupItem which would be used for re-ordering tabs.
  setReorderTabsOnHide: function UI_setReorderTabsOnHide(groupItem) {
    if (this.isTabViewVisible()) {
      var index = this._reorderTabsOnHide.indexOf(groupItem);
      if (index == -1)
        this._reorderTabsOnHide.push(groupItem);
    }
  },

  // ----------
  // Function: setReorderTabItemsOnShow
  // Sets the groupItem which the tab items should be re-ordered when
  // switching to the tab view UI.
  // Parameters:
  //   groupItem - the groupItem which would be used for re-ordering tab items.
  setReorderTabItemsOnShow: function UI_setReorderTabItemsOnShow(groupItem) {
    if (!this.isTabViewVisible()) {
      var index = this._reorderTabItemsOnShow.indexOf(groupItem);
      if (index == -1)
        this._reorderTabItemsOnShow.push(groupItem);
    }
  },
  
  // ----------
  updateTabButton: function UI_updateTabButton() {
    let exitButton = document.getElementById("exit-button");
    let numberOfGroups = GroupItems.groupItems.length;

    exitButton.setAttribute("groups", numberOfGroups);
    gTabView.updateGroupNumberBroadcaster(numberOfGroups);
  },

  // ----------
  // Function: getClosestTab
  // Convenience function to get the next tab closest to the entered position
  getClosestTab: function UI_getClosestTab(tabCenter) {
    let cl = null;
    let clDist;
    TabItems.getItems().forEach(function (item) {
      if (!item.parent || item.parent.hidden)
        return;
      let testDist = tabCenter.distance(item.bounds.center());
      if (cl==null || testDist < clDist) {
        cl = item;
        clDist = testDist;
      }
    });
    return cl;
  },

  // ----------
  // Function: _setupBrowserKeys
  // Sets up the allowed browser keys using key elements.
  _setupBrowserKeys: function UI__setupKeyWhiteList() {
    let keys = {};

    [
//@line 1045 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
      "quitApplication",
//@line 1052 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
      "newNavigator", "newNavigatorTab", "undo", "cut", "copy", "paste", 
      "selectAll", "find"
    ].forEach(function(key) {
      let element = gWindow.document.getElementById("key_" + key);
      let code = element.getAttribute("key").toLocaleLowerCase().charCodeAt(0);
      keys[code] = key;
    });
    this._browserKeys = keys;

    keys = {};
    // The lower case letters are passed to processBrowserKeys() even with shift 
    // key when stimulating a key press using EventUtils.synthesizeKey() so need 
    // to handle both upper and lower cases here.
    [
//@line 1067 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
      "redo",
//@line 1072 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
      "closeWindow", "tabview", "undoCloseTab", "undoCloseWindow",
      "privatebrowsing"
    ].forEach(function(key) {
      let element = gWindow.document.getElementById("key_" + key);
      let code = element.getAttribute("key").toLocaleLowerCase().charCodeAt(0);
      keys[code] = key;
    });
    this._browserKeysWithShift = keys;
  },

  // ----------
  // Function: _setTabViewFrameKeyHandlers
  // Sets up the key handlers for navigating between tabs within the TabView UI.
  _setTabViewFrameKeyHandlers: function UI__setTabViewFrameKeyHandlers() {
    let self = this;

    this._setupBrowserKeys();

    iQ(window).keyup(function(event) {
      if (!event.metaKey)
        Keys.meta = false;
    });

    iQ(window).keypress(function(event) {
      if (event.metaKey)
        Keys.meta = true;

      function processBrowserKeys(evt) {
        // let any keys with alt to pass through
        if (evt.altKey)
          return;

//@line 1107 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
        if (evt.ctrlKey) {
//@line 1109 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/tabview/ui.js"
          let preventDefault = true;
          if (evt.shiftKey) {
            // when a user presses ctrl+shift+key, upper case letter charCode 
            // is passed to processBrowserKeys() so converting back to lower 
            // case charCode before doing the check
            let lowercaseCharCode =
              String.fromCharCode(evt.charCode).toLocaleLowerCase().charCodeAt(0);
            if (lowercaseCharCode in self._browserKeysWithShift) {
              let key = self._browserKeysWithShift[lowercaseCharCode];
              if (key == "tabview")
                self.exit();
              else
                preventDefault = false;
            }
          } else {
            if (evt.charCode in self._browserKeys) {
              let key = self._browserKeys[evt.charCode];
              if (key == "find")
                self.enableSearch();
              else
                preventDefault = false;
            }
          }
          if (preventDefault) {
            evt.stopPropagation();
            evt.preventDefault();
          }
        }
      }
      if ((iQ(":focus").length > 0 && iQ(":focus")[0].nodeName == "INPUT") ||
          Search.isEnabled() || self.ignoreKeypressForSearch) {
        self.ignoreKeypressForSearch = false;
        processBrowserKeys(event);
        return;
      }

      function getClosestTabBy(norm) {
        if (!self.getActiveTab())
          return null;

        let activeTab = self.getActiveTab();
        let activeTabGroup = activeTab.parent;
        let myCenter = activeTab.bounds.center();
        let match;

        TabItems.getItems().forEach(function (item) {
          if (!item.parent.hidden &&
              (!activeTabGroup.expanded || activeTabGroup.id == item.parent.id)) {
            let itemCenter = item.bounds.center();

            if (norm(itemCenter, myCenter)) {
              let itemDist = myCenter.distance(itemCenter);
              if (!match || match[0] > itemDist)
                match = [itemDist, item];
            }
          }
        });

        return match && match[1];
      }

      let preventDefault = true;
      let activeTab;
      let norm = null;
      switch (event.keyCode) {
        case KeyEvent.DOM_VK_RIGHT:
          norm = function(a, me){return a.x > me.x};
          break;
        case KeyEvent.DOM_VK_LEFT:
          norm = function(a, me){return a.x < me.x};
          break;
        case KeyEvent.DOM_VK_DOWN:
          norm = function(a, me){return a.y > me.y};
          break;
        case KeyEvent.DOM_VK_UP:
          norm = function(a, me){return a.y < me.y}
          break;
      }

      if (norm != null) {
        var nextTab = getClosestTabBy(norm);
        if (nextTab) {
          if (nextTab.isStacked && !nextTab.parent.expanded)
            nextTab = nextTab.parent.getChild(0);
          self.setActive(nextTab);
        }
      } else {
        switch(event.keyCode) {
          case KeyEvent.DOM_VK_ESCAPE:
            let activeGroupItem = GroupItems.getActiveGroupItem();
            if (activeGroupItem && activeGroupItem.expanded)
              activeGroupItem.collapse();
            else
              self.exit();
            break;
          case KeyEvent.DOM_VK_RETURN:
          case KeyEvent.DOM_VK_ENTER:
            activeTab = self.getActiveTab();
            if (activeTab)
              activeTab.zoomIn();
            break;
          case KeyEvent.DOM_VK_TAB:
            // tab/shift + tab to go to the next tab.
            activeTab = self.getActiveTab();
            if (activeTab) {
              let tabItems = (activeTab.parent ? activeTab.parent.getChildren() :
                              [activeTab]);
              let length = tabItems.length;
              let currentIndex = tabItems.indexOf(activeTab);

              if (length > 1) {
                let newIndex;
                if (event.shiftKey) {
                  if (currentIndex == 0)
                    newIndex = (length - 1);
                  else
                    newIndex = (currentIndex - 1);
                } else {
                  if (currentIndex == (length - 1))
                    newIndex = 0;
                  else
                    newIndex = (currentIndex + 1);
                }
                self.setActive(tabItems[newIndex]);
              }
            }
            break;
          default:
            processBrowserKeys(event);
            preventDefault = false;
        }
        if (preventDefault) {
          event.stopPropagation();
          event.preventDefault();
        }
      }
    });
  },

  // ----------
  // Function: enableSearch
  // Enables the search feature.
  enableSearch: function UI_enableSearch() {
    if (!Search.isEnabled()) {
      Search.ensureShown();
      Search.switchToInMode();
    }
  },

  // ----------
  // Function: _createGroupItemOnDrag
  // Called in response to a mousedown in empty space in the TabView UI;
  // creates a new groupItem based on the user's drag.
  _createGroupItemOnDrag: function UI__createGroupItemOnDrag(e) {
    const minSize = 60;
    const minMinSize = 15;

    let lastActiveGroupItem = GroupItems.getActiveGroupItem();

    var startPos = { x: e.clientX, y: e.clientY };
    var phantom = iQ("<div>")
      .addClass("groupItem phantom activeGroupItem dragRegion")
      .css({
        position: "absolute",
        zIndex: -1,
        cursor: "default"
      })
      .appendTo("body");

    var item = { // a faux-Item
      container: phantom,
      isAFauxItem: true,
      bounds: {},
      getBounds: function FauxItem_getBounds() {
        return this.container.bounds();
      },
      setBounds: function FauxItem_setBounds(bounds) {
        this.container.css(bounds);
      },
      setZ: function FauxItem_setZ(z) {
        // don't set a z-index because we want to force it to be low.
      },
      setOpacity: function FauxItem_setOpacity(opacity) {
        this.container.css("opacity", opacity);
      },
      // we don't need to pushAway the phantom item at the end, because
      // when we create a new GroupItem, it'll do the actual pushAway.
      pushAway: function () {},
    };
    item.setBounds(new Rect(startPos.y, startPos.x, 0, 0));

    var dragOutInfo = new Drag(item, e);

    function updateSize(e) {
      var box = new Rect();
      box.left = Math.min(startPos.x, e.clientX);
      box.right = Math.max(startPos.x, e.clientX);
      box.top = Math.min(startPos.y, e.clientY);
      box.bottom = Math.max(startPos.y, e.clientY);
      item.setBounds(box);

      // compute the stationaryCorner
      var stationaryCorner = "";

      if (startPos.y == box.top)
        stationaryCorner += "top";
      else
        stationaryCorner += "bottom";

      if (startPos.x == box.left)
        stationaryCorner += "left";
      else
        stationaryCorner += "right";

      dragOutInfo.snap(stationaryCorner, false, false); // null for ui, which we don't use anyway.

      box = item.getBounds();
      if (box.width > minMinSize && box.height > minMinSize &&
         (box.width > minSize || box.height > minSize))
        item.setOpacity(1);
      else
        item.setOpacity(0.7);

      e.preventDefault();
    }

    let self = this;
    function collapse() {
      let center = phantom.bounds().center();
      phantom.animate({
        width: 0,
        height: 0,
        top: center.y,
        left: center.x
      }, {
        duration: 300,
        complete: function() {
          phantom.remove();
        }
      });
      self.setActive(lastActiveGroupItem);
    }

    function finalize(e) {
      iQ(window).unbind("mousemove", updateSize);
      item.container.removeClass("dragRegion");
      dragOutInfo.stop();
      let box = item.getBounds();
      if (box.width > minMinSize && box.height > minMinSize &&
         (box.width > minSize || box.height > minSize)) {
        let opts = {bounds: item.getBounds(), focusTitle: true};
        let groupItem = new GroupItem([], opts);
        self.setActive(groupItem);
        phantom.remove();
        dragOutInfo = null;
        gTabView.firstUseExperienced = true;
      } else {
        collapse();
      }
    }

    iQ(window).mousemove(updateSize)
    iQ(gWindow).one("mouseup", finalize);
    e.preventDefault();
    return false;
  },

  // ----------
  // Function: _resize
  // Update the TabView UI contents in response to a window size change.
  // Won't do anything if it doesn't deem the resize necessary.
  // Parameters:
  //   force - true to update even when "unnecessary"; default false
  _resize: function UI__resize(force) {
    if (!this._pageBounds)
      return;

    // Here are reasons why we *won't* resize:
    // 1. Panorama isn't visible (in which case we will resize when we do display)
    // 2. the screen dimensions haven't changed
    // 3. everything on the screen fits and nothing feels cramped
    if (!force && !this.isTabViewVisible())
      return;

    let oldPageBounds = new Rect(this._pageBounds);
    let newPageBounds = Items.getPageBounds();
    if (newPageBounds.equals(oldPageBounds))
      return;

    if (!this.shouldResizeItems())
      return;

    var items = Items.getTopLevelItems();

    // compute itemBounds: the union of all the top-level items' bounds.
    var itemBounds = new Rect(this._pageBounds);
    // We start with pageBounds so that we respect the empty space the user
    // has left on the page.
    itemBounds.width = 1;
    itemBounds.height = 1;
    items.forEach(function(item) {
      var bounds = item.getBounds();
      itemBounds = (itemBounds ? itemBounds.union(bounds) : new Rect(bounds));
    });

    if (newPageBounds.width < this._pageBounds.width &&
        newPageBounds.width > itemBounds.width)
      newPageBounds.width = this._pageBounds.width;

    if (newPageBounds.height < this._pageBounds.height &&
        newPageBounds.height > itemBounds.height)
      newPageBounds.height = this._pageBounds.height;

    var wScale;
    var hScale;
    if (Math.abs(newPageBounds.width - this._pageBounds.width)
         > Math.abs(newPageBounds.height - this._pageBounds.height)) {
      wScale = newPageBounds.width / this._pageBounds.width;
      hScale = newPageBounds.height / itemBounds.height;
    } else {
      wScale = newPageBounds.width / itemBounds.width;
      hScale = newPageBounds.height / this._pageBounds.height;
    }

    var scale = Math.min(hScale, wScale);
    var self = this;
    var pairs = [];
    items.forEach(function(item) {
      var bounds = item.getBounds();
      bounds.left += (UI.rtl ? -1 : 1) * (newPageBounds.left - self._pageBounds.left);
      bounds.left *= scale;
      bounds.width *= scale;

      bounds.top += newPageBounds.top - self._pageBounds.top;
      bounds.top *= scale;
      bounds.height *= scale;

      pairs.push({
        item: item,
        bounds: bounds
      });
    });

    Items.unsquish(pairs);

    pairs.forEach(function(pair) {
      pair.item.setBounds(pair.bounds, true);
      pair.item.snap();
    });

    this._pageBounds = Items.getPageBounds();
    this._save();
  },
  
  // ----------
  // Function: shouldResizeItems
  // Returns whether we should resize the items on the screen, based on whether
  // the top-level items fit in the screen or not and whether they feel
  // "cramped" or not.
  // These computations may be done using cached values. The cache can be
  // cleared with UI.clearShouldResizeItems().
  shouldResizeItems: function UI_shouldResizeItems() {
    let newPageBounds = Items.getPageBounds();
    
    // If we don't have cached cached values...
    if (this._minimalRect === undefined || this._feelsCramped === undefined) {

      // Loop through every top-level Item for two operations:
      // 1. check if it is feeling "cramped" due to squishing (a technical term),
      // 2. union its bounds with the minimalRect
      let feelsCramped = false;
      let minimalRect = new Rect(0, 0, 1, 1);
      
      Items.getTopLevelItems()
        .forEach(function UI_shouldResizeItems_checkItem(item) {
          let bounds = new Rect(item.getBounds());
          feelsCramped = feelsCramped || (item.userSize &&
            (item.userSize.x > bounds.width || item.userSize.y > bounds.height));
          bounds.inset(-Trenches.defaultRadius, -Trenches.defaultRadius);
          minimalRect = minimalRect.union(bounds);
        });
      
      // ensure the minimalRect extends to, but not beyond, the origin
      minimalRect.left = 0;
      minimalRect.top  = 0;
  
      this._minimalRect = minimalRect;
      this._feelsCramped = feelsCramped;
    }

    return this._minimalRect.width > newPageBounds.width ||
      this._minimalRect.height > newPageBounds.height ||
      this._feelsCramped;
  },
  
  // ----------
  // Function: clearShouldResizeItems
  // Clear the cache of whether we should resize the items on the Panorama
  // screen, forcing a recomputation on the next UI.shouldResizeItems()
  // call.
  clearShouldResizeItems: function UI_clearShouldResizeItems() {
    delete this._minimalRect;
    delete this._feelsCramped;
  },

  // ----------
  // Function: exit
  // Exits TabView UI.
  exit: function UI_exit() {
    let self = this;
    let zoomedIn = false;

    if (Search.isEnabled()) {
      let matcher = Search.createSearchTabMatcher();
      let matches = matcher.matched();

      if (matches.length > 0) {
        matches[0].zoomIn();
        zoomedIn = true;
      }
      Search.hide();
    }

    if (!zoomedIn) {
      let unhiddenGroups = GroupItems.groupItems.filter(function(groupItem) {
        return (!groupItem.hidden && groupItem.getChildren().length > 0);
      });
      // no pinned tabs and no visible groups: open a new group. open a blank
      // tab and return
      if (!unhiddenGroups.length) {
        let emptyGroups = GroupItems.groupItems.filter(function (groupItem) {
          return (!groupItem.hidden && !groupItem.getChildren().length);
        });
        let group = (emptyGroups.length ? emptyGroups[0] : GroupItems.newGroup());
        if (!gBrowser._numPinnedTabs) {
          group.newTab(null, { closedLastTab: true });
          return;
        }
      }

      // If there's an active TabItem, zoom into it. If not (for instance when the
      // selected tab is an app tab), just go there.
      let activeTabItem = this.getActiveTab();
      if (!activeTabItem) {
        let tabItem = gBrowser.selectedTab._tabViewTabItem;
        if (tabItem) {
          if (!tabItem.parent || !tabItem.parent.hidden) {
            activeTabItem = tabItem;
          } else { // set active tab item if there is at least one unhidden group
            if (unhiddenGroups.length > 0)
              activeTabItem = unhiddenGroups[0].getActiveTab();
          }
        }
      }

      if (activeTabItem) {
        activeTabItem.zoomIn();
      } else {
        if (gBrowser._numPinnedTabs > 0) {
          if (gBrowser.selectedTab.pinned) {
            self.goToTab(gBrowser.selectedTab);
          } else {
            Array.some(gBrowser.tabs, function(tab) {
              if (tab.pinned) {
                self.goToTab(tab);
                return true;
              }
              return false
            });
          }
        }
      }
    }
  },

  // ----------
  // Function: storageSanity
  // Given storage data for this object, returns true if it looks valid.
  _storageSanity: function UI__storageSanity(data) {
    if (Utils.isEmptyObject(data))
      return true;

    if (!Utils.isRect(data.pageBounds)) {
      Utils.log("UI.storageSanity: bad pageBounds", data.pageBounds);
      data.pageBounds = null;
      return false;
    }

    return true;
  },

  // ----------
  // Function: _save
  // Saves the data for this object to persistent storage
  _save: function UI__save() {
    if (!this._frameInitialized)
      return;

    var data = {
      pageBounds: this._pageBounds
    };

    if (this._storageSanity(data))
      Storage.saveUIData(gWindow, data);
  },

  // ----------
  // Function: _saveAll
  // Saves all data associated with TabView.
  // TODO: Save info items
  _saveAll: function UI__saveAll() {
    this._save();
    GroupItems.saveAll();
    TabItems.saveAll();
  },

  // ----------
  // Function: shouldLoadFavIcon
  // Takes a xul:browser and checks whether we should display a favicon for it.
  shouldLoadFavIcon: function UI_shouldLoadFavIcon(browser) {
    return !(browser.contentDocument instanceof window.ImageDocument) &&
            (browser.currentURI.schemeIs("about") ||
             gBrowser.shouldLoadFavIcon(browser.contentDocument.documentURIObject));
  },

  // ----------
  // Function: getFavIconUrlForTab
  // Gets fav icon url for the given xul:tab.
  getFavIconUrlForTab: function UI_getFavIconUrlForTab(tab) {
    let url;

    if (tab.image) {
      // if starts with http/https, fetch icon from favicon service via the moz-anno protocal
      if (/^https?:/.test(tab.image))
        url = gFavIconService.getFaviconLinkForIcon(gWindow.makeURI(tab.image)).spec;
      else
        url = tab.image;
    } else {
      url = gFavIconService.getFaviconImageForPage(tab.linkedBrowser.currentURI).spec;
    }

    return url;
  },

  // ----------
  // Function: notifySessionRestoreEnabled
  // Notify the user that session restore has been automatically enabled
  // by showing a banner that expects no user interaction. It fades out after
  // some seconds.
  notifySessionRestoreEnabled: function UI_notifySessionRestoreEnabled() {
    let brandBundle = gWindow.document.getElementById("bundle_brand");
    let brandShortName = brandBundle.getString("brandShortName");
    let notificationText = tabviewBundle.formatStringFromName(
      "tabview.notification.sessionStore", [brandShortName], 1);

    let banner = iQ("<div>")
      .text(notificationText)
      .addClass("banner")
      .appendTo("body");

    let onFadeOut = function () {
      banner.remove();
    };

    let onFadeIn = function () {
      setTimeout(function () {
        banner.animate({opacity: 0}, {duration: 1500, complete: onFadeOut});
      }, 5000);
    };

    banner.animate({opacity: 0.7}, {duration: 1500, complete: onFadeIn});
  }
};

// ----------
UI.init();
