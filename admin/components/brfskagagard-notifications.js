// Require GitHub storage provider to work...
(function (staticWeb) {
    "use strict";
    var Notifications = function (element) {
        if (!(this instanceof Notifications)) {
            return new Notifications(element);
        }

        return this.init(element);
    }
    Notifications.prototype = {
        init: function (element) {
            var self = this;
            self._element = element;
            self._container = false;
            self._template = false;
            self._notifications = false;

            staticWeb.retrieveTemplate("brfskagagard-notifications", function (template) {
                self._template = template.querySelector('notifications').children[0];
                self._templateInformatoin = template.querySelector('information').children[0];
                self._templateWarning = template.querySelector('warning').children[0];
                self._templateCritical = template.querySelector('critical').children[0];
                staticWeb.insertTemplate(self._template, self._element);
                self._container = self._element.querySelector('.notifications');
                if (self._notifications) {
                    self.updateNotifications(self._notifications);
                }
            });

            if (!staticWeb.config.permissions.check || staticWeb.isUserLevel('member')) {
                self.createInterface(staticWeb.storage);
            }
        },
        getApartmentRepo: function (storage, callback) {
            var apartmentRepo = localStorage.getItem('brfskagagard-member-apartment-repo');
            if (!!apartmentRepo) {
                callback(apartmentRepo);
            } else {
                storage.listStorages(function (repos) {
                    for (var repoIndex = 0; repoIndex < repos.length; repoIndex++) {
                        var currentRepo = repos[repoIndex];
                        // in our test the repo name needs to start with 'brfskagagard-lgh'
                        var isApartmentRepo = currentRepo.name.indexOf('brfskagagard-lgh') === 0;
                        if (isApartmentRepo) {
                            // Storing for faster use next time
                            localStorage.setItem('brfskagagard-member-apartment-repo', currentRepo.path);
                            callback(currentRepo.path);
                            return;
                        }
                    }
                    callback(false);
                });
            }
        },
        updateNotifications: function (notifications) {
            var self = this;
            for (var index = 0; index < notifications.length; index++) {
                var notification = notifications[index];

                var node = false;
                switch (notification.Type) {
                    case 0:
                        node = self._templateInformatoin.cloneNode(true);
                        console.log('information');
                        break;
                    case 1:
                        node = self._templateWarning.cloneNode(true);
                        console.log('warning');
                        break;
                    case 2:
                        node = self._templateCritical.cloneNode(true);
                        console.log('critical');
                        break;
                }
                if (node) {
                    var contentNode = node.querySelector('.notification-content');
                    contentNode.innerHTML = notification.Message;
                    staticWeb.insertTemplate(node, self._container);
                }

                console.log(notification);
            }

            var closeNodes = self._container.querySelectorAll('.notification-close');
            for (var index = 0; index < closeNodes.length; index++) {
                var closeNode = closeNodes[index];
                closeNode.addEventListener('click', function () {
                    this.parentNode.style.display = 'none';
                });
            }
            
        },
        setTextOnElements: function (className, text) {
            var elements = document.getElementsByClassName(className);
            for (var index = 0; index < elements.length; index++) {
                var element = elements[index];
                this.setTextForElement(element, text);
            }
        },
        setTextForElement: function (element, text) {
            element.innerHTML = text;
        },
        createInterface: function (storage) {
            var self = this;

            // This method will be called by swadmin.js when storage is ready to be used.
            this.getApartmentRepo(storage, function (repoPath) {
                // Check if we have a valid repo path
                if (!!repoPath) {
                    storage.get(
                        'notifications.json',
                        function (info, status) {
                            if (status.isOK) {
                                // Get apartment info
                                var notifications = JSON.parse(info.data);
                                self._notifications = notifications;
                                if (self._template) {
                                    self.updateNotifications(notifications);
                                }
                            }
                        },
                        { 'repo': repoPath }
                    );
                } else {
                    // TODO: update view to user, invalid access...
                }
            });
        }
    }
    staticWeb.registerComponent('brfskagagard-notifications', Notifications);
})(window.StaticWeb);