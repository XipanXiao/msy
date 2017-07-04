<?php
  // This file must be include first if session is needed since it
  // outputs a cookie to the header.
  $config = null;
  
  /// Given "${HOSTNAME}", return getenv("HOSTNAME");
  function replace_variables($subject) {
    return preg_replace_callback("/\\$\\{(\w+)\\}/", function($matches) {
      return getenv($matches[1]);
    }, $subject);
  }
  
  function replace_config_variables($config) {
    $result = new stdClass();
    foreach (((array)$config) as $key => $value) {
      $result->$key = replace_variables($value);
    }
    
    return $result;
  }
  
  function read_config() {
    global $config;
    
    if ($config) {
      return $config;
    }
    
    if (isset($_SESSION['config'])) {
      $config = unserialize($_SESSION['config']);
    } else {
      $config = (array)json_decode(file_get_contents('../data/config.php'));
      
      $config = empty($config[$_SERVER['HTTP_HOST']]) ?
          $config["localhost"] : $config[$_SERVER['HTTP_HOST']];
    
      $config = replace_config_variables($config);
    }

    if (isset($config->session_path)) {
      session_save_path($config->session_path);
    }

    $session_timeout = sprintf('%d', 3600 * 24 * 30);
    ini_set('session.gc_maxlifetime', $session_timeout);
    ini_set('session.cookie_lifetime', $session_timeout);
    ini_set('session.cookie_httponly', "1");

    if ($config->origin_whitelist) {
    	$origin = getallheaders()["Origin"];
    	if ($config->origin_whitelist != "*" && 
    			$config->origin_whitelist != $origin) {
    		return $config;
    	}
      header("Access-Control-Allow-Origin: ". $origin);
      header("Access-Control-Allow-Credentials: true");
      header("Access-Control-Allow-Headers: Content-Type, Authorization, ".
          "Content-Length, X-Requested-With, X-Prototype-Version, ".
          "Origin, Allow, *");
      header("Access-Control-Allow-Methods: GET,PUT,POST,DELETE,OPTIONS,HEAD");
      header("Access-Control-Max-Age: ". $session_timeout);
    }
    session_start();
    return $config;
  }

  read_config();
?>
