<?php

const DATA_DIR = "/home/galus/var/";
date_default_timezone_set("Europe/Warsaw");
$sep = chr(31); // Because of unknown characters in HTTP_USER_AGENT.

function post($s) {
     return ((empty($_POST[$s])) ? "" : $_POST[$s]);
}

function server($s) {
     return ((empty($_SERVER[$s])) ? "" : $_SERVER[$s]);
}

$line = date("c", $_SERVER["REQUEST_TIME"])
 . $sep . server("REMOTE_ADDR")
 . $sep . server("HTTP_USER_AGENT")
 . $sep . post("lang")
 . $sep . post("scrwdth")
 . $sep . post("scrhght")
 . $sep . post("innwdth")
 . $sep . post("innhght")
 . $sep . post("version")
 . PHP_EOL;
file_put_contents(DATA_DIR . "tangram.log", $line, FILE_APPEND | LOCK_EX);
?>
