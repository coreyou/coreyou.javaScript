var _bd = {};
(function () {
  "use strict";
  $.extend(_bd, {
    drawer: {
      genChartTitle: function (data) {
        var ukStr = '';
        var defUV = data.defaultuk;
        if (defUV) {
          $.each(defUV, function (idx, val) {
            ukStr += val.replace(/.*?\./g, '') + ', '
          });
          ukStr = ukStr.slice(0, -2);
        }
        return ukStr || data.charttitle;
      },

      getLegend: function (data) {
        var series = '',
            ys = data.split('_');
        if (ys.length > 2) {
          series += '(';
          $.each(ys.slice(2), function (idx, val) {
            series += val + '-';
          });
          series = series.slice(0, -1) + ')';
        }
        return ys[1] + series;
      },

      draw: function (data) {
        switch (data.chartType.toLowerCase()) {
          case "line":
            return _bd.drawer.tcLine(data);
          case "gauge":
            return _bd.drawer.gauge(data);
          default:
            return "";
        }
      },

      redraw: function (store, data) {
        var tc = $(store).data('teechart'),
            width = data.width,
            height = data.height;
        if (width) {
          width = width - 50;
          tc.canvas.width = width;
          tc.bounds.width = width;
        }
        if (height) {
          height = height - 120;
          tc.canvas.height = height;
          tc.bounds.height = height;
        }
        tc.draw();
      },

      designLine: function (data) {
        var chart = new Tee.Chart(data.canvasId),
            left = chart.axes.left,
            right = chart.axes.right,
            bottom = chart.axes.bottom,
            x = data.X || {},
            yl = data.YL || {},
            yr = data.YR || {},
            $box = $(data.box),
            width = $box.width() - 5,
            height = data.box === '#bdg-adv-chart-prev-dialog' ? $box.height() - 10 : $box.height() - 50;

        $.each(yl, function (i, v) {
          var ylv = v;
          if (typeof v === "string") ylv = $.parseJSON(v);
          var line = new Tee.Line(ylv);
          line.title = _bd.drawer.getLegend(i);
          if (ylv.length < 30) chart.addSeries(line).pointer.visible = true;
          else chart.addSeries(line);
        });
        left.format.stroke.fill = "red";
        left.title.text = data.titleYL;

        $.each(yr, function (i, v) {
          var yrv = v;
          if (typeof v === "string") yrv = $.parseJSON(v);
          var line = new Tee.Line(yrv);
          line.vertAxis = 'right';
          line.title = _bd.drawer.getLegend(i);
          if (yrv.length < 30) chart.addSeries(line).pointer.visible = true;
          else chart.addSeries(line);
        });
        right.title.text = data.titleYR;

//        left.setMinMax(0, 9000);
//        left.increment = 500;
//        left.labels.ongetlabel = function (value, s) {
//        };

//        bottom.automatic = true;
//        bottom.setMinMax(10, 60);
//        bottom.increment = 10;
        bottom.title.text = data.titleX;
        chart.series.items[0].data.labels = x;
//        chart.axes.bottom.labels = x;
//        bottom.labels.rotation = -20;

        chart.title.text = data.chartTitle;
        chart.title.format.font.style = "18px sans-serif";
        chart.legend.legendStyle = "series";
        chart.legend.padding = 1;

        chart.canvas.width = width;
        chart.canvas.height = height;
        chart.bounds.width = width;
        chart.bounds.height = height;

        chart.draw();
        return chart;
      },

      tcLine: function (data) {
        var chart = new Tee.Chart(data.canvasid),
            left = chart.axes.left,
            right = chart.axes.right,
            bottom = chart.axes.bottom,
            x = data.x || {},
            yl = data.yl || {},
            yr = data.yr || {},
            size = data.chartsize,
            $box = $('#bdg-data-view-dialog');

        $.each(yl, function (i, v) {
          var ylv = v;
          if (typeof v === "string") ylv = $.parseJSON(v);
          var line = new Tee.Line(ylv);
          line.title = _bd.drawer.getLegend(i);
          if (ylv.length < 30) chart.addSeries(line).pointer.visible = true;
          else chart.addSeries(line);
        });
        left.format.stroke.fill = "red";
        left.title.text = data.titleyl;

        $.each(yr, function (i, v) {
          var yrv = v;
          if (typeof v === "string") yrv = $.parseJSON(v);
          var line = new Tee.Line(yrv);
          line.vertAxis = 'right';
          line.title = _bd.drawer.getLegend(i);
          if (yrv.length < 30) chart.addSeries(line).pointer.visible = true;
          else chart.addSeries(line);
        });
        right.title.text = data.titleyr;

        bottom.title.text = data.titlex;
        chart.series.items[0].data.labels = x;
//        bottom.labels.rotation = -20;

        chart.title.text = data.charttitle;
        chart.title.format.font.style = "18px sans-serif";
        chart.legend.legendStyle = "series";
        chart.legend.padding = 1;

        chart.draw();
        return chart;
      },
      
      line: function (data) {
        var chart = new Tee.Chart(data.canvasId),
            left = chart.axes.left,
            bottom = chart.axes.bottom,
            line1 = new Tee.Line([5000, 2000, 1289, 3278, 7901, 1234]);

//        line1.data.labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        line1.data.labels = ['6/1', '6/2', '6/3', '6/4', '6/5', '6/6'];
        line1.vertAxis = 'right';
        line1.title = '測試1';
        chart.addSeries(line1);

        var line2 = new Tee.Line([1029, 3049, 2087, 4099, 5999, 7111]);
        var line3 = new Tee.Line([1000, 1000, 1000, 1000, 1000, 1000]);
        line2.title = '測試2';
        line3.title = '基準線';
//        line2.data.labels = ['6/1', '6/2', '6/3', '6/4', '6/5', '6/6'];
        chart.addSeries(line2);
        chart.addSeries(line3);
        chart.addSeries(new Tee.Line(['4001', '4989', '5222', '8798', '2101', '9086'])).visible = true;

//        chart.series.items[0].format.stroke.size = 3;
      
        left.format.stroke.fill = "red";
        left.title.text = "數值";
        left.setMinMax(0, 9000);
        left.increment = 500;
//        left.labels.ongetlabel = function (value, s) {
//          debugger;
//        };

//        bottom.automatic = true;
//        bottom.setMinMax(10, 60);
//        bottom.increment = 10;
        bottom.title.text = "時間";
        bottom.labels.rotation = -20;
//        bottom.labels.ongetlabel = function (value, s) {
//          console.log(value);
//          return value * 10;
//        };
      
        chart.title.text = data.chartName;
        chart.palette = ['red', 'purple', 'green'];
        chart.title.format.font.style = "18px sans-serif";
      
        chart.series.items[3].title = "Green";
      
        // Null values, skip by default
        chart.series.items[0].treatNulls = "skip";
        chart.series.items[1].treatNulls = "skip";
        chart.series.items[2].treatNulls = "skip";
        chart.series.items[3].treatNulls = "skip";
      
        chart.draw();
        return chart;
      },

      gauge: function (data) {
        var Chart1 = new Tee.Chart(data.canvasId);

        Chart1.legend.visible = false;
        Chart1.title.text = data.chartName;
        Chart1.panel.format.gradient.colors = ["#101010", "white"];
        //Chart1.panel.transparent=true;

        var gauge = Chart1.addSeries(new Tee.CircularGauge());
        gauge.value = 30;
        gauge.format.font.style = "12px Arial";
        gauge.animate.duration = 250; // msec
        gauge.onchange = function (g) {
//          if (slider) {
//             slider.position=g.value;
//             slider.label.text=g.value.toFixed(0);
//             Config1.draw();
//          }
        };

        gauge.units.text = "Km/h";
        //gauge.ticks.stroke.size=3;
        gauge.center.gradient.colors[1] = "black";
        gauge.center.gradient.direction = "radial";

        // Cosmetic shadow:
        gauge.format.shadow.width = 0;
        gauge.format.shadow.height = 0;
        gauge.format.shadow.color = "gray";
        gauge.format.shadow.blur = 10;

        var ranges = [
          {value: 10, fill: "green"},
          {value: 60, fill: "yellow"},
          {value: 100, fill: "red"}
        ];
        gauge.ticksBack.ranges = ranges;
        Chart1.draw();
        return Chart1;
      },

      tcTransfer: function (store, type) {
        var tc = $(store).data('teechart'),
          legend = tc.legend,
          items = legend.chart.series.items,
          charts = [];
        $.each(items, function (i, v) {
          var values = v.data.values,
              item = new Tee[type](values);
          item.data.labels = v.data.labels;
          item.title = v.title;
          item.vertAxis = v.vertAxis;
          item.visible = v.visible;
          if (type === 'Line' && values.length < 30) item.pointer.visible = true;
          charts.push(item);
        });
        $.each(items, function () {
          legend.chart.removeSeries();
        });
        $.each(charts, function (i, v) {
          legend.chart.addSeries(v);
        });
        tc.draw();
      }

    }
  });
})();
