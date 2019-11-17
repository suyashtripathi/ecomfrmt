module Spree
  class InsideTplCfg < Spree::Base
    has_many :photo_cfgs, class_name: 'Spree::PhotoCfg', :dependent => :destroy
    accepts_nested_attributes_for :photo_cfgs, reject_if: :all_blank, allow_destroy: true
    has_many :text_cfgs, class_name: 'Spree::TextCfg', :dependent => :destroy
    accepts_nested_attributes_for :text_cfgs, reject_if: :all_blank, allow_destroy: true
  end
end
