// Generated by CoffeeScript 1.8.0
(function() {
  var Client, ProgressBar,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  console.log = function() {};

  $.fn.enable = function() {
    return this.removeAttr('disabled');
  };

  $.fn.disable = function() {
    return this.attr('disabled', 'disabled');
  };

  Client = (function() {
    Client.prototype.baseUrl = '/admin/djedi/cms/';

    function Client(baseUrl, uri) {
      this.baseUrl = baseUrl;
      this.uri = uri;
    }

    Client.prototype.URL = function(path) {
      return this.baseUrl + path;
    };

    Client.prototype.e = function(uri) {
      return encodeURIComponent(encodeURIComponent((uri || this.uri).valueOf()));
    };

    Client.prototype.AJAX = function(method, path, data, callback) {
      var response;
      if (callback != null) {
        return $.ajax({
          type: method,
          url: this.URL(path),
          data: data,
          success: function(data, textStatus, jqXHR) {
            return callback(data);
          }
        });
      } else {
        response = $.ajax({
          type: method,
          url: this.URL(path),
          data: data,
          async: false
        });
        if (response.status === 200) {
          return response.responseText;
        } else {
          return void 0;
        }
      }
    };

    Client.prototype.GET = function(path, callback) {
      return this.AJAX("GET", path, null, callback);
    };

    Client.prototype.GET_JSON = function(path, callback) {
      var r;
      if (callback != null) {
        return this.GET(path, callback);
      } else {
        if (r = this.GET(path)) {
          return JSON.parse(r);
        } else {
          return void 0;
        }
      }
    };

    Client.prototype.POST = function(path, data, callback) {
      return this.AJAX("POST", path, data, callback);
    };

    Client.prototype.PUT = function(path, data, callback) {
      return this.AJAX("PUT", path, data, callback);
    };

    Client.prototype.DELETE = function(path, callback) {
      return this.AJAX("DELETE", path, null, callback);
    };

    Client.prototype.get = function(uri, callback) {
      return this.GET_JSON("node/" + (this.e(uri)), callback);
    };

    Client.prototype.editor = function(uri, callback) {
      return this.GET("node/" + (this.e(uri)) + "/editor", callback);
    };

    Client.prototype.set = function(uri, data, callback) {
      var response;
      response = this.POST("node/" + (this.e(uri)), data, callback);
      if (!callback) {
        return JSON.parse(response);
      }
    };

    Client.prototype.publish = function(uri, callback) {
      return JSON.parse(this.PUT("node/" + (this.e(uri)) + "/publish", callback));
    };

    Client.prototype.revisions = function(uri, callback) {
      return this.GET_JSON("node/" + (this.e(uri)) + "/revisions", callback);
    };

    Client.prototype["delete"] = function(uri, callback) {
      return this.DELETE("node/" + (this.e(uri)), callback);
    };

    Client.prototype.load = function(uri, callback) {
      return this.GET_JSON("node/" + (this.e(uri)) + "/load", callback);
    };

    Client.prototype.render = function(ext, data, callback) {
      return this.POST("plugin/" + ext, data, callback);
    };

    return Client;

  })();

  ProgressBar = (function() {
    function ProgressBar(el) {
      this.$el = $(el);
      this.bar = this.$el.find('.progress-bar');
    }

    ProgressBar.prototype.show = function() {
      this.$el.addClass('active');
      return this.$el.show();
    };

    ProgressBar.prototype.hide = function() {
      this.$el.hide();
      return this.$el.removeClass('active');
    };

    ProgressBar.prototype.update = function(data) {
      var progress;
      progress = parseInt(data.loaded / data.total * 100, 10);
      return this.bar.css({
        width: progress + '%'
      });
    };

    return ProgressBar;

  })();

  window.Editor = (function() {
    function Editor(config) {
      this.config = config;
      this.getPluginColor = __bind(this.getPluginColor, this);
      this.save = __bind(this.save, this);
      this.discard = __bind(this.discard, this);
      this.publish = __bind(this.publish, this);
      this.loadRevision = __bind(this.loadRevision, this);
      this.onPublish = __bind(this.onPublish, this);
      this.onSave = __bind(this.onSave, this);
      this.onFormChange = __bind(this.onFormChange, this);
      this.onLoad = __bind(this.onLoad, this);
      console.log('Editor.constructor', this);
      if (document.readyState === 'complete') {
        this.initialize(this.config);
      } else {
        $(window).one('load', (function(_this) {
          return function() {
            return setTimeout((function() {
              return _this.initialize(_this.config);
            }), 0);
          };
        })(this));
      }
    }

    Editor.prototype.initialize = function(config) {
      console.log('Editor.initialize');
      this.api = new Client(window.DJEDI_ENDPOINT);
      this.$doc = $(document);
      this.actions = {
        discard: $('#button-discard'),
        save: $('#button-save'),
        publish: $('#button-publish')
      };
      this.$form = $('#form');
      this.progressbar = new ProgressBar('#progressbar');
      this.$plugin = $('header .plugin');
      this.$path = $('header .uri');
      this.$version = $('header .version');
      this.$flag = $('header .flag');
      this.$doc.on('editor:save', (function(_this) {
        return function() {
          return _this.$form.submit();
        };
      })(this));
      this.$doc.on('editor:publish', (function(_this) {
        return function() {
          return _this.onPublish();
        };
      })(this));
      this.actions.publish.on('click', this.publish);
      this.actions.discard.on('click', this.discard);
      this.actions.save.on('click', this.save);
      this.$form.ajaxForm({
        beforeSubmit: this.prepareForm,
        success: this.onSave
      });
      $('#form input').on('change', this.onFormChange);
      $('#form textarea').on('change', this.onFormChange);
      $('#form select').on('change', this.onFormChange);
      this.$doc.on('form:change', this.onFormChange);
      this.$doc.ajaxStart(function() {
        return $('#spinner').toggleClass('icon-spin').show();
      });
      this.$doc.ajaxStop(function() {
        return $('#spinner').toggleClass('icon-spin').hide();
      });
      console.log(config);
      this.api.load(config.uri, this.onLoad);
      this.callback('initialize', config);
      this.initialized = true;
      window.editor = this;
      return this.trigger('editor:initialized', this, config);
    };

    Editor.prototype.callback = function() {
      var args, callback, name;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      callback = this.config[name];
      if (callback) {
        return callback.apply(this, args);
      }
    };

    Editor.prototype.delay = function(time, func) {
      return setTimeout(func, time);
    };

    Editor.prototype.trigger = function() {
      var eventType, params;
      eventType = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      console.log('Editor.trigger', eventType);
      return this.$doc.trigger(eventType, params);
    };

    Editor.prototype.triggerRender = function(content) {
      return this.trigger('node:render', this.node.uri.valueOf(), content);
    };

    Editor.prototype.prepareForm = function() {};

    Editor.prototype.onLoad = function(node) {
      var initial;
      console.log('Editor.onLoad()');
      initial = this.node === void 0;
      if (initial) {
        this.trigger('page:node:fetch', node.uri.valueOf(), (function(_this) {
          return function(node) {
            console.log('Editor.inititial data', node);
            return _this.initial = node;
          };
        })(this));
      }
      node = this.setNode(node);
      if (initial) {
        this.trigger('plugin:loaded', node.uri.valueOf());
      }
      this.render(node);
      if (!node.meta.is_published) {
        this.delay(0, (function(_this) {
          return function() {
            return _this.trigger('node:render', node.uri.valueOf(), node.content || '');
          };
        })(this));
      }
      return console.log('Editor.onLoad() full node', node);
    };

    Editor.prototype.onFormChange = function(event) {
      console.log('Editor.onFormChange()');
      this.trigger('editor:dirty');
      this.setState('dirty');
      return this.callback('onFormChange', event);
    };

    Editor.prototype.onSave = function(node) {
      console.log('Editor.onSave()');
      node = this.setNode(node);
      this.render(node);
      this.trigger('node:update', node.uri.valueOf(), node);
      return this.trigger('node:render', node.uri.valueOf(), node.content);
    };

    Editor.prototype.onPublish = function() {
      var node;
      node = this.api.publish(this.node.uri.valueOf());
      this.setNode(node);
      return this.setState('published');
    };

    Editor.prototype.setNode = function(node) {
      console.log('Editor.setNode()');
      this.node = node;
      this.node.uri = node.uri.to_uri();
      if (node.uri.version === 'draft') {
        this.setState('draft');
      } else {
        if (!node.uri.version) {
          this.setState('new');
        } else {
          this.setState('published');
        }
      }
      if (this.node.data === null) {
        this.trigger('page:node:fetch', this.node.uri.valueOf(), (function(_this) {
          return function(node) {
            _this.node.data = node.data;
            return _this.node.content = _this.renderContent(node.data);
          };
        })(this));
      }
      this.renderHeader(this.node);
      this.renderRevisions();
      return this.node;
    };

    Editor.prototype.setState = function(state) {
      var oldState;
      console.log('Editor.setState()', state);
      if (state !== this.state) {
        oldState = this.state;
        this.state = state;
        this.$version.removeClass('label-default label-warning label-danger label-info label-success');
        switch (state) {
          case 'new':
            this.$version.addClass('label-default');
            this.actions.discard.disable();
            this.actions.save.enable();
            this.actions.publish.disable();
            break;
          case 'dirty':
            this.$version.addClass('label-danger');
            this.actions.discard.enable();
            this.actions.save.enable();
            this.actions.publish.disable();
            break;
          case 'draft':
            this.$version.addClass('label-primary');
            this.actions.discard.enable();
            this.actions.save.disable();
            this.actions.publish.enable();
            break;
          case 'published':
            this.$version.addClass('label-success');
            this.actions.discard.disable();
            this.actions.save.disable();
            this.actions.publish.disable();
            break;
          case 'revert':
            this.$version.addClass('label-warning');
            this.actions.discard.disable();
            this.actions.save.disable();
            this.actions.publish.enable();
        }
        return this.trigger('editor:state-changed', oldState, state, this.node);
      }
    };

    Editor.prototype.renderHeader = function(node) {
      var color, lang, part, parts, path, uri, v;
      uri = node.uri;
      color = this.getPluginColor(uri.ext);
      parts = (function() {
        var _i, _len, _ref, _results;
        _ref = uri.path.split('/');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          part = _ref[_i];
          if (part !== '') {
            _results.push((part.slice(0, 1).toUpperCase() + part.slice(1)).replace(/[_-]/g, ' '));
          }
        }
        return _results;
      })();
      path = parts.join(" <span class=\"" + color + "\">/</span> ");
      if (uri.scheme === 'i18n') {
        lang = uri.namespace.split('-')[0];
      }
      this.$plugin.html(uri.ext).addClass(color);
      this.$path.html(path);
      this.$flag.addClass("flag-" + lang);
      v = this.$version.find('var');
      v.html(this.versionLabel(uri.version));
      return this;
    };

    Editor.prototype.versionLabel = function(version) {
      if (!version) {
        return 'default';
      } else if (!isNaN(parseInt(version, 10))) {
        return "v" + version;
      } else {
        return version;
      }
    };

    Editor.prototype.renderRevisions = function() {
      var $li, $link, $menu, baseUri, published, uri, _i, _len, _ref, _ref1;
      console.log('Editor.renderRevisions()');
      baseUri = this.node.uri.valueOf().to_uri();
      baseUri.version = null;
      baseUri = baseUri.valueOf();
      this.revisions = this.api.revisions(baseUri.valueOf());
      $('#revisions a').off('click');
      $menu = $('#revisions').empty();
      if (this.initial != null) {
        this.revisions.splice(0, 0, [baseUri, false]);
      }
      _ref = this.revisions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref1 = _ref[_i], uri = _ref1[0], published = _ref1[1];
        uri = uri.to_uri();
        $li = $('<li>');
        $link = $("<a href=\"#\">" + (this.versionLabel(uri.version)) + "</a>");
        $link.data({
          'uri': uri,
          'published': published
        });
        if (published) {
          $li.addClass('published');
          $link.append(' <i class=\"icon-cloud\"></i>');
        } else if (uri.version === 'draft') {
          $li.addClass('draft');
        }
        $li.append($link);
        $menu.append($li);
      }
      return $('#revisions a').on('click', this.loadRevision);
    };

    Editor.prototype.render = function(node) {
      console.log('Editor.render()');
      this.trigger('editor:render', node);
      return this.callback('render', node);
    };

    Editor.prototype.loadRevision = function(event) {
      var $revision, data, published, uri;
      console.log('Editor.loadRevision()');
      event.preventDefault();
      $revision = $(event.target);
      uri = $revision.data('uri');
      published = $revision.data('published');
      if (uri.version) {
        return this.api.load(uri.valueOf(), (function(_this) {
          return function(node) {
            _this.onLoad(node);
            if (!published && _this.node.uri.version !== 'draft') {
              return _this.setState('revert');
            }
          };
        })(this));
      } else {
        data = this.initial.data || '';
        return this.renderContent(data, true, (function(_this) {
          return function(content) {
            _this.node.uri = uri.valueOf();
            _this.node.data = data;
            _this.node.content = content;
            return _this.onLoad(_this.node);
          };
        })(this));
      }
    };

    Editor.prototype.renderContent = function(data, doTrigger, callback) {
      var content, plugin;
      console.log('Editor.renderContent()');
      plugin = this.node.uri.ext;
      if (typeof data === 'string') {
        data = {
          data: data
        };
      }
      data['uri'] = this.node.uri;
      content = '';
      if (callback) {
        this.api.render(plugin, data, (function(_this) {
          return function(content) {
            if (doTrigger) {
              _this.trigger('node:render', _this.node.uri.valueOf(), content);
            }
            if (callback) {
              return callback(content);
            }
          };
        })(this));
      } else {
        content = this.api.render(plugin, data);
        if (doTrigger) {
          this.trigger('node:render', this.node.uri.valueOf(), content);
        }
      }
      return content;
    };

    Editor.prototype.publish = function() {
      if (this.state === "draft" || this.state === "revert") {
        return this.trigger("editor:publish", this.node.uri);
      }
    };

    Editor.prototype.discard = function() {
      var uri;
      if (this.node.uri.version === 'draft') {
        this.api["delete"](this.node.uri.valueOf());
      }
      uri = this.node.uri;
      uri.version = null;
      this.node = null;
      this.api.load(uri.valueOf(), this.onLoad);
      return this.trigger("editor:discard", uri);
    };

    Editor.prototype.save = function() {
      if (this.state === "dirty") {
        return this.trigger('editor:save', this.node.uri);
      }
    };

    Editor.prototype.getPluginColor = function(ext) {
      var color;
      color = (ext[0].toUpperCase().charCodeAt() - 65) % 5 + 1;
      return "plugin-fg-" + color;
    };

    return Editor;

  })();

}).call(this);
