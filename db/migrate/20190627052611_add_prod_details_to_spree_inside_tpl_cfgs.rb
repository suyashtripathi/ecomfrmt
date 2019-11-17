class AddProdDetailsToSpreeInsideTplCfgs < ActiveRecord::Migration[5.2]
  def change
    add_column :spree_inside_tpl_cfgs, :prod_ctg, :string
    add_column :spree_inside_tpl_cfgs, :prod_key, :string
  end
end
