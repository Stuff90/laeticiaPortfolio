function cs(param){console.log((param == undefined)?"Here":param);}
function wait(time, statement){setTimeout(function(){statement()},time);}

(function($){
    $.fn.extend({

        pageLoader:function(img){
            var imgList = $(this).find('img');
            var totalImg = imgList.length;
            var images = [];

            $('#main-loader > div').css({
                left:($(document).width()-30)/2,
                top:($(document).height()-150)/2
            }).fadeIn(300);

            for (var i = img.length - 1; i >= 0; i--) {
                imgList.push($('<img>').attr({src:img[i]})[0]);
            };

            var updateBar = function(value){
                var widthTotal = $(document).width();
                var section = $(document).width() / totalImg;
                $('.loader-progressbar').width(section * value);
            };

            var loadImg = function(imgIndex){
                imgIndex++;
                if($(imgList[imgIndex]).attr('src') != undefined){
                    images[imgIndex] = new Image();
                    images[imgIndex].src = $(imgList[imgIndex]).attr('src');
                    images[imgIndex].onload = function(){
                        loadImg(imgIndex++);

                    }
                } else {
                    $('.square-project').addClass('active');
                    $('#main-loader').fadeOut(500);
                    $('.menu-wrapper').show();
                }
            }
            wait(1000,function(){
                loadImg(imgList.first().index('img'));
            });
        },

        handleMap:function(){
            loadMap();
            return this.each(function(){
                $(this).on('click',function(){
                    var mapWrapper = $('#map-wrapper');
                    mapWrapper.addClass('active');
                });
            });
        },

        parallaxPan : function(){

            var updatePosition = function(boundElt,distance){
                boundElt.css({marginLeft:distance+'px'});
            }

            return this.each(function(){
                var wrapper = $(this)
                var wrapperWidth = wrapper.width();
                var firstElt = wrapper.children().first();
                var totalWidth = (firstElt.width() * wrapper.children().length) - wrapperWidth;
                
                $(this).mousemove(function(e){
                    if(!wrapper.hasClass('expanded')){
                        var distance = (totalWidth / wrapperWidth) * e.pageX;
                        updatePosition(firstElt, -distance);
                    }
                }); 
            });
        },

        loadContent:function(contentName){

            var renderHeader = function(headerObject){

                var navArrow = function(direction){
                    return $('<a>')
                        .attr({href:'#',fadingOpt:'800:'+direction})
                        .addClass('fading fading-'+direction)
                        .append($('<img>').attr({src:'img/nav-'+direction+'.png',alt:'Previous'}))
                        .one('click',function(){
                            page.closeProject(function(){
                                var projectList = $('article');
                                var currentProjectName = $('body').data('project');
                                var currentProject = projectList.filter('[name='+currentProjectName+']');
                                var newProject = currentProject.prev()

                                if(direction == 'right'){
                                    var newProject = currentProject.next()
                                    if(!newProject.is('article')){
                                        newProject = projectList.first();
                                    }
                                }
                                if(!newProject.is('article')){
                                    newProject = projectList.last();
                                }

                                var projectName = newProject.attr('name');

                                $('body').data({project:projectName});
                                page.switchDetail(projectName);
                                $('#details-pan').loadContent(projectName);
                            });
                        });
                };

                var urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                var isUrl = headerObject.url.match(urlPattern);
                headerObject.url = (isUrl)? '<a href="'+headerObject.url+'" style="color:'+headerObject.color+'" target="_blank">'+headerObject.url+'</a>': headerObject.url;

                var header = $('<div>').attr({id:'content-header-wrapper',project:parseInt(headerObject.number)})
                    .append($('<a>')
                        .attr({id:'content-close',href:'#'})
                        .one('click',function(){
                            page.closeProjectsPan()
                        }))
                    .append($('<nav>')
                        .append(navArrow('left'))
                        .append($('<div>')
                            .attr({id:'content-number-wrapper',fadingOpt:'100:bottom'})
                            .css({color:headerObject.color})
                            .addClass('fading')
                        .append($('<p>').text(headerObject.number)))
                        .append(navArrow('right')))
                    .append($('<h3>')
                        .attr({fadingOpt:'250:bottom'})
                        .text(headerObject.title)
                        .addClass('fading'))
                    .append($('<h4>')
                        .attr({fadingOpt:'300:bottom'})
                        .text(headerObject.client)
                        .addClass('fading'))
                    .append($('<div>')
                        .attr({id:'content-role-wrapper',fadingOpt:'500:left'})
                        .addClass('fading')
                        .css({color:headerObject.color})
                        .append($('<p>')
                            .text(headerObject.role)
                            .prepend($('<strong>').text('Rôle : ')))
                        .append($('<p>')
                            .html(headerObject.url)));

                return header;
            }
            
            var render = function(theContent){
                if(theContent.type == 'img'){
                    return renderImg(theContent);
                }
                if(theContent.type == 'vimeo'){
                    return renderVimeo(theContent);
                }
                if(theContent.type == 'cols'){
                    return renderCols(theContent);
                }
                if(theContent.type == 'text'){
                    return renderText(theContent);
                }
                if(theContent.type == 'slider'){
                    return renderSlider(theContent);
                }
                if(theContent.type == 'sliderVertical'){
                    return renderSliderVertical(theContent);
                }
                if(theContent.type == 'losanges'){
                    return renderLosanges(theContent);
                }
            }

            var renderContent = function(contentList){
                var content = $('<div>').attr({id:'content-wrapper'});

                for (var i = 0; i < contentList.length; i++) {
                    content.append(render(contentList[i]));
                };
                return content;
            }

            var renderLosanges = function(losangesObject){
                var container = $('<div>').addClass('content-losanges');

                var buildLosange = function(posName, imgUrl, time){
                    return $('<div>').addClass('fading content-losange-'+posName)
                        .attr({fadingOpt:time+':'+posName})
                        .append($('<img>')
                            .attr({src:'img/content/'+imgUrl}));
                };

                container.append($('<div>').addClass('content-losange-side')
                    .append(buildLosange('left',losangesObject.side.left, losangesObject.time))
                    .append(buildLosange('right',losangesObject.side.right, losangesObject.time))
                    )
                    .append(buildLosange('top',losangesObject.main, losangesObject.time));

                return container;
            }

            var renderSliderVertical = function(sliderObject){
                var container = $('<div>').addClass('content-sliderVertical-wrapper fading').attr({fadingOpt:sliderObject.fadingOpt});
                
                container.append(
                    $('<div>').addClass('sliderVertical-wrapper')
                        .append($('<div>').addClass('sliderVertical-slides-wrapper '+sliderObject.sprite.cssclass+' ')
                            .append($('<img>').attr({src:'img/content/'+sliderObject.sprite.img,alt:'iPhone'}))
                        )
                        .append($('<img>').attr({src:'img/content/'+sliderObject.mask.img,alt:'iPhone'}))
                );

                var controlsElt = $('<ul>');

                for (var i = sliderObject.controls - 1; i >= 0; i--) {
                    controlsElt.append($('<li>').addClass('sliderVertical-slider-control').on('click',function(){
                        var index = $(this).index('li.sliderVertical-slider-control');
                        var title = $(this).closest('.content-sliderVertical-wrapper').find('.sliderVertical-side-wrapper').children('h5');
                        var text = title.siblings('p');
                        title.fadeOut(600);
                        text.fadeOut(600);
                        wait(650,function(){
                            $(title[index]).fadeIn();
                            $(text[index]).fadeIn();
                        });
                        $(this).addClass('active').siblings('li').removeClass('active');
                        $('.sliderVertical-slides-wrapper').children().animate({marginLeft:-(index*261)},400);
                    }));
                };
                controlsElt.children().first().addClass('active');

                var side = $('<div>').addClass('sliderVertical-side-wrapper');
                side.append(controlsElt).css({backgroundImage:'url(img/content/'+sliderObject.side.img+')'})

                for (var i = 0; i < sliderObject.side.title.length; i++) {
                    side.append($('<h5>').text(sliderObject.side.title[i]));
                    side.append($('<p>').html(sliderObject.side.text[i]));
                };

                side.children('h5').first().show();
                side.children('p').first().show();
                container.append(side);

                return container;
            }
            
            var renderSlider = function(sliderObject){
                var container = $('<div>').addClass('content-slider-wrapper fading').attr({fadingOpt:sliderObject.fadingOpt});

                container.append(
                    $('<div>').addClass('content-slides-mask '+sliderObject.mask.cssclass+' ')
                        .append($('<img src="img/content/'+sliderObject.mask.img+'">'))
                        .append(
                        $('<div>').addClass('content-slides-wrapper '+sliderObject.sprite.cssclass+' ')
                            .css({backgroundImage:'url(img/content/'+sliderObject.sprite.img+')'})
                ));

                var controlsElt = $('<ul>').addClass('content-slider-controls');

                for (var i = sliderObject.controls - 1; i >= 0; i--) {
                    controlsElt.append($('<li>')
                        .css('border-color',sliderObject.color)
                        .append($('<li>').addClass('active-mask'))
                        .on('click',function(){
                            var width = $('.content-slides-wrapper').width();
                            var index = $(this).index();
                            $(this).addClass('active').css({backgroundColor:sliderObject.color}).siblings().removeClass('active');
                            container.find('.content-slides-wrapper').animate({'background-position-x':'-'+((index * width)+4)+'px'});
                    }));
                };
                controlsElt.children(':first').addClass('active').css({backgroundColor:sliderObject.color});

                container.append(controlsElt);

                return container;
            }
            
            var renderCols = function(colsObject){
                var theWidth = colsObject.width;
                var container = $('<div>');
                for (var i = 0; i < colsObject.list.length; i++){
                    var theCol = $('<div>')
                        .css({width:theWidth})
                        .addClass('content-column');

                    if(colsObject.list[i] instanceof Array){
                        for (var j = 0; j < colsObject.list[i].length; j++) {
                            theCol.append(render(colsObject.list[i][j]));
                        };
                    } else {
                        theCol.append(render(colsObject.list[i]));
                    }
                    container.append(theCol);
                };
                return container;
            }
            
            var renderText = function(textObject){
                return $('<div>')
                    .html(textObject.value)
                    .addClass('fading block-elt')
                    .attr({fadingOpt:textObject.fadingOpt});
            }
            
            var renderImg = function(imgObject){
                return $('<img>').attr({src:'img/content/'+imgObject.url,alt:imgObject.alt,fadingOpt:imgObject.fadingOpt})
                    .addClass(imgObject.cssclass+' block-elt')
                    .width(imgObject.width).height(imgObject.height);
            }
            
            var renderVimeo = function(vimeoObject){
                return $('<div>').addClass('block-elt')
                    .append($('<iframe webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>').attr({
                        src:vimeoObject.url,
                        width:vimeoObject.width,
                        height:vimeoObject.height,
                        frameborder:0,
                        frameborder:0,
                        fadingOpt:vimeoObject.fadingOpt
                    }));
            }


            $.ajax({
                dataType: "json",
                url: 'contents/'+contentName+'.json',
                success:function(data){
                    $('#details-pan').html('').css({height:$(document).height()})
                        .append($('<div>').attr({id:'details-container'})
                            .append(renderHeader(data.header))
                            .append(renderContent(data.content)));

                    wait(500,function(){
                        var sliderWrapper = $('.content-slider-wrapper');
                        if(sliderWrapper.length != 0){
                            var slidesWrapper = sliderWrapper.find('.content-slides-wrapper');
                            var containerWidth = sliderWrapper.parent().width();
                            var slidesWidth = slidesWrapper.width();
                            var offsetSlider = slidesWrapper.css('marginLeft');
                            var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
                            var offsetSlider = (is_chrome)? parseInt(slidesWrapper.css('marginLeft')):slidesWrapper.position().left;
                            offsetSlider += slidesWrapper.width()/2;
                            var diffImg = offsetSlider - (slidesWrapper.siblings('img').width() /2);
                            slidesWrapper.siblings('img').css({left:(diffImg)});
                            if(slidesWidth > containerWidth){
                                var shiftLeft = (slidesWidth-containerWidth)/2;
                                sliderWrapper.css({marginLeft:-shiftLeft});
                            }
                        }
                        
                        $('.fading').fadingHandler();
                    });
                        
                }
            });
        },

        squareLoader : function(){
            

            return this.each(function(i){
                var wrapper = $(this);
                var squareWidth = wrapper.width() - (wrapper.css('margin').replace('px','') *2);
                var style = [
                    {width:squareWidth+'px'},
                    {height:squareWidth+'px'},
                    {width:squareWidth+'px',marginLeft:0},
                    {height:squareWidth+'px',marginTop:0}
                ];
                wait(300+300*i,function(){
                    wrapper.children().each(function(i){
                        var aSide = $(this);
                        wait(1350+1350*i,function(){
                            aSide.css(style[i]);
                        });
                    })
                })   
            });
        },

        handleContactForm:function(){
            var toggleOverlay = function(active, callback){
                if(active){
                    var overlayElt = $('<div>').addClass('contact-overlay');
                    overlayElt.appendTo('body');
                    wait(100,function(){;
                        overlayElt.addClass('active');
                        wait(600,function(){;
                            callback();
                            return;
                        });
                    });
                } else {
                    $('.contact-overlay').removeClass('active');
                    wait(500,function(){
                        $('.contact-overlay').remove();
                        return;
                    });
                };
            };

            var buildForm = function(){
                var formElt = $('<div>').attr({id:'form-contact-wrapper'});
                formElt.append($('<div>').attr({id:'form-contact-close'}).one('click',function(){
                    destroyForm();
                }));
                formElt.append($('<h5>').text('Envie de travailler avec moi ?'));
                formElt.append($('<form>').attr({method:'POST',action:'#'})
                    .append($('<input>').attr({type:'email',placeholder:'MAIL',name:'mail',required:'required'}))
                    .append($('<input>').attr({type:'text',placeholder:'OBJET',name:'obj',required:'required'}))
                    .append($('<textarea>').attr({placeholder:'MESSAGE',name:'msg',required:'required'}))
                    .append($('<div>').attr({id:'form-contact-submit-wrapper'})
                        .append($('<input>').attr({type:'submit',value:'Envoyer',name:'submit'})))
                );
                formElt.appendTo('body');
                formElt.css({left:($(document).width()-$(formElt).width())/2});
                wait(100,function(){
                    formElt.addClass('active');
                    wait(1300,function(){
                        formElt.find('#form-contact-submit-wrapper').addClass('active');
                    });
                });
            };

            var destroyForm = function(){
                $('#form-contact-wrapper').remove();
                toggleOverlay(false);
            }

            return this.each(function(){
                $(this).on('click',function(){
                    toggleOverlay(true,function(){
                        buildForm()
                    });
                });
            });
        },

        fadingHandler:function(){
            var eltList = [];
            var indexMax = 0;

            this.each(function(i,e){
                var elt = $(e).attr('fadingOpt');
                if(elt === undefined){
                    elt = '6000:top';
                }
                elt = elt.split(':');

                $(e).addClass('fading-'+elt[1])

                if(elt[0] == "auto"){
                    $('*').scroll(function(){
                        if(($(e).offset().top - 100) < ($(document).height() - $(e).height())){
                            $(e).css({opacity:1,top:0,left:0});
                        };
                    })
                } else {
                    wait(elt[0],function(){
                        $(e).css({opacity:1,top:0,left:0});
                    });
                }
                    
            });
        }
        

    });
})(jQuery);



