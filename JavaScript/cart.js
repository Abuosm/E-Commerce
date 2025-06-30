let cart = [];
let products = [];
let totalPrice = document.getElementById("total_price");
let cartCounter = document.getElementById("cart-counter");
let cartItemsCount = document.getElementById("cart_counts");
const cartTextElements = document.querySelectorAll(".cart_products");
const btnControl = document.querySelector(".btn_control");
const cartTotal = document.querySelector(".cart_total");

loadCart();
getData();
checkCart();

async function getData() {
    let response = await fetch('json/products.json');
    let json = await response.json();
    products = json;
}
function loadCart() {
    let storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId,inputQuantity = 1) {
    let product = products.find(p => p.id == productId);
    if (product) {
        let existingProduct = cart.find(p => p.id == productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            let productWithQuantity = { ...product, quantity: inputQuantity };
            cart.push(productWithQuantity);
        }
        saveCart();
        checkCart();
    }
}

function convertPriceToINR(priceString) {
    const conversionRate = 82; // 1 USD = 82 INR
    if (priceString.includes('-')) {
        let parts = priceString.split('-').map(p => p.trim());
        let convertedParts = parts.map(part => {
            let num = parseFloat(part.replace('$', ''));
            if (isNaN(num)) return part;
            return '₹' + (num * conversionRate).toFixed(2);
        });
        return convertedParts.join(' - ');
    } else {
        let num = parseFloat(priceString.replace('$', ''));
        if (isNaN(num)) return priceString;
        return '₹' + (num * conversionRate).toFixed(2);
    }
}

function addCartToHTML() {
    let content = ``;
    cart.forEach((product, index) => {
        let priceNum = parseFloat(product.price.replace('$', ''));
        if (isNaN(priceNum)) priceNum = 0;
        let totalPriceNum = priceNum * product.quantity;
        let totalPriceINR = '₹' + (totalPriceNum * 82).toFixed(2);
        let priceINR = convertPriceToINR(product.price);
        content += `
        <div class="cart_product">
            <div class="cart_product_img">  
                <img src=${product.images[0]}>
            </div>
            <div class="cart_product_info">  
                <div class="top_card">
                    <div class="left_card">
                        <h4 class="product_name">${product.name}</h4>
                        <span class="product_price">${priceINR}</span>
                    </div>
                    <div class="remove_product" onclick="removeFromCart(${index})">
                        <ion-icon name="close-outline"></ion-icon>
                    </div>
                </div>
                <div class="buttom_card">
                    <div class="counts">
                        <button class="counts_btns minus"  onclick="decreaseQuantity(${index})">-</button>
                        <input type="number" inputmode="numeric" name="productCount" min="1" step="1" max="999"
                            class="product_count"  value=${product.quantity} data-index="${index}">
                        <button  class="counts_btns plus" onclick="increaseQuantity(${index})">+</button>
                    </div>
                    <span class="total_price">${totalPriceINR}</span>
                </div>
            </div>
        </div>`;
    });
    cartTextElements.forEach(element => {
        element.innerHTML = content;
    });;

    // Add event listeners to quantity inputs for dynamic order summary update
    const quantityInputs = document.querySelectorAll('.product_count');
    quantityInputs.forEach(input => {
        input.addEventListener('input', () => {
            let idx = parseInt(input.getAttribute('data-index'));
            if (!isNaN(idx)) {
                let newQuantity = parseInt(input.value);
                if (newQuantity > 0) {
                    cart[idx].quantity = newQuantity;
                    saveCart();
                    updateProductTotalPrice(idx);
                    updateOrderSummary();
                }
            }
        });
    });
}

