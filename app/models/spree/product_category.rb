module Spree
  class ProductCategory < Spree::Base
    validates :name, presence: true, uniqueness: { case_sensitive: false, allow_blank: true }

    with_options inverse_of: :product_category do
      has_many :products
    end
  end
end
