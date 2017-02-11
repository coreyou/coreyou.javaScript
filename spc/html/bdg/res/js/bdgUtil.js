(function () {
  "use strict";
  $.extend(_bd, {
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

      getURL: function (eventId) {
        var url,
            loc = location,
            eventName = '/event/put/bd/',
            eventGrain = eventId.split('/'),
            pathGrain = loc.pathname.split('/');
        if (eventGrain[0] === 'http:') {
          url = eventId;
        } else {
          url = loc.protocol + '//' + loc.host + '/erp/' + pathGrain[1] + eventName + eventId + '.go';
        }
        return url;
      },

      sessionTimeout: function (data) {
        var warning = data._gk_js_;
        if (warning && warning.indexOf("sessionTimeOutHandler") !== -1) return true;
        return false;
      },
      
      getJSON: function (eventId, param, callback) {
        $.ajax({
          type: "POST",
          url: _bd.util.getURL(eventId),
          contentType: "application/x-www-form-urlencoded;charset=UTF-8",
          dataType: "json",
          data: 'json&j={"i":' + encodeURIComponent(JSON.stringify(param)) + ', "t": "map"}',
          success: function (data) {
            if (_bd.util.sessionTimeout(data)) {
              var msg = "您的連線已經逾時，請重新登入！";
              if (bootbox) bootbox.alert(msg);
              else alert(msg);
            } else callback(data);
          },
          error: function (xhr, status, error) {
            console.log(error);
          }
        });
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

      getAxisName: function (key) {
        switch (key) {
          case "X":
            return "X軸";
          case "YL":
            return "Y軸(左側)";
          case "YR":
            return "Y軸(右側)";
          case "S":
            return "系列";
        }
      },

      getAxisKey: function (name) {
        switch (name) {
          case "X軸":
            return "X";
          case "Y軸(左側)":
            return "YL";
          case "Y軸(右側)":
            return "YR";
          case "系列":
            return "S";
        }
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
      }

    }
  });
})();