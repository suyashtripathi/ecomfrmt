class CreateSpreeInsideTplCfgs < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_inside_tpl_cfgs do |t|
      t.string :name

      t.timestamps
    end
    add_index :spree_inside_tpl_cfgs, :name
  end
end
