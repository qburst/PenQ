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


// Request/Response object
function TamperRequestResponse() {
}

TamperRequestResponse.XML_HEADER = "<?xml version=\"1.0\"?>\n" +
                                  "   <!-- Export of tamperdata transacions -->\n" +
                                  "   <tdRequests>\n";

TamperRequestResponse.XML_TRAILER = "</tdRequests>";

TamperRequestResponse.prototype = {
   __proto__ : new TamperLanguage("tamper.request."),

   // request stuff
   time: null,
   millis : null,
   onLoadMillis : null,
   uri : null,
   requestMethod : "?",   
   requestHeaders : null,
   postBodyHeaders : null,
   // this is a string
   requestPostData : null,
   requestPostDataIsBinary : false,
   // this isn't
   requestPostDataArray : null,

   elapsedTime : 0,  
   totalTime : 0,
   responseHeaders : null, 
   loadFlags : null,
   status : "pending",
   statusText : "",
   contentSize : "unknown",
   mimeType : "unknown",
   STATUS_FROM_CACHE : TamperLang.instance().getString("tamper.request.from.cache"),
   cacheClient : "HTTP",
   cacheData : null,

   needsResponse : function() {
      return (this.status == "pending") || (this.status == this.STATUS_FROM_CACHE);
   },

   matches : function(tamperResponse) {
      if (this.uri == tamperResponse.uri && this.requestMethod == tamperResponse.requestMethod) {
         return true;
      }
      return false;
   },

   merge : function(tamperResponse) {
      this.elapsedTime = tamperResponse.millis - this.millis;
      this.status = tamperResponse.status;
      this.statusText = tamperResponse.statusText;
      this.contentSize = tamperResponse.contentSize;
      this.mimeType = tamperResponse.mimeType;
      this.responseHeaders = tamperResponse.responseHeaders;

      // overwrite the old headers with the values from the response
      // not sure I like this
      // we could probably just do:
      // this.requestHeaders = tamperResponse.requestHeaders;
      // 
      // things that are different in request/response
      // - authentication is cached in ff, and is not added until after our hook
      // - pragma cache, and cache control are added after our hook on a forced refresh
      // Accept seems to be pre-pended to after our hook, but only sometimes (images?)
      for (var header in tamperResponse.requestHeaders) {
         this.requestHeaders[header] = tamperResponse.requestHeaders[header];
      }
      // what about request headers in the post body?
   },

   setCacheData : function(cacheToken, uri) {
      if (cacheToken instanceof Components.interfaces.nsICacheEntryDescriptor) {
         this.cacheClient = cacheToken.clientID;
         this.cacheKey    = cacheToken.key;
/*
         cacheToken.visitMetaData(this);
         // trigger the retrieve now
         var service = Components.classes["@mozilla.org/network/cache-service;1"].getService(Components.interfaces.nsICacheService);
         var httpCacheSession = service.createSession(this.cacheClient, 0, true);
         httpCacheSession.doomEntriesIfExpired = false;
         httpCacheSession.asyncOpenCacheEntry(this.cacheKey, Components.interfaces.nsICache.ACCESS_READ, this);
*/
      } else {
         // need to do something here...
         TamperUtils.log("Cache token is bad:" + uri);
      }
   },

   hasCachedData : function() {
      if (this.cacheData) {
         return true;
      } else if (this.cacheKey) {
         this.getCachedResponse();
         return true;
      } else {
         return false;
      }
   },

   getCachedResponse : function() {
      if (!this.cacheData) {
         // try to populated the cache data from the cacheToken
         if (this.cacheKey) {
            var service = Components.classes["@mozilla.org/network/cache-service;1"].getService(Components.interfaces.nsICacheService);
            var httpCacheSession = service.createSession(this.cacheClient, 0, true);
            httpCacheSession.doomEntriesIfExpired = false;
            try {
               // better to throw an exception than hang
               var blocking = false;
               var cacheEntryDescriptor = httpCacheSession.openCacheEntry(this.cacheKey, Components.interfaces.nsICache.ACCESS_READ, blocking);
               if (cacheEntryDescriptor) {
                  if (cacheEntryDescriptor.isStreamBased()) {
                     // open the stream, and copy the data
                     var inputStream = cacheEntryDescriptor.openInputStream(0);
                     // Create a scriptable stream
                     var data = TamperUtils.readAll(inputStream, true);
                     this.cacheData = data;
                  }
                  // we keep the extracted data, so delete these so we don't try again
                  delete this.cacheKey;
                  delete this.cacheClient;
      
                  // we might need to convert this data
                  var contentEncoding = this.responseHeaders["Content-Encoding"];
                  if (contentEncoding) {
                     this.rawCacheData = this.cacheData;
                     var ucData = TamperUtils.uncompressStream(cacheEntryDescriptor.openInputStream(0), contentEncoding);
                     if (ucData) {
                        this.cacheData = ucData;
                     }
                  }
                  cacheEntryDescriptor.close();
               } else {
                  TamperUtils.log("Problem retrieving cacheEntryDescriptor");
               }
            } catch (e) {
               // probably failed on openCacheEntry() - because the cache was busy
               TamperUtils.log("Problem in getCachedResponse() [" + this.cacheClient + "][" + this.cacheKey + "] - " + e);
            }
         }
      }
      return this.cacheData;
   },

   setOnLoadTime : function(time) {
      this.onLoadMillis = time.getTime();
      this.totalTime = this.onLoadMillis - this.millis;
   },

   cancel : function() {
      this.elapsedTime = "n/a";
      this.status = this.langString("cancelled");
      this.statusText = this.langString("cancelled");
      this.responseHeaders = new Array();
   },

   setLoadFromCache : function() {
      this.elapsedTime = "0";
      this.status = this.STATUS_FROM_CACHE;
      this.statusText = this.STATUS_FROM_CACHE;
      this.contentSize = "-1";
      this.mimeType = this.langString("unknown");
      this.responseHeaders = new Array();
   },

   setRequestData : function(uri, time, requestMethod, requestHeaders, postBodyHeaders, postData, loadFlags) {
      this.uri = uri;
      this.time = TamperUtils.getTime(time);
      this.millis = time.getTime();
      this.loadFlags = loadFlags;
      this.requestMethod = requestMethod;
      this.requestHeaders = requestHeaders;
      if (postData) {
         this.requestPostData = postData.body;
         this.requestPostDataIsBinary = postData.binary;
         this.postBodyHeaders = postBodyHeaders;
      }
   },

   setResponseData : function(uri, time, requestMethod, contentLength, responseStatus, responseStatusText, contentType, responseHeaders, requestHeaders) {
      this.uri = uri;
      this.millis = time.getTime();
      this.requestMethod = requestMethod;
      this.contentSize = contentLength;
      this.status = responseStatus;
      this.statusText = responseStatusText;
      this.mimeType = contentType;
      this.responseHeaders = responseHeaders;
      this.requestHeaders = requestHeaders;
   },

   getPostData : function() {
      return this.requestPostData;
   },

   getPostBodyHeaders : function() {
      return this.postBodyHeaders;
   },

   isPostDataBinary : function() {
      return this.requestPostDataIsBinary;
   },

   getTotalTime : function() {
      if (this.totalTime > 0)  {
         return this.totalTime;
      } else {
         return this.elapsedTime;
      }
   },

   getPostDataArray : function() {
      if (this.requestPostDataArray == null) {
         if (this.requestPostData) {
            this.requestPostDataArray = {};
            if (!this.requestPostDataIsBinary) {
               var nameValues = String(this.requestPostData).split("&"); 
               for (var i in nameValues) {
                  var nameValue = nameValues[i].split("=");
                  var name = nameValue[0];
                  var val = nameValues[i].substring(nameValue[0].length + 1);
                  this.requestPostDataArray[name] = val;
               }
            } else {
               if (this.postBodyHeaders) {
                  for (var ph in this.requestPostBodyHeaders) {
                     this.requestPostDataArray[ph] = this.requestPostBodyHeaders;
                  }
               }
               this.requestPostDataArray["POST_DATA"] = this.requestPostData;
            }
         }
      }
      return this.requestPostDataArray;
   },

   toString : function() {
      var text = this.time + "[" + this.elapsedTime + this.langString("ms") + "][" + 
                 this.langString("total") + " " + this.getTotalTime() + this.langString("ms") + "] " + 
                 this.langString("status") + ": " + this.status + "[" + this.statusText + "]\n" +
                 this.requestMethod + " " +  
                 this.uri + " " + 
                 this.langString("load.flags") + "[" + this.loadFlags + "] " +  
                 this.langString("content.size") + "[" +  this.contentSize + "] " + 
                 this.langString("mime.type") + "[" + this.mimeType + "]\n";

      if (this.requestHeaders) {
         text += "   " + this.langString("request.headers") + ":\n";
         for (var requestHeader in this.requestHeaders) {
            text += "      " + requestHeader + "[" + this.requestHeaders[requestHeader] + "]\n";
         }
      }
      var postData = this.getPostDataArray();
      if (postData != null) {
         text += "   " + this.langString("post.data") + ":\n";
         for (var name in postData) {
            text += "      " + name + "[" + postData[name] + "]\n";
         }
      }
      if (this.responseHeaders) {
         text += "   " + this.langString("response.headers") + ":\n";
         for (var responseHeader in this.responseHeaders) {
            text += "      " + responseHeader + "[" + this.responseHeaders[responseHeader] + "]\n";
         }
      }
      return text;
   },

   toXML : function() {
      var text = "<tdRequest uri=\"" + escape(this.uri) +"\">";
      text += "<tdStartTime>" + this.time + "</tdStartTime>\n";
      text += "<tdStartTimeMS>" + this.millis + "</tdStartTimeMS>\n";
      text += "<tdElapsedTime>" + this.elapsedTime + "</tdElapsedTime>\n";
      text += "<tdTotalElapsedTime>" + this.getTotalTime() + "</tdTotalElapsedTime>\n";
      text += "<tdStatus>" + this.status + "</tdStatus>\n";
      text += "<tdStatusText>"  + escape(this.statusText) + "</tdStatusText>";
      text += "<tdRequestMethod>"  + this.requestMethod + "</tdRequestMethod>\n";
      text += "<tdContentSize>" + this.contentSize + "</tdContentSize>\n";
      text += "<tdMimeType>" + this.mimeType + "</tdMimeType>\n";

      text += "<tdRequestHeaders>\n";
      if (this.requestHeaders) {
         for (var requestHeader in this.requestHeaders) {
            text += "<tdRequestHeader name=\"" + requestHeader + "\">\n" + 
                    escape(this.requestHeaders[requestHeader]) + "</tdRequestHeader>\n";
         }
      }
      text += "</tdRequestHeaders>";
      text += "<tdPostHeaders>";
      if (this.postBodyHeaders) {
         for (var postHeader in this.postBodyHeaders) {
            text += "<tdPostHeader name=\"" + postHeader + "\">\n" + 
                    escape(this.postBodyHeaders[postHeader]) + "\n</tdPostHeader>\n";
         }
      }
      text += "</tdPostHeaders>\n";
      text += "<tdPostElements>\n";
      var postData = this.getPostDataArray();
      if (postData != null) {
         for (var name in postData) {
            text += "<tdPostElement name=\"" + escape(name) +"\">\n" + 
                    escape(postData[name]) + "\n</tdPostElement>\n";
         }
      }
      text += "</tdPostElements>\n";
      text += "<tdResponseHeaders>";
      if (this.responseHeaders) {
         for (var responseHeader in this.responseHeaders) {
            text += "<tdResponseHeader name=\"" + responseHeader + "\">\n" + 
                    escape(this.responseHeaders[responseHeader]) + "\n</tdResponseHeader>\n";
         }
      }
      text += "</tdResponseHeaders>\n";
      text += "</tdRequest>\n";
      return text;
   },

   // methods for resending the data
   getRefererURI : function() {
      var refURI = null;
      try {
         var ref = this.requestHeaders["Referer"];
         if (ref != null) {
            refURI = Components. classes["@mozilla.org/network/io-service;1"].getService(
                         Components.interfaces.nsIIOService).newURI();
            refURI.spec = ref;
         }
      } catch (ex) {
         // that's too bad
      }
      return refURI;
   },

   // used for replaying the URI
   getPostDataStream : function() {
      // do something different if we are binary?
      if (this.requestPostData != null) {
         const MIME_STREAM_CID = "@mozilla.org/network/mime-input-stream;1";
         const nsIMIMEInputStream = Components.interfaces.nsIMIMEInputStream;
         var mis = Components.classes[MIME_STREAM_CID];
         post = mis.createInstance(nsIMIMEInputStream);
         post.setData(TamperUtils.createStringInputStream(this.requestPostData));

         return post;
      } else {
         return null;
      }
   },

   getHeadersDataStream : function() {
      var myHeaders = "";
      var isFirst = true;
      for (i in this.requestHeaders) {
         myHeaders += i + ":" + this.requestHeaders[i] + "\r\n";
      }            
      return TamperUtils.createStringInputStream(myHeaders);
   },

/*
   onCacheEntryAvailable : function(cacheEntryDescriptor, accessGranted, status) {
      if (status == Components.results.NS_OK) {
         try {
            if (cacheEntryDescriptor.isStreamBased()) {
               // open the stream, and copy the data
               var inputStream = cacheEntryDescriptor.openInputStream(0);
               // Create a scriptable stream
               var data = TamperUtils.readAll(inputStream, true);
               this.cacheData = data;
            }
            // we keep the extracted data, so delete these so we don't try again
            delete this.cacheKey;
            delete this.cacheClient;
   
            // we might need to convert this data
            var contentEncoding = this.responseHeaders["Content-Encoding"];
            if (contentEncoding) {
               this.rawCacheData = this.cacheData;
               var ucData = TamperUtils.uncompressStream(cacheEntryDescriptor.openInputStream(0), contentEncoding);
               if (ucData) {
                  this.cacheData = ucData;
               }
            }
            cacheEntryDescriptor.close();
         } catch (e) {
            // probably failed on openCacheEntry() - because the cache was busy
            TamperUtils.log("Problem in onCacheEntryAvailable() [" + this.cacheClient + "][" + this.cacheKey + "] - " + e);
         }
      } else {
         TamperUtils.log("Cache entry listener failed: " + status);
      }
   }, 

   visitMetaDataElement : function(key, value) {
      TamperUtils.log("Visiting Meta data for [" + this.uri + "] - [" + key + "][" + value + "]");
   },


   QueryInterface: function(iid) {
    if (!iid.equals(Components.interfaces.nsISupports) &&
        !iid.equals(Components.interfaces.nsICacheMetaDataVisitor)) {
          throw Components.results.NS_ERROR_NO_INTERFACE;
      }
      return this;
    },


*/

   mustValidate : function() {
      for (var h in this.requestHeaders) {
         if (h.match(/^(If-Modified-Since|If-None-Match)$/)) {
            return true; 
         }
      }
      return false;
   }
};
