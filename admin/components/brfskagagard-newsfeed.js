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
        createTinyMCEInstance: function (element) {
            var self = this;
            if (!self._loaded) {
                self._loaded = true;
                staticWeb.includeScript("https://cdn.tinymce.com/4/tinymce.min.js");
            }
            staticWeb.ensureLoaded('tinymce', window, function () {
                if (!element.id) {
                    element.id = 'newsfeed-' + new Date().getTime();
                }

                var toolbar = '';
                switch (element.tagName.toLowerCase()) {
                    case 'h2':
                    case 'time':
                        toolbar = "save | undo redo";
                        break;
                    case 'p':
                        toolbar = "save | bold italic | bullist numlist outdent indent | link image | undo redo";
                        break;
                }

                // TODO: see if element in question have a 'data-staticweb-component-swtext-data' attribute and use that for the toolbar options
                tinymce.init({
                    selector: '#' + element.id,
                    inline: true,
                    menubar: false,
                    browser_spellcheck: true,
                    plugins: "save",
                    toolbar: toolbar,
                    save_onsavecallback: self.save
                });
            });
        },
        save: function (editor) {

        },
        createInterface: function () {
            var self = this;

            staticWeb.retrieveTemplate("brfskagagard-newsfeed", function (template) {
                self._template = template;
                // get news item template
                self._itemTemplate = self._template.querySelector('newsfeed-item').children[0];

                self._addNewItemTemplate = self._template.querySelector('add-newsfeed').children[0];

                if (self._element.children.length === 0) {
                    staticWeb.insertTemplate(self._addNewItemTemplate, self._element);
                }

                var items = self._element.querySelectorAll('.newsfeed-add');
                for (var i = 0; i < items.length; i++) {
                    var button = items[i];
                    button.addEventListener('click', function (event) {
                        self.addButtonClickAction(event);
                    });
                }
            });
        },
        addButton: function (element) {
            var self = this;
            var btn = self._addNewItemTemplate.cloneNode(true);
            element.insertAdjacentElement('afterend', btn);

            btn.addEventListener('click', function (event) {
                self.addButtonClickAction(event);
            });
        },
        addButtonClickAction: function (event) {
            var self = this;
            event.preventDefault();

            var newsItem = self._itemTemplate.cloneNode(true);
            event.target.insertAdjacentElement('afterend', newsItem);
            self.createTinyMCEInstance(newsItem.querySelector('h2'));

            var timeElement = newsItem.querySelector('time');
            var date = new Date();
            timeElement.innerText = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            timeElement.setAttribute('datetime', timeElement.innerText);

            self.createTinyMCEInstance(newsItem.querySelector('time'));
            self.createTinyMCEInstance(newsItem.querySelector('p'));
            self.addButton(newsItem);
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