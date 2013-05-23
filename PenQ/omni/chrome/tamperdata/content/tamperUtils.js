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

var TamperUtils = {};

TamperUtils.preferences = new TamperPreferences();


TamperUtils.escapeValue = function(value) {
   // should we be putting +'s in for spaces?
   // if so we need to do it before escape
   // changes them into %20's
   return escape(value);
};

TamperUtils.unescapeValue = function(value) {
   return unescape(value).replace(/\+/g, " ");
};

TamperUtils.encode64 = function(value) {
   return btoa(value);
};

TamperUtils.decode64 = function(value) {
   // in case the value is no good...
   try {
      return atob(value);
   } catch (e) {
      // that's too bad
      return value;
   }
};

TamperUtils.HEX     = "hex";
TamperUtils.DECIMAL = "decimal";

TamperUtils.hexHTMLValue = function(value) {
   return TamperUtils.translate(value, TamperUtils.HEX);
};

TamperUtils.decimalHTMLValue = function(value) {
   return TamperUtils.translate(value, TamperUtils.DECIMAL);
};

TamperUtils.unHTMLValue = function(value) {
   return TamperUtils.untranslate(value);
};

TamperUtils.translate = function(value, how) {
   var hex = (how == TamperUtils.HEX);
   var newValue = "";
   for (var index = 0; index < value.length; index++) { 
      var charcode = value.charCodeAt(index);
      newValue += "&#";  
      if (hex) {
         newValue += "x";  
         newValue += TamperUtils.decimalToHex(charcode);
      } else {
         newValue += charcode;
      }
      newValue += ";";  
   }
   return newValue;
};

