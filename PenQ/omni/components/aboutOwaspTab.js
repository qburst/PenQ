const Cc = Components.classes;
const Ci = Components.interfaces;
 
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
 
function AboutOwaspTab() { }
AboutOwaspTab.prototype = {
  classDescription: "about:owasp",
  contractID: "@mozilla.org/network/protocol/about;1?what=owasp",
  classID: Components.ID("{796d8f02-38eb-4287-9bf4-1a88558dba53}"),
//Note: classID here should be exactly the same as CID in chrome.manifest
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),
   
  getURIFlags: function(aURI) {
    return Ci.nsIAboutModule.ALLOW_SCRIPT;
  },
   
  newChannel: function(aURI) {
    let ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let channel = ios.newChannel("chrome://browser/content/aboutOwasp.xhtml",
                                 null, null);
//Note:﻿"chrome://CHROMEDIR" is like chrome://extension/content/aboutSitename.html Read more about chrome registration: https://developer.mozilla.org/en/Chrome_Registration
  channel.originalURI = aURI;
    return channel;
  }
};
const NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutOwaspTab]);
