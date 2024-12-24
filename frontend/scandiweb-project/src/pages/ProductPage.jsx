import React from 'react';
import { withRouter } from '../utils/withRouter';
import parse from 'html-react-parser';

class ProductPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      selectedAttributes: {},
      currentMainImageIndex: 0
    };
  }

  componentDidMount() {
    this.fetchProduct();
  }

  fetchProduct() {
    const { backendUrl } = this.props;
    const productId = this.props.params.id;
    fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query($id: String!) {
            product(id: $id) {
              id
              name
              price
              inStock
              description
              mainImage
              brand
              category
              gallery
              attributes {
                name
                type
                items {
                  display_value
                  value
                }
              }
            }
          }`,
        variables: { id: productId }
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.errors) {
          this.setState({ product: null });
          return;
        }
        this.setState({ product: data.data.product });
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        this.setState({ product: null });
      });
  }

  // Store the EXACT attribute name for "With USB 3 ports", "Touch ID in keyboard", etc.
  selectAttribute(attrName, value) {
    this.setState(prevState => ({
      selectedAttributes: {
        ...prevState.selectedAttributes,
        [attrName]: value
      }
    }));
  }

  isAllAttributesSelected() {
    const { product, selectedAttributes } = this.state;
    if (!product || !product.attributes) return true;
    return product.attributes.every(attr =>
      Boolean(selectedAttributes[attr.name])
    );
  }

  changeMainImage(index) {
    this.setState({ currentMainImageIndex: index });
  }

  render() {
    const { product, selectedAttributes, currentMainImageIndex } = this.state;
    const { addToCart } = this.props;

    if (product === null) {
      return <div>Error loading product details.</div>;
    }

    if (!product) {
      return <div className="loader"><div className="spinner"></div></div>;
    }

    const allAttributesSelected = this.isAllAttributesSelected();
    const currentImage =
      product.gallery && product.gallery[currentMainImageIndex]
        ? product.gallery[currentMainImageIndex]
        : product.mainImage;

    const totalImages = product.gallery ? product.gallery.length : 0;

    const handlePrevImage = () => {
      this.setState({
        currentMainImageIndex:
          (currentMainImageIndex - 1 + totalImages) % totalImages
      });
    };

    const handleNextImage = () => {
      this.setState({
        currentMainImageIndex:
          (currentMainImageIndex + 1) % totalImages
      });
    };

    return (
      <div className="product-page">
        <div data-testid="product-gallery" className="product-gallery">
          <div className="thumbnails">
            {product.gallery &&
              product.gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} Thumbnail ${i + 1}`}
                  className={i === currentMainImageIndex ? 'selected' : ''}
                  onClick={() => this.changeMainImage(i)}
                  loading="lazy"
                />
              ))}
          </div>
          <div className="main-image-container">
            <button
              className="carousel-btn prev"
              onClick={handlePrevImage}
              aria-label="Previous Image"
            >
              &lt;
            </button>
            <img
              src={currentImage}
              alt={product.name}
              className="main-image"
            />
            <button
              className="carousel-btn next"
              onClick={handleNextImage}
              aria-label="Next Image"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>

          {product.attributes &&
            product.attributes.map(attr => (
              <div
                key={attr.name}
                data-testid={`product-attribute-${attr.name.toLowerCase()}`}
                className="attribute"
              >
                <h3>{attr.name}:</h3>
                <div className="options">
                  {attr.items.map(item => {
                    const isSelected =
                      selectedAttributes[attr.name] === item.value;
                    return (
                      <button
                        key={item.value}
                        className={`attribute-btn ${
                          isSelected ? 'selected' : ''
                        } ${attr.type === 'swatch' ? 'swatch' : ''}`}
                        onClick={() =>
                          this.selectAttribute(attr.name, item.value)
                        }
                        style={
                          attr.type === 'swatch'
                            ? {
                                background: item.value,
                                border: isSelected
                                  ? '2px solid #5ECE7B'
                                  : '1px solid #000'
                              }
                            : {}
                        }
                      >
                        {attr.type !== 'swatch' ? item.display_value : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          <div className="price-label">Price:</div>
          <div className="price">${product.price.toFixed(2)}</div>

          <button
            data-testid="add-to-cart"
            disabled={!allAttributesSelected || !product.inStock}
            onClick={() => addToCart(product, selectedAttributes)}
            className="add-to-cart-btn"
          >
            ADD TO CART
          </button>

          <div data-testid="product-description" className="description">
            {parse(product.description)}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ProductPage);
