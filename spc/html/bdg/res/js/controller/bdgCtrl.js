/**
 * Created by I25834 on 2014/8/26.
 */
angular.module('bdgApp').controller('bdgCtrl', function ($rootScope, $http) {

  $rootScope.dataViewDialogTitle = '資料預覽';
  $rootScope.lineProcess = {
    active: true
  };
  $rootScope.statProcess = {
    active: false,
    showStatTable: false,
    dataBtnLabel: '分佈圖型'
  };
  $rootScope.domainOpts = {
    opts: [
      {value: 'S', label: 'S-銷售'},
      {value: 'T', label: 'T-質量'},
      {value: 'I', label: 'I-存貨'},
      {value: 'M', label: 'M-採購'},
      {value: 'A', label: 'A-財會'}
    ],
    selected: "S"
  };
  $rootScope.keywordOpts = {
    opts: [
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
    selected: "1"
  };

  $rootScope.setChartType = function (type) {
    $rootScope.chartType = type;
    if ('Line' === type) {
      $rootScope.lineProcess.active = true;
      $rootScope.statProcess.active = false;
    } else {
      $rootScope.lineProcess.active = false;
      $rootScope.statProcess.active = true;
    }
  };

  $rootScope.statDataPrev = function () {
    if ($rootScope.statProcess.dataBtnLabel === '分佈圖型') {
      $rootScope.groupCountChartPrev();
    } else {
      _bd.designer.dataPrev();
    }
  };

  $rootScope.statSetup = function ($event) {
    var $dialog = $('#bdg-stat-setup-dialog');
    $dialog.dialog({
      resizable: false,
      width: 580,
      height: 300,
      modal: true,
      buttons: {
        "確定": function () {
          $rootScope.getCSCStat();
          $(this).dialog('close');
        }
      }
    });
    $dialog.closest('.ui-dialog').offset({top: $event.clientY, left: $event.clientX});
  };

  $rootScope.getCSCStat = function () {
    var params;
    _bd.designer.storeDataExtract();
    params = _bd.reface.getCountDataInfo();
    params.LL = $rootScope.statProcess.ll;
    params.UL = $rootScope.statProcess.ul;
    // info verify -- check the parameters
    var verify = _bd.designer.infoVerify(params);
    if (!verify.approved) {
      bootbox.alert(verify.warning);
      return;
    }
    $http.post('bdgcStat.getCSCStat', params).success(function (data) {
      $rootScope.setStatValue(data);
    });
  };

  $rootScope.countChartPrev = function () {
    var params;
    _bd.designer.storeDataExtract();
    params = _bd.reface.getCountDataInfo();
    // info verify -- check the parameters
    var verify = _bd.designer.infoVerify(params);
    if (!verify.approved) {
      bootbox.alert(verify.warning);
      return;
    }
    $http.post('bdgcStat.getCountData', params).success(function (data) {
      data.canvasId = 'bdg-chart-view-canvas';
      $rootScope.countChartView(data);
    });
  };

  $rootScope.setStatValue = function (data) {
    $rootScope.statMin = data.Min;
    $rootScope.statMax = data.Max;
    $rootScope.statMean = data.Avg;
    $rootScope.statMedian = data.Median;
    $rootScope.statMju = data.Mju;
    $rootScope.statRange = data.Range;
    $rootScope.statVariance = data.Vari;
    $rootScope.statStdev = data.Sd;
    $rootScope.statPP = data.PP;
    $rootScope.statPPK = data.PPK;
    $rootScope.statCa = data.Ca;
    $rootScope.statT = data.T;
  };

  $rootScope.groupCountChartPrev = function () {
    var params;
    _bd.designer.storeDataExtract();
    params = _bd.reface.getCountDataInfo();
    // info verify -- check the parameters
    var verify = _bd.designer.infoVerify(params);
    if (!verify.approved) {
      bootbox.alert(verify.warning);
      return;
    }
    $http.post('bdgcStat.getStatGroupSugg', params).success(function (data) {
      data.canvasId = 'bdg-chart-view-canvas';
      $rootScope.setStatValue(data);
      $rootScope.groupCountChartView(data);
      $rootScope.statProcess.showStatTable = true;
      $rootScope.statProcess.dataBtnLabel = '資料預覽';
    });
  };

  $rootScope.countChartView = function (data) {
    var $dialog = $('#bdg-data-view-dialog');
    $dialog.dialog({
      width: 950,
      height: 650,
      modal: true,
      title: '計數分佈圖型'
    });
    $('#bdg-data-view').hide();
    $('#bdg-chart-view').show();
    $rootScope.drawCount(data);
  };

  $rootScope.groupCountChartView = function (data) {
    var $dialog = $('#bdg-data-view-dialog');
    $dialog.dialog({
      width: 950,
      height: 650,
      modal: true,
      title: '計數分佈圖型'
    });
    $('#bdg-data-view').hide();
    $('#bdg-chart-view').show();
    $rootScope.drawSuggGroupCount(data);
  };

  $rootScope.drawCount = function (data) {
    var chart = new Tee.Chart(data.canvasId),
        left = chart.axes.left,
        bottom = chart.axes.bottom,
        x = {}, y = [],
        c = data.exeData || {},
        titleX = '',
        $box = $('#bdg-data-view-dialog'),
        width = $box.width() - 5,
        height = $box.height() - 115;

    $.each(c, function (i, v) {
      if (i === 'COUNT') {
        y = v;
        if (typeof v === "string") y = $.parseJSON(v);
        var bar = new Tee.Bar(y);
        bar.title = _bd.drawer.getLegend(i);
        bar.barSize = 100;
        bar.marks.visible = false;
        chart.addSeries(bar);
      } else {
        titleX = i;
        x = v;
      }
    });
    left.format.stroke.fill = "red";
    left.title.text = '計數';

    bottom.title.text = titleX;
    chart.series.items[0].data.labels = x;

    // Count Statistical Line
    if (y) {
      var m = j$.mean(y),
          sd = j$.stdev(y),
          max = j$.max(y),
          seqL = j$.seq(1, m, 50),
          mp = Math.floor(max / j$.normal.pdf(m, m, sd)),
          line, lineLData = [], lineRData, lineData = [];
      $.each(seqL, function (i, v) {
        var pdf = j$.normal.pdf(v, m, sd) * mp;
        lineLData.push(pdf);
        lineData.push(pdf);
      });
      lineRData = lineLData.reverse();
      lineRData.shift();
      lineData = lineData.concat(lineRData);
      line = new Tee.Line(lineData);
      line.smooth = 0.5;
      line.horizAxis = 'top';
      chart.axes.top.labels.visible = false;
      chart.axes.top.grid.visible = false;
      chart.addSeries(line).pointer.visible = false;
//      $rootScope.setStatNum(y);
    }

    chart.title.text = data.chartTitle;
    chart.title.format.font.style = "18px sans-serif";
    chart.legend.legendStyle = "series";
    chart.legend.padding = 1;
    chart.legend.visible = false;

    chart.canvas.width = width;
    chart.canvas.height = height;
    chart.bounds.width = width;
    chart.bounds.height = height;

    chart.draw();
    return chart;
  };

  $rootScope.drawSuggGroupCount = function (data) {
    var chart = new Tee.Chart(data.canvasId),
        left = chart.axes.left,
        bottom = chart.axes.bottom,
        x = {}, y = [],
        titleX = '',
        $box = $('#bdg-data-view-dialog'),
        width = $box.width() - 5,
        height = $box.height() - 165;

    if (data.groupCount) {
      x = data.groupRange;
      y = data.groupCount;
      if (typeof y === "string") y = $.parseJSON(y);
      var bar = new Tee.Bar(y);
//      bar.title = _bd.drawer.getLegend(i);
      bar.barSize = 100;
      bar.marks.visible = false;
      chart.addSeries(bar);
    }
    left.format.stroke.fill = "red";
    left.title.text = '計數';

    bottom.title.text = titleX;
    chart.series.items[0].data.labels = x;

    // Count Statistical Line
    if (y) {
      var m = data.Avg,
          sd = data.Sd,
          max = j$.max(y),
          seqL = j$.seq(0, m, 30),
//          mp = Math.floor(max / j$.normal.pdf(m, m, sd)),
          line, lineLData = [], lineRData, lineData = [];
      $.each(seqL, function (i, v) {
        var pdf = j$.normal.pdf(v, m, sd);
        lineLData.push(pdf);
        lineData.push(pdf);
      });
      lineRData = lineLData.reverse();
      lineRData.shift();
      lineData = lineData.concat(lineRData);
      line = new Tee.Line(lineData);
      line.smooth = 0.5;
      line.horizAxis = 'top';
      line.vertAxis = 'right';
      chart.axes.top.labels.visible = false;
      chart.axes.top.grid.visible = false;
      chart.axes.right.labels.visible = false;
      chart.axes.right.grid.visible = false;
      chart.addSeries(line).pointer.visible = false;
//      $rootScope.setStatNum(y);
    }

    chart.title.text = data.chartTitle;
    chart.title.format.font.style = "18px sans-serif";
    chart.legend.legendStyle = "series";
    chart.legend.padding = 1;
    chart.legend.visible = false;

    chart.canvas.width = width;
    chart.canvas.height = height;
    chart.bounds.width = width;
    chart.bounds.height = height;

    chart.draw();
    return chart;
  };

  $rootScope.setStatNum = function (val) {
    $rootScope.statMin = j$.min(val);
    $rootScope.statMax = j$.max(val);
    $rootScope.statMean = j$.mean(val);
    $rootScope.statMedian = j$.median(val);
    $rootScope.statMode = j$.mode(val);
    $rootScope.statRange = j$.range(val);
    $rootScope.statVariance = j$.variance(val);
    $rootScope.statStdev = j$.stdev(val);
  };

});
