angular.module('bdgApp').controller('bdgDesignerCtrl', function ($rootScope, $http) {
  "use strict";
  $.extend(_bd, {
    designer: {
      removeInfo: function (trigger) {
        var $grid = $('#bdg-query-info-grid'),
            tarId = $(trigger).closest('tr').attr('id'),
            tarData = $grid.gk('row', tarId);
        if (tarData) {
          $grid.gk('del', tarId);
          _bd.util.getJSON('bdgcLogic.removeInfo', {infoId: tarData.INFOID}, function (data) {
            console.log(data);
          });
        }
      },

      reSizing: function () {
        _bd.reface.sizingState('resize');
        $('#bdg-chart-size').text('');
      },

      checkStep1: function () {
        // check step2 should be opened
        $('.bdg-temp-save').on('click', function (e) {
          var title = _bd.reface.chartTitle(),
              type = $('#bdg-chart-type').text(),
              size = $('#bdg-chart-size').text();
          if (!$('#bdg-axes-tab').data('reface')) _bd.reface.saveInfo();
//          if (title && type && size) {
//            _bd.reface.saveInfo();
//          } else {
//            $('#bdg-step1-check-modal').modal('show');
//            return false;
//          }
        });
      },

      registerEvents: function () {
        _bd.designer.checkStep1();
      },

      getMainTable: function () {
        var table = _bd.reface.getTables();
        if (table) return table[0];
        else return false;
      },

      step2AdjustGrid: function () {
        var height = _bd.util.detectHeight('window', 118),
            width = _bd.util.detectWidth('.bdg-content', 0);
        _bd.util.adjustSize('#bdg-axes-setup-src', height * 0.7, width);
        _bd.util.adjustSize('#bdg-axes-setup-tar', height * 0.3, width);
        $(window).on('resize', function () {
          var winHeight = _bd.util.detectHeight('window', 118);
          _bd.util.adjustSize('#bdg-axes-setup-src', winHeight * 0.7, _bd.util.detectWidth('.bdg-content', 0));
          _bd.util.adjustSize('#bdg-axes-setup-tar', winHeight * 0.3, _bd.util.detectWidth('.bdg-content', 0));
        });
      },

      step2: function () {
        _bd.designer.step2AdjustGrid();
      },

      step2GridTuning: function () {
        var height = _bd.util.detectHeight('window', 118);
        $('#bdg-axes-setup-src-grid').gk('height', height * 0.7);
        $('#bdg-axes-setup-tar-grid').gk('height', height * 0.3);
      },

      inAxes: function () {
        _bd.designer.step2GridTuning();
        _bd.designer.step2GridTuning();
      },

      // Common Data Usage
      dataSrc: function (target) {
        _bd.reface.decideMainTable(target);
        $('#bdg-common-data-dialog').dialog('close');
//        var $grid = $('#bdg-data-src-table-grid');
//        $('#bdg-data-src-dialog').dialog({
//          resizable: false,
//          width: 750,
//          height: 550,
//          modal: true,
//          buttons: {
//            "確定": function () {
//              _bd.reface.decideMainTable();
//            }
//          }
//        });
//        $('#bdg-data-src-tabs').tabs();
//        $grid.gk('width', 662);
//        $grid.gk('height', 295);
      },

      queryTables: function () {
        var $grid = $('#bdg-data-src-table-grid'),
            domain = $('#bdg-data-src-search-domain').val().split('-')[0];
        $grid.gk('clear');
        _bd.util.getJSON('bdgcDMA.getTable', {domain: domain, keyword: ''}, function (data) {
          $grid.gk('add', data);
        });
      },

      pickRel: function (trigger) {
        var tbName = _bd.designer.getMainTable(),
            $grid = $('#bdg-pick-relation-grid'),
            $dialog = $('#bdg-pick-relation-dialog'),
            $trigger = $(trigger),
            pos = $trigger.offset(),
            height = $trigger.outerHeight();
        if (tbName) {
          pos.top = pos.top + height;
          $dialog.dialog({
            resizable: false,
            width: 'auto',
            height: 'auto',
            modal: true
          });
          $dialog.closest('.ui-dialog').offset(pos);
          $grid.gk('width', 850);
          $grid.gk('height', 340);
          $grid.gk('heading', "[" + tbName + "]的關聯表格清單");
          $grid.gk('clear');
          _bd.util.getJSON('bdgcDMA.getRelation', {srcTable: tbName}, function (data) {
            var rel = [];
            $.each(data, function (i, v) {
              rel.push($.parseJSON(v.RELATION));
            });
            $grid.gk('add', rel);
          });
        } else {
          $("<div>請先選擇來源表格!!</div>").dialog({
            resizable: false,
            width: 200,
            height: 100,
            title: '來源表格不存在',
            modal: true
          });
        }
      },

      paintSubTable: function (target) {
        var mt = _bd.designer.getMainTable(),
            $grid = $(target),
            gridList = $grid.gk('list');
        if (gridList && gridList.length > 0) {
          $.each(gridList, function (idx, val) {
            if (val.table !== mt) {
              $grid.find('#' + val.id + ' td').css('background-color', 'linen');
            }
          });
        }
      },

      getColForMake: function (type, data) {
        var strList = [],
            numList = [];
        $.each(data, function (idx, val) {
          if (val.table && val.dataType) {
            if (_bd.util.isStrDataType(val.dataType.toLowerCase())) {
              strList.push(val);
            } else {
              numList.push(val);
            }
          }
        });
        return type === 'num' ? numList : strList;
      },

      makeNumCol: function () {
        var $colGrid = $('#bdg-step2-make-col-grid'),
            $subGrid = $('#bdg-step2-make-col-sub-formula-grid'),
            $srcGrid = $('#bdg-axes-setup-src-grid');
        $('#bdg-step2-make-col-dialog').dialog({
          resizable: false,
          width: 950,
          height: 670,
          modal: true
        });
        $colGrid.gk('width', 913);
        $colGrid.gk('height', 200);
        $colGrid.gk('clear');
        $colGrid.gk('add', _bd.designer.getColForMake('num', $srcGrid.gk('list')));
        $subGrid.gk('width', 913);
        $subGrid.gk('height', 128);
        $subGrid.gk('clear');
        $('#bdg-step2-make-col-msg').text('');
        $('.bdg-make-num-col').val('');
      },

      makeStrCol: function () {
        var $colGrid = $('#bdg-step2-make-str-col-grid'),
            $srcGrid = $('#bdg-axes-setup-src-grid');
        $('#bdg-step2-make-str-col-dialog').dialog({
          resizable: false,
          width: 950,
          height: 460,
          modal: true
        });
        $colGrid.gk('width', 913);
        $colGrid.gk('height', 200);
        $colGrid.gk('clear');
        $colGrid.gk('add', _bd.designer.getColForMake('str', $srcGrid.gk('list')));
        $('.bdg-make-str-col').val('');
      },

      makeNumColAct: function (actType, val) {
        var $sub = $('#bdg-step2-make-col-sub-formula'),
            $final = $('#bdg-step2-make-col-final'),
            subVal = $sub.val(),
            $subGrid = $('#bdg-step2-make-col-sub-formula-grid'),
            $msg = $('#bdg-step2-make-col-msg');
        $msg.text('');
        switch (actType) {
          case "col":
            var colRow = $('#bdg-step2-make-col-grid').gk('row'),
                colVal = colRow.table + '.' + colRow.colId;
            if (_bd.util.isOp(subVal)) {
              $sub.val(subVal + colVal);
            } else if (subVal === 'COUNT(*)') {
              $sub.val('COUNT(' + colVal + ')');
            } else {
              $sub.val(colVal);
            }
            break;
          case "op":
            if (subVal) {
              if (_bd.util.isOp(subVal)) {
                $sub.val(subVal.slice(0, -1) + val);
              } else {
                $sub.val(subVal + val);
              }
            } else {
              $msg.text('請先選擇欄位運算元！');
            }
            break;
          case "func":
            if (subVal) {
              $sub.val(val + '(' + subVal + ')');
            } else {
              $msg.text('請先輸入子公式！');
            }
            break;
          case "count":
            $sub.val('COUNT(*)');
            break;
          case "input":
            var inputVal = Number($('#bdg-step2-make-col-selector-input').val());
            if (_bd.util.isOp(subVal)) {
              $sub.val(subVal + inputVal);
            } else {
              $sub.val(inputVal);
            }
            break;
          case "sub":
            var formula = "(" + $subGrid.gk('row').formula + ")";
            if (_bd.util.isOp(subVal)) {
              $sub.val(subVal + formula);
            } else {
              $sub.val(formula);
            }
            break;
          case "resetSub":
            $sub.val('');
            break;
          case "addSub":
            if (subVal !== '' && !_bd.util.isOp(subVal)) {
              $subGrid.gk('add', {formula: subVal});
            } else {
              $msg.text('子公式不完整！');
            }
            break;
          case "final":
            if (subVal !== '' && !_bd.util.isOp(subVal)) {
              $final.val(subVal);
//              if (subVal.match(/SUM|AVG|MIN|MAX|COUNT/g)) {
//                $final.val(subVal);
//              } else {
//                $final.val('SUM(' + subVal + ')');
//                $msg.text('數值型公式須具備函數，總公式預設加上SUM！');
//              }
            } else {
              $msg.text('子公式不完整！');
            }
            break;
          case "resetFinal":
            $final.val('');
            break;
          case "add":
            var colId = $('#bdg-make-num-col-id').val(),
                colName = $('#bdg-make-num-col-name').val(),
                colUnit = $('#bdg-make-num-col-unit').val(),
                finalVal = $final.val();
            if (colId && colName && finalVal) {
              $('#bdg-axes-setup-src-grid').gk('add', {
                table: '',
                colId: colId,
                colName: colName,
                dataType: 'number',
                dataUnit: colUnit,
                formula: finalVal,
                axis: '請選擇'
              });
              _bd.designer.paintSubTable('#bdg-axes-setup-src-grid');
              $('#bdg-step2-make-col-dialog').dialog('close');
            } else {
              $msg.text('請輸入總公式、ID、與名稱！');
            }
            break;
        }
      },

      makeStrColAct: function (act) {
        var $sub = $('#bdg-step2-make-str-col-sub-formula'),
            $final = $('#bdg-step2-make-str-col-final'),
            $pos = $('#bdg-step2-make-str-col-pos'),
            $length = $('#bdg-step2-make-str-col-length'),
            row = $('#bdg-step2-make-str-col-grid').gk('row'),
            colVal = row.table + '.' + row.colId,
            subVal = $sub.val(),
            finalVal = $final.val(),
            $msg = $('#bdg-step2-make-str-col-msg'),
            reg = /\(.*?\)/;
        switch (act) {
          case "col":
            if (subVal === 'COUNT(*)') {
              $sub.val('COUNT(' + colVal + ')');
            } else {
              var length = row.dataSize;
              $sub.val('SUBSTR(' + colVal + ',1,' + length + ')');
              $pos.val('1');
              $length.val(length);
            }
            break;
          case "pos":
            var posVal = Number($pos.val()),
                lengthNow = Number($length.val());
            if (posVal === 0) posVal = 1;
            $sub.val(subVal.replace(reg, "(" + colVal + "," + posVal + "," + lengthNow + ")"));
            break;
          case "length":
            var lengthVal = Number($length.val()),
                posNow = Number($pos.val());
            if (lengthVal === 0) lengthVal = row.dataSize - posNow + 1;
            $sub.val(subVal.replace(reg, "(" + colVal + "," + posNow + "," + lengthVal + ")"));
            break;
          case "count":
            $sub.val('COUNT(*)');
            break;
          case "resetSub":
            $sub.val('');
            $pos.val('');
            $length.val('');
            break;
          case "subConfirm":
            if (subVal !== '') {
              if (finalVal === '') {
                $final.val(subVal);
              } else {
                $final.val(finalVal + '+' + subVal);
              }
            }
            break;
          case "resetFinal":
            $final.val('');
            $msg.text('');
            break;
          case "add":
            var colId = $('#bdg-make-str-col-id').val(),
                colName = $('#bdg-make-str-col-name').val(),
                colUnit = $('#bdg-make-str-col-unit').val();
            if (colId && colName && finalVal) {
              $('#bdg-axes-setup-src-grid').gk('add', {
                table: '',
                colId: colId,
                colName: colName,
                dataType: 'String',
                dataUnit: colUnit,
                formula: finalVal,
                axis: '請選擇'
              });
              _bd.designer.paintSubTable('#bdg-axes-setup-src-grid');
              $('#bdg-step2-make-str-col-dialog').dialog('close');
            } else {
              $msg.text('請輸入總公式、ID、與名稱！');
            }
            break;
        }
      },

      setEssentialAct: function (act, val) {
        var $rule = $('#bdg-essential-col-rule'),
            ruleVal = $rule.val(),
            $ruleGrid = $('#bdg-essential-col-rule-grid'),
            $colGrid = $('#bdg-essential-col-grid'),
            $msg = $('#bdg-essential-col-msg');
        switch (act) {
          case "col":
            var colRow = $colGrid.gk('row'),
                colVal = colRow.formula ? colRow.formula : colRow.table + '.' + colRow.colId;
            if (ruleVal) {
              if (_bd.util.isRuleOp(ruleVal)) {
                $rule.val(ruleVal + ' ' + colVal);
              } else if (ruleVal.lastIndexOf("IS NOT NULL") !== -1) {
                $rule.val(ruleVal + ' AND ' + colVal);
              } else {
                var ruleGrain = ruleVal.split(' ');
                if (ruleGrain.length === 1) {
                  $rule.val(colVal);
                } else {
                  if (_bd.util.isRuleOp(ruleGrain[ruleGrain.length - 2])) {
                    $rule.val(ruleVal + ' AND ' + colVal);
                  } else {
                    var tempRuleGrain = ruleVal.split(' AND ');
                    tempRuleGrain[tempRuleGrain.length - 1] = colVal;
                    $rule.val(tempRuleGrain.join(' AND '));
                  }
                }
                $colGrid.data('colDataType', colRow.dataType);
                $msg.text('');
              }
            } else {
              $rule.val(colVal);
              $colGrid.data('colDataType', colRow.dataType);
              $msg.text('');
            }
            break;
          case "op":
            if (ruleVal) {
              if (_bd.util.isRuleOp(ruleVal)) {
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
            var $input = $('#bdg-essential-col-input'),
                inputVal = $input.val();
            if (_bd.util.isRuleOp(ruleVal)) {
              if (_bd.util.isStrDataType($colGrid.data('colDataType'))) {
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
            if (_bd.util.isInvalidRule(ruleVal) || _bd.util.isRuleOp(ruleVal)) {
              $msg.text('無效的運算式！');
            } else {
              var ruleObj = {rule: ruleVal.split('AND').length > 1 ? '(' + ruleVal + ')' : ruleVal};
              $ruleGrid.gk('add', ruleObj);
              $msg.text('');
            }
            break;
          default:
            var tarId = $(act).closest('tr').attr('id');
            $ruleGrid.gk('del', tarId);
            _bd.reface.storeEssential();
            $msg.text('');
            break;
        }
      },

      dataExtractAct: function (act, val) {
        var $rule = $('#bdg-step2-data-extract-rule'),
            ruleVal = $rule.val(),
            $colGrid = $('#bdg-step2-data-extract-grid'),
            $ruleGrid = $('#bdg-step2-data-extract-rule-grid'),
            $msg = $('#bdg-step2-data-extract-msg');
        switch (act) {
          case "col":
            var colRow = $colGrid.gk('row'),
                colVal = colRow.table + '.' + colRow.colId;
            if (ruleVal) {
              if (_bd.util.isRuleOp(ruleVal)) {
                $rule.val(ruleVal + ' ' + colVal);
//                $msg.text('請由輸入器輸入右運算元！');
              } else {
                var ruleGrain = ruleVal.split(' ');
                if (ruleGrain.length === 1) {
                  $rule.val(colVal);
                } else {
                  if (_bd.util.isRuleOp(ruleGrain[ruleGrain.length - 2])) {
                    $rule.val(ruleVal + ' AND ' + colVal);
                  } else {
                    var tempRuleGrain = ruleVal.split(' AND ');
                    tempRuleGrain[tempRuleGrain.length - 1] = colVal;
                    $rule.val(tempRuleGrain.join(' AND '));
                  }
                }
                $colGrid.data('colDataType', colRow.dataType);
                $msg.text('');
              }
            } else {
              $rule.val(colVal);
              $colGrid.data('colDataType', colRow.dataType);
              $msg.text('');
            }
            break;
          case "op":
            if (ruleVal) {
              if (_bd.util.isRuleOp(ruleVal)) {
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
            var $input = $('#bdg-step2-data-extract-input'),
                inputVal = $input.val();
            if (_bd.util.isRuleOp(ruleVal)) {
              if (_bd.util.isStrDataType($colGrid.data('colDataType'))) {
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
            }
            break;
          case "resetRule":
            $rule.val('');
            $msg.text('');
            break;
          case "addRule":
            if (_bd.util.isInvalidRule(ruleVal) || _bd.util.isRuleOp(ruleVal)) {
              $msg.text('無效的運算式！');
            } else {
              var ruleObj = {rule: ruleVal};
              $ruleGrid.gk('add', ruleObj);
              $msg.text('');
            }
            break;
          default:
            var tarId = $(act).closest('tr').attr('id');
            $ruleGrid.gk('del', tarId);
            _bd.designer.storeDataExtract();
            $msg.text('');
            break;
        }
      },

      removeAxis: function (type, table, colId) {
        var $store = $('#bdg-axes-tab'),
            tarList = $store.data(type);
        $.each(tarList, function (idx, val) {
          if (val.table === table && val.colId === colId) {
            tarList.splice(idx, 1);
            return false;
          }
        });
      },

      switchDataPrevBtn: function (on) {
        if (on) $('#bdg-data-prev-btn').removeClass('disabled');
        else $('#bdg-data-prev-btn').addClass('disabled');
      },

      storeAxis: function (type, data) {
        var $store = $('#bdg-axes-tab');
        _bd.designer.switchDataPrevBtn(true);
        switch (type) {
          case "X":
            var listX = $store.data(type);
            if (!listX) listX = [];
            listX.push(data);
            $store.data(type, listX);
            break;
          case "YL":
            var listYL = $store.data(type);
            if (!listYL) listYL = [];
            if ($rootScope.lineProcess.active && !data.formula) data.func = "SUM";
            listYL.push(data);
            $store.data(type, listYL);
            break;
          case "YR":
            var listYR = $store.data(type);
            if (!listYR) listYR = [];
            if ($rootScope.lineProcess.active && !data.formula) data.func = "SUM";
            listYR.push(data);
            $store.data(type, listYR);
            break;
          case "S":
            var listS = $store.data(type);
            if (!listS) listS = [];
            listS.push(data);
            $store.data(type, listS);
            break;
        }
      },

      addAxis: function (axis) {
        var $srcGrid = $('#bdg-axes-setup-src-grid'),
            $tarGrid = $('#bdg-axes-setup-tar-grid'),
            srcData = $srcGrid.gk('row');
  //        $srcGrid.gk('del', srcData.id);
        srcData.axis = _bd.util.getAxisName(axis);
        if ($rootScope.lineProcess.active && axis.slice(0, 1) === 'Y' && !srcData.formula) srcData.func = "SUM";
        $tarGrid.gk('add', srcData);
      },

      delAxis: function (trigger) {
        var $srcGrid = $('#bdg-axes-setup-src-grid'),
            srcList = $srcGrid.gk('list'),
            $tarGrid = $('#bdg-axes-setup-tar-grid'),
            tarId = $(trigger).closest('tr').attr('id'),
            tarData;
        $tarGrid.jqGrid('saveRow', tarId, false);
        tarData = $tarGrid.gk('row', tarId);
        $tarGrid.gk('del', tarId);
//        $srcGrid.gk('add', {
//          table: tarData.table,
//          colId: tarData.colId,
//          colName: tarData.colName,
//          dataType: tarData.dataType,
//          dataSize: tarData.dataSize,
//          formula: tarData.formula,
//          axis: '請選擇'
//        });
        _bd.designer.removeAxis(_bd.util.getAxisKey(tarData.axis), tarData.table, tarData.colId);
        _bd.designer.paintSubTable('#bdg-axes-setup-src-grid');
        $.each(srcList, function (i, v) {
          if ((v.table === '' || v.table === tarData.table) && v.colId === tarData.colId) {
            $srcGrid.gk('setCell', 'axis', v.id, '請選擇');
          }
        });
      },

      setAxisInfo: function () {
        var colRow = $('#bdg-axes-setup-src-grid').gk('row'),
            axis = $('#' + colRow.id + '_axis option:selected').val();
        switch (axis) {
          case 'X':
            _bd.designer.storeAxis(axis, colRow);
            _bd.designer.addAxis(axis);
            break;
          case 'YL':
            _bd.designer.storeAxis(axis, colRow);
            _bd.designer.addAxis(axis);
            break;
          case 'YR':
            _bd.designer.storeAxis(axis, colRow);
            _bd.designer.addAxis(axis);
            break;
          case 'S':
            _bd.designer.storeAxis(axis, colRow);
            _bd.designer.addAxis(axis);
            break;
        }
      },

      setEssential: function () {
        var $colGrid = $('#bdg-essential-col-grid'),
            $ruleGrid = $('#bdg-essential-col-rule-grid'),
            $srcGrid = $('#bdg-axes-setup-src-grid');
        $('#bdg-essential-col-dialog').dialog({
          resizable: false,
          width: 950,
          height: 640,
          modal: true,
          buttons: {
            "確定": function () {
              _bd.reface.storeEssential();
              $(this).dialog('close');
            }
          }
        });
        $colGrid.gk('width', 913);
        $colGrid.gk('height', 200);
        $colGrid.gk('clear');
        $colGrid.gk('add', $srcGrid.gk('list'));
        $ruleGrid.gk('width', 913);
        $ruleGrid.gk('height', 150);
        $ruleGrid.gk('clear');
        $ruleGrid.gk('add', _bd.reface.getEssential('arr'));
      },

      dataPrev: function () {
        var params;
        _bd.designer.storeDataExtract();
        params = _bd.reface.getDataPrevInfo();
        // info verify -- check the parameters
        var verify = _bd.designer.infoVerify(params);
        if (!verify.approved) {
          bootbox.alert(verify.warning);
          return;
        }
        $http.post('bdgcLogic.getPreviewData', params).success(function (data) {
          _bd.designer.dataView(data);
          $rootScope.statProcess.showStatTable = false;
          $rootScope.statProcess.dataBtnLabel = '分佈圖型';
        });
      },

      dataView: function (data) {
        var $dialog = $('#bdg-data-view-dialog'),
            $table = $('#bdg-step2-data-view-table'),
            exeData = data.exeData,
            exeResult = data.exeResult,
            totalRow = data.totalRow,
            dataStr = "<thead><tr>",
            title = "資料預覽，查詢失敗";
        // remove table first
        $table.children().remove();
        if (exeResult === 'Success') {
          if (totalRow < 50) {
            title = "資料預覽，總共" + totalRow + "筆資料";
          } else {
            title = "資料預覽，總共" + totalRow + "筆資料，只顯示前50筆";
          }
          $dialog.dialog({
            width: 950,
            height: 650,
            modal: true,
            title: title
          });
          $('#bdg-step2-chart-data-view').text('圖型預覽');
          if (exeData.length > 0) {
            $.each(exeData[0], function (key, val) {
              dataStr += "<th class='text-center'>" + key + "</th>";
            });
            dataStr += "</tr></thead><tbody>";
            $.each(exeData, function (trIdx, trVal) {
              dataStr += "<tr>";
              $.each(trVal, function (tdIdx, tdVal) {
                if (tdIdx.slice(0, 1) === 'Y' && $.isNumeric(tdVal)) {
                  var valFmt = $.formatNumber(tdVal, {format: '###,##0.00'});
                  dataStr += "<td class='text-right'>" + valFmt + "</td>";
                } else {
                  dataStr += "<td>" + tdVal + "</td>";
                }
              });
              dataStr += "</tr>";
            });
            dataStr += "</tbody>";
            $table.append(dataStr);
          }
          $('#bdg-data-view').show();
          $('#bdg-chart-view').hide();
          _bd.util.showScroll('#bdg-data-view-dialog');
        } else {
          $dialog.dialog({
            width: 950,
            height: 650,
            modal: true,
            title: title
          });
          _bd.designer.turnOnDataView(false);
        }
      },

      registerChartResize: function (target) {
        $(target).closest('.ui-dialog').on('resize', function (evt) {
          var data = {
            width: evt.target.clientWidth,
            height: evt.target.clientHeight
          };
          _bd.drawer.redraw('#bdg-chart-view-canvas', data);
        });
      },

      turnOnDataView: function (doPrev) {
        var $view = $('#bdg-step2-chart-data-view');
        $view.text('圖型預覽');
        $('#bdg-data-view').show();
        $('#bdg-chart-view').hide();
        _bd.util.showScroll('#bdg-data-view-dialog');
        if (doPrev) _bd.designer.dataPrev();
      },

      turnChartDataView: function () {
        var $view = $('#bdg-step2-chart-data-view'),
            viewText = $view.text();
        if (viewText === '圖型預覽') {
          $view.text('資料預覽');
          $('#bdg-data-view').hide();
          $('#bdg-chart-view').show();
          _bd.designer.chartPrev();
          _bd.designer.registerChartResize('#bdg-data-view-dialog');
          _bd.util.hideScroll('#bdg-data-view-dialog');
        } else {
          _bd.designer.turnOnDataView(true);
        }
      },

      chartPrev: function () {
        var info = _bd.reface.getDataPrevInfo();
        _bd.util.getJSON('bdgcLogic.getChartData', info, function (data) {
          var result = data.exeResult,
              $dialog = $('#bdg-data-view-dialog');
          if (result === "Success") {
            _bd.designer.chartView(data);
            $dialog.dialog({title: '圖形預覽'});
            $('#bdg-chart-view').show();
          } else {
            $dialog.dialog({title: data.exeMsg});
            $('#bdg-chart-view').hide();
          }
        });
      },

      chartView: function (data) {
        var cd = data,
            tc,
            $canvas = $('#bdg-chart-view-canvas');
        $.extend(true, cd, {
          canvasId: 'bdg-chart-view-canvas',
          chartType: data.chartType,
          chartTitle: data.chartTitle,
          box: '#bdg-data-view-dialog'
        });
        tc = _bd.drawer.designLine(cd);
        $canvas.data('teechart', tc);
      },

      infoVerify: function (info) {
        var approved = true,
            waring = '',
            x = info.axisX,
            yl = info.axisYL,
            yr = info.axisYR;
        if (info.chartType === 'Line') {
          if (!x || x.length < 1) {
            approved = false;
            waring = '請指定X軸';
          } else if (x.length > 1) {
            approved = false;
            waring = '請指定唯一的X軸，不可有多個X軸線設定！';
          } else if (yl.length === 0 && yr.length === 0) {
            approved = false;
            waring = '請至少指定一個Y軸！';
          } else {
            var x0 = x[0],
                uc = info.uniqueCol,
                y = yl.concat(yr);
            if (uc) {
              $.each(uc, function (i, v) {
                if (v.table === x0.table && v.colId === x0.colId) {
                  approved = false;
                  waring = '請勿將X軸欄位同時指定為鍵值！';
                }
              });
            }
            $.each(y, function (i, v) {
              if (v.dataType && _bd.util.isStrDataType(v.dataType)) {
                approved = false;
                waring = 'Y軸必須指定數值型欄位！';
              }
            });
          }
        } else {

        }
        return {
          approved: approved,
          warning: waring
        };
      },

      advChartPrev: function (suv) {
        debugger;
        var info = _bd.reface.getDataPrevInfo(),
            chartTitle = _bd.reface.chartTitle(),
            chartSize = $('#bdg-chart-size').data('realSize'),
            chartWidth = 700, chartHeight = 500;
        if (suv) {
          info.sqlWhere = info.sqlWhere.concat(suv);
        } else {
          _bd.reface.saveUC();
          $.extend(true, info, _bd.reface.getUniqueCol());
        }
        var verify = _bd.designer.infoVerify(info);
        if (!verify.approved) {
          bootbox.alert(verify.warning);
          return;
        }
        if (chartSize) {
          chartWidth = chartSize.width;
          chartHeight = chartSize.height;
        }
        $('#bdg-adv-chart-prev-dialog').dialog({
          modal: false,
          resizable: false,
          width: chartWidth,
          height: chartHeight,
          title: chartTitle + "(" + _bd.reface.getInfoId(false) + ")"
        });

        _bd.util.getJSON('bdgcLogic.getChartData', info, function (data) {
          var result = data.exeResult,
              $dialog = $('#bdg-adv-chart-prev-dialog'),
              $chart = $('#bdg-adv-chart-view');
          if (result === "Success") {
            var uv = data.defaultUK;
            if (uv && uv.length > 0) {
              _bd.reface.storeUV(uv);
              _bd.reface.storeUniqueCol('val', uv);
            } else {
              data.defaultUK = $('#bdg-store').data('uv');
            }
            _bd.designer.advChartView(data);
            $chart.show();
          } else {
            console.log(data.exeMsg);
            $dialog.dialog({title: '取得繪圖資料失敗！(F12查看錯誤訊息)'});
            $chart.hide();
          }
        });
      },

      advChartView: function (data) {
        var cd = data,
            tc,
            $canvas = $('#bdg-adv-chart-view-canvas');
        $.extend(true, cd, {
          canvasId: 'bdg-adv-chart-view-canvas',
          chartType: data.chartType,
          chartTitle: _bd.drawer.genChartTitle(data),
          box: '#bdg-adv-chart-prev-dialog'
        });
        tc = _bd.drawer.designLine(cd);
        $canvas.data('teechart', tc);
      },

      setDataOrder: function () {
        var $colGrid = $('#bdg-data-order-grid'),
            $ruleGrid = $('#bdg-data-order-rule-grid'),
            $tarGrid = $('#bdg-axes-setup-tar-grid'),
            dataOrder = $('#bdg-axes-tab').data('dataOrder');
        $('#bdg-data-order-dialog').dialog({
          resizable: false,
          width: 950,
          height: 530,
          modal: true,
          buttons: {
            "資料預覽": function () {
              _bd.reface.storeDataOrder();
              _bd.designer.turnOnDataView(true);
              $(this).dialog('close');
            }
          }
        });
        $('#bdg-data-order-rule').val('');
        $colGrid.gk('width', 913);
        $colGrid.gk('height', 200);
        $colGrid.gk('clear');
        $colGrid.gk('add', $tarGrid.gk('list'));
        $ruleGrid.gk('width', 913);
        $ruleGrid.gk('height', 150);
        $ruleGrid.jqGrid('gridDnD', {
          connectWith: '#bdg-data-order-rule-grid'
        });
        if (!dataOrder) $ruleGrid.gk('clear');
      },

      dataOrderAct: function (act) {
        var $rule = $('#bdg-data-order-rule'),
            ruleVal = $rule.val(),
            realVal = $rule.data('realObj'),
            $ruleGrid = $('#bdg-data-order-rule-grid'),
            $colGrid = $('#bdg-data-order-grid'),
            colRow = $colGrid.gk('row');
        switch (act) {
          case "col":
            var colVal = colRow.table + '.' + colRow.colId + ' ASC',
                realObj = {axis: _bd.reface.getPrevDataPrefix(colRow.axis), rule: colVal};
            $rule.val(colVal);
            $rule.data('realObj', realObj);
            break;
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
              $ruleGrid.gk('add', realVal);
            }
            break;
          default:
            var tarId = $(act).closest('tr').attr('id');
            $ruleGrid.gk('del', tarId);
            _bd.reface.storeDataOrder();
            break;
        }
      },

      dataExtract: function () {
        var $colGrid = $('#bdg-step2-data-extract-grid'),
            $ruleGrid = $('#bdg-step2-data-extract-rule-grid'),
            $srcGrid = $('#bdg-axes-setup-src-grid');
        $('#bdg-step2-data-extract-dialog').dialog({
          resizable: false,
          width: 950,
          height: 650,
          modal: true,
          buttons: {
            "資料預覽": function () {
              _bd.designer.dataPrev();
              $(this).dialog('close');
            }
          }
        });
        $colGrid.gk('width', 913);
        $colGrid.gk('height', 200);
        $colGrid.gk('clear');
        $colGrid.gk('add', $srcGrid.gk('list'));
        $ruleGrid.gk('width', 913);
        $ruleGrid.gk('height', 150);
//        $ruleGrid.gk('clear');
      },

      getDataExtract: function () {
        var extract = $('#bdg-axes-tab').data('extract');
        if (extract && extract.length > 0) {
          var exStr = '';
          $.each(extract, function (idx, val) {
            exStr += val + ' OR ';
          });
          return '(' + exStr.slice(0, -4) + ')';
        }
        return '';
      },

      storeDataExtract: function () {
        var exList = [],
            rules = $('#bdg-step2-data-extract-rule-grid').gk('list');
        $.each(rules, function (idx, val) {
          exList.push(val.rule);
        });
        $('#bdg-axes-tab').data('extract', exList);
      },

      step3AdjustGrid: function () {
        var height = _bd.util.detectHeight('window', 118),
            width = _bd.util.detectWidth('.bdg-content', 0);
        _bd.util.adjustSize('#bdg-lc-src', height * 0.6, width);
        _bd.util.adjustSize('#bdg-lc-tar', height * 0.4, width);
        $(window).on('resize', function () {
          var winHeight = _bd.util.detectHeight('window', 118);
          _bd.util.adjustSize('#bdg-lc-src', winHeight * 0.6, _bd.util.detectWidth('.bdg-content', 0));
          _bd.util.adjustSize('#bdg-lc-tar', winHeight * 0.4, _bd.util.detectWidth('.bdg-content', 0));
        });
      },

      step3: function () {
        _bd.designer.step3AdjustGrid();
      },

      step3GridTuning: function () {
        var height = _bd.util.detectHeight('window', 118);
        $('#bdg-lc-src-grid').gk('height', height * 0.6);
        $('#bdg-lc-tar-grid').gk('height', height * 0.4);
      },

      inLc: function () {
        var lcInit = $('#bdg-axes-tab').data('lcInit');
        _bd.designer.step3GridTuning();
        _bd.designer.step3GridTuning();
        if (lcInit) {
          _bd.reface.limitColReload();
        } else {
          _bd.reface.limitColInit();
        }
      },

      sqlPrev: function () {
        _bd.util.getJSON('bdgcLogic.getFinalSql', _bd.reface.getDataPrevInfo(), function (data) {
          if (data) bootbox.alert(data);
          else bootbox.alert('SQL預覽失敗，請重新確認軸線資料！');
        });
      },

      step4AdjustGrid: function () {
        var height = _bd.util.detectHeight('window', 108),
            width = _bd.util.detectWidth('.bdg-content', 0);
        _bd.util.adjustSize('#bdg-step4-content', height, width);
        $(window).on('resize', function () {
          _bd.util.adjustSize('#bdg-step4-content', _bd.util.detectHeight('window', 82), _bd.util.detectWidth('.bdg-content', 0));
        });
      },

      step4: function () {
        _bd.designer.step4AdjustGrid();
      },

      doStep4: function () {

      }

      // $('.bdg-content a[href="#bdg-basic"]').trigger('click');

    }
  });
});