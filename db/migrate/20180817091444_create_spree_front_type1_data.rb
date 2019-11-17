class CreateSpreeFrontType1Data < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_front_type1_data do |t|
      t.integer :card_preview_id
      t.integer :img_upld_id
      t.integer :img_ref_id
      t.float :img_zoom
      t.integer :img_rotate
      t.integer :rotated_x
      t.integer :rotated_y
      t.integer :rotated_w
      t.integer :rotated_h
      t.string :img_filter
      t.string :ta_1_text
      t.string :ta_1_font
      t.integer :ta_1_fontsize
      t.string :ta_1_fontstyle
      t.string :ta_1_align
      t.string :ta_1_rotation
      t.string :ta_1_color

      t.timestamps
    end
  end
end
