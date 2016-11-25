/* global tinymce */
(function (staticWeb) {
    "use strict";
    var NewsFeed = function (element) {
        if (!(this instanceof NewsFeed)) {
            return new NewsFeed(element);
        }

        return this.init(element);
    }
    NewsFeed.prototype = {
        createInterface: function () {
            var self = this;

            staticWeb.retrieveTemplate("brfskagagard-newsfeed", function (template) {
                self._template = template;
                // get news item template
                self._itemTemplate = self._template.querySelector('newsfeed-item').children[0];

                staticWeb.insertTemplate(self._itemTemplate, self._element);
            });
        },
        init: function (element) {
            var self = this;
            self._element = element;
            if (staticWeb.storage) {
                self.createInterface();
            }
        }
    }
    staticWeb.registerComponent('brfskagagard-newsfeed', NewsFeed);

})(window.StaticWeb);