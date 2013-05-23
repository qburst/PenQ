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

const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;
const STATE_IS_WINDOW = Components.interfaces.nsIWebProgressListener.STATE_IS_WINDOW;
const STATE_IS_DOCUMENT = Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT;

const LISTEN_ON_WINDOW = 1;
const LISTEN_ON_DOCUMENT = 2;

function xssmeProgressListener(funcToCall, listenOn) {
    
    this.func = funcToCall
    this.listenOn = listenOn != null ? listenOn : STATE_IS_WINDOW;
    dump('created a listener... mode is ' + listenOn + '\n');
    this.interfaceName = "nsIWebProgressListener";
};

xssmeProgressListener.prototype =
{
    QueryInterface: function(aIID)
    {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
        {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
        return null;
    },
    
    onStateChange: function(aProgress, aRequest, aFlag, aStatus)
    {
        //dump('got a state change. aFlag is ' + aFlag.toString(16) + '\n');
        //dump('got a state change. we are listening on ' + 
        //        this.listenOn.toString(16) + '\n');
        // Components sometimes seems to disappear or or malfunction so we're 
        // just using the literal constant here.
//         if((aFlag & 0x00000010) && 
//             (aFlag & 0x00080000) )
        if ((aFlag & STATE_STOP) && (aFlag & this.listenOn)) {
            this.func();
        }
        return 0;
    },
    
    onLocationChange: function(aProgress, aRequest, aURI)
    {

        return 0;
    },
    
    // For definitions of the remaining functions see XULPlanet.com
    onProgressChange: function() {return 0;},
    onStatusChange: function() {return 0;},
    onSecurityChange: function() {return 0;},
    onLinkIconAvailable: function() {return 0;}
};
