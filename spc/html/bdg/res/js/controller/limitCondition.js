/**
 * Created by I27160 on 2014/12/16.
 */

angular.module('bdgApp').controller('limitConCtrl', dataSetCtrlFunction);
function dataSetCtrlFunction($scope,$icscRest){
  'use strict';

  $scope.onResize = function(event){
    var width = $scope.win2.size().width*0.95,
        height = $scope.win2.size().height*0.95;
    $scope.c3Chart.chart.resize({width:width,height:height});
  };
  $scope.chartPrev = {
    ukText:'',
    show:function(){
      var info = $scope.saveInfo.params(),
          chartTitle =$scope.activeDataCom.comTitle,
          width = $(window).width()*0.6,
          height = $(window).height()*0.6;
      info.runBy = 'para';

       
      $icscRest.post('bdg/logic/getChartData',info).success(function (data, status, headers){
        var result = data.exeresult;
         
        if (result === "Success") {
          var ukList = data.defaultuk;
          if(ukList.length>0) $scope.chartPrev.getUkText(ukList);
          $scope.win2.setOptions({title:chartTitle,width:width,height:height,actions: [
            "Minimize",
            "Maximize",
            "Close"
          ]});
          $scope.win2.center();
          $scope.win2.open();
          $scope.c3Chart.draw(data);

        } else {
          console.log(data.exeMsg);
          $scope.win2.setOptions({title:'取得繪圖資料失敗！(F12查看錯誤訊息)'});
          $scope.msg('取得繪圖資料失敗！(F12查看錯誤訊息)');
          $scope.c3Chart.$hide();
        }
      });

    },
    getUkText:function(ukList){
      var ukCol='';
      $.each(ukList,function(i,v){
        ukCol += v +',';
      });
      ukCol = ukCol.slice(0,ukCol.length-1);
      $scope.chartPrev.ukText = ukCol;
    }
  };
  $scope.c3Chart = {
    chart:{},
    chartList:[],
    titleX:'',
    titleY:'',
    chartInfo: function(){
      return {
        bindto: '#c3Chart',
        legend: {
          position: 'bottom'
        },
        size:{
          width: $scope.win2.size().width*0.85,
          height: $scope.win2.size().height*0.85
        },
        data: {
          x: 'x',
          columns: $scope.c3Chart.chartList,
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
              text: $scope.c3Chart.titlex,
              position: 'outer-center'
            },
            type: 'category'
          },
          y: {
            label: {
              text: $scope.c3Chart.titleyl,
              position: 'outer-middle'
            }
          }
        }
      }
    },
    draw: function(chartInfo){
      this.transferYData(chartInfo);
      $scope.c3Chart.chart = c3.generate($scope.c3Chart.chartInfo());
      $scope.onResize();
    },
    transferYData: function (chartInfo) {
       
      var c = [],
          xd = [],
          x  = chartInfo.x,
          yl = chartInfo.yl,
          yr = chartInfo.yr;
      if (x){
        xd.push('x');
        xd=xd.concat(x);
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
      //if(yr){
      //  $.each(yr, function (i, v) {
      //    var yrd = [];
      //    yrd.push(i);
      //    yrd = yrd.concat($.parseJSON(v));
      //    c.push(yrd);
      //  });
      //}
      chartInfo.columns = c;
      $scope.c3Chart.titlex = chartInfo.titlex;
      $scope.c3Chart.titleyl =  chartInfo.titleyl;
      $scope.c3Chart.titleyr =  chartInfo.titleyr;
      $scope.c3Chart.chartList = chartInfo.columns;
    }
  };



}
