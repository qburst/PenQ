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
 * PrefObserver.js
 * This provides a class that can be used to watch arbitrary preferences and do
 * artibrary things based on them.
 * This assumes will act on all preferences being watched (that is all children
 * of this preference as well as the preference itself).
 */

function Xss_PrefObserver(functionToCall){
    this.funcToCall = functionToCall;
    
}

Xss_PrefObserver.prototype = {
    observe: function(subject, topic, data) {
        dump('Xss_PrefObserver::Observe topic == ' + topic + '\n');
        if (topic == "nsPref:changed") {
            this.funcToCall(subject, topic, data);
        }
    }
    ,
    QueryInterface : function(aIID) {
        if (aIID.equals(Components.interfaces.nsIObserver)) {
            return this;
        }
    
        throw Components.results.NS_NOINTERFACE;
    }
};