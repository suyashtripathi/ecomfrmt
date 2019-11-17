module Spree
  module Admin
    class InsideTplCfgsController < ResourceController
      new_action.before :new_before
      before_action :load_data, only: [:new, :create, :edit, :update]
      
      def index
        respond_with(@collection)
      end

      def destroy
        @inside_tpl_cfg = InsideTplCfg.find(params[:id])
        if @inside_tpl_cfg.destroy
          flash[:success] = Spree.t('notice_messages.inside_tpl_cfg_deleted')
        else
          flash[:error] = Spree.t('notice_messages.inside_tpl_cfg_not_deleted', error: @inside_tpl_cfg.errors.full_messages.to_sentence)
        end
    
        respond_with(@inside_tpl_cfg) do |format|
          format.html { redirect_to admin_inside_tpl_cfgs_path }
          format.js { render_js_for_destroy }
        end
      end
      
      private

      def collection
        return @collection if @collection.present?
        # params[:q] can be blank upon pagination
        params[:q] = {} if params[:q].blank?

        @collection = super
        @search = @collection.ransack(params[:q])
        @collection = @search.result.
                      order(:id).
                      page(params[:page]).
                      per(Spree::Config[:admin_properties_per_page])
      end

      def load_data
        @inside_tpl_cfgs = InsideTplCfg.order(:name)
      end
            
      protected

      def new_before

        1.times { @inside_tpl_cfg.photo_cfgs.build }
        1.times { @inside_tpl_cfg.text_cfgs.build }
    
      end
    end
  end
end
