module ApplicationHelper
  def get_order_state_badge_class(order)
    if order && order.state
      case order.state
      when 'complete'
        badge_class = 'badge-info'
      else
        badge_class = 'badge-secondary'
      end
    end
    badge_class
  end

  def get_payment_state_badge_class(order)
    if order && order.payments && order.payments.first.state
      case order.payments.first.state
      when 'completed'
        badge_class = 'badge-info'
      else
        badge_class = 'badge-secondary'
      end
    end
    badge_class
  end

  def get_shipment_state_badge_class(order)
    if order && order.shipment_state
      case order.shipment_state
      when 'shipped'
        badge_class = 'badge-info'
      when 'ready'
        badge_class = 'badge-warning'
      else
        badge_class = 'badge-secondary'
      end
    end
    badge_class
  end
  
end
