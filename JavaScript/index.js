var currentSlide = 1;
window.addEventListener("load",function(){
    // slider runs on all screen sizes now
    if (document.querySelectorAll(".slider .slide-content").length > 0) {
        theChecker();
        playSlider();
    }
    getTrendingProducts();
});

function nextSlider() {
    var btnNext = document.getElementsByClassName("next")[0];
    if (btnNext.classList.contains('disabled')) {
        return false;
    } else {
        currentSlide++;
        theChecker();
    }
}

function prevSlider() {
    var btnPrev = document.getElementsByClassName("prev")[0];
    if (btnPrev.classList.contains('disabled')) {
        return false;
    } else {
        currentSlide--;
        theChecker();
    }
}

function theChecker() {
    var imgSlider = document.querySelectorAll(".slide-content");
    var btnNext = document.getElementsByClassName("next")[0];
    var btnPrev = document.getElementsByClassName("prev")[0];
    imgSlider.forEach(function (img) {
        img.classList.remove('active');
    });

    imgSlider[currentSlide - 1].classList.add('active');

    if (currentSlide == 1) {
        btnPrev.classList.add('disabled');
    } else {
        btnPrev.classList.remove('disabled');
    }

    if (currentSlide == imgSlider.length) {
        btnNext.classList.add('disabled');
    } else {
        btnNext.classList.remove('disabled');
    }
}
function playSlider() {
   var imgSlider = document.querySelectorAll(".slide-content");
   setInterval(function() {
        if (currentSlide < imgSlider.length) {
            currentSlide++;
        } else {
            currentSlide = 1;
        }
        theChecker();
    }, 3000);
}

async function getTrendingProducts() {
    let response = await fetch('json/products.json');
    let products = await response.json();
    // Include all categories for trending products
    let allCategories = [...new Set(products.map(p => p.category))];
    // Shuffle products array
    for (let i = products.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [products[i], products[j]] = [products[j], products[i]];
    }
    // Select up to 30 products randomly from all categories
    let trendingProducts = [];
    let categoryCount = {};
    const maxProducts = 30;
    for (let product of products) {
        if (trendingProducts.length >= maxProducts) break;
        let cat = product.category;
        if (!categoryCount[cat]) categoryCount[cat] = 0;
        // Limit to max 5 products per category to ensure variety
        if (categoryCount[cat] < 5) {
            trendingProducts.push(product);
            categoryCount[cat]++;
        }
    }
    displayTrendingProducts(trendingProducts);
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

function displayTrendingProducts(trendingProducts){
    // Add sliding animation h3 before trending products
    const topProductsContainer = document.querySelector(".top_products .container");
    if (topProductsContainer && !document.querySelector(".top_products .sliding-announcement")) {
        const slidingContainer = document.createElement("div");
        slidingContainer.className = "sliding-announcement";

        const text1 = document.createElement("span");
        text1.textContent = "Our e-commerce collection is now available offline at BELLAD TOWER, C. P. BAZAR, Sirsi, Karnataka 581401 — online store coming soon!";

        const text2 = document.createElement("span");
        text2.textContent = text1.textContent;

        slidingContainer.appendChild(text1);
        slidingContainer.appendChild(text2);

        topProductsContainer.insertBefore(slidingContainer, topProductsContainer.firstChild);
    }

    let content = ``;
    for(let i = 0 ; i < trendingProducts.length ; i++){
        content += `
        <div class="product-card"  data-id="${trendingProducts[i].id}">
        <div class="card-img">
            <img src=${trendingProducts[i].images[0]}  onclick=displayDetails(${trendingProducts[i].id});>
            <a href="" class="addToCart">
                <ion-icon name="cart-outline" class="Cart"></ion-icon>
            </a>
        </div>
        <div class="card-info">
             <h4 class="product-name" onclick=displayDetails(${trendingProducts[i].id});>${trendingProducts[i].name}</h4>
             <h5 class="product-price">${convertPriceToINR(trendingProducts[i].price)}</h5>
        </div>
    </div>`
    }
    
document.querySelector(".top_products .products").innerHTML = content;
let addToCartLinks = document.querySelectorAll('.addToCart');
addToCartLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        let productCard = event.target.closest('.product-card');
        if (productCard && productCard.dataset.id) {
            let id_product = productCard.dataset.id;
            addToCart(id_product);
            showCart();
        }
        });
    });
}
function showCart(){
    let body = document.querySelector('body');
    body.classList.add('showCart');
}
function displayDetails(productId){
    window.location.href = `ProductDetails.html?productId=${productId}`;
}