var page = new function(){
    var expandDetailsPan = function(projectName, callback){
        var theProject = $('article[name='+projectName+']');
        var theOffset = $(window).width() - theProject.offset().left; 
        var detailsWrapper = $('#details-pan-wrapper');
        var imgWrapper = $('<div>').attr({id:'article-clone'}).append(theProject.children('img').clone());

        theProject.parent().addClass('expanded');
        theProject.find('section').toggleClass('active');

        detailsWrapper.css({right:0,left:'auto'}).prepend(imgWrapper);
        detailsWrapper.css({width:theOffset+'px'}); 

        wait(800,function(){
            detailsWrapper.find('#article-clone').css({opacity:1});
            detailsWrapper.css({width:'100%'});
            wait(800,function(){
                theProject.find('section').toggleClass('active');
                callback(detailsWrapper.children('#details-pan'));
            });
        });
    }

    var closeProject = function(callback){
        $('#details-container').css({opacity:0});        
        wait(300,function(){
            var wrapper = $('#details-pan-wrapper');
            if(callback != undefined){
                callback();
            }
        });
    }

    var closeProjectPan = function(callback){
        var wrapper = $('#details-pan-wrapper');
        wrapper.css({width:0});
        $('.expanded').removeClass('expanded');
        wait(1000,function(){
            wrapper.children('#article-clone').remove();
            $('#details-pan').html('');
            callback();
        });
    }

    return {
        showDetails:function(projectName){
            expandDetailsPan(projectName,function(e){
                $('body').data({project:projectName});
                e.loadContent(projectName);
            });
        },
        switchDetail:function(projectName){
            var theProject = $('article[name='+projectName+']');
            var urlImg = theProject.children('img').attr('src');
            var newImg = $('<img>').attr({src:urlImg});
            $('#article-clone').append(newImg)
                .children().first().animate({marginTop:'-1000px'},1000,function(){
                    $(this).remove();
                });

        },
        closeProject:function(callback){
            closeProject(function(){
                callback()
            });
        },
        closeProjectsPan:function(){
            closeProject(function(){
                closeProjectPan();
            });
        }
    }
}





