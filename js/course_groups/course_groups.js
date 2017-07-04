define('course_groups/course_groups',
    ['services', 'permission', 'utils'], function() {
	return angular.module('CourseGroupsModule', ['ServicesModule',
      'PermissionModule',
      'UtilsModule'])
		.directive('courseGroups',
				function(rpc, perm, utils) {
					return {
					  scope: {
					    groupId: '=',
					    onChange: '&'
					  },
					  link: function($scope) {
					    $scope.selected = {id: 0};
					    
					    $scope.isSysAdmin = function() {
					      return perm.isSysAdmin();
					    };

              rpc.get_course_groups().then(function(response) {
                $scope.course_groups = response.data;
                $scope.groupIds = utils.positiveKeys($scope.course_groups);
                $scope.select($scope.groupId);
              });

              $scope.$watch('groupId', function() {
                $scope.select($scope.groupId);
              });  

              $scope.expand = function() {
                document.querySelector('#course-editor-dlg').open();
              };
              
              $scope.select = function(id) {
                if (!$scope.course_groups) return;

                $scope.selected.id = id;
                $scope.group = $scope.course_groups[id];

                if (!id) return;
                
                $scope.groupId = id;

                var course_group = $scope.course_groups[id];
                if (course_group.courses) {
                  $scope.onChange({courses: course_group.courses});
                } else {
                  rpc.get_courses(id).then(function(courses) {
                    $scope.course_groups[id].courses = courses;
                    $scope.onChange({courses: courses});
                  });
                }
              };
					  },
						templateUrl : 'js/course_groups/course_groups.html?tag=201705252126'
					};
				});
});
