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
 * AttackStringContainer.js
 * requires preferenceStringContainer.js
 */


/**
 *this object is responsible for dealing with the Attack Strings.
 */
function AttackStringContainer() {
    this.init();
}
AttackStringContainer.prototype = new PreferenceStringContainer();
dump('creating... AttackStringContainer object\n');
AttackStringContainer.prototype.init = function (){    
        
        var attackStrings;
        
        this.prefBranch = this.prefService.getBranch('extensions.xssme.');
        this.prefDefaultBranch = this.prefService.getDefaultBranch('extensions.xssme.')
        if (this.prefBranch.prefHasUserValue('attacks')){
            attackStrings = this.prefBranch.getCharPref('attacks');
            this.strings = JSON.parse(attackStrings);
        }
        else {
            var ioService = Components.classes["@mozilla.org/network/io-service;1"].
                    getService(Components.interfaces.nsIIOService);
            var chromeURL = ioService.
                    newURI("chrome://xssme/content/XSS-strings.xml", null, null);
    
            var chromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
                    .getService(Components.interfaces.nsIChromeRegistry);
            var defaultAttacksURL= chromeRegistry.convertChromeURL(chromeURL);
            var defaultAttacksChannel= ioService.newChannelFromURI(defaultAttacksURL);
            var defaultAttacksXML = FileIO.readChannel(defaultAttacksChannel, null);
                
            
            importAttackFromXMLString(defaultAttacksXML, this);
            
        }
        
    };
AttackStringContainer.prototype.save = function() {
    this.prefBranch.setCharPref('attacks', JSON.stringify(this.strings));
    
}


function getAttackStringContainer(){
    if (typeof(attackStringContainer) === 'undefined' || !attackStringContainer){
        attackStringContainer = new AttackStringContainer();
    }
    return attackStringContainer;
}
