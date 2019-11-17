window.onload = function() {
  /*  Check support for transitions and transform */
  if (!(Modernizr.csstransforms && Modernizr.csstransitions)) {
    invokeModalNotify('Browser not supported', "Advanced functionality needed. Please upgrade to a Modern Browser.")
    window.stop();
    $('#card_preview_container').html('<p class="my-6 mx-2 text-center">Browser Not Supported.<br>Upgrade/Use a Browser with latest functionality.</p>');
   }
}
window.onbeforeunload = function(e) {
  if (document.getElementById("card_preview_container") && (normalUnload != true)) {
    if (isUnsavedData() == true ) {
      return "You have made some changes to card. These changes will get lost."
    }
  }
  // if (($("#product-modal.modal").data('bs.modal') || {}).isShown) {
  //     modal = $("#product-modal")
  //     hash = modal.data("id");
  //     history.pushState('', document.title, window.location.pathname);
  // }
};
$(document).ready(function() {
  device = findBootstrapEnvironment(); // Required on other pages too.
  initScrollBehaviour();

  console.log("device is: " + device);
  if (document.getElementById("card_preview_container"))
  {
    fontMap = {'Lavanderia': {'Normal':24,'Large':27,'Huge':30}, 'Carried Away': {'Normal':17,'Large':19,'Huge':21}, 'Daydreamer': {'Normal':22,'Large':24,'Huge':26}, 'Smoothy Script': {'Normal':19,'Large':21,'Huge':23}, 'Peach And Pistachio': {'Normal':37,'Large':39,'Huge':41}, 'Grounday': {'Normal':34,'Large':37,'Huge':40}};

    imagePlacements = [];
    editorObjs = {};
    active = false;
    currentX = 0;
    currentY = 0;
    initialX = 0;
    initialY = 0;
    xOffset = 0;
    yOffset = 0;
    txtEditMenuMode = 2;
    normalUnload = false;
    isTouchDevice = false;
    
    switch(txtEditMenuMode) {
      case 1:
        $('.text-edit-toolbar').addClass('d-none');
        break;
      case 2:
        $('.mt-top-bar#text-editor').addClass('d-none');
        break;
    }
    // Allowed Actual Text Width
    allowedWidth = 286; // 300 - 6(paddingLeft) - 6(paddingRight) - 1(margin-left) - 1(margin-right)
    /*
    * Collect all jquery editor elements
    */
    jqAllTxtEditors = $('[id*="editor-"]');
    jqAllPhotoEditors = $('[id*="ctap-placeholder-"]');
        
    
    /*
    * Initialise text areas and photo areas with default font, size, color and align settings
    */
    initTextAreas();
    initPhotoAreas();
    initGeneral();
    $('body').on('click', function(e){
      console.log("Event reached body: " + e.type + " target: " + e.target.id);
      if (e.target.id.indexOf("ctap-activearea") == -1) {
        $('.mt-top-bar#photo-editor').removeClass('active');
      }
    })
    /*
    * Registering text-change events on text editors
    */
    jqAllTxtEditors.each(function(index, obj){
      editor = $(this).data('quill');
      editor.on('text-change', function(delta, oldDelta, source) {
        editorTextTrim(editor, source)
      });
    })
    /*
    * Handling paste events on text editors
    */
    jqAllTxtEditors.on('paste', function(e) {
      var pastedData = e.originalEvent.clipboardData.getData('text');
      // alert(pastedData);
    });
    /*
    * Apply editor styles to mps text *
    * and other relevant changes like setting target *
    */
    jqAllTxtEditors.on('click', function() {
      console.log('Click received on ' + $(this).attr('id'));
      $("#text-editor").data("target", "#"+this.id).fadeIn("fast");
      restoreToolbarStates($(this));
      $('#mps, #textwrap').css({'font-family': $(this).css('font-family'), 'font-size': $(this).css('font-size'), 'text-align': $(this).css('text-align'), 'word-spacing': $(this).css('word-spacing'), 'line-height': $(this).css('line-height')});
      // Open Text Edit Toolbar
      $('.text-edit-toolbar .btn-group').removeClass('active');
      $(this).siblings('.text-edit-toolbar').children('.btn-group').addClass('active');
      if (isTouchDevice) {
        $('.main-footer').addClass('d-none'); // keyboar enabled, hide footer
      }
      
    });
    /* Register focus out event */
    jqAllTxtEditors.focusout(function() {
      console.log('Focus out detected for ' + this.id);
      $(this).siblings('.text-edit-toolbar').children('.btn-group').removeClass('active');
      if (isTouchDevice) {
        $('.main-footer').removeClass('d-none'); // keyboard disabled, show footer
      }
    });
    /*
    * Slider Handling
    */
    // $('.slider').on('slide change mousedown mousemove mouseup', function(e){
    //   console.log('slider handle event detected: ' + e.type + " target: " + e.target);
    //   // e.preventDefault();
    //   e.stopPropagation();
    // });
    $(".slider").each(function() {

      var $sibling = $(this).closest(".slider-container").find(".slider-txt");
      
      var mySlider = $(this).slider({
        formatter: function(value) {
          return '' + value;
        }
      }).on('change', function(e){
        console.log("Change event detected: " + e.type);
        var sourceCtg = $(this).data('source-ctg');
        // var re = /(rotate)(\(.*(?:deg\)))/g; //regex to match rotateZ(...deg)
        // var tr = /(scale)(\(.*(?:\)))/g; //regex to match scale(...)
        var zoomnewvalue = zoomoldvalue = 1;
        var rotnewvalue = rotoldvalue = 0;
        ctapRefId = getActiveCtapRefId();
        jqCtapElm = $('#ctap-img-' + ctapRefId);
        // on slide did not update on click (jump)
        switch(sourceCtg) {
          case 'rotation':
            var rotnewvalue = parseInt($(this).val());
            var rotoldvalue = parseInt($sibling.val());
            if(rotoldvalue != rotnewvalue)
            {
              $sibling.val(rotnewvalue)
            }
            // fetch zoom value
            zoomnewvalue = jqCtapElm.data('zoom');
            //update rotate
            jqCtapElm.data('rotate', rotnewvalue);
            break;
          case 'zoom':
            var zoomnewvalue = parseFloat($(this).val()).toFixed(2);
            var zoomoldvalue = parseFloat($sibling.val()).toFixed(2);
            if(zoomoldvalue != zoomnewvalue)
            {
              $sibling.val(zoomnewvalue)
            }
            // fetch rotate value
            rotnewvalue = jqCtapElm.data('rotate');
            // update zoom
            jqCtapElm.data('zoom', zoomnewvalue);
            break;
          default:
            return;
        }
        // jqCtapElm.css('transform', 'translate(-50%,-50%)scale('+zoomnewvalue+')rotate('+rotnewvalue+'deg)');
        jqCtapElm.css('transform', 'scale('+zoomnewvalue+')rotate('+rotnewvalue+'deg)');
        // updateImagePlacementInfo(ctapRefId);
      }).data('slider');
    });
    
    /*
    * Front, Inside, Back Button toggles - frontview, insideview, backview
    */
    $('button.toggle-btn').on('click', function () {
      elmId = this.id;
      $('.toggle-btn').removeClass('active'); // remove buttonactive from the others
      $(this).addClass('active');
      $('.toggle-pages').removeClass('d-flex justify-content-center').hide();
      $('#' + elmId + 'view').show();
      /* Inside image overflows and doesnt need to be centered. */
      if (elmId != 'inside') {
        $('#' + elmId + 'view.c-5x7').addClass('d-flex justify-content-center');
      }
      /* Check if this page has template elements. In that case we need to display the btn group for templates */
      pageId = $(this).attr('id');
      
      $('.templates-btn-grp [id*="-templates"]').css('visibility', 'hidden');
      if ($('#' + pageId + 'view [data-cfg-type="tpl"').length > 0) {
        $('.templates-btn-grp #' + pageId + '-templates').css('visibility', 'visible')
      }
    });
    
    /*
    * Uploaded Pics Click Handler
    */
    $('#picsuploaded').on('click', '.uploaded-images', function() {
      var found = false;
      var img = '';
      var numObjs = 0;
      var obj = null;
      ctapRefId = getActiveCtapRefId();
      jqParentElm = $('#ctap-placeholder-' + ctapRefId);
      jqImgElm = $(this);
      
      img = jqImgElm.data('img');
      
      $('#picsuploaded').find('.dot').removeClass('active');
      $(this).parent().find('.dot').addClass('active');
      
      obj = fetchImgObjPlcmntArr(img)
      
      initSliderAttributes(obj);
      initImageAttributes(ctapRefId, jqImgElm, obj);
      
      /*if (obj === null) {
        initImageAttributes(ctapRefId, jqImgElm, null);
        initSliderAttributes(null);
      } else {
        initImageAttributes(ctapRefId, jqImgElm, obj);
        initSliderAttributes(obj);
      }*/
      initImgActiveUtils(ctapRefId);
      showHideCtapText(ctapRefId);
      // Update the positions.
      // updateImagePlacementInfo(ctapRefId);
    });
    
    /*
    * Click Ctap active area click handler
    * adding touchend for mobile devices
    */
    /*$('.ctap-activearea').on('click touchend', function() {
        console.log('Click registered for ctap-activearea');
      if ($('#eb-edit-tools').is(':hidden') && $('#eb-img-uploads').is(':hidden') && $('#options-query').is(':hidden')) {
        // $('#picsuploaded').show();
        $('#options-query').modal();
        ctapRefId = $(this).data('ctaprefid');
        $('#picsuploaded').data('target', ctapRefId);
        // // $('#photo-editor-old').removeClass('hidecls');
        // $('#photo-editor-old').show();
      }
    });*/
    /*
    * Passing drag events to the image
    */
    // $(".ctap-activearea").on('click webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend mousedown mouseup mousemove touchstart touchmove touchend',function(event){
    // $(".ctap-activearea").on('click webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend mousedown mouseup mousemove touchstart touchmove touchend',function(event){
    // $(".ctap-activearea").on('click mousedown mouseup mousemove touchstart touchmove touchend',function(event){
    $(".ctap-activearea").on('click mousedown mouseup mousemove touchstart touchmove touchend',function(event){
      // event.preventDefault();
      // event.stopPropagation();
      obj = null;
      // alert('ctap-activearea clicked with event: ' + event.type +' for touchdevice: ' + isTouchDevice);
      // console.log('event registered ' + event.type );

      ctapRefId = $(this).data('ctaprefid');
      jqImgElm = $('#ctap-img-' + ctapRefId)
      $('#picsuploaded').find('.dot').removeClass('active');
      $('#picsuploaded .uploaded-images[data-img="'+jqImgElm.data('img')+'"').parent().find('.dot').addClass('active');
      switch(event.type) {
        case 'click':
            if (!isTouchDevice) {
              $('#picsuploaded').data('target', ctapRefId);
              $('.mt-top-bar#text-editor').removeClass('active');
              $('.mt-top-bar#photo-editor').toggleClass('active');
              fetchAndSetCurrFilter(jqImgElm);
              obj = fetchImgObjPlcmntArr(jqImgElm.data('img'));
              initSliderAttributes(obj);
              initImageAttributes(ctapRefId, jqImgElm, obj);
            }
          break;
        case 'mousedown':
        case 'mouseup':
        case 'mousemove':
          // Handle all the events
          if (!isTouchDevice) {
            $('#ctap-img-' + ctapRefId).trigger(event);
          }
          break;
        case 'touchstart':
        case 'touchmove':
        case 'touchend':
          // event.preventDefault();
          // Handle all the events
          if (!isTouchDevice) {
            isTouchDevice = true;
          }
          // if (isTouchDevice) {
            $('#ctap-img-' + ctapRefId).trigger(event);
          // }
          if ($('.mt-top-bar#photo-editor').hasClass('active')) {
            // Ignore
          } else {
            $('.mt-top-bar#text-editor').removeClass('active')
            $('.mt-top-bar#photo-editor').addClass('active');
            $('#picsuploaded').data('target', ctapRefId);
            fetchAndSetCurrFilter(jqImgElm);
            obj = fetchImgObjPlcmntArr(jqImgElm.data('img'));
            initSliderAttributes(obj);
            initImageAttributes(ctapRefId, jqImgElm, obj);
          }
          break;
        default:
            // Handle all the events
            // $('#ctap-img-' + ctapRefId).trigger(event);
          break;
      }
      $('#overlay').fadeIn(300);
      
      /*if ($('#eb-edit-tools').is(':hidden') && $('#eb-img-uploads').is(':hidden') && $('#options-query').is(':hidden') && ((event.type === "click") || (event.type === "touchmove") )) {
        // $('#picsuploaded').show();
        if ($('#ctap-img-0').data('img') == 0) {
          $('#photo-editor-old').fadeIn('slow');
          $('#text-editor-old').fadeOut('show');
          $('#eb-img-uploads').removeClass('hidecls');
          $('#eb-edit-tools').addClass('hidecls');
        } else {
          $('#options-query').modal();
        }
        ctapRefId = $(this).data('ctaprefid');
        $('#picsuploaded').data('target', ctapRefId);
        // // $('#photo-editor-old').removeClass('hidecls');
        // $('#photo-editor-old').show();
      } else if ($('#eb-edit-tools').is(':visible')) {
        console.log("Passing the trigger event");
        $('#ctap-img-' + ctapRefId).trigger(event);
      } else if ( ((event.type == "mousemove") || (event.type == "touchmove")) && ($('#eb-img-uploads').is(':visible')) && ($('#ctap-img-0').data('img') != 0) ) {
        console.log("Event Received: " + event.type);
        invokeModalNotify("Edit Message", "Please click on Edit button to enable editing.");
      }*/
            
    });
    // $(".ctap-activearea").on('mousedown mouseup touchstart touchmove touchend',function(event){
    //   event.preventDefault();
    //   ctapRefId = $(this).data('ctaprefid');
    //   if ($('#eb-edit-tools').is(':visible')) {
    //     $('#ctap-img-' + ctapRefId).trigger(event);
    //   }
    // });
  
    $('#edit-img-btn').on('click touchend', function() {
      // $('#picsuploaded').show();
      // ctapRefId = $(this).data('ctaprefid');
      // $('#picsuploaded').data('target', ctapRefId);
      // $('#photo-editor-old').removeClass('hidecls');
      $('#photo-editor-old').show();
      $('#eb-img-uploads').addClass('hidecls');
      $('#eb-edit-tools').removeClass('hidecls');
    });
    $('#change-img-btn').on('click touchend', function() {
      // $('#picsuploaded').show();
      // ctapRefId = $(this).data('ctaprefid');
      // $('#picsuploaded').data('target', ctapRefId);
      // $('#photo-editor-old').removeClass('hidecls');
      $('#photo-editor-old').show();
      $('#eb-img-uploads').removeClass('hidecls');
      $('#eb-edit-tools').addClass('hidecls');
    });
    /*
    * Click Ctap active area click handler
    */
   $('[id*="editor-"]').on('click', function() {
      // $('#text-editor-old').removeClass('hidecls');
      $('.mt-top-bar#photo-editor').removeClass('active');
      $('.mt-top-bar#text-editor').toggleClass('active');
      $('#text-editor-old').toggle();
      $('#photo-editor-old').fadeOut('fast');
    });
    
    /*
    * Attaching drags on components
    */
    // $(".ctap-placeholder img").drags();
    $(".ctap-placeholder img").draggable();
    /*
    * Registering clicks for button group so that clicked one can be made active whereas rest of them inactive.
    * Primarily for showing options for internal templates.
    */
    $(".btn-group > .btn").click(function(){
      $(this).addClass("active").siblings().removeClass("active");
    });
    /*
    * Updating respective Font, Size, Align and Color values for *
    * text areas
    */
    $('.font-sel, .size-sel, .color-sel, .align-sel').on('click', function(){
      $(this).addClass('active').siblings().removeClass('active');

      srcValType = $(this).data('val-type');
      propVal = $(this).data('value');
      elmId = $('#text-editor').data('target');
      console.log('Target Element is : ' + elmId);
      jqElm = $(elmId);
      jqElm.data(srcValType, propVal);

      switch(srcValType) {
        case 'font-family':
          fontSzStr = $('.size-sel.active').data('value');
          fs = getFontSize(propVal, fontSzStr)
          jqElm.css(srcValType, propVal);
          jqElm.css('font-size', fs+'px');
          adjustIntWordSpace(jqElm, propVal, fontSzStr);
          adjustLineHeight(jqElm, propVal, fontSzStr);
        break;
        case 'font-size':
          // selectedVal for size could be Normal, Large, Huge etc. Fetching the exact value.
          fontStr = jqElm.css('font-family')
          fs = getFontSize(fontStr, propVal)
          jqElm.css(srcValType, fs+'px');
          adjustIntWordSpace(jqElm, fontStr, propVal);
          adjustLineHeight(jqElm, fontStr, propVal);
        break;
        case 'color':
        case 'text-align':
            jqElm.css(srcValType, propVal);
        break;
      }
      // Sync properties
      $('#mps, #textwrap').css({'font-family': jqElm.css('font-family'), 'font-size': jqElm.css('font-size'), 'text-align': jqElm.css('text-align'), 'word-spacing': $(this).css('word-spacing'), 'line-height': $(this).css('line-height')});// This should be called once all the updates are done
    });
    
    /*
     *  Register events for color effect filters
     */
    $('.filter-sel').on('click', function(e){
      ctapRefId = getActiveCtapRefId();
      jqImgElm = $('#ctap-img-' + ctapRefId);
      filterVal = $(this).data('filter');

      console.log('Filter image clicked : ' + $(this).data('filter'))
      switch(filterVal) {
        case 'sepia':
            console.log('Applying ' + filterVal + ' to ' + jqImgElm.attr('id'))
          jqImgElm.data('img_filter', $(this).data('filter')).removeClass('grayscale sepiatone').addClass('sepiatone');
          break;
        case 'grayscale':
          console.log('Applying ' + filterVal + ' to ' + jqImgElm.attr('id'))
          jqImgElm.data('img_filter', $(this).data('filter')).removeClass('grayscale sepiatone').addClass('grayscale');
          break;
        case 'original':
          jqImgElm.data('img_filter', $(this).data('filter')).removeClass('grayscale sepiatone');
          break;
      }
      $('#eb-filters').find('.dot').removeClass('active');
      $(this).parent().find('.dot').addClass('active');
    });


    /*$('#font-selector, #size-selector, #color-selector, #align-selector').change(function(){
      var selectedVal = $(this).selectpicker('val');
      var dataType = $(this).data('type');
      srcElm = $(this).attr('id');
      elmId = $('#text-editor').data('target');
      console.log('Target Element is : ' + elmId);
      jqElm = $(elmId);
      
      // Preserve the respective selected value for selectpicker
      jqElm.data(dataType, selectedVal);

      // Apply the correct css
      switch(srcElm) {
        case 'font-selector':
          fontSzStr = $('#size-selector.selectpicker').selectpicker('val')
          fs = getFontSize(selectedVal, fontSzStr)
          jqElm.css(dataType, selectedVal);
          jqElm.css('font-size', fs+'px');
          adjustIntWordSpace(jqElm, selectedVal, fontSzStr);
          adjustLineHeight(jqElm, selectedVal, fontSzStr);
          break;
        case 'size-selector':
          // selectedVal for size could be Normal, Large, Huge etc. Fetching the exact value.
          fontStr = jqElm.css('font-family')
          fs = getFontSize(fontStr, selectedVal)
          jqElm.css('font-size', fs+'px');
          adjustIntWordSpace(jqElm, fontStr, selectedVal);
          adjustLineHeight(jqElm, fontStr, selectedVal);
          break;
        case 'color-selector':
        case 'align-selector':
          jqElm.css(dataType, selectedVal);
          break;
        default:
          break;
      }
      // Sync properties
      $('#mps, #textwrap').css({'font-family': jqElm.css('font-family'), 'font-size': jqElm.css('font-size'), 'text-align': jqElm.css('text-align'), 'word-spacing': $(this).css('word-spacing'), 'line-height': $(this).css('line-height')});// This should be called once all the updates are done

    });*/
    
    /*
    * Invoking save and preview Ajax
    */
    $('#saveprvw').on('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      if (checkPreviewData() == true) {
        previewData = preparePreviewData();
        $('body').addClass('loader');
        $('#spinner-box').removeClass('hidecls');
        $.ajax({
            url: '/cardpreview/preview/',
            type: 'post',
            beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
            data: previewData,
            context: this,
            dataType: "json",//set to JSON
            tryCount : 0,
            retryLimit : 3,
            success: function (response) {
                $('body').removeClass('loader');
                $('#spinner-box').addClass('hidecls');
                eval(response.script);
                $('.card-slider').trigger('to.owl.carousel', [0, 100])
                $('#preview-section').modal();
                $('.card-slider span.badge').eq(0).fadeIn('fast',function() {
                  console.log('SavePrvw: Calling FadeIn for ' + 0);
                  setTimeout(function() {
                      $('.card-slider span.badge').eq(0).fadeOut('fast');
                      console.log('Calling FadeOut for ' + 0);
                  }, 2000);
                });
            },
            error : function(xhr, textStatus, errorThrown ) {
                if (textStatus == 'timeout') {
                  this.tryCount++;
                  if (this.tryCount <= this.retryLimit) {
                      //try again
                      $.ajax(this);
                      return;
                  }
                  return;
                }
                $('body').removeClass('loader');
                $('#spinner-box').addClass('hidecls');
                if (xhr.status == 500) {
                  invokeModalNotify("Server Error", "Operation could not be completed. Please try again.");
                } else {
                  invokeModalNotify("Server Error", "Operation could not be completed. Please try again.");
                }
            }
        });
      }
    });

    $('.itc-selector').on('click', function(event) {
      
      actItcId = $(this).data('itc-id');
      // alert('event registered ' + event.type + ' and itc id: ' + actItcId);
      // $('.itc-selector').removeClass('active');
      // $(this).addClass('active');
      // $('.itc-selector').removeClass("active").attr('aria-pressed', 'false');
      // $(this).toggle();
      // Update style attributes for all the cfg-type tpl elements
      $(this).siblings().removeClass('active'); // if you want to remove class from all sibling buttons
      $(this).toggleClass('active');
      txtTplElems = $('div [data-tcfg-set]');
      photoTplElems = $('div [data-pcfg-set]');
      txtTplElems.each(function(){
        if ($(this).data('cfg-type') === 'tpl') {
          cfgData = $(this).data('tcfg-set')[actItcId];
          // cfgData = cfgDataCont.hasOwnProperty(actItcId.to_s)
          console.log('cfgData for ' + $(this).attr('id') + ' is: ' + cfgData);
          if (!($.isEmptyObject(cfgData))) {
            $(this).css('width', (cfgData['w']/5).toString()+'px').css('height', (cfgData['h']/5).toString()+'px').css('left', (cfgData['x']/5).toString()+'px').css('top', (cfgData['y']/5).toString()+'px').css('z-index', 30).css('display', 'block');
            console.log('Updating cfgData in if part for ' + $(this).attr('id'));
          }
          else {
            console.log('Updating cfgData in else part for ' + $(this).attr('id'));
            $(this).css('display', 'none');
          }
        }
      });
      photoTplElems.each(function(){
        if ($(this).data('cfg-type') === 'tpl') {
          cfgData = $(this).data('pcfg-set')[actItcId];
          // cfgData = cfgDataCont.hasOwnProperty(actItcId.to_s)
          if (!($.isEmptyObject(cfgData))) {
            $(this).css('width', (cfgData['w']/5).toString()+'px').css('height', (cfgData['h']/5).toString()+'px').css('left', (cfgData['x']/5).toString()+'px').css('top', (cfgData['y']/5).toString()+'px').css('z-index', 30).css('display', 'block');
            $('#ctap-activearea-'+$(this).data('ctaprefid')).css('width', (cfgData['w']/5).toString()+'px').css('height', (cfgData['h']/5).toString()+'px').css('left', (cfgData['x']/5).toString()+'px').css('top', (cfgData['y']/5).toString()+'px').css('z-index', 40).css('display', 'block');
            $(this).removeClass('height-none');
          }
          else {
            // Making the element invisible by reducing height to 0
            // $(this).css('display', 'none');
            $('#ctap-activearea-'+$(this).data('ctaprefid')).css('display', 'none');
            $(this).addClass('height-none');
          }
        }
      });
    });
    // Listen to exit events from device. Toggle the button.
    $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', exitHandler);
    
    function exitHandler() {
      if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
          ///fire your event
          $('#fs-btn, #rs-btn').toggleClass('show');
      }
    }
  } /* if (document.getElementById("card_preview_container")) */
}); /* End for document.ready() */

