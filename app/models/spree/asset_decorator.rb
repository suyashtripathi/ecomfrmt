Spree::Asset.class_eval do
  has_one :asset_view_type, class_name: 'Spree::AssetViewType'
end