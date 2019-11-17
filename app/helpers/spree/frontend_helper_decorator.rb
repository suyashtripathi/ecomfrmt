Spree::FrontendHelper.class_eval do

  def checkout_progress(numbers: false)

    # <ul class="custom-nav nav nav-pills mb-5">
    #     <li class="nav-item w-25"><a href="#" class="nav-link text-sm active">Address</a></li>
    #     <li class="nav-item w-25"><a href="#" class="nav-link text-sm disabled">Delivery Method</a></li>
    #     <li class="nav-item w-25"><a href="#" class="nav-link text-sm disabled">Payment Method </a></li>
    #     <li class="nav-item w-25"><a href="#" class="nav-link text-sm disabled">Order Review</a></li>
    #   </ul>

    states = @order.checkout_steps
    items = states.each_with_index.map do |state, i|
      text = Spree.t("order_state.#{state}").titleize
      text.prepend("#{i.succ}. ") if numbers

      css_classes = ['nav-item']
      current_index = states.index(@order.state)
      state_index = states.index(state)

      if state_index < current_index
        css_classes << 'completed'
        text = link_to text, checkout_state_path(state), class: 'nav-link text-sm'
      end

      css_classes << 'next disabled' if state_index == current_index + 1
      css_classes << 'active' if state == @order.state
      css_classes << 'first disabled' if state_index == 0
      css_classes << 'last disabled' if state_index == states.length - 1
      # No more joined classes. IE6 is not a target browser.
      # Hack: Stops <a> being wrapped round previous items twice.
      if state_index < current_index
        content_tag('li', text, class: css_classes.join(' '))
      else
        content_tag('li', content_tag('a', text, class: "nav-link text-sm #{'active' if state == @order.state}"), class: css_classes.join(' '))
      end
    end
    #content_tag('ul', raw(items.join("\n")), class: 'progress-steps nav nav-pills nav-justified flex-column flex-md-row', id: "checkout-step-#{@order.state}")
    content_tag('ul', raw(items.join("\n")), class: 'progress-steps nav nav-pills nav-justified mb-5', id: "checkout-step-#{@order.state}")
  end

  def link_to_cart(text = nil)
    text = nil
    # text = text ? h(text) : Spree.t('cart')
    css_class = nil

    # if simple_current_order.nil? || simple_current_order.item_count.zero?
      
    #   # text = "<span class='glyphicon glyphicon-shopping-cart'></span> #{text}: (#{Spree.t('empty')})"
    #   # css_class = 'empty'
    # else
    #   text = "<span class='glyphicon glyphicon-shopping-cart'></span> #{text}: (#{simple_current_order.item_count})
    #           <span class='amount'>#{simple_current_order.display_total.to_html}</span>"
    #   css_class = 'full'
    # end
    text = "<a href='/cart' class='navbar-icon-link d-lg-none'><svg class='svg-icon'><use href='#cart-1'></use></svg><div class='navbar-icon-link-badge'>#{simple_current_order.item_count}</div></a>"

    link_to text.html_safe, spree.cart_path
  end

  def flash_messages(opts = {})
    ignore_types = ['order_completed'].concat(Array(opts[:ignore_types]).map(&:to_s) || [])
    dismiss_content = "<button type='button' class='close aria-label='Close'><span aria-hidden='true'>&times;</span></button>"

    flash.each do |msg_type, text|
      concat(content_tag(:div, (text + dismiss_content).html_safe, class: "alert alert-#{msg_type} close-wrap-div")) unless ignore_types.include?(msg_type)
    end
    nil
  end

  def taxons_tree(root_taxon, current_taxon, max_level = 1)
    return '' if max_level < 1 || root_taxon.leaf?

    content_tag :div, class: 'nav nav-pills flex-column ml-3' do
      taxons = root_taxon.children.map do |taxon|
        #css_class = current_taxon&.self_and_ancestors&.include?(taxon) ? 'list-group-item list-group-item-action active' : 'list-group-item list-group-item-action'
        #css_class = current_taxon&.self_and_ancestors&.include?(taxon) ? 'nav-link mb-2 font-weight-bold' : 'nav-link mb-2'
        if (taxon.children.any? && (max_level == Spree::Config[:max_level_in_taxons_menu] || 1 ))
          css_class = 'nav-link mb-2 font-weight-bold'
        else
          css_class = 'nav-link mb-2'
        end
        #link_to(taxon.name.gsub("-", " ").titleize, seo_url(taxon), class: css_class) + taxons_tree(taxon, current_taxon, max_level - 1)
        link_to(taxon.name.gsub("-", " ").titleize, spree.products_path(slug: taxon.name), class: css_class) + taxons_tree(taxon, current_taxon, max_level - 1)
        
      end
      safe_join(taxons, "\n")
    end
  end

=begin
  def checkout_progress(numbers: false)
    states = @order.checkout_steps
    items = states.each_with_index.map do |state, i|
      text = Spree.t("order_state.#{state}").titleize
      text.prepend("#{i.succ}. ") if numbers

      css_classes = ['nav-item']
      link_classes = ['nav-link text-sm']
      current_index = states.index(@order.state)
      state_index = states.index(state)

      if state_index < current_index
        css_classes << 'completed'

      end
      link_classes << 'active' if state == @order.state
      link_classes << 'disabled' if state_index > current_index

      #text = link_to text, checkout_state_path(state), class: 'nav-link'
      text = link_to text, checkout_state_path(state), class: link_classes.join(' ')

      css_classes << 'next' if state_index == current_index + 1
      css_classes << 'active' if state == @order.state
      css_classes << 'first' if state_index == 0
      css_classes << 'last' if state_index == states.length - 1
      # No more joined classes. IE6 is not a target browser.
      # Hack: Stops <a> being wrapped round previous items twice.
      if state_index < current_index
        content_tag('li', text, class: css_classes.join(' '))
      else
        content_tag('li', content_tag('a', text, class: "nav-link #{'active text-white' if state == @order.state}"), class: css_classes.join(' '))
      end
    end
    content_tag('ul', raw(items.join("\n")), class: 'progress-steps justify-content-around nav nav-pills nav-justified flex-column flex-md-row', id: "checkout-step-#{@order.state}")
  end
=end
end

#<ul class="custom-nav nav nav-pills mb-5">
#              <li class="nav-item w-25"><a href="checkout1.html" class="nav-link text-sm ">Address</a></li>
#              <li class="nav-item w-25"><a href="checkout2.html" class="nav-link text-sm active">Delivery Method</a></li>
#              <li class="nav-item w-25"><a href="#" class="nav-link text-sm disabled">Payment Method </a></li>
#              <li class="nav-item w-25"><a href="#" class="nav-link text-sm disabled">Order Review</a></li>
#            </ul>