function updateImagePlacementInfo (ctapRefId) {
  // console.log("updateImagePlacementInfo Invoked");
  jqCtapImgElm = $('#ctap-img-' + ctapRefId);
  jqImgContElm = $('#ctap-placeholder-' + ctapRefId);
	img = jqCtapImgElm.data('img');
	var obj = {};
	var imgObj = {};
	var flag = false;
	objArrlength = imagePlacements.length;
  if (img === 0) {
    /* Initial State */
    return;
  }
	for (var i=0; i < objArrlength; i++) {
		obj = imagePlacements[i];
		if ((obj.img === img) && (obj.ctapRefId === ctapRefId)) {
			flag = true;
			imgObj = obj;
			break;
		}
	}
  
	/* Update Zoom, Rotate and X and Y Positions */
	imgObj.zoom = jqCtapImgElm.data('zoom');
	imgObj.rotation = jqCtapImgElm.data('rotate');
	imgObj.picTop = jqCtapImgElm.css('top');
  imgObj.picLeft = jqCtapImgElm.css('left');
  imgObj.imgX = Math.ceil(jqCtapImgElm.offset().left);
  imgObj.imgY = Math.ceil(jqCtapImgElm.offset().top);
  imgObj.imgContX = Math.ceil(jqImgContElm.offset().left);
  imgObj.imgContY = Math.ceil(jqImgContElm.offset().top);
	imgObj.transform = jqCtapImgElm.css('transform');
	imgObj.ctapRefId = ctapRefId;
	imgObj.img = img;
  
	if (flag != true) {
		// console.log("Pushing new obj for ctaprefid : " + ctapRefId);
		imagePlacements.push(imgObj);
  }
  // console.log("UpdImgPlacement: imgX: " + jqCtapImgElm.offset().left + " imgY: " + jqCtapImgElm.offset().top + " imgContX: " + jqImgContElm.offset().left + " imgContY: " + jqImgContElm.offset().top);
};
/*
	* Init Image Attributes. This function is called for the first time when the uploaded image is clicked.
	* This function initializes all the essential styling and data attributes so that image looks well contained
  * with all the desired styles. This function would also be invoked when pic thumbnails are clicked the to restore
  * the previously saved image attributes
	*/
