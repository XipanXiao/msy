<?php
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

if(!empty($_POST["email"])) {
  $password = 
      empty($_POST["password"]) ? NULL : md5($_POST["password"]);  
  $user = get_user($_POST["email"]);
  
  if ($user) {
    $authenticated = (empty($password) && empty($user->password)) ||
        $password == $user->password;
    if (!$authenticated) {
      echo "<h1>Error</h1>";
      echo "<p>Password does not match.</p>";
      exit();
    }

    $user->password = null;
    $_SESSION["user"] = serialize($user);
    
    $page = empty($_POST["redirect-url"]) 
        ? "order.html"
        : $_POST["redirect-url"];

    header("Location: ../". $page);
  } else {
    echo "<h1>Error</h1>";
    echo "<p>Sorry, your account could not be found.".
        "Please <a href=\"../login.html\">click here to try again</a>.</p>";
  }
}
?>
