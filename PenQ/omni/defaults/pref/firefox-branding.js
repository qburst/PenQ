pref("startup.homepage_override_url","");
//pref("startup.homepage_welcome_url","http://www.mozilla.com/%LOCALE%/%APP%/%VERSION%/firstrun/");
pref("startup.homepage_welcome_url","about:home");
// Interval: Time between checks for a new version (in seconds)
// nightly=6 hours, official=24 hours
pref("app.update.interval", 86400);
// The time interval between the downloading of mar file chunks in the
// background (in seconds)
pref("app.update.download.backgroundInterval", 600);
// Give the user x seconds to react before showing the big UI. default=24 hours
pref("app.update.promptWaitTime", 86400);
// URL user can browse to manually if for some reason all update installation
// attempts fail.
pref("app.update.url.manual", "http://www.qburst.com");
// A default value for the "More information about this update" link
// supplied in the "An update is available" page of the update wizard. 
//pref("app.update.url.details", "http://www.qburst.com/%LOCALE%/%APP%/releases/");

// Release notes and vendor URLs
//pref("app.releaseNotesURL", "http://www.qburst.com/%LOCALE%/%APP%/%VERSION%/releasenotes/");
//pref("app.vendorURL", "http://www.qburst.com/%LOCALE%/%APP%/");

pref("app.update.url.details", "http://www.qburst.com/products/PenQ/releases/");

// Release notes and vendor URLs
pref("app.releaseNotesURL", "http://www.qburst.com/products/PenQ/releasenotes/");
pref("app.vendorURL", "http://www.qburst.com/products/PenQ");

pref("browser.search.param.ms-pc", "MOZI");
pref("browser.search.param.yahoo-fr", "moz35");
pref("browser.search.param.yahoo-fr-cjkt", "moz35"); // now unused
pref("browser.search.param.yahoo-fr-ja", "mozff");
