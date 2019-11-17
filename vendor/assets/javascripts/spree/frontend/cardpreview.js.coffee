Spree.ready ($) ->
  $("#picsuploaded").on("ajax:success", (event) ->
    [data, status, xhr] = event.detail
    $("#picsuploaded").append xhr.responseText
  ).on "ajax:error", (event) ->
    $("#picsuploaded").append "<p>ERROR</p>"