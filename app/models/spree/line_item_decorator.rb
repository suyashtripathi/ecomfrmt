Spree::LineItem.class_eval do
  has_one :card_preview, class_name: 'Spree::CardPreview', :dependent => :destroy
  # accepts_nested_attributes_for :card_preview, allow_destroy: true
end