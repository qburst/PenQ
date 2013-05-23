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
 * NOTE: in this file all uses of the keyword *this* refer to the window.
 * We're modifying this window so that other windows (e.g. the sidebar) can
 * interact with it directly.
 */

/**
 * whiletestruns.js
 * Holding JS code for whiletestruns.xul
 */
function OK(){
    
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
    var rv = false;
    
    rv = prompts.confirmEx(null, "Warning! Closing this dialog box will not terminate the XSS Me test.",
            "Warning! Closing this dialog box will not terminate the XSS Me test. If you wish to terminate the test, you may do so by closing the XSS Me sidebar. This is not recommended as it may result in a slight memory leak.",
            prompts.STD_YES_NO_BUTTONS, "", "", "", null, new Object());
    
    return !rv;
    
}

/**
 * This function is called when a test is finished
 */
this.finishedTest = function() {
    this.numTestsComplete++;
    if (this.numTestsComplete > this.maxNumTests) {
        Components.utils.reportError('Too many tests have been completed');
    }
}

this.clearNumTests = function() {
    this.numTestsComplete = 0;
}

this.updateUI = function() {
    
    this.bar.value = this.numTestsComplete / this.maxNumTests * 100
    this.span.innerHTML = this.numTestsComplete.toString() + '/' + this.maxNumTests.toString();

}

this.startThoroughTesting = function(numVulnerableFields) {
    this.bar.value = 100;
    this.span.innerHTML = this.maxNumTests.toString() + '/' + this.maxNumTests.toString();
    
    this.bar = document.getElementById('thoroughBar');
    this.span = document.getElementById('thoroughTestCount');

    this.maxNumTests = 2*numVulnerableFields*this.testType.count;
    this.numTestsComplete = 0;
    
    //document.getElementById('heuristicsComplete').style.visibility = 'visible';
}

function onUnLoad() {
    //alert(this.numTestsComplete + ' of ' +this.maxNumTests);
    this.bar = null;
    this.span = null;
}

/**
 * called when the page loads
 */
function onLoad() {
    this.clearNumTests();
    window.centerWindowOnScreen();
    this.maxNumTests = window.arguments[0];
    this.testType = window.arguments[1];
    this.bar = null;
    this.span = null;
    
    if (this.testType.heuristicTest) {
        document.getElementById('heuristicTestingBox').style.visibility = 'visible';
        //document.getElementById('heuristicsComplete').style.visibility = 'hidden';
        this.bar = document.getElementById('heuristicBar');
        this.span = document.getElementById('heuristicTestCount');
    }
    else {
        this.bar = document.getElementById('thoroughBar');
        this.span = document.getElementById('thoroughTestCount');
    }
    
    //update UI every 1/5 second
    window.setInterval(this.updateUI, 200);
}
