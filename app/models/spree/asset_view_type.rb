module Spree
  class AssetViewType < Spree::Base
    validates :name, presence: true, uniqueness: { case_sensitive: false, allow_blank: true }

    with_options inverse_of: :asset_view_type do
      has_many :assets
    end
  end
end
