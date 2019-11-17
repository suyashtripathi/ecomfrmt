$(document).ready(function() {
  $('.close').on('click touchend', function() {
    // $('#photo-editor').hide();
    $(this).closest('.close-wrap-div').fadeOut();
  })
  $('[class*="card-item-img-"]').on('click touchend', function() {

    pgt = $(this).data('page-type');
    html = '<div class="item d-flex align-items-start overflow-hidden single-img-cont-'+pgt+'"><img id="front" src="/assets/noimage.png"/><span class="badge badge-pill badge-dark d-mild-none">Front Page</span></div><div class="item d-flex align-items-start overflow-hidden double-img-cont-'+pgt+'"><img id="inside" src="/assets/noimage.png"/><span class="badge badge-pill badge-dark d-mild-none">Inside' + ((pgt === "5x7")? '-Left Page' : ' Page') + '</span></div>'+((pgt === "5x7")? '<div class="item d-flex align-items-start overflow-hidden double-img-cont-'+pgt+'"><img id="inside-right" src="/assets/noimage.png"/><span class="badge badge-pill badge-dark d-mild-none">Inside-Right Page</span></div>':'')+'<div class="item d-flex align-items-start overflow-hidden single-img-cont-'+pgt+'"><img id="back" src="/assets/noimage.png"/><span class="badge badge-pill badge-dark d-mild-none">Back Page</span></div>'

    // $('#preview-container').html(html);
    // var owl = $('.owl-carousel');
    var owl = $('.card-slider');
    owl.trigger('replace.owl.carousel', html).trigger('refresh.owl.carousel').trigger('to.owl.carousel', 0);
    $('#preview-section .modal-body').removeClass('h-5x7 h-7x5').addClass('h-'+pgt);
    $('#preview-container img#front').replaceWith('<img id="front" class="img-responsive preview-images" src="'+ $(this).data('imgs')['front']+'"/>');
    $('#preview-container img#inside').replaceWith('<img id="inside" class="img-responsive preview-images" src="'+ $(this).data('imgs')['inside']+'"/>');
    $('#preview-container img#inside-right').replaceWith('<img id="inside-right" class="img-responsive preview-images d-block d-sm-none"  src="'+ $(this).data('imgs')['inside']+'"/>');
    $('#preview-container img#back').replaceWith('<img id="back" class="img-responsive preview-images" src="'+ $(this).data('imgs')['front']+'"/>');
    resizeModalOnDevice();
    $('#preview-section').modal();
    $('.card-slider span.badge').eq(0).fadeIn('fast',function() {
      console.log('SavePrvw: Calling FadeIn for ' + 0);
      setTimeout(function() {
          $('.card-slider span.badge').eq(0).fadeOut('fast');
          console.log('Calling FadeOut for ' + 0);
      }, 1500);
    });
  });
});


// "script": "$('#preview-container img#front').replaceWith('<img id=\"front\" class=\"img-responsive preview-images\" src=\"<%= rails_representation_path(@card_preview.generated_front.variant(resize: '690x490^')) %>\"/>');$('#preview-container img#inside').replaceWith('<img id=\"inside\" class=\"img-responsive preview-images\" src=\"<%= rails_representation_path(@card_preview.generated_inside.variant(resize: '690x490^')) %>\"/>');$('#preview-container img#inside-right').replaceWith('<img id=\"inside-right\" class=\"img-responsive preview-images d-block d-sm-none \" src=\"<%= rails_representation_path(@card_preview.generated_inside.variant(resize: '690x490^')) %>\"/>');$('#preview-container img#back').replaceWith('<img id=\"back\" class=\"img-responsive preview-images d-block d-sm-none \" src=\"<%= rails_representation_path(@card_preview.generated_front.variant(resize: '690x490^')) %>\"/>');"