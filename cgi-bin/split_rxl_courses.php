<?php
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

/// Update the schedules with the specified the group id, with a secondary
/// course.
function update_courses_for_schedules($schedule_group_id, $course_ids) {
	global $medoo;
	
	echo "Updating second courses for schedules" . "<br>";
	
	$schedules = $medoo->select("schedules", "*",
			["group_id" => $schedule_group_id]);
	
	$index = 0;
	foreach($schedules as $schedule) {
		if (!intval($schedule["course_id"])) continue;

		$schedule["course_id"] = $course_ids[$index++];
		$schedule["course_id2"] = $course_ids[$index++];
		
		if (!update_schedule($schedule)) {
			echo get_db_error();
			echo "Failed to update schedule: ". $schedule["id"] . "<br>";
			return;
		}
	}
}

/// Returns an array of course ids of the primary and secondary course groups.
function merge_courses($course_group, $course_group2) {
	$courses = get_courses($course_group);
	$courses2 = get_courses($course_group2);
	
	return array_merge(array_keys($courses), array_keys($courses2));
}

/// For all schedule groups whose course_group is the specified value,
/// update their primary and secondary course group to $course_groups[0]
/// and $course_groups[1]. Updates their corresponding schedules.
function change_course_groups($course_group, $course_groups) {
	global $medoo;
	
	$groups = $medoo->select("schedule_groups", ["id"],
			["course_group" => $course_group]);
	$course_ids = merge_courses($course_groups[0], $course_groups[1]);

	foreach($groups as $group) {
		$group["course_group"] = $course_groups[0];
		$group["course_group2"] = $course_groups[1];
		if (!update_schedule_group($group)) {
			echo "Failed to update schedule group: " . $group["id"] . "<br>";
			return;
		}
		update_courses_for_schedules($group["id"], $course_ids);
	}
}

function copy_learning_records($from_course_id, $to_course_id) {
	global $medoo;
	
	$records = $medoo->select("schedule_records", "*",
			["course_id" => $from_course_id]);
	
	foreach($records as $record) {
		$record["course_id"] = $to_course_id;
		$medoo->insert("schedule_records", $record);
	}

	$records = $medoo->select("schedule_records", "*",
			["course_id" => $to_course_id]);
	echo "". count($records) . " records copied<br>";
}

/// Given courses with names 入行论广解1-2, 入行论广解3-4, ...
/// return an array of names like:
///     [入行论广解1, 入行论广解2, 入行论广解3, 入行论广解4, ...];
function split_names($courses) {
	$names = [];
	foreach ($courses as $course) {
		$name = $course["name"];
	
		$name1 = preg_replace_callback("/(\d+)-(\d+)/", function($matches) {
			return intval($matches[1]);
		}, $name);
	
		$name2 = preg_replace_callback("/(\d+)-(\d+)/", function($matches) {
			return intval($matches[2]);
		}, $name);

		array_push($names, $name1);
		array_push($names, $name2);
	}
	return $names;
}

function delete_courses($course_group) {
	$courses = get_courses($course_group);
	foreach ($courses as $id => $course) {
		if (!remove_course($id)) {
			echo "Failed to remove ". $course["name"]. "<br>";
		}
	}
	if (!remove_course_group($course_group)) {
		echo "Failed to remove course group". $course_group. "<br>";
	}
}

function fix_double_course_group($course_group) {
	$courses = get_courses($course_group);
	if (empty($courses)) {
		echo "already split<br>";
		exit();
	}

	$names = split_names($courses);

	$group = get_course_groups()[$course_group];
	
	/// Create 2 new course groups and their courses;
	$new_course_group_ids = [];

	for ($groupIndex = 0; $groupIndex < 2; $groupIndex ++) {
		// Create a new course group and save its id in the new ids array.
		$group["id"] = 0;
		$group = update_course_group($group);
		$new_course_group_ids[$groupIndex] = $group["id"];

	  echo "Created new course group with id: ". $group["id"]. "<br>";
	}

	// Split each course to 2 courses, under the 2 new created course groups.
	$index = 0;
	$offset = count($courses);
	foreach ($courses as $course_id => $course) {
		$course_name = $course["name"];
		echo "<br>spliting " . $course_name. "<br>";
	  for ($groupIndex = 0; $groupIndex < 2; $groupIndex ++) {

	  	$course = ["id" => 0,
	  			"group_id" => $new_course_group_ids[$index < $offset ? 0 : 1], 
	  	  	"name" => $names[$index++]
	  	];

		  echo 'inserting new course: '. $course["name"] . " to group " .
		      $course["group_id"] . "<br>";
		  $course = update_course($course);
		  if (empty($course)) {
		    echo "Failed to create course: " . $course["id"] . " " .
			    	$course["name"] . "<br>";
		    return;
	    }

	    // For each new created course, copy its schedule record reports.
	    echo "Copying schedule records from ". $course_name.
	        " to " . $course["name"]. "...";
	    copy_learning_records($course_id, $course["id"]);
  	}
	}

	change_course_groups($course_group, $new_course_group_ids);
	delete_courses($course_group);
}

if (empty($_SESSION["user"])) {
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();

  $groups = [1, 13];
  foreach ($groups as $group) {
  	fix_double_course_group($group);
  }
}
?>
