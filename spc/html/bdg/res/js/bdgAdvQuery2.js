/**
 * Created by I25834 on 2014/7/21.
 */
(function () {
  angular.module('bdgApp').controller('advQueryCtrl', function ($scope, $http,$modal,$dmaService,$alert, uiGridConstants) {
    "use strict";
    $.extend(_bdg, {
      aq: {
        getRSInfo: function (type) {
          var info = {
            type: type,
            mustWhere: _bdg.aq.getAQCCondition()
          };
          if (_bdg.designer) {
            info.tableId = _bdg.reface.getTables();
            info.relation = _bdg.reface.getRel();
            info.limitCol = _bdg.reface.getLimitCol('obj');
          } else if (_bdg.spc) {
            var infoId = _bdg.spc.getActiveInfoId(),
                infoStore = $('#bas-store').data('info') || {},
                isi = infoStore[infoId];
            if (isi) {
              var uv = $('#' + _bdg.spc.getActiveChart()).data('uv');
              info.canvasId = isi.INFOID;
              info.tableId = $.parseJSON(isi.TABLEID);
              if (isi.RELATION) info.relation = $.parseJSON(isi.RELATION);
              if (isi.LIMITCOL) {
                info.limitCol = _bdg.spc.getLimitColInfo($.parseJSON(isi.LIMITCOL));
                // set the new selected unique value
                if (uv && uv.length > 0) {
                  $.each(uv, function (i, v) {
                    $.each(info.limitCol, function (i2, v2) {
                      if (v.table.toUpperCase() === v2.table.toUpperCase() && v.colId.toUpperCase() === v2.colId.toUpperCase()) {
                        v2.value = v.value;
                      }
                    });
                  });
                }
              }
            }
          }
          if (type === 'UC') {
            var uc = [];
            $.each(info.limitCol, function (i, v) {
              if (v.isUK.split('-')[0] === '1') uc.push(v);
            });
            info.limitCol = uc;
          } else {
            var sort = $('#bdg-adv-query-sort').data('aqSort') || '';
            info.orderBy = sort;
          }
          return info;
        },

        getResultSet: function (type) {
          _bdg.util.getJSON('bdgcLogic.getLCUCResult', _bdg.aq.getRSInfo(type), function (data) {
            _bdg.aq.showUVTable(type, data);
            if (_bdg.spc && data.result) {
              data.INFOID = data.canvasId;
            }
          });
        },

        showUVTable: function (type, data) {
          var rs = data.result,
              isUC = type === 'UC',
              lc = [], uc = '',
              tbDom = "<thead><tr>",
              boxId = isUC ? 'bdg-adv-query-rs-unique' : 'bdg-adv-query-rs',
              $box = $('#' + boxId);
//        $table.children().remove();
//        $('#bdg-adv-query-rs-unique').children().remove();
//        $('#bdg-adv-query-rs').children().remove();
          if (rs) {
            if (_bdg.designer) lc = _bdg.reface.getLimitCol('obj');
            else if (_bdg.spc) lc = _bdg.spc.getLimitColInfo();

            var g = '<div style="height:4px;"></div><div is="jqgrid" id="' + boxId + '-grid" autofit="true" headervisible="false" width="800" height="480" ' +
                'onrow="_bdg.aq.chartPrevByUV(' + isUC + ')" filtertoolbar="true" checkbox="false" page="false" stripe="false">';
            $.each(lc, function (i, v) {
              var isUK = v.isUK.split('-')[0] === '1',
                  colName = v.colId.toUpperCase(),
                  row = '<div is="jqcol" name="' + colName + '" label="' + colName + '" sortable="true"></div>';
              if (isUC) {
                if (isUK) g += row;
              } else {
                g += row;
              }
            });
            $box.html($.gk.toHTML(g) + '</div>');
            $('#' + boxId + '-grid').gk('add', rs);


          } else {

          }
        },

        aqResultSet: function (type) {
          _bdg.aq.closeCommonData();
          _bdg.aq.storeAQC();
          _bdg.aq.getResultSet(type);
        },

        openAI: function (trigger) {
          var triggerId = $(trigger).closest('tr').attr('id');
          $('#bdg-aq-assist-dialog').dialog({
            resizable: false,
            modal: true,
            width: 600,
            height: 500
          });
          $('#bdg-aq-assist-table').data('triggerId', triggerId);
          _bdg.util.getJSON('bdgcDMA.getAllQuerySet', {}, function (data) {
            _bdg.aq.showAITable(data);
          });
        },

        showAITable: function (data) {
          var tbDom = '',
              $table = $('#bdg-aq-assist-table'),
              triggerId = $table.data('triggerId');
          $table.children().remove();
          if (data) {
            tbDom += "<thead><tr><th class='text-center'>輔助輸入鍵值</th><th class='text-center'>過濾方式</th><th class='text-center'>說明</th></tr></thead><tbody>";
            $.each(data, function (i, v) {
              tbDom += "<tr style='cursor:pointer;' onclick='_bdg.aq.setAssist(\"" + triggerId + "\", \"" + v.assistId + "\")'>";
              $.each(v, function (i2, v2) {
                tbDom += "<td>" + v2 + "</td>";
              });
              tbDom += "</tr>";
            });
            tbDom += "</tbody>";
            $table.append(tbDom);
          } else {
            $table.append("<th class='text-center'>查無資料！</th></tr></thead>");
          }
        },

        setAssist: function (triggerId, assistId) {
          if (_bdg.designer) {
            $('#bdg-lc-tar-grid').gk('setCell', 'inputType', triggerId, assistId);
          }
          $('#bdg-aq-assist-dialog').dialog('close');
        },

        setupDatePicker: function () {
          $('.form_datetime').datetimepicker({
            language: 'zh-TW',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            forceParse: 0,
            showMeridian: 1,
            viewSelect: 'year'
          });
          $('.form_date').datetimepicker({
            language: 'zh-TW',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
          });
          $('.form_time').datetimepicker({
            language: 'zh-TW',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 1,
            minView: 0,
            maxView: 1,
            forceParse: 0
          });
        },

        setAdvQuery: function (data) {
          var gData = data || $('#bdg-lc-tar-grid').gk('list'),
              $form = $('#bdg-adv-query-form'),
              $colTab = $('#bdg-adv-query-dialog a[href="#bdg-adv-query-col"]');
          $('#bdg-adv-query-dialog').dialog({
            resizable: true,
            width: 800,
            height: 600,
            modal: true,
            close: function () {
              _bdg.aq.closeCommonData();
            }
          }).dialog("widget").draggable("option", "containment", "none");
          if (!$colTab.closest('li').hasClass('active')) $colTab.trigger('click');
          $form.children().remove();
          if (_bdg.designer) {
            _bdg.reface.saveUC();
          }
          if (gData && gData.length > 0) {
            $form.append(_bdg.aq.genAdvQuery(gData));
            _bdg.aq.setupDatePicker();
            _bdg.aq.setAQC();
          }
        },

        setAQC: function () {
          var data,
              input = $('#bdg-adv-query-form').find('input');
          if (_bdg.spc) {
            data = $('#' + _bdg.spc.getActiveChart()).data('aqc');
          } else if (_bdg.designer) {
            data = $('#bdg-adv-chart-view-canvas').data('aqc');
          }
          $.each(input, function (i, v) {
            var $v = $(v),
                aqc = $v.data('aqc'),
                aqcVal = data ? data[aqc] : '';
            if (aqcVal) $v.val(aqcVal);
          });
        },

        storeAQC: function () {
          var $store, aqc = {},
              data = $('#bdg-adv-query-form').find('input');
          if (_bdg.spc) {
            $store = $('#' + _bdg.spc.getActiveChart());
          } else if (_bdg.designer) {
            $store = $('#bdg-adv-chart-view-canvas');
          }
          $.each(data, function (i, v) {
            var $v = $(v),
                val = $v.val();
            if (val) aqc[$v.data('aqc')] = val;
          });
          $store.data('aqc', aqc);
        },

        getAQCCondition: function () {
          var condition = [],
              aqc = $('#bdg-adv-query-form').find('input');
          $.each(aqc, function (i1, v1) {
            var $temp = $(v1),
                tVal = $temp.val(),
                aqcVal = $temp.data('aqc');
            if (tVal) {
              var ts = tVal.split(',');
              if (ts.length === 1) {
                var tsr = ts[0].split('~');
                if (tsr.length === 1) condition.push(aqcVal + " = '" + $temp.val() + "'");
                else condition.push(aqcVal + " BETWEEN '" + tsr[0] + "' AND '" + tsr[1] + "'");
              } else {
                var orStr = '', orList = [],
                    inCond = aqcVal + " IN (";
                $.each(ts, function (i2, v2) {
                  var tsr2 = v2.split('~');
                  if (tsr2.length === 1) inCond += "'" + v2 + "',";
                  else orList.push(aqcVal + " BETWEEN '" + tsr2[0] + "' AND '" + tsr2[1] + "'");
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

        isDateType: function (v) {
          var t = 'YEAR,YEAR_MONTH,DATE,DATE_TIME,TIME';
          return t.indexOf(v) !== -1;
        },

        genAdvQuery: function (data) {
          var dom = '<div style="height:4px;"></div>';
          $.each(data, function (i, v) {
            var row, input,
                isShow = v.isUK.split('-')[0] === '3',
                type = v.inputType,
                col = v.table + '.' + v.colId,
                showCol = v.colName + '(' + v.colId + ')';
            if (!isShow) {
              if (!_bdg.aq.isDateType(type)) {
                if (type === 'INPUT') {
                  input = '<input type="text" class="form-control" placeholder="請輸入資料值" data-aqc="' + col + '">';
                } else {
                  input = '<span class="input-group-addon" onclick="_bdg.aq.showCommonData(this, \'_bdg.aq.setAdvQueryCol\')"><span title="輔助搜尋" class="glyphicon glyphicon-filter"></span></span>' +
                  '<input type="text" class="form-control" placeholder="點擊前端按鈕，查詢輔助輸入資料清單" data-key="' +
                  type + '" data-aqc="' + col + '">';
                }
                input += '<span class="input-group-addon" onclick="_bdg.aq.removeAQC(this)"><span title="清空輸入值" class="glyphicon glyphicon-remove"></span></span>';
              } else {
                input = _bdg.aq.getBootIcon(v.inputType) + '<input type="text" class="form-control" placeholder="請點擊操作日期、時間挑選器" data-aqc="' + col + '">' +
                '<span class="input-group-addon"><span title="清空輸入值" class="glyphicon glyphicon-remove"></span></span>';
              }
              row =
                  '<div class="form-group col-lg-12">' +
                  '<label class="control-label">' + showCol + '：</label>' +
                  _bdg.aq.getBootDateTimePicker(v.inputType) + input +
                  '</div>' +
                  '</div>';
              dom += row;
            }
          });
          return dom;
        },

        removeAQC: function (trigger) {
          $(trigger).siblings('input').val('');
        },

        getBootDateTimePicker: function (type) {
          switch (type) {
            case "DATE_TIME":
              return '<div class="input-group date form_datetime" data-date-format="yyyymmdd - hh:ii">';
            case "TIME":
              return '<div class="input-group date form_time" data-date-format="hh:ii">';
            case "DATE":
              return '<div class="input-group date form_date" data-date-format="yyyymmdd">';
            default:
              return '<div class="input-group">';
          }
        },

        getBootIcon: function (type) {
          switch (type) {
            case "DATE":
              return '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>';
            case "TIME":
              return '<span class="input-group-addon"><span class="glyphicon glyphicon-time"></span></span>';
            default:
              return '<span class="input-group-addon"><span class="glyphicon glyphicon-th"></span></span>';
          }
        },

        setAQCRangeSymbol: function () {
          var $input = $('#bdg-adv-query-col').data('inputTarget'),
              oldVal = $input.val();
          if (oldVal && oldVal.slice(-1) !== '~') $input.val(oldVal + '~');
        },

        setAdvQueryCol: function (target) {
          var row = $('#bdg-data-com').gk('row'),
              tarCell = row[target],
              $input = $('#bdg-adv-query-col').data('inputTarget'),
              oldVal = $input.val();
          if (oldVal) {
            if (oldVal.slice(-1) !== '~') $input.val(oldVal + ',' + tarCell);
            else $input.val(oldVal + tarCell);
          } else {
            $input.val(tarCell);
          }
        },
        //TODO GET DDTABLE BOSON
        getCommonData: function (onRowCallback, dataKey, noNav) {
          _bdg.util.getJSON('bdgcDMA.getQuerySet', {assistId: dataKey, filterWay: 'FilterList'}, function (data) {
            _bdg.aq.genGrid(data, onRowCallback, noNav);
          });
        },
        //TODO 產生 template
        genGrid: function (data, onRowCallback, noNav) {
          var result = data.exeResult,
              rs = data.exeData,
              $box = $('#bdg-common-data-dialog');
          if (result === 'Success') {

            var col = rs[0],
                target = data.target,
                nav = noNav ? '' :
                '<nav class="navbar navbar-toolbar" role="navigation">' +
                '<div class="container-fluid">' +
                '<div class="btn-toolbar" role="toolbar">' +
                '<div class="btn-group">' +
                '<button id="bdg-common-data-range-symbol" class="btn btn-default" onclick="_bdg.aq.setAQCRangeSymbol()">區間符號</button>' +
                '</div></div></div></nav>',
                g = '<div is="jqgrid" id="bdg-data-com" autofit="true" headervisible="false" width="800" height="300" ' +
                    'onrow="' + onRowCallback + '(\'' + target + '\')" filtertoolbar="true" checkbox="false" page="false" stripe="false">';
            $.each(col, function (i, v) {
              g += '<div is="jqcol" name="' + i + '" label="' + i + '" sortable="true"></div>';
            });
            $box.html(nav + $.gk.toHTML(g) + '</div>');
            $('#bdg-data-com').gk('add', rs);
          } else {
            $box.html('查詢資料元件失敗！');
          }
        },

        showCommonData: function (trigger, onRowCallback, assistId, noNav) {
          var $dialog = $("#bdg-common-data-dialog"),
              $trigger = $(trigger),
              $input = $(trigger).next(),
              pos = $trigger.offset(),
              key = assistId || $input.data('key'),
              height = $trigger.outerHeight();
          $('#bdg-adv-query-col').data('inputTarget', $input);
          pos.top = pos.top + height;
          $dialog.dialog({
            title: key + '資料清單',
            resizable: true,
            modal: true,
            draggable: true,
            width: 'auto',
            height: 'auto'
          });
          $dialog.closest('.ui-dialog').offset(pos);
          _bdg.aq.getCommonData(onRowCallback, key, noNav);
        },

        closeCommonData: function () {
          var $dialog = $("#bdg-common-data-dialog");
          if ($dialog.filter(':visible').length) $dialog.dialog('close');
        },

        chartPrevByUV: function (isUC) {
          var row = isUC ? $('#bdg-adv-query-rs-unique-grid').gk('row') : $('#bdg-adv-query-rs-grid').gk('row');
          if (_bdg.designer) {
            var rsUV = [],
                selectedUV = [],
                uc = _bdg.reface.getUniqueCol('com');
            $.each(uc, function (i, v) {
              var colId = v.split('.')[1].toUpperCase();
              rsUV.push(v + " = '" + row[colId] + "'");
              selectedUV.push(v + ":" + row[colId]);
            });
            _bdg.designer.advChartPrev(rsUV);
            $('#bdg-store').data('uv', selectedUV);
          } else if (_bdg.spc) {
            _bdg.spc.aqChartPrev(row);
          }
          $('#bdg-adv-query-dialog').dialog('close');
        },

        genDataOrder: function () {
          var rs = '',
              data = $('#bdg-aq-data-order-rule-grid').gk('list');
          $.each(data, function (i, v) {
            rs += v.rule + ',';
          });
          $('#bdg-adv-query-sort').data('aqSort', rs.slice(0, -1));
        },

        aqDataOrder: function () {
          var $colGrid = $('#bdg-aq-data-order-grid'),
              $ruleGrid = $('#bdg-aq-data-order-rule-grid'),
              data = [];
          if (_bdg.designer) data = $('#bdg-lc-tar-grid').gk('list');
          else if (_bdg.spc) data = _bdg.spc.getLimitColInfo();
          $('#bdg-aq-data-order-dialog').dialog({
            resizable: false,
            width: 950,
            height: 530,
            modal: true,
            buttons: {
              "確定": function () {
                _bdg.aq.genDataOrder();
                $(this).dialog('close');
              }
            }
          });
          $('#bdg-aq-data-order-rule').val('');
          $colGrid.gk('width', 913);
          $colGrid.gk('height', 200);
          $colGrid.gk('clear');
          $colGrid.gk('add', data);
          $ruleGrid.gk('width', 913);
          $ruleGrid.gk('height', 150);
          $ruleGrid.jqGrid('gridDnD', {
            connectWith: '#bdg-aq-data-order-rule-grid'
          });
        },

        aqDataOrderAct: function (act) {
          var $rule = $('#bdg-aq-data-order-rule'),
              ruleVal = $rule.val(),
              realVal = $rule.data('realObj'),
              $ruleGrid = $('#bdg-aq-data-order-rule-grid'),
              $colGrid = $('#bdg-aq-data-order-grid'),
              colRow = $colGrid.gk('row');
          switch (act) {
            case "col":
              var colVal = colRow.table + '.' + colRow.colId + ' ASC',
                  realObj = {rule: colVal};
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
              break;
          }
        }

      }
    });



  });
})();
