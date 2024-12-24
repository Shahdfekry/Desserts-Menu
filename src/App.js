import { useState } from "react";
import data from "./data.json";
import { useLocalStorageState } from "./useLocalStorageState";

function App() {
  const [addedProducts, setAddedProducts] = useLocalStorageState(
    [],
    "addedProducts"
  );

  return (
    <div className="container">
      <DessertList
        addedProducts={addedProducts}
        setAddedProducts={setAddedProducts}
      />
      <Cart addedProducts={addedProducts} setAddedProducts={setAddedProducts} />
    </div>
  );
}

function DessertList({ addedProducts, setAddedProducts }) {
  return (
    <div className="dessert-list">
      <h1>Desserts</h1>
      <div className="desserts">
        {data.map((dessert) => (
          <Dessert
            dessert={dessert}
            key={dessert.name}
            addedProducts={addedProducts}
            setAddedProducts={setAddedProducts}
          />
        ))}
      </div>
    </div>
  );
}

function Dessert({ dessert, addedProducts, setAddedProducts }) {
  const productInCart = addedProducts.find(
    (product) => product.name === dessert.name
  );
  const isAddedToCart = productInCart?.isAddedToCart || false;
  const [productCount, setProductCount] = useState(1);

  function handleButtonChange() {
    setProductCount(1);
    handleAddToCart();
  }
  function handleIncrementCount() {
    const newCount = productCount + 1;
    setProductCount(newCount);
    handleAddToCart(newCount);
  }

  function handleDecrementCount() {
    const newCount = Math.max(0, productCount - 1);
    setProductCount(newCount);
    handleAddToCart(newCount);
  }
  function handleAddToCart(updatedCount) {
    const productIndex = addedProducts.findIndex(
      (product) => product.name === dessert.name
    );
    if (productIndex > -1) {
      const updatedProducts = [...addedProducts];
      if (updatedCount === 0) {
        updatedProducts.splice(productIndex, 1);
        setAddedProducts(updatedProducts);
        console.log(updatedProducts);
      } else {
        updatedProducts[productIndex].count = updatedCount;
        setAddedProducts(updatedProducts);
        console.log(updatedProducts);
      }
    } else {
      const newProduct = {
        name: dessert.name,
        price: dessert.price.toFixed(2),
        count: updatedCount || 1,
        isAddedToCart: true,
        image: dessert.image.thumbnail,
      };
      const newProducts = [...addedProducts, newProduct];

      setAddedProducts(newProducts);
      console.log(newProducts);
    }
  }

  return (
    <div className="dessert">
      <div className="dessert-image">
        <picture>
          <source media="(min-width: 769px)" srcSet={dessert.image.desktop} />
          <source media="(min-width: 481px)" srcSet={dessert.image.tablet} />
          <img
            className={isAddedToCart ? "selected" : ""}
            src={dessert.image.mobile}
            alt={dessert.name}
          />
        </picture>
        {!isAddedToCart ? (
          <Button className={"btn btn-unselected"} onClick={handleButtonChange}>
            <span>
              <img
                src="/assets/images/icon-add-to-cart.svg"
                alt="add to cart"
              />
            </span>
            <p>Add to Cart</p>
          </Button>
        ) : (
          <Button className={"btn btn-selected"}>
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="2"
                fill="#fff"
                viewBox="0 0 10 2"
                onClick={handleDecrementCount}
                className="decrement-icon"
              >
                <path d="M0 .375h10v1.25H0V.375Z" />
              </svg>
            </span>
            <p>{productCount}</p>
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                fill="#fff"
                viewBox="0 0 10 10"
                onClick={handleIncrementCount}
                className="increment-icon"
              >
                <path d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z" />
              </svg>
            </span>
          </Button>
        )}
      </div>
      <p className="dessert-category">{dessert.category}</p>
      <p className="dessert-name">{dessert.name}</p>
      <p className="dessert-price">${dessert.price.toFixed(2)}</p>
    </div>
  );
}

