/**
 *
 */
function trackJavaScriptError(a) {
    const b = new XMLHttpRequest();
    (b.open("POST", "https://ec.adadapted.com/frontend/errors"),
        b.send(
            JSON.stringify({
                error_timestamp: Date.now(),
                error_url: window.location.href,
                error_label: "Uncaught JavaScript Error",
                error_message: a.message,
                error_location: a.filename + ": line:" + a.lineno + ", column: " + a.colno
            })
        ));
}

window.addEventListener("error", trackJavaScriptError, !1);

let resizeTimeout;

const urlParams = new URLSearchParams(location.search);
const platform = urlParams.has("platform") ? urlParams.get("platform") : "desktop";
const auctionId = urlParams.has("auctionId") ? urlParams.get("auctionId") : "";
const userId = urlParams.has("userId") ? urlParams.get("userId") : "";
const zipCode = urlParams.has("zipCode") ? urlParams.get("zipCode") : "";
const country = urlParams.has("country") ? urlParams.get("country") : "";
const ipAddress = urlParams.has("ipAddress") ? urlParams.get("ipAddress") : "";
const adId = urlParams.has("adId") ? urlParams.get("adId") : "";

const brandInfo = urlParams.has("brandInfo") ? urlParams.get("brandInfo") : "";
const recipeInfo = urlParams.has("recipeInfo") ? urlParams.get("recipeInfo") : "";
const featuredIngredient = urlParams.has("featuredIngredient") ? urlParams.get("featuredIngredient") : "";
const ingredientList = urlParams.has("ingredientList") ? urlParams.get("ingredientList") : "";
const instructionsList = urlParams.has("instructionsList") ? urlParams.get("instructionsList") : "";

/**
 *
 */
