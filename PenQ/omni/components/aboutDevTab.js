const Cc = Components.classes;
const Ci = Components.interfaces;
 
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
 
function AboutDevTab() { }
AboutDevTab.prototype = {
  classDescription: "about:dev",
  contractID: "@mozilla.org/network/protocol/about;1?what=dev",
  classID: Components.ID("{6139e45b-feee-434d-a856-a12d7165d54c}"),
//Note: classID here should be exactly the same as CID in chrome.manifest
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),
   
  getURIFlags: function(aURI) {
    return Ci.nsIAboutModule.ALLOW_SCRIPT;
  },
   
  newChannel: function(aURI) {
    let ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let channel = ios.newChannel("chrome://browser/content/aboutDev.xhtml",
                                 null, null);
  channel.originalURI = aURI;
    return channel;
  }
};
const NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutDevTab]);
