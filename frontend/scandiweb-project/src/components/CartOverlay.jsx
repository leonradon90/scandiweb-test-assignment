import React from 'react'

function mapAttrNameToGraphQL(name) {
  switch (name) {
    case 'With USB 3 ports':
      return 'withUsb3Ports'
    case 'Touch ID in keyboard':
      return 'touchIdInKeyboard'
    default:
      return name
  }
}

function buildGraphQLAttrs(original) {
  const mapped = {}
  for (const [key, val] of Object.entries(original)) {
    mapped[mapAttrNameToGraphQL(key)] = val
  }
  return mapped
}

export default class CartOverlay extends React.Component {
  placeOrder = () => {
    const { cart, backendUrl, clearCart } = this.props
    const products = cart.map(item => {
      const originalAttrs = item.attributes || {}
      const graphQLAttrs = buildGraphQLAttrs(originalAttrs)
      return {
        id: item.product.id,
        quantity: item.quantity,
        originalAttributes: JSON.stringify(originalAttrs),
        graphQLAttributes: graphQLAttrs
      }
    })
    fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation($order: OrderInput!) {
            placeOrder(order: $order) {
              id
              status
            }
          }
        `,
        variables: { order: { products } }
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.data && data.data.placeOrder) {
          clearCart()
          alert('Order placed successfully!')
        } else {
          alert('Failed to place order. Please try again.')
        }
      })
      .catch(() => {
        alert('An error occurred. Please try again.')
      })
  }

  renderAttributes(item) {
    const product = item.product
    if (!product.attributes || product.attributes.length === 0) return null
    return (
      <div className="cart-item-attributes">
        {product.attributes.map(attr => {
          const isSwatch = attr.type === 'swatch'
          const selectedValue = item.attributes[attr.name]
          const kebabName = attr.name.toLowerCase().replace(/\s+/g, '-')
          return (
            <div
              className="attribute"
              key={attr.name}
              data-testid={`cart-item-attribute-${kebabName}`}
            >
              <h3>{attr.name}</h3>
              <div className="options">
                {attr.items.map(iVal => {
                  const isSelected = selectedValue === iVal.value
                  const kebabValue = iVal.value.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <button
                      key={iVal.value}
                      className={`attribute-btn ${isSwatch ? 'swatch' : ''} ${isSelected ? 'selected' : ''}`}
                      style={isSwatch ? { background: iVal.value } : {}}
                      data-testid={`cart-item-attribute-${kebabName}-${kebabValue}${isSelected ? '-selected' : ''}`}
                      disabled
                    >
                      {isSwatch ? '' : iVal.display_value || iVal.value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    const { cart, updateCartItemQuantity } = this.props
    const totalQuantity = cart.reduce((acc, c) => acc + c.quantity, 0)
    const total = cart.reduce((acc, c) => acc + c.product.price * c.quantity, 0).toFixed(2)
    return (
      <div className="cart-overlay">
        <h2>
          <strong>My Bag,</strong>{' '}
          <span className="cart-items-count">
            {totalQuantity === 1 ? '1 Item' : `${totalQuantity} Items`}
          </span>
        </h2>
        <div className="cart-items">
          {cart.map((item, idx) => (
            <div key={idx} className="cart-item">
              <div className="cart-item-details">
                <div className="cart-item-info">
                  <div>{item.product.name}</div>
                  <div className="cart-item-unit-price">
                    ${item.product.price.toFixed(2)}
                  </div>
                  {this.renderAttributes(item)}
                </div>
                <div className="cart-item-controls">
                  <button
                    data-testid="cart-item-amount-increase"
                    className="cart-quantity-btn"
                    onClick={() => updateCartItemQuantity(idx, item.quantity + 1)}
                  >
                    +
                  </button>
                  <div className="cart-item-quantity" data-testid="cart-item-amount">
                    {item.quantity}
                  </div>
                  <button
                    data-testid="cart-item-amount-decrease"
                    className="cart-quantity-btn"
                    onClick={() => updateCartItemQuantity(idx, item.quantity - 1)}
                  >
                    -
                  </button>
                </div>
              </div>
              <img src={item.product.mainImage} alt={item.product.name} />
            </div>
          ))}
        </div>
        <div className="cart-total-row" data-testid="cart-total">
          <span>Total</span>
          <span>${total}</span>
        </div>
        <button
          disabled={cart.length === 0}
          onClick={this.placeOrder}
          data-testid="place-order-btn"
          className="place-order-btn"
        >
          PLACE ORDER
        </button>
      </div>
    )
  }
}
