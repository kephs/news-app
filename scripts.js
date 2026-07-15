
// const apiKey = process.env.NEWS_API_KEY;
// const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`

// async function fetchNews() {
//     try {
//         const response = await fetch(url);

//         if (!response.ok) {
//             throw new Error(`HTTP Error: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data.status !== "ok") {
//             throw new Error(data.message);
//         }

//         displayNews(data.articles);

//     } catch (error) {
//         console.error("Error fetching news:", error);
//     }
// }

// fetchNews();


// // // Display the news articles on the webpage
// // function displayNews(articles) {
// //     // Select the container where the news articles will be displayed
// //     const newsDiv = document.querySelector("#news");

// //     // Loop through each article in the articles array
// //     for (const article of articles) {

// //         // Create a new div to hold the current article
// //         const articleDiv = document.createElement("div");

// //         // Create an h4 element for the article title
// //         const title = document.createElement("h4");

// //         // Set the text of the heading to the article's title
// //         title.textContent = article.title;

// //         // Add the title to the article div
// //         articleDiv.appendChild(title);

// //         // Create a paragraph element for the article description
// //         const description = document.createElement("p");

// //         // Set the paragraph text to the article's description
// //         description.textContent = article.description;

// //         // Add the description to the article div
// //         articleDiv.appendChild(description);

// //         // Add the completed article div to the news container
// //         newsDiv.appendChild(articleDiv);
// //     }
// // }

// // Display the news articles on the webpage
// function displayNews(articles) {

//     // Select the news container
//     const newsDiv = document.querySelector("#news");

//     // Loop through each article
//     for (const article of articles) {

//         // Create a Bootstrap column
//         const column = document.createElement("div");
//         column.className = "col-md-6 col-lg-4";

//         // Create the card
//         const card = document.createElement("div");
//         card.className = "card h-100 shadow";

//         // Add the article image if available
//         if (article.urlToImage) {
//             const image = document.createElement("img");
//             image.src = article.urlToImage;
//             image.className = "card-img-top";
//             image.alt = article.title;

//             card.appendChild(image);
//         }

//         // Create the card body
//         const cardBody = document.createElement("div");
//         cardBody.className = "card-body";

//         // Create the title
//         const title = document.createElement("h5");
//         title.className = "card-title";
//         title.textContent = article.title;

//         // Create the description
//         const description = document.createElement("p");
//         description.className = "card-text";
//         description.textContent =
//             article.description || "No description available.";

//         // Create the Read More button
//         const button = document.createElement("a");
//         button.href = article.url;
//         button.target = "_blank";
//         button.className = "btn btn-primary";
//         button.textContent = "Read More";

//         // Add everything to the card body
//         cardBody.appendChild(title);
//         cardBody.appendChild(description);
//         cardBody.appendChild(button);

//         // Add card body to card
//         card.appendChild(cardBody);

//         // Add card to column
//         column.appendChild(card);

//         // Add column to page
//         newsDiv.appendChild(column);
//     }
// }


// ==========================================
// NewsHub JavaScript
// ==========================================

// Your NewsAPI key
const apiKey = process.env.NEWS_API_KEY;
// const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`

// Number of articles to display per page
const pageSize = 9;

// Track the current page number
let currentPage = 1;

// Store the current search term
let currentSearch = "";

// Store the currently selected category
let currentCategory = "";

// ==========================================
// Get references to HTML elements
// ==========================================

// Container where the news articles will be displayed
const newsContainer = document.querySelector("#news");

// Search text box
const searchInput = document.querySelector("#searchInput");

// Search button
const searchBtn = document.querySelector("#searchBtn");

// Category dropdown
const categorySelect = document.querySelector("#category");

// Previous page button
const prevBtn = document.querySelector("#prevBtn");

// Next page button
const nextBtn = document.querySelector("#nextBtn");

// ==========================================
// Fetch news articles from NewsAPI
// ==========================================

