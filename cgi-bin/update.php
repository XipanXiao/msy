<?php
/*
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

if (empty($_SESSION["user"])) {
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();

  $conn = get_connection ();
  $commands = file_get_contents("../data/update.sql");
  date_default_timezone_set("UTC");
  
  $conn->multi_query($commands);
  $lines = explode(";", $commands);
  $commands_succeeded = 0;
  while ($result = $conn->next_result()) {
    $commands_succeeded ++;
    echo $lines[$commands_succeeded] . "<BR>";
  }
  
  echo "Executed ". $commands_succeeded. " commands <BR>";
  echo $conn->error . "<BR>";
  
  $conn->close();
}
*/
?>
