Spree::Product.class_eval do
  has_many :photo_cfgs, through: :variants_including_master, class_name: 'Spree::PhotoCfg'
  has_many :text_cfgs, through: :variants_including_master, class_name: 'Spree::TextCfg'
  belongs_to :product_category, class_name: 'Spree::ProductCategory'
  # has_one :product_category, class_name: 'Spree::ProductCategory'
  # has_many :onePicOneTextCfgs, through: :variants_including_master, class_name: 'Spree::CardFrontOnePhotoOneTextareaCfg'
      
      
end