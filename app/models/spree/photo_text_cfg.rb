module Spree
  class PhotoTextCfg < Spree::Base
    acts_as_list scope: :variant

    # with_options inverse_of: :photo_text_cfgs do
    #   belongs_to :variant, touch: true, class_name: 'Spree::Variant'
    #   belongs_to :inside_tpl_cfg, touch: true, class_name: 'Spree::InsideTplCfg'
    # end

    # validates :variant, presence: true
    validates :variant, presence: true, unless: :inside_tpl_cfg
    validates :inside_tpl_cfg, presence: true, unless: :variant
    delegate :name, to: :variant, prefix: true
    delegate :product, to: :variant

    # after_touch { variant.touch }
    # after_destroy { variant.touch }

    after_touch { touch_cfg }
    after_destroy { touch_cfg }

    self.whitelisted_ransackable_attributes = %w[variant_id inside_tpl_cfg_id]
    self.whitelisted_ransackable_associations = ['variant']

    private
    
    # def variant
    #   Spree::Variant.unscoped { super }
    # end

    # def inside_tpl_cfg
    #   Spree::InsideTplCfg.unscoped { super }
    # end
    
    def touch_cfg
      if variant.present?
        #puts "Variant present"
        variant.touch
      elsif inside_tpl_cfg.present?
        inside_tpl_cfg.touch
      end
    end
  end
end
