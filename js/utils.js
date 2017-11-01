define('utils', [], function() {
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number]
            : match;
      });
    };
  }
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(suffix) {
      return this.indexOf(suffix) == 0;
    };
  }
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }

  if (!Array.prototype.map) {
    Array.prototype.map = function(callback) {
      var result = [];
      for (var idx in this) {
        result[idx] = callback(this[idx]);
      }
      
      return result;
    };
  }

  var enroll_tasks = ['welcomed', 'wechated', 'yyed', 'tested', 'bookordered'];

  return angular.module('UtilsModule', []).factory('utils', function($q) {
    return {
      countryLabels: window.countryData.getCountryMap(),
      us_states: {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
      },
      
      keys: function(map) {
        var result = [];
        for (var key in map) {
          var intKey = parseInt(key);
          result.push(isNaN(intKey) ? key : intKey);
        }
        
        return result;
      },
      values: function(map) {
        var result = [];
        for (var key in map) {
          result.push(map[key]);
        }
        
        return result;
      },
      positiveKeys: function(map) {
        var result = [];
        for (var key in map) {
          if (parseInt(key) > 0) result.push(key);
        }
        
        return result;
      },
      maxKey: function(map) {
        var result = 0;
        for (var key in map) {
          var intKey = parseInt(key);
          if (intKey > result) result = intKey;
        }
        
        return result;
      },
      any: function(map, test) {
        for (var key in map) {
          if (test(map[key])) return true;
        }
        
        return false;
      },
      map: function(arr, callback) {
        var result = [];
        for (var key in arr) {
          result.push(callback(arr[key]));
        }
        
        return result;
      },
      forEach: function(map, callback) {
        for (var key in map) {
          callback(map[key]);
        }
      },
      fold: function(map, callback, init) {
        var combined = init;
        for (var key in map) {
          combined = callback(map[key], combined);
        }
        return combined;
      },
      groupBy: function(arr, key) {
        var groups = {};
        for (var idx in arr) {
          var item = arr[idx];
          var value = item[key];
          var group = groups[value];
          if (!group) {
            group = groups[value] = {};
          }
          
          group[idx] = item;
        }
        
        return groups;
      },
      firstElement: function(arr, key, value) {
        for (var idx in arr) {
          if (arr[idx][key] == value) return arr[idx];
        }
        
        return null;
      },
      first: function(map) {
        for (var id in map) return map[id];
      },
      last: function(map) {
        var value;
        for (var id in map) value = map[id];
        return value;
      },
      isString: function(obj) {
        return obj instanceof String || typeof obj == 'string';
      },
      equalsIgnoreCase: function(str1, str2) {
        if (!str1 && !str2) return true;
        if (!str1 || !str2) return false;
        if (this.isString(str1) && this.isString(str2))
          return str1.toLowerCase() == str2.toLowerCase();
        return str1 == str2;
      },
      diff: function(orig, updated) {
        var changed = false;
        var result = {};
        for (var key in orig) {
          if ((orig[key] || updated[key]) &&
              !this.equalsIgnoreCase(orig[key], updated[key])) {
            result[key] = orig[key];
            changed = true;
          }
        }
        
        updated.oldData = result;
        updated.changed = changed;
        return changed;
      },
      removeWhere: function(list, test) {
        for (var key in list) {
          if (test(list[key])) {
            delete list[key];
          }
        }
      },
      count: function(list, test) {
        var total = 0;
        for (var key in list) {
          if (test(list[key])) ++total;
        }
        
        return total;
      },
      mix_in: function(dst, src) {
        for (var key in src) {
          dst[key] = src[key];
        }
        return dst;
      },
      toList: function(map) {
        var list = [];
        for (var key in map) {
          list.push(map[key]);
        }
        
        return list;
      },
      redirect: function(url) {
        window.location.href = url;
      },
      login: function() {
        var index = location.pathname.lastIndexOf("/") + 1;
        var filename = location.pathname.substr(index);
        location.href = 'login.html?redirect=' + filename;
      },
      refresh: function() {
        window.location.reload();
      },
      getWeeklyTime: function(time, week) {
        var date = time ? this.toDateTime(time) : this.getDefaultStartTime();
        date.setDate(date.getDate() + 7 * week);
        return date.toLocaleString();
      },
      toDateTime: function(unixtimestamp) {
        return new Date(unixtimestamp * 1000);
      },
      getDefaultStartTime: function() {
        var date = new Date();
        var month = date.getUTCMonth();
        
        month = month < 5 ? 5 : 11;
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(2);
        date.setUTCMonth(month);
        
        return date;
      },
      /// Returns the date after 7*26 days of the start time.
      getEndTime: function(scheduleGroup) {
        var startDate = this.toDateTime(scheduleGroup.start_time);
        var endTerm = new Date(startDate.getTime());
        // Each term lasts for 26 weeks.
        var weeks = this.keys(scheduleGroup.schedules).length - 1;
        endTerm.setDate(startDate.getDate() + 7 * weeks + 1);
        return this.unixTimestamp(endTerm);
      },
      /// Given a date like 2015-12-05 18:00:00, returns 2015-12-01 00:00:00,
      /// a date like 05-28, returns 06-01.
      roundToDefaultStartTime: function(unixtimestamp) {
        var date = this.toDateTime(unixtimestamp);

        var month = date.getUTCMonth();
        month = Math.abs(month - 5) <= 2 ? 5 : 11;
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(2);
        date.setUTCMonth(month);
        
        return this.unixTimestamp(date);
      },
      nextTerm: function(date, direction) {
        var next = new Date(date.getTime());
        next.setUTCMonth(date.getUTCMonth() + direction * 6);
        return next;
      },
      isHolidayWeek: function(startTime, week) {
        var firstHalf = new Date(startTime*1000).getMonth() == 5;
        if (firstHalf) {
          return week == 17 || week == 24;
        } else {
          return week == 3 || week == 10;
        }
      },
      classTemplate : function() {
        return {
          id: 0,
          department_id: 0,
          name: '新班级模板',
          email: '',
          class_room: '',
          teacher_id: 0,
          start_year: (new Date()).getFullYear(),
          perm_level: 0
        };
      },
      isEmpty: function(map) {
        if (!map || map instanceof String || typeof(map) == 'string') {
          return true;
        }

        for (var key in map) {
          if (map[key]) return false;
        }
        
        return true;
      },
      where: function(map, test) {
        var result = {};
        for (var key in map) {
          var value = map[key];
          if (test(value)) result[key] = value;
        }
        
        return result;
      },
      unixTimestamp: function(date) {
        return Math.floor(date.getTime() / 1000);
      },
      makeBits: function(bits) {
        var value = 0;
        for (var index = 0;index < bits.length; index++) {
          value |= (bits[index] ? (1<<index) : 0);
        }
        return value;
      },
      isBitSet: function(bits, index) {
        return (bits & (1<<index)) != 0;
      },
      setBit: function(bits, index) {
        return bits | (1<<index);
      },
      clearBit: function(bits, index) {
        return bits & ~(1<<index);
      },
      getUSStateCode: function(state) {
        for (var code in this.us_states) {
          if (this.us_states[code] == state) return code;
        }
      },
      setCountryLabels: function(user) {
        var index = window.countryData.getCountryIndex(user.country);
        user.countryLabel = window.countryData.countries[index];
        user.state = parseInt(user.state);
        user.stateLabel =
          window.countryData.getState(index, user.state);
        if (user.country == 'US') {
          user.stateLabel = this.getUSStateCode(user.stateLabel);
        }
      },
      sexLabels: ['女', '男'],
      levelLabels: ['', '美容顾问', '正品授权', '一级代理', '总监', '官方'],
      getDisplayLabel: function(user, key) {
        return this[key+'Labels'][user[key]] || '';
      },
      getClassLabel: function(classInfo) {
        return (classInfo.name || '') + (classInfo.time || '').replace(/:00$/, '');
      },
      getNextName: function(name) {
        var match = /([^0-9]*)([0-9]+)(.*)/.exec(name);
        if (!match) return name;
        
        return match[1] + (parseInt(match[2])+1) + match[3];
      },
      formatDate: function(dateString) {
        var parts = dateString.split('-');
        return parts[0] + '年' + (parseInt(parts[1])||1) + '月' + 
            (parseInt(parts[2])||1) + '日';
      },
      truePromise: function() {
        return $q(function(resolve) {
          resolve(true);
        });
      },
      /// Calls the first asynchronous function from the list of [requests], 
      /// then calls the next one once it's done, and so on. The chain
      /// terminates after all promises resolve with a true value, or any of
      /// of them fails (resolves with a false value).
      ///
      /// Returns a promise that is resolved after the last request is done.
      requestOneByOne: function(requests) {
        var index = 0;
        var that = this;
        var onError = function() {
          return false;
        };
        var next = function(previousResponse) {
          if (!previousResponse) {
            return false;
          }
          var fn = requests[index++];
          // Always return a promise so that 'then' is called even [requests]
          // is empty.
          return fn ? fn().then(next, onError) : that.truePromise();
        };
        return next(true);
      },
      validateTaskInput: function(task, data) {
        if (task.duration && task.sub_tasks) {
          if (data.duration < data.count * 30) {
            alert('每次观修时间不少于30分钟，{0}次一共至少要{1}分钟'.format(
                data.count, data.count * 30));
            return false;
          } else if (data.duration > data.count * 180) {
            alert('观修{0}次一共{1}分钟，是不是太夸张了？'.format(
                data.count, data.duration));
            return false;
          }
        }
        if (task.lastRecord && data.count == task.lastRecord.count &&
            this.unixTimestamp(new Date()) - task.lastRecord.ts < 10) {
          alert('刚提交过一模一样的报数，请勿重复提交');
          return false;
        }
        return true;
      },
      /// Given a schedule group, calculates the unix timestamp of the middle
      /// of its term.
      getMidTerm: function(scheduleGroup) {
        var startDate = this.toDateTime(scheduleGroup.start_time);
        var midTerm = new Date(startDate.getTime());
        midTerm.setDate(startDate.getDate() + 7 * 12);
        return this.unixTimestamp(midTerm);
      },
      toGuanxiuHour: function(minutes) {
        return Math.min(minutes/60.0, this.maxGuanxiuTime).toFixed(1);
      },
      /// Given a string [data], creates a data url.
      ///
      /// The previously created data url is stored in [file] and will be
      /// destroyed.
      createDataUrl: function(data, file) {
        data = new Blob([data], {type: 'text/plain'});
        if (file) window.URL.revokeObjectURL(file);
        return file = window.URL.createObjectURL(data);
      },

      // Index of bit in the user.enroll_tasks bits.
      // Indicating whether welcome letter is sent.
      welcomeIndex: 0,
      // Indicating whether the user joined wechat group.
      wechatIndex: 1,
      // Indicating whether yy client is installed.
      yyIndex: 2,
      // Indicating whether yy client is tested.
      yyTestIndex: 3,
      // Indicating whether book order is placed (or omitted).
      bookOrderIndex: 4,
      // Indicating whether the student is in the workshop class.
      workshopIndex: 5,
      // Indicating whether the student is permanent or not.
      permanentIndex: 6,
      // Indicating whether the student is self learning or not.
      selfLearningIndex: 7,
      // Indicating whether the student don't practice.
      wensiIndex: 8,
      
      weeksOfTerm: 26,
      totalTerms: 12,
      // The zb system enforce a cap of the maximum guanxiu hours. 
      maxGuanxiuTime: 25.5,
      // A lot of people were not able to report their tasks
      // in time. Add this extra 15 days to avoid a zero number.
      extraReportTime: 3600 * 24 * 15
    };
  });
});
