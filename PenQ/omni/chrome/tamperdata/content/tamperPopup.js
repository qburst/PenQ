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

function TamperPopupDialog(request) {
   this.init(request);
   this.loadValues();
}

TamperPopupDialog.POST_DATA = "POST_DATA";
TamperPopupDialog.DATA_OBJECT = "tamperDataObject";

TamperPopupDialog.init = function() {
   TamperPopupDialog.instance = new TamperPopupDialog(window.arguments[0]);
};

TamperPopupDialog.valueChanged = function(entryField) {
   TamperPopupDialog.instance.changeValue(entryField);
};

TamperPopupDialog.modifyRequest = function() {
   TamperPopupDialog.instance.modifyRequest();
};

TamperPopupDialog.prototype = {
   __proto__ : new TamperLanguage("tamper.popup."),

   changedPostData : false,
   postdata : null,

   init : function(request) {
      this.headers = {};
      this.newPostData = {};
      this.request = request;
      this.headerList = document.getElementById("header list");
      this.postList = document.getElementById("post data list");
      this.preferences = new TamperPreferences();
      TamperMenu.init(this);

      this.uri = request.URI.asciiSpec;
      this.uriText = document.getElementById("uri text");
      this.uriText.label = this.uri;

      // Get the request headers
      var visitor = new window.opener.HeaderInfoVisitor(request);
      this.requestHeaders = visitor.visitRequest();
      this.postDataObject = visitor.getPostData();
      this.postBodyHeaders = visitor.getPostBodyHeaders();
   },

   changeValue: function(control) {
      if (control) {
         var name = control.getAttribute("tamper.name");
         // textbox->listcell->list
         if (control.parentNode.parentNode == this.headerList) {
            this.addHeader(name, control.value);
         }
         if (control.parentNode.parentNode == this.postList) {
            this.addPostData(name, control.value, control.getAttribute(TamperPopupDialog.DATA_OBJECT));
         }
      }
   },

   addHeader : function(name, value) {
      this.headers[name] = value;
   },

   addPostData : function(name, value, dataObjectIndex) {
      this.changedPostData = true;
      this.workingPostData[dataObjectIndex].value = value;
   },

   modifyRequest : function() {
      try {
         for (var header in this.headers) {
            this.request.setRequestHeader(header, this.headers[header], false);
         }
         // now post parameters ...
         if (this.changedPostData) {
            var myPostData = "";
            var isFirst = true;
            var dataObj = null;
            for (i in this.workingPostData) {
               dataObj = this.workingPostData[i];
               if (!dataObj.deleted) {
                  // if values have been added or deleted to binary data, 
                  // bad things will probably happen...
                  if (!this.postDataObject.binary) {
                     if (!isFirst) {
                        myPostData += "&";
                     } else {
                        isFirst = false;
                     }
                     myPostData += dataObj.name + "=" + dataObj.value;
                  } else {
                     myPostData = this.crUnescape(dataObj.value);
                  }
               }
            }
   
            this.request.QueryInterface(Components.interfaces.nsIUploadChannel);
            var uploadStream = this.request.uploadStream;
            if (uploadStream instanceof Components.interfaces.nsIMIMEInputStream) {
               // update the modifed post headers here...
               var sis = Components.classes["@mozilla.org/io/string-input-stream;1"];
               var tmpStream = sis.createInstance(Components.interfaces.nsIStringInputStream);
               tmpStream.setData(myPostData, myPostData.length);
               tmpStream.QueryInterface(Components.interfaces.nsISeekableStream);
               tmpStream.seek(0,0);
               tmpStream.QueryInterface(Components.interfaces.nsIInputStream);
               // boy, I sure hope this doesn't throw away the headers...
               uploadStream.setData(tmpStream);
               if (uploadStream instanceof Components.interfaces.nsISeekableStream) {
                  // rewinding should reset the Content-Length field.
                  uploadStream.seek(0, 0);
               }
               // uploadStream.rewind();
            } else if (uploadStream instanceof Components.interfaces.nsIStringInputStream) {
               const CONTENT_LENGTH = "content-length";
               var contentLength;
               var contentLengthName;
               var lengthFromPost = false;
               for (var h in this.postBodyHeaders) {
                  if (h.toLowerCase() === CONTENT_LENGTH) {
                     contentLengthName = h;
                     contentLength = this.postBodyHeaders[contentLengthName];
                     lengthFromPost = true;
                     break;
                  }
               }
               if (!lengthFromPost) {
                  try {
                     contentLength = this.request.getRequestHeader(CONTENT_LENGTH);
                  } catch (e) {
                     // that's too bad
                  }
               }
               if (contentLength && contentLength != "-1") {
                  if (contentLength != myPostData.length) {
                     if (window.confirm(this.langMessage("content.length.prompt", [myPostData.length]))) {
                        if (lengthFromPost) {
                           this.postBodyHeaders[contentLengthName] = "" + myPostData.length;
                        } else {
                           this.request.setRequestHeader(CONTENT_LENGTH, myPostData.length, false);
                        }
                     }
                  }
               }
               var postHeaderString = "";
               for (var ph in this.postBodyHeaders) {
                  postHeaderString += ph + ": " + this.postBodyHeaders[ph] + "\r\n";
               }
               this.request.uploadStream.setData(postHeaderString + "\r\n" + myPostData, postHeaderString.length + 2 + myPostData.length);
            } else if (uploadStream instanceof Components.interfaces.nsIFileInputStream) {
               TamperUtils.log("Got a file input stream, can't set values");
            } else if (uploadStream instanceof Components.interfaces.nsIMultiplexInputStream) {
               TamperUtils.log("Got a multiplex input stream, can't set values");
            } else if (uploadStream instanceof Components.interfaces.nsIBufferedInputStream) {
               TamperUtils.log("Got a buffered input stream, can't set values");
            } else {
               TamperUtils.log("Don't know what we got, can't set values");
            }
         }
      } catch (e) {
         // there was a problem...
         TamperUtils.log("Exception in modifyRequest: [" + e + "]");
         // keep going
      }
   },

   // change this to allow modification of post headers for mime-input streams.
   loadValues : function() {
      for (var header in this.requestHeaders) {
         this.addHeaderRow(header, this.requestHeaders[header]);
      }

      if (this.postDataObject) {
         this.postbody = this.postDataObject.body;
         // if this is binary, we should treat it differently
         if (!this.postDataObject.binary) {
            this.postdata = this.postbody.split("&"); 
            var count = 0;
            for (i in this.postdata) {
               if (count == 0) {
                  this.initWorkingPostData();
               }
               var nameValue = this.postdata[i].split("=");
               var name = nameValue[0];
               var val = this.postdata[i].substring(nameValue[0].length + 1);
               this.workingPostData[count] = {"name" : name, "value" : val, "count" : count};
               this.addPostRow(this.workingPostData[count], false);
               count++;
            }
         } else {
            // don't put the post headers on the page, as we ignore updates to them
            /*
            if (this.postBodyHeaders) {
               for (var ph in this.postBodyHeaders) {
                  this.addPostRow(ph, this.postBodyHeaders[ph], false);
               }
            }
            */
            this.postdata = this.postbody;
            // there's a problem with carriage returns
            // basically, we can get either \n, or \r\n but on windows
            // that will get converted to \n when we push and pull it from a text box
            // so convert these characters to \\r and \\n, and hope people can figure it out
            this.workingPostData = new Array();
            this.workingPostData[0] = {"name" : TamperPopupDialog.POST_DATA, "value" : this.crEscape(this.postbody), "count" : 0};
            this.addPostRow(this.workingPostData[0], true);
         }
      } else {
         this.postBody = null;
      }
   },

   crEscape : function(string) {
      string = string.replace(/\\r/g, "\\\\r");
      string = string.replace(/\\n/g, "\\\\n");
      string = string.replace(/\r/g, "\\r");
      string = string.replace(/\n/g, "\\n");
      return string;
   },

   crUnescape : function(string) {
      string = string.replace(/\\n/g, "\n");
      string = string.replace(/\\r/g, "\r");
      string = string.replace(/\\\\n/g, "\\n");
      string = string.replace(/\\\\r/g, "\\r");
      return string;
   },

   addHeaderRow : function(name, value) {
      this.addDetailRow(this.headerList, "header", name, value);
   },

   addPostRow : function(nameValue, multiline) {
      var ef = this.addDetailRow(this.postList, "post", nameValue.name, nameValue.value, nameValue.count);
      if (multiline) {
         ef.setAttribute("multiline", "true");
      }
   },

   addDetailRow : function(parent, type, name, value, dataObjIndex) {
      var item = document.createElement('listitem');
      // version 3 fix?
      item.setAttribute("allowevents", true);
      item.setAttribute("tamper.name", name);
      item.setAttribute("tamper.value", value);
      item.setAttribute(TamperPopupDialog.DATA_OBJECT, dataObjIndex);
      item.appendChild(this.createCell(name));
      var ef = this.createEntryField(name, value);
      ef.setAttribute(TamperPopupDialog.DATA_OBJECT, dataObjIndex);
      item.appendChild(ef);
      parent.appendChild(item);
      return ef;
   },

   createCell : function(text) {
      var cell = document.createElement("listcell");
      cell.setAttribute("label", text);
      return cell;
   },

   createEntryField : function(name, text) {
      var cell = null;
      cell = document.createElement("textbox");
      cell.setAttribute("tamper.name", name);
      cell.setAttribute("tamper.ef.name", name);
      cell.setAttribute("value", text);
      cell.setAttribute("onchange", "TamperPopupDialog.valueChanged(this);");
      return cell;
   },

   deleteItem : function(listItem, name, dataObject) {
      var parent = listItem.parentNode;
      if (parent == this.headerList) {
         this.addHeader(name, null);
      } else if (parent == this.postList) {
         var dataObjIndex = listItem.getAttribute(TamperPopupDialog.DATA_OBJECT);
         this.workingPostData[dataObjIndex].deleted = true;
         this.changedPostData = true;
      }
   },

   getAddPrompt : function(parent, element) {
      if (parent == this.headerList || element == this.headerList) {
         return this.langString("add.header.prompt");
      } else if (parent == this.postList || element == this.postList) {
         return this.langString("add.post.prompt");
      } else {
         return null;
      }
   }, 

   addItem : function(parent, element, name, data) {
      var old;
      if (parent == this.headerList || element == this.headerList) {
         if (this.preferences.shouldAddReplaceExisting) {
            old = this.getElementByName(this.headerList, name);
            if (old) {
               old.value = data;
               this.changeValue(old);
               return;
            }
         }
         this.addHeaderRow(name, data);
         this.addHeader(name, data);
      } else if (parent == this.postList || element == this.postList) {
         if (this.preferences.shouldAddReplaceExisting) {
            old = this.getElementByName(this.postList, name);
            if (old) {
               old.value = data;
               this.changeValue(old);
               return;
            }
         }
         var newData = this.makeNewPostData(name, data);
         this.addPostRow(newData, false);
         this.addPostData(name, data, newData.count);
      }
   },

   makeNewPostData : function(name, value) {
      this.initWorkingPostData();
      var count = this.workingPostData.length;
      this.workingPostData[count] = {"name" : name, "value" : value, "count" : count};
      return this.workingPostData[count];
   },

   getElementByName : function(parent, name) {
      var all = parent.getElementsByAttribute("tamper.ef.name", name);
      if (all && all.length) {
         return all[0];
      } else {
         return null;
      }
   },

   getWorkingPostDataByName : function(name) {
      this.initWorkingPostData();
      for (var item in this.workingPostData) {
         if (this.workingPostData[item].name == name) {
            return this.workingPostData[item];
         }
      }
      return null;
   },

   initWorkingPostData : function() {
      if (!this.workingPostData) {
         this.workingPostData = new Array();
      }
   }
};

