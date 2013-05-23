//@line 38 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/base/content/content.js"

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

// Bug 671101 - directly using webNavigation in this context
// causes docshells to leak
__defineGetter__("webNavigation", function () {
  return docShell.QueryInterface(Ci.nsIWebNavigation);
});

addMessageListener("WebNavigation:LoadURI", function (message) {
  let flags = message.json.flags || webNavigation.LOAD_FLAGS_NONE;

  webNavigation.loadURI(message.json.uri, flags, null, null, null);
});

addMessageListener("Browser:HideSessionRestoreButton", function (message) {
  // Hide session restore button on about:home
  let doc = content.document;
  let container;
  if (doc.documentURI.toLowerCase() == "about:home" &&
      (container = doc.getElementById("sessionRestoreContainer"))){
    container.hidden = true;
  }
});
