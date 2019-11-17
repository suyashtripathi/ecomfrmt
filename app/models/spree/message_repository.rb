module Spree
  class MessageRepository < Spree::Base
    validates_presence_of :msg_category_id

    belongs_to :message_category, class_name: 'Spree::MessageCategory'
    
  end
end