$(document).ready(function(){
    $('body').pageLoader([
        'img/nav-left.png',
        'img/nav-right.png',
        'img/content/autoportrait-website.png',
        'img/content/autoportrait-losange-main.png',
        'img/content/autoportrait-losange-left.png',
        'img/content/autoportrait-losange-right.png',

        'img/content/bouygues-trophy.png',
        'img/content/bouygues-splash.png',
        'img/content/bouygues-website.png',

        'img/content/coeur-de-bois-display.png',
        'img/content/coeur-de-bois-onair.png',
        'img/content/coeur-de-bois-com.png',
        'img/content/coeur-de-bois-facebook.png',
        'img/content/coeur-de-bois-website.png',
        
        'img/content/gofest-slider-mask.png',
        'img/content/gofest-slider-sprite.png',
        'img/content/gofest-losange-main.png',
        'img/content/gofest-losange-left.png',
        'img/content/gofest-losange-right.png',
        
        'img/content/oasis-website.png',
        'img/content/oasis-youtube.png',
        'img/content/oasis-slider-mask.png',
        'img/content/oasis-slider-sprite.png',
        
        'img/content/xv-de-france-home.png',
        'img/content/xv-de-france-website.png'
    ]);

    $('#parallaxPan').parallaxPan();
    $('.menu > li > a.contact').handleContactForm();
    $('.menu > li > a.map').handleMap();
    $('.menu > li > a.home').click(function(){
        $('#map-wrapper').removeClass('active');
    });

    $('#parallaxPan > article').click(function(e){
        page.showDetails($(this).attr('name'));
    });

    $('.menu-wrapper').click(function(){
        var self = $(this);
        self.addClass('active').mouseleave(function(){
            self.removeClass('active');
        });
    }).find('li').click(function(){
        if($(this).filter(':not(.active)').find(':not(.map,.contact)').length == 1){
            $('#map-wrapper').animate({top:'-100%'},1000,function(){
                $('#map-wrapper').removeClass('active').removeAttr('style');
            });
        }
        $(this).addClass('active').siblings().removeClass('active');
    });
});









