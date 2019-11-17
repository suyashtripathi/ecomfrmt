module Spree
  class CardPreview < Spree::Base
    # acts_as_list scope: :variant
    include Spree::Core::TokenGenerator
    
    belongs_to :line_item, optional: true, touch: true, class_name: 'Spree::LineItem'
    # with_options inverse_of: :card_previews do
    #   belongs_to :line_item, optional: true, touch: true, class_name: 'Spree::LineItem'
    #   # belongs_to :inside_tpl_cfg, touch: true, class_name: 'Spree::InsideTplCfg'
    # end

    has_many_attached :uploads, :dependent => :destroy

    has_one_attached :generated_front, :dependent => :destroy

    has_one_attached :generated_inside, :dependent => :destroy

    has_one :front_type1_datum, class_name: 'Spree::FrontType1Datum', :dependent => :destroy
    accepts_nested_attributes_for :front_type1_datum, allow_destroy: true
    has_one :inside_type1_datum, class_name: 'Spree::InsideType1Datum', :dependent => :destroy
    accepts_nested_attributes_for :inside_type1_datum, allow_destroy: true
    
    before_create :create_token
    # validates :variant, presence: true
    # validates :variant, presence: true, unless: :inside_tpl_cfg
    # validates :inside_tpl_cfg, presence: true, unless: :variant
    # delegate :name, to: :variant, prefix: true
    # delegate :product, to: :variant

    # after_touch { variant.touch }
    # after_destroy { variant.touch }

    # after_touch { touch_cfg }
    # after_destroy { touch_cfg }

    # self.whitelisted_ransackable_attributes = %w[variant_id inside_tpl_cfg_id]
    # self.whitelisted_ransackable_associations = ['variant']

    # Associates the specified user with the order.
    def associate_user!(user, override_email = true)
      self.user_id           = user.id
      # self.email          = user.email if override_email

      # changes = slice(:user_id, :email)
      changes = slice(:user_id)

      # immediately persist the changes we just made, but don't use save
      # since we might have an invalid address associated
      self.class.unscoped.where(id: self).update_all(changes)
    end
    
    private
    
    def create_token
      self.token ||= generate_token
    end

    
    
    # def variant
    #   Spree::Variant.unscoped { super }
    # end

    # def inside_tpl_cfg
    #   Spree::InsideTplCfg.unscoped { super }
    # end
    
    # def touch_cfg
    #   if variant.present?
    #     puts "Variant present"
    #     variant.touch
    #   elsif inside_tpl_cfg.present?
    #     inside_tpl_cfg.touch
    #   end
    # end
  end
end
