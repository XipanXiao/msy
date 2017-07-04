define('permission', ['utils'], function() {

  return angular.module('PermissionModule', ['UtilsModule']).factory('perm',
      function(utils) {
    return {
      user: null,
      ROLES: {
        STUDENT: 0x3,
        TEACHER: 0x7,
        LEADER: 0xF,
        YEAR_LEADER: 0x3F,
        INSPECTION: 0x57,
        FINANCE: 0x103,
        ORDER_MANAGER: 0x303,
        ADMIN: 0xFFFF
      },
      permissions: {
        0xFFFF: '管理员',  //rw all data
        0x303: '订单管理', //00 11 00 00 00 11 rw orders.
        0x103: '财务',    //00 01 00 00 00 11 rw orders, but sees no addresses.
        0x57: '理事会', // 00 00 01 01 01 11 r
        0x3F: '年级组长', // 00 00 00 11 11 11 rw classes of the year
        0xF: '组长',    //  00 00 00 00 11 11 rw class data
        0x7: '辅导员',    //00 00 00 00 01 11 rw own data, read classes.
        0x3: '学员',    //  00 00 00 00 00 11 rw own data
        0: '所有人'
      },
      isAdmin: function() {
        return this.user && (this.user.permission & 5) == 5;
      },
      /// Class leaders (and below) should see only classes of the same year.
      checkClass: function(user, classInfo) {
        return (user.permission & this.ROLES.LEADER) == this.ROLES.LEADER &&
            user.classInfo.id == classInfo.id;
      },
      checkYear: function(user, classInfo) {
        return (user.permission & this.ROLES.YEAR_LEADER) == 
          this.ROLES.YEAR_LEADER &&
          user.classInfo.start_year == classInfo.start_year;
      },
      canWrite: function(classInfo) {
        if (!this.user || !classInfo) return false;
        if (this.isSysAdmin()) return true;

        if (!classInfo.perm_level) {
          return true;
        }

        var perm = this.user.permission >> ((classInfo.perm_level - 1) * 2);
        if (!(perm & 2)) return false;
        
        return this.checkClass(this.user, classInfo) ||
            this.checkYear(this.user, classInfo);
      },
      level: function(permission) {
        var result = 0;
        for (;permission > 0; result++) {
          permission = (permission >> 2);
        }
        
        return result;
      },
      lowerPermissions: function() {
        var that = this;
        return utils.where(utils.keys(this.permissions), function(perm) {
          return that.canGrant(perm);
        });
      },
      canGrant: function(perm) {
        if (!this.user) return false;
        return (this.user.permission & perm) == perm;
      },
      isYearLeader: function() {
        return this.user && 
            (this.user.permission & this.ROLES.YEAR_LEADER) == 
                this.ROLES.YEAR_LEADER;
      },
      isSysAdmin: function() {
        return this.user && 
            (this.user.permission & this.ROLES.ADMIN) == this.ROLES.ADMIN;
      },
      isOrderAdmin: function() {
        return this.user && 
            ((this.user.permission & this.ROLES.FINANCE) == this.ROLES.FINANCE);
      }
    };
  });
});
