var uniquePhotoCfgId = 1;
$(document).on('click', "a.spree_add_photo_cfg_fields, a.spree_add_text_cfg_fields", function() {
  alert("New Fields Added");
  var target = $(this).data("target");
  var new_table_row = $(target + ' tr:visible:last').clone();
  var new_id = new Date().getTime() + (uniquePhotoCfgId++);
  console.log("New id selected is : " + new_id);
  new_table_row.find("input, select").each(function () {
    var el = $(this);
    el.val("");
    el.prop("id", el.prop("id").replace(/\d+/, new_id))
    el.prop("name", el.prop("name").replace(/\d+/, new_id))
    // el.prop("id", el.prop("id") + new_id)
    // el.prop("name", el.prop("name") + new_id)
  })
  // When cloning a new row, set the href of all icons to be an empty "#"
  // This is so that clicking on them does not perform the actions for the
  // duplicated row
  new_table_row.find("a").each(function () {
    var el = $(this);
    el.prop('href', '#');
  })
  $(target).prepend(new_table_row);
});