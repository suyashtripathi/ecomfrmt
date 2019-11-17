class CreateSpreeInsideType1Data < ActiveRecord::Migration[5.2]
  def change
    create_table :spree_inside_type1_data do |t|
      t.integer :card_preview_id
      t.string :ta_1_text
      t.string :ta_1_font
      t.integer :ta_1_fontsize
      t.string :ta_1_fontstyle
      t.string :ta_1_align
      t.string :ta_1_rotation
      t.string :ta_1_color
      t.string :ta_2_text
      t.string :ta_2_font
      t.integer :ta_2_fontsize
      t.string :ta_2_fontstyle
      t.string :ta_2_align
      t.string :ta_2_rotation
      t.string :ta_2_color
      t.string :ta_3_text
      t.string :ta_3_font
      t.integer :ta_3_fontsize
      t.string :ta_3_fontstyle
      t.string :ta_3_align
      t.string :ta_3_rotation
      t.string :ta_3_color

      t.timestamps
    end
  end
end
