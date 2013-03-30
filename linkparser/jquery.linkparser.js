/*LinkParser v.0.1 (https://github.com/maparrar/linkparser)
 *Mar 2013
 * - Tony of Redsunsoft: http://www.redsunsoft.com/2011/01/parse-link-like-facebook-with-jquery-and-php/
 * - maparrar: maparrar (at) gmail (dot) com
 **/
;(function($){
    //Initialize each element of the selector
    function init(obj,userOptions){
        //Options default variables
        var def = {
            fetch:"../php/fetch.php"    //Script that proccess the url
        };
        var opts = $.extend(def,userOptions);
        
        
        
        
        
        
        
        
        
        
        
        
        
        var viewport=false;
        var slider=false;
        var next=false;
        var prev=false;
        var firstObject=1;  //Objeto que está visible más a la izquierda
        var sliderRemain=0; //Parte visible que le queda al slider
        var moving=false;   //Indica si el slide se está moviendo

        obj.addClass("bonslider");
        //Se se inserta el slider
        obj.children().wrapAll('<div class="bsSlider" />');
        slider=obj.find(".bsSlider");
        //Se inserta el viewport
        slider.wrap('<div class="bsViewport" />');
        viewport=obj.find(".bsViewport");

        //Se calcula el ancho del slider
        var width=0;
        slider.children().each(function(){
            var object=$(this);
            object.addClass("bsObject");
            object.css({
                "margin-left":opts.gap
            });
            width+=parseInt(object.outerWidth(true));
        });
        slider.width(width+opts.gap);
        sliderRemain=slider.width();

        //Se define el ancho del viewport y de los botones
        if(!opts.next){
            viewport.width(obj.width()-(2*opts.buttonWidth));
            obj.prepend('<div class="bsButton prev" id="prev"></div>');
            if(slider.width()>viewport.width()){
                obj.append('<div class="bsButton nextActive" id="next"></div>');
            }else{
                obj.append('<div class="bsButton next" id="next"></div>');
            }
            obj.find(".bsButton").width(opts.buttonWidth);
        }else{
            opts.next.addClass("bsButton").attr("id","next");
            opts.prev.addClass("bsButton").attr("id","prev");
        }
        next=obj.find("#next");
        prev=obj.find("#prev");

        //Se ocultan los objectos que no se ven completos
        hideCutted(obj);

        next.click(function(e){
            e.stopPropagation();
            sliderRemain=slider.width()+parseInt(slider.css("margin-left"));
            if(sliderRemain>viewport.width()&&!moving){
                moving=true;
                var object=slider.find($(".bsObject:nth-child("+firstObject+")"));
                var margin=parseInt(slider.css("margin-left"))-object.outerWidth(true);
                prev.removeClass('prev').addClass("prevActive");
                firstObject=firstObject+opts.numObjects;
                slider.animate({
                    marginLeft: margin
                },opts.speed,function(){
                    hideCutted(obj);
                    sliderRemain=slider.width()+parseInt(slider.css("margin-left"));
                    if(sliderRemain<viewport.width()){
                        next.removeClass('nextActive').addClass("next");
                    }
                    moving=false;
                });
            }
        });
        prev.click(function(e){
            e.stopPropagation();
            if(firstObject>1&&!moving){
                moving=true;
                var object=slider.find($(".bsObject:nth-child("+(firstObject-1)+")"));
                var margin=parseInt(slider.css("margin-left"))+object.outerWidth(true);
                firstObject=firstObject-opts.numObjects;
                slider.animate({
                    marginLeft: margin
                },opts.speed,function(){
                    hideCutted(obj);
                    if(slider.width()>viewport.width()){
                        next.removeClass('next').addClass("nextActive");
                    }
                    if(firstObject===1){
                        prev.removeClass('prevActive').addClass("prev");
                    }
                    moving=false;
                });
            }
        });
    }
    //Oculta los objectos que quedan por fuera a la derecha del viewport
    function hideCutted(obj){
        var slider=obj.find(".bsSlider");
        var viewport=obj.find(".bsViewport");
        var left=0;
        var show=true;
        slider.children().show();
        slider.children().each(function(){
            var object=$(this);
            var visibleSpace=viewport.width()-parseInt(slider.css("margin-left"));
            left+=object.outerWidth(true);
            if(left>=visibleSpace){
                show=false;
            }
            if(!show){
                object.hide();
            }
        });
    }
    $.fn.linkparser=function(optUser){
        switch(optUser){
            case "hideCutted":
                hideCutted(this);
                break;
            default:
                return this.each(function() {
                    init($(this),optUser);
                });
        }
    };
})(jQuery);