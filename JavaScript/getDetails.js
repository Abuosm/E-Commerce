const params = new URL(location.href).searchParams;
const productId = params.get('productId');
let quantity = document.getElementById("productCount");

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
async function getData(){
    try {
        let response = await fetch('json/products.json');
        let json = await response.json();
        let product = json.find(item => item.id == productId); 

        if (product) {
            displayDetails(product);
        } else {
            console.error('Product not found');
        }
    } catch (error) {
        console.error('Error fetching the data', error);
    }
}
function displayDetails(product){
    let productDetails = document.getElementsByClassName('productDetails')[0];
    productDetails.setAttribute("data-id",product.id)
    document.getElementById("product_image").src = product.images[0];
    document.querySelector(".category_name").innerHTML = product.category;
    document.querySelector(".product_name").innerHTML = product.name;
    document.querySelector(".product_price").innerHTML = convertPriceToINR(product.price);
    document.querySelector(".product_des").innerHTML = product.description;
    const linkAdd = document.getElementById("btn_add");
    linkAdd.addEventListener('click', function(event) {
        event.preventDefault();
        addToCart(product.id , parseInt(quantity.value) || 1); 
        showToast();
    });
}

function showToast() {
    const toastOverlay = document.getElementById("toast-overlay");
    toastOverlay.classList.add("show");
    showCheckAnimation();
    setTimeout(() => {
        toastOverlay.classList.remove("show");
        showCart();
    }, 1000);
   
}

function showCart(){
    let body = document.querySelector('body');
    body.classList.add('showCart');
}

function showCheckAnimation(){
    const checkIconContainer = document.getElementById('checkIcon');
     checkIconContainer.innerHTML = '';
     const newCheckIcon = document.createElement('div');
     newCheckIcon.style.width = '100px';
     newCheckIcon.style.height = '100px';
     checkIconContainer.appendChild(newCheckIcon);
 
     lottie.loadAnimation({
         container: newCheckIcon,
         renderer: 'svg',
         loop: false,
         autoplay: true,
         path: 'json/Animation check.json' 
     });
}
document.getElementById("minus").addEventListener("click", function() {
    let value = parseInt(quantity.value) || 1; 
    if (value > 1) {
      quantity.value = value - 1;
    }
  });

document.getElementById("plus").addEventListener("click", function() {
    let value = parseInt(quantity.value) || 1; 
    if (value < 999) {
      quantity.value = value + 1;
    }
  });

