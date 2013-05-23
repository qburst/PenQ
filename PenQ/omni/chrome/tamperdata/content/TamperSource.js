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

// Controller for tamper source window
// displays raw/uncompressed source as appropriate.
TamperSource.init = function() {
   TamperSource.instance = new TamperSource(window.arguments[0]);
};

function TamperSource(item) {
   this.init(item);
}

TamperSource.prototype = {
   init : function(requestItem) {
      this.item = requestItem;
      this.setupGuiElements();
      this.loadValues();
   },

   setupGuiElements : function() {
      this.rawTextBox          = document.getElementById("tamper.source.rawTextBox");
      this.uncompressedTextBox = document.getElementById("tamper.source.uncompressedTextBox");
      this.rawHbox             = document.getElementById("tamper.source.raw.hbox"); 
      this.splitter            = document.getElementById("tamper.source.splitter");
   },

   loadValues : function() {
      var cachedData = this.item.getCachedResponse();
      this.uncompressedTextBox.value = cachedData;
      if (this.item.rawCacheData) {
         this.rawTextBox.value = this.item.rawCacheData;
      } else {
         this.rawHbox.hidden  = true;
         this.splitter.hidden = true;
      }
      if (!cachedData) {
         window.alert(TamperLang.instance().getString("tamper.source.cache.problem"));
         window.close();
      }
   }
};

