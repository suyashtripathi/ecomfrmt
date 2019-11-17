class CreateSpreeMessageCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_message_categories do |t|
      t.string :name
      t.boolean :is_visible

      t.timestamps
    end
    add_index :spree_message_categories, :name
  end
end
