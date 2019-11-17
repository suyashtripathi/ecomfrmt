Spree::Order.class_eval do
  before_validation(on: :create) do
    self.number = Spree::Core::NumberGenerator.new(prefix: 'MT').send(:generate_permalink, Spree::Order)
  end
end