async function fetchNews() {

    let url = "";

    // If the user entered a search term,
    // use the "everything" endpoint
    if (currentSearch.trim() !== "") {

        url =
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(currentSearch)}&page=${currentPage}&pageSize=${pageSize}&sortBy=publishedAt&language=en&apiKey=${apiKey}`;

    }

    // Otherwise, display top headlines
    // using the selected category
    else {

        url =
            `https://newsapi.org/v2/top-headlines?country=us&category=${currentCategory}&page=${currentPage}&pageSize=${pageSize}&apiKey=${apiKey}`;

    }

    // Display a loading spinner while waiting
    // for the API response
    newsContainer.innerHTML = `
        <div class="text-center py-5">

            <div class="spinner-border text-info"></div>

            <p class="mt-3">
                Loading latest news...
            </p>

        </div>
    `;

    try {

        // Send the request to NewsAPI
        const response = await fetch(url);

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        // Convert the JSON response into a JavaScript object
        const data = await response.json();

        // Check if the API returned an error
        if (data.status !== "ok") {
            throw new Error(data.message);
        }

        // Display the articles on the page
        displayNews(data.articles);

        // Disable Previous button when on page 1
        prevBtn.disabled = currentPage === 1;

        // Disable Next button if fewer than pageSize
        // articles were returned
        nextBtn.disabled = data.articles.length < pageSize;

    }

    catch (error) {

        // Display an error message to the user
        newsContainer.innerHTML = `
            <div class="alert alert-danger">

                <h5>Error Loading News</h5>

                <p>${error.message}</p>

            </div>
        `;

        // Print the error in the browser console
        console.error(error);

    }

}

// ==========================================
// Display the news articles
// ==========================================

function displayNews(articles) {

    // Remove any previously displayed articles
    newsContainer.innerHTML = "";

    // Display a message if no articles were found
    if (articles.length === 0) {

        newsContainer.innerHTML = `
            <div class="alert alert-warning text-center">
                No articles found.
            </div>
        `;

        return;

    }

    // Loop through each article
    for (const article of articles) {

        // Create a Bootstrap column
        const column = document.createElement("div");
        column.className = "col-md-6 col-lg-4";

        // Create a Bootstrap card
        const card = document.createElement("div");
        card.className = "card h-100";

        // If the article contains an image,
        // create and add the image
        if (article.urlToImage) {

            const image = document.createElement("img");
            image.src = article.urlToImage;
            image.alt = article.title;
            image.className = "card-img-top";

            card.appendChild(image);

        }

        // Create the card body
        const body = document.createElement("div");
        body.className = "card-body d-flex flex-column";

        // Create the article title
        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = article.title;

        // Create the article description
        const description = document.createElement("p");
        description.className = "card-text";

        description.textContent =
            article.description || "No description available.";

        // Create the Read More button
        const button = document.createElement("a");
        button.href = article.url;
        button.target = "_blank";
        button.className = "btn btn-info mt-auto text-white";
        button.textContent = "Read More";

        // Add all elements to the card body
        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(button);

        // Add the body to the card
        card.appendChild(body);

        // Add the card to the column
        column.appendChild(card);

        // Add the completed column to the page
        newsContainer.appendChild(column);

    }

}

// ==========================================
// Search Button Event
// ==========================================

// Search when the Search button is clicked
searchBtn.addEventListener("click", () => {

    // Save the search text
    currentSearch = searchInput.value.trim();

    // Return to the first page
    currentPage = 1;

    // Load matching articles
    fetchNews();

});

// ==========================================
// Search Using Enter Key
// ==========================================

// Allow the user to press Enter
// instead of clicking Search
searchInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {

        currentSearch = searchInput.value.trim();

        currentPage = 1;

        fetchNews();

    }

});

// ==========================================
// Category Filter
// ==========================================

// Load articles when a category is selected
categorySelect.addEventListener("change", () => {

    // Save the selected category
    currentCategory = categorySelect.value;

    // Clear any previous search
    currentSearch = "";
    searchInput.value = "";

    // Start on page 1
    currentPage = 1;

    // Load the selected category
    fetchNews();

});

// ==========================================
// Pagination
// ==========================================

// Load the next page of articles
nextBtn.addEventListener("click", () => {

    currentPage++;

    fetchNews();

});

// Load the previous page
prevBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        fetchNews();

    }

});

// ==========================================
// Load the first page when the app starts
// ==========================================

// Display the latest headlines immediately
fetchNews();