function initImageAttributes(ctapRefId, jqImgElm, obj) {
	jqParentElm = $('#ctap-placeholder-' + ctapRefId);
	cWidth = jqParentElm.width();
	cHeight = jqParentElm.height();
	imgW = parseInt(jqImgElm.data('width')); /* parseInt essential else data was treated like string */
	imgH = parseInt(jqImgElm.data('height')); /* parseInt essential else data was treated like string */
	
	ratioWidth = imgW/(cWidth.toFixed(2));
	ratioHeight = imgH/(cHeight.toFixed(2));

	if (ratioWidth > ratioHeight) {
			sHeight = cHeight
			sWidth = Math.ceil(imgW * sHeight/imgH);
			// alert(" ratioWidth " + ratioWidth + " > ratioHeight  : " + ratioHeight);
	} else {
			sWidth = cWidth
			sHeight = Math.ceil(imgH * sWidth/imgW);
			// alert(" ratioWidth " + ratioWidth + " < ratioHeight  : " + ratioHeight);
	}
  upldId = jqImgElm.data('img');
  console.log('upldId is ' + upldId);
	if (obj === null) {
    console.log('Obj is NULL');
    // $('#ctap-img-' + ctapRefId).attr({'src': jqImgElm.attr('src'), 'data-width': imgW, 'data-height': imgH, 'data-img': upldId}).css({'position': 'absolute','width': sWidth + 'px', 'height': sHeight + 'px', left: '50%', top: '50%', 'transform': 'translate(-50%, -50%)'});
    // $('#ctap-img-' + ctapRefId).attr('src', jqImgElm.attr('src')).data({'width': imgW, 'height': imgH, 'img': upldId}).css({'position': 'absolute','width': sWidth + 'px', 'height': sHeight + 'px', left: '50%', top: '50%', 'transform': 'translate(-50%, -50%)'});
    // $('#ctap-img-' + ctapRefId).attr('src', jqImgElm.attr('src')).data({'width': imgW, 'height': imgH, 'img': upldId}).css({'position': 'absolute','width': sWidth + 'px', 'height': sHeight + 'px', left: '50%', top: '50%'});
    // applyCenterMargins($('#ctap-img-' + ctapRefId), sWidth, sHeight);
    $('#ctap-img-' + ctapRefId).attr('src', jqImgElm.attr('src')).data({'width': imgW, 'height': imgH, 'img': upldId}).css({'width': sWidth + 'px', 'height': sHeight + 'px', left:((cWidth-sWidth)/2)+'px',top:((cHeight-sHeight)/2)+'px','transform':''});
    // applyCenterMargins($('#ctap-img-' + ctapRefId), sWidth, sHeight);
    // console.log('After applyCenterMargins: margins applied: margin-left='+$('#ctap-img-' + ctapRefId).css('margin-left')+' margin-top='+ $('#ctap-img-' + ctapRefId).css('margin-top'));
    // $('#ctap-img-' + ctapRefId).css('transform','none');
    // $('#ctap-img-' + ctapRefId).css('transform','');
    
	} else {
		console.log('Obj is not NULL');
    // $('#ctap-img-' + ctapRefId).attr({'src': jqImgElm.attr('src'), 'data-width': imgW, 'data-height': imgH, 'data-img': upldId}).css({'position': 'absolute','width': sWidth + 'px', 'height': sHeight + 'px', left: obj.picLeft, top: obj.picTop, 'transform': 'translate(-50%, -50%)rotate('+obj.rotation+'deg)scale('+obj.zoom+')'});
    // $('#ctap-img-' + ctapRefId).attr('src', jqImgElm.attr('src')).data({'width': imgW, 'height': imgH, 'img': upldId}).css({'position': 'absolute','width': sWidth + 'px', 'height': sHeight + 'px', left: obj.picLeft, top: obj.picTop, 'transform': 'translate(-50%, -50%)rotate('+obj.rotation+'deg)scale('+obj.zoom+')'});
    $('#ctap-img-' + ctapRefId).attr('src', jqImgElm.attr('src')).data({'width': imgW, 'height': imgH, 'img': upldId}).css({/*'position': 'absolute',*/'width': sWidth + 'px', 'height': sHeight + 'px', left: obj.picLeft, top: obj.picTop, 'transform': obj.transform});
  }
  console.log("Updated Img id is " + $('#ctap-img-' + ctapRefId).data('img')+ " and data-img attr: " + $('#ctap-img-' + ctapRefId).attr('data-img'));
};

