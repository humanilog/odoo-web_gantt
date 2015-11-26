odoo.define('web_gantt.GanttView', function (require) {
"use strict";

var core = require('web.core');
var data = require('web.data');
var form_common = require('web.form_common');
var Model = require('web.DataModel');
var time = require('web.time');
var View = require('web.View');
var widgets = require('web_calendar.widgets');

var CompoundDomain = data.CompoundDomain;

var _t = core._t;
var _lt = core._lt;
var QWeb = core.qweb;

var GanttView = View.extend({
  template: 'GanttView',
  display_name: _lt('Gantt'),

  init: function(parent, dataset, view_id, options) {
    this._super(parent, dataset, view_id, options);

    this.shown = $.Deferred();
    this.model = dataset.model;
    this.fields_view = {};
    this.view_type = 'gantt';
    this.range_start = null;
    this.range_stop = null;
    this.selected_filters = [];

    this.title = (this.options.action)? this.options.action.name : '';
  },

  view_loading: function(fields_view) {
    var attrs = fields_view.arch.attrs;
    this.fields_view = fields_view;

    if (!attrs.date_start) {
      throw new Error(_t("Gantt view has not defined 'date_start' attribute."));
    }

    this.$el.addClass(attrs['class']);

    this.name = fields_view.name || attrs.string;
    this.view_id = fields_view.view_id;

    this.date_start = attrs.date_start;
    this.date_delay = attrs.date_delay;
    this.date_stop = attrs.date_stop;
    this.progress = attrs.progress;

    this.shown.done(this.shown_done.bind(this));
  },

  //called when view is shown
  shown_done: function() {
    console.log('shown_done()');
  },

  do_show: function() {
    var self = this;
    this.shown.resolve();
    return this._super();
  },

  do_search: function(domain, context, group_by) {
    var self = this;
    this.shown.done(function () {
      self._do_search(domain, context, group_by);
    });
  },

  //do reading and rendering here
  _do_search: function(offset, domain, context) {
    var self = this;

    //get all fields in in <gantt/>
    var fields = _.compact(_.map(["date_start", "date_delay", "date_stop", "progress"], function(key) {
      return self.fields_view.arch.attrs[key] || '';
    }));
    fields.push('name');

    self.dataset.read_slice(fields, {
      offset: offset,
      domain: domain,
      context: context
    }).done(function(data) {
      var source = _.map(data, function(object) {
        var date_start = object[self.date_start];
        var date_stop = object[self.date_stop] || date_start;

        return {
          name: ' ',
          desc: object.name,
          values: [{
            to: '/Date(' + Date.parse(date_start) + ')/',
            from: '/Date(' + Date.parse(date_stop) + ')/',
            label: object.name
          }]
        };
      });
      console.log(source);
      console.log(data);
      $('.o_gantt_widget').gantt({
        source: source,
        scale: "months",
        navigate: "scroll",
        minScale: "weeks",
        maxScale: "months"
      });
    })
  }
});

core.view_registry.add('gantt', GanttView);

return GanttView;
});
