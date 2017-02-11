/**
 * Created by I27160 on 2014/8/26.
 */
angular.module('bdgApp').controller('dataSetCtrl', dataSetCtrlFunction);
function dataSetCtrlFunction( $scope, $icscRest,$icscModal, $dmaService, $alert, $compile, uiGridConstants,uiGridEditConstants) {
  'use strict';
  //$state.transitionTo('bdg-axes-a');
  //$scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function (evt, retainFocus) {
  //  endEdit(retainFocus);
  //  $scope.grid.api.edit.raise.afterCellEdit($scope.row.entity, $scope.col.colDef, cellModel($scope), origCellValue);
  //  deregOnEndCellEdit();
  //});
  $scope.lineProcess = {
    active: true
  };
  $scope.domainOpts = {
    opts: [
      {value: '', label: '請選擇'},
      {value: 'S', label: 'S-銷售'},
      {value: 'T', label: 'T-質量'},
      {value: 'I', label: 'I-存貨'},
      {value: 'M', label: 'M-採購'},
      {value: 'A', label: 'A-財會'}
    ],
    selected: ""
  };
  $scope.keywordOpts = {
    opts: [
      {value: '', label: '請選擇'},
      {value: '1', label: '結算'},
      {value: '2', label: '訂單'},
      {value: '3', label: '價格'},
      {value: '4', label: '質量'},
      {value: '5', label: '化物性'},
      {value: '6', label: '元素'},
      {value: '7', label: '檢測'},
      {value: '8', label: '試驗'},
      {value: '9', label: '產品'}
    ],
    selected: ""
  };

  $scope.activeDataCom = {
    infoId: '',
    comTitle: '',
    dsId: '',
    schemaId: '',
    setDefault: function () {
      this.infoId = '';
      this.comTitle = '';
    },
    hasDS: function () {
      return !!this.dsId && !!this.schemaId;
    }
  };

  $scope.query = {
    modal: {},
    list: [],
    selectedRow: '',
    title: '',
    param: {},
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'query.list',
      columnDefs: [
        {name: 'infoid', displayName: '圖型元件', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'charttype', displayName: '圖型種類', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'charttitle', displayName: '圖型標題', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'chartsize', displayName: '寬高比例', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'updateemp', displayName: '最後更新者', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'date', displayName: '更新日期', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'time', displayName: '更新時間', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'op', displayName: '操作', enableFiltering: false, width: 70,
          cellTemplate: '<div class="ui-grid-cell-contents btn-group">' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().del(row)">' +
          '<span class="glyphicon glyphicon-remove">' +
          '</button>' +
          '</div>'
        }

      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.query.selectedRow = row.entity;
            $scope.query.modal.$promise.then(function () {
              var table = row.entity.infoid;
              $scope.src.tables = [table];
            });
          }
        });
      }
    }),
    show: function () {
      $scope.query.selectedRow = '';
      $scope.query.modal = $icscModal({
        template: 'queryModal',
        show: false,
        scope: $scope,
        prefixEvent: 'query'
      });
      $scope.query.modal.show();
    },
    doQueryInfoById: function (infoId) {
      var params = {infoid: infoId};
      $icscRest.post('bdg/logic/getInfo', params).success(function (data, status, headers) {

        $scope.query.doReface(data);
      });
    },
    doQueryInfoByTitle: function () {
      var params = {
        charttitle: $scope.query.title,
        domain: $scope.domainOpts.selected,
        keyword: $scope.keywordOpts.selected
      };
      $icscRest.post('bdg/logic/getInfo', params).success(function (data, status, headers) {
        $scope.query.list = [];
        $scope.query.list = data;
      });

    },
    del: function (row) {
     
      var params = {infoId: row.entity.infoid};
      $icscRest.post('bdg/logic/removeInfo', params).success(function (data, status, headers) {
        var index = $scope.query.list.indexOf(row.entity);
        $scope.query.list.splice(index, 1);
        $scope.msg('success', '刪除成功!!');
      });
    },
    reface: function () {
      var row = $scope.query.selectedRow;

      $scope.clearInfo();
      if (row) {

        $scope.activeDataCom.infoId = row.infoid;
        $scope.src.infoId = row.infoid;
        $scope.activeDataCom.comTitle = row.charttitle;
        $scope.query.doQueryInfoById(row.infoid);
        $scope.query.modal.hide();

        $scope.msg('success', row.charttype + '圖形種類已開啟！');
      }
    },
    doReface: function (data) {

      var face = data[0];
      $scope.src.tables = face.tableid;
      $scope.sqlPrev.text = face.sql;
      $scope.query.faceDataSrc(face);
      (function () {
        var timer = $.Deferred(), i = 0;
        var wait = function (timer) {
          var task = function () {
            var data = $scope.src.list;
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
        $.when(wait(timer)).done(function () {

          //faceStep3 face.LIMITCOL face.UNIQUECOL
          $scope.query.faceStep(face);
          $scope.query.faceStep2(face);
          console.log('Reface Done!!!');
        }).fail(function () {
          console.log('Reface Break!!!');
        });
      })();
    },
    faceDataSrc: function (face) {
      if (face.tableid) {
        var table = $.parseJSON(face.tableid);
        $scope.query.initMainTable(table[0], false);

        $.each(table, function (idx, val) {
          $scope.query.queryColumns(val);
        });
      }
      if (face.relation) {
        var rel = $.parseJSON(face.relation);
        $scope.query.faceRel(rel);
      }
    },
    queryColumns: function (tbId) {
      var param = {
        tableId: tbId,
        datasourceId: $scope.activeDataCom.dsId,
        schemaId: $scope.activeDataCom.schemaId
      };

      $dmaService.dataDefinition.getColumns(param).success(function (data, status, headers) {

        var colList = [];
        $.each(data, function (i, v) {
          var colObj = {
            table: v.id.tableId,
            colId: v.id.columnId,
            title: v.alias,
            type: v.type,
            size: v.size,
            axis: 0
          };
          colList.push(colObj);
        });
        if (colList) {
          if ($scope.src.list.length === 0) {
            $scope.src.list = colList;
          } else {
            $scope.src.list = $scope.src.list.concat(colList);
          }
        }
      });

    },
    decideChartType: function (type) {
      $scope.setChartType(type);
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
    chartTitle: function (title) {
      if (title) {
        $scope.query.title = title;
      }
      else {
        return $scope.query.title;
      }
    },
    initMainTable: function (tbId, doQuery) {
      if (doQuery) {
        $scope.query.queryColumns(tbId);
      }
    },
    pickRel: function (data) {
      _bdg.reface.queryColumns(data.tarTable);
      _bdg.reface.storeTable('sub', data.tarTable);
      _bdg.reface.storeRel(data);
    },
    doFaceAxes: function (axes) {
      var src = [];
      src = $scope.src.list;
      axesLoop:
          for (var i = 0; i < axes.length; i++) {
            for (var j = 0; j < src.length; j++) {
              if ((axes[i].table === '' || axes[i].table.toLowerCase() === src[j].table.toLowerCase()) && axes[i].colId.toLowerCase() === src[j].colId.toLowerCase()) {
                src[j].axis = axes[i].axis;
                src[j].title = axes[i].title;
                src[j].func = axes[i].func ? axes[i].func : '';

                $scope.target.list.push(src[j]);

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
      var axes = [];
      //  
      if (face.axisx) {
        var x = $.parseJSON(face.axisx);
        axes = axes.concat(_bdg.util.setAxisData(1, x));
      }
      if (face.axisyl) {
        var yl = $.parseJSON(face.axisyl);
        axes = axes.concat(_bdg.util.setAxisData(2, yl));
      }
      if (face.axisyr) {
        var yr = $.parseJSON(face.axisyr);
        axes = axes.concat(_bdg.util.setAxisData(3, yr));
      }
      if (face.series) {
        var s = $.parseJSON(face.series);
        axes = axes.concat(_bdg.util.setAxisData(4, s));
      }
      if (axes.length > 0) {
        $scope.query.doFaceAxes(axes);
      }
    },
    faceRel: function (data) {


      if (data && data.length > 0) {
        $scope.relation.selectedItems = data;
      }
    },
    faceStep: function (face) {
      // add make columns
      if (face.defcol) {
        $scope.query.faceDefCol($.parseJSON(face.defcol));
      }
      // essential rule
      if (face.mustwhere) {
        var essential = $.parseJSON(face.mustwhere);
        $scope.query.faceEssential(essential);
      } else {
        $scope.query.faceEssential([]);
      }
      // shift axes
      $scope.query.faceAxes(face);
      // clear stuff


    },
    faceStep2: function (face) {
      var limit = $.parseJSON(face.limitcol),
          unique = $.parseJSON(face.uniquecol);

      $scope.query.faceLimitCol(limit);
    },
    faceLimitCol: function (limit) {

      $scope.limitSrc.list = angular.copy($scope.src.list);

      var removeList = [];
      if (limit.length > 0) {
        var colList = [];

        $.each(limit, function (idx, val) {
           
          var objCol = {
            isUK: val.isUK,
            colId: val.colId,
            inputType: val.inputType,
            table: val.table,
            type:val.type,
            colName: val.colName
          };
          colList.push(objCol);
        });
        $scope.limitTarget.list = colList;
        $.each(colList, function (idx, val) {
          $scope.query.pickLimitSrc(val);
        });
      }

    },
    pickLimitSrc: function (col) {
      var limitSrc = $scope.limitSrc.list;
      $.each(limitSrc, function (idx, val) {
        if (val.colId === col.colId) {
          $scope.limitSrc.list.splice(idx, 1);
          return false;
        }
      });

    },
    faceDefCol: function (defCol) {
      $.each(defCol, function (i, v) {
        v.title = v.title;
        v.axis = '請選擇';
      });
      $scope.src.defCol = defCol;
    },
    faceEssential: function (data) {
      var essList = [],
          $grid = $('#bdg-essential-col-rule-grid');
      $.each(data, function (idx, val) {
        var ess = {rule: val};
        essList.push(ess);
      });

    }
  };

  $scope.clearInfo = function () {

    $scope.activeDataCom.setDefault();
    $scope.src.list = [];
    $scope.src.tables = [];
    $scope.target.list = [];
    $scope.limitSrc.list = [];
    $scope.limitTarget.list = [];
    $scope.relation.selectedItems = [];
    $scope.essential.rule = '';
    $scope.essential.input = '';
    $scope.essential.ruleList = [];

  };
  //欄位選擇清單
  $scope.src = {
    list: [],
    defCol: [],
    tables: [],
    infoId: "",
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'src.list',
      //enableCellEdit: true,
      columnDefs: [
        {name: 'table', enableCellEdit: false, displayName: '表格', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'colId',
          enableCellEdit: false,
          displayName: '欄位ID',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'title',
          enableCellEdit: false,
          displayName: '欄位名稱',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'type',
          enableCellEdit: false,
          displayName: '資料型態',
          width: 90,
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'size',
          enableCellEdit: false,
          displayName: '資料長度',
          width: 80,
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        //{ name: 'axis', displayName: '軸線設定', width:80,filter: { condition: uiGridConstants.filter.CONTAINS } },
        {
          name: 'axis',
          displayName: '軸線設定',
          filter: {condition: uiGridConstants.filter.CONTAINS},
          cellFilter: 'selectedAxis', editDropdownValueLabel: 'axis', editableCellTemplate: 'ui-grid/dropdownEditor',
          editDropdownOptionsArray: [
            {id: 0, axis: '請選擇'},
            {id: 1, axis: 'X軸'},
            {id: 2, axis: 'Y軸(左側)'},
            {id: 3, axis: 'Y軸(右側)'},
            {id: 4, axis: '系列'}
          ]
        },

        {
          name: 'formula',
          enableCellEdit: false,
          displayName: '自定義公式',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },

      ],
      onRegisterApi: function (gridApi) {

        gridApi.core.on.renderingComplete($scope, function () {

          var boxHeight = $(window).height() - _bdg.constants.MASTER_PAGE_FIXED_HEIGHT;
          $('#bdg-src-grid').height(Math.floor(boxHeight * 0.5));
        });
        //gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        //
        //  if (row.isSelected) {
        //
        //    var table = row.entity.table,
        //        colId = row.entity.colId,
        //        title = row.entity.title,
        //        col = {
        //          func: '',
        //          table: table,
        //          colId: colId,
        //          title: title,
        //          inputType: 'INPUT',
        //          srcType: row.entity.srcType,
        //          formula: row.entity.formula
        //        };
        //    // $scope.target.list.push(col);
        //  }
        //});
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
          //inline edit後的觸發事件
          //TODO check target是否已有相同的
          var target = $scope.target.list;
          var i = 0;

          $.each(target, function (idx, val) {
            if (val === rowEntity) {
              i++;
            }
          });
          if (i === 0) {
            $scope.$apply();
            if (rowEntity.axis === 2 || rowEntity.axis === 3) {
              rowEntity.func = 'SUM';
            }
            else {
              rowEntity.func = '';
            }
            $scope.target.list.push(rowEntity);
          }

        });
      }
    })

  };
  //選定軸線清單
  $scope.target = {
    list: [],
    tables: [],
    defCol: [],
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'target.list',
      columnDefs: [
        {name: 'table', enableCellEdit: false, displayName: '表格', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'colId',
          enableCellEdit: false,
          displayName: '欄位ID',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {name: 'title', displayName: '欄位名稱', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'dataUnit', displayName: '資料單位', width: 150, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'dataFormat', displayName: '資料格式', width: 100, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'axis', enableCellEdit: false, displayName: '軸線', filter: {condition: uiGridConstants.filter.CONTAINS},
          cellFilter: 'selectedAxis'
        },
        {name: 'type', displayName: '資料型態', visible: false, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'func', displayName: '功能涵式', filter: {condition: uiGridConstants.filter.CONTAINS},
          cellFilter: 'selectedFunc', editDropdownValueLabel: 'func', editableCellTemplate: 'ui-grid/dropdownEditor',
          editDropdownOptionsArray: [
            {id: '', func: '請選擇'},
            {id: 'SUM', func: 'SUM'},
            {id: 'AVG', func: 'AVG'},
            {id: 'MIN', func: 'MIN'},
            {id: 'MAX', func: 'MAX'}
          ]
        },
        {
          name: 'del', enableCellEdit: false, enableFiltering: false, displayName: '操作', width: 70,
          cellTemplate: '<div class="ui-grid-cell-contents btn-group">' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().removeTarget(row)">' +
          '<span class="glyphicon glyphicon-remove">' +
          '</button>' +
          '</div>'

        }
      ],
      onRegisterApi: function (gridApi) {

        gridApi.core.on.renderingComplete($scope, function () {

          var boxHeight = $(window).height() - _bdg.constants.MASTER_PAGE_FIXED_HEIGHT;

          $('#bdg-target-grid').height(Math.floor(boxHeight * 0.4));
        });

      }

    }),
    removeTarget: function (row) {

      var index = $scope.target.list.indexOf(row.entity);
      var colId = $scope.target.list[index].colId;
      $scope.target.list.splice(index, 1);
    }
  };
  //資料表
  $scope.table = {
    modal: {},
    list: [],
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'table.list',
      columnDefs: [
        {name: 'tableId', displayName: '資料表', filter: {condition: uiGridConstants.filter.CONTAINS}}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.table.selectedItem = row.entity;
            $scope.table.modal.$promise.then(function () {

              var table = row.entity.tableId;

              $scope.clearInfo();
              $scope.table.modal.hide();
              $scope.src.tables = [table];
              $scope.$broadcast('reface:getColumn', table);
              $scope.$broadcast('reface:getRelation', table);

            });
          }
        });
      }
    }),
    show: function ($event) {
      var self = this;
      self.modal = $icscModal({
        template: 'tableModal',
        show: false,
        scope: $scope
      });
      self.modal.show($event);
    }
  };
  //關聯表
  $scope.relation = {
    record: {},
    modal: {},
    list: [],
    active: true,
    selectedItems: [],
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'relation.list',
      columnDefs: [
        {name: 'srcTable', displayName: '來源表格', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'srcColumns.toString()', displayName: '來源欄位', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'joinType', displayName: '集合類型', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'tarTable', displayName: '目標表格', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'tarColumns.toString()', displayName: '目標欄位', filter: {condition: uiGridConstants.filter.CONTAINS}}
      ],
      onRegisterApi: function (gridApi) {

        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {

            var table = row.entity['tarTable'];
            $scope.relation.selectedItem = row.entity;
            if ($scope.relation.selectedItems.indexOf(row.entity) === -1) {
              $scope.relation.selectedItems.push(row.entity);
            }
            $scope.relation.modal.hide();
            $scope.$broadcast('design:slave:getColumn', table);
            $scope.$broadcast('reface:getRelation', table);
          }
        });
      }
    }),
    show: function ($event) {
      var self = this;
      self.modal = $icscModal({
        template: 'relationModal',
        show: false,
        scope: $scope
      });
      self.modal.show($event);
    },
    getJoinOn: function (rel) {
      var joinOn = [];
      $.each(rel.srcColumns, function (i, v) {
        joinOn.push(rel.srcTable + '.' + v + ' = ' + rel.tarTable + '.' + rel.tarColumns[i]);
      });
      return joinOn;
    },
    getRel: function () {
      var _rel = [],
          rel = this.selectedItems;
      $.each(rel, function (i, v) {
        _rel.push({
          joinType: v.joinType,
          joinTable: v.tarTable,
          joinOn: $scope.relation.getJoinOn(v)
        });
      });
      return _rel;
    },
    transferRefCol: function () {
      var _rel = [],
          cols = $scope.limitTarget.list;

      $.each(cols, function (i, v) {
        var colRef = v.colRef;
        if (colRef && colRef.refColumn) {
          _rel.push({
            joinType: 'LEFT',
            srcTable: v.table,
            srcColumns: [v.colId],
            tarSchema: colRef.refSchema,
            tarTable: colRef.refTable,
            tarColumns: colRef.refColumn.split(','),
            isRefCol: true,
            refDisplayColumns: colRef.refDisplayColumns
          });
        }
      });
      return _rel;
    }
  };

  $scope.assist = {
    modal: {},
    list: [
      {assistId: 'INPUT', remark: '手動輸入'},
      {assistId: 'DATE', remark: '八碼日期: yyyyMMdd'},
      {assistId: 'TIME', remark: '四碼時間: HHmm'}
    ],
    selectedRow: {},
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'assist.list',
      columnDefs: [
        {name: 'assistId', displayName: '輔助輸入鍵值', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'remark', displayName: '說明', filter: {condition: uiGridConstants.filter.CONTAINS}}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            $scope.assist.selectedRow = row.entity;
            $scope.limitTarget.selectedRow.inputType = row.entity.assistId;
            $scope.assist.modal.hide();
          }
        });
      }
    }),
    cancel: function () {
      $scope.limitTarget.selectedRow.inputType = null;
      $scope.assist.modal.hide();
    }

  };

  $scope.essential = {
    modal: {},
    selectedDataType: '',
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'essential.colList',
      columnDefs: [
        {name: 'table', displayName: '表格', width: 150, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'colId', displayName: '欄位ID', width: 150, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'title', displayName: '欄位名稱', width: 150, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'type', displayName: '資料型態', width: 100, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'size', displayName: '資料長度', visible: false, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'formula', displayName: '自定義公式', filter: {condition: uiGridConstants.filter.CONTAINS}}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                formula = e.formula,
                colVal = formula ? formula : e.table + '.' + e.colId;
            if ($scope.essential.rule) {
              if (_bdg.util.isRuleOp($scope.essential.rule)) {
                $scope.essential.rule += '' + colVal;
              } else {
                var ruleGrain = $scope.essential.rule.split(' ');
                if (ruleGrain.length === 1) {
                  $scope.essential.rule = colVal;
                } else {
                  if (_bdg.util.isRuleOp(ruleGrain[ruleGrain.length - 2])) {
                    $scope.essential.rule += ' AND ' + colVal;
                  } else {
                    var tempRuleGrain = $scope.essential.rule.split(' AND ');
                    tempRuleGrain[tempRuleGrain.length - 1] = colVal;
                    $scope.essential.rule = tempRuleGrain.join(' AND ');
                  }
                }
              }
            } else {
              $scope.essential.rule = colVal;
            }
            $scope.essential.selectedDataType = e.type;
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      enableFiltering: false,
      data: 'essential.ruleList',
      columnDefs: [
        {name: 'rule', displayName: '規則清單(規則間以OR串聯)', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'op', displayName: '操作', width: 100,
          cellTemplate: '<div class="ui-grid-cell-contents btn-group">' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().delRule(row)">' +
          '<span class="glyphicon glyphicon-remove">' +
          '</button>' +
          '</div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {

        });
      }
    }),
    show: function () {
      var self = this;
      self.modal = $icscModal({
        template: 'essentialModal',
        show: false,
        scope: $scope
      });
      $scope.essential.colList = $scope.src.list;
      self.modal.show();
    },
    op: function ($event) {
      if ($scope.essential.rule) {
        var opSign = $event.target.textContent;
        if (_bdg.util.isRuleOp($scope.essential.rule)) {
          var op_rules = $scope.essential.rule.split(' ');
          op_rules[op_rules.length - 1] = opSign;
          $scope.essential.rule = op_rules.join(' ');
        } else {
          var op_tempRuleGrain = $scope.essential.rule.split(' AND '),
              op_lastRule = op_tempRuleGrain[op_tempRuleGrain.length - 1].split(' ');
          if (op_lastRule.length === 1) $scope.essential.rule += ' ' + opSign;
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    fillOpd: function () {
      if (_bdg.util.isRuleOp($scope.essential.rule)) {
        var isInOpd = $scope.essential.rule.slice(-2) === 'in';
        if (_bdg.util.isStrDataType($scope.essential.selectedDataType)) {
          if (isInOpd) {
            var inputStrReal = '(',
                inputStrGrain = $scope.essential.input.split(',');
            $.each(inputStrGrain, function (i, v) {
              inputStrReal += "'" + v.trim() + "',";
            });
            inputStrReal = inputStrReal.slice(0, -1) + ')';
            $scope.essential.rule += ' ' + inputStrReal;
          } else {
            $scope.essential.rule += " '" + $scope.essential.input + "'";
          }
        } else {
          if (isInOpd) {
            var hasInvalidNum = false,
                inputNumReal = '(',
                inputNumGrain = $scope.essential.input.split(',');
            $.each(inputNumGrain, function (i, v) {
              if ($.isNumeric(v)) {
                inputNumReal += v.trim() + ",";
              } else {
                hasInvalidNum = true;
              }
            });
            inputNumReal = inputNumReal.slice(0, -1) + ')';
            if (hasInvalidNum) $scope.msg('info', '請於\",\"間輸入有效的數字！');
            else $scope.essential.rule += ' ' + inputNumReal;
          } else {
            if ($.isNumeric($scope.essential.input)) $scope.essential.rule += ' ' + $scope.essential.input;
            else $scope.msg('info', '請輸入有效的數字！');
          }
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    clearRule: function () {
      $scope.essential.rule = '';
    },
    addRule: function () {
      var ruleVal = $scope.essential.rule;
      if (_bdg.util.isInvalidRule(ruleVal) || _bdg.util.isRuleOp(ruleVal)) {
        $scope.msg('info', '無效的運算式！');
      } else {
        var ruleObj = {rule: ruleVal.split('AND').length > 1 ? '(' + ruleVal + ')' : ruleVal};
        $scope.essential.ruleList.push(ruleObj);
      }
    },
    delRule: function (row) {
      var index = $scope.essential.ruleList.indexOf(row.entity);
      $scope.essential.ruleList.splice(index, 1);
    },
    getRules: function () {
      var rules = [];
      if ($scope.essential.ruleList) {
        $.each($scope.essential.ruleList, function (i, v) {
          rules.push(v.rule);
        });
      }
      if ($scope.userFilter.ruleList) {
        $.each($scope.userFilter.ruleList, function (i, v) {
          rules.push(v.rule);
        });
      }
      return rules;
    }
  };
  $scope.$on('design:slave:getColumn', function (event, table) {

    if ($scope.activeDataCom.hasDS()) {
      var params = {
        datasourceId: $scope.activeDataCom.dsId,
        schemaId: $scope.activeDataCom.schemaId,
        tableId: table
      };
      $scope.src.tables.push(table);
      $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
        var colList = [];

        $.each(data, function (i, v) {
          //
          var colObj = {
            table: v.id.table,
            colId: v.id.columnId,
            title: v.alias,
            type: v.type,
            size: v.size,
            axis: 0
          };

          colList.push(colObj);
        });

        $scope.src.list = $scope.src.list.concat(colList);
      });
    } else {
      $scope.msg('danger', '請先選擇資料源！');
    }
  });
  $scope.$on('reface:getColumn', function (event, table) {

    if ($scope.activeDataCom.hasDS()) {
      var params = {
        datasourceId: $scope.activeDataCom.dsId,
        schemaId: $scope.activeDataCom.schemaId,
        tableId: table
      };
      $scope.src.tables.push(table);
      $dmaService.dataDefinition.getColumns(params).success(function (data, status, headers) {
        var colList = [];

        $.each(data, function (i, v) {
          var colObj = {
            table: v.id.tableId,
            colId: v.id.columnId,
            title: v.alias,
            type: v.type,
            size: v.size,
            axis: 0
          };

          colList.push(colObj);
        });
        if (colList) {

          $scope.src.list = colList;
          $scope.limitSrc.list = angular.copy($scope.src.list);
        }
      });
    } else {
      $scope.msg('danger', '請先選擇資料源！');
    }
  });
  $scope.$on('reface:getRelation', function (event, table) {
    var params = {
      datasourceId: $scope.activeDataCom.dsId,
      srcSchema: $scope.activeDataCom.schemaId,
      srcTable: table
    };
    $dmaService.tableRelation.getRelations(params).success(function (data, status, headers) {
      $scope.relation.list = data;
    });
  });

  //欄位選擇清單限制條件欄位
  $scope.limitSrc = {
    list: [],
    defCol: [],
    tables: [],
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'limitSrc.list',
      enableCellEdit: true,
      columnDefs: [
        {name: 'table', enableCellEdit: false, displayName: '表格', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'colId',
          enableCellEdit: false,
          displayName: '欄位ID',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'title',
          enableCellEdit: false,
          displayName: '欄位名稱',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {name: 'type', displayName: '資料型態', visible:true, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'formula',
          enableCellEdit: false,
          displayName: '自定義公式',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
      ],
      onRegisterApi: function (gridApi) {

        gridApi.core.on.renderingComplete($scope, function () {

          var boxHeight = $(window).height() - _bdg.constants.MASTER_PAGE_FIXED_HEIGHT;
          $('#bdg-limitSrc-grid').height(Math.floor(boxHeight * 0.5));
        });
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {

          if (row.isSelected) {

            var table = row.entity.table,
                colId = row.entity.colId,
                title = row.entity.title,
                col = {
                  isUK: 1,
                  table: table,
                  colId: colId,
                  title: title,
                  type:row.entity.type,
                  inputType: row.entity.assistId ? row.entity.assistId : '',
                  formula: row.entity.formula
                };
            // $scope.target.list.push(col);
            var index = $scope.limitSrc.list.indexOf(row.entity);

            $scope.limitSrc.list.splice(index, 1);
            $scope.limitTarget.list.push(col);


          }
        });
        //gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
          //inline edit後的觸發事件

          //$scope.$apply();
          //rowEntity.func = '0';
          //$scope.limitTarget.list.push(rowEntity);
          //
          //$scope.limitSrc.list.splice(rowEntity);
          //$scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue ;

        //});
      }
    })

  };
  $scope.limitTarget = {
    list: [],
    tables: [],
    defCol: [],
    gridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'limitTarget.list',
      columnDefs: [
        {
          name: 'isUK', enableCellEdit: true, displayName: '欄位設定', filter: {condition: uiGridConstants.filter.CONTAINS},
          cellFilter: 'mapIsUK', editDropdownValueLabel: 'isUK', editableCellTemplate: 'ui-grid/dropdownEditor',
          editDropdownOptionsArray: [
            {id: 1, isUK: '1-鍵值'},
            {id: 2, isUK: '2-過濾'},
            {id: 3, isUK: '3-顯示'}
          ]
        },
        {name: 'table', enableCellEdit: false, displayName: '表格', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'colId',
          enableCellEdit: false,
          displayName: '欄位ID',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'title',
          enableCellEdit: false,
          displayName: '欄位名稱',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {
          name: 'inputType',
          enableCellEdit: false,
          displayName: '輸入類別',
          cellTemplate: '<div class="ui-grid-cell-contents">' +
          '<button type="button" class="btn btn-info btn-xs pull-right" bs-tooltip="tooltip" data-title="挑選輔助輸入類別" ng-click="getExternalScopes().pickAssist(row)">' +
          '<span class="glyphicon glyphicon-hand-up">' +
          '</button>' +
          '<span>{{ row.entity.inputType ? row.entity.inputType : ""}}</span>' +
          '</div>',
          filter: {condition: uiGridConstants.filter.CONTAINS}
        },
        {name: 'type', displayName: '資料型態', visible: false, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'op', displayName: '操作', enableFiltering: false, enableCellEdit: false, width: 70,
          cellTemplate: '<div class="ui-grid-cell-contents">' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().removelimitTarget(row)">' +
          '<span class="glyphicon glyphicon-remove">' +
          '</button>' +
          '</div>'
        },
      ],
      onRegisterApi: function (gridApi) {

        gridApi.core.on.renderingComplete($scope, function () {

          var boxHeight = $(window).height() - _bdg.constants.MASTER_PAGE_FIXED_HEIGHT;

          $('#bdg-limitTarget-grid').height(Math.floor(boxHeight * 0.4));
        });

      }

    }),
    pickAssist: function (row) {
      $scope.assist.modal = $icscModal({
        template: 'assistModal',
        show: false,
        scope: $scope
      });
      $scope.limitTarget.selectedRow = row.entity;
      $scope.assist.modal.show();
    },
    limitInit: function () {
      $scope.limitTarget.list = [];
    },
    removelimitTarget: function (row) {
      var table = row.entity.table,
          colId = row.entity.colId,
          title = row.entity.title,
          col = {
            //value: 0,
            table: table,
            colId: colId,
            title: title,
            inputType: 'INPUT',
            type: row.entity.type,
            formula: row.entity.formula
          };
      var index = $scope.limitTarget.list.indexOf(row.entity);
      var colId = $scope.limitTarget.list[index].colId;
      //
      // alert('colId:'+ colId);
      // TODO remove

      $scope.limitTarget.list.splice(index, 1);
      $scope.limitSrc.list.push(col);


    }
  };

  $scope.msg = function (type, msg) {
    $alert({
      type: type,
      content: msg
    });
  };
  $scope.saveInfo = {
    list: [],
    keywordGroup: $scope.domainOpts.selected,
    keyword: $scope.keywordOpts.selected,
    modal: {},
    show: function () {
      this.modal = $icscModal({
        template: 'saveModal',
        show: false,
        scope: $scope,
        prefixEvent: 'save'
      });
      this.modal.show();
    },
    params: function () {

      var infoId = $scope.activeDataCom.infoId || '' + Date.now(),
          ts = new Date(Number(infoId));

      var axisX = [],
          axisYl = [],
          axisYr = [],
          series = [],
          uniqueCol = [];
      $.each($scope.target.list, function (idx, val) {

        switch (val.axis) {
          case 1:

            axisX.push(val);
            break;
          case 2:
            axisYl.push(val);
            break;
          case 3:
            axisYr.push(val);
            break;
          case 4:
            series.push(val);
            break;
        }

      });
      $.each($scope.limitTarget.list, function (idx, val) {
        if (val.isUK === 1) {
          uniqueCol.push(val);
        }
      });

      return {
        //add
        genSql: "true",
        infoId: $scope.activeDataCom.infoId,
        chartType: "Line",
        chartSize: "9X6",
        //runBuy:"para",
        mustWhere: $scope.essential.ruleList,
        axisX: axisX,
        axisYl: axisYl,
        axisYr: axisYr,
        series: series,
        chartTitle: $scope.activeDataCom.comTitle,
        tableId: $scope.src.tables,
        relation: $scope.relation.selectedItems,
        defCol: $scope.src.defCol,
        limitCol: $scope.limitTarget.list,
        uniqueCol: uniqueCol,
        keywordGroup: $scope.saveInfo.keywordGroup,
        keyword: $scope.saveInfo.keyword,
        memo: ""

      };
    },
    save: function (type) {
      var params = $scope.saveInfo.params();
      if (type !== true) {
        if ($scope.saveInfo.saveCheck()) {
          $icscRest.post('bdg/logic/saveInfo', params).success(function (data, status, headers) {
            //$scope.saveInfo.modal.hide();
            $scope.activeDataCom.infoId = data.infoId;
            $scope.msg('success', '暫存成功!!');
          });
        }
      } else {
        $icscRest.post('bdg/logic/saveInfo', params).success(function (data, status, headers) {

          $scope.saveInfo.modal.hide();
          $scope.activeDataCom.infoId = data.infoId;
          $scope.msg('success', '儲存成功!!');
        });
      }

    },
    saveAs: function () {

    },
    saveCheck: function () {

      if ($scope.activeDataCom.comTitle) {
        return true;
      }
      return false;
    }
  };
  $dmaService.assistQuery.getAssistQueryList().success(function (data, status, headers) {

    $scope.assist.list = $scope.assist.list.concat(data);
  });


// 資料預覽
  $scope.sqlPrev = {
    modal: {},
    text: '',
    show: function () {
      var self = this;
      self.modal = $icscModal({
        template: 'sqlPrevModal',
        show: false,
        scope: $scope
      });
      self.modal.show();
    }
  };
// 進階資料查詢
  $scope.genAssistor = function (inputType, colId, table, dataType, formula) {
    var tp = '',
        col = formula ? formula : table + '.' + colId,
        it = inputType ? inputType.toLowerCase() : '';
    if (it === 'date') {
       
      tp =
          '<span title="日期輔助輸入" class="input-group-addon" data-bdg-form-active="' + colId + '" data-bdg-assistor="' + inputType + '" ng-click="advDatePicker.show($event)">' +
          '<span class="glyphicon glyphicon-calendar"></span>' +
          '</span>' +
          '<input type="text" class="form-control" placeholder="請挑選日期" data-aqc="' + col + '" data-type="' + dataType + '" ng-model="advQueryPane.form.' + colId + '">';
    } else if (it === 'time') {
      tp =
          '<span title="時間輔助輸入" class="input-group-addon" data-bdg-form-active="' + colId + '" data-bdg-assistor="' + inputType + '" ng-click="advTimePicker.show($event)">' +
          '<span class="glyphicon glyphicon-time"></span>' +
          '</span>' +
          '<input type="text" class="form-control" placeholder="請挑選時間" data-aqc="' + col + '" data-type="' + dataType + '" ng-model="advQueryPane.form.' + colId + '">';
    } else if (it === 'input') {
      tp = '<input type="text" class="form-control" placeholder="請輸入資料" data-aqc="' + col + '" data-type="' + dataType + '" ng-model="advQueryPane.form.' + colId + '">';
    } else {
      tp =
          '<span title="資料輔助輸入" class="input-group-addon" data-bdg-form-active="' + colId + '" data-bdg-assistor="' + inputType + '" ng-click="assistor.show($event)">' +
          '<span class="glyphicon glyphicon-filter"></span>' +
          '</span>' +
          '<input type="text" class="form-control" placeholder="請挑選' + inputType + '值" data-aqc="' + col + '" data-type="' + dataType + '" ng-model="advQueryPane.form.' + colId + '">';
    }
    return tp;
  };
  $scope.genForm = function (cols) {

    var c = '<div id="bdg-adv-query-form" role="form">';
    $.each(cols, function (i, v) {
      if (v.isUK !== 3) {

        c +=
            '<div class="form-group col-lg-12">' +
            '<label for="bdg-aq-filter-col-' + i + '" class="control-label">' + (v.colName ? v.colName : v.colId ) + '(' + v.colId + ')</label>' +
            '<div class="input-group">' +
            $scope.genAssistor(v.inputType ? v.inputType : '', v.colId, v.table, v.srcType, v.formula) +
            '<span class="input-group-addon" title="清空輸入值" data-aqc-id="' + v.colId + '" ng-click="advQueryPane.removeInput($event)">' +
            '<span class="glyphicon glyphicon-remove" data-aqc-id="' + v.colId + '"></span>' +
            '</span>' +
            '</div>' +
            '</div>';
      }
    });
    return c + '</div>';
  };

  $scope.genCondition = function () {
    var condition = [],
        aqc = $('#bdg-adv-query-form').find('input');
    $.each(aqc, function (i1, v1) {
      var $temp = $(v1),
          tVal = $temp.val(),
          aqcVal = $temp.data('aqc');
      if (tVal) {
        var ts = tVal.split(','),
            wrap = _bdg.util.isStrDataType($temp.data('type')) ? "'" : "";
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
  };

  $scope.$on('advQuery.show', function () {
    $scope.advQueryPane.modal.$element.find('#bdg-aq-filter .panel-body').prepend($scope.advQueryPane.elm);
  });
  $scope.advQueryPane = {
    modal: {},
    selectedItem: {},
    form: {
      active: ''
    },
    rptList: [],
    rptTotal: 0,
    uniList: [],
    uniTotal: 0,
    rowNum: 2000,
    msg: '',
    getData: function (data, page) {
      var res = [];
      for (var i = 0; i < page * 1000 && i < data.length; ++i) {
        res.push(data[i]);
      }
      return res;
    },
    rptGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'advQueryPane.rptList'
    }),
    uniGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'advQueryPane.uniList'
    }),
    show: function () {
      var self = this,
          cols = $scope.limitTarget.list,
          form = $scope.genForm(cols),
          elm = angular.element(form);
      self.modal = $icscModal({
        template: 'advQueryModal',
        show: false,
        scope: $scope,
        prefixEvent: 'advQuery'
      });
      $scope.advQueryPane.elm = elm;
      $compile(elm)($scope);
      self.modal.show();
    },
    params: {
      get: function (type) {
        var axisX = [],
            axisYl = [],
            axisYr = [],
            series = [];
        $.each($scope.target.list, function (idx, val) {
          //$scope.saveInfo.convertAxesFunc(val);
          switch (val.axis) {
            case 1:
              axisX.push(val);
              break;
            case 2:
              axisYl.push(val);
              break;
            case 3:
              axisYr.push(val);
              break;
            case 4:
              series.push(val);
              break;
          }

        });
        return {
          type: type,
          infoId: $scope.activeDataCom.infoId,
          dsId: $scope.activeDataCom.dsId,
          chartTitle: $scope.activeDataCom.comTitle,
          sqlWhere: $scope.essential.ruleList,
          schemaId: $scope.activeDataCom.schemaId,
          tableId: $scope.src.tables,
          relation: $scope.relation.selectedItems.concat($scope.relation.transferRefCol()),
          axisX: axisX,
          axisYl: axisYl,
          axisYr: axisYr,
          series: series,
          where: $scope.essential.getRules().concat($scope.genCondition()),
          orderBy: $scope.orderBy.get()
        };
      }
    },
    getReportData: function () {
      var colDefs = [],
          cols = $scope.target.list;
      $.each(cols, function (i, v) {
        var type = 0;
        var axis = _bdg.util.setAxisFromIndex(type, v.axis);
        var cellStyle = '',

            row = {
              name: axis + '_' + v.title,
              displayName: v.title
            };
        if (v.type && !_bdg.util.isStrDataType(v.type)) cellStyle = 'ui-grid-number-cell';
        if (i === cols.length - 1) cellStyle += ' ui-grid-number-rightmost-cell';
        if (cellStyle) row.cellClass = cellStyle;
        colDefs.push(row);
      });
      $scope.advQueryPane.msg = '';
      $scope.advQueryPane.rptTotal = 0;
      $scope.advQueryPane.rptList = [];
      $scope.advQueryPane.rptGridOpts.columnDefs = colDefs;

      var params = this.params.get();
      $icscRest.post('bdg/logic/getPreviewData', params).success(function (rs) {
      //
        $scope.advQueryPane.rptList = rs.exeData;
        $scope.advQueryPane.rptTotal = rs.totalRow;
        if (rs.total > $scope.advQueryPane.rowNum) {
          $scope.advQueryPane.msg = ' (只顯示前' + $scope.advQueryPane.rowNum + '筆，匯出Excel可查閱全部資料)';
        }

      });

    },
    getUniqueData: function () {
      var colDefs = [],
          cols = $scope.target.list;
      $.each(cols, function (i, v) {
        if (v.isUK === 1) {
          var cellStyle = '',
              row = {
                name: v.colId.toLowerCase(),
                displayName: v.title
              };
          if (v.srcType && !_bdg.util.isStrDataType(v.srcType)) cellStyle = 'ui-grid-number-cell';
          if (i === cols.length - 1) cellStyle += ' ui-grid-number-rightmost-cell';
          if (cellStyle) row.cellClass = cellStyle;
          colDefs.push(row);
        }
      });
      $scope.advQueryPane.msg = '';
      $scope.advQueryPane.uniTotal = 0;
      $scope.advQueryPane.uniList = [];
      $scope.advQueryPane.uniGridOpts.columnDefs = colDefs;
      //TODO
      //$icscRest.post('bdd/dataCom/getLimitColRS', this.params.get('UC')).success(function (rs) {
      //  $scope.advQueryPane.uniList = rs.data;
      //  $scope.advQueryPane.uniTotal = rs.total;
      //  if (rs.total > $scope.advQueryPane.rowNum) $scope.advQueryPane.msg = ' (只顯示前' + $scope.advQueryPane.rowNum + '筆)';
      //});
    },
    removeInput: function ($event) {
      var colId = $($event.target).data('aqc-id');
      $scope.advQueryPane.form[colId] = '';
    },
    export: function () {

      $icscRest.post('bdd/exportExcel/export', this.params.get('LC')).success(function (data) {
        $("<iframe/>").attr({
          src: 'http://' + location.host + '/erp/rest/bdd/exportExcel/download/' + data.fileName,
          style: "visibility:hidden;display:none"
        }).appendTo('body');
      });
    }
  };
  $scope.orderBy = {
    modal: {},
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'orderBy.colList',
      columnDefs: [
        {name: 'table', displayName: '表格', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'colId', displayName: '欄位ID', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'title', displayName: '欄位名稱', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'axis', displayName: '軸線', filter: {condition: uiGridConstants.filter.CONTAINS}},
        //{ name: 'dataType', displayName: '資料型態', filter: { condition: uiGridConstants.filter.CONTAINS } },
        //{ name: 'dataSize', displayName: '資料長度', filter: { condition: uiGridConstants.filter.CONTAINS } }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                colVal = e.table + '.' + e.colId;
            $scope.orderBy.rule = colVal + ' ASC';
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      enableFiltering: false,
      data: 'orderBy.ruleList',
      columnDefs: [
        {name: 'rule', displayName: '排序欄位清單(由上而下加入排序欄位)', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'op', displayName: '操作', width: 100,
          cellTemplate: '<div class="ui-grid-cell-contents btn-group">' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().delRule(row)">' +
          '<span class="glyphicon glyphicon-remove">' +
          '</button>' +
          '</div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.selected) {

          }
        });
      }
    }),
    show: function () {
      var filterCols = [],
          srcList = angular.copy($scope.src.list),
          targetList = angular.copy($scope.target.list);

      this.modal = $icscModal({
        template: 'orderByModal',
        show: false,
        scope: $scope
      });
      this.modal.show();

      $.each(srcList, function (i, v) {
        $.each(targetList, function (i2, v2) {
          if (v.table === v2.table && v.colId === v2.colId) {
            //test axis
            v.axis = _bdg.util.setAxisFromIndex(1, v.axis);
            filterCols.push(v);
          }
        });
      });
      $scope.orderBy.colList = filterCols;
    },
    desc: function () {
      var ruleVal = $scope.orderBy.rule;
      if (ruleVal && ruleVal.slice(-3) === 'ASC') {
        ruleVal = ruleVal.slice(0, -3) + 'DESC';
        $scope.orderBy.rule = ruleVal;
      }
    },
    addRule: function () {
      var ruleVal = $scope.orderBy.rule;
      if (ruleVal) {
        $scope.orderBy.ruleList.push({
          rule: ruleVal
        });
      }
    },
    clearRule: function () {
      $scope.orderBy.rule = '';
    },
    delRule: function (row) {
      var index = $scope.orderBy.ruleList.indexOf(row.entity);
      $scope.orderBy.ruleList.splice(index, 1);
    },
    get: function () {
      var orderStr = '';
      $.each(this.ruleList, function (i, v) {
        orderStr += v.rule + ',';
      });
      return orderStr.slice(0, -1);
    }
  };

  $scope.userFilter = {
    modal: {},
    selectedDataType: '',
    colList: [],
    ruleList: [],
    colGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'userFilter.colList',
      columnDefs: [
        {name: 'table', displayName: '表格', width: 150, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'colId', displayName: '欄位ID', width: 150, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'alias', displayName: '欄位名稱', width: 150, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'type', displayName: '資料型態', width: 100, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'size', displayName: '資料長度', visible: false, filter: {condition: uiGridConstants.filter.CONTAINS}},
        {name: 'formula', displayName: '自定義公式', filter: {condition: uiGridConstants.filter.CONTAINS}}
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            var e = row.entity,
                formula = e.formula,
                colVal = formula ? formula : e.table + '.' + e.colId;
            if ($scope.userFilter.rule) {
              if (_bdg.util.isRuleOp($scope.userFilter.rule)) {
                $scope.userFilter.rule += '' + colVal;
              } else {
                var ruleGrain = $scope.userFilter.rule.split(' ');
                if (ruleGrain.length === 1) {
                  $scope.userFilter.rule = colVal;
                } else {
                  if (_bdg.util.isRuleOp(ruleGrain[ruleGrain.length - 2])) {
                    $scope.userFilter.rule += ' AND ' + colVal;
                  } else {
                    var tempRuleGrain = $scope.userFilter.rule.split(' AND ');
                    tempRuleGrain[tempRuleGrain.length - 1] = colVal;
                    $scope.userFilter.rule = tempRuleGrain.join(' AND ');
                  }
                }
              }
            } else {
              $scope.userFilter.rule = colVal;
            }
            $scope.userFilter.selectedDataType = e.type;
          }
        });
      }
    }),
    ruleGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      enableFiltering: false,
      data: 'userFilter.ruleList',
      columnDefs: [
        {name: 'rule', displayName: '規則清單(規則間以OR串聯)', filter: {condition: uiGridConstants.filter.CONTAINS}},
        {
          name: 'op', displayName: '操作', width: 100,
          cellTemplate: '<div class="ui-grid-cell-contents btn-group">' +
          '<button type="button" class="btn btn-danger btn-xs" bs-tooltip="tooltip" data-title="刪除" ng-click="getExternalScopes().delRule(row)">' +
          '<span class="glyphicon glyphicon-remove">' +
          '</button>' +
          '</div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.selected) {

          }
        });
      }
    }),
    show: function () {
      var filterCols = [];

      this.modal = $icscModal({
        template: 'userFilterModal',
        show: false,
        scope: $scope
      });
      this.modal.show();

      $.each($scope.src.list, function (i, v) {
        $.each($scope.target.list, function (i2, v2) {
          if (v.table === v2.table && v.colId === v2.colId) {
            filterCols.push(v);
          }
        });
      });
      $scope.userFilter.colList = filterCols;
    },
    op: function ($event) {
      if ($scope.userFilter.rule) {
        var opSign = $event.target.textContent;
        if (_bdg.util.isRuleOp($scope.userFilter.rule)) {
          var op_rules = $scope.userFilter.rule.split(' ');
          op_rules[op_rules.length - 1] = opSign;
          $scope.userFilter.rule = op_rules.join(' ');
        } else {
          var op_tempRuleGrain = $scope.userFilter.rule.split(' AND '),
              op_lastRule = op_tempRuleGrain[op_tempRuleGrain.length - 1].split(' ');
          if (op_lastRule.length === 1) $scope.userFilter.rule += ' ' + opSign;
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    fillOpd: function () {
      if (_bdg.util.isRuleOp($scope.userFilter.rule)) {
        var isInOpd = $scope.userFilter.rule.slice(-2) === 'in';
        if (_bdg.util.isStrDataType($scope.userFilter.selectedDataType)) {
          if (isInOpd) {
            var inputStrReal = '(',
                inputStrGrain = $scope.userFilter.input.split(',');
            $.each(inputStrGrain, function (i, v) {
              inputStrReal += "'" + v.trim() + "',";
            });
            inputStrReal = inputStrReal.slice(0, -1) + ')';
            $scope.userFilter.rule += ' ' + inputStrReal;
          } else {
            $scope.userFilter.rule += " '" + $scope.userFilter.input + "'";
          }
        } else {
          if (isInOpd) {
            var hasInvalidNum = false,
                inputNumReal = '(',
                inputNumGrain = $scope.userFilter.input.split(',');
            $.each(inputNumGrain, function (i, v) {
              if ($.isNumeric(v)) {
                inputNumReal += v.trim() + ",";
              } else {
                hasInvalidNum = true;
              }
            });
            inputNumReal = inputNumReal.slice(0, -1) + ')';
            if (hasInvalidNum) $scope.msg('info', '請於\",\"間輸入有效的數字！');
            else $scope.userFilter.rule += ' ' + inputNumReal;
          } else {
            if ($.isNumeric($scope.userFilter.input)) $scope.userFilter.rule += ' ' + $scope.userFilter.input;
            else $scope.msg('info', '請輸入有效的數字！');
          }
        }
      } else {
        $scope.msg('info', '請選擇欄位運算元！');
      }
    },
    clearRule: function () {
      $scope.userFilter.rule = '';
    },
    addRule: function () {
      var ruleVal = $scope.userFilter.rule;
      if (_bdg.util.isInvalidRule(ruleVal) || _bdg.util.isRuleOp(ruleVal)) {
        $scope.msg('info', '無效的運算式！');
      } else {
        var ruleObj = {rule: ruleVal.split('AND').length > 1 ? '(' + ruleVal + ')' : ruleVal};
        $scope.userFilter.ruleList.push(ruleObj);
      }
    },
    delRule: function (row) {
      var index = $scope.userFilter.ruleList.indexOf(row.entity);
      $scope.userFilter.ruleList.splice(index, 1);
    },
    getRules: function () {
      return $scope.userFilter.ruleList;
    }
  };


  $scope.dataPrev = {
    modal: {},
    selectedItem: {},
    form: {
      active: ''
    },
    rptList: [],
    rptTotal: 0,
    uniList: [],
    uniTotal: 0,
    rowNum: 50,
    msg: '',
    getData: function (data, page) {
      var res = [];
      for (var i = 0; i < page * 1000 && i < data.length; ++i) {
        res.push(data[i]);
      }
      return res;
    },
    rptGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'dataPrev.rptList'
    }),
    uniGridOpts: $.extend(true, {}, _bdg.uiGridOpts, {
      data: 'dataPrev.uniList'
    }),
    show: function () {
      //var self = this,
      //    cols = $scope.target.list,
      //    form = $scope.genForm(cols),
      //    elm = angular.element(form);
      var self = this
      self.modal = $icscModal({
        template: 'dataPrevModal',
        show: false,
        scope: $scope
      });
      self.modal.show();
      self.getReportData();
    },
    params: {
      get: function () {
        var axisX = [],
            axisYl = [],
            axisYr = [],
            series = [];
        $.each($scope.target.list, function (idx, val) {
          //$scope.saveInfo.convertAxesFunc(val);
          switch (val.axis) {
            case 1:
              axisX.push(val);
              break;
            case 2:
              axisYl.push(val);
              break;
            case 3:
              axisYr.push(val);
              break;
            case 4:
              series.push(val);
              break;
          }

        });
        return {
          // type: type,
          infoId: $scope.activeDataCom.infoId,
          dsId: $scope.activeDataCom.dsId,
          chartTitle: $scope.activeDataCom.comTitle,
          sqlWhere: $scope.essential.ruleList,
          schemaId: $scope.activeDataCom.schemaId,
          tableId: $scope.src.tables,
          relation: $scope.relation.selectedItems,
          axisX: axisX,
          axisYl: axisYl,
          axisYr: axisYr,
          series: series,
          where: $scope.essential.getRules().concat($scope.genCondition()),
          orderBy: $scope.orderBy.get()
        };
      }
    },
    getReportData: function () {
      // 
      var colDefs = [],
          cols = $scope.target.list;
      $.each(cols, function (i, v) {
        var type = 0;
        var axis = _bdg.util.setAxisFromIndex(type, v.axis);
        var cellStyle = '',

            row = {
              name: axis + '_' + v.title,
              displayName: v.title
            };
        if (v.type && !_bdg.util.isStrDataType(v.type)) cellStyle = 'ui-grid-number-cell';
        if (i === cols.length - 1) cellStyle += ' ui-grid-number-rightmost-cell';
        if (cellStyle) row.cellClass = cellStyle;
        colDefs.push(row);
      });

      $scope.dataPrev.msg = '';
      $scope.dataPrev.rptTotal = 0;
      $scope.dataPrev.rptList = [];
      $scope.dataPrev.rptGridOpts.columnDefs = colDefs;

      var params = this.params.get();

      $icscRest.post('bdg/logic/getPreviewData', params).success(function (rs) {
        $scope.dataPrev.rptList = rs.exeData;
        $scope.dataPrev.rptTotal = rs.totalRow;

        if (rs.totalRow > $scope.dataPrev.rowNum) {
          $scope.dataPrev.msg = ' (只顯示前' + $scope.dataPrev.rowNum + '筆)';
        }

      });

    },
    getUniqueData: function () {
      var colDefs = [],
          cols = $scope.target.list;
      $.each(cols, function (i, v) {
        if (v.isUK === 1) {
          var cellStyle = '',
              row = {
                name: v.colId.toLowerCase(),
                displayName: v.title
              };
          if (v.srcType && !_bdg.util.isStrDataType(v.srcType)) cellStyle = 'ui-grid-number-cell';
          if (i === cols.length - 1) cellStyle += ' ui-grid-number-rightmost-cell';
          if (cellStyle) row.cellClass = cellStyle;
          colDefs.push(row);
        }
      });
      $scope.dataPrev.msg = '';
      $scope.dataPrev.uniTotal = 0;
      $scope.dataPrev.uniList = [];
      $scope.dataPrev.uniGridOpts.columnDefs = colDefs;
      //TODO
      //$icscRest.post('bdd/dataCom/getLimitColRS', this.params.get('UC')).success(function (rs) {
      //  $scope.dataPrev.uniList = rs.data;
      //  $scope.dataPrev.uniTotal = rs.total;
      //  if (rs.total > $scope.dataPrev.rowNum) $scope.dataPrev.msg = ' (只顯示前' + $scope.dataPrev.rowNum + '筆)';
      //});
    },
    removeInput: function ($event) {
      var colId = $($event.target).data('aqc-id');
      $scope.dataPrev.form[colId] = '';
    },
    export: function () {
      //TODO 產生報表
      //$icscRest.post('bdd/exportExcel/save', this.params.get('LC')).success(function (data) {
      //  $("<iframe/>").attr({
      //    src: 'http://' + location.host + '/erp/rest/bdd/exportExcel/download/' + data.fileName,
      //    style: "visibility:hidden;display:none"
      //  }).appendTo('body');
      //});
    }
  };

