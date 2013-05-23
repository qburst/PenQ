/*
Copyright 2007 Security Compass

This file is part of XSS Me.

XSS Me is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

XSS Me is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with XSS Me.  If not, see <http://www.gnu.org/licenses/>.

If you have any questions regarding XSS Me please contact
tools@securitycompass.com
*/

/**
 * xssmeevaluators.js
 * This file holds a number of JS evaluators 
 * @require Results.js
 */

function xssmeTrimRight( s ) {
    if ( typeof( String.prototype.trimRight ) === 'undefined' || !String.prototype.trimRight ) {
        return s.replace( /\s+$/, '' );
    }

    return s.trimRight();
}

function checkForVulnerableElement(browser, attackRunner) {
    
    var rv = null;
    var document = browser.contentDocument;
    
    dump('xssmeevaluator on page ' + document.location);
    dump(' is ' + (document.wrappedJSObject.vulnerable ) + ' '); 
    dump((document.wrappedJSObject.vulnerable == true) + '\n');
    
    if (document.wrappedJSObject.vulnerable && document.wrappedJSObject.vulnerable == true){
        
        rv = new Result(RESULT_TYPE_ERROR, 100, "DOM was modified by attack string.  Field appears to be very vulnerable to XSS String.");// ('"+attackRunner.testValue.string+"')");
        
    }
    else {
        
        rv = new Result(RESULT_TYPE_PASS, 100, "DOM was not modified by attack string.  Field does not appear vulnerable to XSS String");//('"+attackRunner.testValue.string+"')");
        
    }
    
    return [rv];
    
}

function checkForExactAttackText(streamListener){
    
    var rv = null;
    var searchString = xssmeTrimRight( streamListener.attackRunner.testValue.string );
    var specials = [
            '/', '.', '*', '+', '?', '|',
            '(', ')', '[', ']', '{', '}', '\\'];
    var regex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
    searchString = searchString.replace(regex, '\\$1');
    var regex = new RegExp(searchString, 'gm');
    dump('xssmeevaluators::checkForExactAttackText: checking for ' + 
            'attackRunner.testValue: ' + streamListener.attackRunner.testValue.string + '\n');
    /*dump('xssmeevaluators::checkForExactAttackText::streamListener.data '+streamListener.data+'\n');*/
    var doesMatch = streamListener.data.match(regex);
    
    if (doesMatch) {
        
        rv = new Result(RESULT_TYPE_WARNING, 100, "The unencoded attack string was found in the html of the document. Other browsers may be vulnerable to this XSS string."); //('"+streamListener.attackRunner.testValue.string  + "')");
        
    }
    else {
        
        rv = new Result(RESULT_TYPE_PASS, 100, "The unencoded attack string was not found in the html of the document.");//('"+streamListener.attackRunner.testValue.string  + "')");
        
    }
    
    return [rv];
    
}