TamperUtils.untranslate  = function(value) {
   var newValue = value;
   var noHex = '"' + value.replace(/&#[X|x]([^&]*);/g, '" + String.fromCharCode(0x$1) + "') + '"';
   var nothing = noHex.replace(/&#([^&]*);/g, '" + String.fromCharCode($1) + "');
   newValue = eval(nothing);
   return newValue;
};

TamperUtils.HEX_DIGITS = "0123456789ABCDEF";
TamperUtils.decimalToHex = function(decimal) {
   var hex = TamperUtils.HEX_DIGITS.substr(decimal & 15, 1);
   while(decimal > 15) {
      decimal >>= 4;
      hex = TamperUtils.HEX_DIGITS.substr(decimal & 15, 1) + hex;
   }
   return hex;
};

TamperUtils.log = function(message) {
   if (TamperUtils.preferences.isDebug()) {
      var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
      consoleService.logStringMessage("TamperData: " + message);
   }
};

TamperUtils.loadFile = function(promptText) {
   var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
   var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
   var streamIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
   var validFile = false;
   
   fp.init(window, promptText, fp.modeOpen);
   fp.appendFilters(fp.filterText);

   var input;   
   if (fp.show() != fp.returnCancel) {
      stream.init(fp.file, 0x01, 0444, null);
      streamIO.init(stream);
      input = streamIO.read(stream.available());
      streamIO.close();
      stream.close();
   }
   return input;
};

TamperUtils.writeFile = function(promptText, data) {
   var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
   var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
   
   fp.init(window, promptText, fp.modeSave);
   fp.appendFilters(fp.filterText);
   
   if (fp.show() != fp.returnCancel) {
      if (fp.file.exists()) {
         fp.file.remove(true);
      }
      fp.file.create(fp.file.NORMAL_FILE_TYPE, 0666);
   
      stream.init(fp.file, 0x02, 0x200, null);
      stream.write(data, data.length);
      stream.close();
   }
};

TamperUtils.getTime = function(time) {
   var curr_hour = time.getHours();
   var curr_min = time.getMinutes();
   if (curr_min < 10) {
      curr_min = "0" + curr_min;
   }
   
   var curr_sec = time.getSeconds();
   if (curr_sec < 10) {
      curr_sec = "0" + curr_sec;
   }

   var curr_ms = time.getMilliseconds();
   if (curr_ms < 10) {
      curr_ms = "00" + curr_ms;
   } else if (curr_ms < 100) {
      curr_ms = "0" + curr_ms;
   }
   return curr_hour + ":" + curr_min + ":" + curr_sec + "." + curr_ms;
};

TamperUtils.createStringInputStream = function(data) {
   var sis = Components.classes["@mozilla.org/io/string-input-stream;1"];
   var tmpStream = sis.createInstance(Components.interfaces.nsIStringInputStream);
   tmpStream.setData (data, data.length);
   tmpStream.QueryInterface(Components.interfaces.nsIInputStream);
   return tmpStream;
};

// e.g. z, "gzip",

TamperUtils.uncompress = function(data, from) {
   var stream = TamperUtils.createStringInputStream(data);
   return TamperUtils.uncompressStream(stream, from);
};

TamperUtils.uncompressStream = function(dataStream, from) {
   var className = "@mozilla.org/streamconv;1?from=" + from + "&to=uncompressed";
   var converter = Components.classes[className].createInstance(Components.interfaces.nsIStreamConverter);
   var listener = {
      data : "",
      onDataAvailable : function(request, context, stream, offset, count) {
         this.data = this.data + TamperUtils.readAll(stream, true);   
      },
      onStartRequest : function(request, context) {
      },
      onStopRequest : function(request, context, statusCode) {
      },
      QueryInterface: function(iid) {
         if (!iid.equals(Components.interfaces.nsISupports) &&
              !iid.equals(Components.interfaces.nsIStreamListener) &&
              !iid.equals(Components.interfaces.nsIRequestObserver)) {
                throw Components.results.NS_ERROR_NO_INTERFACE;
            }
         return this;
      }
   };

   // fake uri needed to create a channel
   var uri = Components.classes["@mozilla.org/network/simple-uri;1"].createInstance(Components.interfaces.nsIURI);
   // uri.scheme = "http://gunzip";
   uri.scheme = "http";

   // fake channel needed to create a request
   var chan = Components.classes["@mozilla.org/network/input-stream-channel;1"].createInstance(Components.interfaces.nsIInputStreamChannel);
   chan.QueryInterface(Components.interfaces.nsIChannel);
   chan.setURI(uri);
   chan.contentLength = -1;
   chan.contentType = from;
   chan.contentStream = null;

   var request = chan.QueryInterface(Components.interfaces.nsIRequest);
   if (converter.asyncConvertData) {
      // 1.5
      converter.asyncConvertData(from, "uncompressed", listener, null);
   } else {
      // < 1.5
      converter.AsyncConvertData(from, "uncompressed", listener, null);
   }
   converter.onStartRequest(request, null);
   try {
      converter.onDataAvailable(request, null, dataStream, 0, dataStream.available());
   } catch (e) {
      TamperUtils.log("Caught an exception trying to convert: " + e);
   }
   converter.onStopRequest(request, null, {});
   return listener.data;
};

TamperUtils.readAll = function(inputStream, raw) {
   var scriptableDataStream = TamperUtils.createScriptableInputStream(inputStream);
   var data = "";
   if (raw) {
      var size = scriptableDataStream.available();
      for (var i = 0; i < size; i++) {
         var c = scriptableDataStream.read(1);
         c ? data += c : data += '\0';
      }
   } else {
      data = scriptableDataStream.read(scriptableDataStream.available());
   }
   scriptableDataStream.close();
   return data;
};

TamperUtils.createScriptableInputStream = function(inputStream) {
   var stream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
   stream.init(inputStream);
   return stream;
};

TamperUtils.copyToClipboard = function(text) {
   if (text) {
      try {
         const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
         clipboardHelper.copyString(text);
      } catch(e) {
         // that's too bad
      }
   }
};

/*

const NS_ERROR_SEVERITY_ERROR = 1;
const NS_ERROR_MODULE_BASE_OFFSET = 0x45;
NS_ERROR_GENERATE_FAILURE = function(module, code) {
   // something is missing here, I'm getting negative numbers - not sure how to fix it
   return (((NS_ERROR_SEVERITY_ERROR)<<31) | ((module + NS_ERROR_MODULE_BASE_OFFSET)<<16) | code);
}

const NS_ERROR_MODULE_NETWORK = 6;
 
TamperUtils.getErrorKey = function(exception) {
   // error service didn't work...
   var result = exception.result;
   var errorKey = "Unknown";

   // some errors that aren't in Components
   const NS_ERROR_CACHE_KEY_NOT_FOUND = NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_NETWORK, 61);
   const NS_ERROR_CACHE_WAIT_FOR_VALIDATION = NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_NETWORK, 64);
   const NS_ERROR_CACHE_ENTRY_DOOMED = NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_NETWORK, 65);
   const NS_ERROR_CACHE_READ_ACCESS_DENIED = NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_NETWORK, 66)
   const NS_ERROR_CACHE_WRITE_ACCESS_DENIED = NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_NETWORK, 67)
   const NS_ERROR_CACHE_IN_USE = NS_ERROR_GENERATE_FAILURE(NS_ERROR_MODULE_NETWORK, 68)


   switch(result) {
   case Components.results.NS_ERROR_NOT_INITIALIZED:
      errorKey = "NS_ERROR_NOT_INITIALIZED";
      break;

   case Components.results.NS_ERROR_ALREADY_INITIALIZED:
      errorKey="NS_ERROR_ALREADY_INITIALIZED";
      break;
      
   case Components.results.NS_ERROR_NOT_IMPLEMENTED:
      errorKey="NS_ERROR_NOT_IMPLEMENTED";
      break;
      
   case Components.results.NS_NOINTERFACE:
      errorKey="NS_NOINTERFACE";
      break;
      
   case Components.results.NS_ERROR_NO_INTERFACE:
      errorKey="NS_ERROR_NO_INTERFACE";
      break;
      
   case Components.results.NS_ERROR_INVALID_POINTER:
      errorKey="NS_ERROR_INVALID_POINTER";
      break;
      
   case Components.results.NS_ERROR_NULL_POINTER:
      errorKey="NS_ERROR_NULL_POINTER";
      break;
      
   case Components.results.NS_ERROR_ABORT:
      errorKey="NS_ERROR_ABORT";
      break;
      
   case Components.results.NS_ERROR_FAILURE:
      errorKey="NS_ERROR_FAILURE";
      break;
      
   case Components.results.NS_ERROR_UNEXPECTED:
      errorKey="NS_ERROR_UNEXPECTED";
      break;
      
   case Components.results.NS_ERROR_OUT_OF_MEMORY:
      errorKey="NS_ERROR_OUT_OF_MEMORY";
      break;
      
   case Components.results.NS_ERROR_ILLEGAL_VALUE:
      errorKey="NS_ERROR_ILLEGAL_VALUE";
      break;
      
   case Components.results.NS_ERROR_INVALID_ARG:
      errorKey="NS_ERROR_INVALID_ARG";
      break;
      
   case Components.results.NS_ERROR_NO_AGGREGATION:
      errorKey="NS_ERROR_NO_AGGREGATION";
      break;
      
   case Components.results.NS_ERROR_NOT_AVAILABLE:
      errorKey="NS_ERROR_NOT_AVAILABLE";
      break;
      
   case Components.results.NS_ERROR_FACTORY_NOT_REGISTERED:
      errorKey="NS_ERROR_FACTORY_NOT_REGISTERED";
      break;
      
   case Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN:
      errorKey="NS_ERROR_FACTORY_REGISTER_AGAIN";
      break;
      
   case Components.results.NS_ERROR_FACTORY_NOT_LOADED:
      errorKey="NS_ERROR_FACTORY_NOT_LOADED";
      break;
      
   case Components.results.NS_ERROR_FACTORY_NO_SIGNATURE_SUPPORT:
      errorKey="NS_ERROR_FACTORY_NO_SIGNATURE_SUPPORT";
      break;
      
   case Components.results.NS_ERROR_FACTORY_EXISTS:
      errorKey="NS_ERROR_FACTORY_EXISTS";
      break;
      
   case Components.results.NS_ERROR_PROXY_INVALID_IN_PARAMETER:
      errorKey="NS_ERROR_PROXY_INVALID_IN_PARAMETER";
      break;
      
   case Components.results.NS_ERROR_PROXY_INVALID_OUT_PARAMETER:
      errorKey="NS_ERROR_PROXY_INVALID_OUT_PARAMETER";
      break;
      
   case Components.results.NS_BASE_STREAM_CLOSED:
      errorKey="NS_BASE_STREAM_CLOSED";
      break;
      
   case Components.results.NS_BASE_STREAM_OSERROR:
      errorKey="NS_BASE_STREAM_OSERROR";
      break;
      
   case Components.results.NS_BASE_STREAM_ILLEGAL_ARGS:
      errorKey="NS_BASE_STREAM_ILLEGAL_ARGS";
      break;
      
   case Components.results.NS_BASE_STREAM_NO_CONVERTER:
      errorKey="NS_BASE_STREAM_NO_CONVERTER";
      break;
      
   case Components.results.NS_BASE_STREAM_BAD_CONVERSION:
      errorKey="NS_BASE_STREAM_BAD_CONVERSION";
      break;
      
   case Components.results.NS_BASE_STREAM_WOULD_BLOCK:
      errorKey="NS_BASE_STREAM_WOULD_BLOCK";
      break;
      
   case Components.results.NS_ERROR_FILE_UNRECOGNIZED_PATH:
      errorKey="NS_ERROR_FILE_UNRECOGNIZED_PATH";
      break;
      
   case Components.results.NS_ERROR_FILE_UNRESOLVABLE_SYMLINK:
      errorKey="NS_ERROR_FILE_UNRESOLVABLE_SYMLINK";
      break;
      
   case Components.results.NS_ERROR_FILE_EXECUTION_FAILED:
      errorKey="NS_ERROR_FILE_EXECUTION_FAILED";
      break;
      
   case Components.results.NS_ERROR_FILE_UNKNOWN_TYPE:
      errorKey="NS_ERROR_FILE_UNKNOWN_TYPE";
      break;
      
   case Components.results.NS_ERROR_FILE_DESTINATION_NOT_DIR:
      errorKey="NS_ERROR_FILE_DESTINATION_NOT_DIR";
      break;
      
   case Components.results.NS_ERROR_FILE_TARGET_DOES_NOT_EXIST:
      errorKey="NS_ERROR_FILE_TARGET_DOES_NOT_EXIST";
      break;
      
   case Components.results.NS_ERROR_FILE_COPY_OR_MOVE_FAILED:
      errorKey="NS_ERROR_FILE_COPY_OR_MOVE_FAILED";
      break;
      
   case Components.results.NS_ERROR_FILE_ALREADY_EXISTS:
      errorKey="NS_ERROR_FILE_ALREADY_EXISTS";
      break;
      
   case Components.results.NS_ERROR_FILE_INVALID_PATH:
      errorKey="NS_ERROR_FILE_INVALID_PATH";
      break;
      
   case Components.results.NS_ERROR_FILE_DISK_FULL:
      errorKey="NS_ERROR_FILE_DISK_FULL";
      break;
      
   case Components.results.NS_ERROR_FILE_CORRUPTED:
      errorKey="NS_ERROR_FILE_CORRUPTED";
      break;
      
   case Components.results.NS_ERROR_FILE_NOT_DIRECTORY:
      errorKey="NS_ERROR_FILE_NOT_DIRECTORY";
      break;
      
   case Components.results.NS_ERROR_FILE_IS_DIRECTORY:
      errorKey="NS_ERROR_FILE_IS_DIRECTORY";
      break;
      
   case Components.results.NS_ERROR_FILE_IS_LOCKED:
      errorKey="NS_ERROR_FILE_IS_LOCKED";
      break;
      
   case Components.results.NS_ERROR_FILE_TOO_BIG:
      errorKey="NS_ERROR_FILE_TOO_BIG";
      break;
      
   case Components.results.NS_ERROR_FILE_NO_DEVICE_SPACE:
      errorKey="NS_ERROR_FILE_NO_DEVICE_SPACE";
      break;
      
   case Components.results.NS_ERROR_FILE_NAME_TOO_LONG:
      errorKey="NS_ERROR_FILE_NAME_TOO_LONG";
      break;
      
   case Components.results.NS_ERROR_FILE_NOT_FOUND:
      errorKey="NS_ERROR_FILE_NOT_FOUND";
      break;
      
   case Components.results.NS_ERROR_FILE_READ_ONLY:
      errorKey="NS_ERROR_FILE_READ_ONLY";
      break;
      
   case Components.results.NS_ERROR_FILE_DIR_NOT_EMPTY:
      errorKey="NS_ERROR_FILE_DIR_NOT_EMPTY";
      break;
      
   case Components.results.NS_ERROR_FILE_ACCESS_DENIED:
      errorKey="NS_ERROR_FILE_ACCESS_DENIED";
      break;
      
   case Components.results.NS_ERROR_CANNOT_CONVERT_DATA:
      errorKey="NS_ERROR_CANNOT_CONVERT_DATA";
      break;
      
   case Components.results.NS_ERROR_OBJECT_IS_IMMUTABLE:
      errorKey="NS_ERROR_OBJECT_IS_IMMUTABLE";
      break;
      
   case Components.results.NS_ERROR_LOSS_OF_SIGNIFICANT_DATA:
      errorKey="NS_ERROR_LOSS_OF_SIGNIFICANT_DATA";
      break;

   case Components.results.NS_SUCCESS_LOSS_OF_INSIGNIFICANT_DATA:
      errorKey="NS_SUCCESS_LOSS_OF_INSIGNIFICANT_DATA";
      break;

   case NS_ERROR_CACHE_ENTRY_DOOMED:
      errorKey = "NS_ERROR_CACHE_ENTRY_DOOMED";
      break;

   case NS_ERROR_CACHE_WAIT_FOR_VALIDATION:
      errorKey = "NS_ERROR_CACHE_WAIT_FOR_VALIDATION";
      break;

   case Components.results.NS_ERROR_NOT_AVAILABLE:
      errorKey = "NS_ERROR_NOT_AVAILABLE";
      break;

   case NS_ERROR_CACHE_KEY_NOT_FOUND:
      errorKey = "NS_ERROR_CACHE_KEY_NOT_FOUND";
      break;

   case NS_ERROR_CACHE_READ_ACCESS_DENIED:
      errorKey = "NS_ERROR_CACHE_READ_ACCESS_DENIED";
      break;

   case NS_ERROR_CACHE_WRITE_ACCESS_DENIED:
      errorKey = "NS_ERROR_CACHE_WRITE_ACCESS_DENIED";
      break;

   case NS_ERROR_CACHE_IN_USE:
      errorKey = "NS_ERROR_CACHE_IN_USE";
      break;


   }
   return errorKey;
}
*/