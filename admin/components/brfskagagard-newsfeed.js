/* global tinymce */
(function (staticWeb) {
    "use strict";
    var AddButton = function (element, newsfeed) {
        if (!(this instanceof AddButton)) {
            return new AddButton(element, newsfeed);
        }

        return this.init(element, newsfeed);
    }
    AddButton.prototype = {
        init: function (element, newsfeed) {
            var self = this;
            self._element = element;
            self._newsfeed = newsfeed;
        }
    }

    var NewsFeedItem = function (element, newsfeed) {
        if (!(this instanceof NewsFeedItem)) {
            return new NewsFeedItem(element, newsfeed);
        }

        return this.init(element, newsfeed);
    }
    NewsFeedItem.prototype = {
        init: function (element, newsfeed) {
            var self = this;
            self._element = element;
            self._newsfeed = newsfeed;

            self._id = false;
            self._header = false;
            self._time = false;
            self._content = false;

            // set values from element
            if (element) {
                // we have element, get content from element
                // set id
                if (!element.id) {
                    var id = 'newsfeed-' + new Date().getTime();
                    element.id = id;
                    self._id = id;
                } else {
                    self._id = element.id;
                }

                // set header
                var h2 = newsItem.querySelector('h2');
                if (h2) {
                    if (h2.innerText) {
                        self._header = h2.innerText;
                    }
                }

                // set time
                var timeElement = newsItem.querySelector('time');
                if (timeElement) {
                    var dateTime = timeElement.getAttribute('datetime');
                    if (dateTime) {
                        self._time = dateTime;
                    } else {
                        var date = new Date();
                        self._time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                    }

                    // timeElement.innerText = self._time;
                    // timeElement.setAttribute('datetime', self._time);
                }
            }else {
                console.log('loading template');
                // we have no element, create one
                staticWeb.ensureLoaded('_itemTemplate', self._newsfeed, function() {
                    console.log('loaded template');
                });
            }


            staticWeb.ensureLoaded('tinymce', window, function () {

                var toolbar = '';
                switch (element.tagName.toLowerCase()) {
                    case 'h2':
                        toolbar = "save | undo redo";
                        element.setAttribute('data-brfskagagard-newsfeed-itemtype', 'header');
                        break;
                    case 'time':
                        toolbar = "save | undo redo";
                        element.setAttribute('data-brfskagagard-newsfeed-itemtype', 'time');
                        break;
                    case 'p':
                        toolbar = "save | bold italic | bullist numlist outdent indent | link image | undo redo";
                        element.setAttribute('data-brfskagagard-newsfeed-itemtype', 'content');
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
        createTinyMCEInstance: function (element) {
            var self = this;

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

        }
    }

    var NewsFeed = function (element) {
        if (!(this instanceof NewsFeed)) {
            return new NewsFeed(element);
        }

        return this.init(element);
    }
    NewsFeed.prototype = {
        // save: function (editor) {
        //     var content = editor.getContent();
        //     console.log('save 3', content, editor);
        //     editor.destroy();
        // },
        createInterface: function () {
            var self = this;

            staticWeb.retrieveTemplate("brfskagagard-newsfeed", function (template) {
                self._template = template;
                // get news item template
                self._itemTemplate = self._template.querySelector('newsfeed-item').children[0];

                self._addNewItemTemplate = self._template.querySelector('add-newsfeed').children[0];

                var items = self._element.querySelectorAll('.news-item');
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var newsFeedItem = new NewsFeedItem(item, self);
                    self._newsItems.push(newsFeedItem);
                }

                // no news items found, add "add" button.
                if (items.length === 0) {
                    staticWeb.insertTemplate(self._addNewItemTemplate, self._element);
                }

                // 
                var buttons = self._element.querySelectorAll('.newsfeed-add');
                for (var i = 0; i < buttons.length; i++) {
                    var button = buttons[i];
                    button.addEventListener('click', function (event) {
                        self.addButtonClickAction(event);
                    });
                }
            });
        },
        savePageChanges: function () {
            var self = this;
            var container = self._element;

            var content = '';
            for (var i = 0; i < self._newsItems.length; i++) {
                content += self._newsItems[i]
            }

            staticWeb.updateCurrentPage(container.id, container.tagName, content);
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

            var newsItem = new NewsFeedItem(false, self);



            self._newsItems.splice(0, 0, newsItem);

            var element = self._itemTemplate.cloneNode(true);
            event.target.insertAdjacentElement('afterend', element);
            // self.createTinyMCEInstance(newsItem.querySelector('h2'));

            // var timeElement = newsItem.querySelector('time');
            // var date = new Date();
            // timeElement.innerText = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            // timeElement.setAttribute('datetime', timeElement.innerText);

            // self.createTinyMCEInstance(newsItem.querySelector('time'));
            // self.createTinyMCEInstance(newsItem.querySelector('p'));
            self.addButton(element);
        },
        init: function (element) {
            var self = this;
            self._element = element;
            self._newsItems = [];

            if (!self._loaded) {
                self._loaded = true;
                staticWeb.includeScript("https://cdn.tinymce.com/4/tinymce.min.js");
            }
            
            //if (staticWeb.storage) {
                self.createInterface();
            //}
        }
    }
    staticWeb.registerComponent('brfskagagard-newsfeed', NewsFeed);

})(window.StaticWeb);