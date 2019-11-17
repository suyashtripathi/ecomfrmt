Spree::Variant.class_eval do
  has_many :photo_cfgs, class_name: 'Spree::PhotoCfg', :dependent => :destroy
  accepts_nested_attributes_for :photo_cfgs, allow_destroy: true
  has_many :text_cfgs, class_name: 'Spree::TextCfg', :dependent => :destroy
  accepts_nested_attributes_for :text_cfgs, allow_destroy: true
  # has_one :onePicOneTextCfg, class_name: 'Spree:CardFrontOnePhotoOneTextareaCfg', inverse_of: :variant, :dependent => :destroy
  # accepts_nested_attributes_for :onePicOneTextCfg, allow_destroy: true
end