//  繪圖
  $scope.onResize = function (event) {
    //$scope.win2.setOptions({maxWidth:$scope.win2.width,maxHeight:$scope.win2.height});

    var win1 = $("#win1").data("kendoWindow").size(),
        width = win1.width * 0.9,
        height = win1.height * 0.9;
    $scope.c3Chart1.chart.resize({width: width, height: height});
  };
  $scope.chartPrev1 = {
    show: function () {
      var info = $scope.saveInfo.params(),
          chartTitle = $scope.activeDataCom.comTitle,
          width = $(window).width() * 0.85,
          height = $(window).height() * 0.85;
      info.runBy = 'para';
      var win1 = $('#win1').kendoWindow().data("kendoWindow");
      win1.setOptions({
        width: width,
        height: height,
        actions: [
          "Minimize",
          "Maximize",
          "Close"
        ]
      });
      win1.title(chartTitle);
      win1.open();
      $icscRest.post('bdg/logic/getChartData', info).success(function (data, status, headers) {
        var result = data.exeresult;

        if (result === "Success") {

          $scope.c3Chart1.draw(data);

        } else {
          console.log(data.exeMsg);
          win1.title('取得繪圖資料失敗！(F12查看錯誤訊息)');
          $scope.msg('取得繪圖資料失敗！(F12查看錯誤訊息)');
          $scope.c3Chart1.$hide();
        }
      });
    }
  };

  $scope.c3Chart1 = {
    chart: {},
    chartList: [],
    titleX: '',
    titleY: '',
    chartInfo: function () {
      return {
        bindto: '#c3Chart1',
        legend: {
          position: 'bottom'
        },
        size: {
          width: $(window).width() * 0.8,
          height: $(window).height() * 0.8
        },
        data: {
          x: 'x',
          columns: $scope.c3Chart1.chartList,
          selection: {
            enabled: true,
            multiple: true
            //grouped: true
          }
        },
        zoom: {
          enabled: true,
          rescale: true
        },
        axis: {
          x: {
            label: {
              text: $scope.c3Chart1.titlex,
              position: 'outer-center'
            },
            type: 'category'
          },
          y: {
            label: {
              text: $scope.c3Chart1.titleyl,
              position: 'outer-middle'
            }
          }
        }
      }
    },
    draw: function (chartInfo) {

      var win1 = $("#win1").data("kendoWindow").size(),
          width = win1.width * 0.95,
          height = win1.height * 0.95;
      this.transferYData(chartInfo);
      $scope.c3Chart1.chart = c3.generate($scope.c3Chart1.chartInfo());
      $scope.c3Chart1.chart.resize({width: width, height: height});
    },
    transferYData: function (chartInfo) {

      var c = [],
          xd = [],
          x = chartInfo.x,
          yl = chartInfo.yl,
          yr = chartInfo.yr;
      if (x) {
        xd.push('x');
        xd = xd.concat(x);
        c.push(xd);
      }
      if (yl) {
        $.each(yl, function (i, v) {
          var yld = [];
          yld.push(i);
          yld = yld.concat($.parseJSON(v));
          c.push(yld);
        });
      }
      chartInfo.columns = c;
      $scope.c3Chart1.titlex = chartInfo.titlex;
      $scope.c3Chart1.titleyl = chartInfo.titleyl;
      $scope.c3Chart1.chartList = chartInfo.columns;
    }
  };
  $scope.$on('advDatePicker.show', function () {
    $scope.advDatePicker.modal.$element.find('.modal-body').append($scope.advDatePicker.elm);
  });

  $scope.advDatePicker = {
    modal: {},
    elm: '',
    format: 'yyyyMMdd',
    inputModel: '',
    show: function ($event) {
      var self = this,
          currentTarget = $event.currentTarget,
          $currentTarget = $(currentTarget),
          dsEle = angular.element('<datepicker ng-model="advDatePicker.default" ng-click="advDatePicker.roller()" min-date="minDate" show-weeks="false"></datepicker>');
      self.inputModel = $currentTarget.next().attr("ng-model").split('.').slice(-1)[0];
      self.modal = $icscModal({
        template: 'advDatePickerModal',
        show: false,
        scope: $scope,
        prefixEvent: 'advDatePicker'
      });
      $compile(dsEle)($scope);
      $scope.advDatePicker.elm = dsEle;
      self.modal.show($event);
    },
    roller: function () {
      var dateStr = $scope.advDatePicker.default ? _bdg.util.getDateStr($scope.advDatePicker.default) : '',
          currentInput = $scope.advDatePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing) {
        if (existing.indexOf(dateStr) === -1) {
          if (existing.slice(-1) === '~') $scope.advQueryPane.form[currentInput] += dateStr;
          else $scope.advQueryPane.form[currentInput] += ',' + dateStr;
        }
      } else {
        $scope.advQueryPane.form[currentInput] = dateStr;
      }
    },
    setSymbol: function () {
      var currentInput = $scope.advDatePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing && existing.slice(-1) !== '~') {
        $scope.advQueryPane.form[currentInput] += '~';
      }
    }
  };

  $scope.$on('advTimePicker.show', function () {
    $scope.advTimePicker.modal.$element.find('.modal-body').append($scope.advTimePicker.elm);
  });

  $scope.advTimePicker = {
    modal: {},
    elm: '',
    inputModel: '',
    show: function ($event) {
      var self = this,
          currentTarget = $event.currentTarget,
          $currentTarget = $(currentTarget),
          dsEle = angular.element('<timepicker ng-model="advTimePicker.default" hour-step="1" minute-step="15" show-meridian="false"></timepicker>');
      $scope.advTimePicker.default = new Date();
      self.inputModel = $currentTarget.next().attr("ng-model").split('.').slice(-1)[0];
      self.modal = $icscModal({
        template: 'advTimePickerModal',
        show: false,
        scope: $scope,
        prefixEvent: 'advTimePicker'
      });
      $compile(dsEle)($scope);
      $scope.advTimePicker.elm = dsEle;
      self.modal.show($event);
    },
    roller: function () {
      var timeStr = _bdg.util.getHMTimeStr($scope.advTimePicker.default),
          currentInput = $scope.advTimePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing) {
        if (existing.indexOf(timeStr) === -1) {
          if (existing.slice(-1) === '~') $scope.advQueryPane.form[currentInput] += timeStr;
          else $scope.advQueryPane.form[currentInput] += ',' + timeStr;
        }
      } else {
        $scope.advQueryPane.form[currentInput] = timeStr;
      }
    },
    setSymbol: function () {
      var currentInput = $scope.advTimePicker.inputModel,
          existing = $scope.advQueryPane.form[currentInput];
      if (existing && existing.slice(-1) !== '~') {
        $scope.advQueryPane.form[currentInput] += '~';
      }
    }
  };
};
