// ==========================================
// Currents API News App
// ==========================================

// Your Currents API key (loaded from .env by Parcel)
const apiKey = process.env.NEWS_API_KEY;

// Number of articles displayed per page
const pageSize = 9;

// Current page number
let currentPage = 1;

// Current search text
let currentSearch = "";

// Current category
let currentCategory = "";

// ==========================================
// HTML Elements
// ==========================================

const newsContainer = document.querySelector("#news");
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const categorySelect = document.querySelector("#category");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");

// ==========================================
// Fetch News
// ==========================================

async function fetchNews() {

    let url = "";

    // ------------------------------
    // Search Endpoint
    // ------------------------------
    if (currentSearch.trim() !== "") {

        url =
            `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(currentSearch)}&language=en&page_number=${currentPage}&page_size=${pageSize}`;

        if (currentCategory !== "") {
            url += `&category=${encodeURIComponent(currentCategory)}`;
        }

    }

    // ------------------------------
    // Latest News Endpoint
    // ------------------------------
    else {

        url =
            `https://api.currentsapi.services/v1/latest-news?language=en&page_number=${currentPage}&page_size=${pageSize}`;

        if (currentCategory !== "") {
            url += `&category=${encodeURIComponent(currentCategory)}`;
        }

    }

    // Loading spinner
    newsContainer.innerHTML = `
        <div class="text-center py-5">

            <div class="spinner-border text-info"></div>

            <p class="mt-3">
                Loading latest news...
            </p>

        </div>
    `;

    try {

        const response = await fetch(url, {

            headers: {

                Authorization: `Bearer ${apiKey}`

            }

        });

        if (!response.ok) {

            throw new Error(`HTTP Error ${response.status}`);

        }

        const data = await response.json();

        if (data.status !== "ok") {

            throw new Error(data.message || "Unable to load news.");

        }

        displayNews(data.news);

        prevBtn.disabled = currentPage === 1;

        nextBtn.disabled = data.news.length < pageSize;

    }

    catch (error) {

        newsContainer.innerHTML = `
            <div class="alert alert-danger">

                <h5>Error Loading News</h5>

                <p>${error.message}</p>

            </div>
        `;

        console.error(error);

    }

}

// ==========================================
// Display Articles
// ==========================================

function displayNews(articles) {

    newsContainer.innerHTML = "";

    if (!articles || articles.length === 0) {

        newsContainer.innerHTML = `
            <div class="alert alert-warning text-center">

                No articles found.

            </div>
        `;

        return;

    }

    // Continue in Part 2...
        // Loop through each article
    for (const article of articles) {

        // Create Bootstrap column
        const column = document.createElement("div");
        column.className = "col-md-6 col-lg-4";

        // Create Bootstrap card
        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm";

        // ------------------------------
        // Article Image
        // ------------------------------

        if (article.image) {

            const image = document.createElement("img");

            image.src = article.image;
            image.alt = article.title;
            image.className = "card-img-top";

            // Hide image if it fails to load
            image.onerror = () => image.remove();

            card.appendChild(image);

        }

        // ------------------------------
        // Card Body
        // ------------------------------

        const body = document.createElement("div");
        body.className = "card-body d-flex flex-column";

        // Title
        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = article.title;

        // Description
        const description = document.createElement("p");
        description.className = "card-text";

        description.textContent =
            article.description || "No description available.";

        // Author
        if (article.author) {

            const author = document.createElement("small");

            author.className = "text-muted";

            author.textContent = `By ${article.author}`;

            body.appendChild(author);

        }

        // Published Date
        if (article.published) {

            const published = document.createElement("small");

            published.className = "text-muted mb-2 d-block";

            const date = new Date(article.published);

            published.textContent = date.toLocaleString();

            body.appendChild(published);

        }

        // Read More Button
        const button = document.createElement("a");

        button.href = article.url;

        button.target = "_blank";

        button.rel = "noopener noreferrer";

        button.className = "btn btn-info text-white mt-auto";

        button.textContent = "Read More";

        // Add everything to card body
        body.appendChild(title);

        body.appendChild(description);

        body.appendChild(button);

        // Add body to card
        card.appendChild(body);

        // Add card to column
        column.appendChild(card);

        // Display on page
        newsContainer.appendChild(column);

    }

}

// ==========================================
// Search Button
// ==========================================

searchBtn.addEventListener("click", () => {

    currentSearch = searchInput.value.trim();

    currentPage = 1;

    fetchNews();

});

// ==========================================
// Continue in Part 3...
// ==========================================
// Search Using Enter Key
// ==========================================

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

categorySelect.addEventListener("change", () => {

    currentCategory = categorySelect.value;

    currentSearch = "";

    searchInput.value = "";

    currentPage = 1;

    fetchNews();

});

// ==========================================
// Next Page
// ==========================================

nextBtn.addEventListener("click", () => {

    currentPage++;

    fetchNews();

});

// ==========================================
// Previous Page
// ==========================================

prevBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        fetchNews();

    }

});

// ==========================================
// Initial Load
// ==========================================

fetchNews();