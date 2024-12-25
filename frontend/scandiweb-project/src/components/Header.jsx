
import React from 'react';
import { Link } from 'react-router-dom';
import aLogo from '../assets/a-logo.png';
import emptyCart from '../assets/Empty-Cart.png';

class Header extends React.Component {
  render() {
    const { categories, currentCategory, cart, onCategorySelect, onCartClick } = this.props;
    const itemCount = cart.reduce((acc, c) => acc + c.quantity, 0);

    return (
      <header>
        <nav>
          {categories.map((cat) => {
            const path = `/${cat.name.toLowerCase()}`;
            const isActive = cat.name.toLowerCase() === currentCategory.toLowerCase();
            return (
              <Link
                key={cat.name}
                to={path}
                href={path} 
                data-testid={isActive ? 'active-category-link' : 'category-link'}
                onClick={() => onCategorySelect(cat.name)}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>
        <img src={aLogo} alt="Logo" className="header-logo" />
        <div className="cart-button-container">
          <button
            data-testid="cart-btn"
            onClick={onCartClick}
            className="cart-btn"
            aria-label="Cart"
          >
            <img src={emptyCart} alt="Cart" className="cart-icon" />
            {itemCount > 0 && (
              <span className="cart-count" data-testid="cart-count">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>
    );
  }
}

export default Header;