function loadMap() {

    var markers = [
        {
            pos:new google.maps.LatLng(48.8839862,2.2687551),
            title:"Agence Tactile",
            id:"agenceTactile",
            icon:"img/icon-marker-briefcase.png",
            text:"A la fin de ma troisième année à HETIC, j’ai effectué un stage de trois mois dans une agence de communication 360.<br />Cette expérience m’a permis de développer une pluricompétence print, web et mobile grâce à de nombreuses missions (BNP, EDF, Perspectives Entrepreneurs...)"
        },
        {
            pos:new google.maps.LatLng(48.8518602,2.4202844),
            title:"Hetic",
            id:"hetic",
            icon:"img/icon-marker-briefcase.png",
            text:"Actuellement étudiante en quatrième année à HETIC, je suis webdesigner et passionnée d'infographie. HETIC est la première grande école de l'internet décernant un diplôme de niveau un reconnu par l'état. Grâce à cette école, j'approfondis mes connaissances graphiques, techniques et marketing dans le milieu du multimédia. Elle me permet de construire des bases solides dans ce milieu afin de pouvoir faire face à toutes les situations. Je suis actuellement à la recherche d'un stage de douze semaines dans le domaine du multimédia, en particulier du webdesign."
        },
        {
            pos:new google.maps.LatLng(48.8394097,2.3217108),
            title:"CNP Assurance",
            id:"cnpAssurance",
            icon:"img/icon-marker-briefcase.png",
            text:"Avant d'entrer à HETIC, j'ai réalisé un stage d'un mois à la CNP Assurances. J'ai pu y découvrir la vie en entreprise et mettre à profit mon esprit de synthèse et mes capacités rédactionnelles."
        },
        {
            pos:new google.maps.LatLng(48.29687,-0.104733),
            title:"Viaduc de Saint George",
            id:"viaducDeStGeorge",
            icon:"img/icon-marker-paperplane.png",
            text:"Baptème de saut à l'élastique en 2011 !"
        },
        {
            pos:new google.maps.LatLng(40.7143528,-74.0059731),
            title:"New York",
            id:"newYork",
            icon:"img/icon-marker-paperplane.png",
            text:"Visite touristique réalisée en décembre 2008."
        },
        {
            pos:new google.maps.LatLng(35.6894875,139.6917064),
            title:"Tokyo",
            id:"tokyo",
            icon:"img/icon-marker-paperplane.png",
            text:"Voyage au Japon effectué pendant les vacances scolaire de juillet 2009. 14h de vols pour 14 jours de délices culturels."
        },
        {
            pos:new google.maps.LatLng(48.9188354,2.3425199),
            title:"Edilivre",
            id:"edilivre",
            icon:"img/icon-marker-briefcase.png",
            text:"À la fin de ma deuxième année à HETIC, j'ai effectué un stage de trois mois très concluant chez Edilivre. J’ai pu y développer ma créativité, mon autonomie, ainsi que mes compétences techniques. J’ai mené à bien toutes les missions qui m’ont été confiées (analyse concurrentielle, bannières flash pour Google Adwords, gestion d’une campagne Adwords, webdesign, print, création de logos…)."
        },
        {
            pos:new google.maps.LatLng(48.8328198,2.2691665),
            title:"Bouygues Telecom",
            id:"bouyguesTelecom",
            icon:"img/icon-marker-star.png",
            text:"Imaginez l’application qui révolutionnera l’utilisation de la Bbox ! Nous étions 226 étudiants à avoir relevé le défit et sommes ressorti vainqueur de ce challenge grâce à Bbox Affinity. L'application que nous avons proposée suggérait des programmes pertinents aux téléspectateurs grâce à l'analyse de ses likes facebook et et de ses émissions les plus regardées. Jetez votre télécommande et reprenez le contrôle de votre consommation télévisuelle grâce à notre application !"
        },
        {
            pos:new google.maps.LatLng(48.837238,2.296405),
            title:"Addons Market",
            id:"addonsMarket",
            icon:"img/icon-marker-briefcase.png",
            text:"Addons Market c'est quatre mois de collaboration pendant lesquels m'ont été la direction artistique de cette plateforme e-commerce."
        },
        {
            pos:new google.maps.LatLng(48.2644735,7.7195876),
            title:"Europa Park",
            id:"europaPark",
            icon:"img/icon-marker-paperplane.png",
            text:"Voyage à Europapark effectué en avril 2013 grâce au BDE du réseau GES. Petit montage du week-end <a style=\"color:#ff114f\" href=\"https://vimeo.com/63675697\">ici</a> "
        }
    ];

    var styles = [
      {
        "featureType": "administrative.province",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "stylers": [
          { "hue": "#6600ff" },
          { "saturation": -50 }
        ]
      },{
        "featureType": "road",
        "stylers": [
          { "hue": "#ff4400" }
        ]
      },{
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "featureType": "water",
        "stylers": [
          { "hue": "#00d4ff" },
          { "saturation": 33 }
        ]
      }
    ];


    var styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});

    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(48.856614, 2.3522219),
        disableDefaultUI: true,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var mapMarkerInfo = $('#map-marker-info');

    for (var i = 0; i < markers.length; i++) {
        var theMarker = new google.maps.Marker({
            position : markers[i].pos,
            map      : map,
            title    : markers[i].title,
            text     : markers[i].text,
            icon     : markers[i].icon,
            theImg   : markers[i].img,
            idMarker : markers[i].id
        });


        google.maps.event.addListener(theMarker, "mouseover", function(){
            var self = this;
            var iconSrc = self.getIcon();
            var updateContent = function(theMarker, mapMarkerInfo){
                mapMarkerInfo.addClass('bounceInRight').removeClass('bounceOutRight').find('h4').text(self.title).siblings('p').html(self.text)
                    .siblings('div').children('img').attr({src:'img/content/spot/'+self.idMarker+'.png'})
                    ;
            }
            iconSrc = iconSrc.replace(".png","-active.png");
            self.setIcon(iconSrc);

            if(mapMarkerInfo.css('opacity') == 0){
                mapMarkerInfo.addClass('bounceInRight').css({opacity:1});
                updateContent(theMarker,mapMarkerInfo);
            } else{
                mapMarkerInfo.removeClass('bounceInRight').addClass('bounceOutRight');
                wait(500,function(){
                    updateContent(theMarker,mapMarkerInfo);
                })
            }
        });

        google.maps.event.addListener(theMarker, "mouseout", function(){
            var iconSrc = this.getIcon("img/map-pin.png").replace('-active','');
            this.setIcon(iconSrc);
        });
    };

    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
}