(function (staticWeb) {
  "use strict";
  var Dialog = function (element) {
    if (!(this instanceof Dialog)) {
      return new Dialog(element);
    }

    return this.init(element);
  }
  Dialog.prototype = {
    createInterface: function () {
      var self = this;

      staticWeb.retrieveTemplate("sw-navigation-dialog", function (template) {
        self._template = template;
        // get the dialog template
        self._dialogTemplate = self._template.querySelector('sw-dialog').children[0];

        // Hide extra scroll while dialog is visible
        var body = document.querySelector('body');
        body.style.overflowY = 'hidden';

        staticWeb.insertTemplate(self._dialogTemplate, self._element);

        if (!self._showAdd) {
          var addContainer = self._element.querySelector('.sw-navigation-dialog-add-nav');
          addContainer.style.display = 'none';
        }

        if (self._name) {
          var nameInput = self._element.querySelector('#sw-navigation-dialog-name');
          nameInput.value = self._name;
        }

        if (self._url) {
          var urlInput = self._element.querySelector('#sw-navigation-dialog-url');
          urlInput.value = self._url;
        }

        // setup auto path generate and add page events.
        self.setupEventListeners();
      });
    },
    setupEventListeners: function () {
      var self = this;
      var element = self._element;

      // our dialog needs to be closabe, this will remove dialog when clicking close button
      var closeBtn = element.querySelector('.sw-onpage-dialog-close');
      closeBtn.addEventListener('click', function () {
        element.remove();
        var body = document.querySelector('body');
        body.style.overflowY = '';
      });


    },
    init: function (element) {
      var self = this;
      self._element = element;
      self._showAdd = false;
      self._url = self._element.getAttribute('data-staticweb-component-navigation-path');
      self._name = self._element.getAttribute('data-staticweb-component-navigation-name');
      self._navType = self._element.getAttribute('data-staticweb-component-navigation-type');
      self._navName = self._element.getAttribute('data-staticweb-component-navigation-id');

      self._showAdd = !!self._name || !!self._url;

      self.createInterface();
    }
  }
  staticWeb.registerComponent('sw-navigation-dialog', Dialog);

})(window.StaticWeb);