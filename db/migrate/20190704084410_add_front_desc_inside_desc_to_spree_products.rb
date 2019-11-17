class AddFrontDescInsideDescToSpreeProducts < ActiveRecord::Migration[5.2]
  def change
    add_column :spree_products, :front_desc, :string
    add_column :spree_products, :inside_desc, :string
  end
end
