class AddAssetViewTypeIdToSpreeAssets < ActiveRecord::Migration[5.2]
  def change
    add_column :spree_assets, :asset_view_type_id, :integer
  end
end
