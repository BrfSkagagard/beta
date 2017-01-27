(function (staticWeb) {
  "use strict";
  var Login = function (element) {
    if (!(this instanceof Login)) {
      return new Login(element);
    }

    return this.init(element);
  }
  Login.prototype = {
    createInterface: function () {
      var self = this;
      //staticWeb.includeStyle(staticWeb.getAdminPath() + 'css/swadminzone.css');
      var templateName = 'swlogin' + self._level + '-LoggedOut';
      if (staticWeb.hasLoggedInInfo()) {
        templateName = 'swlogin' + self._level + '-LoggingIn';
      }
      self._element.innerHTML = '';
      staticWeb.retrieveTemplate(templateName, function (template) {
        var el = template.cloneNode(true);

        var state = localStorage.getItem('freightCrane.github.tokenState');
        if (!state) {
          state = 'ts' + new Date().getTime();
          localStorage.setItem('freightCrane.github.tokenState', state)
        }

        var link = el.querySelector('.sw-login');
        if (link) {
          var url = link.href;
          url = url.replace('?', '?state=' + state + '&');
          link.href = url;
        }

        staticWeb.insertTemplate(el, self._element);
      });
    },
    onStorageReady: function (storage) {
      var self = this;
      var level
      var templateName = false;
      if (staticWeb.isUserLevel(self._permission)) {
        templateName = 'swlogin' + self._level + '-LoggedIn';
      } else {
        templateName = 'swlogin' + self._level + '-LoggedOut';

      }
      staticWeb.retrieveTemplate(templateName, function (template) {
        self._element.innerHTML = '';
        var el = template.cloneNode(true);

        var state = localStorage.getItem('freightCrane.github.tokenState');
        if (!state) {
          state = 'ts' + new Date().getTime();
          localStorage.setItem('freightCrane.github.tokenState', state)
        }

        var link = el.querySelector('.sw-login');
        if (link) {
          var url = link.href;
          url = url.replace('?', '?state=' + state + '&');
          link.href = url;
        }

        staticWeb.insertTemplate(el, self._element);
      });
    },
    init: function (element) {
      var self = this;
      self._element = element;
      self._level = '';
      self._permission = element.getAttribute('data-sw-login-perm');
      if (self._permission) {
        self._level = '-' + self._permission;
      } else {
        self._level = '';
        self._permission = 'admin';
      }
      self.createInterface();
    }
  }
  staticWeb.registerComponent('sw-login', Login);
})(window.StaticWeb);
