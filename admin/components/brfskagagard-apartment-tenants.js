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

            self._styrelseView = false;

            if (!staticWeb.config.permissions.check || staticWeb.isUserLevel('member') || staticWeb.isUserLevel('styrelsen')) {
                self.createInterface(staticWeb.storage);
            }
        },
        getApartmentRepo: function (storage, callback) {
            var apartmentRepo = localStorage.getItem('brfskagagard-member-apartment-repo');
            // If we have specified apartmentNumber in query, use it
            var searchForString = '?apartmentNumber=';
            if (window.location.search.indexOf(searchForString) == 0) {
                try {
                    var apartmentNumber = parseInt(window.location.search.replace("?apartmentNumber=", ''));
                    self._styrelseView = apartmentNumber;
                    callback('flowertwig-org/brfskagagard-styrelsen');

                    return;
                } catch (error) {

                }
            }

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
        updateOwner: function (element, info) {
            element.querySelector('.owner-name').innerHTML = info.Name;

            var emailContainer = element.querySelector('.owner-email');
            if (info.Email) {
                var emailElement = emailContainer.querySelector('a');
                emailElement.href = "mailto:" + info.Email;
            }
            else {
                emailContainer.remove();
            }

            var phoneContainer = element.querySelector('.owner-phone');
            if (info.Phone) {
                var phoneElement = phoneContainer.querySelector('a');
                phoneElement.href = 'tel:' + info.Phone;
                phoneElement.innerText = info.Phone;
            }
            else {
                phoneContainer.remove();
            }
        },
        updateApartmentInfo: function (apartmentInfo) {
            var self = this;

            self._element.querySelector('.building-address').innerHTML = apartmentInfo.Building;
            self._element.querySelector('.apartment-number').innerText = apartmentInfo.Number;
            self._element.querySelector('.apartment-moved-in-by').innerText = apartmentInfo.Owners[0].MovedIn;

            var ownerElement = self._element.querySelector('.apartment-owner');
            var ownerTemplate = ownerElement.cloneNode(true);
            self.updateOwner(ownerElement, apartmentInfo.Owners[0]);

            if (apartmentInfo.Owners.length > 1) {
                for (var index = 1; index < apartmentInfo.Owners.length; index++) {
                    var element = ownerTemplate.cloneNode(true);
                    self.updateOwner(element, apartmentInfo.Owners[index]);

                    ownerElement.insertAdjacentElement('afterEnd', element);

                }
            }

            var link = self._element.querySelector('.apartment-number-link');
            if (link) {
                link.href = link.href + apartmentInfo.Number;
            }
        },
        createInterface: function (storage) {
            var self = this;
            // If we have specified apartmentNumber in query, use it
            var searchForString = '?apartmentNumber=';
            if (window.location.search.indexOf(searchForString) == 0) {
                try {
                    var apartmentNumber = parseInt(window.location.search.replace("?apartmentNumber=", ''));
                    self._styrelseView = apartmentNumber;
                    callback('flowertwig-org/brfskagagard-styrelsen');

                    return;
                } catch (error) {

                }
            }

            // This method will be called by swadmin.js when storage is ready to be used.
            this.getApartmentRepo(storage, function (repoPath) {
                // Check if we have a valid repo path
                if (!!repoPath) {

                    var reportFilename = self._styrelseView ? 'apartment-' + self._styrelseView + '.json' : 'apartment.json';

                    storage.get(
                        reportFilename,
                        function (info, status) {
                            if (status.isOK) {
                                // Get apartment info
                                var apartmentInfo = JSON.parse(info.data);
                                self._apartmentInfo = apartmentInfo;
                                //if (self._template) {
                                self.updateApartmentInfo(apartmentInfo);
                                //}
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
    staticWeb.registerComponent('brfskagagard-apartment-tenants', MemberTest);
})(window.StaticWeb);