/**
 * Created by I25834 on 2014/7/7.
 */
(function () {
  "use strict";
  $.extend(_bd, {
    spc: {
      isUserInfoColFull: false,

      genUniqueId: function (infoId, type) {
        var charts = $('#bas-store').data('charts'),
            ranNum = Math.floor((Math.random() * 1000) + 1),
            id = infoId + "-" + type + ranNum;
        if (charts && charts.indexOf(id) !== -1) {
          _bd.spc.genUniqueId(infoId, type);
        }
        return id;
      },

      getCanvasIdFromChartId: function (chartId) {
        return chartId.replace("-d", "-c");
      },

      getChartIdFromCanvasId: function (canvasId) {
        return canvasId.replace("-c", "-d");
      },

      getInfoDesc: function (data) {
        var desc = '',
            time = data.time;
        if (data.charttitle) desc += '[' + data.charttitle + '] ';
        if (data.updateemp) desc += data.updateemp + ' ';
        if (data.date) desc += data.date + ' ';
        if (time) desc += time.slice(0, 2) + ':' + time.slice(2, 4);
        return desc;
      },

      getInfoData: function (rowId) {
        return $('#bas-info-grid .jqgrow[id="' + rowId + '"]').data('info');
      },

      getChartTitle: function (chartTitle, chartId) {
        return chartTitle + "(*" + chartId.slice(-8) + ")";
      },

      queryInfos: function () {
        _bs.util.getBdgJSON('logic/getInfo', {isValid: "true"}, function (data) {
          var infoList = [],
              $infoGrid = [],
              gridIdx = 0,
              $grid = $('#bas-info-grid');
          $.each(data, function (i, v) {
            var info = {};
            info.infoId = v.infoid;
            info.chartTitle = v.charttitle;
            info.chartType = v.charttype ? v.charttype.toLowerCase() : "";
            info.chartSize = v.chartsize;
            info.info = _bd.spc.getInfoDesc(v);
            infoList.push(info);
          });
          $grid.gk('clear');
          $grid.gk('add', infoList);
          // store info data to grid row
          $infoGrid = $('#bas-info-grid .jqgrow');
          $.each(infoList, function (i, v) {
            $($infoGrid[i]).data('info', v);
            gridIdx = i;
          });
          // group
          //var groupDeferObj =
          _bd.spc.getDefaultGroupInfo(null, function (data) {
            if (data) {
              if (data.length > 0) {
                //$grid.gk('add', group);
                //$infoGrid = $('#bas-info-grid .jqgrow');
                $.each(data, function (i, v) {
                  v = $.parseJSON($.parseJSON(v.info));
                  $grid.gk('add', v);
                  $infoGrid = $('#bas-info-grid .jqgrow');
                  $($infoGrid[gridIdx + 1 + i]).data('info', v.face);
                });
              }
            }
          });
          //groupDeferObj.then(function (data) {
          //  if (data) {
          //    if (data.length > 0) {
          //      //$grid.gk('add', group);
          //      //$infoGrid = $('#bas-info-grid .jqgrow');
          //      $.each(data, function (i, v) {
          //        v = $.parseJSON($.parseJSON(v.info));
          //        $grid.gk('add', v);
          //        $infoGrid = $('#bas-info-grid .jqgrow');
          //        $($infoGrid[gridIdx + 1 + i]).data('info', v.face);
          //      });
          //    }
          //  }
          //});
        });
      },

      genChartHtml: function (genId, data) {
        var grain = _bd.util.getGrain('#bas-content-grid'),
            chartId = genId ? _bd.spc.genUniqueId(data.infoId, "d") : data.chartId,
            chartTitle = data.chartTitle,
            chartSize = data.chartSize,
            chartWidth = chartSize.split('x')[0] * grain.width,
            chartHeight = chartSize.split('x')[1] * grain.height,
            canvasId, title, code;
        if (genId) {
          if (data.overlap) chartId = _bd.spc.genUniqueId(_bd.spc.getInfoIdFromChart(data.canvasId), "d");
          else chartId = _bd.spc.genUniqueId(data.infoId, "d");
        } else {
          chartId = data.chartId;
        }
        canvasId = _bd.spc.getCanvasIdFromChartId(chartId);
        title = _bd.spc.getChartTitle(chartTitle, chartId);
        code = "<div id='" + chartId + "' title='" + title + "' style='display:none;'>";
        code += "<canvas id='" + canvasId + "' width='" + chartWidth + "' height='" + chartHeight + "'></canvas></div>";
        return code;
      },

      buildChart: function (genId, data) {
        var chartDialog,
            chartDom = _bd.spc.genChartHtml(genId, data),
            $chartDom = $(chartDom),
            chartId = $chartDom.attr('id'),
            chartTitle = data.chartTitle,
            chartSize = data.chartSize,
            pos = data.position,
            canvasId = $chartDom.find('canvas').attr('id'),
            chartDataObj,
            $canvasDom;

        // append chart html to container
        $('#bas-chart-container').append(chartDom);
        chartDialog = $("#" + chartId);
        chartDialog.dialog({
          width: 'auto',
          height: 'auto',
          close: function (evt) {
            var canvasId = _bd.spc.getCanvasIdFromChartId(evt.target.id);
            evt.stopPropagation();
            _bd.spc.removeChart(canvasId);
            _bd.spc.keepFace();
            _bd.spc.touchChart();
          }
        });
        chartDialog.parent().offset(pos);

        _bd.spc.addChart(canvasId);

        // prepare chart data object
        chartDataObj = {
          chartId: chartId,
          chartType: data.chartType,
          chartTitle: chartTitle,
          chartSize: chartSize,
          canvasId: canvasId,
          position: pos
        };

        if (data.overlap) {
          $('#' + canvasId).data('uv', $('#' + data.canvasId).data('uv'));
          _bd.spc.overlapPrev(canvasId, data.goType, data.nowTimes, data.times);
        } else {
          _bd.spc.drawChart(canvasId, data.overlap);
        }

        // store chart info and canvas object to canvas data model
        $canvasDom = $('#' + canvasId);
        _bd.util.objToEleData($canvasDom, chartDataObj);

        $('#' + chartId).closest('.ui-dialog').on('click', function (evt) {
          var canvasId = $(this).find('canvas').attr('id');
          _bd.spc.reorgChartFace(canvasId);
          _bd.spc.touchChart();
        });

        // register dragstop event on chart dialog header
        $('#' + chartId).closest('.ui-dialog').on('dragstop', function (evt) {
          var chartId = $(evt.target).attr('aria-describedby'),
              canvasId = _bd.spc.getCanvasIdFromChartId(chartId),
              pos = {
                left: evt.target.offsetLeft,
                top: evt.target.offsetTop
              };
          $('#' + canvasId).data('position', pos);
          _bd.spc.reorgChartFace(canvasId);
          _bd.spc.markActiveChart(canvasId);
        });

        // register resize event on chart dialog
        $('#' + chartId).closest('.ui-dialog').on('resize', function (evt) {
          var chartId = $(evt.target).attr('aria-describedby'),
              $chart = $('#' + chartId),
              $dialog = $chart.closest('.ui-dialog'),
              canvasId = _bd.spc.getCanvasIdFromChartId(chartId),
              $canvas = $('#' + canvasId),
              grain = _bd.util.getGrain('#bas-content-grid'),
              pos = {
                left: evt.target.offsetLeft,
                top: evt.target.offsetTop
              },
              timerId;

          _bd.spc.resize(chartId, $dialog.outerWidth() - 34, $dialog.outerHeight() - 60);
          $canvas.data('position', pos);
          $canvas.data('chartSize', _bd.spc.composeChartSize(_bd.util.roundFloat(($dialog.outerWidth() - 30)/grain.width, 2), _bd.util.roundFloat(($dialog.outerHeight() - 60)/grain.height, 2)));
          // Sync to backend
          clearTimeout(timerId);
          timerId = setTimeout(function () {
            _bd.spc.keepFace();
          }, 2000);
        });

        // Hide chart dialog scroll bar
        _bd.util.hideScroll('#' + chartId);

        _bd.spc.keepFace();
        _bd.spc.markActiveChart(canvasId);
      },

      getActiveChart: function () {
        var charts = $('#bas-store').data('charts');
        if (charts) return charts.slice(-1)[0];
        else return '';
      },

      getInfoIdFromChart: function (cId) {
        return cId.split('-')[0] || '';
      },

      getActiveInfoId: function () {
        return _bd.spc.getInfoIdFromChart(_bd.spc.getActiveChart());
      },

      getLimitColInfo: function (data) {
        var lc = [], rsLc = [],
            $store = $('#bas-store'),
            infoId = _bd.spc.getActiveInfoId(),
            uvStore = $store.data('uv') || {},
            uv = uvStore[infoId];
        if (data) lc = data;
        else {
          var infoStore = $store.data('info'),
              info = infoStore[infoId];
          lc = $.parseJSON(info.LIMITCOL);
        }
        if (uv) {
          $.each(lc, function (i, v) {
            var tc = '.' + v.colId;
            $.each(uv, function (i2, v2) {
              if (v2.indexOf(tc) !== -1) {
                v.value = v2.split(':')[1];
                return 0;
              }
            });
            rsLc.push(v);
          });
          return rsLc;
        }
        return lc;
      },

      prepareRunById: function (infoId, canvasId) {
        return {
          runBy: 'id',
          infoId: infoId,
          canvasId: canvasId
        }
      },

      prepareRunByPara: function (data) {
        return {
          runBy: 'para',
          infoId: data.INFOID,
          chartType: data.CHARTTYPE,
          chartTitle: data.CHARTTITLE,
          tableId: $.parseJSON(data.TABLEID),
          relation: data.RELATION ? $.parseJSON(data.RELATION) : [],
          sqlWhere: $.parseJSON(data.SQLWHERE),
          axisX: $.parseJSON(data.AXISX),
          axisYL: $.parseJSON(data.AXISYL),
          axisYR: $.parseJSON(data.AXISYR),
          series: $.parseJSON(data.SERIES),
          uniqueCol: $.parseJSON(data.UNIQUECOL)
        };
      },

      getActiveChartUkValue: function() {
        var returnValue = [],
            canvasId = _bd.spc.getActiveChart();
        var canvasUV = $('#' + canvasId).data('uv');
        if (typeof(canvasUV) !== 'undefined') {
          $.each(canvasUV, function (indexParam, valueParam) {
            returnValue[indexParam] = valueParam;
          });
        }
        return returnValue;
      },

      goNext: function () {
        var canvasId = _bd.spc.getActiveChart(),
            infoId = _bd.spc.getInfoIdFromChart(canvasId),
            titleValue = $('#' + canvasId).data('teechart').title.text,
            ukValue = _bd.spc.getActiveChartUkValue(),
        p = {
              runBy: 'id',
              infoId: infoId,
              goType: '+1',
              canvasId: canvasId,
              value: ukValue
            };
        p.uniqueCol = $('#' + canvasId).data('uv');
        _bs.util.getBdgJSON('logic/getChartData', p, function (data) {
          if (data.exeresult === 'Success' && data.x.length > 0) {
            _bd.spc.doDrawChart(data);
            $('#bas-go-prev').attr('disabled', false);
          } else {
            $('#bas-go-next').attr('disabled', true);
            $('#bas-go-last').attr('disabled', true);
          }
        });
      },

      goPrev: function () {
        var canvasId = _bd.spc.getActiveChart(),
            infoId = _bd.spc.getInfoIdFromChart(canvasId),
            ukValue = _bd.spc.getActiveChartUkValue(),
            p = {
              runBy: 'id',
              infoId: infoId,
              goType: '-1',
              canvasId: canvasId,
              value: ukValue
            };
        p.uniqueCol = $('#' + canvasId).data('uv');
        _bs.util.getBdgJSON('logic/getChartData', p, function (data) {
          if (data.exeresult === 'Success' && data.x.length > 0) {
            _bd.spc.doDrawChart(data);
            $('#bas-go-next').attr('disabled', false);
            $('#bas-go-last').attr('disabled', false);
          } else {
            $('#bas-go-prev').attr('disabled', true);
          }
        });
      },

      overlapPrev: function (canvasId, goType, nowTimes, times) {
        var infoId = _bd.spc.getInfoIdFromChart(canvasId),
            p = {
              runBy: 'id',
              infoId: infoId,
              goType: goType,
              canvasId: canvasId
            };
        p.uniqueCol = $('#' + canvasId).data('uv');
        _bs.util.getBdgJSON('logic/getChartData', p, function (data) {
          if (data.exeresult === 'Success' && data.x.length > 0) {
            _bd.spc.doDrawChart(data);
            $('#bas-go-next').attr('disabled', false);
            $('#bas-go-last').attr('disabled', false);
            nowTimes++;
            if (nowTimes <= times) {  // 如果還有下一筆資料
              _bd.spc.doOverlap(nowTimes, times);
            } else {  // 全部的資料都處理完了
              $('#bas-go-overlap').attr('disabled', false); // 將鎖定的按鈕解開
            }
          } else {
            $('#bas-go-prev').attr('disabled', true);
          }
        });
      },

      goLast: function () {
        var canvasId = _bd.spc.getActiveChart(),
            infoId = _bd.spc.getInfoIdFromChart(canvasId),
            ukValue = _bd.spc.getActiveChartUkValue(),
            p = {
              runBy: 'id',
              infoId: infoId,
              goType: '+Z',
              canvasId: canvasId,
              value: ukValue
            };
        p.uniqueCol = $('#' + canvasId).data('uv');
        _bs.util.getBdgJSON('logic/getChartData', p, function (data) {
          if (data.exeresult === 'Success' && data.x.length > 0) {
            _bd.spc.doDrawChart(data);
            $('#bas-go-next').attr('disabled', true);
            $('#bas-go-prev').attr('disabled', false);
          }
          $('#bas-go-last').attr('disabled', true);
        });
      },

      genDefaultUV: function (canvasId) {
        var uv = $('#' + canvasId).data('uv');
        if (uv) {
          $.each(uv, function (i, v) {
            v.isUK = '1';
          });
        }
        return uv;
      },

      getParentInfo: function (canvasId) {
        var infoId = _bd.spc.getInfoIdFromChart(canvasId),
            storeInfo = $('#bas-store').data('info') || {},
            info = storeInfo[infoId];
        if (!info) {
          _bs.util.getBdgJSON('logic/getInfo', {infoId: infoId, needUK: 'true', uniqueCol: _bd.spc.genDefaultUV(canvasId)}, function (data) {
            if (data && data.length > 0) _bd.spc.storeInfo(data[0]);
          });
        }
      },

      storeInfo: function (data) {
        var $store = $('#bas-store'),
            info = $store.data('info') || {},
            infoId = data.INFOID;
        info[infoId] = data;
        $store.data('info', info);
      },

      defaultUKToObj: function (uk) {
        var rs = [];
        $.each(uk, function (i, v) {
          var col = v.split(':'),
              key = col[0].split('.'),
              rsItem = {
                table: key[0],
                colId: key[1],
                value: col[1]
              };
          rs.push(rsItem);
        });
        return rs;
      },

      storeUV: function (data) {
        var $canvas = $('#' + data.canvasid);
        $canvas.data('uv', _bd.spc.defaultUKToObj(data.defaultuk));
      },

      drawChart: function (canvasId, overlap) {
        var infoId = _bd.spc.getInfoIdFromChart(canvasId);
        _bs.util.getBdgJSON('logic/getChartData', _bd.spc.prepareRunById(infoId, canvasId), function (data) {
          if (data.x.length > 0) _bd.spc.doDrawChart(data);
          if (!overlap) _bd.spc.getParentInfo(canvasId);
        });
      },

      doDrawChart: function (data) {
        var uv = data.defaultuk;
        if (uv && uv.length > 0) {
          _bd.spc.storeUV(data);
        }
        data.charttitle = _bd.drawer.genChartTitle(data);
        $('#' + data.canvasid).data('teechart', _bd.drawer.tcLine(data));
      },

      aqChartPrev: function (row) {
        var canvasId = _bd.spc.getActiveChart(),
            infoId = _bd.spc.getInfoIdFromChart(canvasId),
            $store = $('#bas-store'),
            storeInfo = $store.data('info') || {},
            info = storeInfo[infoId],
            para = _bd.spc.prepareRunByPara(info);
        para.canvasId = canvasId;
        if (row) {
          var rsUV = [],
              uc = para.uniqueCol;
          $.each(uc, function (i, v) {
            var col = v.table + '.' + v.colId;
            rsUV.push(col + " = '" + row[v.colId.toUpperCase()] + "'");
          });
          para.sqlWhere = para.sqlWhere.concat(rsUV);
        }
        _bs.util.getBdgJSON('logic/getChartData', para, function (data) {
          var result = data.exeresult,
              $dialog = $('#' + _bd.spc.getChartIdFromCanvasId(data.canvasid));
          if (result === "Success") {
            if (data.x.length > 0) {
              _bd.spc.doDrawChart(data);
            }
          } else {
            console.log(data.exemsg);
            $dialog.dialog({title: '取得繪圖資料失敗！(F12查看錯誤訊息)'});
          }
        });
      },

      keepFace: function () {
        var faceInfo = _bd.spc.getFaceInfoArray();

        if (_bd.spc.checkUserInfoColFull(faceInfo)) {
          _bd.spc.isUserInfoColFull = false;
          _bd.spc.setFaceInfo(faceInfo);
        } else if (!_bd.spc.checkUserInfoColFull(faceInfo) && _bd.spc.isUserInfoColFull === false) {
          _bd.spc.isUserInfoColFull = true;
          // 只有第一次偵測到滿，才會警告
          alert("滿! 接下來不存資料庫");
        } else {
          _bd.spc.isUserInfoColFull = true;
        }
      },

      getFaceInfoArray: function () {
        var faceInfo = [],
            charts = $('#bas-store').data('charts');
        $.each(charts, function (idx, val) {
          var chartInfo,
              $canvas = $('#' + val);
          chartInfo = _bd.util.eleDataToObj($canvas);
          faceInfo.push(chartInfo);
        });
        return faceInfo;
      },

      /**
       *  回傳是否超過userInfo欄位長度(3000)，沒超過回傳true
       * @param faceInfo
       * @returns {boolean}
       */
      checkUserInfoColFull: function (faceInfo) {
        var infoStr = $.isArray(faceInfo) || $.isPlainObject(faceInfo) ? JSON.stringify(faceInfo) : faceInfo;
        return JSON.stringify(infoStr).length <= 3000;
      },

      reface: function () {
        _bd.spc.getFaceInfo(function(faceInfoData) {
          if (faceInfoData) {
            var parseFaceInfo = $.parseJSON($.parseJSON(faceInfoData.info));
            $.each(parseFaceInfo, function (idx, val) {
              var info = $.isPlainObject(val) ? val : $.parseJSON(val);
              if (info.groupId) {
                $.each(info.infos, function (ii, vi) {
                  var info_i = $.isPlainObject(vi) ? vi : $.parseJSON(vi);
                  _bd.spc.buildChart(false, info_i);
                });
              } else {
                _bd.spc.buildChart(false, info);
              }
            });
          }
        });
        //if (faceInfo) {
        //  $.each($.parseJSON(faceInfo), function (idx, val) {
        //    var info = $.isPlainObject(val) ? val : $.parseJSON(val);
        //    if (info.groupId) {
        //      $.each(info.infos, function (ii, vi) {
        //        var info_i = $.isPlainObject(vi) ? vi : $.parseJSON(vi);
        //        _bd.spc.buildChart(false, info_i);
        //      });
        //    } else {
        //      _bd.spc.buildChart(false, info);
        //    }
        //  });
        //}
      },

      markActiveChart: function (canvasId) {
        $('.ui-dialog-titlebar').css('background', '#deedf7');
        $('#' + canvasId).parent().prev().css('background', '#F7FC95');
      },

      touchChart: function () {
        var $go = $('.bas-go-func-btn'),
            canvasId = _bd.spc.getActiveChart(),
            $aqdv = $('#bdg-adv-query-dialog:visible');
        if (canvasId) {
          _bd.spc.markActiveChart(canvasId);
          $go.attr('disabled', false);
          if ($aqdv.length > 0) _bd.aq.setAdvQuery(_bd.spc.getLimitColInfo());
        }
      },

      addChart: function (canvasId) {
        var $store = $('#bas-store'),
            charts = $store.data('charts');
        if (charts) {
          charts.push(canvasId);
          $store.data('charts', charts);
        } else {
          $store.data('charts', [canvasId]);
        }
      },

      removeChart: function (canvasId) {
        if (canvasId) {
          var $store = $('#bas-store'),
              charts = $store.data('charts');
          $store.data('charts', $.grep(charts, function (val) {
            return val !== canvasId;
          }));
        }
      },

      reorgChartFace: function (canvasId) {
        _bd.spc.removeChart(canvasId);
        _bd.spc.addChart(canvasId);
        _bd.spc.keepFace();
      },

      overlapping: function (times) {
        $('#bas-go-overlap').attr('disabled', true);  // 鎖定[疊圖]按鈕，避免在處理過程中又被誤觸
        var start = 1;
        if (times === 0) {  // 如果想要疊圖的次數是零，則跳出
          return;
        }

        // 要先判斷有沒有資料，有資料才畫出圖表，若沒有先判斷資料有無，在沒有資料的時候buildChart會畫出空圖表
        // 先檢查第前times筆有沒有資料
        var canvasId = _bd.spc.getActiveChart(),
            infoId = _bd.spc.getInfoIdFromChart(canvasId),
            ukValue = _bd.spc.getActiveChartUkValue(),
            p = {
              runBy: 'id',
              infoId: infoId,
              goType: '-' + times,
              canvasId: canvasId,
              value: ukValue
            };
        p.uniqueCol = $('#' + canvasId).data('uv');
        _bs.util.getBdgJSON('logic/getChartData', p, function (data) {
          if (data.exeresult === 'Success' && data.x.length > 0) {  // 有資料
            _bd.spc.doOverlap(start, times);
          } else {  // 沒資料
            // 如果沒有資料的話，減少一筆再檢查看看
            _bd.spc.overlapping(times-1);
          }
        });
      },

      /**
       * 從第前nowTimes筆開始往前面的筆數製圖，畫times次
       * @param nowTimes
       * @param times
       */
      doOverlap: function (nowTimes, times) {
        var goType = '-' + nowTimes;

        // 要先判斷有沒有資料，有資料才畫出圖表，若沒有先判斷資料有無，在沒有資料的時候buildChart會畫出空圖表
        //var canvasId = _bd.spc.getActiveChart(),
        //    infoId = _bd.spc.getInfoIdFromChart(canvasId),
        //    ukValue = _bd.spc.getActiveChartUkValue(),
        //    p = {
        //      runBy: 'id',
        //      infoId: infoId,
        //      goType: goType,
        //      canvasId: canvasId,
        //      value: ukValue
        //    };
        //p.uniqueCol = $('#' + canvasId).data('uv');
        //_bs.util.getBdgJSON('logic/getChartData', p, function (data) {
        //  if (data.exeresult === 'Success' && data.x.length > 0) {  // 有資料
            _bd.spc.getFaceInfo(function (faceData) {
              if (faceData) {
                var parsedFaceData = $.parseJSON($.parseJSON(faceData.info));
                faceData = parsedFaceData.slice(-1)[0];
                faceData.overlap = true;
                faceData.goType = '-1'; // 每次往前一筆
                faceData.position.left = faceData.position.left - 20;
                // 把用來判斷是否要跑下一筆的nowTimes和times放到資料理面，讓_bd.spc.overlapPrev()使用
                faceData.nowTimes = nowTimes;
                faceData.times = times;
                _bd.spc.buildChart(true, faceData);
                //nowTimes++;
                //if (nowTimes <= times) {
                //  _bd.spc.doOverlap(nowTimes, times);
                //}
              }
              $('#bas-go-next').attr('disabled', false);
              $('#bas-go-last').attr('disabled', false);
            });
        //  }
        //});
      },

      resize: function (chartId, width, height) {
        var canvasId = _bd.spc.getCanvasIdFromChartId(chartId),
            tc = $('#' + canvasId).data('teechart');
        $('#' + chartId).width(width).height(height);
        tc.canvas.width = width;
        tc.canvas.height = height;
        tc.bounds.width = width;
        tc.bounds.height = height;
        tc.draw();
      },

      composeChartSize: function (width, height) {
        return width + 'x' + height;
      },

      chartSetting: function () {
        $('#bas-chart-setting-dialog').dialog({
          resizable: false,
          width: 600,
          height: 300,
          modal: true
        });
      },

      chartTransfer: function (type) {
        var store = _bd.spc.getActiveChart();
        _bd.drawer.tcTransfer('#' + store, type);
      },

      setZoneValue: function (zone, selectItem) {
        var $store = $('#bas-store'),
            charts = $store.data('charts');
        if (charts) {
          $.each(charts, function (idx, val) {
            $('#' + _bd.spc.getChartIdFromCanvasId(val)).remove();
          });
          $store.removeData('charts');
        }

        localStorage.setItem('zone', zone);
        _bd.spc.changeAreaType(selectItem);
        this.reface();
      },

      getZoneValue: function () {
        return localStorage.getItem('zone');
      },

      getFaceInfo: function (callback) {
        // should be got from backend
        var userId = 'archer',
            zone = this.getZoneValue() || 'A';
        //return localStorage.getItem(userId);
        _bd.spc.getUserInfoByid(userId, zone, callback);
      },

      getUserInfoByid: function(userId, zone, callback) {
        var getObjectName = {userId:userId, zone:zone};
        _bs.util.getJSON('userInfo/getUserInfoById', getObjectName, callback);
      },

      setFaceInfo: function (info) {
        var userId = 'archer', zone = this.getZoneValue() || 'A',
            infoStr = $.isArray(info) || $.isPlainObject(info) ? JSON.stringify(info) : info;
        //localStorage.setItem(userId, infoStr);
        _bd.spc.setUserInfos(userId, zone, infoStr);
      },

      setUserInfos: function (userId, zone, infoStr) {
        var saveObject = {userId:userId, zone:zone, info:infoStr};
        _bs.util.getJSON('userInfo/saveUserInfo', saveObject, function() {});
      },

      clearFace: function () {
        var $store = $('#bas-store'),
            charts = $store.data('charts');
        $.each(charts, function (idx, val) {
          $('#' + _bd.spc.getChartIdFromCanvasId(val)).dialog('close');
        });
        $store.removeData('charts');
        _bd.spc.setFaceInfo('');
      },

      genGroupId: function () {
        return "g" + (new Date()).getTime();
      },

      getDefaultGroupInfo: function (groupId, callback) {
        //var userId = 'archer';
        //return localStorage.getItem('basGroup-' + userId);
        var searchCondition = {};
        if (groupId !== undefined) {
          searchCondition.groupId = groupId;
          searchCondition.specifyGroupId = true;
        }
        return _bs.util.getJSON('userGroup/queryUserGroupByDefaultUser', searchCondition, callback);
      },

      setGroupInfo: function (groupId, groupName, group) {
        var userId = 'archer',
            groupStr = $.isArray(group) || $.isPlainObject(group) ? JSON.stringify(group) : group,
            saveGroupObject = {userId:userId, groupId:groupId, groupName:groupName, info:groupStr};
        //localStorage.setItem('basGroup-' + userId, groupStr);
        _bs.util.getJSON('userGroup/saveUserGroup', saveGroupObject, function() {});
      },

      groupNaming: function () {
        $('#bas-group-naming-modal').modal();
        $('#bas-group-id').val('');
        $('#bas-group-name').val('');
      },

      getGroupDesc: function (id, name) {
        var timeStamp = id.slice(1),
            date = _bd.util.getDateFromTS(timeStamp),
            time = _bd.util.getTimeFromTS(timeStamp);
        return '[群組: ' + name + '] ' + date + ' ' + time;
      },

      isGroup: function (id) {
        return id.slice(0, 1) === 'g';
      },

      grouping: function () {
        var //group = _bd.spc.getDefaultGroupInfo() || '[]',
            groupName = $('#bas-group-id').val().trim(),
            groupDesc = $('#bas-group-name').val().trim();
        if (!groupName) {
          $('#bas-group-naming-modal').find('.modal-title').css('color', 'red');
          return;
        }
        _bd.spc.getFaceInfo(function (data) {
          var face = $.parseJSON($.parseJSON(data.info));
          if (face && face.length > 0) {
            var info = {},
                $grid = $('#bas-info-grid'),
                groupId = _bd.spc.genGroupId();
            info.infoId = groupId;
            info.info = _bd.spc.getGroupDesc(groupId, groupName);
            $.each(face, function (i, v) {
              v.overlap = true;
            });
            $grid.gk('add', info);
            $grid.find('.jqgrow:last').data('info', face);
            info.face = face;
            // face group
            //group = $.parseJSON(group);
            //group.push(info);
            _bd.spc.setGroupInfo(groupName, groupDesc, info);
          }
        });

        $('#bas-group-naming-modal').modal('hide');
      },

      getUserGroupInfo: function() {
        var $grid = $('#bas-info-grid');
        $grid.gk('clear');
        // group
        //var groupDeferObj =
        _bd.spc.getDefaultGroupInfo(null, function (data) {
          if (data) {
            if (data.length > 0) {
              $.each(data, function (i, v) {
                v = $.parseJSON($.parseJSON(v.info));
                $grid.gk('add', v);
                $grid.find('.jqgrow:last').data('info', v.face);
              });
            }
          }
        });
        //groupDeferObj.then(function (data) {
        //  if (data) {
        //    if (data.length > 0) {
        //      $.each(data, function (i, v) {
        //        v = $.parseJSON($.parseJSON(v.info));
        //        $grid.gk('add', v);
        //        $grid.find('.jqgrow:last').data('info', v.face);
        //      });
        //    }
        //  }
        //});
      },

      queryGroupManagementInfo: function () {
        var $grid = $('#bas-query-group-info-grid');
        $('#bas-query-group-info-dialog').dialog({
          resizable: false,
          width: 950,
          height: 600,
          modal: true,
          buttons: {
            "儲存並開啟": function () {
              //_bd.reface.reface(true);
            },
            "開啟": function () {
              _bs.util.reface(false);
            },
            "取消": function () {
              $(this).dialog('close');
            }
          }
        });
        $grid.gk('width', 910);
        $grid.gk('height', 390);
        $grid.gk('clear');
        //$('.bdg-content a[href="#bdg-basic"]').trigger('click');
      },

      doQueryGroupInfo: function () {
        var $grid = $('#bas-query-group-info-grid');

        _bs.util.getJSON('userGroup/queryUserGroupByDefaultUser', _bs.util.getQueryGroupInfoParam('title'), function(data) {
          // 處理[內含資訊項]欄位資料
          $.each(data, function(i, v) {
            var info = $.parseJSON($.parseJSON(v.info));
            var totalInfo = "";
            $.each(info.face, function(faceIndex, faceValue) {
              totalInfo += "[" + faceValue.chartTitle + "] ";
            });
            data[i].TOTALINFO = totalInfo;
            //$grid.gk('add', data[i]);
            //$($('#bas-query-group-info-grid .jqgrow:last')[i]).data('info', info.face);
            //$grid.find('.jqgrow:last').data('info', info.face);
          });
          $grid.gk('clear');
          $grid.gk('add', data);
        });
        //returnDeferObj.then(function(data) {
        //  $.each(data, function(i, v) {
        //    var info = $.parseJSON($.parseJSON(v.info));
        //    var totalInfo = "";
        //    $.each(info.face, function(faceIndex, faceValue) {
        //      totalInfo += "[" + faceValue.chartTitle + "] ";
        //    });
        //    data[i].TOTALINFO = totalInfo;
        //    $grid.gk('add', data[i]);
        //    //$($('#bas-query-group-info-grid .jqgrow:last')[i]).data('info', info.face);
        //    $grid.find('.jqgrow:last').data('info', info.face);
        //  });
        //});
      },

      changeQueryGroupType: function (selectItem) {
        var $selectItem = selectItem;
        var $menuItem = $('#dropdownGroupTypeMenu');
        var $inputItem = $('#bas-query-group-info-group-name');
        var text = $selectItem.text;
        $menuItem.html(text + " <span class=\"caret\"></span>");
        if (text === '群組代號') {
          $menuItem.val('groupId');
        } else {
          $menuItem.val('groupName');
        }
        $inputItem.attr('placeholder', '請輸入' + text);
      },

      changeAreaType: function (selectItem) {
        var $selectItem = selectItem;
        var text = $selectItem.text;
        _bd.spc.setDropdownAreaType(text);
      },

      setDropdownAreaType: function (text) {
        var $menuItem = $('#bas-dropdown-area');
        $menuItem.html(text + " <span class=\"caret\"></span>");
      }
    }
  });
})();