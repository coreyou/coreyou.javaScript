angular.module('bdgApp').controller('bdgRefaceCtrl', function ($rootScope, $http) {
  "use strict";
  $.extend(_bd, {
    reface: {
      queryColumns: function (tbId) {
        var $colGrid = $('#bdg-axes-setup-src-grid');
        _bd.util.getJSON('bdgcDMA.getColumn', {tableId: tbId}, function (data) {
          var colList = [];
          $.each(data, function (i, v) {
            var colObj = {
              table: v.DEFTABLENAME,
              colId: v.SRCCOLUMNNAME,
              colName: v.COLUMNNAME,
              dataType: v.SRCDATATYPE,
              dataSize: v.SRCLENGTH,
              axis: '請選擇'
            };
            colList.push(colObj);
          });
          if (colList) {
            $colGrid.gk("add", colList);
            _bd.designer.paintSubTable('#bdg-axes-setup-src-grid');
          }
        });
      },

      decideChartType: function (type) {
        $rootScope.setChartType(type);
      },

      clearGridStylus: function (gridId) {
        var $cells = $('#' + gridId + ' tr.jqgrow td');
        $cells.css('background-color', '').text("").attr("title", "");
      },

      writeCell: function (gridId, colName, rowId, text) {
        var $grid = $('#' + gridId);
        $grid.gk('setCell', colName, rowId, text);
      },

      paintGridCell: function (gridId, x, y, color) {
        var $rows = $('#' + gridId + ' tr.jqgrow:lt(' + y + ')');
        if ($rows) {
          $.each($rows, function (idx, val) {
            $(val).find('td:lt(' + x + ')').css('background-color', color);
          });
        }
      },

      paintGridRow: function (gridId, color) {
        var $rows = $('#' + gridId + ' tr.jqgrow');
        if ($rows) {
          $.each($rows, function (idx, val) {
            var realColor = color === 'random' ? _bd.util.getRandomColor() : color;
            $(val).find('td').css('background-color', realColor);
          });
        }
      },

      getInfoId: function (genId) {
        var infoId = '' + Date.now();
        return genId ? infoId : $('#bdg-axes-tab').data('infoId') || infoId;
      },

      setSize: function (x, y) {
        _bd.reface.clearGridStylus('bdg-chart-sizing-grid');
        _bd.reface.paintGridCell('bdg-chart-sizing-grid', x, y, 'lightgray');
        _bd.reface.writeCell('bdg-chart-sizing-grid', 'c' + x, y, x + 'x' + y);
      },

      setRealSize: function (x, y) {
        var grain = _bd.util.getGrain('#bdg-chart-sizing-grid');
        $('#bdg-chart-size').data('realSize', {
          width: x * grain.width,
          height: y * grain.height
        });
      },

      sizingState: function (state) {
        var $store = $('#bdg-basic');
        if (state === 'resize') {
          $store.removeData();
        } else if (state) {
          $store.data('sizing', state);
        } else {
          return $store.data('sizing');
        }
      },

      faceBasic: function (face) {
        var type = face.CHARTTYPE,
            size = face.CHARTSIZE,
            title = face.CHARTTITLE;
        if (type) {
          _bd.reface.decideChartType(type);
        }
        if (size) {
          var sizeData = size.split('x');
          $('#bdg-chart-size').text(size);
          _bd.reface.setRealSize(sizeData[0], sizeData[1]);
          _bd.reface.setSize(sizeData[0], sizeData[1]);
          _bd.reface.sizingState('done');
        }
        if (title) _bd.reface.chartTitle(title);
      },

      clearBasic: function () {
        $rootScope.setChartType('');
        $('#bdg-chart-size').text('');
        $('#bdg-chart-title').val('');
        _bd.reface.clearGridStylus('bdg-chart-sizing-grid');
        $('#bdg-basic').removeData();
      },

      chartTitle: function (title) {
        var $ct = $('#bdg-chart-title');
        if (title) $ct.val(title);
        else return $ct.val();
      },

      decideMainTable: function (target) {
        var row = $('#bdg-data-com').gk('row'),
            tableId = row[target];
        if (tableId) {
          _bd.reface.initMainTable(tableId, true);
        }
      },

      addSubTable: function () {
        var $grid = $('#bdg-pick-relation-grid'),
            row = $grid.gk('row'),
            gridTitle = $('#bdg-pick-relation-list').find('.ui-jqgrid-title').text();
        if (row.id) {
          var tables = _bd.reface.getTables();
          if (tables.indexOf(row.tarTable) === -1) {
            _bd.reface.pickRel(row);
            $('#bdg-pick-relation-dialog').dialog("close");
          } else {
            $grid.gk('heading', gridTitle.split(':')[0] + ': <span style="color:red;">關聯表格重複</span>');
          }
        } else {
          $grid.gk('heading', gridTitle.split(':')[0] + ': <span style="color:red;">請選擇關聯表格</span>');
        }
      },

      getTables: function () {
        return $('#bdg-axes-tab').data('table');
      },

      storeTable: function (type, data) {
        var $store = $('#bdg-axes-tab');
        switch (type) {
          case "main":
            $store.data('table', [data]);
            break;
          case "sub":
            var storeTable = $store.data('table');
            if (storeTable.indexOf(data) === -1) {
              storeTable.push(data);
              $store.data('table', storeTable);
            }
            break;
          case "reface":
            $store.data('table', data);
            break;
        }
      },

      getRel: function () {
        return $('#bdg-axes-tab').data('rel') || [];
      },

      storeRel: function (data) {
        var $store = $('#bdg-axes-tab'),
            mt = _bd.designer.getMainTable(),
            st = data.tarTable,
            relMainList = data.srcColumns.split(','),
            relSubList = data.tarColumns.split(','),
            relList = $store.data('rel') || [];
        if (mt && st) {
          if (!$store.data(st)) {
            var join = {
                joinType: data.joinType,
                joinTable: st
              },
              joinOn = [];
            $.each(relMainList, function (idx, val) {
              joinOn.push(mt + '.' + val + ' = ' + st + '.' + relSubList[idx]);
            });
            join.joinOn = joinOn;
            relList.push(join);
            $store.data('rel', relList);
          }
        }
      },

      faceRel: function (data) {
        $('#bdg-axes-tab').data('rel', data);
      },

      getEssential: function (type) {
        var essential = $('#bdg-axes-tab').data('essential');
        switch (type) {
          case "obj":
            return {mustWhere: essential};
          case "str":
            var essStr = '';
            if (essential && essential.length > 0) {
              $.each(essential, function (i, v) {
                essStr += v + ' OR ';
              });
              essStr = '(' + essStr.slice(0, -4) + ')';
            }
            return essStr;
          case "arr":
            var rule = [];
            if (essential && essential.length > 0) {
              $.each(essential, function (i, v) {
                rule.push({rule: v});
              });
            }
            return rule;
        }
      },

      storeEssential: function () {
        var essList = [],
            rules = $('#bdg-essential-col-rule-grid').gk('list');
        $.each(rules, function (idx, val) {
          essList.push(val.rule);
        });
        $('#bdg-axes-tab').data('essential', essList);
      },

      getDataOrder: function () {
        return $('#bdg-axes-tab').data('dataOrder') || '';
      },

      getPrevDataPrefix: function (axis) {
        switch (axis) {
          case "X軸":
            return "X";
          case "Y軸(左側)":
            return "YL";
          case "Y軸(右側)":
            return "YR";
          case "系列":
            return "SERIES";
        }
      },

      storeDataOrder: function () {
        var data = '', tempRule, tempTitle,
            list = $('#bdg-data-order-rule-grid').gk('list');
        $.each(list, function (idx, val) {
          tempRule = val.rule.split('.');
          if (tempRule.length > 1) tempTitle = tempRule[1];
          else tempTitle = tempRule[0];
          data += val.axis + '_' + tempTitle + ',';
        });
        $('#bdg-axes-tab').data('dataOrder', data.slice(0, -1));
      },

      faceEssential: function (data) {
        var essList = [],
            $grid = $('#bdg-essential-col-rule-grid');
        $.each(data, function (idx, val) {
          var ess = {rule: val};
          essList.push(ess);
        });
        $grid.gk('clear');
        $grid.gk('add', essList);
        $('#bdg-axes-tab').data('essential', data);
      },

      clearAxesGrid: function () {
        $('#bdg-axes-setup-src-grid').gk('clear');
        $('#bdg-axes-setup-tar-grid').gk('clear');
      },

      initMainTable: function (tbId, doQuery) {
        var infoId = $('#bdg-axes-tab').data('infoId');
        _bd.reface.clearAxes();
        _bd.reface.clearAxesGrid();
        $('.bdg-step2-func-btn').removeClass('disabled');
        $('#bdg-axes-tab').removeData('lcInit');
        // restore infoId: means do not generate new infoId when change the main table.
        if (infoId) $('#bdg-axes-tab').data('infoId', infoId);
        _bd.reface.storeTable('main', tbId);
        if (doQuery) _bd.reface.queryColumns(tbId);
      },

      pickRel: function (data) {
        _bd.reface.queryColumns(data.tarTable);
        _bd.reface.storeTable('sub', data.tarTable);
        _bd.reface.storeRel(data);
      },

      doFaceAxes: function (axes) {
        var $srcGrid = $('#bdg-axes-setup-src-grid'),
            $tarGrid = $('#bdg-axes-setup-tar-grid'),
            src = [];
        $.extend(true, src, $srcGrid.gk('list'));
        _bd.designer.switchDataPrevBtn(true);
        axesLoop:
          for (var i = 0; i < axes.length; i++) {
            for (var j = 0; j < src.length; j++) {
              if ((axes[i].table === '' || axes[i].table.toLowerCase() === src[j].table.toLowerCase()) && axes[i].colId.toLowerCase() === src[j].colId.toLowerCase()) {
//              $srcGrid.gk('del', src[j].id);
                src[j].axis = axes[i].axis;
                src[j].func = axes[i].func;
                $tarGrid.gk('add', src[j]);
                continue axesLoop;
              }
            }
          }
      },

      clearAxes: function () {
        var $store = $('#bdg-axes-tab');
        $store.removeData();
      },

      faceAxes: function (face) {
        var axes = [],
            $store = $('#bdg-axes-tab');
        if (face.AXISX) {
          var x = $.parseJSON(face.AXISX);
          $store.data('X', x);
          axes = axes.concat(_bd.util.setAxisData('X軸', x));
        }
        if (face.AXISYL) {
          var yl = $.parseJSON(face.AXISYL);
          $store.data('YL', yl);
          axes = axes.concat(_bd.util.setAxisData('Y軸(左側)', yl));
        }
        if (face.AXISYR) {
          var yr = $.parseJSON(face.AXISYR);
          $store.data('YR', yr);
          axes = axes.concat(_bd.util.setAxisData('Y軸(右側)', yr));
        }
        if (face.SERIES) {
          var s = $.parseJSON(face.SERIES);
          $store.data('S', s);
          axes = axes.concat(_bd.util.setAxisData('系列', s));
        }
        if (axes.length > 0) _bd.reface.doFaceAxes(axes);
      },

      setAxisFunc: function () {
        debugger;
        var colRow = $('#bdg-axes-setup-tar-grid').gk('row'),
            axis = _bd.util.getAxisKey(colRow.axis),
            store = $('#bdg-axes-tab').data(axis),
            func = $('#' + colRow.id + '_func option:selected').val();
        $.each(store, function (idx, val) {
          if (val.table === colRow.table && val.colId === colRow.colId) {
            val.func = func.toUpperCase();

          }
        });
      },

      faceDataSrc: function (face) {
        if (face.TABLEID) {
          var table = $.parseJSON(face.TABLEID);
          _bd.reface.initMainTable(table[0], false);
          _bd.reface.storeTable('reface', table);
          $.each(table, function (idx, val) {
            _bd.reface.queryColumns(val);
          });
        }
        if (face.RELATION) {
          var rel = $.parseJSON(face.RELATION);
          _bd.reface.faceRel(rel);
        }
      },

      faceDefCol: function (defCol) {
        $.each(defCol, function (i, v) {
          v.colName = v.title;
          v.axis = '請選擇';
        });
        $('#bdg-axes-setup-src-grid').gk('add', defCol);
        _bd.designer.paintSubTable('#bdg-axes-setup-src-grid');
      },

      faceStep2: function (face) {
        // add make columns
        if (face.DEFCOL) {
          _bd.reface.faceDefCol($.parseJSON(face.DEFCOL));
        }
        // essential rule
        if (face.MUSTWHERE) {
          var essential = $.parseJSON(face.MUSTWHERE);
          _bd.reface.faceEssential(essential);
        } else {
          _bd.reface.faceEssential([]);
        }
        // shift axes
        _bd.reface.faceAxes(face);
        // clear stuff
        $('#bdg-axes-tab').removeData('dataOrder');
      },

      limitColReload: function () {
        var src1 = $('#bdg-axes-setup-src-grid').gk('list'),
            src2 = $('#bdg-axes-setup-tar-grid').gk('list'),
            $tar1Grid = $('#bdg-lc-src-grid'),
            tar1 = $tar1Grid.gk('list'),
            tar2 = $('#bdg-lc-tar-grid').gk('list'),
            src = src1.concat(src2),
            tar = tar1.concat(tar2);
        if (src.length > tar.length) {
          srcLoop:
            for (var i = 0; i < src.length; i++) {
              for (var j = 0; j < tar.length; j++) {
                if (src[i].table === tar[j].table && src[i].colId === tar[j].colId) {
                  continue srcLoop;
                }
              }
              if (src[i].axis === '請選擇') src[i].axis = '';
              $tar1Grid.gk('add', src[i]);
            }
        }
      },

      clearLimitCol: function () {
        $('#bdg-lc-src-grid').gk('clear');
        $('#bdg-lc-tar-grid').gk('clear');
        $('#bdg-store').removeData();
        $('#bdg-axes-tab').removeData('lcInit');
        $('#bdg-adv-query-btn').attr('disabled', true);
      },

      limitColInit: function () {
        var src1 = $('#bdg-axes-setup-src-grid').gk('list'),
            $tarGrid = $('#bdg-lc-src-grid');
        _bd.reface.clearLimitCol();
        $tarGrid.gk('add', src1);
        $('#bdg-axes-tab').data('lcInit', 'done');
        _bd.designer.paintSubTable('#bdg-lc-src-grid');
      },

      pickLimitCol: function (data) {
        var $srcGrid = $('#bdg-lc-src-grid'),
            srcRow = $srcGrid.gk('row'),
            $tarGrid = $('#bdg-lc-tar-grid');
        if (data) srcRow = data;
        else {
          srcRow.isUK = '1-鍵值';
          srcRow.inputType = 'INPUT';
        }
        $tarGrid.gk('add', srcRow);
        $srcGrid.gk('del', srcRow.id);
        $('#bdg-adv-query-btn').attr('disabled', false);
      },

      throwLimitCol: function (trigger) {
        var $srcGrid = $('#bdg-lc-src-grid'),
            $tarGrid = $('#bdg-lc-tar-grid'),
            tarId = $(trigger).closest('tr').attr('id'),
            tarData = $tarGrid.gk('row', tarId);
        $tarGrid.gk('del', tarId);
        $srcGrid.gk('add', tarData);
        if ($tarGrid.gk('list').length === 0) {
          $('#bdg-adv-query-btn').attr('disabled', true);
        }
        _bd.reface.storeUniqueCol('col');
        _bd.designer.paintSubTable('#bdg-lc-src-grid');
      },

      getLimitCol: function (type) {
        var col = [],
            uv = $('#bdg-store').data('uv'),
            list = $('#bdg-lc-tar-grid').gk('list');
        $.each(list, function (i, v) {
          var tc = '.' + v.colId,
            colVal = {
              table: v.table,
              colId: v.colId,
              colName: v.colName,
              inputType: v.inputType,
              dataKey: v.dataKey,
              isUK: v.isUK
            };
          if (uv) {
            $.each(uv, function (i2, v2) {
              if (v2.indexOf(tc) !== -1) {
                colVal.value = v2.split(':')[1];
                return 0;
              }
            });
          }
          col.push(colVal);
        });
        if (type === 'obj') return col;
        else return {limitCol: col};
      },

      saveUC: function () {
        var $grid = $('#bdg-lc-tar-grid');
        $grid.jqGrid('saveRow', $grid.gk('row').id);
        _bd.reface.storeUniqueCol('col');
      },

      storeUV: function (uv) {
        $('#bdg-store').data('uv', uv);
      },

      storeUniqueCol: function (type, unique) {
        var $store = $('#bdg-store'),
            uc = $('#bdg-lc-tar-grid').gk('list');
        if (type === 'col') {
          var col = [];
          $.each(uc, function (idx, val) {
            if (val.isUK.split('-')[0] === '1') {
              col.push({
                table: val.table,
                colId: val.colId
              });
            }
          });
          $store.data('uc', col);
        } else if (type === 'val') {
          var storeUC = $store.data('uc');
          if (storeUC && storeUC.length > 0) {
            var newUC = [];
            $.each(unique, function (ui, uv) {
              var uvs = uv.split(':'),
                  uniCol = 'tb' + uvs[0],
                  uniVal = uvs[1];
              $.each(storeUC, function (si, sv) {
                var storeCol = sv.table + '.' + sv.colId;
                if (storeCol.toLowerCase() === uniCol.toLowerCase()) {
                  sv.value = uniVal;
                  newUC.push(sv);
                }
              });
            });
            $store.data('uc', newUC);
          }
        }
      },

      getUniqueCol: function (type) {
        var uc = $('#bdg-store').data('uc') || [];
        if (type === 'com') {
          var com = [];
          $.each(uc, function (idx, val) {
            com.push(val.table + '.' + val.colId);
          });
          return com;
        } else if (type === 'obj') {
          return uc;
        } else {
          return {uniqueCol: uc};
        }
      },

      faceLimitCol: function (lc) {
        var src = $.extend(true, {}, $('#bdg-lc-src-grid').gk('list'));
        $.each(src, function (si, sv) {
          $.each(lc, function (lci, lcv) {
            if ((lcv.table === '' || sv.table === lcv.table) && sv.colId === lcv.colId) {
              lcv.colName = sv.colName;
              _bd.reface.pickLimitCol(lcv);
              $('#bdg-lc-src-grid').gk('del', sv.id);
            }
          });
        });
      },

      faceUniqueCol: function (type, unique) {
        if (type === 'store') {
          $('#bdg-store').data('uc', unique);
        }
      },

      faceStep3: function (face) {
        var limit = $.parseJSON(face.LIMITCOL),
            unique = $.parseJSON(face.UNIQUECOL);
        _bd.reface.limitColInit();
        _bd.reface.faceLimitCol(limit);
        _bd.reface.faceUniqueCol('store', unique);
      },

      getStep1Info: function (infoId) {
        var chartType = $('#bdg-chart-type').text(),
            chartSize = $('#bdg-chart-size').text(),
            chartTitle = _bd.reface.chartTitle(),
            emp = 'icsc01', date = '', time = '',
            tt = new Date(Number(infoId));
        date = $.datepicker.formatDate("yymmdd", tt);
        time = ('0' + tt.getHours()).slice(-2) + ('0' + tt.getMinutes()).slice(-2) + ('0' + tt.getSeconds()).slice(-2);
        return {
          chartType: chartType,
          chartSize: chartSize,
          chartTitle: chartTitle,
          useEmp: emp
        };
      },

      convertAxisData: function (data) {
        return {
          table: data.table,
          colId: data.colId,
          title: data.colName || data.title,
          dataUnit: data.dataUnit,
          dataFormat: data.dataFormat,
          dataType: data.dataType,
          formula: data.formula,
          func: data.func
        }
      },

      convertAxesData: function (data) {
        var axes = [];
        if (data) {
          if ($.isArray(data)) {
            $.each(data, function (idx, val) {
              axes.push(_bd.reface.convertAxisData(val));
            });
          } else {
            axes.push(_bd.reface.convertAxisData(data));
          }
        }
        return axes;
      },

      getColData: function () {
        var tar = $('#bdg-axes-setup-tar-grid').gk('list'),
            $store = $('#bdg-axes-tab'),
            axisX = _bd.reface.convertAxesData($store.data('X')),
            axisYL = _bd.reface.convertAxesData($store.data('YL')),
            axisYR = _bd.reface.convertAxesData($store.data('YR')),
            series = _bd.reface.convertAxesData($store.data('S')),
            cols = axisX.concat(axisYL).concat(axisYR).concat(series);
        return cols;
      },

      getAxisInfo: function () {
        var tar = $('#bdg-axes-setup-tar-grid').gk('list'),
            $store = $('#bdg-axes-tab'),
            axisX = _bd.reface.convertAxesData($store.data('X')),
            axisYL = _bd.reface.convertAxesData($store.data('YL')),
            axisYR = _bd.reface.convertAxesData($store.data('YR')),
            series = _bd.reface.convertAxesData($store.data('S'));
        return {
          axisX: axisX,
          axisYL: axisYL,
          axisYR: axisYR,
          series: series
        }
      },

      getDefColInfo: function () {
        var tar = $('#bdg-axes-setup-src-grid').gk('list'),
            defCol = [];
        $.each(tar, function (idx, val) {
          if (val.formula) {
            defCol.push({
              colId: val.colId,
              title: val.colName,
              dataType: val.dataType,
              dataUnit: val.dataUnit,
              dataFormat: val.dataFormat,
              formula: val.formula
            });
          }
        });
        return {defCol: defCol};
      },

      getSqlWhere: function () {
        var where = [],
            essential = _bd.reface.getEssential("str"),
            extract = _bd.designer.getDataExtract();
        if (essential) where.push(essential);
        if (extract) where.push(extract);
        return where;
      },

      getCountDataInfo: function () {
        return {
          column: _bd.reface.getColData(),
          tableId: _bd.reface.getTables(),
          relation: _bd.reface.getRel(),
          sqlWhere: _bd.reface.getSqlWhere()
        }
      },

      getDataPrevInfo: function () {
        var info = {
          runBy: 'para',
          infoId: _bd.reface.getInfoId(false),
          chartType: $('#bdg-chart-type').text(),
          chartTitle: _bd.reface.chartTitle(),
          tableId: _bd.reface.getTables(),
          relation: _bd.reface.getRel(),
          sqlWhere: _bd.reface.getSqlWhere(),
          orderBy: _bd.reface.getDataOrder()
        };
        $.extend(true, info, _bd.reface.getAxisInfo());
        return info;
      },

      getStep2Info: function () {
        var info = {};
        $.extend(true, info, _bd.reface.getDataPrevInfo());
        $.extend(true, info, _bd.reface.getDefColInfo());
        $.extend(true, info, _bd.reface.getEssential("obj"));
        return info;
      },

      getStep3Info: function () {
        var info = {};
        $.extend(true, info, _bd.reface.getLimitCol());
        $.extend(true, info, _bd.reface.getUniqueCol());
        return info;
      },

      getSaveInfo: function (infoId, genSql) {
        var info = {genSql: genSql || "false"};
        $.extend(true, info, _bd.reface.getStep1Info(infoId));
        $.extend(true, info, _bd.reface.getStep2Info());
        $.extend(true, info, _bd.reface.getStep3Info());
        info.keywordGroup = $('#bdg-save-info-domain').val();
        info.keyword = $('#bdg-save-info-keyword').val();
        return info;
      },

      saveCheck: function (data) {
        if (data.chartType && data.chartTitle) return true;
        return false;
      },

      doSaveInfo: function (infoId, genSql) {
        var params = _bd.reface.getSaveInfo(infoId, genSql),
            title = $('#bdg-save-info-chart-title').val();
        //debugger;
        if (genSql !== 'true') { // 暫存
          if (_bd.reface.saveCheck(params)) _bd.util.getJSON('bdgcLogic.saveInfo', params, function (data) {});
        } else {
          var verify = _bd.designer.infoVerify(params);
          if (!verify.approved) {
            bootbox.alert(verify.warning);
            return;
          }
          if (title) {
            params.infoId = infoId;
            params.chartTitle = title;
            _bd.util.getJSON('bdgcLogic.saveInfo', params, function (data) {
              if (data.exeMsg.indexOf('Success') !== -1) {
                _bd.reface.chartTitle($('#bdg-save-info-chart-title').val());
                $('#bdg-save-info-msg').text('更新資訊項(' + infoId + ')成功！');
              }
            });
          } else {
            $('#bdg-save-info-msg').text('請設定圖型標題！');
          }
        }
      },

      saveInfo: function (genSql) {
        var $store = $('#bdg-axes-tab'),
            infoId = _bd.reface.getInfoId(false);
        $store.data('infoId', infoId);
        _bd.reface.doSaveInfo(infoId, genSql);
      },

      saveInfoAs: function () {
        var infoId = _bd.reface.getInfoId(true),
            params = _bd.reface.getSaveInfo(infoId, "true"),
            title = $('#bdg-save-info-chart-title').val();
        if (title) {
          params.chartTitle = title;
          params.infoId = infoId;
          _bd.util.getJSON('bdgcLogic.saveInfo', params, function (data) {
            if (data.exeMsg.indexOf('Success') !== -1) {
              $('#bdg-axes-tab').data('infoId', infoId);
              _bd.reface.chartTitle(title);
              $('#bdg-save-info-msg').text('另存資訊項(' + infoId + ')成功，已同步至設計畫面！');
            }
          });
        } else {
          $('#bdg-save-info-msg').text('請設定圖型標題！');
        }
      },

      openSaveInfo: function () {
        _bd.reface.saveUC();
        $('#bdg-save-info-dialog').dialog({
          resizable: false,
          width: 700,
          height: 220,
          modal: true,
          buttons: {
            "存檔": function () {
              _bd.reface.saveInfo('true');
            },
            "另存新檔": function () {
              _bd.reface.saveInfoAs();
            }
          }
        });
        $('#bdg-save-info-chart-title').val(_bd.reface.chartTitle());
        $('#bdg-save-info-msg').text('');
      },

      reface: function (save) {
        var $grid = $('#bdg-query-info-grid'),
            row = $grid.gk('row');
        if (row.INFOID) {
          if (save) _bd.reface.saveInfo();
          _bd.reface.doQueryInfoById(row.INFOID);
          $grid.gk('heading', '資訊項清單');
          $('#bdg-query-info-dialog').dialog('close');
        } else {
          $grid.gk('heading', '資訊項清單：<span style="color:red;">請選擇資訊項</span>');
        }
      },

      doReface: function (data) {
        var face = data[0],
            $store = $('#bdg-axes-tab');
        _bd.reface.faceBasic(face);
        // init main table will clear everything
        _bd.reface.faceDataSrc(face);
        $store.data('infoId', face.INFOID);
        $store.data('reface', true);
        (function() {
          var timer = $.Deferred(), i = 0;
          var wait = function(timer) {
            var task = function() {
              var data = $('#bdg-axes-setup-src-grid').gk('list');
              i++;
              if (data && data.length > 0) {
                timer.resolve();
              } else if (i > 10) {
                timer.reject();
              } else {
                setTimeout(task, 500);
              }
            };
            setTimeout(task, 0);
            return timer;
          };
          $.when(wait(timer)).done(function() {
            _bd.reface.faceStep2(face);
            console.log('Reface Done!!!');
            _bd.reface.faceStep3(face);
          }).fail(function() {
            console.log('Reface Break!!!');
          });
        })();
      },

      getQueryInfoParam: function (type, infoId) {
        var param = {};
        switch (type) {
          case "id":
            if (infoId) {
              param.infoId = infoId;
            }
            return param;
          case "title":
            var chartType = $('#bdg-query-info-search-type').val(),
                chartTitle = $('#bdg-query-info-search-title').val();
//          param.chartType = chartType;
            param.chartTitle = chartTitle;
            return param;
          case "key":
            var keywordGroup = $('#bdg-query-info-search-domain').val(),
                keyword = $('#bdg-query-info-search-keyword').val();
            param.keywordGroup = keywordGroup;
            param.keyword = keyword;
            return param;
        }
      },

      doQueryInfoById: function (infoId) {
        $http.post('bdgcLogic.getInfo', _bd.reface.getQueryInfoParam('id', infoId)).success(function (data) {
          _bd.reface.doReface(data);
        });
      },

      doQueryInfoByTitle: function () {
        _bd.util.getJSON('bdgcLogic.getInfo', _bd.reface.getQueryInfoParam('title'), function (data) {
          var $grid = $('#bdg-query-info-grid');
          $grid.gk('clear');
          $grid.gk('add', data);
        });
      },

      queryInfo: function () {
        var $grid = $('#bdg-query-info-grid');
        $('#bdg-query-info-dialog').dialog({
          resizable: false,
          width: 950,
          height: 600,
          modal: true,
          buttons: {
            "儲存並開啟": function () {
              _bd.reface.reface(true);
            },
            "開啟": function () {
              _bd.reface.reface(false);
            },
            "取消": function () {
              $(this).dialog('close');
            }
          }
        });
        $grid.gk('width', 910);
        $grid.gk('height', 390);
        $('.bdg-content a[href="#bdg-basic"]').trigger('click');
      },

      newInfo: function () {
        _bd.reface.clearBasic();
        _bd.reface.clearAxes();
        _bd.reface.clearAxesGrid();
        _bd.reface.clearLimitCol();
        $('.bdg-step2-func-btn').addClass('disabled');
        _bd.designer.switchDataPrevBtn(false);
      }

    }
  });
});