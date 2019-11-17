module Spree
  class FrontType1Datum < Spree::Base
    with_options inverse_of: :front_type1_data do
      belongs_to :card_preview, touch: true, class_name: 'Spree::CardPreview'
      # belongs_to :inside_tpl_cfg, touch: true, class_name: 'Spree::InsideTplCfg'
    end
  end
end
