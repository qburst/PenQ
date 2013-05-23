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
 * This function checks whether the context menu needs to be dispalyed and then
 * makes sure that that is the state of the context menu
 */

function checkContextMenu() {
    var prefService = Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService);
    var branch = prefService.getBranch('extensions.xssme.');
    var showContextMenu = true; //default
    
    if (branch.prefHasUserValue('showcontextmenu')) {
        showContextMenu = branch.getBoolPref('showcontextmenu');
    }

    var contextMenu = document.getElementById('xssmecontextmenu');
    contextMenu.setAttribute('collapsed', !showContextMenu);
}
    
function XssOverlay() {}

XssOverlay.prototype = {
    contextMenuObserver: null
    ,
    onLoad: function() {
        
        var prefService = Components.classes['@mozilla.org/preferences-service;1'].
                getService(Components.interfaces.nsIPrefService);
        
        var branch = prefService.getBranch('');
        
        var observableBranch = branch.
                QueryInterface(Components.interfaces.nsIPrefBranch2);
        
        this.contextMenuObserver = new Xss_PrefObserver(checkContextMenu);
        
        checkContextMenu();
        
        dump('mainwindow::onLoad contextMenuObserver ==' + this.contextMenuObserver +'\n');
        
        
        observableBranch.addObserver('extensions.xssme.showcontextmenu', this.contextMenuObserver, false);
    }
    ,
    onUnload: function() {
        dump('XssOverlay::onUnload this.contextMenuObserver' + this.contextMenuObserver + '\n');
        //Do nothing right now.
                var prefService = Components.classes['@mozilla.org/preferences-service;1'].
                getService(Components.interfaces.nsIPrefService);
        
        var branch = prefService.getBranch('');
        
        var observableBranch = branch.
                QueryInterface(Components.interfaces.nsIPrefBranch2);
        
        observableBranch.removeObserver('extensions.xssme.showcontextmenu', this.contextMenuObserver)
    }
};

var xssOverlay = new XssOverlay();

window.addEventListener('load', xssOverlay.onLoad, false);
window.addEventListener('unload', xssOverlay.onUnload, false);
