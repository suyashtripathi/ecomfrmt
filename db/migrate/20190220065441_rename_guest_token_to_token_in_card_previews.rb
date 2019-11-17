class RenameGuestTokenToTokenInCardPreviews < ActiveRecord::Migration[5.2]
  def change
    rename_column :spree_card_previews, :guest_token, :token
  end
end
