class AddProductCategoryIdToSpreeProducts < ActiveRecord::Migration[5.2]
  def change
    add_column :spree_products, :product_category_id, :integer
  end
end
