pref("extensions.{73a6fe31-595d-460b-a920-fcc0f8843232}.description", "chrome://noscript/locale/about.properties");
pref("noscript.autoReload", true);
pref("noscript.autoReload.global", true);
pref("noscript.autoReload.allTabs", true);
pref("noscript.autoReload.allTabsOnPageAction", true);
pref("noscript.autoReload.allTabsOnGlobal", false);
pref("noscript.autoReload.onMultiContent", false);
pref("noscript.autoReload.useHistory", false);
pref("noscript.autoReload.useHistory.exceptCurrent", true);
pref("noscript.autoReload.embedders", 1);
pref("noscript.ctxMenu", true);
pref("noscript.statusIcon", true);
pref("noscript.sound", false);
pref("noscript.sound.oncePerSite", true);
pref("noscript.notify", true);
pref("noscript.notify.bottom", true);
pref("noscript.showAddress", false);
pref("noscript.showDomain", false);
pref("noscript.showTemp", true);
pref("noscript.showPermanent", true);
pref("noscript.showDistrust", true);
pref("noscript.showUntrusted", true);
pref("noscript.showBaseDomain", true);
pref("noscript.showGlobal", true);
pref("noscript.showTempToPerm", true);
pref("noscript.showRevokeTemp", true);
pref("noscript.showBlockedObjects", true);
pref("noscript.showExternalFilters", true);
pref("noscript.showTempAllowPage", true);
pref("noscript.showAllowPage", true);
pref("noscript.mandatory", "chrome: blob: about: about:addons about:blocked about:crashes about:home about:config about:neterror about:certerror about:memory about:plugins about:privatebrowsing about:sessionrestore about:support resource:");
pref("noscript.default", "about:blank addons.mozilla.org persona.org mozilla.net flashgot.net google.com gstatic.com googleapis.com paypal.com paypalobjects.com securecode.com securesuite.net firstdata.com firstdata.lv informaction.com yahoo.com yimg.com yahooapis.com youtube.com ytimg.com maone.net noscript.net hotmail.com msn.com passport.com passport.net passportimages.com live.com afx.ms gfx.ms wlxrs.com");

pref("noscript.eraseFloatingElements", true);

pref("noscript.forbidJava", true);
pref("noscript.forbidFlash", true);
pref("noscript.forbidSilverlight", true);
pref("noscript.forbidPlugins", true);
pref("noscript.forbidMedia", true);
pref("noscript.forbidFonts", true);
pref("noscript.forbidWebGL", false);
pref("noscript.forbidActiveContentParentTrustCheck", true);
pref("noscript.forbidIFrames", false);
pref("noscript.forbidIFramesContext", 3);
pref("noscript.forbidIFramesParentTrustCheck", true);
pref("noscript.forbidFrames", false);
pref("noscript.forbidMixedFrames", true);

pref("noscript.forbidData", true);
pref("noscript.sound.block", "chrome://noscript/skin/block.wav");
pref("noscript.allowClipboard", false);
pref("noscript.allowLocalLinks", false);
pref("noscript.allowCachingObjects", true);

pref("noscript.showPlaceholder", true);
pref("noscript.global", false);
pref("noscript.confirmUnblock", true);
pref("noscript.confirmUnsafeReload", true);
pref("noscript.statusLabel", false);
pref("noscript.forbidBookmarklets", false);
pref("noscript.allowBookmarkletImports", true);
pref("noscript.allowBookmarks", false);
pref("noscript.notify.hideDelay", 5);
pref("noscript.notify.hidePermanent", true);

pref("noscript.notify.hide", false);
pref("noscript.truncateTitleLen", 255);
pref("noscript.truncateTitle", true);
pref("noscript.fixLinks", true);

pref("noscript.noping", true);
pref("noscript.consoleDump", 0);
pref("noscript.excaps", true);
pref("noscript.nselForce", true);
pref("noscript.nselNever", false);
pref("noscript.nselNoMeta", true);
pref("noscript.autoAllow", 0);
pref("noscript.toolbarToggle", 3);
pref("noscript.allowPageLevel", 0);

pref("noscript.forbidImpliesUntrust", false);
pref("noscript.keys.toggle", "ctrl shift VK_BACK_SLASH.|");
pref("noscript.keys.ui", "ctrl shift S");
pref("noscript.keys.tempAllowPage", "");
pref("noscript.keys.revokeTemp", "");

