define('learning_records/learning_records', [
    'navigate_bar/navigate_bar', 'services', 'utils',
    'zb_sync_button/zb_sync_button'], function() {
  return angular.module('LearningRecordsModule', ['NavigateBarModule',
      'ServicesModule',
      'UtilsModule',
      'ZBSyncButtonModule'])
    .directive('learningRecords',
        function(rpc, utils) {
          return {
            scope: {
              attendence: '@',
              classId: '='
            },
            link: function($scope) {
              $scope.attendOptions = ['缺席', '出席', '请假'];
              $scope.vacation = function(schedule) {
                return !parseInt(schedule.course_id); 
              };

              $scope.$watch('classId', function() {
                $scope.reload();
              });
              
              $scope.reload = function(term) {
                rpc.get_schedules($scope.classId, term || 0, 'class')
                    .then(function(response) {
                  var group = utils.first(response.data.groups);
                  if (!group) return;

                  $scope.term = group.term;
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = response.data.users;
                });
              };
              
              $scope.reportTask = function(user, course_id) {
                var record = user.records[course_id];
                record.student_id = user.id;
                record.course_id = course_id;
                rpc.report_schedule_task(record).then(function(response) {
                  if (!parseInt(response.data.updated)) {
                    $scope.reload($scope.term);
                  }
                });
              };

              $scope.navigate = function(direction) {
                var term = $scope.term;
                switch (direction) {
                case 0:
                case 2:
                  term = 0;
                  break;
                case 1:
                case -1:
                  term = $scope.term + direction;
                  break;
                case -2:
                  term = 1;
                  break;
                }
                $scope.reload(term);
              };

              $scope.exportCourse = function(group, course_ids, secondary) {
                var data = '';
                utils.forEach(course_ids, function(course_id) {
                  data += '\t' + group.courses[course_id].name + '\t';
                });
                data += '\n';
                utils.forEach($scope.users, function(user) {
                  data += user.name;
                  utils.forEach(course_ids, function(course_id) {
                    var record = user.records[course_id];
                    var video = (record && record.video) ? '' : '未听';
                    var text = (record && record.text) ? '' : '未看';
                    data += '\t' + video + '\t' + text;
                  });
                  data += '\n';
                });
                if (secondary) {
                  $scope.exportedRecords2 = utils.createDataUrl(data,
                      $scope.exportedRecords2);
                } else {
                  $scope.exportedRecords = utils.createDataUrl(data,
                      $scope.exportedRecords);
                }
              };
              $scope.getCourses = function(group, secondary) {
                var isNotVacation = function(schedule) {
                  return !$scope.vacation(schedule);
                };
                var getCourseId = function(schedule) {
                  return secondary && schedule.course_id2 || schedule.course_id;
                };
                return utils.map(utils.where(group.schedules, isNotVacation),
                    getCourseId);
              };
              $scope.export = function() {
                utils.forEach($scope.schedule_groups, function(group) {
                  var course_ids = $scope.getCourses(group);
                  $scope.exportCourse(group, course_ids);
                  if (!parseInt(group.course_group2))
                    return;
                  var course_ids2 = $scope.getCourses(group, true);
                  $scope.exportCourse(group, course_ids2, true);
                });
              };
            },
            templateUrl : 'js/learning_records/learning_records.html?tag=201705242138'
          };
        });
});
