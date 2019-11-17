Rails.application.routes.draw do
  # This line mounts Spree's routes at the root of your application.
  # This means, any requests to URLs such as /products, will go to
  # Spree::ProductsController.
  # If you would like to change where this engine is mounted, simply change the
  # :at option to something different.
  #
  # We ask that you don't use the :as option here, as Spree relies on it being
  # the default of "spree".
  mount Spree::Core::Engine, at: '/'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  Spree::Core::Engine.add_routes do
    namespace :admin, path: Spree.admin_path do
      resources :inside_tpl_cfgs do
        collection do
          post :update_positions
        end
      end
      resources :product_categories
      resources :asset_view_types
      resources :message_categories do
        collection do
          post :update_positions
        end
      end
      resources :message_repositories do
        collection do
          post :update_positions
        end
      end
    end
    resources :collections do
      member do
        delete :delete_upload_attachment
      end
    end
    #get '/cardinit/:slug/:cec', to: 'card_previews#cardinit', as: 'cardinit'
    get '/cardinit', to: 'card_previews#cardinit', as: 'cardinit'
    # post '/cardinit/cardpicsupload/:slug', to: 'card_previews#cardpicsupload', as: 'cardpicsupload'
    post '/cardinit/cardpicsupload', to: 'card_previews#cardpicsupload', as: 'cardpicsupload'
    post '/cardpreview/preview', to: 'card_previews#saveandpreview', as: 'saveandpreview'
    delete '/cardinit/deleteupload/:id', to: 'card_previews#delete_upload_attachment', as: 'delete_upload_attachment'
    get '/cards/:slug', to: 'products#index', as: 'index'
    get 'ContactUs', to: 'home#contactus', as: 'contactus'
    get 'AboutUs', to: 'home#aboutus', as: 'aboutus'
    get 'CancellationAndRefunds', to: 'home#cnr', as: 'cnr'
    get 'PrivacyPolicy', to: 'home#privacy', as: 'privacy'
    get 'ShipmentAndDelivery', to: 'home#snd', as: 'snd'
    get 'TermsAndConditions', to: 'home#tnc', as: 'tnc'
    get 'HowItWorks', to: 'home#hiw', as: 'hiw'
    get 'Support', to: 'home#support', as: 'support'
    get 'Payment', to: 'home#payment', as: 'payment'
    get 'Disclaimer', to: 'home#disclaimer', as: 'disclaimer'
    get 'Policies', to: 'home#policies', as: 'policies'
    # get 'SampleRack', to: 'home#samplerack', as: 'samplerack'
  end
end
