Spree::OrdersController.class_eval do
  # Adds a new item to the order (creating a new order if none already exists)
  # Check if product is card or a physical item
  # In case of card - check for card_preview_id else variant_id
  def populate
    
    order    = current_order(create_order_if_necessary: true)
    variant  = Spree::Variant.find(params[:variant_id])
    quantity = params[:quantity].to_i
    options  = params[:options] || {}
    if !params[:card_preview_id].nil?
      card_preview = Spree::CardPreview.find(params[:card_preview_id])
      options [:card_preview] = card_preview
    end
    
    
    # 2,147,483,647 is crazy. See issue #2695.
    if quantity.between?(1, 2_147_483_647)
      begin
        result = cart_add_item_service.call(order: order,
                                            variant: variant,
                                            quantity: quantity,
                                            options: options)
        if result.failure?
          error = result.value.errors.full_messages.join(', ')
        else
          order.update_line_item_prices!
          order.create_tax_charge!
          order.update_with_updater!
          if options.key? :card_preview
            card_preview.line_item = result.value
            card_preview.save
          end
        end
      rescue ActiveRecord::RecordInvalid => e
        error = e.record.errors.full_messages.join(', ')
      end
    else
      error = Spree.t(:please_enter_reasonable_quantity)
    end

    if error
      flash[:error] = error
      redirect_back_or_default(spree.root_path)
    else
      respond_with(order) do |format|
        format.html { redirect_to(cart_path(variant_id: variant.id)) }
      end
    end
  end
end