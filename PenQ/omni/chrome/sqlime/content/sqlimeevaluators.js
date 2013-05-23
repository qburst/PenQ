/*
Copyright 2007 Security Compass

This file is part of SQL Inject Me.

SQL Inject Me is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

SQL Inject Me is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with SQL Inject Me.  If not, see <http://www.gnu.org/licenses/>.

If you have any questions regarding SQL Inject Me please contact
tools@securitycompass.com
*/

/**
 * sqlimeevaluators.js
 * This file holds a number of JS evaluators 
 * @require Results.js
 * @require ErrorStringContainer.js
 */

/**
 * Checks the source of a page for stored error strings
 */
function checkSrcForErrorString(streamListener) {

    var errorContainer = getErrorStringContainer();
    var results = new Array();
    var doc = streamListener.data;
    var stringEncoder = getHTMLStringEncoder();
    dump("\nStart freeze...");
    for each (var error in errorContainer.getStrings()){
        var result;
        
        if (doc.indexOf(error.string) !== -1) {
            result = new Result(RESULT_TYPE_ERROR, 100, "Error string found: '" + stringEncoder.encodeString(error.string) + "'");
        }
        else {
            result = new Result(RESULT_TYPE_PASS, 100, "Error string not found: '" + stringEncoder.encodeString(error.string) + "'");
        }
        
        results.push(result);
    }
    dump("\nEnd freeze...");

    
    return results;
}

/**
 * Checks the browser for stored error strings.
 */
function checkForErrorString(browser) {

    var errorContainer = getErrorStringContainer();
    var results = new Array();
    var doc = browser.contentDocument.toString();
    var stringEncoder = getHTMLStringEncoder();
    dump("\nStart freeze...");
    for each (var error in errorContainer.getStrings()){
        var result;
        
        if (doc.indexOf(error.string) !== -1) {
            result = new Result(RESULT_TYPE_ERROR, 100, "Error string found: '" + stringEncoder.encodeString(error.string) + "'");
        }
        else {
            result = new Result(RESULT_TYPE_PASS, 100, "Error string not found: '" + stringEncoder.encodeString(error.string) + "'");
        }
        
        results.push(result);
    }
    dump("\nEnd freeze...");

    
    return results;
}

function checkForServerResponseCode(streamListener){
    var nsiHttpChannel = streamListener.attackRunner.channel.QueryInterface(Components.interfaces.nsIHttpChannel);
    var stringEncoder = getHTMLStringEncoder();
    try{
        if ((nsiHttpChannel.responseStatus === undefined || nsiHttpChannel.responseStatus === null)){
            return null;   
        }
        else {
            var result;
            var responseCode = nsiHttpChannel.responseStatus;
            var displayString = "Server Status Code: " + stringEncoder.encodeString(responseCode.toString()) + " " +
                    stringEncoder.encodeString(nsiHttpChannel.responseStatusText);
            if (responseCode == 200){
                result = new Result(RESULT_TYPE_PASS, 100, displayString );
            }
            else {
                result = new Result(RESULT_TYPE_ERROR, 100, displayString);
            }
        }
        return [result];
    }
    catch(err){
        Components.utils.reportError(err);
        return [];
    }
}