/*LinkParser Plugin v.0.1 (https://github.com/maparrar/linkparser)
 *Mar 2013
 * - Tony of Redsunsoft: http://www.redsunsoft.com/2011/01/parse-link-like-facebook-with-jquery-and-php/
 * - maparrar: maparrar (at) gmail (dot) com
 **/
;(function($){
    /**
     * Create the plugin for each element provided by JQuery and allow use the
     * public functions over an specified element
     * @param {object} userOptions Options provided by the user
     * */
    $.fn.linkparser=function(userOptions){
        switch(userOptions){
            case "hideCutted":
                hideCutted(this);
                break;
            default:
                return this.each(function() {
                    init($(this),userOptions);
                });
        }
    };
    
    /**
     * Initialize each element of the selector
     * @param {element} obj DOM Element that will be applied the plugin
     * @param {object} userOptions Options provided by the user
     */
    function init(obj,userOptions){
        //Options default variables
        var def = {
            urlDefault:""
        };
        var opts=$.extend(def,userOptions);
        
        //Set the main class to the element
        obj.addClass("linkparser");
        
        //Insert the html code
        obj.append(getHtml(opts.urlDefault));
        
        //Assign the parse function to the click event
        obj.find(".lp_parse").click(function(e){
            e.preventDefault();
            parse_link(obj,opts);
        });
    }
    
    /**
     * Parse an url
     * @param {element} obj DOM Element that will be applied the plugin
     * @param {object} opts Options provided by the user mixed with defaults
     */
    function parse_link(obj,opts){
        //Get the elements in variables
        var url=obj.find('.lp_url').val();
        var loading=obj.find('.lp_loading');
        var loadedUrl=obj.find('.lp_url');
        //Response elements
        var respContent=obj.find('.lp_content');
        var respTitle=obj.find('.lp_response_title');
        var respDescription=obj.find('.lp_response_description');
        var respTotalImages=obj.find('.lp_response_total_images');
        var respImages=obj.find('.lp_response_images');
        var curImage=obj.find('.lp_cur_image');
        var curImageNum=obj.find('.lp_cur_image_num');
        //Buttons
        var prev=obj.find('.lp_prev');
        var next=obj.find('.lp_next');
        
        if (!isValidURL(url)) {
            alert('Please enter a valid url.');
            return false;
        } else {
            loading.show();
            loadedUrl.html(url);
            $.post(opts.fetchScript+"?url="+escape(url),{},function(response){
                //Set Content
                respTitle.text(response.title);
                respDescription.text(response.description);
                respTotalImages.text(response.total_images);
                
                //Add the images and hide them
                respImages.empty();
                $.each(response.images,function(a,b){
                    respImages.append('<img src="'+b.img+'" width="100" id="'+(a+1)+'">');
                });
                respImages.find("img").hide();

                //Flip Viewable Content 
                respContent.fadeIn('slow');
                loading.hide();

                //Show first image
                respImages.find('img#1').fadeIn();
                curImage.val(1);
                curImageNum.html(1);

                // prev image
                prev.click(function(e){
                    e.preventDefault();
                    var total_images=parseInt(respTotalImages.text());
                    if (total_images > 0) {
                        var index=curImage.val();
                        var new_index=0;
                        respImages.find('img#'+index).hide();
                        if (index > 1) {
                            new_index = parseInt(index) - parseInt(1);
                        } else {
                            new_index = total_images;
                        }
                        curImage.val(new_index);
                        curImageNum.text(new_index);
                        respImages.find('img#' + new_index).show();
                    }
                });
                // next image
                next.click(function(e){
                    e.preventDefault();
                    var total_images = parseInt(respTotalImages.text());
                    if (total_images > 0){
                        var index=curImage.val();
                        var new_index=0;
                        respImages.find('img#' + index).hide();
                        if (index < total_images){
                            new_index = parseInt(index) + parseInt(1);
                        }else{
                            new_index = 1;
                        }
                        curImage.val(new_index);
                        curImageNum.text(new_index);
                        respImages.find('img#' + new_index).show();
                    }
                });
            });
        }
    };
    
    /**
     * Return the html code for the element
     * @param {string} urlDefault Url by default
     * @return {string} Html code
     * */
    function getHtml(urlDefault){
        return '<div class="lp_link">'+
                '<input class="lp_url" type="text" value="'+urlDefault+'">'+
                '<input class="lp_parse" type="button" value="Parse" />'+
                '<input type="hidden" class="lp_cur_image" />'+
            '</div>'+
            '<div class="lp_loader">'+
                '<div class="lp_loading" align="center" id="atc_loading">'+
//                    '<div src="" alt="Loading" />'+
                '</div>'+
                '<div class="lp_content">'+
                    '<div class="lp_response_images"></div>'+
                    '<div class="lp_info">'+
                        '<label class="lp_response_title"></label>'+
                        '<label class="lp_url"></label>'+
                        '<label class="lp_response_description"></label>'+
                    '</div>'+
                    '<div class="lp_total_image_nav" >'+
                        '<a class="lp_prev" href="#" id="prev"></a>'+
                        '<a class="lp_next" href="#" id="next"></a>'+
                    '</div>'+
                    '<div class="lp_total_images_info" >'+
                        'Showing <span class="lp_cur_image_num">0</span> of <span class="lp_response_total_images">0</span> images'+
                    '</div>'+
                '</div>'+
            '</div>';
    };
    
    function isValidURL(url){
        var RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if(RegExp.test(url)){
                return true;
        }else{
                return false;
        }
    };
    
    
})(jQuery);