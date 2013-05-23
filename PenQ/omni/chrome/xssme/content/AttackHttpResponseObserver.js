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
 * AttackHttpResponseObserver.js
 */
const AttackHttpResponseObserver_topic = 'http-on-examine-response';
 
function AttackHttpResponseObserver(attackRunner, resultsManager){
    
    this.attackRunner = attackRunner;
    this.resultsManager = resultsManager;
    
}

AttackHttpResponseObserver.prototype = {
    
    QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsIObserver) || 
            iid.equals(Components.interfaces.nsISupports))
        {
            return this;
        }
        
        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    observe: function(subject, topic, data) {
        
        if (topic == AttackHttpResponseObserver_topic){
            try {
                this.resultsManager.gotChannelForAttackRunner(subject.
                        QueryInterface(Components.interfaces.nsIHttpChannel),
                        this.attackRunner);
            }
            catch(err) {
                dump('AttackHttpResponseObserver::observe: ' + err + '\n');
            }
        }
        
    }
    
};