pref("noscript.menuAccelerators", false);

pref("noscript.forbidMetaRefresh", false);
pref("noscript.forbidMetaRefresh.remember", false);
pref("noscript.forbidMetaRefresh.notify", true);
pref("noscript.forbidMetaRefresh.exceptions", "^https?://(?:www|encrypted)\\.google\\.(?:[a-z]{2,3}|[a-z]{2}\\.[a-z]{2,3})/ t.co");

pref("noscript.contentBlocker", false);

pref("noscript.toggle.temp", true);
pref("noscript.firstRunRedirection", true);

pref("noscript.xss.notify", true);
pref("noscript.xss.notify.subframes", true);
pref("noscript.xss.trustReloads", false);
pref("noscript.xss.trustData", true);
pref("noscript.xss.trustExternal", true);
pref("noscript.xss.trustTemp", true);
pref("noscript.xss.checkInclusions", true);
pref("noscript.xss.checkInclusions.exceptions", "intensedebate.com/idc/js/");

pref("noscript.filterXPost", true);
pref("noscript.filterXGet", true);
pref("noscript.filterXGetRx", "<+(?=[^<>=\-\\d\\. /\\(])|[\\\\\"\\x00-\\x07\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F]");
pref("noscript.filterXGetUserRx", "");
pref("noscript.filterXExceptions", "^https?://([a-z]+)\\.google\\.(?:[a-z]{1,3}\\.)?[a-z]+/(?:search|custom|\\1)\\?\n^https?://([a-z]*)\\.?search\\.yahoo\\.com/search(?:\\?|/\\1\\b)\n^https?://[a-z]+\\.wikipedia\\.org/wiki/[^\"<>\?%]+$\n^https?://translate\.google\.com/translate_t[^\"'<>\?%]+$\n^https://secure\\.wikimedia\\.org/wikipedia/[a-z]+/wiki/[^\"<>\\?%]+$");
pref("noscript.filterXExceptions.blogspot", true);
pref("noscript.filterXExceptions.deviantart", true);
pref("noscript.filterXExceptions.fbconnect", true);
pref("noscript.filterXExceptions.ggadgets", true);
pref("noscript.filterXExceptions.letitbit", true);
pref("noscript.filterXExceptions.livejournal", true);
pref("noscript.filterXExceptions.lycosmail", true);
pref("noscript.filterXExceptions.medicare", true);
pref("noscript.filterXExceptions.readability", true);
pref("noscript.filterXExceptions.yahoo", true);
pref("noscript.filterXExceptions.visa", true);
pref("noscript.filterXExceptions.verizon", true);
pref("noscript.filterXExceptions.zendesk", true);
pref("noscript.injectionCheck", 2);
pref("noscript.injectionCheckPost", true);
pref("noscript.injectionCheckHTML", true);

pref("noscript.globalwarning", true);

pref("noscript.jsredirectIgnore", false);
pref("noscript.jsredirectFollow", false);
pref("noscript.jsredirectForceShow", false);

pref("noscript.removeSMILKeySniffer", true);

pref("noscript.utf7filter", true);

pref("noscript.safeJSRx", "(?:window\\.)?close\\s*\\(\\)");

pref("noscript.badInstall", false);

pref("noscript.fixURI", true);
pref("noscript.fixURI.exclude", "");

pref("noscript.urivalid.aim", "\\w[^\\\\\?&\\x00-\\x1f#]*(?:\\?[^\\\\\\x00-\\x1f#]*(?:#[\\w\\-\\.\\+@]{2,32})?)?");
pref("noscript.urivalid.mailto", "[^\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f]*");

pref("noscript.forbidExtProtSubdocs", true);

pref("noscript.forbidXBL", 1);
pref("noscript.forbidXHR", 1);

pref("noscript.whitelistRegExp", "");

pref("noscript.tempGlobal", false);

pref("noscript.lockPrivilegedUI", false);

pref("noscript.collapseObject", false);

pref("noscript.showUntrustedPlaceholder", true);

pref("noscript.jsHack", "");
pref("noscript.jsHackRegExp", "");

pref("noscript.canonicalFQDN", false);

pref("noscript.allowedMimeRegExp", "");
pref("noscript.alwaysBlockUntrustedContent", true); 

pref("noscript.consoleLog", false);

pref("noscript.dropXssProtection", true);
pref("noscript.flashPatch", true);
pref("noscript.silverlightPatch", true);


