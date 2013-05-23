//  **** BEGIN LICENSE BLOCK ****
//  Copyright(c) 2005 Adam Judson, Claude Villermain
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


function TamperGraph(title, xml) {
   this.init(title, xml);
}

TamperGraph.prototype = {
   __proto__ : new TamperLanguage("tamper.graph."),

   init : function(title, xml) {
      this.graphTitle = title;
      this.xml = xml;
   },

   getStringValue : function(doc, key, node) {
      return doc.evaluate(key, node, null, XPathResult.STRING_TYPE, null).stringValue;
   },

   getHTML : function() {
      var xmlString = this.xml;
      var parser = new DOMParser();
      var domtree = parser.parseFromString(xmlString, "text/xml");
      
      // what is min/max time
      var minTimeMS = Infinity;
      var maxTimeMS = 0;
      var time, duration;
      var nodes = domtree.evaluate("//tdRequest[tdStatus>100]", domtree, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);    
      var currentNode = nodes.iterateNext();
      while (currentNode) {
         time     = parseFloat(this.getStringValue(domtree, "tdStartTimeMS", currentNode));
         duration = parseFloat(this.getStringValue(domtree, "tdElapsedTime", currentNode));

         if (time + duration > maxTimeMS) {
            maxTimeMS = time + duration;
         }
         if (time < minTimeMS) {
            minTimeMS = time;
         }
         currentNode = nodes.iterateNext();
      }
   
      minTimeMS = parseInt(minTimeMS);
      maxTimeMS = parseInt(maxTimeMS);
      var timeSpan = maxTimeMS - minTimeMS;
      // our graph should have 5 labels (make this a preference
      var numLabels = 5;
      var labels = new Array(numLabels);
      var uriDisplayLength = 70;
      var currentTime;
      for (var i = 0; i < labels.length; i++) {
         currentTime = minTimeMS + (i+0.5)*(timeSpan/numLabels);
         labels[i] = TamperUtils.getTime(new Date(currentTime));
      }

      var graphText = this.getHeader();   

      // now insert the request rows
      nodes = domtree.evaluate("//tdRequest[tdStatus>100]", domtree, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      currentNode = nodes.iterateNext();
      var uri, shortUri, totalDuration, mimeType, statusCode, size, statusCodeText, requestMethod;
      var rowBgColour = "EEEEEE";
      
      while (currentNode) {
         uri = this.getStringValue(domtree, "@uri", currentNode);
         shortUri = this.getShortURI(uri, uriDisplayLength);
   
         mimeType = this.getStringValue(domtree, "tdMimeType", currentNode);
         if (mimeType == "text/html") { 
            shortUri = "<b>" + shortUri + "</b>"; 
         }
         statusCode     =            this.getStringValue(domtree, "tdStatus",           currentNode);
         statusCodeText = unescape(  this.getStringValue(domtree, "tdStatusText",       currentNode));
         size           =            this.getStringValue(domtree, "tdContentSize",      currentNode);
         requestMethod  =            this.getStringValue(domtree, "tdRequestMethod",    currentNode);
         duration       = parseFloat(this.getStringValue(domtree, "tdElapsedTime",      currentNode));
         time           = parseFloat(this.getStringValue(domtree, "tdStartTimeMS",      currentNode));
         totalDuration  = parseFloat(this.getStringValue(domtree, "tdTotalElapsedTime", currentNode));
   
         // make long URI wrappable (wrap every 60 characters or at specific characters: /&?)
         var wrappedURI = this.getWrappedText(requestMethod + " " + uri, 60);
         
         var tooltipText = this.createTooltipText(wrappedURI, time, duration, totalDuration, size, statusCode, statusCodeText, mimeType, uri);

         graphText += this.getRowText(rowBgColour, uri, tooltipText, statusCode, duration, numLabels, time, minTimeMS, timeSpan, maxTimeMS, totalDuration, shortUri);

         currentNode = nodes.iterateNext();
         if (rowBgColour == "EEEEEE") { 
            rowBgColour = "DDDDDD"; 
         } else { 
            rowBgColour = "EEEEEE"; 
         }
      }
   
      // ticks
      graphText += this.getTicksHTML(labels);

      graphText += "</table>";
      graphText += "</body></html>";
      return graphText;
   },

   getTicksHTML : function(labels) {
      var ticksText = "<tr><td></td><td></td><td></td>";
      for (i = 0; i < labels.length; i++) {
         ticksText += "<td align='center'>" + "|" + "</td>";
      }
      ticksText += "</tr>";
      ticksText += "<th>URI</th><th>" + this.langString("status") + "</th><th>" + this.langString("duration") + "</th>";
      for (i = 0; i < labels.length; i++) {
         ticksText += "<th><font size=-1>" + labels[i] + "</font></th>";
      }
      ticksText += "</tr>";
      return ticksText;
   },

   createTooltipText : function(wrappedURI, time, duration, totalDuration, size, statusCode, statusCodeText, mimeType, uri) {
      var tooltipText = "<B>" + wrappedURI + "</B><P><B>Start:</B> " + TamperUtils.getTime(new Date(time));
      tooltipText += "<BR><B>" + this.langString("duration") + "</B>: " + duration + " ms";
      if (totalDuration > duration) {
         tooltipText += "<BR><B>" + this.langString("total.duration") +"</B>: " + totalDuration + this.langString("ms");
      }
      tooltipText += "<BR><B>" + this.langString("size") + "</B>: " + size;
      tooltipText += "<BR><B>" + this.langString("status") + "</B>: " + statusCode + " " + statusCodeText;
      tooltipText += "<BR><B>" + this.langString("mime.type") + "</B>: " + mimeType;
      if (mimeType.substr(0,6) == "image/") { // Display image
         tooltipText += "<P><IMG BORDER=1 SRC=\\\"" + uri + "\\\">";
      }
      return tooltipText;
   },

   getRowText : function(rowBgColour, uri, tooltipText, statusCode, duration, numLabels, time, minTimeMS, timeSpan, maxTimeMS, totalDuration, shortUri) {
      var rowText = "<tr bgcolor='" + rowBgColour + "'><td>";
      
      // rowText += "<a href='" + unescape(uri).replace(/'/,'%27').replace(/"/,'%22') + "' target='_new'";
      rowText += "<a href='" + uri + "' target='_new'";
      rowText += "onMouseMove='display_info(\"" + tooltipText + "\",event);' onMouseOut='hide_info();'>" + shortUri + "</a></td>";
      
      var fontBbColour="#000000";
      if ((statusCode.charAt(0) == "4") || (statusCode.charAt(0) == "5")) { 
         fontBbColour = "#FF0000"; 
      }
      rowText += "<td align='center'><font color='" + fontBbColour + "'>" + statusCode + "</font></td>";
      rowText += "<td align='right'>" + duration + "</td>\n";

      rowText += "\t<td width='100%' colspan='" + numLabels +"'><table width='100%' border='0' cellpadding='0' cellspacing='0'>\n\t\t<tr>";
      // before
      rowText += "\n\t\t\t<td width='" + Math.max(5000 *(time - minTimeMS)/timeSpan,1) + "'> </td>";
      // during
      rowText += "\n\t\t\t<td width='" + Math.max(5000 *(duration/timeSpan),1) + "' bgcolor='#0000FF' onMouseMove='display_info(\"" + tooltipText + "\",event);' onMouseOut='hide_info();'><font size='-2'>&nbsp;</font></td>";
      if (totalDuration > duration) {
         // before total duration
         rowText += "\n\t\t\t<td width='" + Math.max(5000 *(totalDuration-duration)/timeSpan,1) + "' bgcolor='#C0C0FF' onMouseMove='display_info(\"" + tooltipText + "\",event);' onMouseOut='hide_info();'><font size='-2'>&nbsp</font></td>";
         // after
         rowText += "\n\t\t\t<td width='" + Math.max(5000 *(maxTimeMS - time - totalDuration)/timeSpan,1) + "'> </td>";
      } else {
         // after
         rowText += "\n\t\t\t<td width='" + Math.max(5000 *(maxTimeMS - time - duration)/timeSpan,1) + "'> </td>";
      }
      rowText += "</tr></table></td></tr>\n";
      return rowText;
   },

   getShortURI : function(uri, displayLength) {
      var shortURI = uri;
         if (shortURI.length > displayLength) { // truncate URI in a more intelligent way
            var j = shortURI.indexOf("?");
            if (j > 0) { 
               shortURI = shortURI.substring(0, j) + "?...";
            } 
            // get rid of query string
            var old_shortURI = shortURI;
            if (shortURI.length > displayLength) {
               shortURI = shortURI.replace(/^(.*[^\/])\/[^\/]+(\/[^\/]+)$/,"$1/...$2"); // replaces inner pathes by "..." until we get to a good size
            }
            while ((shortURI.length > displayLength) && (shortURI != old_shortURI))  {
               old_shortURI = shortURI;
               shortURI = shortURI.replace(/^(.*[^\/])\/[^\/]+\/\.\.\.(\/[^\/]+)$/,"$1/...$2"); // replaces inner pathes by "..." until we get to a good size
            }
            if (shortURI.length > displayLength) {
               shortURI = shortURI.substr(0, displayLength-3) + "...";
            }
         }
      return shortURI;
   },


   getWrappedText : function(originalText, wrap_size) {
      var wrappedText = "";
      var workingText = originalText;
      var last_i = 0;
      var i;
      while ((i = workingText.substr(last_i).search(/[&\/\?]/)) >= 0) {
         if (i + last_i > wrap_size) { 
            // need to break
            if (last_i > wrap_size-15) { 
               // can we break at previous special character?
               wrappedText += workingText.substr(0,last_i) + "<BR>";
               workingText = workingText.substr(last_i);
               last_i = 0;
            } else { 
               // break at 60 characters
               wrappedText += workingText.substr(0,wrap_size) + "<BR>";
               workingText = workingText.substr(wrap_size);
               last_i = 0;
            }
         } else {
            if (i == 0) {
               last_i++;
            } else {
               last_i = last_i + i;
            }
         }
      }
      while (workingText.length > wrap_size+5) {
         wrappedText += workingText.substr(0,last_i) + "<BR>";
         workingText = workingText.substr(last_i);
      }
      wrappedText += workingText;
      wrappedText = wrappedText.replace(/'/,'%27');
      wrappedText = wrappedText.replace(/"/,'%22');

      return wrappedText;
   },

   getTooltipHTML : function(divName) {
      return "<div id='" + divName + "' style='position:absolute; visibility:hidden; z-index:9999;'></div>\n";
   },

   getTooltipFunctionsHTML : function(divName) {
      var htmlString = "";
      htmlString += "<SCRIPT LANGUAGE=javascript>\n";
      htmlString += "var infodiv = document.getElementById('" + divName + "');\n";
      htmlString += "function display_info(info_text, e) {\n";
      htmlString += "var my_width=400;\n";
      htmlString += "infodiv.innerHTML='<TABLE BGCOLOR=#FFFFCC WIDTH='+my_width+' BORDER=0><TR><TD><TABLE WIDTH=100% BORDER=0><TR><TD>'+info_text+'</TD></TR></TABLE></TD></TR></TABLE>';\n";
      
      htmlString += "var my_left = (e.pageX+16+my_width < window.innerWidth) ? e.pageX+16 : e.pageX-my_width;\n";
      htmlString += "if (my_left+my_width > window.pageXOffset+window.innerWidth) { my_left = window.pageXOffset+window.innerWidth-my_width; }\n";
      htmlString += "if (my_left < window.pageXOffset) { my_left = window.pageXOffset; }\n";
      htmlString += "infodiv.style.left = my_left;\n";
      
      htmlString += "var my_top = (e.pageY+16+infodiv.offsetHeight < window.innerHeight) ? e.pageY+16 : e.pageY-infodiv.offsetHeight;\n";
      htmlString += "if (my_top+infodiv.offsetHeight > window.pageYOffset+window.innerHeight) { my_top = window.pageYOffset+window.innerHeight-infodiv.offsetHeight; }\n";
      htmlString += "if (my_top < window.pageYOffset) { my_top = window.pageYOffset; }\n";
      htmlString += "infodiv.style.top = my_top;\n";
      
      htmlString += "infodiv.style.visibility = 'visible';\n";
      htmlString += "}\n";
      htmlString += "function hide_info(info_text) {\n";
      htmlString += "infodiv.style.visibility = 'hidden';\n";
      htmlString += "}\n";
      htmlString += "</SCRIPT>\n";
      return htmlString;
   },

   getHeader : function() {
      var header = "<html>\n<head><title>" + this.langString("title") + "</title>";
      
      header += "<style type=text/css> * {font-family: Arial, Helvetica, Geneva, sans-serif; font-size: 12px} </style>\n";

      // inline javascript code displaying information as a popup
      
      header += "</head>\n<body>";
      var divName = "infoDiv";
      header += this.getTooltipHTML(divName);
      header += this.getTooltipFunctionsHTML(divName);
      header += "<table width='100%' border='0' cellpadding='1' bgcolor='EEEEEE'><tr  bgcolor='CCCCFF'>";
      return header;
   }
};

