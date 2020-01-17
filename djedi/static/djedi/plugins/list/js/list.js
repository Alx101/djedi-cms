// Generated by CoffeeScript 1.8.0
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ListEditor = (function(_super) {
    __extends(ListEditor, _super);

    function ListEditor() {
      this.loadRevisionByClass = __bind(this.loadRevisionByClass, this);
      this.getSubnodeKey = __bind(this.getSubnodeKey, this);
      this.getSubnodeUriKey = __bind(this.getSubnodeUriKey, this);
      this.resortNodes = __bind(this.resortNodes, this);
      this.moveChild = __bind(this.moveChild, this);
      this.setDirty = __bind(this.setDirty, this);
      this.toggleListActions = __bind(this.toggleListActions, this);
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
      this.addSubnode = __bind(this.addSubnode, this);
      this.setDirection = __bind(this.setDirection, this);
      return ListEditor.__super__.constructor.apply(this, arguments);
    }

    ListEditor.prototype.initDataStructure = function() {
      return {
        direction: 'col',
        children: []
      };
    };

    ListEditor.prototype.initialize = function(config) {
      var plg, _i, _len, _ref;
      console.log('ListEditor.initialize', this);
      ListEditor.__super__.initialize.call(this, config);
      this.subnodeCss = '<style> .node-title, footer { display: none; } #editor { height: auto; max-height: none; } </style>';
      this.editor = this;
      this.subnodeIframes = [];
      this.data = this.initDataStructure();
      this.saveQueue = [];
      this.loading = false;
      this.preventParentReload = false;
      this.subnodeDirty = false;
      this.doShallowSave = false;
      this.container = $('#node-list');
      this.dataHolder = $('#subnode-data');
      this.directions = $('#direction-options');
      this.editor.$add_list = $('#plugin-list');
      $('#form input').unbind();
      $('#form textarea').unbind();
      $('#form select').unbind();
      this.directions.find('input').on('change', (function(_this) {
        return function(e) {
          return _this.setDirection(e.target.value);
        };
      })(this));
      _ref = config.plugins;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plg = _ref[_i];
        if (plg !== 'list') {
          $('<li class="node-add"><a href="#"><span class="' + this.getPluginColor(plg) + '">' + plg + '</span></a></li>').appendTo(this.editor.$add_list);
        }
      }
      this.editor.$add = $('.node-add');
      return this.editor.$add.on('click', (function(_this) {
        return function(evt) {
          if (!_this.subnodeDirty) {
            return _this.addSubnode(_this.getSubnodeUriKey(), $(evt.target).text(), true);
          }
        };
      })(this));
    };

    ListEditor.prototype.setDirection = function(dir, refreshData) {
      var target;
      if (refreshData == null) {
        refreshData = true;
      }
      this.directions.find('[name="direction"]').prop('checked', false);
      target = this.directions.find('[value="' + dir + '"]');
      if (target.length === 1) {
        target.prop('checked', true);
        this.data.direction = dir;
        this.updateData(refreshData);
        return this.setDirty();
      } else {
        return this.setDirection("col", refreshData);
      }
    };

    ListEditor.prototype.addSubnode = function(key, plugin, markDirty, defaultData) {
      if (defaultData == null) {
        defaultData = "";
      }
      return this.spawnSubnode(this.node.uri.clone({
        query: {
          key: key,
          plugin: plugin
        },
        version: ""
      }).valueOf(), markDirty, defaultData);
    };

    ListEditor.prototype.onLoad = function(node) {
      var codedData, entry, exception, _i, _len, _ref;
      this.loading = true;
      this.clearList();
      ListEditor.__super__.onLoad.call(this, node);
      this.frameBias = "node/" + encodeURIComponent(encodeURIComponent(node.uri.valueOf().replace('#' + node.uri.version, ''))) + "/editor";
      try {
        codedData = node.data;
        _ref = codedData.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          this.addSubnode(this.getSubnodeUriKey(entry.key), entry.plugin, false, entry.data);
        }
        this.setDirection(codedData.direction, false);
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
      if (state === "dirty" && this.subnodeDirty) {
        this.toggleListActions();
      }
      return ListEditor.__super__.setState.call(this, state);
    };

    ListEditor.prototype.spawnSubnode = function(uri, refreshValue, data) {
      var classes, handle, holder, node, node_container, node_iframe, path, ref_uri, title, windowRef;
      if (refreshValue == null) {
        refreshValue = true;
      }
      if (data == null) {
        data = "";
      }
      console.log("ListEditor.spawnSubNode()");
      classes = 'subnodes__item';
      node_container = $("<div class='" + classes + "'></div>").appendTo(this.container);
      title = $("<div class='subnodes__item-title'></div>").appendTo(node_container);
      holder = $("<div class='subnodes__item-content'></div>").appendTo(node_container);
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
      handle = $("<div class='subnodes__item-shift'> <a class='subnodes__item-shift--up'><i class='icon-chevron-up'></i></a> <a class='subnodes__item-shift--down'><i class='icon-chevron-down'></i></a> </div>").prependTo(title);
      handle.find('a').on('click', (function(_this) {
        return function(event) {
          var newOrder;
          if (_this.subnodeDirty) {
            return false;
          }
          newOrder = false;
          if ($(event.target).hasClass('subnodes__item-shift--up') || $(event.target).hasClass('icon-chevron-up')) {
            newOrder = _this.moveChild(uri, -1);
          } else {
            newOrder = _this.moveChild(uri, 1);
          }
          if (newOrder !== false) {
            _this.resortNodes();
            _this.updateData(true);
            _this.setDirty();
            return _this.shallowSave();
          }
        };
      })(this));
      node = new window.Node(uri, data, holder);
      title.append("<span class='subnodes__item-title__text'>" + (node.uri.query['plugin'] || 'unknown') + "</span>");
      title.find('.subnodes__item-title__text').addClass(this.getPluginColor(node.uri.query['plugin'] || 'plugin-fg-unknown'));
      node_container.attr('uri-ref', node.uri.valueOf());
      node_container.attr('data-key', node.uri.query['key']);
      node_iframe = new window.Plugin(node);
      ref_uri = this.node.uri.clone({
        version: ""
      }).valueOf();
      path = document.location.pathname.replace("node/" + (encodeURIComponent(encodeURIComponent(ref_uri))) + "/editor", "");
      path = path.replace("node/" + (encodeURIComponent(encodeURIComponent(this.node.uri))) + "/editor", "");
      node_iframe.$el.attr('src', path + ("node/" + (encodeURIComponent(encodeURIComponent(uri))) + "/editor"));
      node_container.css('order', this.data.children.length);
      this.subnodeIframes.push(node_iframe);
      this.data.children.push({
        key: this.getSubnodeKey(node.uri.query.key),
        plugin: node.uri.query.plugin,
        data: data
      });
      holder.append(node_iframe.$el);
      windowRef = node_iframe.$el[0].contentWindow;
      $(node_iframe.$el).on('load', (function(_this) {
        return function() {
          var head;
          head = windowRef.$(node_iframe.$el[0]).contents().find("head");
          windowRef.$(head).append(_this.subnodeCss);
          windowRef.$(windowRef.document).on('editor:state-changed', function(event, oldState, newState, node) {
            console.log(oldState, newState);
            if (oldState === 'dirty' && newState === 'draft') {
              _this.workSaveQueue();
              return _this.updateSubnode(node.uri.to_uri().query.key, node);
            }
          });
          windowRef.$(windowRef.document).on('editor:dirty', function() {
            _this.subnodeDirty = true;
            return _this.setDirty();
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
        return this.setDirty();
      }
    };

    ListEditor.prototype.save = function() {
      var subnode_iframe, _i, _len, _ref;
      this.preventParentReload = true;
      _ref = this.subnodeIframes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        subnode_iframe = _ref[_i];
        this.saveQueue.push(subnode_iframe);
      }
      return ListEditor.__super__.save.apply(this, arguments);
    };

    ListEditor.prototype.shallowSave = function() {
      this.doShallowSave = true;
      if (this.state === "dirty") {
        return this.trigger('editor:save', this.node.uri);
      }
    };

    ListEditor.prototype.onSave = function(node) {
      ListEditor.__super__.onSave.call(this, node);
      if (!this.doShallowSave) {
        return this.workSaveQueue();
      } else {
        return this.doShallowSave = false;
      }
    };

    ListEditor.prototype.onPublish = function() {
      ListEditor.__super__.onPublish.apply(this, arguments);
      this.loadRevisionByClass('.published');
      return this.setState('published');
    };

    ListEditor.prototype.workSaveQueue = function() {
      console.log("ListEditor.workSaveQueue()", this.saveQueue.length);
      if (this.saveQueue.length > 0) {
        return this.saveSubnode(this.saveQueue.pop());
      } else {
        this.preventParentReload = false;
        this.loadRevisionByClass('.draft');
        this.setState('draft');
        this.subnodeDirty = false;
        return this.toggleListActions(true);
      }
    };

    ListEditor.prototype.saveSubnode = function(plugin) {
      var windowRef;
      windowRef = plugin.$el[0].contentWindow;
      if (windowRef && windowRef.editor && windowRef.editor.state !== 'dirty') {
        return this.workSaveQueue();
      } else if (windowRef && windowRef.editor) {
        return windowRef.editor.save();
      }
    };

    ListEditor.prototype.popSubnode = function(uri) {
      var targetKey, targetUri;
      console.log("ListEditor.popSubnode()");
      targetUri = uri;
      targetKey = this.getSubnodeKey(targetUri.to_uri().query.key);
      this.subnodeIframes = this.subnodeIframes.filter((function(_this) {
        return function(value) {
          if (value.uri.valueOf() !== targetUri) {
            return true;
          }
          value.close();
          _this.container.find('[uri-ref="' + targetUri + '"]').remove();
          return false;
        };
      })(this));
      this.data.children = this.data.children.filter(function(value) {
        if (value.key !== targetKey) {
          return true;
        }
        return false;
      });
      this.setDirty();
      return this.updateData(true);
    };

    ListEditor.prototype.clearList = function() {
      this.container.empty();
      this.subnodeIframes = [];
      return this.data = this.initDataStructure();
    };

    ListEditor.prototype.updateData = function(reRender) {
      var collection;
      if (reRender == null) {
        reRender = false;
      }
      collection = JSON.stringify(this.data);
      this.dataHolder.val(collection);
      this.dataHolder.change();
      this.node.data = collection;
      if (reRender) {
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
      var child, index, _i, _len, _ref;
      if (norender == null) {
        norender = false;
      }
      console.log("ListEditor.updateSubnode()", uuid);
      index = 0;
      if (node['data']) {
        _ref = this.data.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.key === uuid) {
            this.data.children[index].data = node['data'];
          }
          index++;
        }
      }
      return this.renderSubnode(node['uri'], node['content']);
    };

    ListEditor.prototype.toggleListActions = function(enable) {
      if (enable == null) {
        enable = false;
      }
      this.container.find('.subnodes__item-shift').toggleClass('subnodes__item-shift--disabled', !enable);
      this.editor.$add.toggleClass('disabled', !enable);
      return this.directions.find('input').prop('disabled', !enable);
    };

    ListEditor.prototype.setDirty = function() {
      this.setState('dirty');
      return this.trigger('editor:dirty');
    };

    ListEditor.prototype.array_move = function(arr, old_index, new_index) {
      var k;
      if (new_index >= arr.length) {
        k = new_index - arr.length + 1;
        while (k--) {
          arr.push(void 0);
        }
      }
      return arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    };

    ListEditor.prototype.moveChild = function(uri, steps) {
      var child, step, _i, _len, _ref, _uri;
      _uri = uri.to_uri();
      step = 0;
      _ref = this.data.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child.key === _uri.query['key']) {
          if (step + steps >= 0 && step + steps < this.data.children.length) {
            this.array_move(this.data.children, step, step + steps);
            return step + steps;
          }
        } else {
          step++;
        }
      }
      return false;
    };

    ListEditor.prototype.resortNodes = function() {
      var child, step, _i, _len, _ref, _results;
      step = 0;
      _ref = this.data.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        $("[data-key=" + child.key + "]").css('order', step);
        _results.push(step++);
      }
      return _results;
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

    ListEditor.prototype.loadRevisionByClass = function(targetVersionClass) {
      return this.loadRevision({
        type: 'click',
        target: $('#revisions').find(targetVersionClass).find('a').get()[0],
        preventDefault: function() {
          return {};
        }
      });
    };

    return ListEditor;

  })(window.Editor);

}).call(this);
