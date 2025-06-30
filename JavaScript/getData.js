let productsContainer=[];
let linkName=document.getElementsByClassName("categories_link");

const conversionRate = 82; // 1 USD = 82 INR

function convertPriceToINR(priceString) {
    console.log("convertPriceToINR called with:", priceString);
    // Handle price ranges like "$82.00 - $89.00"
    if (priceString.includes('-')) {
        let parts = priceString.split('-').map(p => p.trim());
        let convertedParts = parts.map(part => {
            let num = parseFloat(part.replace('$', ''));
            if (isNaN(num)) return part;
            let converted = '₹' + (num * conversionRate).toFixed(2);
            console.log("Converted part:", part, "to", converted);
            return converted;
        });
        return convertedParts.join(' - ');
    } else {
        let num = parseFloat(priceString.replace('$', ''));
        if (isNaN(num)) return priceString;
        let converted = '₹' + (num * conversionRate).toFixed(2);
        console.log("Converted price:", priceString, "to", converted);
        return converted;
    }
}

getData()
async function getData(category = null){
    let response = await  fetch('json/products.json');
    let json=await response.json();
    productsContainer=json;
    // Exclude bedroom products (include man, bags, jewelry and accessories)
    productsContainer = productsContainer.filter(product => product.category !== "Bedroom");
    // Replace category "Blouse" with "Jewelry" in productsContainer
    productsContainer = productsContainer.map(product => {
        if (product.category === "Blouse") {
            return {...product, category: "Jewelry"};
        }
        return product;
    });
    if (category) {
        productsContainer = productsContainer.filter(product => product.category === category);
    }
    displayProducts();
}
function displayProducts(){
    let container=``;
    for(let i=0;i<productsContainer.length;i++ ){
        container+=`
        <div class="product-card" data-id="${productsContainer[i].id}">
        <div class="card-img">
            <img src=${productsContainer[i].images[0]} alt=${productsContainer[i].name}>
            <a href=""  class="addToCart">
                <ion-icon name="cart-outline" class="Cart"></ion-icon>
            </a>
        </div>
        <div class="card-info">
             <h4 class="product-name">${productsContainer[i].name}</h4>
             <h5 class="product-price">${convertPriceToINR(productsContainer[i].price)}</h5>
        </div>
    </div>`
    }
    document.getElementById("productCount").innerHTML = `${productsContainer.length} Products`;
    document.querySelector('.products .content').innerHTML = container;

    // Add click event listener to each product-card div to open product details
    let productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            let id_product = this.dataset.id;
            displayDetails(id_product);
        });
    });

    // Adding event listener to each "addToCart" link to prevent propagation and add to cart
    let addToCartLinks = document.querySelectorAll('.addToCart');
    addToCartLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation(); // Prevent triggering product-card click
            let productCard = event.target.closest('.product-card');
            if (productCard && productCard.dataset.id) {
                let id_product = productCard.dataset.id;
                addToCart(id_product);
            }
        });
    });
}
function getCategory(e){
    let category = e.target.getAttribute('productCategory');
    setActiveLink(e.target)
    try{
        getData(category);
    }catch(e){
        console.log("not found")
    }
    if (window.innerWidth <= 768) {
        // to close when use select category
        toggleSidebar();
    }
}
function setActiveLink(activeLink) {
    Array.from(linkName).forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

Array.from(linkName).forEach(function(element){
    if(element.getAttribute('productCategory') === 'Bedroom'){
        // Disable bedroom category link (show blouse instead of jewelry)
        element.style.display = 'none'; // Hide the link
    } else {
        element.addEventListener('click',getCategory);
    }
})

function toggleSidebar() {
    var sidebar = document.querySelector(".aside");
    sidebar.classList.toggle("open");
}

function displayDetails(productId){
    window.location.href = `ProductDetails.html?productId=${productId}`;
}
