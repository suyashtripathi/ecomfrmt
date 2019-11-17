class ApplicationController < ActionController::Base
  def get_page_alignment_type(variant)
    # Since any image can be taken. All will have same page type. Taking 0 index.
    img_width = variant.images[0].attachment.blob.metadata['width'].to_i
    img_height = variant.images[0].attachment.blob.metadata['height'].to_i

    if (img_width <= img_height)
      page_type = '5x7'
    else
      page_type = '7x5'
    end
    return page_type
  end
end