function Cart({ addedProducts, setAddedProducts }) {
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const orderTotalPrice = addedProducts.reduce(
    (acc, product) => acc + Number(product.price) * Number(product.count),
    0
  );
  return (
    <div className="cart">
      {addedProducts.length === 0 ? (
        <EmptyCart />
      ) : (
        <FullCart
          addedProducts={addedProducts}
          setAddedProducts={setAddedProducts}
          setShowOrderConfirmation={setShowOrderConfirmation}
          orderTotalPrice={orderTotalPrice}
        />
      )}
      {showOrderConfirmation && (
        <Modal>
          <OrderConfirmation
            addedProducts={addedProducts}
            orderTotalPrice={orderTotalPrice}
            setAddedProducts={setAddedProducts}
            setShowOrderConfirmation={setShowOrderConfirmation}
          />
        </Modal>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="empty-cart">
      <h2>Your Cart (0)</h2>
      <div className="empty-cart-details">
        <img src="/assets/images/illustration-empty-cart.svg" alt="cake" />
        <p>Your added items will appear here</p>
      </div>
    </div>
  );
}

function FullCart({
  addedProducts,
  setAddedProducts,
  setShowOrderConfirmation,
  orderTotalPrice,
}) {
  const productsCount = addedProducts.reduce(
    (acc, product) => acc + Number(product.count),
    0
  );
  function handleRemoveFromCart(name) {
    setAddedProducts((addedProducts) =>
      addedProducts
        .map((product) =>
          product.name === name ? { ...product, isAddedToCart: false } : product
        )
        .filter((product) => product.name !== name)
    );
  }

  return (
    <div>
      <div className="full-cart">
        <h2>Your Cart ({productsCount})</h2>

        {addedProducts.map((product) => (
          <AddedProduct
            name={product.name}
            price={product.price}
            count={product.count}
            onRemoveFromCart={handleRemoveFromCart}
            key={product.name}
          />
        ))}
        <OrderTotal orderTotalPrice={orderTotalPrice} />
        <OrderDelivery />
        <Button
          className={"btn btn-confirm-order"}
          onClick={() => setShowOrderConfirmation(true)}
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
}

function AddedProduct({ name, price, count, onRemoveFromCart }) {
  return (
    <div className="product" key={name}>
      <div className="product-details">
        <p className="product-name">{name}</p>
        <div className="product-bill">
          <p className="product-count">{count}x</p>
          <p className="product-price">@ ${price}</p>
          <p className="product-total-price">
            ${(Number(count) * Number(price)).toFixed(2)}
          </p>
        </div>
      </div>
      <span className="added-product-image">
        {/* <img
          className="btn"
          src="/assets/images/icon-remove-item.svg"
          alt="remove"
          onClick={() => onRemoveFromCart(name)}
        /> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          fill="#CAAFA7"
          viewBox="0 0 10 10"
          onClick={() => onRemoveFromCart(name)}
          className="btn remove-icon"
        >
          <path d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z" />
        </svg>
      </span>
    </div>
  );
}
function OrderTotal({ orderTotalPrice }) {
  return (
    <div className="order-total">
      <p>Order Total</p>
      <p>${orderTotalPrice.toFixed(2)}</p>
    </div>
  );
}
function OrderDelivery() {
  return (
    <div className="order-delivery">
      <span>
        <img
          src="/assets/images/icon-carbon-neutral.svg"
          alt="carbon-neutral"
        />
      </span>
      <p>
        This is a <span className="highlight">carbon-neutral</span> delivery
      </p>
    </div>
  );
}

function Modal({ children }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>
  );
}

function OrderConfirmation({
  addedProducts,
  setAddedProducts,
  orderTotalPrice,
  setShowOrderConfirmation,
}) {
  function handleReset() {
    setAddedProducts([]);
    setShowOrderConfirmation(false);
  }
  return (
    <div className="order-confirmation">
      <span>
        <img
          src="/assets/images/icon-order-confirmed.svg"
          alt="order confirmed"
        />
      </span>

      <h1>Order Confirmed</h1>

      <p className="first-p">We hope you enjoy your food!</p>
      <div className="confirmed-products">
        {addedProducts.map((product) => (
          <ConfirmedProduct
            name={product.name}
            price={product.price}
            image={product.image}
            count={product.count}
            key={product.name}
          />
        ))}
        <OrderTotal orderTotalPrice={orderTotalPrice} />
      </div>

      <Button className={"btn btn-confirm-order"} onClick={handleReset}>
        Start New Order
      </Button>
    </div>
  );
}

function ConfirmedProduct({ name, price, image, count }) {
  return (
    <div>
      <div className="product">
        <div className="product-image-details">
          <span className="confirmed-product-image">
            <img src={image} alt="confirmed-product" />
          </span>
          <div className="product-details">
            <p className="product-name truncated-text">{name}</p>
            <div className="product-bill">
              <p className="product-count">{count}x</p>
              <p className="product-price">@ ${price}</p>
            </div>
          </div>
        </div>
        <p className="confirmed-product-total-price">
          ${(Number(count) * Number(price)).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function Button({ children, className, onClick }) {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
export default App;
