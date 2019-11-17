$(document).ready(function() {
  $('#makemycard').on('click', function () {
    console.log('Makemy card Clicked.');
  })
  $('[id*="product-img-"]').on('click', function() {
    console.log('received click on ' + $(this).attr('id'));
    imgs = {}
    imgOrder = ['Showcase', 'Front', 'Inside', 'Back', 'Display']
    idx = 0
    html = ''
    varHtml = ''
    imgPathsHtml = []
    
    var imgPathsHtml = imgPathsHtml.fill('');
    var varIds = $(this).data('var-ids');
    var defVarId = varIds[0];/* First one */
    var varsInfo = $(this).data('vars');
    var defVarsInfo = $(this).data('vars')[defVarId];
    var imgs = defVarsInfo['images'];
    var cec = defVarsInfo['cec'];
    var prodCtg = $(this).data('prod-ctg');
    var prodSlug = $(this).data('prod-slug');
    var pageType = $(this).data('page-type');

    jqFormElm = $('#product-modal form');
    jqFormSubmitElm = $('#product-modal form input[type*="submit"]');
    jqVarIdElm = $('input#variant_id');
    updateProductInfo($(this));

    $.each(imgOrder, function (index, value) {
      // Initialization
      imgPathsHtml[value] = '';
    });
    
    // $.each(imgOrder, function(index, value) {
    for (key in imgs) {
      console.log("Entered inside with " + key);
      for (i=0; i < imgs[key].length; i++) {
        imgPath = imgs[key][i];
        
        console.log('html is : ' + html)
        // imgPathsHtml[key] = imgPathsHtml[key] + '<div style="background: center center url('+imgPath+') no-repeat;" class="detail-full-item-modal-mt"></div>'
        imgPathsHtml[key] = imgPathsHtml[key] + '<div class="detail-full-item-modal-mt d-flex justify-content-center align-items-end"><img src="'+imgPath+'" class="'+key+'-'+pageType+'"/></div>'
        // console.log("imgPathsHtml[key]: " + imgPathsHtml[key]);
      }
    }
    //Append imgPaths as per ImgOrder
    $.each(imgOrder, function (index, value) {
        html = html + imgPathsHtml[value];
    });

    numVars = varIds.length
    console.log("Total Variants " + numVars);
    if (numVars > 1) {
      // Show all the variants
      baseInitPath = "/cardinit/"
      for (i=0; i < numVars; i++) {
        for (key in imgs) {
          imgPath = imgs[key][0];
          break;
        }
        varHtml = varHtml + '<li class="list-inline-item"><div style="background: center center url('+imgPath+') no-repeat;" class="detail-small-item-modal"></div><label for="var_'+varIds[i]+'" class="btn btn-sm btn-outline-secondary detail-option-btn-label">'+varsInfo[varIds[i]]['cec']+'</label><input type="radio" name="colour" value="'+varIds[i]+'" id="var_'+varIds[i]+'" required class="input-invisible"></li>'
      }
      $('.variants-option-heading').show();
      $('.variants-wrapper').html(varHtml).show();
    }
    else if (numVars <= 1) {
      
      $('.variants-option-heading').hide();
      $('.variants-wrapper').html('').hide();
      $('input#variant_id').attr('value', )
    }
    else {

    }
    console.log('ProdSlug: ' + prodSlug);
    // Set Respective Form Action
    setFormActionMethodQuantity(jqFormElm, jqFormSubmitElm, prodCtg, prodSlug, cec);
    // Set Respective Variant Id
    setFormVariantIdField(jqVarIdElm, defVarId);
        
    var owl = $('.owl-carousel');
    owl.trigger('replace.owl.carousel', html).trigger('refresh.owl.carousel').trigger('to.owl.carousel', 0);
    
  });

  $('#open-card-init').submit(function(event){

  });
});
/*
 * Set the respective action for the form based on the product category
 */
function setFormActionMethodQuantity (jqFormElm, jqFormSubmitElm, prodCtg, prodSlug, cec) {
  if (prodCtg === 'Card') {
    // form_action = '/cardinit/'+prodSlug+'/'+cec;
    form_action = '/cardinit/';
    form_method = 'get';
    submitBtnId = "make-my-card"
    submitBtnVal = "Make My Card"
    $('#item-quantity').addClass('hidecls');
    $('input#slug').val(prodSlug);
    $('input#cec').val(cec);
  }
  else {
    form_action = '/orders/populate';
    form_method = 'post';
    submitBtnId = "add-to-cart"
    submitBtnVal = "Add to Cart"
    $('#item-quantity').removeClass('hidecls');
  }
  jqFormElm.attr('action', form_action);
  jqFormElm.attr('method', form_method);
  jqFormSubmitElm.attr('id', submitBtnId).attr('value', submitBtnVal).attr('data-disable-with', submitBtnVal);

}
/*
 * Set the respective variant id field in the form
 */
function setFormVariantIdField (jqVarIdElm, variant_id) {
  jqVarIdElm.attr('value', variant_id);
}
/*
 * Update Product Information
 */
function updateProductInfo (jqProdElm) {
  $('#prod-title').text(jqProdElm.data('prod-name'));
  $('#prod-price').text(jqProdElm.data('prod-price'));
  $('#prod-org-price').text(jqProdElm.data('prod-org-price'));
  if (jqProdElm.data('prod-ctg') === "Card") {
    $('#icon-holder').html('<use xlink:href="#desc-icon"> </use>');
    $('#desc-title').text("Photo(s) and Text");
    $('#prod-desc').text("Personalize to your heart");
    $('#card-dimensions').removeClass('d-none').addClass('d-flex align-items-center');
  } else {
    $('#icon-holder').html('<use xlink:href="#prod-details"> </use>');
    $('#desc-title').text("Details");
    $('#prod-desc').text(jqProdElm.data('prod-desc'));
    $('#card-dimensions').removeClass('d-flex align-items-center').addClass('d-none');
  }
  $('#prod-ctg').text(jqProdElm.data('prod-ctg'));
}
