Spree::ProductsController.class_eval do

	def index
		@product_variant_ids = {}
		@product_variants_hash = {}
		active_variant_ids = {}
		@taxon = Spree::Taxon.find_by_name(params[:slug])
		# Org code - Starts
		#@searcher = build_searcher(params.merge(include_images: true))
		if @taxon
			@searcher = build_searcher(params.merge(include_images: true, taxon: @taxon.id))
		else
			@searcher = build_searcher(params.merge(include_images: true))
		end
		@products = @searcher.retrieve_products
    @products = @products.includes(:possible_promotions) if @products.respond_to?(:includes)
		@taxonomies = Spree::Taxonomy.includes(root: :children)
		# Org code - Ends
		@products.each do |product|
			active_variant_ids = get_variant_ids_with_active_option_values(product, current_currency)
			# get_variant_ids_with_active_option_values used map and return [] if no variants are found. hence using empty check.
			if !(active_variant_ids.blank?)
				@product_variant_ids[product.id] = active_variant_ids
				logger.debug "ADDING VARIANT IDS::  #{@product_variant_ids[product.id]}"
				@product_variants_hash[product.id] = get_variants_hash(product, current_currency)
			end
		end
  end

  def showcase
  	#@products = Spree::Taxon.find_by_name(params[:taxon]).products.active
		@products = []
		@product_variant_ids = {}
		@product_variants_hash = {}
		active_variant_ids = {}
  	#permalink in the params is a partial string where as the permalink the taxon db is complete absolute path
  	#A verification for sanity to prevent any possible SQL injection.
  	# case params[:taxon]
	  # 	when "birthday-cards",
	  # 	"birthday-photo-cards",
	  # 	"birthday-cartoon-cards",
	  # 	"birthday-cards-for-her",
	  # 	"birthday-cards-for-him",
	  # 	"birthday-cards-for-parents",
	  # 	"birthday-cards-for-kids",
	  # 	"anniversary-cards-for-husband",
	  # 	"anniversary-cards-for-wife",
	  # 	"anniversary-cards-for-couple",
	  # 	"love-cards-for-him",
	  # 	"love-cards-for-her",
	  # 	"love-cards",
	  # 	"love-photo-cards",
	  # 	"anniversary-cards",
	  # 	"anniversary-photo-cards",
	  # 	"rakhi-cards",
	  # 	"expecting-moms",
	  # 	"encouragement",
	  # 	"farewell",
	  # 	"get-well-soon",
	  # 	"miss-you",
	  # 	"new-born",
	  # 	"sorry",
	  # 	"thank-you",
	  # 	"work-place",
	  # 	"birthday-featured",
	  # 	"anniversary-featured",
	  # 	"love-featured",
	  # 	"thankyou-featured",
	  # 	"hot-sellers",
	  # 	"magic-featured",
	  # 	"wedeng-featured",
	  # 	"wedding-slash-engagement",
	  # 	"newborn-featured",
	  # 	"missyou-featured",
	  # 	"cards-for-mom"
	  # 		@search = params[:permalink].camelize
	  # 	else
	  # 		@search = "birthday-cards"
  	# end

    # @search = params[:taxon]

    taxon = Spree::Taxon.find_by_name(params[:slug])
    @products = taxon.products.active unless !taxon
  	# taxonLst = Spree::Taxon.where("permalink like ?", "%#{@search}%")
  	# @products = taxonLst[0].products.active.descend_by_updated_at unless !taxonLst[0]
  	# @taxon = taxonLst[0].name
  	# @taxonObj = Spree::Taxon.find_by_name(@taxon) #to be used in meta_data_tags for page description
  	# if !@taxon.include? "Card"
  	# 	titleName = @taxon+" Cards"
  	# else
  	# 	titleName = @taxon
  	# end
  	# @title = titleName.camelize+" | Shop Greeting Cards Online in India and make your loved one's day. Buy now and avail 25% off on all cards."
  	#@title = @taxon.camelize
		# render :layout => "spree/layouts/wallrack_layout"
		@products.each do |product|
			active_variant_ids = get_variant_ids_with_active_option_values(product, current_currency)
			# get_variant_ids_with_active_option_values used map and return [] if no variants are found. hence using empty check.
			if !(active_variant_ids.blank?)
				@product_variant_ids[product.id] = active_variant_ids
				logger.debug "ADDING VARIANT IDS::  #{@product_variant_ids[product.id]}"
				@product_variants_hash[product.id] = get_variants_hash(product, current_currency)
			end
		end
		
	end

	def show
		@product_variant_ids = {}
		@product_variants_hash = {}
		active_variant_ids = {}

		@variants = @product.variants_including_master.
								spree_base_scopes.
								active(current_currency).
								includes([:option_values, :images])
		@product_properties = @product.product_properties.includes(:property)
		@taxon = params[:taxon_id].present? ? Spree::Taxon.find(params[:taxon_id]) : @product.taxons.first

		active_variant_ids = get_variant_ids_with_active_option_values(@product, current_currency)
		# get_variant_ids_with_active_option_values used map and return [] if no variants are found. hence using empty check.
		if !(active_variant_ids.blank?)
			@product_variant_ids[@product.id] = active_variant_ids
			@product_variants_hash[@product.id] = get_variants_hash(@product, current_currency)
		end

		redirect_if_legacy_path
	end
	
	private
	def get_all_asset_view_type_ids_map()
		ids_hash = {}

		Spree::AssetViewType.all.each do |avt|
			ids_hash[avt.id] = "#{avt.name}".capitalize
			# ids_hash.push(asset_view)
		end
		
		# asset_view_type = Spree::AssetViewType.find_by_name(asset_view_type_name.capitalize)
		return ids_hash
	end

	def get_hash_of_all_imgs(variant_id)
		imgs_hash = {}
		img_obj = {}
		
		ids_hash = get_all_asset_view_type_ids_map()
		# img_collection = Spree::Image.where(:viewable_id => variant_id).where(:asset_view_type_id => ids_hash[avt_name])
		img_collection = Spree::Image.where(:viewable_id => variant_id)

		img_collection.each do |img_obj|
			if (img_obj.asset_view_type_id.nil?)
					avt_name = 'Display'
			else
					avt_name = ids_hash[img_obj.asset_view_type_id]
			end
			# Initialize the hash value array if its nil.
			if (imgs_hash[avt_name].nil?)
				imgs_hash[avt_name] = []
			end
			imgs_hash[avt_name] << main_app.url_for(img_obj.url(:modalsize))
		end
		
		return imgs_hash
	end

	def get_variant_hash_entries (variant)
		var_hash = {}
		if (variant.images.count > 0)
			# variants_hash[variant.id] = {'images': get_hash_of_all_imgs(variant.id),
			# 														'cec': variant.options_text.sub("card-edit-ctg: ", ""),
			# 														'price': variant.price_in(current_currency).money,
			# 														'in_stock': variant.can_supply? }
			
			# var_hash is populated separately and then added to variants_hash as
			# variants_hash[variant.id]['images'] were resulting in nil class errors.
			var_hash['images'] = get_hash_of_all_imgs(variant.id)
			var_hash['numImages'] = Spree::Image.where(:viewable_id => variant.id).count
			var_hash['cec'] = variant.options_text.sub("card-edit-ctg: ", "")
			var_hash['price'] = variant.price_in(current_currency).money
			var_hash['in_stock'] = variant.can_supply?
			var_hash['page_type'] = get_page_alignment_type(variant)

		end
		var_hash
	end

	def get_variants_hash(product, current_currency = nil)
		variants_hash = {}
		var_hash = {}
		variants_list = product.variants.includes(:option_values).active(current_currency)
		if !variants_list.blank?
			variants_list.select do |variant|
				# Will include only those variants that have got images
				variants_hash[variant.id] = get_variant_hash_entries(variant)
			end
		else
			variant = product.master
			# If none of the variants present, switch to master variant
			variants_hash[variant.id] = get_variant_hash_entries(variant)
		end
		
		# byebug
		variants_hash
	end

	def get_variant_ids_with_active_option_values(product, current_currency)
		var_ids = product.variants.includes(:option_values).active(current_currency).map(&:id)
		if product.id == 4
			byebug
		end
		if var_ids.blank?
			#byebug
			# If no variants, pick master
			var_ids[0] = product.master.id
		end
		var_ids
	end

	# def get_asset_view_type_image(variant_id, asset_view_type_name)
		
	# 	img_collection = Spree::Image.where(:viewable_id => variant_id)
	# 	asset_view_type_id = get_asset_type_id(asset_view_type_name)

	# 	case asset_view_type_name.capitalize
	# 	when 'Showcase'
	# 		img = img_collection.find_by_asset_view_type_id(4)
	# 	when 'Front'
	# 		img = img_collection.find_by_asset_view_type_id(1)
	# 	when 'Inside'
	# 		img = img_collection.find_by_asset_view_type_id(2)
	# 	when 'Back'
	# 		img = img_collection.find_by_asset_view_type_id(3)
	# 	end
	# 	img
	# end

	def get_asset_type_id(asset_view_type_name)
		asset_view_type = Spree::AssetViewType.find_by_name(asset_view_type_name.capitalize)
		return asset_view_type.id
	end
end