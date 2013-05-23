const Cc = Components.classes;
const Ci = Components.interfaces;
 
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
 
function AboutNewTab() { }
AboutNewTab.prototype = {
  classDescription: "about:newTab",
  contractID: "@mozilla.org/network/protocol/about;1?what=newTab",
  classID: Components.ID("{a0815ec0-2d76-11e2-81c1-0800200c9a66}"),
//Note: classID here should be exactly the same as CID in chrome.manifest
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),
   
  getURIFlags: function(aURI) {
    return Ci.nsIAboutModule.ALLOW_SCRIPT;
  },
   
  newChannel: function(aURI) {
    let ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let channel = ios.newChannel("chrome://browser/content/aboutNew.xhtml",
                                 null, null);
//Note:﻿"chrome://CHROMEDIR" is like chrome://extension/content/aboutSitename.html Read more about chrome registration: https://developer.mozilla.org/en/Chrome_Registration
  channel.originalURI = aURI;
    return channel;
  }
};
const NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutNewTab]);
