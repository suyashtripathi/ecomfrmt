module Spree
  module Admin
    class PhotoCfgController < ResourceController
      belongs_to 'spree/variant', find_by: :id
      # before_action :find_properties
      before_action :setup_property, only: :index

      private

      # def find_properties
      #   @properties = Spree::Property.pluck(:name)
      # end

      def setup_property
        @variant.photo_cfgs.build
      end
    end
  end
end