/*
 *	Initialise/Restore sliders as its a common sliders thats being used across the images. When images are clicked
 *  We need to restore the slider values too.
 */
function initSliderAttributes(obj) {
  
  var rotSlider = document.getElementById('rotation-slider');
  var zoomSlider = document.getElementById('zoom-slider');
  // jqZoomSliderElm = $('#zoom-slider');
  // jqRotationSliderElm = $('#rotation-slider');
	if (obj === null) {
    console.log("initSliderAttributes: Object NULL")
		/* defaults */
		rotationValue = 0;
		zoomValue = 1;
	} else {
		rotationValue = parseInt(obj.rotation);
    zoomValue = parseFloat(obj.zoom);
    console.log('initSliderAttributes: Values from obj => rot: ' + rotationValue + ' zoom: ' + zoomValue);
  }
  // jqRotationSliderElm.slider({'setValue': rotationValue, 'stopPropagation': true});
  // jqZoomSliderElm.slider('setValue', zoomValue);
  //$('#rotation-slider').val(rotationValue).trigger('input');
  //$('#zoom-slider').val(zoomValue).trigger('input');
  rotSlider.noUiSlider.set([rotationValue]);
  zoomSlider.noUiSlider.set([zoomValue]);

};

/*
 *	Initialise/Restore utilities such as placeholder text visiblity and close image icon
 */
function initImgActiveUtils(ctapRefId) {
  $('#ctap-text-' + ctapRefId + ', #ctap-closeimg-' + ctapRefId).addClass('active');
};
/*
 *	Restore initial utilities values such as placeholder text visiblity and close image icon
 */
function deinitImgActiveUtils(ctapRefId) {
  $('#ctap-text-' + ctapRefId + ', #ctap-closeimg-' + ctapRefId).removeClass('active');
};
/*
	* DRAGS Function - enables dragging functionality
	*/
$.fn.drags = function(opt) {
	opt = $.extend({handle:"",cursor:"move"}, opt);
	if(opt.handle === "") {
			var $el = this;
	} else {
			var $el = this.find(opt.handle);
	}
	return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
			if(opt.handle === "") {
					var $drag = $(this).addClass('draggable');
			} else {
					var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
			}
			var z_idx = $drag.css('z-index'),
					drg_h = $drag.outerHeight(),
					drg_w = $drag.outerWidth(),
					pos_y = $drag.offset().top + drg_h - e.pageY,
					pos_x = $drag.offset().left + drg_w - e.pageX;
			$drag.css('z-index', 1000).parents().on("mousemove", function(e) {
					$('.draggable').offset({
							top:e.pageY + pos_y - drg_h,
							left:e.pageX + pos_x - drg_w
					}).on("mouseup", function() {
            // console.log('drags mouseup fired: ' + e.target.id);
							$(this).removeClass('draggable').css('z-index', z_idx);
					});
			});
			e.preventDefault(); // disable selection
	}).on("mouseup", function(e) {
			if(opt.handle === "") {
					$(this).removeClass('draggable');
			} else {
					$(this).removeClass('active-handle').parent().removeClass('draggable');
			}
			// if ($(this).is('img') && ($(this).attr('id').indexOf('ctap-img-') != -1)) {
			// 	ctapRefId = getActiveCtapRefId();
			// 	if (ctapRefId !== undefined) {
			// 		// updateImagePlacementInfo(ctapRefId);
			// 	}
			// }
	});
};
/*
 * Utility Functions for pushing respective content to the data array
 */
function pushPreviewImgData(previewInfo, page) {
  // selector = '#'+page+'view [id*="ctap-img-"]';
  selector = '#'+page+'view [id*="ctap-placeholder-"]';
  jqPrimaryImgs = $('#'+page+'view .primary-images');
    
  numObjs = imagePlacements.length

  // Prepare Image Data and push
  $(selector).each(function() {
    imgData = {};
    found = false;

    tplType = $(this).data('cfg-type');
    pcfgSetCont = $(this).data('pcfg-set')
    // Check if this object is eligible to be pushed
    // If its part of template then it should have the relevant cfg.
    if (((tplType === "tpl")
                      && (pcfgSetCont.hasOwnProperty(previewInfo.inside_tpl_id)) === true) ||
                      ($(this).data('cfg-type') === "fixed"))
    {
      if (tplType === "tpl") {
        pcfg_set = pcfgSetCont[previewInfo.inside_tpl_id];
        // imgData['card_x'] = jqImgContElm.offset().left;
        // imgData['card_y'] = jqImgContElm.offset().top;
      }
      else {
        pcfg_set = pcfgSetCont;
        // imgData['card_x'] = jqPrimaryImgs.offset().left;
        // imgData['card_y'] = jqPrimaryImgs.offset().top;
      }
      ctapRefId = $(this).data('ctaprefid')
      jqImgElm = $('#ctap-img-' + ctapRefId);
      jqImgContElm = $('#ctap-placeholder-' + ctapRefId);
  
      img = jqImgElm.data('img');
      
      for (var i=0; i < numObjs; i++) {
        obj = imagePlacements[i];
        if ((obj.img === img) && (obj.ctapRefId === ctapRefId)) {
          found = true;
          break;
        }
      }
      if (found === true) {
        imgData['card_x'] = obj.imgContX;
        imgData['card_y'] = obj.imgContY;
        imgData['upld_img_x'] = obj.imgX;
        imgData['upld_img_y'] = obj.imgY;
      }
      else {
        imgData['card_x'] = jqImgContElm.offset().left;
        imgData['card_y'] = jqImgContElm.offset().top;
        imgData['upld_img_x'] = jqImgElm.offset().left;
        imgData['upld_img_y'] = jqImgElm.offset().top;
      }
      
      imgData['id'] = jqImgElm.id;
      imgData['img_upld_id'] = jqImgElm.data('img');
      imgData['img_ref_id'] = pcfg_set.id
      imgData['img_zoom'] = jqImgElm.data('zoom');
      imgData['img_rotate'] = jqImgElm.data('rotate');
      // imgData['upld_img_x'] = jqImgElm.offset().left;
      // imgData['upld_img_y'] = jqImgElm.offset().top;
      imgData['img_width'] = jqImgElm.width();
      imgData['img_height'] = jqImgElm.height();
      imgData['img_filter'] = jqImgElm.data('img_filter');
      //Push the entry
      previewInfo[page]['image'].push(imgData);
    }
  });
}
function pushPreviewTextData(previewInfo, page) {
  selector = '#'+page+'view [id*="editor-"]';
  jqElm = $(selector);
  // Prepare  Text Data and push
  $(selector).each(function() {
    textData = {};
    found = false;

    tplType = $(this).data('cfg-type');
    tcfgSetCont = $(this).data('tcfg-set')
    // Check if this object is eligible to be pushed
    // If its part of template then it should have the relevant cfg.
    if (((tplType === "tpl")
                      && (tcfgSetCont.hasOwnProperty(previewInfo.inside_tpl_id)) === true) ||
                      ($(this).data('cfg-type') === "fixed"))
    {
      if (tplType === "tpl") {
        tcfg_set = tcfgSetCont[previewInfo.inside_tpl_id];
      }
      else {
        tcfg_set = tcfgSetCont;
      }
      textData['tcfg_ref_id'] = tcfg_set.id;
      textData['text'] = addNewLines($(this).data('quill'));
      textData['font'] = $(this).data('font-family');
      textData['fontsize'] = fontMap[$(this).data('font-family')][$(this).data('font-size')];
      textData['fontstyle'] = 'Normal';
      textData['align'] = $(this).data('text-align');
      textData['rotation'] = 0;
      textData['color'] = $(this).data('color');
      //Push the entry
      previewInfo[page]['text'].push(textData);
    }
    
  });
}
/*
 * Preview Data preparation
 */
