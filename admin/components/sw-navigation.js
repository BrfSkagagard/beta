/* global tinymce */
(function (staticWeb) {
    "use strict";
    var Navigation = function (element) {
        if (!(this instanceof Navigation)) {
            return new Navigation(element);
        }

        return this.init(element);
    }
    Navigation.prototype = {
        createInterface: function () {
            var self = this;

            self._element.addEventListener('drop', function (event) {
                event.preventDefault();

                var url = event.dataTransfer.getData("text/uri-list");
                // Get the id of the target and add the moved element to the target's DOM
                var navNodeData = event.dataTransfer.getData("sw-navNodeData");
                if (navNodeData) {
                    var navNode = JSON.parse(navNodeData);
                    // todo: get real name of page
                    name = navNode.name;
                    url = navNode.path;
                    staticWeb.storage.get(navNode.path + 'metadata.json', function (file, callStatus) {
                        if (callStatus.isOK) {
                            var metadata = JSON.parse(file.data);
                            name = staticWeb.decodeToText(metadata.name);
                        }
                        self.addNavigationItemDialog(url, name);
                    });
                    return;
                }

                self.addNavigationItemDialog(url, 'unknown name');
            });

            self._element.addEventListener('dragover', function (event) {
                event.preventDefault();
                // Set the dropEffect to move
                event.dataTransfer.dropEffect = "copy";
            });

            self._element.addEventListener('click', function (event) {
                // prevent link actions
                event.preventDefault();

                var attributes = {};
                var body = document.querySelector('body');
                staticWeb.initComponent(body, 'sw-navigation-dialog', attributes);
                return false;
            });
        },
        addNavigationItemDialog: function (url, name) {
            var self = this;

            var attributes = {
                'data-staticweb-component-navigation-path': url,
                'data-staticweb-component-navigation-name': name
            };
            var body = document.querySelector('body');
            staticWeb.initComponent(body, 'sw-navigation-dialog', attributes);
        },
        init: function (element) {
            var self = this;
            self._element = element;
            if (staticWeb.storage) {
                self.createInterface();
            }
        }
    }
    staticWeb.registerComponent('sw-navigation', Navigation);

})(window.StaticWeb);