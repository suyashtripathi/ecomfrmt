Spree::Core::Search::Base.class_eval do
    
  # method should return new scope based on base_scope
  def get_products_conditions_for(base_scope, query)
    unless query.blank?
      base_scope = base_scope.like_any([:name, :description, :meta_keywords], query.split)
    end
    base_scope
  end
end