function preparePreviewData () {
	previewInfo = imgData = textData = {};
  ctapRefId = 0;
  selectedInsideTpl = 1;
  pages = ['front', 'inside'];
  jqElm = $('#ctap-img-' + ctapRefId);
  /* We need to essentially 4 hashes that would present data for : Front-Image, Front-Text, Inside-Image and Inside-Text */
  /* We shall check their presence too and inclde it in the data */
  numFrontImgs = $('#frontview .ctap-placeholder-img').length;
  numInsideImgs = $('#insideview .ctap-placeholder-img').length;
  numFrontTas = $('#frontview .text-box').length;
  numInsideTas = $('#insideview .text-box').length;
  previewInfo = {
    'variant_id': $('#card_preview').data('vid'),
    'inside_tpl_id': $('#inside-templates .active').data('itc-id'),
    'front': {
      'image':[],
      'text': []
    },
    'inside': {
      'image':[],
      'text': []
    },
  }
  for (i=0; i < pages.length; i++) {
    pushPreviewImgData(previewInfo, pages[i]);
    pushPreviewTextData(previewInfo, pages[i]);
  }
    
	jqElm = $('#ctap-img-' + ctapRefId);
	
	return previewInfo;
};

/*
 * get Active Ctap Ref Id
 */
function getActiveCtapRefId () {
	return $('#picsuploaded').data('target')
};
/*
 * Init Card Preview Events
 */
function initCardEditPreviewEvents () {
  $('#preview-container').carousel({
    interval: false,
    cycle: true
  });
  /* Card Edit */
  /*$('#card-edit-btn').on('click touchend', function(e){
    $('.edit-elm').removeClass('hidecls');
    $('.preview-elm').addClass('hidecls');
  });*/
  /* Clear Photo */
  $('#clear-photo').on('click touchend', function(){
    ctapRefId = getActiveCtapRefId();
    console.log('Clearing Photo for ' + '#ctap-img-' + ctapRefId);
    // $('#ctap-img-' + ctapRefId).attr({'src': '/assets/noimage.png', 'data-width': 0, 'data-height': 0, 'data-img': 0, 'data-zoom': 1, 'data-rotate': 0, 'data-img': 0})
    $('#ctap-img-' + ctapRefId).attr('src', '/assets/noimage.png').data('width', 0).data('height', 0).data('img', 0).data('zoom', 0).data('rotate', 0);
    /* Reset Slider Values */
    initSliderAttributes(null);
    showHideCtapText(ctapRefId);
    //$('#eb-edit-tools').fadeOut('slow');
    //$('#eb-img-uploads').removeClass('hidecls');
  });
  /* Upload Area */
  $('#edit-area').on('click touchend', function(){
    $('#eb-edit-tools').fadeIn('slow');
    $('#eb-img-uploads').addClass('hidecls');
  });
  /* Upload Area */
  $('#upload-area').on('click touchend', function(){
    $('#eb-edit-tools').fadeOut('slow');
    $('#eb-img-uploads').removeClass('hidecls');
  });
  /* Reset Photo */
  $('#reset-photo').on('click touchend', function(){
    ctapRefId = getActiveCtapRefId();
    // $('#rotation-slider, #zoom-slider').each(function() {
    //   defVal = $(this).data('slider-value');
    //   $(this).slider('setValue', defVal, true);
    //   $('.slider').trigger('change');
    // });
    /* Reset Slider Values */
    initSliderAttributes(null);
    /* Refresh Sliders for image to take effect */
    // $('.slider').trigger('change');
    showHideCtapText(ctapRefId);
  });
  // Register click events for text to be added to textbox
  $('.add-to-tb').on('click touchend', function(e){
    editorTxt = "";
    e.preventDefault();
    e.stopPropagation();
    jqTgtElm = $($('#text-editor').data('target'));
    editor = jqTgtElm.data('quill');
    /* Adjusting newline instance in case of blank editor */
    (editor.getLength() != 1) ? (editorTxt = editor.getText()) : (editorTxt = "");
    editor.setText(editorTxt+$(this).closest('.card-body').find('.add-to-tb-text').text())
    $('#msg-notify-container span.badge-pill').fadeIn('fast',function() {
      setTimeout(function() {
          $('#msg-notify-container span.badge-pill').fadeOut('fast');
      }, 1000);
    });
    var btn = $(this);
    btn.prop('disabled', true);
    setTimeout(function(){
        btn.prop('disabled', false);
    }, 1500);
  });
  $('.img-utils-btn').on('click', function() {
    ctapRefId = getActiveCtapRefId();
    jqImgElm = $('#ctap-img-' + ctapRefId);
    if (jqImgElm.data('img') != 0) {
      $($(this).data('target-ref')).modal();
    } else {
      invokeModalNotify('Image Unavailable', 'Please Select image from Uploads');
    }
  })
  $('#clear-btn').on('click touchend', function(){
    jqTgtElm = $($('#text-editor').data('target'));
    editor = jqTgtElm.data('quill');
    editor.setText("");
  });
  $('#done-btn').on('click touchend', function(){
    $('#text-editor-old').fadeOut('fast');
  });
  $('.mt-top-bar .close').on('click', function() {
    $('.mt-top-bar#photo-editor, .mt-top-bar#text-editor').removeClass('active');
  })
  $('#add-to-cart-button').on('click', function() {
    normalUnload = true;
  });
}
/*
 *  Init Quill Editor
 */
function initQuill() {
  // Add fonts to whitelist
  var Font = Quill.import('formats/font');
  // We do not add Sans Serif since it is the default
  Font.whitelist = ['lavanderia', 'carried-away', 'daydreamer', 'peach-and-pistachio', 'smoothy-script', 'grounday'];
  Quill.register(Font, true);

  // Quill.debug('info');
  // $('.selectpicker').selectpicker();
  
  $('[id*="editor-"]').each(function(index, obj){
    // console.log("Quill Initiated: " + $(this).attr('id'));
    editor = new Quill('#'+$(this).attr('id'), {
      "modules": {
        "toolbar": false
      },
      theme: 'snow',
      placeholder: 'Write your message...',
    });
    $(this).data('quill', editor);
  });
  /*
   * quill - Inherit certain properties from parent editors. Few properties are not being controlled by quill
   * toolbar and hence they need to be inherited from parent editors.
   * This override needs to be done only after editors have been initialized.
   */
  $('.ql-editor').css('word-spacing', 'inherit').css('line-height', 'inherit').css('text-align', 'inherit');
  /*
   * Initialize placeholder elements for text manipulation
   */
  jqMpsElm = $('<div id="mps" style="width:'+allowedWidth+'px;height:auto"></div>').hide().appendTo(document.body);
  jqTxtWrapElm = $('<p id="textwrap" style="width:auto;height:auto"></p>').hide().appendTo(document.body);
  //$('.text-editor').drags();
  $('.text-editor').draggable();
  
};

/*
 * Text Processor
 */
