class AddFirstNameLastNameMobileNumToSpreeUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :spree_users, :firstname, :string
    add_column :spree_users, :lastname, :string
    add_column :spree_users, :mobile_num, :string
    add_index :spree_users, :mobile_num
  end
end
