// CategoryPage.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from '../utils/withRouter';
import { Link } from 'react-router-dom';
import emptyCartW from '../assets/Empty-Cart-w.png';

class CategoryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      showFullDescription: {},
      isLoading: true, // Added to handle loading state correctly
    };
  }

  componentDidMount() {
    this.fetchProducts();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.name !== this.props.params.name) {
      this.fetchProducts();
    }
  }

  fetchProducts() {
    const { backendUrl } = this.props;
    const categoryName = this.props.params.name.toLowerCase();
    fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query($cat: String!) {
            products(category_name: $cat) {
              id
              name
              price
              inStock
              mainImage
            }
          }
        `,
        variables: { cat: categoryName },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.data && data.data.products) {
          this.setState({ products: data.data.products, isLoading: false });
        } else {
          this.setState({ products: [], isLoading: false });
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        this.setState({ products: [], isLoading: false });
      });
  }

  async handleQuickShop(p) {
    const { backendUrl, addToCart } = this.props;

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query($id: String!) {
              product(id: $id) {
                id
                attributes {
                  name
                  type
                  items {
                    value
                    display_value
                  }
                }
              }
            }
          `,
          variables: { id: p.id },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        alert('Failed to fetch product details for Quick Shop.');
        return;
      }

      const productDetails = result.data?.product;
      if (!productDetails) {
        alert('Product not found for Quick Shop.');
        return;
      }

      let attributes = {};
      if (productDetails.attributes) {
        productDetails.attributes.forEach((attr) => {
          if (attr.items && attr.items.length > 0) {
            attributes[attr.name] = attr.items[0].value;
          }
        });
      }

      const productWithAttrs = {
        ...p,
        attributes: productDetails.attributes,
      };

      addToCart(productWithAttrs, attributes);
    } catch (error) {
      console.error('Error in handleQuickShop:', error);
      alert('An error occurred while processing Quick Shop.');
    }
  }

  render() {
    const { products, isLoading } = this.state;
    const { params } = this.props;

    if (isLoading) {
      return (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      );
    }

    if (!Array.isArray(products)) {
      return <div>Loading products...</div>;
    }

    return (
      <div className="category-page-container">
        <h2 className="selected-category" data-testid="category-title">
          {params.name}
        </h2>
        <div className="category-page">
          {products.map((p) => {
            if (!p || !p.name) return null;
            const testId = `product-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <div
                key={p.id}
                data-testid={testId}
                className="product-card"
              >
                <Link
                  to={`/product/${p.id}`}
                  href={`/product/${p.id}`} // Ensures href matches for testing
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  data-testid={`product-link-${p.id}`}
                >
                  <div className="image-container">
                    <img
                      src={p.mainImage}
                      alt={p.name}
                      className={`product-image ${!p.inStock ? 'out-of-stock-image' : ''}`}
                      loading="lazy"
                      data-testid={`product-image-${p.id}`}
                    />
                    {!p.inStock && (
                      <div
                        className="out-of-stock"
                        data-testid={`out-of-stock-${p.id}`}
                      >
                        OUT OF STOCK
                      </div>
                    )}
                    {p.inStock && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          this.handleQuickShop(p);
                        }}
                        className="quick-shop-btn"
                        data-testid={`quick-shop-btn-${p.id}`}
                        aria-label="Quick Shop"
                      >
                        <img src={emptyCartW} alt="Quick Shop" />
                      </button>
                    )}
                  </div>
                  <div
                    className={`product-name${!p.inStock ? ' out-of-stock-text' : ''}`}
                    data-testid={`product-name-${p.id}`}
                  >
                    {p.name}
                  </div>
                  <div
                    className={`price${!p.inStock ? ' out-of-stock-text' : ''}`}
                    data-testid={`product-price-${p.id}`}
                  >
                    ${p.price.toFixed(2)}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

CategoryPage.propTypes = {
  backendUrl: PropTypes.string.isRequired,
  addToCart: PropTypes.func.isRequired,
  params: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(CategoryPage);