function addNewLines(editor) {
  
  text = editor.getText();
  justHtml = editor.root.innerHTML;
  $('#mps').html(justHtml);

  var para = $('#mps p');
  var totalText = ' '
  var textContent = '';
  
  
  para.each(function(){
    var current = $(this);
    var text = current.text();
    var wordsArr = text.split(' ');
    var newLine = '';
        
    // current.text(wordsArr[0]);
    // text = wordsArr[0];
    text = ''
    var updatedText = '';
    // var height = current.height();
    // var width = $('#mps').width();
    
    jqTxtWrapElm.text(wordsArr[0]); /* Initialize the text wrap element */
    // var height = jqTxtWrapElm.height();
    // console.log('Width of current : ' + width + " height : " + height + " wordsArr[0] " + wordsArr[0]);
    
    // Lets take the next word. If the word itself is larger than the width we need to
    // handle it character by character
    for(var i = 0; i < wordsArr.length; i++) {
      word = wordsArr[i];
      jqTxtWrapElm.text(newLine + word);
      // console.log('jqTxtWrapElm.width(): ' + jqTxtWrapElm.width());
      // console.log('Text so far is: ' + jqTxtWrapElm.text());
      if (jqTxtWrapElm.width() > allowedWidth) {
        // Newly added word cant be accommodated. Break the line
        textContent = textContent + newLine + '\n';
        newLine = word;
        // Check if the word itself is longer than the width
        jqTxtWrapElm.text(word);
        if (jqTxtWrapElm.width() > allowedWidth) {
          // initialize newline
          newLine = ''
          for (var j=0; j < word.length; j++) {
            letter = word[j];
            jqTxtWrapElm.text(newLine + letter);
            if (jqTxtWrapElm.width() > allowedWidth) {
              // console.log('Newline: ' + newLine)
              textContent = textContent + newLine + '\n';
              newLine = letter;
              // console.log('pending letter: ' + letter);
            } else {
              newLine = newLine + letter;
            }
          }
        }
        // else {
        //   textContent = textContent + newLine + '\n';
        //   newLine = word;
        //   jqTxtWrapElm.text(newLine)
        // }
      } else {
        newLine = newLine + word;
      }
      newLine = newLine + ' '
    }
    /*
     * Add the pending line
     */
    textContent = textContent + newLine



    // if ((jqTxtWrapElm.text().length > 0) && ((jqTxtWrapElm.width() > allowedWidth))) {
    //   /* Word itself is pretty large than the width, shall be split into different wordsArr */
    //   for (i=0; i < jqTxtWrapElm.length; i++) {
    //     text = jqTxtWrapElm.text();
    //     jqTxtWrapElm.text(text + wordsArr[0][i]);
    //     if (jqTxtWrapElm.width() > width) {
    //       updatedText = text + '\n';
    //       jqTxtWrapElm.text(wordsArr[0][i]);
    //     }
    //   }
    // }
    // for(var i = 0; i < wordsArr.length; i++) {
      
    //   if (jqTxtWrapElm.text().length > 0) {
    //     jqTxtWrapElm.text(text + ' ' + wordsArr[i]);
    //   } else {
    //     jqTxtWrapElm.text(wordsArr[i]);
    //   }
      
      
    //   if(jqTxtWrapElm.width() > 268) {
    //     jqTxtWrapElm.text(wordsArr[i]);
    //     console.log('jqTxtWrapElm Height: ' + jqTxtWrapElm.height() + ' is greater than ' + height);
    //     console.log(jqTxtWrapElm.text());
    //     updatedText = updatedText + '\n' + wordsArr[i];
    //     // height = current.height();
    //     console.log(wordsArr[i-1]);
    //   }
    //   else {
    //     text = jqTxtWrapElm.text();
    //     console.log("else with current height " + current.height() + " width " + current.width());
    //     updatedText = text;
    //   }
    // }
    // // console.log(updatedText);
    // if (totalText.length > 0) {
    //   totalText = totalText + '\n' + updatedText;
    // } else {
    //   totalText = updatedText;
    // }
    textContent = textContent + '\n';
  });
  textContent = textContent.replace(/'/g, "\\'");
  // console.log(textContent);
  return textContent;
};

function editorTextTrim(editor, source) {
  containerId = editor.container.id

  text = editor.getText();
  justHtml = editor.root.innerHTML;
  $('#mps').html(justHtml);
  allowedHeight = $('#' + containerId + ' .ql-editor').height();
  contentHeight = $('#mps').height();

  console.log('editorTextTrim: containerId: ' + containerId + ' contentHeight = ' + contentHeight + ' allowedHeight = ' + allowedHeight);
  if (contentHeight > allowedHeight) {
    editor.deleteText(editor.getLength()-2, editor.getLength()-1, source);
    invokeModalNotify('Text Limit Exceeded', "Additional text will not be included.")
  }
  else {
    allowedLength = editor.getLength();
  }
};

function restoreToolbarStates(editor) {
  tbElm = $('#text-editor');
  console.log('Font stored in Editor id:(' + editor.attr('id') + ') ' + editor.data('font-family') );
  $('.font-sel, .size-sel, .color-sel, .align-sel').removeClass('active')
  $('.font-sel[data-value="'+editor.data('font-family')+'"').addClass('active');
  $('.size-sel[data-value="'+editor.data('font-size')+'"').addClass('active');
  $('.color-sel[data-value="'+editor.data('color')+'"').addClass('active');
  $('.align-sel[data-value="'+editor.data('text-align')+'"').addClass('active');
  // $('#font-selector').selectpicker('val', editor.data('font-family'));
  // $('#size-selector').selectpicker('val', editor.data('font-size'));
  // $('#color-selector').selectpicker('val', editor.data('color'));
  // $('#align-selector').selectpicker('val', editor.data('text-align'));
  console.log('Value Restored for font is : ' + editor.data('font-family'));
};

/*
 * Photo Areas Init Functions
 */
function initPhotoAreas() {
    
  var defInTplIdKey = $('#inside-templates [data-itc-id]').first().data('itc-id').toString();
  var cfgData = {};
  
  front_img_pos = $('#frontview .primary-images').offset();
  inside_img_pos = $('#insideview .primary-images').offset();

  jqAllPhotoEditors.each(function() {
    if ($(this).data('cfg-type') == "fixed") {
      cfgData = $(this).data('pcfg-set');
    }
    else if ($(this).data('cfg-type') == "tpl") {
      cfgData = $(this).data('pcfg-set')[defInTplIdKey];
    }
    if (!($.isEmptyObject(cfgData))) {
      $(this).css('width', (cfgData['w']/5).toString()+'px').css('height', (cfgData['h']/5).toString()+'px').css('left', (cfgData['x']/5).toString()+'px').css('top', (cfgData['y']/5).toString()+'px').css('z-index', 0);
      $('#ctap-activearea-'+$(this).data('ctaprefid')).css('width', (cfgData['w']/5).toString()+'px').css('height', (cfgData['h']/5).toString()+'px').css('left', (cfgData['x']/5).toString()+'px').css('top', (cfgData['y']/5).toString()+'px').css('z-index', 20);
    }
  });
  
}
/*
 * Text Areas Init Functions
 */
function initTextAreas() {
  
  var font = $('.font-sel.active').val() || 'Lavanderia';
  fontSizeStr = $('.size-sel.active').val() || 'Normal'
  var fontSize = fontMap[font][fontSizeStr]+'px';
  var color = '#000';
  var align = 'left';
  var defInTplIdKey = $('#inside-templates [data-itc-id]').first().data('itc-id').toString();
  var cfgData = {};
  
  front_img_pos = $('#frontview .primary-images').offset();
  inside_img_pos = $('#insideview .primary-images').offset();
  
  jqAllTxtEditors.each(function() {
    $(this).css('font-family', font).css('font-size', fontSize).css('color', color).css('text-align', align);
    $(this).data('font-family', font).data('font-size', fontSizeStr).data('color', color).data('text-align', align);
    adjustIntWordSpace($(this), font, fontSizeStr);
    adjustLineHeight($(this), font, fontSizeStr);

    if ($(this).data('cfg-type') == "fixed") {
      cfgData = $(this).data('tcfg-set');
    }
    else if ($(this).data('cfg-type') == "tpl") {
      cfgData = $(this).data('tcfg-set')[defInTplIdKey];
    }
    if (!($.isEmptyObject(cfgData))) {
      $(this).css('width', (cfgData['w']/5).toString()+'px').css('height', (cfgData['h']/5).toString()+'px').css('left', (cfgData['x']/5).toString()+'px').css('top', (cfgData['y']/5).toString()+'px').css('z-index', 30);
      /* Init respective text edit toolbar */
      $(this).siblings('.text-edit-toolbar').css('left', (cfgData['x']/5).toString()+'px').css('top', ((cfgData['y']/5)-35).toString()+'px').css('z-index', 40);
    }
  });
  
}
/*
 * Init scroll behaviour for links on page
 * Top scroll the sections when clicked. Applicable for all pages.
 */
function initScrollBehaviour () {
    $( "a.scrollLink" ).click(function( event ) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: $($(this).attr("href")).offset().top }, 500);
    });
}
/*
 * General Setting and Configuration
 */
