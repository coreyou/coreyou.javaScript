var _bdd = {
  active: {}
};
(function () {
  "use strict";

  var BDDREPORTONROW = 'bddReportOnRow',
      BDDUNIQUEONROW = 'bddUniqueOnRow',
      BDDROWNUM = 2000;

  $.extend(_bdd, {

    gridOpts: {
      cellEdit: false,
      scroll: false,
      autoencode: true,
      loadui: 'disable',
      gridview: true,
      shrinkToFit: true,
      width: '100%',
      height: 300,
      rowNum: BDDROWNUM,
      rowList: [50, 100],
      ignoreCase: true
    },

    pageGridOpts: {
      url: 'dma/assistQuery/getAssistQuery',
      mtype: 'POST',
      datatype: 'json',
      gridview: true,
      width: '100%',
      height: 300,
      toppager: true,
      rowNum: 50,
      rowList: [50, 100],
      viewrecords: true,
      ignoreCase: true
    },

    getURLParam: function (sParam) {
      var sPageURL = window.location.search.substring(1),
          sURLVariables = sPageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) return sParameterName[1];
      }
    },

    post: function (url, param, callback) {
      $.ajax({
        type: 'POST',
        url: '/erp/rest/' + url,
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json',
        data: typeof param === 'string' ? param : JSON.stringify(param),
        success: function (data) {
          callback(data);
        },
        error: function (xhr, status, error) {
          if (console) console.log(error);
        }
      });
    },

    setup: function () {
      var comId = _bdd.getURLParam('bdd-com-id');
      _bdd.host = _bdd.getURLParam('host-id');
      _bdd.post('bdd/dataCom/queryById', {comId: comId}, function (data) {
        _bdd.active = data;
        $('.bdd-filter-cols').append(_bdd.genForm($.parseJSON(data.limitCol)));
        _bdd.genDialog();
        _bdd.appendAssistQueryDialog();
        _bdd.appendDatePickerDialog();
        _bdd.appendYMPickerDialog();
        _bdd.appendTimePickerDialog();
        $('#bdd-date-picker').datetimepicker({
          minView: 2,
          language: 'zh-TW'
        }).on('changeDate', function (ev) {
          var time = ev.date.getTime() - (8 * 60 * 60 * 1000),
              date = new Date(time),
              dateStr = _bdd.util.getDateStr(date);
          _bdd.setCol(dateStr);
        });
        $('#bdd-time-picker').datetimepicker({
          startView: 0,
          maxView: 1,
          language: 'zh-TW'
        }).on('changeDate', function (ev) {
          var time = ev.date.getTime() - (8 * 60 * 60 * 1000),
              date = new Date(time),
              dateStr = _bdd.util.getHMTimeStr(date);
          _bdd.setCol(dateStr);
        });
      });
      $(opener).on('unload', function () {
        window.close();
      });
    },

    appendAssistQueryDialog: function () {
      var h =
        '<div id="bdd-assist-query-dialog" title="資料清單" style="display:none;">' +
          '<nav class="navbar navbar-toolbar" role="navigation">' +
            '<div class="btn-toolbar" role="toolbar">' +
              '<button class="btn btn-default" onclick="_bdd.setRangeSymbol()">區間符號</button>' +
            '</div>' +
          '</nav>' +
          '<table id="bdd-assist-query-grid"></table>' +
        '</div>';
      $('body').append(h);
    },

    appendDatePickerDialog: function () {
      var h =
        '<div id="bdd-date-picker-dialog" title="日期輔助輸入" style="display:none;">' +
          '<nav class="navbar navbar-toolbar" role="navigation">' +
            '<div class="btn-toolbar" role="toolbar">' +
              '<button class="btn btn-default" onclick="_bdd.setRangeSymbol()">區間符號</button>' +
            '</div>' +
          '</nav>' +
          '<div id="bdd-date-picker"></div>' +
        '</div>';
      $('body').append(h);
    },

    appendYMPickerDialog: function () {
      var h =
        '<div id="bdd-ym-picker-dialog" title="日期輔助輸入" style="display:none;">' +
          '<nav class="navbar navbar-toolbar" role="navigation">' +
            '<div class="btn-toolbar" role="toolbar">' +
              '<button class="btn btn-default" onclick="_bdd.setRangeSymbol()">區間符號</button>' +
            '</div>' +
          '</nav>' +
          '<div id="bdd-ym-picker"></div>' +
        '</div>';
      $('body').append(h);
    },

    appendTimePickerDialog: function () {
      var h =
        '<div id="bdd-time-picker-dialog" title="日期輔助輸入" style="display:none;">' +
          '<nav class="navbar navbar-toolbar" role="navigation">' +
            '<div class="btn-toolbar" role="toolbar">' +
              '<button class="btn btn-default" onclick="_bdd.setRangeSymbol()">區間符號</button>' +
            '</div>' +
          '</nav>' +
          '<div id="bdd-time-picker"></div>' +
        '</div>';
      $('body').append(h);
    },

    showDatePickerDialog: function (trigger) {
      var $dialog = $('#bdd-date-picker-dialog'),
          $trigger = $(trigger),
          pos = $trigger.offset(),
          height = $trigger.outerHeight();
      this.clearActiveInput();
      $trigger.next().addClass('bdd-active-input');
      pos.top = pos.top + height;
      $dialog.dialog({
        resizable: false,
        draggable: true,
        width: 'auto',
        height: 'auto',
        modal: true
      }).dialog("widget").draggable("option", "containment", "none");
      $dialog.closest('.ui-dialog').offset(pos);
    },

    showYMPickerDialog: function (trigger) {
      var $dialog = $('#bdd-ym-picker-dialog'),
          $trigger = $(trigger),
          pos = $trigger.offset(),
          height = $trigger.outerHeight();
      this.clearActiveInput();
      $trigger.next().addClass('bdd-active-input');
      pos.top = pos.top + height;
      $dialog.dialog({
        resizable: false,
        draggable: true,
        width: 'auto',
        height: 'auto',
        modal: true
      }).dialog("widget").draggable("option", "containment", "none");
      $dialog.closest('.ui-dialog').offset(pos);
    },

    showTimePickerDialog: function (trigger) {
      var $dialog = $('#bdd-time-picker-dialog'),
          $trigger = $(trigger),
          pos = $trigger.offset(),
          height = $trigger.outerHeight();
      this.clearActiveInput();
      $trigger.next().addClass('bdd-active-input');
      pos.top = pos.top + height;
      $dialog.dialog({
        resizable: false,
        draggable: true,
        width: 'auto',
        height: 'auto',
        modal: true
      }).dialog("widget").draggable("option", "containment", "none");
      $dialog.closest('.ui-dialog').offset(pos);
    },

    findActiveInput: function () {
      return $('.bdd-filter-cols').find('.bdd-active-input');
    },

    clearActiveInput: function () {
      $('.bdd-filter-cols').find('input').removeClass('bdd-active-input');
    },

    setCol: function (val) {
      var $input = _bdd.findActiveInput(),
          oldVal = $input.val();
      if (oldVal) {
        if (oldVal.slice(-1) !== '~') $input.val(oldVal + ',' + val);
        else $input.val(oldVal + val);
      } else {
        $input.val(val);
      }
    },

    setRangeSymbol: function () {
      var $input = _bdd.findActiveInput(),
          oldVal = $input.val();
      if (oldVal && oldVal.slice(-1) !== '~') $input.val(oldVal + '~');
    },

    configGrid: function (data, type) {
      var $box = $(window);
      var opts = $.extend({colNames: [], colModel: []}, this.gridOpts);
      opts.width = $box.width() * 0.997;
      if (type === 'LC') {
        opts.height = $box.height() - 160;
        opts.onSelectRow = function (rowid, status, e) {
          if (_bdd.host) {
            var row = $('#bdd-report-grid').jqGrid('getRowData', rowid);
            opener.$('#' + _bdd.host).trigger(BDDREPORTONROW, row);
            window.open('', opener.name);
            window.blur();
            opener.focus();
          }
        }
      } else {
        opts.height = $box.height() - 130;
        opts.onSelectRow = function (rowid, status, e) {
          if (_bdd.host) {
            var row = $('#bdd-unique-grid').jqGrid('getRowData', rowid);
            opener.$('#' + _bdd.host).trigger(BDDUNIQUEONROW, row);
            window.open('', opener.name);
            window.blur();
            opener.focus();
          }
        }
      }
      $.each(data, function (i, v) {
        var model = {
          name: v.colId.toLowerCase(),
          index: v.colId.toLowerCase(),
          align: _bdd.util.isStrDataType(v.srcType) ? 'left' : 'right'
        };
        if (type === 'LC') {
          if (v.isUK == '1') {
            model.classes = 'ui-jqgrid-column-background';
          }
          opts.colNames.push(v.colName);
          opts.colModel.push(model);
        } else {
          if (v.isUK == '1') {
            opts.colNames.push(v.colName);
            opts.colModel.push(model);
          }
        }
      });
      return opts;
    },

    makeWhere: function (data) {
      var where = [];
      if (data.essential) {
        var essential = $.parseJSON(data.essential);
        $.each(essential, function (i, v) {
          where.push(v.rule);
        });
      }
      where = where.concat(_bdd.genCondition());
      if (data.filter) where = where.concat(data.filter);
      return where;
    },

    params: function (type, data) {
      return {
        type: type,
        dsId: data.dsId,
        schemaId: data.schemaId,
        table: $.parseJSON(data.tableId)[0],
        relation: $.parseJSON(data.relation),
        limitCol: $.parseJSON(data.limitCol),
        where: _bdd.makeWhere(data),
        orderBy: data.orderBy ? data.orderBy : ''
      };
    },

    getRptData: function () {
      var $grid = $('#bdd-report-grid'),
          data = _bdd.active;
      $grid.jqGrid(this.configGrid($.parseJSON(data.limitCol), 'LC'));
      // clear grid status
      $grid.jqGrid('setCaption', '資料清單');
      $('#bdd-report').find('.ui-jqgrid-titlebar-close').hide();
      $grid.jqGrid('filterToolbar', {enableClear: true, stringResult: true, searchOnEnter: false, defaultSearch : 'cn'});
      $grid.jqGrid("clearGridData", true).trigger("reloadGrid");
      // request data
      _bdd.post('bdd/dataCom/getLimitColRS', this.params('LC', data), function (rs) {
        var $grid = $('#bdd-report-grid'),
            msg = rs.total > BDDROWNUM ? '資料清單，總筆數：' + rs.total + ' (只顯示前' + BDDROWNUM + '筆，匯出Excel可查閱全部資料)' : '資料清單，總筆數：' + rs.total;
        $grid.jqGrid('addRowData', 'id', rs.data);
        $grid.jqGrid('setCaption', msg);
      });
    },

    getUniData: function () {
      var $grid = $('#bdd-unique-grid'),
          data = _bdd.active;
      $grid.jqGrid(this.configGrid($.parseJSON(data.limitCol), 'UC'));
      $grid.jqGrid('filterToolbar', {enableClear: true, stringResult: true, searchOnEnter: false, defaultSearch : 'cn'});
      // clear grid status
      $grid.jqGrid('setCaption', '資料清單');
      $('#bdd-unique').find('.ui-jqgrid-titlebar-close').hide();
      $grid.jqGrid("clearGridData", true).trigger("reloadGrid");
      // request data
      _bdd.post('bdd/dataCom/getLimitColRS', this.params('UC', data), function (rs) {
        var $grid = $('#bdd-unique-grid'),
            msg = rs.total > BDDROWNUM ? '資料清單，總筆數：' + rs.total + ' (只顯示前' + BDDROWNUM + '筆)' : '資料清單，總筆數：' + rs.total;
        $grid.jqGrid('addRowData', 'id', rs.data);
        $grid.jqGrid('setCaption', msg);
      });
    },

    genDialog: function () {
      var o = '<div id="bdd-data-order-dialog" title="設定資料排序" style="display:none;"><table id="bdd-data-order-col-grid"></table><textarea id="bdd-data-order-rule" rows="1" placeholder="單一欄位排序設定，完成後，按確定可置入排序欄位清單。"></textarea><button id="bdd-data-order-desc" class="btn btn-default" onclick="_bdd.dataOrderAct(\'desc\')">DESC</button><button id="bdd-data-order-reset-rule" class="btn btn-default" onclick="_bdd.dataOrderAct(\'resetRule\')">清除</button><button id="bdd-data-order-add-rule" class="btn btn-default" onclick="_bdd.dataOrderAct(\'addRule\')">確定</button><table id="bdd-data-order-rule-grid"></table></div>';
      var f = '<div id="bdd-filter-dialog" title="設定過濾條件" style="display:none;"><table id="bdd-filter-col-grid"></table><label>運算子：</label><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'>\')">&gt;</button><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'<\')">&lt;</button><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'>=\')">&gt;=</button><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'<=\')">&lt;=</button><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'=\')">= </button><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'!=\')">!=</button><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'like\')">like</button><button class="btn btn-default bdd-operator" onclick="_bdd.filterAct(\'op\', \'in\')">in</button><label>特殊：</label><button class="btn btn-default" onclick="_bdd.filterAct(\'op\', \'IS NOT NULL\')">IS NOT NULL</button><label class="bdd-waring-msg" id="bdd-filter-msg"></label></br><label>輸入器：</label><textarea id="bdd-filter-input" rows="1" placeholder="請輸入運算元內容，in的右運算元內容請以\',\'隔開"></textarea><button class="btn btn-default" onclick="_bdd.filterAct(\'input\')">填入運算元</button></br><textarea id="bdd-filter-rule" placeholder="單一規則說明：單一規則之各條件以AND串聯，完成後，按確定可置入規則清單。" rows="4"></textarea><button class="btn btn-default" onclick="_bdd.filterAct(\'resetRule\')">清除</button><button class="btn btn-default" onclick="_bdd.filterAct(\'addRule\')">確定</button><table id="bdd-filter-rule-grid"></table></div>';
      $('body').append(o).append(f);
    },

    showDataOrderDialog: function () {
      var cols = $.parseJSON(_bdd.active.limitCol),
          $colGrid = $('#bdd-data-order-col-grid'),
          $ruleGrid = $('#bdd-data-order-rule-grid'),
          colOpts = $.extend({
            colModel: [
              { name: 'table', index: 'table' },
              { name: 'colId', index: 'colId' },
              { name: 'colName', index: 'colName' }
            ],
            colNames: ['表格', '欄位ID', '欄位名稱']
          }, this.gridOpts),
          ruleOpts = $.extend({
            colModel: [
              { name: 'rule', index: 'rule', sortable: false },
              { name: 'remove', index: 'remove', width: 20, sortable: false, align: 'center',
                formatter: function () {
                  return '<input type="button" name="remove" value="刪除" onclick="_bdd.removeDataOrderRule(this)" />';
                }
              }
            ],
            colNames: ['排序欄位清單(由上而下加入排序欄位，可拖拉資料調整順序)', '刪除']
          }, this.gridOpts);

      colOpts.onSelectRow = function (rowid, status, e) {
        var $g = $('#bdd-data-order-col-grid'),
            row = $g.jqGrid('getRowData', rowid),
            $rule = $('#bdd-data-order-rule'),
            colVal = row.table + '.' + row.colId + ' ASC',
            realObj = {rule: colVal};
        $rule.val(colVal);
        $rule.data('realObj', realObj);
      };
      // clear grid's data
      $colGrid.jqGrid("clearGridData", true).trigger("reloadGrid");
      $('#bdd-data-order-dialog').dialog({
        resizable: false,
        width: 950,
        height: 530,
        modal: true,
        buttons: {
          "確定": function () {
            _bdd.dataOrderAct('set');
            $(this).dialog('close');
          }
        }
      });
      colOpts.width = 913;
      colOpts.height = 170;
      ruleOpts.width = 913;
      ruleOpts.height = 125;
      $colGrid.jqGrid(colOpts);
      $colGrid.jqGrid('filterToolbar', {enableClear: true, stringResult: true, searchOnEnter: false, defaultSearch : 'cn'});
      $ruleGrid.jqGrid(ruleOpts);
      $ruleGrid.jqGrid('gridDnD', {
        connectWith: '#bdd-data-order-rule-grid'
      });
      $colGrid.jqGrid('addRowData', 'id', cols);
    },

    dataOrderAct: function (act) {
      var $rule = $('#bdd-data-order-rule'),
          ruleVal = $rule.val(),
          realVal = $rule.data('realObj'),
          $ruleGrid = $('#bdd-data-order-rule-grid');
      switch (act) {
        case "desc":
          if (ruleVal && ruleVal.slice(-3) === 'ASC') {
            ruleVal = ruleVal.slice(0, -3) + 'DESC';
            $rule.val(ruleVal);
            realVal.rule = ruleVal;
            $rule.data('realObj', realVal);
          }
          break;
        case "resetRule":
          $rule.val('');
          break;
        case "addRule":
          if (ruleVal && realVal) {
            $ruleGrid.jqGrid('addRowData', realVal.id, realVal);
          }
          break;
        case "set":
          var rs = '',
              data = $ruleGrid.jqGrid('getRowData');
          $.each(data, function (i, v) {
            rs += v.rule + ',';
          });
          _bdd.active.orderBy = rs.slice(0, -1);
          break;
      }
    },

    filterAct: function (act, val) {
      var $rule = $('#bdd-filter-rule'),
          ruleVal = $rule.val(),
          $colGrid = $('#bdd-filter-col-grid'),
          $ruleGrid = $('#bdd-filter-rule-grid'),
          $msg = $('#bdd-filter-msg');
      switch (act) {
        case "col":
          var colRow = $colGrid.jqGrid('getRowData', val),
              colVal = colRow.formula ? colRow.formula : colRow.table + '.' + colRow.colId;
          if (ruleVal) {
            if (_bdd.util.isRuleOp(ruleVal)) {
              $rule.val(ruleVal + ' ' + colVal);
            } else if (ruleVal.lastIndexOf("IS NOT NULL") !== -1) {
              $rule.val(ruleVal + ' AND ' + colVal);
            } else {
              var ruleGrain = ruleVal.split(' ');
              if (ruleGrain.length === 1) {
                $rule.val(colVal);
              } else {
                if (_bdd.util.isRuleOp(ruleGrain[ruleGrain.length - 2])) {
                  $rule.val(ruleVal + ' AND ' + colVal);
                } else {
                  var tempRuleGrain = ruleVal.split(' AND ');
                  tempRuleGrain[tempRuleGrain.length - 1] = colVal;
                  $rule.val(tempRuleGrain.join(' AND '));
                }
              }
              $colGrid.data('colDataType', colRow.srcType);
              $msg.text('');
            }
          } else {
            $rule.val(colVal);
            $colGrid.data('colDataType', colRow.srcType);
            $msg.text('');
          }
          break;
        case "op":
          if (ruleVal) {
            if (_bdd.util.isRuleOp(ruleVal)) {
              var op_rules = ruleVal.split(' ');
              op_rules[op_rules.length - 1] = val;
              $rule.val(op_rules.join(' '));
            } else {
              var op_tempRuleGrain = ruleVal.split(' AND '),
                  op_lastRule = op_tempRuleGrain[op_tempRuleGrain.length - 1].split(' ');
              if (op_lastRule.length === 1) $rule.val(ruleVal + ' ' + val);
            }
            $msg.text('');
          } else {
            $msg.text('請選擇欄位運算元！');
          }
          break;
        case "input":
          var $input = $('#bdd-filter-input'),
              inputVal = $input.val();
          if (_bdd.util.isRuleOp(ruleVal)) {
            if (_bdd.util.isStrDataType($colGrid.data('colDataType'))) {
              if (ruleVal.slice(-2) === 'in') {
                var inputStrReal = '(',
                    inputStrGrain = inputVal.split(',');
                $.each(inputStrGrain, function (idx, val) {
                  inputStrReal += "'" + val.trim() + "',";
                });
                inputStrReal = inputStrReal.slice(0, -1) + ')';
                $rule.val(ruleVal + ' ' + inputStrReal);
              } else {
                $rule.val(ruleVal + " '" + inputVal + "'");
              }
            } else {
              if (ruleVal.slice(-2) === 'in') {
                var inputNumReal = '(',
                    inputNumGrain = inputVal.split(',');
                $.each(inputNumGrain, function (idx, val) {
                  inputNumReal += val.trim() + ",";
                });
                inputNumReal = inputNumReal.slice(0, -1) + ')';
                $rule.val(ruleVal + ' ' + inputNumReal);
              } else {
                $rule.val(ruleVal + ' ' + inputVal);
              }
            }
            $msg.text('');
          } else {
            $msg.text('請選擇欄位運算元！');
          }
          break;
        case "resetRule":
          $rule.val('');
          $msg.text('');
          break;
        case "addRule":
          if (_bdd.util.isInvalidRule(ruleVal) || _bdd.util.isRuleOp(ruleVal)) {
            $msg.text('無效的運算式！');
          } else {
            var ruleObj = {rule: ruleVal.split('AND').length > 1 ? '(' + ruleVal + ')' : ruleVal};
            $ruleGrid.jqGrid('addRowData', ruleObj.id, ruleObj);
            $msg.text('');
          }
          break;
        case "set":
          var rs = '',
              data = $ruleGrid.jqGrid('getRowData');
          $.each(data, function (i, v) {
            rs += v.rule + ',';
          });
          _bdd.active.filter = rs.slice(0, -1);
          break;
      }
    },

    removeDataOrderRule: function (trigger) {
      var rowId = $(trigger).closest('tr').attr('id');
      $('#bdd-data-order-rule-grid').jqGrid('delRowData', rowId);
    },

    removeFilterRule: function (trigger) {
      var rowId = $(trigger).closest('tr').attr('id');
      $('#bdd-filter-rule-grid').jqGrid('delRowData', rowId);
    },

    showFilterDialog: function () {
      var cols = $.parseJSON(_bdd.active.limitCol),
          $colGrid = $('#bdd-filter-col-grid'),
          $ruleGrid = $('#bdd-filter-rule-grid'),
          colOpts = $.extend({
            colModel: [
              { name: 'table', index: 'table' },
              { name: 'colId', index: 'colId' },
              { name: 'colName', index: 'colName' },
              { name: 'srcType', index: 'srcType' }
            ],
            colNames: ['表格', '欄位ID', '欄位名稱', '資料型態']
          }, this.gridOpts),
          ruleOpts = $.extend({
            colModel: [
              { name: 'rule', index: 'rule', sortable: false },
              { name: 'remove', index: 'remove', width: 20, sortable: false, align: 'center',
                formatter: function () {
                  return '<input type="button" name="remove" value="刪除" onclick="_bdd.removeFilterRule(this)" />';
                }
              }
            ],
            colNames: ['規則清單(規則間以OR串聯)', '刪除']
          }, this.gridOpts);

      colOpts.onSelectRow = function (rowid, status, e) {
        _bdd.filterAct('col', rowid);
      };
      // clear grid's data
      $colGrid.jqGrid("clearGridData", true).trigger("reloadGrid");
      $('#bdd-filter-dialog').dialog({
        resizable: false,
        width: 950,
        height: 650,
        modal: true,
        buttons: {
          "確定": function () {
            _bdd.filterAct('set');
            $(this).dialog('close');
          }
        }
      });
      colOpts.width = 913;
      colOpts.height = 160;
      ruleOpts.width = 913;
      ruleOpts.height = 125;
      $colGrid.jqGrid(colOpts);
      $colGrid.jqGrid('filterToolbar', {enableClear: true, stringResult: true, searchOnEnter: false, defaultSearch : 'cn'});
      $ruleGrid.jqGrid(ruleOpts);
      $colGrid.jqGrid('addRowData', 'id', cols);
    },

    genAssistQueryGrid: function (rs) {
      var data = rs.data,
          $grid = $('#bdd-assist-query-grid'),
          $dialog = $('#bdd-assist-query-dialog');
      // clear previous assist query data
      $grid.jqGrid("GridUnload");
      if (data && data.length > 0) {
        var cols = rs.columnDefs,
            opts = $.extend({colNames: [], colModel: []}, this.pageGridOpts),
            $newGrid = $('#bdd-assist-query-grid');
        opts.width = cols.length * 100;
        opts.height = 200;
        opts.onSelectRow = function (rowid, status, e) {
          var $g = $('#bdd-assist-query-grid'),
              row = $g.jqGrid('getRowData', rowid),
              tarCell = row[rs.target.toLowerCase()],
              $input = $('.bdd-filter-cols').find('input[data-assist-id=' + rs.assistId + ']'),
              oldVal = $input.val();
          if (oldVal) {
            if (oldVal.slice(-1) !== '~') $input.val(oldVal + ',' + tarCell);
            else $input.val(oldVal + tarCell);
          } else {
            $input.val(tarCell);
          }
        };
        $.each(cols, function (i, v) {
          var model = {
            name: v.name,
            index: v.name,
            label: v.displayName
          };
          opts.colNames.push(v.name);
          opts.colModel.push(model);
        });
        $newGrid.jqGrid(opts);
        $newGrid.jqGrid('filterToolbar', {enableClear: true, stringResult: true, searchOnEnter: false, defaultSearch : 'cn'});
        $newGrid.jqGrid('addRowData', 'id', data);
        $newGrid.jqGrid('navGrid', '#bdd-assist-query-grid-pager', {edit: false, add: false, del: false, search: false, refresh: false});
      } else {
        $dialog.html('查無資料！');
      }
    },

    showAssistQueryData: function (trigger) {
      var $dialog = $("#bdd-assist-query-dialog"),
          $trigger = $(trigger),
          $input = $(trigger).next(),
          pos = $trigger.offset(),
          assistId = $input.data('assist-id'),
          height = $trigger.outerHeight();
      this.clearActiveInput();
      $trigger.next().addClass('bdd-active-input');
      pos.top = pos.top + height;
      $dialog.dialog({
        title: assistId + ' 資料清單',
        resizable: true,
        modal: true,
        draggable: true,
        width: 'auto',
        height: 'auto'
      });
      $dialog.closest('.ui-dialog').offset(pos);
      _bdd.getAssistQueryData(assistId);
    },

    getAssistQueryData: function (assistId) {
      _bdd.post('dma/assistQuery/getAssistQuery', this.getAssistQueryParams(assistId), function (rs) {
        _bdd.genAssistQueryGrid(rs);
      });
    },

    getAssistQueryParams: function (assistId) {
      var p = {
        assistId: assistId,
        offset: 0,
        pageSize: 50
      };
      return p;
    },

    genForm: function (data) {
      var h = '<div style="height:4px;"></div>';
      $.each(data, function (i, v) {
        var row, input,
            isShow = v.isUK === '3',
            assistId = v.inputType,
            srcType = v.srcType,
            formula = v.formula,
            col = formula ? formula : v.table + '.' + v.colId,
            showCol = v.colName + '(' + v.colId + ')';
        if (!isShow) {
          if (assistId === 'DATE') {
            input =
              '<span class="input-group-addon" title="開啟日期輔助輸入視窗" onclick="_bdd.showDatePickerDialog(this)"><span class="glyphicon glyphicon-calendar"></span></span>' +
              '<input type="text" class="form-control" placeholder="請挑選日期" data-aqc="' + col + '" data-src-type="' + srcType + '">';
          } else if (assistId === 'YEAR_MONTH') {
            input =
              '<span class="input-group-addon" title="開啟年月輔助輸入視窗" onclick="_bdd.showYMPickerDialog(this)"><span class="glyphicon glyphicon-calendar"></span></span>' +
              '<input type="text" class="form-control" placeholder="請挑選年月" data-aqc="' + col + '" data-src-type="' + srcType + '">';
          } else if (assistId === 'TIME') {
            input =
              '<span class="input-group-addon" title="開啟時間輔助輸入視窗" onclick="_bdd.showTimePickerDialog(this)"><span class="glyphicon glyphicon-time"></span></span>' +
              '<input type="text" class="form-control" placeholder="請挑選時間" data-aqc="' + col + '" data-src-type="' + srcType + '">';
          } else {
            if (assistId === 'INPUT') {
              input = '<input type="text" class="form-control" placeholder="請輸入資料值" data-aqc="' + col + '" data-src-type="' + srcType + '">';
            } else {
              input =
                '<span class="input-group-addon" title="開啟資料輔助輸入視窗" onclick="_bdd.showAssistQueryData(this)"><span class="glyphicon glyphicon-filter"></span></span>' +
                '<input type="text" class="form-control" placeholder="請挑選' + assistId + '值" data-assist-id="' + assistId + '" data-aqc="' + col + '" data-src-type="' + srcType + '">';
            }
          }
          input += '<span class="input-group-addon" title="清空輸入值" onclick="_bdd.util.removeAQC(this)"><span class="glyphicon glyphicon-remove"></span></span>';
          row =
            '<div class="form-group col-lg-12">' +
              '<label class="control-label">' + showCol + '：</label>' +
              '<div class="input-group">' + input + '</div>' +
            '</div>';
          h += row;
        }
      });
      return h;
    },

    genCondition: function () {
      var condition = [],
          aqc = $('.bdd-filter-cols').find('input');
      $.each(aqc, function (i1, v1) {
        var $temp = $(v1),
            tVal = $temp.val(),
            aqcVal = $temp.data('aqc');
        if (tVal) {
          var ts = tVal.split(','),
              wrap = _bdd.util.isStrDataType($temp.data('src-type')) ? "'" : "";
          if (ts.length === 1) {
            var tsr = ts[0].split('~');
            if (tsr.length === 1) condition.push(aqcVal + " = " + wrap + $temp.val() + wrap);
            else condition.push(aqcVal + " BETWEEN " + wrap + tsr[0] + wrap + " AND " + wrap + tsr[1] + wrap);
          } else {
            var orStr = '', orList = [],
                inCond = aqcVal + " IN (";
            $.each(ts, function (i2, v2) {
              var tsr2 = v2.split('~');
              if (tsr2.length === 1) inCond += wrap + v2 + wrap + ",";
              else orList.push(aqcVal + " BETWEEN " + wrap + tsr2[0] + wrap + " AND " + wrap + tsr2[1] + wrap);
            });
            orList.push(inCond.slice(0, -1) + ")");
            $.each(orList, function (i3, v3) {
              orStr += v3 + ' OR ';
            });
            condition.push('(' + orStr.slice(0, -4) + ')');
          }
        }
      });
      return condition;
    },

    exportExcel: function () {
      var data = _bdd.active;
      _bdd.post('bdd/exportExcel/save', this.params('LC', data), function (rs) {
        $("<iframe/>").attr({
          src: 'http://' + location.host + '/erp/rest/bdd/exportExcel/download/' + rs.fileName,
          style: "visibility:hidden;display:none"
        }).appendTo('body');
      });
    },

    util: {

      isDateType: function (v) {
        var t = ['YEAR', 'YEAR_MONTH', 'DATE', 'DATE_TIME', 'TIME'];
        return $.inArray(v.toUpperCase(), t) !== -1;
      },

      removeAQC: function (trigger) {
        $(trigger).siblings('input').val('');
      },

      isStrDataType: function (data) {
        var t = ['STRING', 'VARCHAR', 'VARCHAR2', 'CHAR', 'DATETIME', 'TEXT'];
        return $.inArray(data.toUpperCase(), t) !== -1;
      },

      getDateStr: function (date) {
        return date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
      },

      getHMTimeStr: function (date) {
        return ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
      },

      isRuleOp: function (data) {
        var isOp = false,
            ops = [">", "<", ">=", "<=", "=", "!=", "like", "in"];
        $.each(ops, function (idx, val) {
          if (data.slice(Number("-" + val.length)) === val) {
            isOp = true;
            return;
          }
        });
        return isOp;
      },

      isInvalidRule: function (rule) {
        var ruleGrainByAND = rule.split('AND'),
            lastRuleGrainBySpace = ruleGrainByAND[ruleGrainByAND.length - 1].split(' ');
        if (lastRuleGrainBySpace.length < 3) return true;
      }

    }

  });
  _bdd.setup();
  $(window).resize(function () {
    var $window = $(window),
        $rGrid = $('#bdd-report-grid'),
        $uGrid = $('#bdd-unique-grid'),
        width = $window.width() * 0.997;
    $rGrid.jqGrid('setGridWidth', width);
    $rGrid.jqGrid('setGridHeight', $window.height() - 160);
    $uGrid.jqGrid('setGridWidth', width);
    $uGrid.jqGrid('setGridHeight', $window.height() - 130);
  });
})();