class CreateSpreeProductCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_product_categories do |t|
      t.string :name

      t.timestamps
    end
    add_index :spree_product_categories, :name
  end
end