function initGeneral () {
  /* Initialize the default template */
  $('#inside-templates [data-itc-id]:first-child').addClass('active');
  $('.toggle-pages').not('#frontview').hide();
  $('#frontview.toggle-pages.c-5x7').addClass('d-flex justify-content-center')
  // $('#frontview').show();
  /* Enable only relevant front page template btn groups */
  $('.templates-btn-grp [id*="-templates"]').not('.templates-btn-grp #front-templates').css('visibility', 'hidden');
  //$('#photo-editor-old, #text-editor-old').drags().hide();
  // $('#photo-editor-old, #text-editor-old, .bd-font-modal-sm').draggable().hide();
  // $('#text-editor-old').drags();
  initQuill();

  /*$('[id*="ctap-img-"]').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend mousedown mouseup touchstart touchmove touchend',
  function(e) {
    console.log('Event detected' + e.type);
    // console.log("Calling updateImagePlacementInfo for id " + e.target.id);
    updateImagePlacementInfo($(this).data('ctaprefid'));
  });*/
  $('[id*="ctap-img-"]').on('touchstart mousedown', dragStart).on('touchend mouseup', dragEnd).on('touchmove mousemove', drag);
  /*container.addEventListener("touchstart", dragStart, false);
  container.addEventListener("touchend", dragEnd, false);
  container.addEventListener("touchmove", drag, false);

  container.addEventListener("mousedown", dragStart, false);
  container.addEventListener("mouseup", dragEnd, false);
  container.addEventListener("mousemove", drag, false);*/


  initCardEditPreviewEvents();
  initSliders();
  initModalEvents();
  // Initializing bootstrap file inputs
  $('input[type=file]').bootstrapFileInput();
  $('.file-inputs').bootstrapFileInput();
  /* Request FullScreen */
  $('#fs-btn, #rs-btn').on('click touchend', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (screenfull.enabled) {
      switch($(this).data('role'))
      {
        case 'request':
            screenfull.request();
            $('#fs-btn, #rs-btn').toggleClass('show');
          break;
        case 'exit':
          screenfull.exit();
          // Toggle would happen as part of exitHandler
          break;
        default:
          break;
      }
    } else {
      // Ignore or do something else
    }
  });
  $('#rs-btn').on('click touchend', function() {
    if (screenfull.enabled) {
      screenfull.exit();
    } else {
      // Ignore or do something else
    }
  });
  // $('#fullscreen-btn').trigger('click');
  // $('#fullscreen-btn').click();
  $('#clear-ta-content').on('click', function() {
    if (confirm("Are you sure you want to delete the entire text ?")) {
      // your deletion code
      jqTgtElm = $($('#text-editor').data('target'));
      editor = jqTgtElm.data('quill');
      editor.setText('');
    }
    return false;
  });
}
function initPrvwModalViews () {
  resizeModalOnDevice();
  initCardPrvwPages ();
}

function initModalEvents() {
  console.log('Registration Done');
  $('.product-image').on('click', function() {
    
    $('#product-modal .owl-carousel div').each(function () {
      console.log('Changing css');
      $(this).css('background', "center center url('/assets/img/photo/malvestida-magazine-458585-unsplash.jpg')");
    });
    $('#product-modal').modal('toggle');
  });
  /* Changing backdrop z-index in case of multiple modals */
  $('.modal').on('show.bs.modal', function (event) {
    var idx = $('.modal:visible').length;
    $(this).css('z-index', 1050 + (10 * idx));
    console.log('show.bs.modal');
  });
  $('.modal').on('shown.bs.modal', function (event) {
      var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
      $('.modal-backdrop').not('.stacked').css('z-index', 1049 + (10 * idx));
      $('.modal-backdrop').not('.stacked').addClass('stacked');
      console.log('shown.bs.modal');
  });
  /* In case of multiple modals modal-open shouldn't get removed from body in case other modals are still open */
  $('body').on('hidden.bs.modal', function () {
    if($('.modal.show').length > 0)
    {
      $('body').addClass('modal-open');
    }
  });
  if (device != "xs") {
    $("#img-zoom-rotate, #upload-section, #img-filters").draggable();
  }
  initPrvwModalViews();
}
function getFontSize (fontSelected, fontSzStr) {
  if (fontSelected != undefined){
    font = fontSelected.replace(/["']/g, "");
    fontSzVal = fontMap[font][fontSzStr];
    return (fontSzVal);
  }
}

function setFontSize (elm, fontSize) {
  $(elm).css('font-size', fontSize+"px");
}

function adjustLineHeight(jqElm, fontSelected, fontSzStr) {
  jqElm.each(function(){
    switch(fontSelected)
    {
      case 'Lavanderia':
          switch(fontSzStr)
          {
            case 'Normal':
              lhVal = '26px';
              break;
            case 'Large':
              lhVal = '26px';
              break;
            case 'Huge':
              lhVal = '30px';
              break;
          }
        break;
      case 'Daydreamer':
          switch(fontSzStr)
          {
            case 'Normal':
              lhVal = '23px';
              break;
            case 'Large':
              lhVal = '23px';
              break;
            case 'Huge':
              lhVal = '25px';
              break;
          }
        break;
      case 'Carried Away':
          switch(fontSzStr)
          {
            case 'Normal':
              lhVal = '23px';
              break;
            case 'Large':
              lhVal = '25px';
              break;
            case 'Huge':
              lhVal = '26px';
              break;
          }
        break;
      case 'Peach And Pistachio':
          switch(fontSzStr)
          {
            case 'Normal':
              lhVal = '25px';
              break;
            case 'Large':
              lhVal = '26px';
              break;
            case 'Huge':
              lhVal = '26px';
              break;
          }
        break;
      case 'Smoothy Script':
          switch(fontSzStr)
          {
            case 'Normal':
              lhVal = '24px';
              break;
            case 'Large':
              lhVal = '26px';
              break;
            case 'Huge':
              lhVal = '27px';
              break;
          }
        break;
      case 'Grounday':
          switch(fontSzStr)
          {
            case 'Normal':
              lhVal = '34px';
              break;
            case 'Large':
              lhVal = '35px';
              break;
            case 'Huge':
              lhVal = '36px';
              break;
          }
        break;
      default:
        lhVal = '23px';
        break;
    }
    this.style.setProperty('line-height', lhVal, 'important');
  });
}
function adjustIntWordSpace(jqElm, fontSelected, fontSzStr) {
  jqElm.each(function(){
    switch(fontSelected)
    {
      case 'Smoothy Script':
      case 'Carried Away':
        iws = '-2px';
        break;
      case 'Peach And Pistachio':
        switch(fontSzStr)
        {
          case 'Normal':
            iws = '0px';
            break;
          case 'Large':
            iws = '-1px';
            break;
          case 'Huge':
            iws = '-1px';
            break;
        }
        break;
      
      default:
        iws = '0px';
        break;
    }
    this.style.setProperty('word-spacing', iws, 'important');
  });
}
/*
 * Update Handler for rotation slider
/*
function
 * Create a Slider with all the correct arguments
 */
function createSlider(sliderObj, startVal, stepVal, minVal, maxVal) {
  noUiSlider.create(sliderObj, {
                      start: startVal,
                      step: stepVal,
                      animate: true,
                      animationDuration: 300,
                      behaviour: 'tap-drag',
                      range: {
                          'min': minVal,
                          'max': maxVal
                      }
                    });

    sliderObj.noUiSlider.on('update', function (values, handle) {
      // console.log('Values are: ' + values[handle] + ' for id : ' + this.target.id);
      /////
      // $(this).next(value).html(this.value);
      // var sourceCtg = $(this).data('source-ctg');
      // var re = /(rotate)(\(.*(?:deg\)))/g; //regex to match rotateZ(...deg)
      // var tr = /(scale)(\(.*(?:\)))/g; //regex to match scale(...)
      var zoomnewvalue = zoomoldvalue = 1;
      var rotnewvalue = rotoldvalue = 0;
      ctapRefId = getActiveCtapRefId();
      if(typeof ctapRefId !== "undefined")
      {
        jqCtapElm = $('#ctap-img-' + ctapRefId);
        trMatrix = fetchTransformMatrix($('#ctap-img-'+ctapRefId).data('img'));
        // on slide did not update on click (jump)
        switch(this.target.id) {
          case 'rotation-slider':
            var rotnewvalue = values[handle]
            // var rotoldvalue = parseInt($sibling.val());
            // if(rotoldvalue != rotnewvalue)
            // {
            //   $sibling.val(rotnewvalue)
            // }
            // fetch zoom value
            zoomnewvalue = jqCtapElm.data('zoom');
            //update rotate
            jqCtapElm.data('rotate', rotnewvalue);
            break;
          case 'zoom-slider':
            var zoomnewvalue = values[handle]
            // var zoomoldvalue = parseFloat($sibling.val()).toFixed(2);
            // if(zoomoldvalue != zoomnewvalue)
            // {
            //   $sibling.val(zoomnewvalue)
            // }
            // fetch rotate value
            rotnewvalue = jqCtapElm.data('rotate');
            // update zoom
            jqCtapElm.data('zoom', zoomnewvalue);
            break;
          default:
            return;
        }
        
        // jqCtapElm.css('transform', 'translate(-50%,-50%)scale('+zoomnewvalue+')rotate('+rotnewvalue+'deg)');
        // jqCtapElm.css('transform', 'scale('+zoomnewvalue+')rotate('+rotnewvalue+'deg)');
        jqCtapElm.css('transform', 'translate('+trMatrix['dx']+'px, '+trMatrix['dy']+'px)scale('+zoomnewvalue+')rotate('+rotnewvalue+'deg)');
        updateImagePlacementInfo(ctapRefId);
        
      }
      
    });
}
/*
 * Init Rotation and Zoom Sliders
 */
function initSliders() {
  sliders = [{name:'rSlider', id:'rotation-slider', start:0, step:18, min:-180, max:180},
             {name:'zSlider', id:'zoom-slider', start:1, step:0.05, min:1, max:2}]
  var rotSlider = document.getElementById('rotation-slider');
  var zoomSlider = document.getElementById('zoom-slider');

  createSlider(rotSlider, 0, 18, -180, 180);
  createSlider(zoomSlider, 1, 0.05, 1, 2);

}

/*
 * Generic Function to invoke Modal
 */
function invokeModalNotify(hdrText, bdyText) {
  $("#ErrorNotifyLabel").html(hdrText);
  $("#ErrorNotifyBody").html(bdyText);
  $("#error-notify").modal();
}
/*
 * Show/Hide No Uploads text in the photo editor
 */
function showHideNoUploadsText() {
  console.log('showHideNoUploadsText called');
  if ($('#picsuploaded img').length > 0) {
    $('#no-uploads-text').addClass('hidecls');
  } else {
    $('#no-uploads-text').removeClass('hidecls');
  }
}
/*
 * Show/Hide No Uploads text in the photo editor
 */
function showHideCtapText(ctapRefId) {
  if ($('#ctap-img-' + ctapRefId).data('img') != 0) {
    $('#ctap-text-' + ctapRefId).addClass('hidecls')
  }
  else  {
    $('#ctap-text-' + ctapRefId).removeClass('hidecls')
  }
}
/*
 * Check Preview data for mandatory information
 */
function checkPreviewData() {
  numImgs = 0;
  // Check if images present match with the card configuration
  
  actItcId = $('.itc-selector.active').data('itc-id');

  frontActImgsElms = $('#frontview .ctap-placeholder');
  insideActImgElms = $('#insideview .ctap-placeholder').filter(function(){
                                  return $(this).data('pcfg-set').hasOwnProperty(actItcId)
                                });
  /* These elements should be available before sending the request */
  numFrontActElms = frontActImgsElms.length;
  numInsideActElms = insideActImgElms.length;

  numFrontUsrImgs = $('#frontview .ctap-placeholder img').filter(function(){return ($(this).data('img') != 0)}).length;
  numInsideUsrImgs = $('#insideview .ctap-placeholder img').filter(function(){return ($(this).data('img') != 0)}).length;
  if (numFrontUsrImgs != numFrontActElms) {
    invokeModalNotify("Image Missing", "Please add images(s) on the Front Page.")
    return false;
  }
  if (numInsideUsrImgs != numInsideActElms) {
    invokeModalNotify("Image Missing", "Please add images(s) on the Inside Page.")
    return false;
  }
  return true;
}
/*
 * Check Unsaved Data before Unload.
 * If there's data and card is not being added to cart then notify the user
 */
function isUnsavedData() {
  var uDataPres = false;
  console.log('Invoking isUnsavedData() ')
  numFrontUsrImgs = $('#frontview .ctap-placeholder img').filter(function(){return ($(this).data('img') != 0)}).length;
  numInsideUsrImgs = $('#insideview .ctap-placeholder img').filter(function(){return ($(this).data('img') != 0)}).length;
  if ((numFrontUsrImgs > 0) || (numInsideUsrImgs > 0)) {
    uDataPres = true;
  } else {
    jqAllTxtEditors.each(function(index, obj){
      editor = $(this).data('quill');
      if (editor.getLength() > 1 ) {
        console.log('editor: ' + editor.id +' and its length is : ' + editor.getLength());
        uDataPres = true;
        return false; // found, break from loop
      }
    });
  }
    
  return uDataPres;
}
/*
 * Apply left and right margins to adjust the position and keep the image at center
 */
function applyCenterMargins(jqElm, width, height)
{
  console.log('applyCenterMargins: Received w=' + width+' h='+height);
  console.log('applyCenterMargins: mL='+'-'+Math.ceil(width/2)+'px'+' mT='+ '-'+(height/2)+'px');
  jqElm.css('margin-left', '-'+(width/2)+'px').css('margin-top', '-'+(height/2)+'px');
  console.log('applyCenterMargins: margins applied: margin-left='+jqElm.css('margin-left')+' margin-top='+ jqElm.css('margin-top'));
}
function dragStart(e) {
  // console.log("dragStart Called");
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  if (e.currentTarget === this) {
    active = true;
    updateImagePlacementInfo(parseInt(e.currentTarget.getAttribute('data-ctaprefid'), 10));
  }
}

function dragEnd(e) {
  // console.log("dragEnd Called");
  initialX = currentX;
  initialY = currentY;
  updateImagePlacementInfo(parseInt(e.currentTarget.getAttribute('data-ctaprefid'), 10));
  active = false;
}

function drag(e) {
  // console.log("drag Called");
  if (active) {
  
    e.preventDefault();
  
    if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslateScaleRotate(currentX, currentY, e.currentTarget);
    updateImagePlacementInfo(parseInt(e.currentTarget.getAttribute('data-ctaprefid'), 10));
  }
}
/*
 * Set Transform Properties
 */
function setTranslateScaleRotate(xPos, yPos, el) {
  val = $(el).data('zoom');
  // val = el.getAttribute('data-zoom');
  rot = $(el).data('rotate')
  // rot = el.getAttribute('data-rotate');
  console.log("Scale Rotate: zoom = " + val + " rotate = " + rot + " dx = " + xPos + " dy = " + yPos);
  el.style.transform = "translate(" + xPos + "px, " + yPos + "px)"+"scale("+val+")"+"rotate("+rot+"deg)";
}
/*
 * Fetch Transform Matrix
 */
function fetchTransformMatrix(img) {
  var transArr = {};
  var tr;
  
  var obj = fetchImgObjPlcmntArr(img);
  
  if (obj != null) {
    tr = obj.transform;
    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    var scale = Math.round(((Math.sqrt(a*a + b*b)) * 10)/10);

    console.log('Scale: ' + scale);

    // arc sin, convert from radians to degrees, round
    var sin = b/scale;
    // next line works for 30deg but not 130deg (returns 50);
    // var angle = Math.round(Math.asin(sin) * (180/Math.PI));
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));

    console.log('Rotate: ' + angle + 'deg');
    var transArr = [];

      
    var mat       = tr.match(/^matrix3d\((.+)\)$/);
    if (mat) return parseFloat(mat[1].split(', ')[13]);

    mat = tr.match(/^matrix\((.+)\)$/);
    mat ? dx = parseFloat(mat[1].split(', ')[4]) : dx = 0;
    mat ? dy = parseFloat(mat[1].split(', ')[5]) : dy = 0;
    transArr['dx'] = dx;
    transArr['dy'] = dy;
    transArr['scale'] = scale;
    transArr['rotation'] = angle;
  } else {
    transArr['dx'] = 0;
    transArr['dy'] = 0;
    transArr['scale'] = 1;
    transArr['rotation'] = 0;
  }
  console.log("fetchTransformMatrix: obj: " + obj + "img: " + img + "are: Scale: " + transArr['scale'] + " Rotation: " + transArr['rotation'] + " dx: " + transArr['dx'] + " dy: " + transArr['dy']);
  return transArr;
}

