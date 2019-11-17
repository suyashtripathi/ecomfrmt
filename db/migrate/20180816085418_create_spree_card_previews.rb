class CreateSpreeCardPreviews < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_card_previews do |t|
      t.string :number, limit: 32
      t.integer :inside_tpl_id
      t.integer :front_data_id
      t.integer :inside_data_id
      t.integer :user_id
      t.integer :line_item_id
      t.integer :variant_id
      t.string :guest_token

      t.timestamps
    end
    add_index :spree_card_previews, :number
  end
end
