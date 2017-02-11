/**
 * Created by I27160 on 2014/12/1.
 */

var _bdg = {
  constants: {
   MASTER_PAGE_FIXED_HEIGHT: 227
  },
  uiGridOpts: {
   multiSelect: false,
   enableFiltering: true,
   enableColumnResizing: true,
   enableCellEditOnFocus: true,
   enableRowHeaderSelection: false,
   //enableHorizontalScrollbar: 2,
   enableVerticalScrollbar : 2
  },
  util: {
   validateNum: function (evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
     theEvent.returnValue = false;
     if (theEvent.preventDefault) theEvent.preventDefault();
    }
   },
   showScroll: function (target) {
    $(target).css('overflow', 'auto');
   },
   hideScroll: function (target) {
    $(target).css('overflow', 'hidden');
   },

   adjustSize: function (selector, height, width) {
    var $target = $(selector);
    if (height) $target.height(height);
    if (width) $target.width(width);
   },
   detectHeight: function (selector, deduction) {
    return selector === 'window' ? $(window).height() - deduction : $(selector).height() - deduction;
   },

   detectWidth: function (selector, deduction) {
    return selector === 'window' ? $(window).width() - deduction : $(selector).width() - deduction;
   },
   sessionTimeout: function (data) {
    var warning = data._gk_js_;
    if (warning && warning.indexOf("sessionTimeOutHandler") !== -1) return true;
    return false;
   },
   objToEleData: function ($ele, obj) {
    if (obj) {
     $.map(obj, function (val, key) {
      $ele.data(key, val);
     });
    }
   },
   eleDataToObj: function ($ele) {
    var obj = {},
        data = $ele.data();
    if (data) {
     $.map(data, function (val, key) {
      if (!(val instanceof Tee.Chart)) obj[key] = val;
     });
    }
    return obj;
   },
   isOp: function (data) {
    var ops = "+-*/^";
    return ops.indexOf(data.slice(-1)) !== -1;
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
   },
   isStrDataType: function (data) {
    var strTypes = ['string', 'varchar', 'varchar2', 'char', 'datetime', 'text'];
    return strTypes.indexOf(data.toLowerCase()) !== -1;
   },
   getRandomColor: function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
     color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
   },
   setAxisData: function (type, data) {
    $.each(data, function (idx, val) {
     val.axis = type;
    });
    return data;
   },
   getGrain: function (selector) {
    var $grain = $(selector).find('tr:eq(1)>td:eq(0)');
    return {
     width: $grain.outerWidth(),
     height: $grain.outerHeight()
    };
   },
   roundFloat: function (number, precision) {
    return Math.round(Math.round(number * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
   },
   getDateFromTS: function (ts) {
    return $.datepicker.formatDate("yymmdd", new Date(Number(ts)));
   },
   getTimeFromTS: function (ts) {
    var date = new Date(Number(ts));
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
   },
   getDateStr: function (date) {
    return date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
   },
   getHMTimeStr: function (date) {
    return ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
   },
   getHMSTimeStr: function (date) {
    return ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2);
   },
   setAxisFromIndex:function(type,data){
    switch(data){
     case 1:
      if(type === 0){
        return 'X';
      }else{
       return 'X軸';
      }


     case 2:
      if(type === 0) {
       return 'YL';
      }else{
       return 'Y軸(左側)';
     }

     case 3:
      if(type === 0) {
       return 'YR';
      }else{
       return 'Y軸(右側)';
     }

     case 4:
      if(type === 0) {
       return 'SERIES';
      }else{
       return '系列';
      }

    }
   },
   convertAxesFunc:function(val){
    switch(val.func){
     case 1:
      val.func = "SUM";
      break;
     case 2:
      val.func = "AVG";
      break;
     case 3:
      val.func = "MIN";
      break;
     case 4:
      val.func = "MAX";
      break;
    }
   }
  }
 };
