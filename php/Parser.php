<?php

/* Parser class file v.0.1 (https://github.com/maparrar/linkparser)
 * Mar 2013
 * - Tony of Redsunsoft: http://www.redsunsoft.com/2011/01/parse-link-like-facebook-with-jquery-and-php/
 * - maparrar: maparrar (at) gmail (dot) com
 * 
 * @todo: Improve this class
 * @todo: Create a method to parse each value
 * @todo: Create a method to extract the images
 * */
include_once 'Curl.php';
class Parser {
    var $url;
    /**
     * Constructor
     */
    function Parser(){
    }
    /**
     * Parse function. Take the url and extract the info
     * @param string $url Url to extract the data
     * @return string Informatio in JSON format
     */
    function parse($url){
        $this->url=$url;
        $this->url=$this->checkValues(urldecode($this->url));
        $return_array = array();

        $base_url = substr($this->url, 0, strpos($this->url, "/", 8));
        $relative_url = substr($this->url, 0, strrpos($this->url, "/") + 1);

        // Get Data
        $cc = new cURL();
        $string = $cc->get($this->url);
        $string = str_replace(array("\n", "\r", "\t", '</span>', '</div>'), '', $string);

        $string = preg_replace('/(<(div|span)\s[^>]+\s?>)/', '', $string);
        if (mb_detect_encoding($string, "UTF-8") != "UTF-8")
            $string = utf8_encode($string);


        // Parse Title
        $nodes = $this->extract_tags($string, 'title');
        $return_array['title'] = trim($nodes[0]['contents']);

        // Parse Base
        $base_override = false;
        $base_regex = '/<base[^>]*' . 'href=[\"|\'](.*)[\"|\']/Ui';
        preg_match_all($base_regex, $string, $base_match, PREG_PATTERN_ORDER);
        if (strlen(@$base_match[1][0]) > 0) {
            $base_url = $base_match[1][0];
            $base_override = true;
        }

        // Parse Description
        $return_array['description'] = '';
        $nodes = $this->extract_tags($string, 'meta');
        foreach ($nodes as $node) {
            if (strtolower(@$node['attributes']['name']) == 'description')
                $return_array['description'] = trim($node['attributes']['content']);
        }

        // Parse Images
        $images_array = $this->extract_tags($string, 'img');
        $images = array();
        for ($i = 0; $i <= sizeof($images_array); $i++) {
            $img = trim(@$images_array[$i]['attributes']['src']);
            $width = preg_replace("/[^0-9.]/", '', @$images_array[$i]['attributes']['width']);
            $height = preg_replace("/[^0-9.]/", '', @$images_array[$i]['attributes']['height']);

            $ext = trim(pathinfo($img, PATHINFO_EXTENSION));

            if ($img && $ext != 'gif') {
                if (substr($img, 0, 7) == 'http://')
                    ;
                else if (substr($img, 0, 1) == '/' || $base_override)
                    $img = $base_url . $img;
                else
                    $img = $relative_url . $img;

                if ($width == '' && $height == '') {
                    $details = @getimagesize($img);

                    if (is_array($details)) {
                        list($width, $height, $type, $attr) = $details;
                    }
                }
                $width = intval($width);
                $height = intval($height);


                if ($width > 199 || $height > 199) {
                    if (
                            (($width > 0 && $height > 0 && (($width / $height) < 3) && (($width / $height) > .2)) || ($width > 0 && $height == 0 && $width < 700) || ($width == 0 && $height > 0 && $height < 700)
                            ) && strpos($img, 'logo') === false) {
                        $images[] = array("img" => $img, "width" => $width, "height" => $height, 'area' => ($width * $height), 'offset' => $images_array[$i]['offset']);
                    }
                }
            }
        }
        $return_array['images'] = array_values(($images));
        $return_array['total_images'] = count($return_array['images']);

        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');

        return json_encode($return_array);
    }
    
    function checkValues($value) {
        $value = trim($value);
        if (get_magic_quotes_gpc()) {
            $value = stripslashes($value);
        }
        $value = strtr($value, array_flip(get_html_translation_table(HTML_ENTITIES)));
        $value = strip_tags($value);
        $value = htmlspecialchars($value);
        return $value;
    }

    function extract_tags($html, $tag, $selfclosing = null, $return_the_entire_tag = false, $charset = 'ISO-8859-1') {
        if (is_array($tag)) {
            $tag = implode('|', $tag);
        }

        //If the user didn't specify if $tag is a self-closing tag we try to auto-detect it
        //by checking against a list of known self-closing tags.
        $selfclosing_tags = array('area', 'base', 'basefont', 'br', 'hr', 'input', 'img', 'link', 'meta', 'col', 'param');
        if (is_null($selfclosing)) {
            $selfclosing = in_array($tag, $selfclosing_tags);
        }

        //The regexp is different for normal and self-closing tags because I can't figure out 
        //how to make a sufficiently robust unified one.
        if ($selfclosing) {
            $tag_pattern =
                    '@<(?P<tag>' . $tag . ')			# <tag
			(?P<attributes>\s[^>]+)?		# attributes, if any
			\s*/?>					# /> or just >, being lenient here 
			@xsi';
        } else {
            $tag_pattern =
                    '@<(?P<tag>' . $tag . ')			# <tag
			(?P<attributes>\s[^>]+)?		# attributes, if any
			\s*>					# >
			(?P<contents>.*?)			# tag contents
			</(?P=tag)>				# the closing </tag>
			@xsi';
        }

        $attribute_pattern =
                '@
		(?P<name>\w+)							# attribute name
		\s*=\s*
		(
			(?P<quote>[\"\'])(?P<value_quoted>.*?)(?P=quote)	# a quoted value
			|							# or
			(?P<value_unquoted>[^\s"\']+?)(?:\s+|$)			# an unquoted value (terminated by whitespace or EOF) 
		)
		@xsi';

        //Find all tags 
        if (!preg_match_all($tag_pattern, $html, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
            //Return an empty array if we didn't find anything
            return array();
        }

        $tags = array();
        foreach ($matches as $match) {

            //Parse tag attributes, if any
            $attributes = array();
            if (!empty($match['attributes'][0])) {

                if (preg_match_all($attribute_pattern, $match['attributes'][0], $attribute_data, PREG_SET_ORDER)) {
                    //Turn the attribute data into a name->value array
                    foreach ($attribute_data as $attr) {
                        if (!empty($attr['value_quoted'])) {
                            $value = $attr['value_quoted'];
                        } else if (!empty($attr['value_unquoted'])) {
                            $value = $attr['value_unquoted'];
                        } else {
                            $value = '';
                        }

                        //Passing the value through html_entity_decode is handy when you want
                        //to extract link URLs or something like that. You might want to remove
                        //or modify this call if it doesn't fit your situation.
                        $value = html_entity_decode($value, ENT_QUOTES, $charset);

                        $attributes[$attr['name']] = $value;
                    }
                }
            }

            $tag = array(
                'tag_name' => $match['tag'][0],
                'offset' => $match[0][1],
                'contents' => !empty($match['contents']) ? $match['contents'][0] : '', //empty for self-closing tags
                'attributes' => $attributes,
            );
            if ($return_the_entire_tag) {
                $tag['full_tag'] = $match[0][0];
            }

            $tags[] = $tag;
        }

        return $tags;
    }
}
?>