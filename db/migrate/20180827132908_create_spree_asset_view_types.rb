class CreateSpreeAssetViewTypes < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_asset_view_types do |t|
      t.string :name

      t.timestamps
    end
    add_index :spree_asset_view_types, :name
  end
end