function isVisible(element) {
  var element = $(element);
  return (element.css('display') !== 'none' && element.css('visibility') !== 'hidden' && element.css('opacity') !== 0);
}

function deletePlaceholderImg(img) {
  $('.ctap-placeholder-img').each(function(){
    if ($(this).data('img') == img) {
      $(this).attr('src', '/assets/noimage.png').data('width', 0).data('height', 0).data('img', 0).data('zoom', 0).data('rotate', 0);
      showHideCtapText($(this).data('ctaprefid'));
    }
  });
}
  /*
  * Fetch the current applied image filter
  */

function fetchAndSetCurrFilter(jqImgElm) {

  $('#eb-filters').find('.dot').removeClass('active');
  if (jqImgElm.hasClass('grayscale')) {
    $('#eb-filters').find('.grayscale').parent().find('.dot').addClass('active');
  }
  else if (jqImgElm.hasClass('sepiatone')) {
    $('#eb-filters').find('.sepiatone').parent().find('.dot').addClass('active');
  }
  else {
    $('#eb-filters').find('.original').parent().find('.dot').addClass('active');
  }
}

function fetchImgObjPlcmntArr (img) {

  obj = tmpObj = null;
  
  numObjs = imagePlacements.length

  for (var i=0; i < numObjs; i++) {
    tmpObj = imagePlacements[i];
    if ((tmpObj.img === img) && (tmpObj.ctapRefId === ctapRefId)) {
      obj = tmpObj;
      break;
    }
  }
  return obj;
}
function initCardPrvwPages () {
  switch(device) {
    case 'xs':
    case 'sm':
      $('#ipl-badge').text('Inside-Left Page');
      break;
    default:
      $('#ipl-badge').text('Inside Page');
      $('#ipr-container').remove();
      break;
  }
}

function resizeModalOnDevice () {
  switch (device) {
    case 'xs':
    case 'sm':
      $('#preview-section .modal-dialog').removeClass('modal-xl');
      break;
    default:
      $('#preview-section .modal-dialog').addClass('modal-xl');
      break;
  }
}

function findBootstrapEnvironment() {
  let envs = ['xs', 'sm', 'md', 'lg', 'xl'];

  let el = document.createElement('div');
  document.body.appendChild(el);

  let curEnv = envs.shift();

  for (let env of envs.reverse()) {
      el.classList.add(`d-${env}-none`);

      if (window.getComputedStyle(el).display === 'none') {
          curEnv = env;
          break;
      }
  }

  document.body.removeChild(el);
  return curEnv;
}