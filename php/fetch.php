<?php
/*LinkParser fecth file v.0.1 (https://github.com/maparrar/linkparser)
 *Mar 2013
 * - Tony of Redsunsoft: http://www.redsunsoft.com/2011/01/parse-link-like-facebook-with-jquery-and-php/
 * - maparrar: maparrar (at) gmail (dot) com
 **/

include_once 'Parser.php';
$parser=new Parser();
$url=rawurldecode($_POST["url"]);
echo $parser->parse($url);
?>