pref("noscript.allowURLBarJS", false);
pref("noscript.allowURLBarImports", false);

pref("noscript.docShellJSBlocking", 1);

pref("noscript.hideOnUnloadRegExp", "video/.*");

pref("noscript.untrustedGranularity", 3);
pref("noscript.requireReloadRegExp", "application/x-vnd\\.moveplayer\\b.*");

pref("noscript.trustEV", false);

pref("noscript.secureCookies", false);
pref("noscript.secureCookiesExceptions", "");
pref("noscript.secureCookiesForced", "");
pref("noscript.secureCookies.recycle", false);
pref("noscript.secureCookies.perTab", false);

pref("noscript.httpsForced", "");
pref("noscript.allowHttpsOnly", 0);

pref("noscript.https.showInConsole", true);

pref("noscript.clearClick", 3);
pref("noscript.clearClick.plugins", true);
pref("noscript.clearClick.prompt", true);
pref("noscript.clearClick.debug", false);
pref("noscript.clearClick.exceptions", ".mail.yahoo.com https://mail.google.com/ *.ebay.com *.photobucket.com");
pref("noscript.clearClick.subexceptions", "^http://bit(?:ly\\.com|\\.ly)/a/sidebar\\?u= http://*.uservoice.com/*/popin.html?* http://w.sharethis.com/share3x/lightbox.html?* http://disqus.com/embed/* *.disqus.com/*/reply.html* http://www.feedly.com/mini abine:*");
pref("noscript.clearClick.rapidFireCheck", true);
pref("noscript.clearClick.threshold", 18);

pref("noscript.emulateFrameBreak", true);

pref("noscript.stickyUI.liveReload", false);
pref("noscript.stickyUI", true);
pref("noscript.stickyUI.onKeyboard", true);
pref("noscript.hoverUI", true);
pref("noscript.hoverUI.delayEnter", 250);
pref("noscript.hoverUI.delayStop", 50);
pref("noscript.hoverUI.delayExit1", 250);
pref("noscript.hoverUI.delayExit2", 300);
pref("noscript.hoverUI.excludeToggling", true);

pref("noscript.ignorePorts", true);

pref("noscript.cp.last", true);

