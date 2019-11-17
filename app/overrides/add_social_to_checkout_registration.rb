Deface::Override.new(
  virtual_path: 'spree/checkout/registration',
  name: 'add_socials_to_login_extras',
  insert_after: '[data-hook="login_extras"]',
  text: '<%= render partial: "spree/shared/social" unless session[:omniauth] %>'
)
