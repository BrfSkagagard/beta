// Require GitHub storage provider to work...
(function (staticWeb) {
    "use strict";
    var MemberTest = function (element) {
        if (!(this instanceof MemberTest)) {
            return new MemberTest(element);
        }

        return this.init(element);
    }
    MemberTest.prototype = {
        init: function (element) {
            var self = this;
            self._element = element;
            self._template = false;
            self._apartmentInfo = false;

            staticWeb.retrieveTemplate("brfskagagard-member-options", function (template) {
                self._template = template;
                staticWeb.insertTemplate(self._template, self._element);
                if (self._apartmentInfo) {
                    self.updateApartmentInfo(self._apartmentInfo);
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
        updateApartmentInfo: function (apartmentInfo) {
            var options = document.getElementsByClassName('brfskagagard-member-options');
            for (var index = 0; index < options.length; index++) {
                var element = options[index];
                element.style.display = 'block';
            }

            this.setTextOnElements('flowertwig-mypages-options-info-building', apartmentInfo.Building);
            this.setTextOnElements('flowertwig-mypages-options-info-apartment', 'Lgh. ' + apartmentInfo.Number);
            this.setTextOnElements('flowertwig-mypages-options-info-size', 'Storlek: ' + apartmentInfo.Size);

            var delivery = [];
            for (var index = 0; index < apartmentInfo.Owners.length; index++) {
                var owner = apartmentInfo.Owners[index];
                for (var index2 = 0; index2 < owner.WayOfInfo.length; index2++) {
                    var way = owner.WayOfInfo[index2];
                    if (delivery.indexOf(way) === -1) {
                        delivery.push(way);
                    }
                }
            }

            this.setTextOnElements('flowertwig-mypages-options-info-delivery', delivery.join(','));
            this.setTextOnElements('flowertwig-mypages-options-info-tenents', 'Boende: ' + apartmentInfo.Owners.length + ' st');
        },
        setTextOnElements: function (className, text) {
            var elements = document.getElementsByClassName(className);
            for (var index = 0; index < elements.length; index++) {
                var element = elements[index];
                this.setTextForElement(element, text);
            }
        },
        setTextForElement: function (element, text) {
            element.innerText = text;
        },
        createInterface: function (storage) {
            var self = this;

            // This method will be called by swadmin.js when storage is ready to be used.
            this.getApartmentRepo(storage, function (repoPath) {
                // Check if we have a valid repo path
                if (!!repoPath) {
                    storage.get(
                        'apartment.json',
                        function (info, status) {
                            if (status.isOK) {
                                // Get apartment info
                                var apartmentInfo = JSON.parse(info.data);
                                self._apartmentInfo = apartmentInfo;
                                if (self._template) {
                                    self.updateApartmentInfo(apartmentInfo);
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
    },
        staticWeb.registerComponent('brfskagagard-member-options', MemberTest);
})(window.StaticWeb);