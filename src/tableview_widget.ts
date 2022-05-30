// Copyright (c) {{ cookiecutter.author_name }}
// Distributed under the terms of the Modified BSD License.

import $ from "jquery";

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';

export class TableModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: TableModel.model_name,
      _model_module: TableModel.model_module,
      _model_module_version: TableModel.model_module_version,
      _view_name: TableModel.view_name,
      _view_module: TableModel.view_module,
      _view_module_version: TableModel.view_module_version,
      table_body: [],
      headers: [],
      selected: -1,
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'TableModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'TableView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class TableView extends DOMWidgetView {
  table_body: JQuery<HTMLElement>;

  render() {
    this.el.classList.add('tableview-widget');

    // this.value_changed();
    this.makeTable(this.model.get('headers'));

    this.model.on('change:table_body', this.table_body_changed, this);
    this.model.on('change:selected', this.set_selected_row, this);
  }

  table_body_changed() {
    var table_body_list = this.model.get('table_body');
    this.table_body.empty();
    // this.table_body = $("<tbody/>");
    for (var i in table_body_list) {
      var row = $("<tr/>");
      this.table_body.append(row);
      for (var j in table_body_list[i]) {
        var col = $("<td/>").text(table_body_list[i][j]);
        row.append(col);
      }
    }

    this.auto_size_columns();
    this.set_onclick_handler();
  }

  set_selected_row() {
    var index = this.model.get('selected');
    if (index == -1) {
      $('table').find('tbody tr').each(function (i, tr) {
        $(tr).removeClass('selected');
      })
    } else {
      var tr = $('table').find('tbody tr')[index];
      $(tr).addClass('selected').siblings().removeClass('selected');
    }
  }

  set_onclick_handler() {
    var model = this.model;
    $('table').find('tbody tr').each(function (idx, tr) {
      tr.onclick = function () {
        model.set('selected', idx);
        model.save_changes();
        $(tr).addClass('selected').siblings().removeClass('selected');
      };
    });
  }


  auto_size_columns() {
    var $table = $('table');
    var $headCells = $table.find('thead tr').children();
    var $bodyCells = $table.find('tbody tr:first').children();

    // Get the thead columns width array
    var headColWidth = $headCells.map(function () {
      return $(this).width();
    }).get();

    // Get the tbody columns width array
    var bodyColWidth = $bodyCells.map(function () {
      return $(this).width();
    }).get();

    // Get max between thead and tbody widths
    var colWidth: number[] = [];
    for (var index in headColWidth) {
      colWidth[index] = Math.max(headColWidth[index], bodyColWidth[index]);
    }

    // Set the width of thead columns
    $table.find('tbody tr').children().each(function (i, v) {
      $(v).width(colWidth[i]);
    });
    $table.find('thead tr').children().each(function (i, v) {
      $(v).width(colWidth[i]);
    });
  }

  makeTable(headers: string[]) {
    var table = $("<table/>").addClass('tb');
    var header = $("<thead/>");
    table.append(header);
    var row = $("<tr/>");
    header.append(row);

    for (var index in headers) {
      var col = $("<th/>").text(headers[index]);
      row.append(col);
    }

    this.table_body = $("<tbody/>");
    table.append(this.table_body);

    return this._setElement(table[0]);
  }
}