class CreateSpreeMessageRepositories < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_message_repositories do |t|
      t.integer :msg_category_id
      t.string :message
      t.boolean :is_visible

      t.timestamps
    end
    add_index :spree_message_repositories, :msg_category_id
  end
end