function recordEvent(eventType, eventData) {
    // .com for prod and .dev for stg/dev
    // changed web_share_events to recipe_share_events
    fetch(
        `https://telemetry.adadapted.dev/v/0.9.5/${eventType === "interstitial" ? `${platform.toLowerCase()}/interstitial/events` : "recipe_share_events"}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventData)
        }
    );
}

// insert function for recording a bannerEvent here??

/**
 *
 */
function getCurrentTimestampUTC() {
    const date = new Date(new Date().getTime());

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// function for populating product card
/**
 *
 */
function populateFeaturedProductCard() {
    const productCard = document.getElementsByClassName("product-card")[0];
    const decodedFeaturedIngredient = JSON.parse(atob(featuredIngredient));
    // console.log(decodedFeaturedIngredient)

    const productImage = productCard
        .getElementsByClassName("product-image-container")[0]
        .getElementsByClassName("product-image")[0];
    productImage.src = decodedFeaturedIngredient.productImageUrl;

    const productDetailsContainer = document.getElementsByClassName("product-details-container")[0];
    const brandName = productDetailsContainer.getElementsByClassName("brand-name")[0];
    const productName = productDetailsContainer.getElementsByClassName("product-name")[0];
    const productSize = productDetailsContainer.getElementsByClassName("product-size")[0];

    brandName.innerText = decodedFeaturedIngredient.brandName;
    productName.innerText = decodedFeaturedIngredient.productName;
    productSize.innerText = decodedFeaturedIngredient.productSize;

    const decodedBrandInfo = JSON.parse(atob(brandInfo));
    const brandColor = decodedBrandInfo.brandColor;
    const root = document.documentElement;
    root.style.setProperty("--brand-color", brandColor);

    const ctaButton = productCard.getElementsByClassName("button-container")[0].getElementsByClassName("button")[0];
    ctaButton.innerText = decodedFeaturedIngredient.buttonText;

    ctaButton.addEventListener("click", () => {
        window.open(decodedFeaturedIngredient.buttonUrl, "_blank");
    });
}

// function for populating Recipe Title and Recipe Image
/**
 *
 */
function populateRecipeInfo() {
    const decodedRecipeInfo = JSON.parse(atob(recipeInfo));
    // console.log(decodedRecipeInfo);

    const recipeImage = document
        .getElementsByClassName("recipe-image-container")[0]
        .getElementsByClassName("recipe-image")[0];
    recipeImage.src = decodedRecipeInfo.recipeImageUrl;

    // Another recipe-image-container(but small) for smaller screen size:
    const recipeImageSmall = document
        .getElementsByClassName("recipe-image-container-small")[0]
        .getElementsByClassName("recipe-image")[0];
    recipeImageSmall.src = decodedRecipeInfo.recipeImageUrl;

    const recipeTitle = document
        .getElementsByClassName("recipe-title-container")[0]
        .getElementsByClassName("recipe-title")[0];
    recipeTitle.innerText = decodedRecipeInfo.recipeTitle;

    // populate time and servings info
    const prepTimeAmt = document.getElementsByClassName("prep-time-amount")[0];
    prepTimeAmt.innerText = decodedRecipeInfo.prepTime;

    const totalTimeAmt = document.getElementsByClassName("total-time-amount")[0];
    totalTimeAmt.innerText = decodedRecipeInfo.totalTime;

    const servingsAmt = document.getElementsByClassName("servings-amount")[0];
    servingsAmt.innerText = decodedRecipeInfo.servings;

    // populate brand logo (here, must be at least 1. if no second logo, doesn't appear)
    const brandlogo1 = document.getElementsByClassName("logo-image-container")[0].getElementsByClassName("logo-1")[0];
    const brandlogo2 = document.getElementsByClassName("logo-image-container")[0].getElementsByClassName("logo-2")[0];

    const brandlogo1Small = document
        .getElementsByClassName("logo-image-container-small")[0]
        .getElementsByClassName("logo-1")[0];
    const brandlogo2Small = document
        .getElementsByClassName("logo-image-container-small")[0]
        .getElementsByClassName("logo-2")[0];

    brandlogo1.src = decodedRecipeInfo.brandLogoUrlOne;
    brandlogo1Small.src = decodedRecipeInfo.brandLogoUrlOne;

    if (decodedRecipeInfo.brandLogoUrlTwo) {
        brandlogo2.src = decodedRecipeInfo.brandLogoUrlTwo;
        brandlogo2Small.src = decodedRecipeInfo.brandLogoUrlTwo;
    }
}

// function for generating and appeanding additional ingredients
// parse Ingredient List
/**
 *
 */
function generateIngredients() {
    const decodedIngredientList = JSON.parse(atob(ingredientList));
    // console.log(decodedIngredientList)

    const featuredIngredientParentDiv = document.getElementsByClassName("featured-ingredient-container")[0];
    const regularIngredientParentDiv = document.getElementsByClassName("regular-ingredient-container")[0];

    for (const x in decodedIngredientList) {
        if (Object.prototype.hasOwnProperty.call(decodedIngredientList, x)) {
            const ingredientDict = {};

            // conditional for decodedIngredientList[x].isFeatured
            if (decodedIngredientList[x].isFeatured) {
                // Create a dictionary for each individual ingredient, one at a time
                // Then append to correct containers one at a time (before the next ingredientDict is created)
                ingredientDict.amount = decodedIngredientList[x].amount;
                ingredientDict.ingredient = decodedIngredientList[x].ingredient;
                // console.log (ingredientDict);

                const featuredIngredientContainer = document.createElement("div");
                featuredIngredientContainer.classList.add("indiv-featured-ingredient");

                if (ingredientDict.amount) {
                    const featuredIngredientAmtDiv = document.createElement("div");
                    featuredIngredientAmtDiv.classList.add("ingredients-amount");
                    featuredIngredientAmtDiv.textContent = ingredientDict.amount;
                    featuredIngredientContainer.appendChild(featuredIngredientAmtDiv);
                }

                const featuredIngredientNameDiv = document.createElement("div");
                featuredIngredientNameDiv.classList.add("ingredients-name");
                featuredIngredientNameDiv.textContent = ingredientDict.ingredient;
                featuredIngredientContainer.appendChild(featuredIngredientNameDiv);
                featuredIngredientParentDiv.appendChild(featuredIngredientContainer);
            }

            // If NOT decodedIngredientList[x].isFeatured:
            ingredientDict.amount = decodedIngredientList[x].amount;
            ingredientDict.ingredient = decodedIngredientList[x].ingredient;
            // console.log(ingredientDict);

            const regularIngredientContainer = document.createElement("div");
            regularIngredientContainer.classList.add("indiv-regular-ingredient");

            if (ingredientDict.amount) {
                const regularIngredientAmtDiv = document.createElement("div");
                regularIngredientAmtDiv.classList.add("ingredients-amount");
                regularIngredientAmtDiv.textContent = ingredientDict.amount;
                regularIngredientContainer.appendChild(regularIngredientAmtDiv);
            }

            const regularIngredientNameDiv = document.createElement("div");
            regularIngredientNameDiv.classList.add("ingredients-name");
            regularIngredientNameDiv.textContent = ingredientDict.ingredient;
            regularIngredientContainer.appendChild(regularIngredientNameDiv);
            regularIngredientParentDiv.appendChild(regularIngredientContainer);
        }
    }
}

// function for generating and appeanding instructions/steps
/**
 *
 */
function generateInstructions() {
    const decodedInstructions = JSON.parse(atob(instructionsList));
    // console.log(decodedInstructions)

    const stepParentDiv = document.getElementsByClassName("step-container")[0];

    for (const x in decodedInstructions) {
        if (Object.prototype.hasOwnProperty.call(decodedInstructions, x)) {
            const stepNum = Number(x) + 1;
            const stepTxt = decodedInstructions[x].instructionsText;
            // console.log(stepNum, stepTxt);

            const stepDiv = document.createElement("div");
            stepDiv.textContent = "Step " + stepNum;
            stepDiv.classList.add("step-header");

            const instructionsTextDiv = document.createElement("div");
            instructionsTextDiv.textContent = stepTxt;
            instructionsTextDiv.classList.add("step-details");

            const individualStepContainer = document.createElement("div");
            individualStepContainer.classList.add("individual-step-container");
            stepParentDiv.appendChild(individualStepContainer);
            individualStepContainer.appendChild(stepDiv);
            individualStepContainer.appendChild(instructionsTextDiv);
            // append a div with two divs inside of it:
            // step-header should have text for Step+txt
            // step-details should have value inside of instructionsText which is in decodedInstructions[x].instructionsText
        }
    }

    // console.log(
    //     btoa(JSON.stringify({
    //         recipeTitle: "Stuffed Mushrooms",
    //         prepTime: "15-30 mins",
    //         totalTime: "50 mins",
    //         servings: "16",
    //         recipeImageUrl: "../images/recipe-image.png",
    //         brandLogoUrlOne: "../images/brand-logo1.png",
    //         brandLogoUrlTwo: "../images/brand-logo2.png",
    //         }))
    // )
}

/**
 *
 */
window.onload = function () {
    populateFeaturedProductCard();
    populateRecipeInfo();
    generateInstructions();
    generateIngredients();
};
