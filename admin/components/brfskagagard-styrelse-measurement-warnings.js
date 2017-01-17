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

            self._heat = false;
            self._cost = false;
            self._warmWater = false;
            self._period = false;

            staticWeb.retrieveTemplate("brfskagagard-styrelse-measurement-warnings-Period", function (template) {

                self._templatePeriod = template.querySelector('view');
                self._templatePeriodItem = template.querySelector('item');

                if (self._period) {
                    self.updatePeriod(self._period);
                }
            });

            staticWeb.retrieveTemplate("brfskagagard-styrelse-measurement-warnings-Cost", function (template) {

                self._templateCost = template.querySelector('view');
                self._templateCostItem = template.querySelector('item');

                if (self._cost) {
                    self.updateCost(self._cost);
                }
            });

            staticWeb.retrieveTemplate("brfskagagard-styrelse-measurement-warnings-WarmWater", function (template) {

                self._templateWarmWater = template.querySelector('view');
                self._templateWarmWaterItem = template.querySelector('item');

                if (self._warmWater) {
                    self.updateWarmWater(self._warmWater);
                }
            });

            staticWeb.retrieveTemplate("brfskagagard-styrelse-measurement-warnings-Heat", function (template) {

                self._templateHeat = template.querySelector('view');
                self._templateHeatItem = template.querySelector('item');

                if (self._heat) {
                    self.updateHeat(self._heat);
                }
            });

            if (!staticWeb.config.permissions.check || staticWeb.isUserLevel('styrelsen')) {
                self.createInterface(staticWeb.storage);
            }
        },
        updateWarningList: function (template, templateItem, info) {
            var self = this;
            if (template && templateItem && info) {
                var self = this;
                var el = template.cloneNode(true);
                var list = el.querySelector('ul');
                for (var i = 0; i < info.length; i++) {
                    var child = templateItem.children[0].cloneNode(true);
                    var link = child.querySelector('a');
                    link.href = '/styrelsen/matning/detaljer/?apartmentNumber=' + info[i].ApartmentNumber;
                    link.innerText = 'Lägenhet ' + info[i].ApartmentNumber;

                    var span = child.querySelector('span');
                    span.innerText = info[i].Text;

                    list.appendChild(child);
                }

                staticWeb.insertTemplate(el, self._element);
            }

        },
        updateWarmWater: function (info) {
            var self = this;
            self.updateWarningList(self._templatePeriod, self._templatePeriodItem, info);
        },
        updateWarmWater: function (info) {
            var self = this;
            self.updateWarningList(self._templateWarmWater, self._templateWarmWaterItem, info);
        },
        updateHeat: function (info) {
            var self = this;
            self.updateWarningList(self._templateHeat, self._templateHeatItem, info);
        },
        updateCost: function (info) {
            var self = this;
            self.updateWarningList(self._templateCost, self._templateCostItem, info);
        },
        createInterface: function (storage) {
            var self = this;

            // Period
            storage.get(
                'minol-styrelse-Period-last-month.json',
                function (info, status) {
                    if (status.isOK) {
                        self._period = JSON.parse(info.data);
                        self.updateWarmWater(self._period);
                    }
                },
                { 'repo': 'flowertwig-org/brfskagagard-styrelsen' }
            );

            // Cost
            storage.get(
                'minol-styrelse-Cost-last-month.json',
                function (info, status) {
                    if (status.isOK) {
                        self._cost = JSON.parse(info.data);
                        self.updateCost(self._cost);
                    }
                },
                { 'repo': 'flowertwig-org/brfskagagard-styrelsen' }
            );

            // WarmWater
            storage.get(
                'minol-styrelse-WarmWater-last-month.json',
                function (info, status) {
                    if (status.isOK) {
                        self._warmWater = JSON.parse(info.data);
                        self.updateWarmWater(self._warmWater);
                    }
                },
                { 'repo': 'flowertwig-org/brfskagagard-styrelsen' }
            );

            // Heat
            storage.get(
                'minol-styrelse-Heat-last-month.json',
                function (info, status) {
                    if (status.isOK) {
                        self._heat = JSON.parse(info.data);
                        self.updateHeat(self._heat);
                    }
                },
                { 'repo': 'flowertwig-org/brfskagagard-styrelsen' }
            );
        }
    }
    staticWeb.registerComponent('brfskagagard-styrelse-measurement-warnings', MemberTest);
})(window.StaticWeb);