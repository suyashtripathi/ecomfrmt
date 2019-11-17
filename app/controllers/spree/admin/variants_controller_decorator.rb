Spree::Admin::VariantsController.class_eval do

  protected

  def new_before
    master = @object.product.master
    @object.attributes = master.attributes.except(
      'id', 'created_at', 'deleted_at', 'sku', 'is_master'
    )
    1.times { @variant.photo_cfgs.build }
    1.times { @variant.text_cfgs.build }

    # Shallow Clone of the default price to populate the price field.
    @object.default_price = master.default_price.clone if master.default_price.present?
  end
end