pref("noscript.surrogate.enabled", true);
pref("noscript.surrogate.debug", false);
pref("noscript.surrogate.sandbox", true);
pref("noscript.surrogate.adagionet.sources", ".adagionet.com");
pref("noscript.surrogate.adagionet.replacement", "adagioWriteTag=adagioWriteBanner=function(){}");
pref("noscript.surrogate.adfly.sources", "!@.adf.ly");
pref("noscript.surrogate.adfly.replacement", "for each(let s in document.getElementsByTagName('script')){let m=s.textContent.match(/\\bcountdown\\b[\\s\\S]+\\bvar\\s+url\\s+=\\s+[\"'](https?:[^'\"]+)/);if(m){window.location.href=m[1];break}}");
pref("noscript.surrogate.digg.sources", "!@digg.com/newsbar/*");
pref("noscript.surrogate.digg.replacement", "window.location.href=document.querySelector('link[rel=canonical]').href");
pref("noscript.surrogate.ga.sources", "*.google-analytics.com");
pref("noscript.surrogate.ga.replacement", "(function(){var _0=function(){return _0;};_0.__noSuchMethod__=_0;with(window)urchinTracker=_0,_gaq={__noSuchMethod__:_0,push:_0,_link:function(h){if(h)location.href=h},_linkByPost:function(){return true},_getLinkerUrl:function(u){return u},_trackEvent:_0},_gat={__noSuchMethod__:function(){return _gaq}}})()");
pref("noscript.surrogate.glinks.replacement", "for each(let et in ['focus','mouseover','mousedown','click'])addEventListener(et,function(e){var a=e.target;do{if(a.href&&!a._href){a._href=a.href=a.href.replace(/.*\\/url.*[?&](?:url|q)=(http[^&]+).*/,function(a,b)decodeURIComponent(b));if(/\\brwt\\(/.test(a.getAttribute('onmousedown')))a.removeAttribute('onmousedown')}}while(a=a.parentNode)},true)");
pref("noscript.surrogate.glinks.sources", "!@^https?://[^/]+google\\..*/search");
pref("noscript.surrogate.qs.sources", "edge.quantserve.com");
pref("noscript.surrogate.qs.replacement", "window.quantserve=function(){}");
pref("noscript.surrogate.uniblue.sources", "!@.uniblue.com .liutilities.com");
pref("noscript.surrogate.uniblue.replacement", "for each(let l in document.links)if(/^https:\/\/store\./.test(l.href)){l.setAttribute('href',l.href.replace(/.*?:/, ''));l.parentNode.replaceChild(l,l)}");
pref("noscript.surrogate.yieldman.sources", "*.yieldmanager.com");
pref("noscript.surrogate.yieldman.replacement", "rmAddKey=rmAddCustomKey=rmShowAd=rmShowPop=rmShowInterstitial=rmGetQueryParameters=rmGetSize=rmGetWindowUrl=rmGetPubRedirect=rmGetClickUrl=rmReplace=rmTrim=rmUrlEncode=rmCanShowPop=rmCookieExists=rmWritePopFrequencyCookie=rmWritePopExpirationCookie=flashIntalledCookieExists=writeFlashInstalledCookie=flashDetection=rmGetCookie=function(){}");
pref("noscript.surrogate.popunder.sources", "@^http:\\/\\/[\\w\\-\\.]+\.[a-z]+ wyciwyg:");
pref("noscript.surrogate.popunder.replacement", "(function(){var cookie=document.__proto__.__lookupGetter__('cookie');document.__proto__.__defineGetter__('cookie',function() {var c='; popunder=yes; popundr=yes; setover18=1';return (cookie.apply(this).replace(c,'')+c).replace(/^; /, '')});var fid='_FID_'+(Date.now().toString(16));var open=window.__proto__.open;window.__proto__.open=function(url,target,features){try{if(!(/^_(?:top|parent|self)$/i.test(target)||target in frames)){var suspSrc,suspCall,ff=[],ss=new Error().stack.split('\\n').length;if(/popunde?r/i.test(target))return ko();for(var f,ev,aa=arguments;stackSize-->2&&aa.callee&&(f=aa.callee.caller)&&ff.indexOf(f)<0;ff.push(f)){aa=f.arguments;if(!aa)break;ev=aa[0];suspCall=f.name=='doPopUnder';if(!suspSrc)suspSrc=suspCall||/(?:\\bpopunde?r|\\bfocus\\b.*\\bblur|\\bblur\\b.*\\bfocus|[pP]uShown)\\b/.test(f.toSource());if(suspCall||ev&&typeof ev=='object'&&('type' in ev)&&ev.type=='click'&&ev.button===0&&(ev.currentTarget===document||('tagName' in ev.currentTarget)&&'body'==ev.currentTarget.tagName.toLowerCase())&&!(('href' in ev.target)&&ev.target.href&&(ev.target.href.indexOf(url)===0||url.indexOf(ev.target.href)===0))){if(suspSrc)return ko();}}}}catch(e){}return open.apply(null, arguments);function ko(){var fr=document.getElementById(fid)||document.body.appendChild(document.createElement('iframe'));fr.id=fid;fr.src='data:text/html,';fr.style.display='none';var w=fr.contentWindow;w.blur=function(){};return w;}}})()");
pref("noscript.surrogate.popunder.exceptions", ".meebo.com");
pref("noscript.surrogate.imdb.sources", "@*.imdb.com/video/*");
pref("noscript.surrogate.imdb.replacement", "addEventListener('DOMContentLoaded',function(ev){ad_utils.render_ad=function(w){w.location=w.location.href.replace(/.*\\bTRAILER=([^&]+).*/,'$1')}},true)");
pref("noscript.surrogate.nscookie.sources", "@*.facebook.com");
pref("noscript.surrogate.nscookie.replacement", "document.cookie='noscript=; domain=.facebook.com; path=/; expires=Thu, 01-Jan-1970 00:00:01 GMT;'");
pref("noscript.surrogate.imagebam.replacement", "(function(){if(\"over18\" in window){var _do=doOpen;doOpen=function(){};over18();doOpen=_do}else{var e=document.getElementById(Array.slice(document.getElementsByTagName(\"script\")).filter(function(s){return !!s.innerHTML})[0].innerHTML.match(/over18[\\s\\S]*?'([^']+)/)[1]);e.style.display='none'}})()");
pref("noscript.surrogate.imagebam.sources", "!@*.imagebam.com");
pref("noscript.surrogate.imagehaven.replacement", "['agreeCont','TransparentBlack'].forEach(function(id){var o=document.getElementById(id);if(o)o.style.display='none'})");
pref("noscript.surrogate.imagehaven.sources", "!@*.imagehaven.net");
pref("noscript.surrogate.interstitialBox.replacement", "__defineSetter__('interstitialBox',function(){});__defineGetter__('interstitialBox',function(){return{}})");
pref("noscript.surrogate.interstitialBox.sources", "@*.imagevenue.com");
pref("noscript.surrogate.googleThumbs.replacement", "(function(){var ss=document.getElementsByTagName('script');var s,t,m,id,i;for(var j=ss.length;j-->0;)if(((s=ss[j])&&(t=s.firstChild&&s.firstChild.nodeValue)&&(id=t.match(/\w+thumb\d+/))&&(m=t.match(/['\"](data:[^'\"]+)/)))&&(i=document.getElementById(id)))i.src=m[1].replace(/\\\\(u[0-9a-f]{4}|x[0-9a-f]{2})/ig,function(a,b){return String.fromCharCode(parseInt(b.substring(1), 16))})})()");
pref("noscript.surrogate.googleThumbs.sources", "!^https?://www\\.google\\.[a-z]+/search");
pref("noscript.surrogate.amo.replacement", "addEventListener('click',function(e){if(e.button)return;var a=e.target.parentNode;var hash=a.getAttribute('data-hash');if(hash){var b=a.parentNode.parentNode;InstallTrigger.install({x:{URL:a.href,IconURL:b.getAttribute('data-icon'),Hash:hash,toString:function(){return a.href}}});e.preventDefault()}},false)");
pref("noscript.surrogate.amo.sources", "!https://addons.mozilla.org/");
pref("noscript.surrogate.ab_adsense.sources", "pagead2.googlesyndication.com");
pref("noscript.surrogate.ab_adsense.replacement", "gaGlobal={}");
pref("noscript.surrogate.ab_adscale.sources", "js.adscale.de");
pref("noscript.surrogate.ab_adscale.replacement", "adscale={}");
pref("noscript.surrogate.ab_adtiger.sources", "^http://ads\\.adtiger\\.");
pref("noscript.surrogate.ab_adtiger.replacement", "adspirit_pid={}");
pref("noscript.surrogate.ab_bidvertiser.sources", "^http://bdv\\.bidvert");
pref("noscript.surrogate.ab_bidvertiser.replacement", "report_error=function(){}");
pref("noscript.surrogate.ab_binlayer.sources", "^http://view\\.binlay(?:er)\\.");
pref("noscript.surrogate.ab_binlayer.replacement", "blLayer={}");
pref("noscript.surrogate.ab_mirago.sources", "^http://intext\\.mirago\\.");
pref("noscript.surrogate.ab_mirago.replacement", "HLSysBannerUrl=''");
pref("noscript.surrogate.ab_mirando.sources", "^http://get\\.mirando\\.");
pref("noscript.surrogate.ab_mirando.replacement", "Mirando={}");
pref("noscript.surrogate.facebook_connect.sources", "connect.facebook.net/en_US/all.js");
pref("noscript.surrogate.facebook_connect.replacement", "FB=function(){if(typeof Proxy==='undefined'){var f=arguments.callee;return f.__noSuchMethod__=f.Event=f;}var p=Proxy.createFunction({get:function(proxy, name){return name in Object.prototype?Object.prototype[name]:p;}},function(){return p;});return p;}();");
pref("noscript.surrogate.revsci.sources", "js.revsci.net");
pref("noscript.surrogate.revsci.replacement", "rsinetsegs=[];DM_addEncToLoc=DM_tag=function(){};");
pref("noscript.surrogate.adriver.sources", "ad.adriver.ru/cgi-bin/erle.cgi");
pref("noscript.surrogate.adriver.replacement", "if(top!==self&&top.location.href===location.href)setTimeout('try{document.close();}catch(e){}',100)");
pref("noscript.surrogate.twitter.sources", "platform.twitter.com");
pref("noscript.surrogate.twitter.replacement", "twttr=function(){if(typeof Proxy==='undefined'){var f=arguments.callee;return f.__noSuchMethod__=f.events=f.anywhere=f};var p=Proxy.createFunction({get:function(proxy, name){return name in Object.prototype?Object.prototype[name]:p;}},function(){return p;});return p;}();");
pref("noscript.surrogate.plusone.sources", "apis.google.com/js/plusone.js");
pref("noscript.surrogate.plusone.replacement", "gapi=function(){if(typeof Proxy==='undefined'){var f=arguments.callee;return f.__noSuchMethod__=f.plusone=f;}var p=Proxy.createFunction({get:function(proxy, name){return name in Object.prototype?Object.prototype[name]:p;}},function(){return p;});return p;}();");
pref("noscript.surrogate.disqus-theme.sources", ">.disqus.com/*/build/themes/t_c4ca4238a0b923820dcc509a6f75849b.js*");
pref("noscript.surrogate.disqus-theme.replacement", "DISQUS.dtpl.actions.register('comments.reply.new.onLoadingStart', function() { DISQUS.dtpl.actions.remove('comments.reply.new.onLoadingStart'); DISQUS.dtpl.actions.remove('comments.reply.new.onLoadingEnd');});");
pref("noscript.surrogate.skimlinks.sources", ".skimlinks.com/api/");
pref("noscript.surrogate.skimlinks.replacement", "window.skimlinks=function(){}");

