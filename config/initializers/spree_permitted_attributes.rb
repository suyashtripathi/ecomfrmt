module Spree
  module PermittedAttributes
    @@line_item_attributes << :card_preview_id
    @@product_attributes << :product_category_id
    @@user_attributes << :firstname
    @@user_attributes << :lastname
    @@user_attributes << :mobile_num
  end
end