// New function to update order summary dynamically
function updateOrderSummary() {
    let totalQuantity = cart.reduce((sum, product) => sum + product.quantity, 0);
    let totalPriceValue = cart.reduce((sum, product) => {
        let priceStr = product.price.split('-')[0].trim().replace('$', '');
        let price = parseFloat(priceStr);
        if (isNaN(price)) price = 0;
        return sum + (price * product.quantity);
    }, 0);
    let totalINR = totalPriceValue * 82;

    let orderSpan = document.getElementById('id_order');
    let totalSpan = document.getElementById('total_price');
    if(orderSpan) orderSpan.textContent = totalQuantity;
    if(totalSpan) totalSpan.textContent = `₹${totalINR.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    checkCart();
}
function increaseQuantity(index){
    cart[index].quantity += 1;
    saveCart();
    updateProductTotalPrice(index);
    checkCart();
}
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        saveCart();
        updateProductTotalPrice(index);
        checkCart();
    } else {
        removeFromCart(index);
    }
}

function updateProductTotalPrice(index) {
    let product = cart[index];
    let priceNum = parseFloat(product.price.replace('$', ''));
    if (isNaN(priceNum)) priceNum = 0;
    let totalPriceNum = priceNum * product.quantity;
    let totalPriceINR = '₹' + (totalPriceNum * 82).toFixed(2);

    // Update the total price span for this product in the DOM
    const cartProductElements = document.querySelectorAll('.cart_product');
    if (cartProductElements[index]) {
        const totalPriceSpan = cartProductElements[index].querySelector('.total_price');
        if (totalPriceSpan) {
            totalPriceSpan.textContent = totalPriceINR;
        }
    }
}

function updateTotalPrice() {
    let total = cart.reduce((sum, product) => {
        // Handle price ranges or invalid formats by extracting the first number
        let priceStr = product.price.split('-')[0].trim().replace('$', '');
        let price = parseFloat(priceStr);
        if (isNaN(price)) price = 0;
        return sum + (price * product.quantity);
    }, 0);
    let totalINR = total * 82;
    totalPrice.innerHTML = `₹${totalINR.toFixed(2)}`;
    localStorage.setItem("total price" , totalINR + 70);
    return totalINR;
}

// Initial call to display the cart products on page load
function checkCart(){
    if (cart.length == 0) {
        cartTextElements.forEach(element => {
            element.classList.add("empty");
            element.innerHTML = "Your cart is empty";
        })
        cartCounter.innerHTML = 0;
        btnControl.style.display = "none";
        cartTotal.style.display = "none";
        checkCartPage(0,0);
    } else {
        cartTextElements.forEach(element => {
            element.classList.remove("empty");
        })
        addCartToHTML();
        let totalQuantity = cart.reduce((sum, product) => sum + product.quantity, 0);
        cartCounter.innerHTML = totalQuantity;
        btnControl.style.display = "flex";
        cartTotal.style.display = "flex";
        let total = updateTotalPrice();
        checkCartPage(total,totalQuantity);       
    }
}
// Add cart page not cart section
function checkCartPage(total,totalQuantity){
    if (window.location.pathname.includes("cartPage.html")) {
        if (cart.length == 0) {
            cartItemsCount.innerHTML = `(0 items)`;
            document.getElementById("Subtotal").innerHTML = `$0.00`;
            document.getElementById("total_order").innerHTML = `$0.00`;
        }
        else{
            cartItemsCount.innerHTML = `(${totalQuantity} items)`;
            displayInCartPage(total);
        }
    }
}
function displayInCartPage(total){
    let subTotal = document.getElementById("Subtotal");
    subTotal.innerHTML = `₹${total.toFixed(2)}`;
    let deliveryCharge = 70 * 82; // Convert $70 to INR
    document.getElementById("Delivery").innerHTML = `₹${deliveryCharge.toFixed(2)}`;
    let totalOrder= total + deliveryCharge;
    document.getElementById("total_order").innerHTML = `₹${totalOrder.toFixed(2)}`;
}
function checkOut(){
    let email = localStorage.getItem('email');
    let password = localStorage.getItem('password');
    if (cart.length != 0) {
        // Calculate order number as total quantity
        let totalQuantity = cart.reduce((sum, product) => sum + product.quantity, 0);
        // Calculate total price in INR
        let totalPriceValue = cart.reduce((sum, product) => {
            let priceStr = product.price.split('-')[0].trim().replace('$', '');
            let price = parseFloat(priceStr);
            if (isNaN(price)) price = 0;
            return sum + (price * product.quantity);
        }, 0);
        let totalINR = totalPriceValue * 82;

        // Get current date formatted as "Month day, year"
        let now = new Date();
        let options = { year: 'numeric', month: 'long', day: 'numeric' };
        let formattedDate = now.toLocaleDateString('en-US', options);

        // Update order summary div spans
        let orderSpan = document.getElementById('id_order');
        let totalSpan = document.getElementById('total_price');
        let dateSpan = document.getElementById('order_date');
        if(orderSpan) orderSpan.textContent = totalQuantity;
        if(totalSpan) totalSpan.textContent = `₹${totalINR.toFixed(2)}`;
        if(dateSpan) dateSpan.textContent = formattedDate;

        if(email && password){
          window.location.href = "checkout.html";
        }
        else {
          window.location.href = "login.html";
        }
     }
}
