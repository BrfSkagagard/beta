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
        self._itemTemplate = self._template.querySelector('sw-item').children[0];

        // Hide extra scroll while dialog is visible
        var body = document.querySelector('body');
        body.style.overflowY = 'hidden';

        staticWeb.insertTemplate(self._dialogTemplate, self._element);

        if (!self._showAdd) {
          self.showAddControls(false);
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
        // get menu items
        self.getMenuItems();
      });
    },
    showAddControls: function (show) {
      var self = this;
      var addContainer = self._element.querySelector('.sw-navigation-dialog-add-nav');
      addContainer.style.display = show ? '' : 'none';
    },
    showNavigationControls: function (show) {
      var self = this;
      var navSaveBtn = self._element.querySelector('.sw-navigation-dialog-save-nav');
      var navContainer = self._element.querySelector('.sw-navigation-dialog-navigation');
      navContainer.style.display = show ? '' : 'none';

      if (show) {
        // removing old items
        var items = navContainer.querySelectorAll('ul li');
        for (var i = 0; i < items.length; i++) {
          items[i].remove();
        }

        // add menu items
        var list = navContainer.querySelector('ul');
        for (var i = 0; i < self._menuItems.length; i++) {
          var item  = self._menuItems[i];
          if (!item) {
            continue;
          }
          var text = staticWeb.decodeToText(item.text);
          var url = item.url;

          var element = self._itemTemplate.cloneNode(true);
          element.setAttribute('sw-navigation-dialog-navigation-item-path', url);
          element.querySelector('.sw-navigation-dialog-navigation-item-text').innerText = text;

          list.appendChild(element);
        }

        // add event handlers
        var items = navContainer.querySelectorAll('ul li');
        for (var i = 0; i < items.length; i++) {
          self.setupItem(items[i], i);
        }

        // show save button
        navSaveBtn.style.display = '';
      } else {
        // hide save button if we have no navigation to show
        navSaveBtn.style.display = 'none';
      }
      console.log('menuItems:', self._menuItems);
    },
    setupItem: function (item, i) {
      var self = this;
      item.setAttribute('draggable', 'true');
      item.id = 'sw-navigation-dialog-navigation-item-' + i;
      item.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData("text", event.target.id);
      });
      item.addEventListener('dragover', function (event) {
        event.preventDefault();
        // Set the dropEffect to move
        event.dataTransfer.dropEffect = "move";
      });
      item.addEventListener('drop', function (event) {
        event.preventDefault();
        var data = event.dataTransfer.getData("text");
        var target = event.target;
        while (!target.id) {
          target = target.parentNode;
        }
        var el = document.querySelector('#' + data);
        if (el) {
          target.insertAdjacentElement('afterend', el);
        }
      });
      item.querySelector('.sw-navigation-dialog-navigation-item-delete').addEventListener('click', function (event) {
        event.preventDefault();

        var currentUrl = item.getAttribute('sw-navigation-dialog-navigation-item-path');
        self.removeMenuIem(currentUrl);
        self.showNavigationControls(true);
      });
    },
    removeMenuIem: function (currentUrl) {
      var self = this;
      for (var i = self._menuItems.length; i >= 0; i--) {
        var item = self._menuItems[i];
        if (!item) {
          continue;
        }

        var url = item.url;
        if (currentUrl === url) {
          delete self._menuItems[i];
          return;
        }
      }
    },
    getCurrentPath: function () {
      var path = window.location.pathname;
      // remove index.html from path
      path = path.toLowerCase().replace('/index.html', '');
      // Ensure that last char is slash
      if (path.length > 0 && path[path.length - 1] !== '/') {
        path = path + '/';
      }
      // dont allow empty path (Assume root node)
      if (path === '') {
        path = '/';
      }
      return path;
    },
    getConfigPath: function () {
      var self = this;
      var storagePath = false;
      switch (self._navType) {
        default:
        case 'global':
          storagePath = staticWeb.getAdminPath() + 'config/components/sw-navigation/';
          if (self._navName) {
            storagePath = storagePath + self._navName + '.json';
          } else {
            storagePath = storagePath + 'sw-navigation.json';
          }
          break;
        case 'local':
          storagePath = self.getCurrentPath();
          if (self._navName) {
            storagePath = storagePath + 'sw-navigation-' + self._navName + '.json';
          } else {
            storagePath = storagePath + 'sw-navigation.json';
          }
          break;
      }
      return storagePath;
    },
    getMenuItems: function () {
      var self = this;
      // set storage path to folder we should use (global or local)
      var storagePath = self.getConfigPath();
      console.log('storagePath:', storagePath);
      staticWeb.storage.get(storagePath, function (file, callStatus) {
        if (callStatus.isOK) {
          var data = file.data;
          var obj = JSON.parse(file.data);
          self._menuItems = obj.list;
        } else {
          self._menuItems = [];
        }

        self.showAddControls(true);
        if (!self._menuItems.length) {
          self.showNavigationControls(false);
        } else {
          self.showNavigationControls(true);
        }
      });
    },
    saveMenuItems: function () {
      var self = this;
      // set storage path to folder we should use (global or local)
      var storagePath = self.getConfigPath();
      console.log('storagePath:', storagePath);

      var obj = {
        list: self._menuItems
      };
      var data = JSON.stringify(obj);

      // update navigation settings file
      staticWeb.storage.set(storagePath, data, function (file, callStatus) {
        if (callStatus.isOK) {
          // Should we do something here?
        }
      });

      // TODO: Update pages that uses the navigation
    },
    setupEventListeners: function () {
      var self = this;
      var element = self._element;

      // our dialog needs to be closabe, this will remove dialog when clicking close button
      var closeBtn = element.querySelector('.sw-onpage-dialog-close');
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();

        element.remove();
        var body = document.querySelector('body');
        body.style.overflowY = '';
      });

      // add navigation button
      var addLinkBtn = element.querySelector('.sw-navigation-dialog-add-link');
      addLinkBtn.addEventListener('click', function (event) {
        event.preventDefault();

        var name = self._element.querySelector('#sw-navigation-dialog-name').value;
        var link = self._element.querySelector('#sw-navigation-dialog-url').value;

        self._menuItems.push({
          'text': staticWeb.encodeToHtml(name),
          'url': link
        });

        self.showNavigationControls(true);
      });

      // save navigation button
      var navSaveBtn = self._element.querySelector('.sw-navigation-dialog-save-nav');
      navSaveBtn.addEventListener('click', function (event) {
        event.preventDefault();

        self.saveMenuItems();
      });
    },
    init: function (element) {
      var self = this;

      self._menuItems = [];

      self._element = element;
      self._showAdd = false;
      self._url = self._element.getAttribute('data-staticweb-component-navigation-path');
      self._name = self._element.getAttribute('data-staticweb-component-navigation-name');
      self._navType = self._element.getAttribute('data-staticweb-component-navigation-type');
      if (!self._navType) {
        self._navType = 'local';
      }
      self._navName = self._element.getAttribute('data-staticweb-component-navigation-id');

      self._showAdd = !!self._name || !!self._url;

      self.createInterface();
    }
  }
  staticWeb.registerComponent('sw-navigation-dialog', Dialog);

})(window.StaticWeb);