pref("noscript.placeholderMinSize", 32);
pref("noscript.placeholderLongTip", true);

pref("noscript.compat.evernote", true);
pref("noscript.compat.gnotes", true);

pref("noscript.forbidXSLT", true);

pref("noscript.oldStylePartial", false);
pref("noscript.proxiedDNS", 0);
pref("noscript.placesPrefs", false);

pref("noscript.ABE.enabled", true);
pref("noscript.ABE.siteEnabled", false);
pref("noscript.ABE.allowRulesetRedir", false);
pref("noscript.ABE.legacyPrompt", false);
pref("noscript.ABE.disabledRulesetNames", "");
pref("noscript.ABE.skipBrowserRequests", true);
pref("noscript.ABE.notify", true);
pref("noscript.ABE.notify.namedLoopback", false);
pref("noscript.ABE.wanIpAsLocal", true);
pref("noscript.ABE.wanIpCheckURL", "https://secure.informaction.com/ipecho/");
pref("noscript.ABE.localExtras", "");

pref("noscript.asyncNetworking", true);
pref("noscript.inclusionTypeChecking", true);
pref("noscript.inclusionTypeChecking.exceptions", "https://scache.vzw.com/ http://cache.vzw.com .sony-europe.com .amazonaws.com lesscss.googlecode.com/files/ .hp-ww.com");
pref("noscript.inclusionTypeChecking.checkDynamic", false);
pref("noscript.nosniff", true);

