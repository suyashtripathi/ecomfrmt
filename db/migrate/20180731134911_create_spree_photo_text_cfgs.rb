class CreateSpreePhotoTextCfgs < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_photo_text_cfgs do |t|
      t.string :type
      t.string :name
      t.integer :x
      t.integer :y
      t.integer :w
      t.integer :h
      t.integer :z
      t.string :page
      t.integer :position
      t.integer :variant_id
      t.integer :inside_tpl_cfg_id

      t.timestamps
    end
    add_index :spree_photo_text_cfgs, :page
    add_index :spree_photo_text_cfgs, :variant_id
    add_index :spree_photo_text_cfgs, :inside_tpl_cfg_id
  end
end
