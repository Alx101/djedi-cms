// Generated by CoffeeScript 1.8.0
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ListEditor = (function(_super) {
    __extends(ListEditor, _super);

    function ListEditor() {
      this.getSubnodeKey = __bind(this.getSubnodeKey, this);
      this.getSubnodeUriKey = __bind(this.getSubnodeUriKey, this);
      this.updateSubnode = __bind(this.updateSubnode, this);
      this.renderSubnode = __bind(this.renderSubnode, this);
      this.updateData = __bind(this.updateData, this);
      this.clearList = __bind(this.clearList, this);
      this.popSubnode = __bind(this.popSubnode, this);
      this.saveSubnode = __bind(this.saveSubnode, this);
      this.workSaveQueue = __bind(this.workSaveQueue, this);
      this.onPublish = __bind(this.onPublish, this);
      this.spawnSubnode = __bind(this.spawnSubnode, this);
      this.setState = __bind(this.setState, this);
      this.render = __bind(this.render, this);
      this.onLoad = __bind(this.onLoad, this);
      return ListEditor.__super__.constructor.apply(this, arguments);
    }

    ListEditor.prototype.initDataStructure = function() {
      return {
        direction: '',
        children: []
      };
    };

    ListEditor.prototype.initialize = function(config) {
      var plg, _i, _len, _ref;
      console.log('ListEditor.initialize', this);
      ListEditor.__super__.initialize.call(this, config);
      this.subnodeCss = '<style> .node-title, footer { display: none; } </style>';
      this.editor = this;
      this.subPlugins = [];
      this.data = this.initDataStructure();
      this.saveQueue = [];
      this.loading = false;
      this.preventParentReload = false;
      this.container = $('#node-list');
      this.dataHolder = $('#subnode-data');
      this.editor.$add_list = $('#plugin-list');
      $('#form input').unbind();
      $('#form textarea').unbind();
      $('#form select').unbind();
      _ref = config.plugins;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plg = _ref[_i];
        $('<li class="node-add"><a href="#">' + plg + '</a></li>').appendTo(this.editor.$add_list);
      }
      this.editor.$add = $('.node-add');
      this.editor.$add.on('click', (function(_this) {
        return function(evt) {
          return _this.spawnSubnode(_this.node.uri.clone({
            query: {
              key: _this.getSubnodeUriKey(),
              plugin: $(evt.target).text()
            }
          }).valueOf(), true);
        };
      })(this));
      return $(window).on('editor:state-changed', (function(_this) {
        return function(event, oldState, newState) {
          console.log("ListEditor.stateChanged()");
          return console.log(oldState, newState);
        };
      })(this));
    };

    ListEditor.prototype.onLoad = function(node) {
      var codedData, entry, exception, _i, _len, _ref;
      this.loading = true;
      this.clearList();
      ListEditor.__super__.onLoad.call(this, node);
      this.frameBias = "node/" + encodeURIComponent(encodeURIComponent(node.uri.valueOf().replace('#' + node.uri.version, ''))) + "/editor";
      try {
        codedData = JSON.parse(node.data);
        _ref = codedData.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          this.spawnSubnode(this.node.uri.clone({
            query: {
              key: this.getSubnodeUriKey(entry.key),
              plugin: entry.plugin
            }
          }).valueOf(), false, entry.data);
        }
      } catch (_error) {
        exception = _error;
        this.clearList();
        this.updateData(true);
        console.log("ListEditor.onLoad(), error when loading. Data invalid: ", exception);
      }
      return this.loading = false;
    };

    ListEditor.prototype.render = function(node) {
      console.log('ListEditor.render()', node.content, this);
      this.dataHolder.val(JSON.stringify(this.data));
      return ListEditor.__super__.render.call(this, node);
    };

    ListEditor.prototype.setState = function(state) {
      if (state === 'draft' && this.preventParentReload || state === 'dirty' && this.loading) {
        return;
      }
      return ListEditor.__super__.setState.call(this, state);
    };

    ListEditor.prototype.spawnSubnode = function(uri, refreshValue, data) {
      var classes, cont, holder, node, path, plug, ref_uri, title, windowRef;
      if (refreshValue == null) {
        refreshValue = true;
      }
      if (data == null) {
        data = "";
      }
      console.log("ListEditor.spawnSubNode()");
      classes = 'subnodes__item';
      cont = $("<div class='" + classes + "'></div>").appendTo(this.container);
      title = $("<div class='subnodes__item-title'></div>").appendTo(cont);
      holder = $("<div class='subnodes__item-content'></div>").appendTo(cont);
      title.on('click', (function(_this) {
        return function(e) {
          return $(e.target).parent().toggleClass('subnodes__item--closed');
        };
      })(this));
      $("<div class='subnodes__item-remove'><i class='icon-remove'></i></div>").appendTo(title).on('click', (function(_this) {
        return function(e) {
          return _this.popSubnode($(e.target).parents('.subnodes__item').attr("uri-ref"));
        };
      })(this));
      node = new window.Node(uri, data, holder);
      title.append(node.uri.query['plugin'] || 'unknown');
      cont.attr('uri-ref', node.uri.valueOf());
      plug = new window.Plugin(node);
      ref_uri = this.node.uri.clone({
        version: ""
      }).valueOf();
      path = document.location.pathname.replace("node/" + (encodeURIComponent(encodeURIComponent(ref_uri))) + "/editor", "");
      path = path.replace("node/" + (encodeURIComponent(encodeURIComponent(this.node.uri))) + "/editor", "");
      plug.$el.attr('src', path + ("node/" + (encodeURIComponent(encodeURIComponent(uri))) + "/editor"));
      this.subPlugins.push(plug);
      this.data.children.push({
        key: this.getSubnodeKey(node.uri.query['key']),
        plugin: node.uri.query.plugin,
        data: data
      });
      holder.append(plug.$el);
      windowRef = plug.$el[0].contentWindow;
      $(plug.$el).on('load', (function(_this) {
        return function() {
          var head;
          head = windowRef.$(plug.$el[0]).contents().find("head");
          console.log(head);
          windowRef.$(head).append(_this.subnodeCss);
          windowRef.$(windowRef.document).on('editor:state-changed', function(event, oldState, newState, node) {
            console.log(oldState, newState);
            if (oldState === 'dirty' && newState === 'draft') {
              _this.workSaveQueue();
              return _this.updateSubnode(node.uri.to_uri().query.key, node);
            }
          });
          windowRef.$(windowRef.document).on('editor:dirty', function() {
            _this.editor.setState('dirty');
            return _this.trigger('editor:dirty');
          });
          windowRef.$(windowRef.document).on('node:update', function(event, uri, node) {
            return _this.updateSubnode(uri.to_uri().query.key, node);
          });
          return windowRef.$(windowRef.document).on('node:render', function(event, uri, content) {
            return _this.renderSubnode(uri, content);
          });
        };
      })(this));
      this.updateData(refreshValue);
      if (refreshValue) {
        this.trigger('editor:dirty');
        return this.editor.setState('dirty');
      }
    };

    ListEditor.prototype.save = function() {
      var plug, _i, _len, _ref;
      this.preventParentReload = true;
      _ref = this.subPlugins;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plug = _ref[_i];
        this.saveQueue.push(plug);
      }
      return ListEditor.__super__.save.apply(this, arguments);
    };

    ListEditor.prototype.onSave = function(node) {
      ListEditor.__super__.onSave.call(this, node);
      return this.workSaveQueue();
    };

    ListEditor.prototype.onPublish = function() {
      var event;
      ListEditor.__super__.onPublish.apply(this, arguments);
      event = {
        type: 'click',
        target: $('#revisions').find('.published').find('a').get()[0],
        preventDefault: function() {
          return {};
        }
      };
      this.loadRevision(event);
      return this.setState('published');
    };

    ListEditor.prototype.workSaveQueue = function() {
      var event;
      console.log("ListEditor.workSaveQueue()", this.saveQueue.length);
      if (this.saveQueue.length > 0) {
        return this.saveSubnode(this.saveQueue.pop());
      } else {
        this.preventParentReload = false;
        event = {
          type: 'click',
          target: $('#revisions').find('.draft').find('a').get()[0],
          preventDefault: function() {
            return {};
          }
        };
        this.loadRevision(event);
        return this.setState('draft');
      }
    };

    ListEditor.prototype.saveSubnode = function(plugin) {
      var windowRef;
      windowRef = plugin.$el[0].contentWindow;
      if (windowRef.editor.state !== 'dirty') {
        return this.workSaveQueue();
      } else {
        return windowRef.editor.save();
      }
    };

    ListEditor.prototype.popSubnode = function(uri) {
      var nodeList, targetKey, targetUri;
      console.log("ListEditor.popSubnode()");
      targetUri = uri;
      targetKey = this.getSubnodeKey(targetUri.to_uri().query.key);
      nodeList = this.container;
      this.subPlugins = this.subPlugins.filter(function(value) {
        if (value.uri.valueOf() !== targetUri) {
          return true;
        }
        value.close();
        nodeList.find('[uri-ref="' + targetUri + '"]').remove();
        return false;
      });
      this.data.children = this.data.children.filter(function(value) {
        if (value.key !== targetKey) {
          return true;
        }
        return false;
      });
      this.setState("dirty");
      this.trigger('editor:dirty');
      return this.updateData(true);
    };

    ListEditor.prototype.clearList = function() {
      this.container.empty();
      this.subPlugins = [];
      return this.data = this.initDataStructure();
    };

    ListEditor.prototype.updateData = function(withDirty) {
      var collection;
      if (withDirty == null) {
        withDirty = false;
      }
      collection = JSON.stringify(this.data);
      this.dataHolder.val(collection);
      this.dataHolder.change();
      this.node.data = collection;
      if (withDirty) {
        return this.api.render("list", {
          data: collection
        }, (function(_this) {
          return function(response) {
            var contentSet;
            contentSet = $(response)[0];
            _this.node.content = contentSet;
            return _this.editor.triggerRender(_this.node.content);
          };
        })(this));
      }
    };

    ListEditor.prototype.renderSubnode = function(uri, content) {
      var key, newContent;
      console.log("ListEditor.renderSubnode()");
      key = this.getSubnodeKey(decodeURIComponent(uri.to_uri().query['key']));
      newContent = $(this.node.content).find('#' + key).html(content).end()[0];
      this.updateData(false);
      this.node.content = newContent;
      return this.editor.triggerRender(newContent);
    };

    ListEditor.prototype.updateSubnode = function(uuid, node, norender) {
      var child, _i, _len, _ref;
      if (norender == null) {
        norender = false;
      }
      console.log("ListEditor.updateSubnode()", uuid);
      if (node.data) {
        console.log(node);
        _ref = this.data.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.key === node.uri.query.key) {
            console.log("updating node data");
            child.data = node.data;
          }
        }
      }
      return this.renderSubnode(node.uri, node.content);
    };

    ListEditor.prototype.getSubnodeUriKey = function(key) {
      var keys, uri;
      if (key == null) {
        key = void 0;
      }
      keys = "";
      uri = this.node.uri.to_uri();
      if (uri.query && uri.query['key']) {
        keys += this.node.uri.to_uri().query['key'] + "_";
      }
      return keys + (key || this.generateGuid());
    };

    ListEditor.prototype.getSubnodeKey = function(composite_key) {
      var keys;
      keys = composite_key.split('_');
      return keys[keys.length - 1];
    };

    ListEditor.prototype.generateGuid = function() {
      var i, j, result, _i;
      result = '';
      for (j = _i = 0; _i < 32; j = ++_i) {
        if (j === 8 || j === 12 || j === 16 || j === 20) {
          result = result + '-';
        }
        i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
        result = result + i;
      }
      return result;
    };

    return ListEditor;

  })(window.Editor);

}).call(this);
