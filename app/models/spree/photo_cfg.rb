module Spree
  class PhotoCfg < PhotoTextCfg
    with_options inverse_of: :photo_cfgs do
      belongs_to :variant, touch: true, class_name: 'Spree::Variant'
      belongs_to :inside_tpl_cfg, touch: true, class_name: 'Spree::InsideTplCfg'
    end
  end
end
