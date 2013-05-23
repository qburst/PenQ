const Cc = Components.classes;
const Ci = Components.interfaces;
 
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
 
function AboutPenqTab() { }
AboutPenqTab.prototype = {
  classDescription: "about:penq",
  contractID: "@mozilla.org/network/protocol/about;1?what=penq",
  classID: Components.ID("{f8409e0d-f755-4e66-bd4f-1ea73fcc28ab}"),
//Note: classID here should be exactly the same as CID in chrome.manifest
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),
   
  getURIFlags: function(aURI) {
    return Ci.nsIAboutModule.ALLOW_SCRIPT;
  },
   
  newChannel: function(aURI) {
    let ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let channel = ios.newChannel("chrome://browser/content/aboutPenq.xhtml",
                                 null, null);
  channel.originalURI = aURI;
    return channel;
  }
};
const NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutPenqTab]);
