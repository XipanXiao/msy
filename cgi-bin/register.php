<?php
include_once 'config.php';
include_once 'connection.php';
include_once 'class_prefs.php';
include_once 'tables.php';
include_once 'util.php';

if (!empty($_POST["id"])) exit();

if(! empty ( $_POST ['email'] ) && ! empty ( $_POST ['name'] )) {
  session_write_close();
  
  if (empty($_POST["g-recaptcha-response"]) ||
      !checkCaptcha($_POST["g-recaptcha-response"])) {
    header('Content-Type: text/html; charset=utf-8');
    echo "请通过验证码测试，确认您不是机器人。";
    exit();
  }
  
  $password = md5 ( $_POST ['password'] );  
  $users = get_users($_POST['email']);
  
  if (sizeof($users) > 0) {
    header('Content-Type: text/html; charset=utf-8');
  	echo "<h1>Error</h1>";
    echo "该地址". $_POST["email"]. "已经注册，请勿重复注册。如忘记密码请联系组长。";
    exit();
  }

  date_default_timezone_set("UTC");
  $user = update_user($_POST);
  if (!$user) {
    echo "<h1>Error</h1>";
    echo "<p>Failed to register ".$_POST["email"]. get_db_error();
    exit();
  }
    
  session_start();
  $_SESSION['user'] = serialize($user);
 
  $url = sprintf("../registered.html?name=%s&email=%s", $user->name,
      $user->email);
  header("Location: ". $url);
}
?>
