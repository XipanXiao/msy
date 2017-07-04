<?php
/*
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

function getUSStateIndex($code) {
  $us_states = [
		"AL"=> "Alabama",
		"AK"=> "Alaska",
		"AS"=> "American Samoa",
		"AZ"=> "Arizona",
		"AR"=> "Arkansas",
		"CA"=> "California",
		"CO"=> "Colorado",
		"CT"=> "Connecticut",
		"DE"=> "Delaware",
		"DC"=> "District of Columbia",
		"FM"=> "Federated States Of Micronesia",
		"FL"=> "Florida",
		"GA"=> "Georgia",
		"GU"=> "Guam",
		"HI"=> "Hawaii",
		"ID"=> "Idaho",
		"IL"=> "Illinois",
		"IN"=> "Indiana",
		"IA"=> "Iowa",
		"KS"=> "Kansas",
		"KY"=> "Kentucky",
		"LA"=> "Louisiana",
		"ME"=> "Maine",
		"MH"=> "Marshall Islands",
		"MD"=> "Maryland",
		"MA"=> "Massachusetts",
		"MI"=> "Michigan",
		"MN"=> "Minnesota",
		"MS"=> "Mississippi",
		"MO"=> "Missouri",
		"MT"=> "Montana",
		"NE"=> "Nebraska",
		"NV"=> "Nevada",
		"NH"=> "New Hampshire",
		"NJ"=> "New Jersey",
		"NM"=> "New Mexico",
		"NY"=> "New York",
		"NC"=> "North Carolina",
		"ND"=> "North Dakota",
		"MP"=> "Northern Mariana Islands",
		"OH"=> "Ohio",
		"OK"=> "Oklahoma",
		"OR"=> "Oregon",
		"PW"=> "Palau",
		"PA"=> "Pennsylvania",
		"PR"=> "Puerto Rico",
		"RI"=> "Rhode Island",
		"SC"=> "South Carolina",
		"SD"=> "South Dakota",
		"TN"=> "Tennessee",
		"TX"=> "Texas",
		"UT"=> "Utah",
		"VT"=> "Vermont",
		"VI"=> "Virgin Islands",
		"VA"=> "Virginia",
		"WA"=> "Washington",
		"WV"=> "West Virginia",
		"WI"=> "Wisconsin",
		"WY"=> "Wyoming"
	];
  
  $s = "Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming";
  $stateList = explode('|', $s);
  $state = $us_states[$code];
  if (empty($state)) return -1;
  
  return array_search($state, $stateList);
}

if (empty($_SESSION["user"])) {
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();

  $medoo->update("users", ["country" => "US"], ["country" => null]);
  $users = $medoo->select("users", ["id", "email", "state"]);
  foreach ($users as $user) {
  	if (empty($user["state"])) continue;

  	$index = getUSStateIndex($user["state"]);
  	if ($index < 0) {
  		echo "state look up failed for ". $user["email"] . " " . $user["state"] . "<BR>";
  	} else {
  	  if (!$medoo->update("users", ["state" => $index], ["id" => $user["id"]])) {
  		  echo "failed to update for ". $user["id"] . "<br>";
  	  }
  	}
  }
}
*/
?>
