<?php
include_once 'config.php';
include_once 'class_prefs.php';
include_once 'tables.php';
include_once 'permission.php';

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

$student_id = $user->id;

/// Whether the current [$user] has permission to read [$another] or not.
function canReadUser($another) {
  global $user;

  return canRead($user, $another->classInfo);
}

/// Whether [$another] is at the same class year of the current [$user].
function isSameYear($another) {
  global $user;
  $classId = $another["classId"];
  $classes = get_classes(["id" => $classId]);
  return $classes[$classId]["start_year"] == $user->classInfo["start_year"];
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];

  if ($resource_id == "user_names") {
    $response = get_user_names($_GET["prefix"], $user->id);
  } elseif ($resource_id == "users") {
    $id = empty($_GET["id"]) ? null : $_GET["id"];
    $email = empty($_GET["email"]) ? null : $_GET["email"];
    
    if ($email) {
      $response = current(get_users($email));
      if ($response && !canReadUser($response)) {
        $response = null;
      }
    } elseif ($id) {
      $response = get_user_by_id($id);
      unset($response["password"]);
    } elseif (!empty($_GET["agent_id"])) {
      $response = get_users(null, $_GET["agent_id"]);
    } else {
      $user = current(get_users($user->email));
      // Refresh the session user data every time the user access the home page.
      $_SESSION["user"] = serialize($user);
      $response = $user;
    }
  } elseif ($resource_id == "search") {
    if (isYearLeader($user)) {
      $response = search($_GET["prefix"]);
      if (!empty($response) && !isSysAdmin($user)) {
        // For year leaders they can only see students of the same year.
        $response = array_filter($response, "isSameYear");
      }
    }
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];

  if (isSysAdmin($user) || isYearLeader($user)) {
    error_log($user->email. " UPDATES ". $resource_id. ":". 
        (empty($_POST["id"]) ? "" : $_POST["id"]));
  }

  if ($resource_id == "user") {
    if (!isAgent($user) && intval($_POST["id"]) != intval($user->id)) {
      $response = permision_denied_error();
    } else {
      if (!empty($_POST["level"]) && intval($_POST["level"]) > $user->level) {
        $_POST["level"] = $user->level;
      } 
      if (!empty($_POST["permission"])) {
        $perm = $_POST["permission"];
        if ($perm < 0) {
          exit();
        } elseif ($perm > $user->permission) {
          $perm = $user->permission;
        }
        $_POST["permission"] = $user->permission;
      } 
      $result = update_user($_POST);
      if ($result && $result->id == $user->id) {
        $user = $result;
        $_SESSION['user'] = serialize($user);
      }
    
      $response = ["updated" => $result];
      if (!$result) {
        $response["error"] = get_db_error();
      }
    }
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];

  if ($resource_id == "user") {
    $userId = $_REQUEST["id"];

    $userToDelete = get_user_by_id($userId);
    if ($user->id == intval($userToDelete["agent_id"])) {
      error_log($user->email. " DELETE ". $userToDelete["email"]. " ". $userId);
      error_log(json_encode($userToDelete));
  
      $response = ["deleted" => remove_user($userId)];
    } else {
      $response = permision_denied_error();
    }
  }
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
    $response["error"] = get_db_error();
  }

  echo json_encode($response);
}
?>