pref("noscript.recentlyBlockedCount", 10);
pref("noscript.showRecentlyBlocked", true);
pref("noscript.recentlyBlockedLevel", 0);

pref("noscript.STS.enabled", true);
pref("noscript.STS.expertErrorUI", false);

pref("noscript.frameOptions.enabled", true);
pref("noscript.frameOptions.parentWhitelist", "https://mail.google.com/*");
pref("noscript.logDNS", false);


pref("noscript.subscription.lastCheck", 0);
pref("noscript.subscription.checkInterval", 24);
pref("noscript.subscription.trustedURL", "");
pref("noscript.subscription.untrustedURL", "");

pref("noscript.siteInfoProvider", "http://noscript.net/about/%utf8%;%ace%");
pref("noscript.alwaysShowObjectSources", false);

pref("noscript.ef.enabled", false);

pref("noscript.showBlankSources", false);
pref("noscript.preset", "medium");

pref("noscript.forbidBGRefresh", 1);
pref("noscript.forbidBGRefresh.exceptions", ".mozilla.org");

pref("noscript.toStaticHTML", true);
pref("noscript.liveConnectInterception", true);
pref("noscript.audioApiInterception", true);

pref("noscript.doNotTrack.enabled", true);
pref("noscript.doNotTrack.exceptions", "");
pref("noscript.doNotTrack.forced", "");

pref("noscript.ajaxFallback.enabled", true);
pref("noscript.sync.enabled", false);

pref("noscript.ABE.rulesets.SYSTEM", "# Prevent Internet sites from requesting LAN resources.\r\nSite LOCAL\r\nAccept from LOCAL\r\nDeny");
pref("noscript.ABE.rulesets.USER", "# User-defined rules. Feel free to experiment here.\r\n");
pref("noscript.ABE.migration", 0);

pref("noscript.smartClickToPlay", true);