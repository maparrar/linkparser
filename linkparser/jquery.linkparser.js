/*LinkParser Plugin v.0.2 (https://github.com/maparrar/linkparser)
 *Apr 2013
 * - Tony of Redsunsoft: http://www.redsunsoft.com/2011/01/parse-link-like-facebook-with-jquery-and-php/
 * - maparrar: maparrar (at) gmail (dot) com
 * 
 * options:
 *      withInput:  true (default): Create an input to write the url, also add a
 *                                  parse button. Use urlDefault as placeholder
 *                  false: Use urlDefault as the url and does not show input or 
 *                          parser button.
 **/
;(function($){
    /**
     * Create the plugin for each element provided by JQuery and allow use the
     * public functions over an specified element
     * @param {object} userOptions Options provided by the user
     * @param {function} callback function to execute after the data was loaded
     * */
    $.fn.linkparser=function(userOptions,callback){
        switch(userOptions){
            case "hideCutted":
                hideCutted(this);
                break;
            default:
                return this.each(function() {
                    init($(this),userOptions,callback);
                });
        }
    };
    
    /**
     * Initialize each element of the selector
     * @param {element} obj DOM Element that will be applied the plugin
     * @param {object} userOptions Options provided by the user
     * @param {function} callback function to execute after the data was loaded
     */
    function init(obj,userOptions,callback){
        //Options default variables
        var def = {
            urlDefault:"",
            withInput: true
        };
        var opts=$.extend(def,userOptions);
        
        //Set the main class to the element
        obj.addClass("linkparser");
        
        //Insert the html code
        obj.append(getHtml(opts));
        
        //If is without input, run the parser with the urlDefault
        if(!opts.withInput){
            parse_link(obj,opts,callback);
        }
        
        //Assign the parse function to the click event
        obj.find(".lp_parse").click(function(e){
            e.preventDefault();
            parse_link(obj,opts,callback);
        });
    }
    
    /**
     * Parse an url
     * @param {element} obj DOM Element that will be applied the plugin
     * @param {object} opts Options provided by the user mixed with defaults
     * @param {function} callback function to execute after the data was loaded
     */
    function parse_link(obj,opts,callback){
        //Get the elements in variables
        var url=obj.find('.lp_url').val();
        if(!opts.withInput){
            url=opts.urlDefault;
        }
        var loading=obj.find('.lp_loading');
        var loadedUrl=obj.find('.lp_url');
        //Response elements
        var respContent=obj.find('.lp_content');
        var respInfo=obj.find('.lp_info');
        var respTitle=obj.find('.lp_response_title');
        var respDescription=obj.find('.lp_response_description');
        var respImagesInfo=obj.find('.lp_total_images_info');
        var respTotalImages=obj.find('.lp_response_total_images');
        var respImages=obj.find('.lp_response_images');
        var curImage=obj.find('.lp_cur_image');
        var curImageNum=obj.find('.lp_cur_image_num');
        //Buttons
        var prev=obj.find('.lp_prev');
        var next=obj.find('.lp_next');
        
        if (!isValidURL(url)) {
            system.message('Please enter a valid url.');
            return false;
        } else {
            loading.show();
            loadedUrl.html(url);
            $.post(
                opts.fetchScript,
                {
                    url:escape(url)
                },
                function(response){
                    //Set Content
                    respTitle.text(response.title);
                    respDescription.text(response.description);
                    respTotalImages.text(response.total_images);

                    //Hidden images if not available
                    if(response.total_images>0){
                        //Add the images and hide them
                        respImages.empty();
                        $.each(response.images,function(a,b){
                            respImages.append('<img src="'+b.img+'" width="100" id="'+(a+1)+'">');
                        });
                        respImages.find("img").hide();

                        //Show first image
                        respImages.find('img#1').fadeIn();
                        curImage.val(1);
                        curImageNum.html(1);
                    }else{
                        respImages.hide();
                        respInfo.width("100%");
                        respImagesInfo.text("No images available");
                    }
                    //Flip Viewable Content 
                    respContent.fadeIn('slow');
                    loading.hide();
                    
                    //If callback is defined
                    if(callback){
                        callback();
                    }

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
                }
            );
        }
    };
    
    /**
     * Return the html code for the element
     * @param {object} opts User default options
     * @return {string} Html code
     * */
    function getHtml(opts){
        var input="";
        if(opts.withInput){
            input='<input class="lp_url" type="text" value="'+opts.urlDefault+'">'+
                '<input class="lp_parse" type="button" value="Parse" />';
        }
        return '<div class="lp_link">'+
                input+
                '<input type="hidden" class="lp_cur_image" />'+
            '</div>'+
            '<div class="lp_loader">'+
                '<div class="lp_loading" align="center" id="atc_loading"></div>'+
                '<div class="lp_content">'+
                    '<div class="lp_response_images"></div>'+
                    '<div class="lp_info">'+
                        '<div class="lp_response_title"></div>'+
                        '<div class="lp_url"></div>'+
                        '<div class="lp_response_description"></div>'+
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