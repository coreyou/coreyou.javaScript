/**
 * Created by I25834 on 2014/9/1.
 */
(function () {
  "use strict";
  $.extend(_bd, {
    stat: {
      beta: function () {
        var info = _bd.reface.getDataPrevInfo();
        $('#bdg-pdf-chart-dialog').dialog({
          modal: true,
          resizable: false,
          width: 'auto',
          height: 'auto'
        });
        _bd.util.getJSON('bdgcLogicBean.getChartData', info, function (rs) {
          var result = rs.exeResult,
              $dialog = $('#bdg-pdf-chart-dialog');
          if (result === "Success") {
            var y = [], yMean, yStdev,
                opts = {beta : {}},
                currentPlot = {
                  data : ['pdf']
                };
            $.each(rs.YL, function (i, v) {
              y = $.parseJSON(v);
              return 0;
            });
            yMean = j$.mean(y);
            yStdev = j$.stdev(y);
            rs.canvasId = 'bdg-pdf-chart-view-canvas';
            _bd.stat.drawPdf(rs);
          } else {
            $dialog.dialog({title: data.exeMsg});
          }
        });
      },

      drawPdf: function (data) {
        var chart = new Tee.Chart(data.canvasId),
            left = chart.axes.left,
            right = chart.axes.right,
            bottom = chart.axes.bottom,
            x = data.X || {},
            yl = data.YL || {},
            yr = data.YR || {},
            betaVal;

        $.each(yl, function (i, v) {
          var ylv = v;
          if (typeof v === "string") ylv = $.parseJSON(v);
          var bar = new Tee.Bar(ylv);
          bar.title = _bd.drawer.getLegend(i);
          bar.barSize = 100;
          bar.marks.visible = false;
          chart.addSeries(bar);
        });
        left.format.stroke.fill = "red";
        left.title.text = data.titleYL;

        $.each(yr, function (i, v) {
          var yrv = v;
          if (typeof v === "string") yrv = $.parseJSON(v);
          var bar = new Tee.Bar(yrv);
          bar.vertAxis = 'right';
          bar.title = _bd.drawer.getLegend(i);
          bar.barSize = 100;
          chart.addSeries(bar);
        });
        right.title.text = data.titleYR;

        bottom.title.text = data.titleX;
        chart.series.items[0].data.labels = x;

        // Distribution
        betaVal = chart.series.items[0].data.values;
        if (betaVal) {
          var m = j$.mean(betaVal),
              s = j$.stdev(betaVal),
              v = j$(j$.min(betaVal), j$.max(betaVal), betaVal.length, function (xp) {
                return xp;
              });
          var line = new Tee.Line(betaVal);
          line.smooth = 0.5;
          chart.addSeries(line).pointer.visible = false;
        }

        chart.title.text = data.chartTitle;
        chart.title.format.font.style = "18px sans-serif";
        chart.legend.legendStyle = "series";
        chart.legend.padding = 1;

        chart.draw();
        return chart;
      },

      pdf: function () {
        var info = _bd.reface.getDataPrevInfo();
        $('#bdg-pdf-chart-dialog').dialog({
          modal: true,
          resizable: false,
          width: 'auto',
          height: 'auto'
        });
        // using the first YL data
        _bd.util.getJSON('bdgcLogicBean.getChartData', info, function (rs) {
          var result = rs.exeResult,
              $dialog = $('#bdg-pdf-chart-dialog');
          if (result === "Success") {
            var y = [], yMean, yStdev,
                opts = {beta : {}},
                currentPlot = {
                  data : ['pdf']
                },
                data = [], i = 0;
            $.each(rs.YL, function (i, v) {
              y = $.parseJSON(v);
              return 0;
            });
            yMean = j$.mean(y);
            yStdev = j$.stdev(y);
            opts.beta = {
              inst : jStat.beta(yMean, yStdev),
              pdf : { label : 'PDF' },
              cdf : { label : 'CDF' },
              options : {
                start: -20,
                stop: 20
              }
            };
            currentPlot.dist = opts.beta;
            for ( ; i < currentPlot.data.length; i++ ) {
              currentPlot.dist[ currentPlot.data[ i ]].data = currentPlot.dist.inst[ currentPlot.data[ i ]];
              data.push( currentPlot.dist[ currentPlot.data[ i ]]);
            }
            j$.flot('#bdg-pdf-chart-view', data, currentPlot.dist.inst);
          } else {
            $dialog.dialog({title: data.exeMsg});
          }
        });
      }

    }
  });
})();