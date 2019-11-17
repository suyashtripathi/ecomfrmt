module Spree
  class CardPreviewsController < Spree::StoreController
    require "image_processing/mini_magick"
    require "image_processing/vips"
    require "pathname"
    include ImageProcessing::MiniMagick
    include Rails.application.routes.url_helpers

    before_action :load_variant, only: :cardinit
    # respond_to :html, :js
    
    def saveandpreview
      img_overlay = nil
      img_ready_text_pending = {}
      text_ready_img_pending = {}
      img_iterations = {}
      @processed = {}
      algo = 2
      @cec_str = "card-edit-ctg: #{params[:cec]}"
      # @variant = product.variants.includes(:option_values).find {|var| var.options_text == @cec_str}
      @variant = Spree::Variant.find_by_id(params[:variant_id])
      # @variant = Spree::Variant.find_by_id(params[:variant_id])
      img_collection = Spree::Image.where(:viewable_id => params[:variant_id])
      #Fetch all the images from db
      @showcase_image = fetch_showcase_image(img_collection)
      @front_image = fetch_front_image(img_collection)
      @inside_image = fetch_inside_image(img_collection)
      @back_image = fetch_back_image(img_collection)
      
      #Inside Template Id
      inside_tpl_id = params[:inside_tpl_id]
      inside_tpl_cfg = Spree::InsideTplCfg.find_by_id(inside_tpl_id.to_i)
      #Pages
      pages = ['front', 'inside']
      
      #Fetch photo configurations
      photo_cfgs = {
        'front': @variant.photo_cfgs.select { |hash| hash[:page] == 'front'},
        'inside': inside_tpl_cfg.photo_cfgs.select { |hash| hash[:page] == 'inside'}
      }
      
      #Fetch Text configurations
      text_cfgs = {
        'front': @variant.text_cfgs.select { |hash| hash[:page] == 'front'},
        'inside': inside_tpl_cfg.text_cfgs.select { |hash| hash[:page] == 'inside'}
      }
      #Fetching image and text data from the params
      photo_data = {
        'front': (params[:front][:image] if !params[:front].nil?),
        'inside': params[:inside][:image]
      }
      text_data = {
        'front': (params[:front][:text] if !params[:front].nil?),
        'inside': params[:inside][:text]
      }
            
      #page alignment type - '5x7' or '7x5'
      @page_type = get_page_alignment_type(@variant)

      #default blank text image overlay. In case the desired blank overlay image is not found, this shall be used.
      overlay_img_path = "#{Rails.root}/app/assets/images/"
      # if current_card_preview.nil?
      #   @card_preview = current_card_preview(create_card_preview_if_necessary: "true")
      # else
      #   @card_preview = current_card_preview
      # end
      @card_preview = current_card_preview

      @uploaded_images = @card_preview.uploads
      # Fetch common path for active storage disk service
      active_storage_disk_service = ActiveStorage::Service::DiskService.new(root: Rails.root.to_s + '/storage/')

      # Fetch the Blob paths for Front/Inside Card Images
      front_image_path = active_storage_disk_service.send(:path_for, @front_image.attachment.blob.key)
      inside_image_path = active_storage_disk_service.send(:path_for, @inside_image.attachment.blob.key)
      back_image_path = active_storage_disk_service.send(:path_for, @back_image.attachment.blob.key)
      # Read full sized Card Front Image using the blob paths
      if @page_type == "5x7"
        front_img_fullsize = ImageProcessing::MiniMagick
                                .source(File.open(front_image_path))
                                .convert("png")
                                .resize_to_fit!(1725, 2450)
      
        inside_img_fullsize = ImageProcessing::MiniMagick
                                .source(File.open(inside_image_path))
                                .convert("png")
                                .resize_to_fit!(3450, 2450)

        back_img_fullsize = ImageProcessing::MiniMagick
                                .source(File.open(back_image_path))
                                .convert("png")
                                .resize_to_fit!(1725, 2450)
      else
        front_img_fullsize = ImageProcessing::MiniMagick
                                .source(File.open(front_image_path))
                                .convert("png")
                                .resize_to_fit!(2450, 1725)
      
        inside_img_fullsize = ImageProcessing::MiniMagick
                                .source(File.open(inside_image_path))
                                .convert("png")
                                .resize_to_fit!(2450, 3450)

        back_img_fullsize = ImageProcessing::MiniMagick
                                .source(File.open(back_image_path))
                                .convert("png")
                                .resize_to_fit!(2450, 1725)
      end
      #In case its not a photo card. Normal a simple card. Initialize it with card front/inside base images
      img_ready_text_pending['front'] = front_img_fullsize
      img_ready_text_pending['inside'] = inside_img_fullsize
      # if (img_ready_text_pending[page].nil?)
      #   if (page === 'front')
      #     img_ready_text_pending[page] = front_img_fullsize
      #   elsif (page === 'inside')
      #     img_ready_text_pending[page] = inside_img_fullsize
      #   else
      #   end
      # end
      # The following text is OLD. Needs to be revised and corrected.
      # Usually the default photo card options is 1 photo at max but generalizing the algo would help later.
      # IMPOSING USER UPLOADED IMAGES
      # STEPS - To IMPOSE uploaded images.
      # 1 - Read full sized Card Front Image using the blob paths
      # 2 - Check how many image placeholders are there.
      # 3 - Loop for those many placeholders.
      # 4 - Fetch the uploaded image path.
      # 5 - Fetch the Blob path of uploaded user image(s) from the storage
      # 6 - Calculate the Image Size that was zoomed out/in on user Interface Screen.
      # 7 - Calculate the Image offsets in case the image was shifted on User Screen.
      # 8 - Resized the uploaded image based on the computed width and height
      # 9 - Rotate this Resized image as per the rotation received in the params for this image.
      #10 - Impose this image on a blank full size blank image.
      #11 - Impose the read front image on this rotated and resized image.
      #12 - Processed Front Card Image is ready. Imposing texts, if any are remaining that we shall do next.
      
      # Step 1,2,3
      pages.each do |page|
        hsh_idx = page.to_sym
        #for i in 0..(photo_cfgs[hsh_idx].size)
        # photo_cfgs.each do |key, value|
        if (algo == 1)
          start = Time.now
          
          if (!photo_data[hsh_idx].nil?)
            for i in 0...(photo_cfgs[hsh_idx].count)
              curr_photo_data = photo_data[hsh_idx][i.to_s.to_sym]
              curr_photo_cfg = photo_cfgs[hsh_idx].find { |photo_cfg| photo_cfg['id'] == curr_photo_data['img_ref_id'].to_i }
              # Step 4
              @curr_upload_img = @uploaded_images.find_by_id(curr_photo_data[:img_upld_id])
              # Step 5
              upload_path = active_storage_disk_service.send(:path_for, @curr_upload_img.blob.key)
              # Step 6
              upld_img_w = curr_photo_data[:img_width].to_i * curr_photo_data[:img_zoom].to_f * 5
              upld_img_h = curr_photo_data[:img_height].to_i * curr_photo_data[:img_zoom].to_f * 5
              # Step 7
              offset_upld_img_x = (curr_photo_data[:upld_img_x].to_i - curr_photo_data[:card_x].to_i) * 5
              offset_upld_img_y = (curr_photo_data[:upld_img_y].to_i - curr_photo_data[:card_y].to_i) * 5
              # Step 8
              if (!curr_photo_data[:img_filter].nil? && curr_photo_data[:img_filter] == "sepia")
                resized_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(upload_path))
                                        .append("-sepia-tone", "80%")
                                        .convert("png")
                                        .resize_to_fill!(upld_img_w, upld_img_h)
              elsif (!curr_photo_data[:img_filter].nil? && curr_photo_data[:img_filter] == "grayscale")
                resized_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(upload_path))
                                        .colorspace('Gray')
                                        .convert("png")
                                        .resize_to_fill!(upld_img_w, upld_img_h)
              else
                resized_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(upload_path))
                                        .convert("png")
                                        .resize_to_fill!(upld_img_w, upld_img_h)
              end
              # Step 9
              if (curr_photo_data[:img_rotate].to_i != 0)
                rotated_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(resized_upload_img))
                                        .background("transparent")
                                        .rotate(curr_photo_data[:img_rotate].to_i)
                                        .call
              end
              rotated_resized_img = (curr_photo_data[:img_rotate].to_i === 0) ? resized_upload_img : rotated_upload_img
              # Step 10
              base_img = img_overlay.nil? ? 'app/assets/images/' + @page_type + '-Blank-Fullsize-Only-' + page.capitalize + '.png': img_overlay
              # img_overlay = ImageProcessing::MiniMagick
              #                 .source(File.open('app/assets/images/5x7-Blank-Fullsize-Only-Front.png'))
              #                 .composite(File.open(rotated_resized_img), mode: "over", offset: [offset_upld_img_x, offset_upld_img_y])
              #                 .convert("png")
              #                 .call

              # Step 10
              img_overlay = ImageProcessing::MiniMagick
                              .source(File.open(base_img))
                              .composite(File.open(rotated_resized_img), mode: "over", offset: [offset_upld_img_x, offset_upld_img_y])
                              .convert("png")
                              .call
            end
            # Step 11
            # SuperImpose the Full Size Main Card Image so that imposed images are under it and are visible only through the placeholders.
            if (!img_overlay.nil?)
              if (page === "front")
                # In case of Front overlapping. The card image has to come on top for the final image
                # so that exact holes and placeholders could be visible just like the original picture.
                # But this is different from the inside image preparation.
                img_ready_text_pending[page] = ImageProcessing::MiniMagick
                                            .source(img_overlay)
                                            .composite(front_img_fullsize, mode: "over")
                                            .convert("png")
                                            .call
              elsif
                # In case of Inside overlap, there's no concept of holes as of now. Photos are imposed on the
                # basis of templates. Hence in this case, prepared individual images shall be applied on top of
                # the original inside image and not below. Front and Inside handling is opposite hence.
                img_ready_text_pending[page] = ImageProcessing::MiniMagick
                                            .source(inside_img_fullsize)
                                            .composite(img_overlay, mode: "over")
                                            .convert("png")
                                            .call
              
              end
              
              img_overlay = nil # Reset img_overlay for next page processing
            end
          end
          logger.debug "=>=>=>=>=>=>=>=>=>=>Time taken in preparing Front Image" + "#{Time.now - start}"
        end #if (algo == 1)
        if (algo == 2)
          start = Time.now
          if (!photo_data[hsh_idx].nil?)
            for i in 0...(photo_cfgs[hsh_idx].count)
              curr_photo_data = photo_data[hsh_idx][i.to_s.to_sym]
              curr_photo_cfg = photo_cfgs[hsh_idx].find { |photo_cfg| photo_cfg['id'] == curr_photo_data['img_ref_id'].to_i }
              # Step 4
              @curr_upload_img = @uploaded_images.find_by_id(curr_photo_data[:img_upld_id])
              # Step 5
              upload_path = active_storage_disk_service.send(:path_for, @curr_upload_img.blob.key)
              # Step 6
              upld_img_w = curr_photo_data[:img_width].to_i * curr_photo_data[:img_zoom].to_f * 5
              upld_img_h = curr_photo_data[:img_height].to_i * curr_photo_data[:img_zoom].to_f * 5
              # Step 7
              offset_upld_img_x = (curr_photo_data[:upld_img_x].to_i - curr_photo_data[:card_x].to_i) * 5
              offset_upld_img_y = (curr_photo_data[:upld_img_y].to_i - curr_photo_data[:card_y].to_i) * 5
              # Step 8
              if (!curr_photo_data[:img_filter].nil? && curr_photo_data[:img_filter] == "sepia")
                resized_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(upload_path))
                                        .append("-sepia-tone", "80%")
                                        .convert("png")
                                        .resize_to_fill!(upld_img_w, upld_img_h)
              elsif (!curr_photo_data[:img_filter].nil? && curr_photo_data[:img_filter] == "grayscale")
                resized_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(upload_path))
                                        .colorspace('Gray')
                                        .convert("png")
                                        .resize_to_fill!(upld_img_w, upld_img_h)
              else
                resized_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(upload_path))
                                        .convert("png")
                                        .resize_to_fill!(upld_img_w, upld_img_h)
              end
              # Step 9
              if (curr_photo_data[:img_rotate].to_i != 0)
                rotated_upload_img = ImageProcessing::MiniMagick
                                        .source(File.open(resized_upload_img))
                                        .background("transparent")
                                        .convert("png")
                                        .rotate(curr_photo_data[:img_rotate].to_i)
                                        .call
              end
              rotated_resized_img = (curr_photo_data[:img_rotate].to_i === 0) ? resized_upload_img : rotated_upload_img
              base_img = get_base_overlay_img(curr_photo_cfg.w, curr_photo_cfg.h)
              img_iterations[page+'_'+i.to_s] = ImageProcessing::MiniMagick
                                              .source(File.open(base_img))
                                              .composite(File.open(rotated_resized_img), mode: "over", offset: [offset_upld_img_x, offset_upld_img_y])
                                              .convert("png")
                                              .call
            end
            # We have looped over texts. After looping over photo configurations, our base image with pics is ready.
            # We couldnt have imposed text directly on the pics ready image as if we do that there would be problems related
            # to alignment of texts as text imposition would consider the complete underlying image for the text alignment.
            # Whereas it should consider only the text area width and height. Thats the reason we are imposing text over respective
            # blank images and preparing those images separately. Now we shall go ahead and impose all these only text images onto the
            # pics ready images.
            if (!photo_cfgs[hsh_idx].nil?)
              case (photo_cfgs[hsh_idx].count)
              when 1
                img_ready_text_pending[page] = ImageProcessing::MiniMagick
                              .source(img_ready_text_pending["#{page}"])
                              .composite(img_iterations["#{page}_0"], mode: "over", gravity: "north-west", offset: [photo_cfgs[hsh_idx][0].x, photo_cfgs[hsh_idx][0].y])
                              .convert("png")
                              .call
              when 2
                img_ready_text_pending[page] = ImageProcessing::MiniMagick
                              .source(img_ready_text_pending["#{page}"])
                              .composite(img_iterations["#{page}_0"], mode: "over", gravity: "north-west", offset: [photo_cfgs[hsh_idx][0].x, photo_cfgs[hsh_idx][0].y])
                              .composite(img_iterations["#{page}_1"], mode: "over", gravity: "north-west", offset: [photo_cfgs[hsh_idx][1].x, photo_cfgs[hsh_idx][1].y])
                              .convert("png")
                              .call
              when 3
                img_ready_text_pending[page] = ImageProcessing::MiniMagick
                              .source(img_ready_text_pending["#{page}"])
                              .composite(img_iterations["#{page}_0"], mode: "over", gravity: "north-west", offset: [photo_cfgs[hsh_idx][0].x, photo_cfgs[hsh_idx][0].y])
                              .composite(img_iterations["#{page}_1"], mode: "over", gravity: "north-west", offset: [photo_cfgs[hsh_idx][1].x, photo_cfgs[hsh_idx][1].y])
                              .composite(img_iterations["#{page}_2"], mode: "over", gravity: "north-west", offset: [photo_cfgs[hsh_idx][2].x, photo_cfgs[hsh_idx][2].y])
                              .convert("png")
                              .call
              else
              end
              if (page === 'front')
                img_ready_text_pending[page] = ImageProcessing::MiniMagick
                              .source(img_ready_text_pending["#{page}"])
                              .background("white")
                              .composite(front_img_fullsize, mode: "over")
                              .convert("png")
                              .call
              end
            end
          end
          logger.debug "=>=>=>=>=>=>=>=>=>=>Time taken in preparing Inside Photo Image" + "#{Time.now - start}"
        end
        # Step 12
        # The same thing what we did for pictures, we shall be doing a similar stuff with text too.
        # Check for text cfgs on the FRONT page.
        #Fetch only front page text configurations
        if (!text_data[hsh_idx].nil?)
          for i in 0...(text_cfgs[hsh_idx].count)
            curr_text_data = text_data[hsh_idx][i.to_s.to_sym]
            curr_text_cfg = text_cfgs[hsh_idx].find { |text_cfg| text_cfg['id'] == curr_text_data['tcfg_ref_id'].to_i }
            text = curr_text_data[:text]
            font = curr_text_data[:font]
            fontsize = curr_text_data[:fontsize].to_i
            color = curr_text_data[:color]
            textalign = curr_text_data[:align]
            fontstyle = curr_text_data[:fontstyle]
            rotation = curr_text_data[:rotation].to_i

            # if (text_ready_img_pending[page].nil?)
            #   base_img = @img_ready_text_pending[page]
            # else
            #   base_img = text_ready_img_pending[page]
            # end

            # text_ready_img_pending[page] = ImageProcessing::MiniMagick
            #                               .source(base_img)
            #                               .font(set_font_path(font))
            #                               .pointsize(fontsize.to_i * 5)
            #                               .interline_spacing(-100)
            #                               .kerning(0)
            #                               .fill(color)
            #                               .gravity(set_gravity(textalign))
            #                               .draw("text 0,0 '#{text}'")
            #                               .call
            base_img = get_base_overlay_img(curr_text_cfg.w, curr_text_cfg.h)
            # text_ready_img_pending[page+'_'+i.to_s] = ImageProcessing::MiniMagick
            text_ready_img_pending[page+'_'+curr_text_data['tcfg_ref_id'].to_s] = ImageProcessing::MiniMagick
                                            .source(File.open(base_img))
                                            .font(set_font_path(font))
                                            .pointsize(fontsize.to_i * 5)
                                            .interline_spacing(set_ils(font, fontsize))
                                            .kerning(set_kerning(font, fontsize))
                                            .fill(color)
                                            .gravity(set_gravity(textalign))
                                            .draw("text 0,0 '#{text}'")
                                            .call
          end
          # We have looped over texts. After looping over photo configurations, our base image with pics is ready.
          # We couldnt have imposed text directly on the pics ready image as if we do that there would be problems related
          # to alignment of texts as text imposition would consider the complete underlying image for the text alignment.
          # Whereas it should consider only the text area width and height. Thats the reason we are imposing text over respective
          # blank images and preparing those images separately. Now we shall go ahead and impose all these only text images onto the
          # pics ready images.
          if (!text_cfgs[hsh_idx].nil?)
            case (text_cfgs[hsh_idx].count)
            when 1
              @processed[page] = ImageProcessing::MiniMagick
                            .source(img_ready_text_pending["#{page}"])
                            .composite(text_ready_img_pending["#{page}_#{text_cfgs[hsh_idx][0].id}"], mode: "over", gravity: "north-west", offset: [text_cfgs[hsh_idx][0].x, text_cfgs[hsh_idx][0].y])
                            .call
            when 2
              @processed[page] = ImageProcessing::MiniMagick
                            .source(img_ready_text_pending["#{page}"])
                            .composite(text_ready_img_pending["#{page}_#{text_cfgs[hsh_idx][0].id}"], mode: "over", gravity: "north-west", offset: [text_cfgs[hsh_idx][0].x, text_cfgs[hsh_idx][0].y])
                            .composite(text_ready_img_pending["#{page}_#{text_cfgs[hsh_idx][1].id}"], mode: "over", gravity: "north-west", offset: [text_cfgs[hsh_idx][1].x, text_cfgs[hsh_idx][1].y])
                            .call
            when 3
              @processed[page] = ImageProcessing::MiniMagick
                            .source(img_ready_text_pending["#{page}"])
                            .composite(text_ready_img_pending["#{page}_#{text_cfgs[hsh_idx][0].id}"], mode: "over", gravity: "north-west", offset: [text_cfgs[hsh_idx][0].x, text_cfgs[hsh_idx][0].y])
                            .composite(text_ready_img_pending["#{page}_#{text_cfgs[hsh_idx][1].id}"], mode: "over", gravity: "north-west", offset: [text_cfgs[hsh_idx][1].x, text_cfgs[hsh_idx][1].y])
                            .composite(text_ready_img_pending["#{page}_#{text_cfgs[hsh_idx][2].id}"], mode: "over", gravity: "north-west", offset: [text_cfgs[hsh_idx][2].x, text_cfgs[hsh_idx][2].y])
                            .call
            else
            end
          end
        end
      end
      
      if (@processed['front'].blank?)
        # If there's nothing to process for photos and text
        @processed['front'] = img_ready_text_pending['front']
      end
      if (@processed['inside'].blank?)
        # If there's nothing to process for photos and text
        @processed['inside'] = img_ready_text_pending['inside']
      end

      # By now our respective front and inside images are ready. While the inside image is full blows the front image contains only the front image. ideally it should be a full blown front image with back and front image. Lets do that now.
      if (@page_type == "5x7")
        base_img = get_base_overlay_img(3450, 2450)
        @processed['front'] = ImageProcessing::MiniMagick
                        .source(File.open(base_img))
                        .composite(File.open(back_img_fullsize), mode: "over", gravity: "north-west", offset: [0, 0])
                        .composite(@processed['front'], mode: "over", gravity: "north-west", offset: [1725, 0])
                        .call
      else
        
        rotated_back_img = ImageProcessing::MiniMagick
                        .source(File.open(back_img_fullsize))
                        .rotate(180)
                        .call
        
        base_img = get_base_overlay_img(2450, 3450)
        @processed['front'] = ImageProcessing::MiniMagick
                        .source(File.open(base_img))
                        .composite(File.open(rotated_back_img), mode: "over", gravity: "north-west", offset: [0, 0])
                        .composite(@processed['front'], mode: "over", gravity: "north-west", offset: [0, 1725])
                        .call
      end
      

      @card_preview.generated_front.purge_later
      @card_preview.generated_inside.purge_later
      @card_preview.generated_front.attach(io: File.open(@processed['front']), filename: 'finalfront.png')
      @card_preview.generated_inside.attach(io: File.open(@processed['inside']), filename: 'finalinside.jpg')
      logger.debug "Checking FOR GENERATED FRONT FORMAT"
      logger.debug @card_preview.generated_front
      logger.debug @processed
      # puts @card_preview.generated_front.attached?
      # puts "STATUS:::::::"
      # puts rails_blob_path(@front_upload_img)
      # puts rails_blob_path(@front_image)

      # puts "@front_upload_img is " + ImageProcessing::MiniMagick.valid_image?(@front_upload_img).to_s
      
      # puts "@result is " + ImageProcessing::MiniMagick.valid_image?(@processed).to_s
      # @front_upload_img = @front_upload_img.variant(resize: "500x500^", rotate: params[:img_rotate])
      card_x = params[:card_x]
      card_y = params[:card_y]
      image_x = params[:rotated_x]
      image_y = params[:rotated_y]
      @relative_x =  image_x.to_i - card_x.to_i
      @relative_y =  image_y.to_i - card_y.to_i
      puts "Result Image IS ::==> "
      # @front_upload_img = @front_upload_img.variant(rotate: params[:img_rotate])

      # @front_upload_img.rotate(params[:img_rotate])
      
      respond_to do |format|
        format.json
      end
      
    end

    def cardpicsupload
      # puts params[:uploads]
      # upload_images = params[:uploads]
      
      # @card_preview = current_card_preview(create_card_preview_if_necessary: "true")
      # if current_card_preview.nil?
      #   @card_preview = current_card_preview(create_card_preview_if_necessary: "true")
      # else
      #   @card_preview = current_card_preview
      # end
      #card_preview = current_card_preview(create_card_preview_if_necessary: "true")
      add_uploaded_images
      puts "UPLOADED IMAGES:::::::::::::::::::::::::::"
      puts @uploaded_images
      # @uploaded_images = @current_card_preview.uploads
      
      respond_to do |format|
        # format.html { redirect_to cardinit_url(params[:product_id]) }
        format.js
      end
      # render :template => 'spree/card_previews/cardinit'
      # render :js
    end
    
    def delete_upload_attachment
      # if current_card_preview.nil?
      #   @card_preview = current_card_preview(create_card_preview_if_necessary: "true")
      # else
      #   @card_preview = current_card_preview
      # end
      @card_preview = current_card_preview
      @img_id = params[:id]
      @image = ActiveStorage::Attachment.find(params[:id])
      @image.purge
      # redirect_to cardinit_url
    end
    
    def cardinit
      puts "Inside Card Init ::::::::::::::::::::::"
      puts cookies.signed[:token]
      # if current_card_preview.nil?
      #   @card_preview = current_card_preview(create_card_preview_if_necessary: "true")
      # else
      #   @card_preview = current_card_preview
      # end
      if (params[:slug].nil? || (params[:variant_id].nil?) )
        return false
      end
      @slug = params[:slug]
      @card_preview = current_card_preview(create_card_preview_if_necessary: "true")
      @text_cfg_set = {}
      @photo_cfg_set = {}
      @max_itc_text_areas = 0
      @max_itc_photo_areas = 0
      @msgs_repository = {}
      # Fetching the product
      product = Spree::Product.find_by_slug(params[:slug])
      @cec_str = "card-edit-ctg: #{params[:cec]}"
      #@variant = product.variants.includes(:option_values).to_a.find {|var| var.options_text == @cec_str}
      @variant = product.variants.find_by_id(params[:variant_id])
      variant_id = (!@variant.nil? == true ? @variant.id : product.master.id)
      # @variant = Spree::Variant.find_by_id(params[:variant_id])
      img_collection = Spree::Image.where(:viewable_id => variant_id)
      @showcase_image = fetch_showcase_image(img_collection)
      @front_image = fetch_front_image(img_collection)
      @inside_image = fetch_inside_image(img_collection)
      @back_image = fetch_back_image(img_collection)
      @photo_cfgs = @variant.photo_cfgs.where.not(page: [nil, ""])
      @text_cfgs = @variant.text_cfgs.where.not(page: [nil, ""])
      #page alignment type - '5x7' or '7x5'
      @page_type = get_page_alignment_type(@variant)
      # Inspire Me - Message Categories
      # Cache key was generated on rails console using Spree::MessageCategory.all.cache_key command
      cache_key = "spree/message_categories/query-51165e839231025bb42b9b3cd093481c-7-20190719060319886226"
      @msg_ctg_list = Rails.cache.fetch("#{cache_key}/message_categories", expires_in: 10.minutes) do
        Spree::MessageCategory.where(is_visible: true)
      end
      @msg_ctg_list.each do |msg_ctg|
        @msgs_repository.merge!({"#{msg_ctg.name}" => Spree::MessageRepository.where(msg_category_id: msg_ctg.id.to_i).where(is_visible: true).pluck(:message)})
      end
      # Cache key was generated on rails console using Spree::InsideTplCfg.all.cache_key command
      cache_key = "spree/inside_tpl_cfgs/query-c2ca129b85e1fdfab59961eb08510872-1-20190112190435585522"
      @inside_tpl_cfgs = Rails.cache.fetch("#{cache_key}/inside_tpl_cfgs", expires_in: 10.minutes) do
        # Spree::InsideTplCfg.all
        Spree::InsideTplCfg.where(prod_ctg: "Card").where(prod_key: @page_type)
      end
      # @max_itc_text_areas is going to tell us how many text areas do we need to create.
      #
      @inside_tpl_cfgs.each_with_index do |inside_tpl_cfg, index|
        text_areas_count = 0
        photo_areas_count = 0
        # Sorting by order(:id) so that text cfgs display on the page remains intact else between inside template cfgs they were getting distributed randomly.
        inside_tpl_cfg.text_cfgs.each_with_index do |text_cfg, idx|
          text_areas_count = text_areas_count + 1
          text_cfg_hash = {'id' => text_cfg.id, 'x' => text_cfg.x, 'y' => text_cfg.y, 'z' => text_cfg.z, 'w' => text_cfg.w, 'h' => text_cfg.h }
          if (@text_cfg_set[idx].nil?)
            @text_cfg_set[idx] = {inside_tpl_cfg.id.to_s => text_cfg_hash}
          else
            @text_cfg_set[idx].merge!({inside_tpl_cfg.id.to_s => text_cfg_hash})
          end
        end
        inside_tpl_cfg.photo_cfgs.each_with_index do |photo_cfg, idx|
          photo_areas_count = photo_areas_count + 1
          photo_cfg_hash = {'id' => photo_cfg.id, 'x' => photo_cfg.x, 'y' => photo_cfg.y, 'z' => photo_cfg.z, 'w' => photo_cfg.w, 'h' => photo_cfg.h }
          if (@photo_cfg_set[idx].nil?)
            @photo_cfg_set[idx] = {inside_tpl_cfg.id.to_s => photo_cfg_hash}
          else
            @photo_cfg_set[idx].merge!({inside_tpl_cfg.id.to_s => photo_cfg_hash})
          end
        end
        if (text_areas_count > @max_itc_text_areas)
          @max_itc_text_areas = text_areas_count
        end
        if (photo_areas_count > @max_itc_photo_areas)
          @max_itc_photo_areas = photo_areas_count
        end
      end
      #@page_type = get_page_alignment_type(@variant) #5x7 or 7x5
      @uploaded_images = @card_preview.uploads
      logger.debug "TRACING UPLOADED IMAGES ::::::::::::::::::::"
      logger.debug @card_preview.id
      # Initialising the card preview

      render :layout => "spree/layouts/cardpreview_layout"
    end
    
  private
    # The asset types are hardcoded as of now. The search can be done on the name as well in case these ids need to be avoided.
    # This is the order they have been added to the admin config. 1-Front, 2-Inside, 3-Back, 4-Showcase.
    def fetch_showcase_image(img_collection)
      img_collection.find_by_asset_view_type_id(4)
    end

    def fetch_front_image(img_collection)
      img_collection.find_by_asset_view_type_id(1)
    end
    
    def fetch_inside_image(img_collection)
      img_collection.find_by_asset_view_type_id(2)
    end

    def fetch_back_image(img_collection)
      img_collection.find_by_asset_view_type_id(3)
    end
    
    def load_variant
      @variant = Spree::Variant.find(params[:variant_id]) if params[:variant_id]
    end

    def card_preview_params
      # params.require(:card_preview).permit(uploads_attributes: [], :front_type1_datum_attributes , :inside_type1_datum_attributes)
      params.require(:card_preview).permit(:front_type1_datum, :inside_type1_datum, uploads: [])
    end

    def current_card_preview_params
      # { token: cookies.signed[:token], user_id: try_spree_current_user.try(:id), uploads: params[:uploads] }
      { token: cookies.signed[:token], user_id: try_spree_current_user.try(:id), line_item: nil }
    end

    def find_card_preview_by_token_or_user(options = {})
      # options[:lock] ||= false

      # Find any incomplete orders for the token
      # incomplete_orders = Spree::Order.incomplete.includes(line_items: [variant: [:images, :option_values, :product]])
      # token_card_preview_params = current_card_preview_params.except(:user_id, :uploads)
      token_card_preview_params = current_card_preview_params.except(:user_id, :uploads)
      # order = if with_adjustments
      #           incomplete_orders.includes(:adjustments).lock(options[:lock]).find_by(token_order_params)
      #         else
      #           incomplete_orders.lock(options[:lock]).find_by(token_order_params)
      #         end
      # card_preview = Spree::CardPreview.find_by(token_card_preview_params)
      card_preview = Spree::CardPreview.where(token_card_preview_params).first()

      # Find any incomplete orders for the current user
      # order = last_incomplete_order if order.nil? && try_spree_current_user

      card_preview
    end

    def associate_user
      @card_preview ||= current_card_preview
      if try_spree_current_user && @card_preview
        @card_preview.associate_user!(try_spree_current_user) if @card_preview.user.blank? || @card_preview.email.blank?
      end
    end
    
    # The current incomplete order from the token for use in cart and during checkout
    def current_card_preview(options = {})
      options[:create_card_preview_if_necessary] ||= false
      if @current_card_preview && @current_card_preview.line_item.nil?
        # @current_card_preview.last_ip_address = ip_address
        return @current_card_preview
      end

      @current_card_preview = find_card_preview_by_token_or_user(options)
      
      if (options[:create_card_preview_if_necessary] && (@current_card_preview.nil? ||
                                                      (!@current_card_preview.nil? && !@current_card_preview.line_item.nil?)))
        @current_card_preview = Spree::CardPreview.create!(current_card_preview_params)
        @current_card_preview.associate_user! try_spree_current_user if try_spree_current_user
        # @current_card_preview.last_ip_address = ip_address
      else
        # @current_card_preview.uploads.attach(params[:uploads]) if !params[:uploads].nil? && @current_card_preview
        #@current_card_preview = Spree::CardPreview.update(@current_card_preview.id, current_card_preview_params)
        # @current_card_preview.associate_user! try_spree_current_user if try_spree_current_user
      end
      
      @current_card_preview
    end

    def add_uploaded_images(options = {})
      #if !params[:card_preview][:uploads].nil?
        # logger.debug params[:card_preview][:uploads]
        # uploaded_image = @current_card_preview.uploads.attach(params[:card_preview][:uploads][0]) if !params[:card_preview][:uploads].nil? && @current_card_preview
        # uploaded_image = @current_card_preview.uploads.attach(params[:uploads][0]) if !params[:uploads].nil? && @current_card_preview
        # uploaded_image = @current_card_preview.uploads.attach(params[:blob]) if !params[:blob].nil? && @current_card_preview
        #uploaded_image = @current_card_preview.uploads.attach(params[:blob]) if !params[:blob].nil? && @current_card_preview
        card_preview = current_card_preview(create_card_preview_if_necessary: "true")
        uploaded_image = card_preview.uploads.attach(params[:blob]) if !params[:blob].nil? && card_preview
        uploaded_image.first.blob.analyze
        @uploaded_images = uploaded_image
        # puts @current_card_preview
        # @uploaded_images = card_preview.uploads.attach(upload_images) if !params[:uploads].nil? && card_preview
        # @uploaded_images = @current_card_preview.uploads.attach(params[:card_preview][:uploads]) if !params[:card_preview][:uploads].nil? && @current_card_preview
                
      #end

    end
  
    def saveandpreview_params
      params.require(:card).permit(:variant_id)
    end

    # def get_page_alignment_type(variant)
    #   # Since any image can be taken. All will have same page type. Taking 0 index.
    #   img_width = variant.images[0].attachment.blob.metadata['width'].to_i
    #   img_height = variant.images[0].attachment.blob.metadata['height'].to_i

    #   if (img_width <= img_height)
    #     page_type = '5x7'
    #   else
    #     page_type = '7x5'
    #   end
    #   return page_type
    # end

    def get_base_overlay_img(width, height)
      # There are multiple under text overlay images that shall be used while writing the text.
      # Based on the sizes of the text area the overlay images too shall be different.
      # E.g. For a 5x7 1500x2150 full size text area on the left page the overlay image used shall be
      # 5x7-Blank-Overlay-1500x2150.png and for a small 5x7 right page text area the overlay image used shall be
      # 5x7-Blank-Overlay-1500x600.png'). We shall set a default one too in case none is found
      
      asset_imgs_path = "#{Rails.root}/app/assets/images/"
      # Ideally this initialization should be global.
      def_ovly_base_img_name = 'Blank-Overlay-1725x2450.png'
      # default_ovly_images['5x7'] = '5x7-Blank-Overlay-1500x2150.png'
      # default_ovly_images['7x5'] = '7x5-Blank-Overlay-2150x1500.png' # Need to check if its correct.
      
      ovly_img_name = 'Blank-Overlay-' + width.to_s + 'x' + height.to_s + '.png'

      if File.exists?(asset_imgs_path + ovly_img_name)
        return asset_imgs_path + ovly_img_name
      else
        
        ovly_base_img = ImageProcessing::MiniMagick
                        .source(File.open(asset_imgs_path + def_ovly_base_img_name))
                        .convert("png")
                        .resize_to_fill(width, height)
                        .call(save: false)
        
        ovly_base_img <<  asset_imgs_path + ovly_img_name
        ovly_base_img.call
        # return asset_imgs_path + ovly_base_img
        return asset_imgs_path + ovly_img_name
      end
    end

    def set_font_path(fontName)
      case fontName
        when 'Lavanderia'
          path = "#{Rails.root}/vendor/assets/fonts/lavanderia_regular-webfont.ttf"
        when 'Carried Away'
          path = "#{Rails.root}/vendor/assets/fonts/Carried-Away.ttf"
        when 'Daydreamer'
          path = "#{Rails.root}/vendor/assets/fonts/Daydreamer.ttf"
        when 'Peach And Pistachio'
          path = "#{Rails.root}/vendor/assets/fonts/peachandpistachio.ttf"
        when 'Smoothy Script'
          path = "#{Rails.root}/vendor/assets/fonts/Smoothy-Script.ttf"
        when 'Grounday'
          path = "#{Rails.root}/vendor/assets/fonts/Grounday.ttf"
        else
          path = "#{Rails.root}/vendor/assets/fonts/lavanderia-webfont.ttf"
      end
      return path
    end
    def set_gravity(grText)
      case grText
        when 'left'
          gr = 'northwest'
        when 'center'
          gr = 'north'
        when 'right'
          gr = 'northeast'
        else
          gr = 'north'
      end
      return gr
    end
    #Figure out the kerning part to be used in annotate
  def set_kerning(fontName, fontPxSize)
    case fontName
      when 'Lavanderia', 'Carried Away', 'Daydreamer', 'Peach And Pistachio', 'Smoothy Script', 'Grounday'
        k = 1
      else
        k = 1
    end
    return k
  end

  #Interline spacing, another important attribute used in annotate
  def set_ils(fontName, fontPxSize) # Setting Inter line spacing for annotate
    case fontName
    when 'Agent Red'
      case fontPxSize
        when 12
          ils = 30
        when 18
          ils = -10
        when 22
          ils = 0
        else
          ils = 0
      end
    when 'Lavanderia'
      case fontPxSize
        when 24
          ils = -61
        when 27
          ils = -85
        when 30
          ils = -85
        else
          ils = 0
      end
    when 'Carried Away'
      case fontPxSize
        when 17
          ils = -47
        when 19
          ils = -53
        when 21
          ils = -68
        else
          ils = -47
      end
    when 'Daydreamer'
      case fontPxSize
        when 22
          ils = -8
        when 24
          ils = -15
        when 26
          ils = -17
        else
          ils = -8
      end
    when 'Peach And Pistachio'
      case fontPxSize
        when 37
          ils = -39
        when 39
          ils = -43
        when 41
          ils = -50
        else
          ils = -39
      end
    when 'Smoothy Script'
      case fontPxSize
        when 19
          ils = -9
        when 21
          ils = -11
        when 23
          ils = -18
        else
          ils = -9
      end
    when 'Grounday'
      case fontPxSize
        when 34
          ils = 9
        when 37
          ils = 0
        when 40
          ils = -6
        else
          ils = 0
      end
    else
      ils = 0
    end
      # when 'Agent Red'
      #   case fontPxSize
      #     when 12
      #       ils = 30
      #     when 18
      #       ils = -10
      #     when 22
      #       ils = 0
      #     else
      #       ils = 0
      #   end
      # when 'Lavanderia'
      #   case fontPxSize
      #     when 24
      #       ils = -61
      #     when 27
      #       ils = -85
      #     when 30
      #       ils = -85
      #     else
      #       ils = 0
      #   end
      # when 'Carried Away'
      #   case fontPxSize
      #     when 17
      #       ils = -47
      #     when 19
      #       ils = -53
      #     when 21
      #       ils = -68
      #     else
      #       ils = -47
      #   end
      # when 'Daydreamer'
      #   case fontPxSize
      #     when 22
      #       ils = -8
      #     when 24
      #       ils = -15
      #     when 26
      #       ils = -17
      #     else
      #       ils = -8
      #   end
      # when 'Peach And Pistachio'
      #   case fontPxSize
      #     when 37
      #       ils = -39
      #     when 39
      #       ils = -43
      #     when 41
      #       ils = -50
      #     else
      #       ils = -39
      #   end
      # when 'Smoothy Script'
      #   case fontPxSize
      #     when 19
      #       ils = -9
      #     when 21
      #       ils = -11
      #     when 23
      #       ils = -18
      #     else
      #       ils = -9
      #   end
      # when 'Grounday'
      #   case fontPxSize
      #     when 34
      #       ils = 9
      #     when 37
      #       ils = 0
      #     when 40
      #       ils = -6
      #     else
      #       ils = 0
      #   end
      # else
      #   ils = 0
      # end
      puts "ILS:::::: ILS::::::  = " + ((ils*1.15).ceil).to_s
      return (ils*1.15).ceil
    end
  end
end
