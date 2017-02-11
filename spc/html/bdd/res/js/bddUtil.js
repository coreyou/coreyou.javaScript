(function () {
  "use strict";
  $.extend(_bdd, {
    util: {
      validateNum: function (evt) {
        var theEvent = evt || window.event;
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]|\./;
        if(!regex.test(key)) {
          theEvent.returnValue = false;
          if(theEvent.preventDefault) theEvent.preventDefault();
        }
      },

      isOp: function (data) {
        var ops = ['+', '-', '*', '/', '^'];
        return $.inArray(data, ops) !== -1;
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
        var t = ['STRING', 'VARCHAR', 'VARCHAR2', 'CHAR', 'DATETIME', 'TEXT'];
        return $.inArray(data.toUpperCase(), t) !== -1;
      },

      roundFloat: function (number, precision) {
        return Math.round(Math.round(number * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
      },

      getDateStr: function (date) {
        return date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
      },

      getHMTimeStr: function (date) {
        return ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
      },

      getHMSTimeStr: function (date) {
        return ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2);
      }

    }
  });
})();