//  **** BEGIN LICENSE BLOCK ****
//  Copyright(c) 2005 Adam Judson
//
//  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  Portions of this code have been based upon 
//  LiveHttpHeaders  - http://livehttpheaders.mozdev.org
//  Copyright(c) 2002-2003 Daniel Savard.
//  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
//
//  TamperData: 
//  - track and modify http requests and responses
//
//  This program is free software; you can redistribute it and/or modify it under
//  the terms of the GNU General Public License as published by the Free
//  Software Foundation; either version 2 of the License, or (at your option)
//  any later version.
//
//  This program is distributed in the hope that it will be useful, but
//  WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
//  or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
//  more details.
//
//  You should have received a copy of the GNU General Public License along with
//  this program; if not, write to the Free Software Foundation, Inc., 59 Temple
//  Place, Suite 330, Boston, MA 02111-1307 USA
//
//  **** END LICENSE BLOCK ****


var oTamper;
function startTamper() {
   oTamper = new Tamper();
   oTamper.start();
}

function stopTamper() {
   oTamper.stop();
   delete oTamper;
   oTamper = null;
}

function Tamper() {
}

Tamper.POST_DATA = "POSTDATA";

Tamper.prototype = {

   preferences : new TamperPreferences(),

   tamper : false,

   set isTampering(value) {
      this.tamper = value;
      this.gui.toggleTampering(this.tamper);
   },
   get isTampering() {
      return this.tamper;
   },

   // Initialisation and termination functions
   start : function() {
      this.requests = new Array();
      this.gui = new TamperGui();
      this.gui.start(this);
      // disable html validator if it's running
      if (this.preferences.disableTidyExtension()) {
         this.gui.alertTidyDisable();
      }
      this.addToListener();
   },
   
   stop : function() {
      this.removeFromListener();
      this.gui.stop();
      this.gui = null;
      this.list = null;
      this.requests = null;
   },

   startTampering : function() {
      this.isTampering = true;
   },

   stopTampering : function() {
      this.isTampering = false;
   },


   onLoadHandler : function(event, uri) {
      if (uri) {
      for (var i = this.requests.length - 1; i >= 0; i--) {
         if ((!this.requests[i].onLoadMillis) && (this.requests[i].uri == uri)) {
            this.requests[i].setOnLoadTime(new Date());
            break;
         }
      }
      }
   },

   clearResults : function() {
      this.requests = new Array();
      this.gui.clear(this);
   },

   // This is the observerService's observe listener.
   observe: function(aSubject, aTopic, aData) {
      if (aTopic == 'http-on-modify-request') {
         aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
         this.onModifyRequest(aSubject);
      } else if (aTopic == 'http-on-examine-response') {
         aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
         this.onExamineResponse(aSubject);
      } else if (aTopic == "tamper-data-on-load") {
         this.onLoadHandler(aSubject, aData);
      }
   },
   
   saveAll: function(title) {
      saveAs(this.getAll(),title);
   },
   
   saveSelection: function(title) {
      saveAs(this.getSelection(),title);
   },

   shouldTamper : function(uri) {
      return this.isTampering && (this.preferences.shouldTamperImages || (uri.search(/^[^?]*(\.gif|\.jpg|\.png|\.ico|\.css|\.js)(\?.*|$)/i) == -1));
   },

   onModifyRequest : function (oHttp) {
      var uri = oHttp.URI.asciiSpec;

      // make sure we are caching
      this.forceCaching(oHttp);
      var loadFlags = this.getStringVersionOfLoadFlags(oHttp.loadFlags);
      var loadFromCache = this.isLoadFromCache(oHttp.loadFlags);
      var cancelled = false;
      if (!loadFromCache) {

         // if we are replaying this, then replace all of the headers with the 
         // saved copy
         this.modifyForReplay(uri, oHttp);

         // tamper with request here
         if (this.shouldTamper(uri)) {
            var retVal = this.gui.confirm(uri);
            if (retVal == this.gui.TAMPER) {
               window.openDialog("chrome://tamperdata/content/tamperPopup.xul", "Tamper Popup", "chrome,resizable=yes,scrollbars=yes,status=yes,modal=yes", oHttp);
            } else if (retVal == this.gui.ABORT) {
               oHttp.cancel(Components.results.NS_BINDING_ABORTED);
               cancelled = true;
            }
         }
      }
      // Get the request headers
      var visitor = new HeaderInfoVisitor(oHttp);
      var requestHeaders = visitor.visitRequest();
      var postData = visitor.getPostData();
      var postBodyHeaders = visitor.getPostBodyHeaders();
      var requestResponse = new TamperRequestResponse();
      requestResponse.setRequestData(uri, new Date(), oHttp.requestMethod, requestHeaders, postBodyHeaders, postData, loadFlags);
      if (cancelled) {
         // we cancelled it
         // which really does nothing...
         requestResponse.cancel();
      } else if (loadFromCache) {
         requestResponse.setLoadFromCache();
      }
      this.addRow(requestResponse);
   },

   modifyForReplay : function(uri, request) {
      if (this.replayList && (uri in this.replayList)) {
         var item = this.replayList[uri];
         delete this.replayList[uri];
         var headers = item.requestHeaders;

         this.removeAllHeaders(request);

         // and replace them with the old copy
         for (var oldHeader in headers) {
            request.setRequestHeader(oldHeader, headers[oldHeader], null);
         }
      }
   },

   removeAllHeaders : function(request) {
      function emptyObserver(request) {
         this.oHttp = request;
         this.request = new Array();
      }
      emptyObserver.prototype = {
         visitHeader : function (name, value) {
            this.request[name] = value;
         },
   
         emptyHeaders: function () {
            this.oHttp.visitRequestHeaders(this);
            for (var i in this.request) {
               this.oHttp.setRequestHeader(i, null, false);
            }
         }
      };
      var empty = new emptyObserver(request);
      empty.emptyHeaders();
   },

   addToReplayList : function(uri, headerArray) {
      if (!this.replayList) {
         this.replayList = {};
      }
      this.replayList[uri] = headerArray;
   },

   addRow : function(requestResponse) {
      this.requests.push(requestResponse);
   },

   // most of these never get hit
   getStringVersionOfLoadFlags : function(flags) {
      var flagString = "";
      if (flags & Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE) {
         flagString += "LOAD_BYPASS_CACHE  ";
      }
      if (flags & Components.interfaces.nsIRequest.LOAD_BACKGROUND) {
         flagString += "LOAD_BACKGROUND  ";
      }
      if (flags & Components.interfaces.nsIRequest.INHIBIT_CACHING) {
         flagString += "INHIBIT_CACHING  ";
      }
      if (flags & Components.interfaces.nsIRequest.INHIBIT_PERSISTENT_CACHING) {
         flagString += "INHIBIT_PERSISTENT_CACHING  ";
      }
      if (flags & Components.interfaces.nsICachingChannel.LOAD_BYPASS_LOCAL_CACHE) {
         flagString += "LOAD_BYPASS_LOCAL_CACHE  ";
      }
      if (flags & Components.interfaces.nsICachingChannel.LOAD_ONLY_FROM_CACHE) {
         flagString += "LOAD_ONLY_FROM_CACHE  ";
      }
      if (flags & Components.interfaces.nsICachingChannel.LOAD_ONLY_IF_MODIFIED) {
         flagString += "LOAD_ONLY_IF_MODIFIED  ";
      }
      if (flags & Components.interfaces.nsIRequest.LOAD_FROM_CACHE) {
         flagString += "LOAD_FROM_CACHE  ";
      }
      if (flags & Components.interfaces.nsIRequest.VALIDATE_ALWAYS) {
         flagString += "VALIDATE_ALWAYS ";
      }
      if (flags & Components.interfaces.nsIRequest.VALIDATE_NEVER) {
         flagString += "VALIDATE_NEVER  ";
      }
      if (flags & Components.interfaces.nsIRequest.VALIDATE_ONCE_PER_SESSION) {
         flagString += "VALIDATE_ONCE_PER_SESSION ";
      }
      if (flags & Components.interfaces.nsIChannel.LOAD_DOCUMENT_URI) {
         flagString += "LOAD_DOCUMENT_URI  ";
      }
      if (flags & Components.interfaces.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI) {
         flagString += "LOAD_RETARGETED_DOCUMENT_URI  ";
      }
      if (flags & Components.interfaces.nsIChannel.LOAD_REPLACE) {
         flagString += "LOAD_REPLACE  ";
      }
      if (flags & Components.interfaces.nsIChannel.LOAD_INITIAL_DOCUMENT_URI) {
         flagString += "LOAD_INITIAL_DOCUMENT_URI  ";
      }
      if (flags & Components.interfaces.nsIChannel.LOAD_TARGETED) {
         flagString += "LOAD_TARGETED  ";
      }
      if ((Components.interfaces.nsICachingChannel.LOAD_BYPASS_LOCAL_CACHE_IF_BUSY) && 
          (flags & Components.interfaces.nsICachingChannel.LOAD_BYPASS_LOCAL_CACHE_IF_BUSY)) {
         flagString += "LOAD_BYPASS_LOCAL_CACHE_IF_BUSY ";
      }
      if (!flagString.length) {
         flagString = "LOAD_NORMAL";
      }
      return flagString;
   },

   forceCaching : function(request) {
      // we only care if we were a POST, GET's cache no matter what
      if (request.requestMethod == "POST") {
         if (request.loadFlags & Components.interfaces.nsIRequest.INHIBIT_CACHING) {
            if (this.preferences.forceCaching) {
               request.loadFlags = request.loadFlags & ~Components.interfaces.nsIRequest.INHIBIT_CACHING;
               TamperUtils.log("Forcing cache on request: [" + request.URI.asciiSpec + "]");
            }
         }
      }
   },   

   // this doesn't actually seem to work...
   forceResponseCaching : function(request) {
      // we only care if we were a post, GET's seem to cache not matter what
      if (request.isNoCacheResponse() && request.requestMethod == "POST") {
         if (this.preferences.forceCaching) {
            // get rid of the no-cache response headers
            request.setResponseHeader("Cache-Control", "max-age=3600, must-revalidate", false);
            request.setResponseHeader("Pragma", "", false);
            request.setResponseHeader("Expires", "", false);
            TamperUtils.log("Forcing cache on response: [" + request.URI.asciiSpec + "]");
         }
      }
   },   

   isLoadFromCache : function(flags) {
      return flags & Components.interfaces.nsIRequest.LOAD_FROM_CACHE;
   },
   
   onExamineResponse : function (oHttp) {
      var uri = oHttp.URI.asciiSpec;

      // Get the request headers
      var visitor = new HeaderInfoVisitor(oHttp);
      var requestHeaders = visitor.visitRequest();
      var postData = requestHeaders[Tamper.POST_DATA];
      if (postData !== null) {
         delete requestHeaders[Tamper.POST_DATA];
      }

      var responseHeaders = visitor.visitResponse();

      var token;
      if (oHttp instanceof Components.interfaces.nsICachingChannel) {
         try {
            token = oHttp.cacheToken;
         } catch (e) {
            TamperUtils.log("Problem with cacheToken: " + uri + " - " + e);
         }
      }
      
      var requestResponse = new TamperRequestResponse();
      requestResponse.setResponseData(uri, new Date(), oHttp.requestMethod, oHttp.contentLength, oHttp.responseStatus, oHttp.responseStatusText, oHttp.contentType, responseHeaders, requestHeaders);
      var oldRequest = this.matchAndMergeRequest(requestResponse);
      if (oldRequest && token) {
         oldRequest.setCacheData(token, uri);
      }
   },

   matchAndMergeRequest : function(requestResponse) {
      // go backwards, otherwise canceled requests will be filled in by latter refreshes
      // of course there may be problems in this direction too...
      for (var i = this.requests.length - 1; i >= 0; i--) {
         if (this.requests[i].needsResponse() && this.requests[i].matches(requestResponse)) {
            this.requests[i].merge(requestResponse);
            this.gui.tree.invalidateRow(i);
            return this.requests[i];
         }
      }
      return null;
   },

   QueryInterface: function(iid) {
    if (!iid.equals(Components.interfaces.nsISupports) &&
        !iid.equals(Components.interfaces.nsIHttpNotify) &&
        !iid.equals(Components.interfaces.nsIObserver)) {
          throw Components.results.NS_ERROR_NO_INTERFACE;
      }
      return this;
    },

   addToListener: function() {
      // Register new request and response listener
      // Should be a new version of  Mozilla/Phoenix (after september 15, 2003)
      var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      observerService.addObserver(this, "http-on-modify-request",   false);
      observerService.addObserver(this, "http-on-examine-response", false);
      observerService.addObserver(this, "tamper-data-on-load",      false);
   },
   
   removeFromListener: function() {
      // Unregistering listener
      var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      observerService.removeObserver(this, "tamper-data-on-load");
      observerService.removeObserver(this, "http-on-examine-response");
      observerService.removeObserver(this, "http-on-modify-request");
   }
};

