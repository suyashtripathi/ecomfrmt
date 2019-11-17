class AddIsItNewToSpreeProducts < ActiveRecord::Migration[5.2]
  def change
    add_column :spree_products, :is_it_new, :boolean, default: false
  end
end
