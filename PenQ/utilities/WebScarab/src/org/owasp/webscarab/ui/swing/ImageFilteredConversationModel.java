/*
 * UrlFilteredConversationModel.java
 *
 * Created on 06 October 2005, 04:03
 *
 * To change this template, choose Tools | Options and locate the template under
 * the Source Creation and Management node. Right-click the template and choose
 * Open. You can then make changes to the template in the Source Editor.
 */

package org.owasp.webscarab.ui.swing;

import java.util.regex.Pattern;

import org.owasp.webscarab.model.ConversationID;
import org.owasp.webscarab.model.ConversationModel;
import org.owasp.webscarab.model.FilteredConversationModel;
import org.owasp.webscarab.model.FrameworkModel;
import org.owasp.webscarab.model.HttpUrl;

/**
 *
 * @author rdawes
 */
public class ImageFilteredConversationModel extends FilteredConversationModel {

    private ConversationModel _model;
    private Pattern pattern = Pattern.compile("^.*\\.(gif|jpg|png|axd\\?.*|style)$");
    private boolean filterImages = true;

    /** Creates a new instance of UrlFilteredConversationModel */
    public ImageFilteredConversationModel(FrameworkModel model, ConversationModel cmodel) {
        super(model, cmodel);
        _model = cmodel;
    }

    public void setFilterImages(boolean filter) {
        if ( filter != filterImages) {
            filterImages = filter;
            updateConversations();
        }
    }

    public boolean getFilterImages() {
        return filterImages;
    }

    public boolean shouldFilter(ConversationID id) {
        if (! filterImages) {
            return false;
        } else {
            HttpUrl url = _model.getRequestUrl(id);
            boolean result = pattern.matcher(url.toString()).matches();
            System.out.println("Result for " + url + " : " + result);
            return result;
        }
    }

}
