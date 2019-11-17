module Spree
  class MessageCategory < Spree::Base
    validates :name, presence: true, uniqueness: { case_sensitive: false }

    with_options inverse_of: :message_category do
      has_many :message_repositories
    end
  end
end
