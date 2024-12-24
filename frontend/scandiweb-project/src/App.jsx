import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import CartOverlay from './components/CartOverlay'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      categories: [],
      currentCategory: 'all',
      cart: [],
      showCartOverlay: false
    }
    this.backendUrl = 'http://localhost:8000/graphql'
  }

  componentDidMount() {
    fetch(this.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { categories { name } }`
      })
    })
      .then(r => r.json())
      .then(data => {
        const cats = data.data.categories
        this.setState({ categories: cats, currentCategory: cats[0].name })
      })
  }

  addToCart = (product, attributes) => {
    const { cart } = this.state
    const existingIndex = cart.findIndex(
      item =>
        item.product.id === product.id &&
        JSON.stringify(item.attributes) === JSON.stringify(attributes)
    )
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({ product, attributes, quantity: 1 })
    }
    this.setState({ cart, showCartOverlay: true })
  }

  updateCartItemQuantity = (index, newQuantity) => {
    const { cart } = this.state
    if (newQuantity <= 0) {
      cart.splice(index, 1)
    } else {
      cart[index].quantity = newQuantity
    }
    this.setState({ cart })
  }

  updateCartItemAttribute = (index, attrName, value) => {
    const { cart } = this.state
    const updatedItem = { ...cart[index] }
    updatedItem.attributes = {
      ...updatedItem.attributes,
      [attrName]: value
    }
    cart[index] = updatedItem
    this.setState({ cart })
  }

  clearCart = () => {
    this.setState({ cart: [] })
  }

  changeCategory = cat => {
    this.setState({ currentCategory: cat })
  }

  toggleCartOverlay = () => {
    this.setState(prev => ({ showCartOverlay: !prev.showCartOverlay }))
  }

  render() {
    const { categories, currentCategory, cart, showCartOverlay } = this.state
    return (
      <div className={showCartOverlay ? 'dimmed-background' : ''}>
        <Header
          categories={categories}
          currentCategory={currentCategory}
          onCategorySelect={this.changeCategory}
          cart={cart}
          onCartClick={this.toggleCartOverlay}
        />
        {showCartOverlay && (
          <>
            <div className="dimmed-overlay" onClick={this.toggleCartOverlay}></div>
            <CartOverlay
              cart={cart}
              backendUrl={this.backendUrl}
              clearCart={this.clearCart}
              updateCartItemQuantity={this.updateCartItemQuantity}
              updateCartItemAttribute={this.updateCartItemAttribute}
            />
          </>
        )}
        <Routes>
          <Route path="/" element={<Navigate to={`/category/${currentCategory}`} />} />
          <Route
            path="/category/:name"
            element={<CategoryPage addToCart={this.addToCart} backendUrl={this.backendUrl} />}
          />
          <Route
            path="/product/:id"
            element={<ProductPage addToCart={this.addToCart} backendUrl={this.backendUrl} />}
          />
          <Route path="*" element={<div>No route matched</div>} />
        </Routes>
      </div>
    )
  }
}

export default App