function HeaderInfoVisitor (oHttp) {
  this.oHttp = oHttp;
  this.headers = new Array();
}

HeaderInfoVisitor.prototype =  {
   extractPostData : function(visitor, oHttp) {
      function postData(stream) {
         // Scriptable Stream Constants
         this.seekablestream = stream;
         this.stream = TamperUtils.createScriptableInputStream(this.seekablestream);
         
         // Check if the stream has headers
         this.hasheaders = false;
         this.body = 0;
         this.isBinary = true;
         if (this.seekablestream instanceof Components.interfaces.nsIMIMEInputStream) {
            this.seekablestream.QueryInterface(Components.interfaces.nsIMIMEInputStream);
            this.hasheaders = true;
            this.body = -1; // Must read header to find body
            this.isBinary = false;
         } else if (this.seekablestream instanceof Components.interfaces.nsIStringInputStream) {
            this.seekablestream.QueryInterface(Components.interfaces.nsIStringInputStream);
            this.hasheaders = true;
            this.body = -1; // Must read header to find body
         }
      }

      postData.prototype = {
         rewind: function() {
            this.seekablestream.seek(0,0);
         },

         tell: function() {
            return this.seekablestream.tell();
         },
   
         readLine: function() {
            var line = "";
            var size = this.stream.available();
            for (var i = 0; i < size; i++) {
               var c = this.stream.read(1);
               if (c == '\r') {
               } else if (c == '\n') {
                  break;
               } else {
                  line += c;
               }
            }
            return line;
         },
   
         // visitor can be null, function has side-effect of setting body
         visitPostHeaders: function(visitor) {
            if (this.hasheaders) {
               this.rewind();
               var line = this.readLine();
               while(line) {
                  if (visitor) {
                     // TamperUtils.log("Got a post header: [" + line + "]");
                     var tmp = line.match(/^([^:]+):\s?(.*)/);
                     // match can return null...
                     if (tmp) {
                        visitor.visitPostHeader(tmp[1], tmp[2]);
                        // if we get a tricky content type, then we are binary
                        // e.g. Content-Type=multipart/form-data; boundary=---------------------------41184676334
                        if (!this.isBinary && tmp[1].toLowerCase() == "content-type" && tmp[2].indexOf("multipart") != "-1") {
                           this.isBinary = true;
                        }
                     } else {
                        visitor.visitPostHeader(line, "");
                     }
                  }
                  line = this.readLine();
               }
               this.body = this.tell();
            }
         },
   
         getPostBody: function(visitor) {
            // Position the stream to the start of the body
            if (this.body < 0 || this.seekablestream.tell() != this.body) {
               this.visitPostHeaders(visitor);
            }
            
            var size = this.stream.available();
            if (size == 0 && this.body != 0) {
               // whoops, there weren't really headers..
               this.rewind();
               visitor.clearPostHeaders();
               this.hasheaders = false;
               this.isBinary   = false;
               size = this.stream.available();
            }
            var postString = "";
            try {
               // This is to avoid 'NS_BASE_STREAM_CLOSED' exception that may occurs
               // See bug #188328.
               for (var i = 0; i < size; i++) {
                  var c = this.stream.read(1);
                  c ? postString += c : postString+='\0';
               }
            } catch (ex) {
               return "" + ex;
            } finally {
               this.rewind();
               // this.stream.close();
            }
            // strip off trailing \r\n's
            while (postString.indexOf("\r\n") == (postString.length - 2)) {
               postString = postString.substring(0, postString.length - 2);
            }
            return postString;
         }
      };
   
      // Get the postData stream from the Http Object 
      try {
         // Must change HttpChannel to UploadChannel to be able to access post data
         oHttp.QueryInterface(Components.interfaces.nsIUploadChannel);
         // Get the post data stream
         if (oHttp.uploadStream) {
            // Must change to SeekableStream to be able to rewind
            oHttp.uploadStream.QueryInterface(Components.interfaces.nsISeekableStream);
            // And return a postData object
            return new postData(oHttp.uploadStream);
         } 
      } catch (e) {
         TamperUtils.log("Got an exception retrieving the post data: [" + e + "]");
         return "crap";
      }
      return null;
   },
   
   visitHeader : function(name, value) {
      this.headers[name] = value;
   },

   visitPostHeader : function(name, value) {
      if (!this.postBodyHeaders) {
         this.postBodyHeaders = {};
      }
      this.postBodyHeaders[name] = value;
   },

   clearPostHeaders : function() {
      if (this.postBodyHeaders) {
         delete this.postBodyHeaders;
      }
   },

   visitRequest : function () {
      this.headers = {};
      this.oHttp.visitRequestHeaders(this);
      
      // There may be post data in the request
      var postData = this.extractPostData(this, this.oHttp);
      if (postData) {
         var postBody = postData.getPostBody(this);
         if (postBody !== null) {
            this.postBody = {body : postBody, binary : postData.isBinary};
         }
      }
      return this.headers;
   },

   getPostData : function() {
      return this.postBody ? this.postBody : null;
   },

   getPostBodyHeaders : function() {
      return this.postBodyHeaders ? this.postBodyHeaders : null;
   },
   
   visitResponse : function () {
      this.headers = new Array();
      this.oHttp.visitResponseHeaders(this);
      return this.headers;
   }
};
