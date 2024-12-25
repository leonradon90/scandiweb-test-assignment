// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CartOverlay from './components/CartOverlay';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      currentCategory: 'all',
      cart: [],
      showCartOverlay: false,
    };
    this.backendUrl = 'https://phpstack-1387281-5137453.cloudwaysapps.com/graphql';
  }

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories() {
    fetch(this.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { categories { name } }`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const cats = data.data.categories;
        if (cats && cats.length > 0) {
          this.setState({ categories: cats, currentCategory: cats[0].name.toLowerCase() });
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }

  addToCart = (product, attributes) => {
    this.setState((prevState) => {
      const existingIndex = prevState.cart.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.attributes) === JSON.stringify(attributes)
      );
      let newCart = [...prevState.cart];
      if (existingIndex > -1) {
        newCart[existingIndex].quantity += 1;
      } else {
        newCart.push({ product, attributes, quantity: 1 });
      }
      return { cart: newCart, showCartOverlay: true };
    });
  };

  updateCartItemQuantity = (index, newQuantity) => {
    this.setState((prevState) => {
      let newCart = [...prevState.cart];
      if (newQuantity <= 0) {
        newCart.splice(index, 1);
      } else {
        newCart[index].quantity = newQuantity;
      }
      return { cart: newCart };
    });
  };

  updateCartItemAttribute = (index, attrName, value) => {
    this.setState((prevState) => {
      const newCart = [...prevState.cart];
      newCart[index].attributes[attrName] = value;
      return { cart: newCart };
    });
  };

  clearCart = () => {
    this.setState({ cart: [] });
  };

  changeCategory = (cat) => {
    this.setState({ currentCategory: cat.toLowerCase() });
  };

  toggleCartOverlay = () => {
    this.setState((prevState) => ({ showCartOverlay: !prevState.showCartOverlay }));
  };

  render() {
    const { categories, currentCategory, cart, showCartOverlay } = this.state;
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
          <Route
            path="/"
            element={<Navigate to={`/${currentCategory}`} replace />}
          />
          <Route
            path="/:name"
            element={
              <CategoryPage
                addToCart={this.addToCart}
                backendUrl={this.backendUrl}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductPage
                addToCart={this.addToCart}
                backendUrl={this.backendUrl}
              />
            }
          />
          <Route path="*" element={<div>No route matched</div>} />
        </Routes>
      </div>
    );
  }
}

export default App;
