// ============================================================
// Kyle's NewsHub
// Currents API Version
//
// Author: Kyle Josephs
//
// This application displays the latest news from the
// Currents API. Users can:
//
// • View the latest news
// • Search for articles
// • Filter by category
// • Load additional articles
// • View article details
//
// Environment:
// Parcel
// .env file:
// NEWS_API_KEY=API_KEY
// ============================================================


// ============================================================
// Configuration
// ============================================================
// Part 1 — Configuration, state, helper functions, DOM references
// Part 2 — API functions (fetchLatestNews, searchNews, URL builders)
// Part 3 — Rendering (createArticleCard, renderArticles, UI helpers)
// Part 4 — Event listeners, "Load More", initialization, Back-to-Top
// ============================================================


// API Key loaded from the Parcel .env file
const API_KEY = process.env.NEWS_API_KEY;

// Base URL for Currents API
const BASE_URL = "https://api.currentsapi.services/v1";

// Number of articles to request at a time
const PAGE_SIZE = 9;


// ============================================================
// Application State
// ============================================================

// Current page returned by the API
let currentPage = 1;

// Current search text
let currentSearch = "";

// Current selected category
let currentCategory = "";

// Determines whether the user is searching
let searchMode = false;

// Stores all articles currently displayed
let articles = [];


// ============================================================
// DOM Elements
// ============================================================

const newsContainer =
    document.querySelector("#news");

const loadingSpinner =
    document.querySelector("#loading");

const errorMessage =
    document.querySelector("#errorMessage");

const resultsCount =
    document.querySelector("#resultsCount");

const searchInput =
    document.querySelector("#searchInput");

const searchBtn =
    document.querySelector("#searchBtn");

const categorySelect =
    document.querySelector("#category");

const loadMoreBtn =
    document.querySelector("#loadMoreBtn");

const refreshBtn =
    document.querySelector("#refreshBtn");

const topBtn =
    document.querySelector("#topBtn");


// ============================================================
// Helper Functions
// ============================================================

/**
 * Show the loading spinner.
 */
function showSpinner() {

    loadingSpinner.classList.remove("d-none");

}

/**
 * Hide the loading spinner.
 */
function hideSpinner() {

    loadingSpinner.classList.add("d-none");

}

/**
 * Remove any error currently displayed.
 */
function clearError() {

    errorMessage.innerHTML = "";

}

/**
 * Display an error message.
 *
 * @param {string} message
 */
function showError(message) {

    errorMessage.innerHTML = `

        <div class="alert alert-danger">

            <h5>

                Unable to Load News

            </h5>

            <p>

                ${message}

            </p>

        </div>

    `;

}

/**
 * Update the badge that shows the number
 * of displayed articles.
 */
function updateResultsCount() {

    resultsCount.textContent =
        `${articles.length} Articles`;

}

/**
 * Remove every displayed article.
 */
function clearArticles() {

    newsContainer.innerHTML = "";

}

/**
 * Format an ISO date into a readable string.
 *
 * Example:
 * July 15, 2026, 4:45 PM
 *
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {

    if (!dateString) {

        return "";

    }

    const date =
        new Date(dateString);

    return date.toLocaleString(undefined, {

        dateStyle: "long",

        timeStyle: "short"

    });

}

/**
 * Scroll smoothly to the top of the page.
 */
function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/**
 * Show or hide the Back-to-Top button.
 */
function updateTopButton() {

    if (window.scrollY > 500) {

        topBtn.style.display = "block";

    }

    else {

        topBtn.style.display = "none";

    }

}


// ============================================================
// URL Builders
// ============================================================

/**
 * Builds the URL used to retrieve
 * the latest news.
 *
 * @returns {string}
 */
function buildLatestUrl() {

    let url =
        `${BASE_URL}/latest-news?language=en`;

    if (currentCategory !== "") {

        url +=
            `&category=${encodeURIComponent(currentCategory)}`;

    }

    return url;

}

/**
 * Builds the URL used when
 * performing a search.
 *
 * @returns {string}
 */
function buildSearchUrl() {

    let url =

        `${BASE_URL}/search?keywords=${encodeURIComponent(currentSearch)}` +
        `&language=en` +
        `&page_number=${currentPage}` +
        `&page_size=${PAGE_SIZE}`;

    if (currentCategory !== "") {

        url +=
            `&category=${encodeURIComponent(currentCategory)}`;

    }

    return url;

}


// ============================================================
// Part 2
// ============================================================
// API Helper

// fetchNews()
// fetchLatestNews()
// searchNews()
// Robust API error handling
// HTTP status handling
// Authorization header
// "Load More" support
// Automatic disabling of the Load More button when there are no more search results
// ============================================================

/**
 * Sends a request to the Currents API.
 *
 * @param {string} url
 * @returns {Promise<Array>}
 */
async function fetchFromApi(url) {

    clearError();

    showSpinner();

    try {

        const response = await fetch(url, {

            headers: {

                Authorization: `Bearer ${API_KEY}`

            }

        });

        if (!response.ok) {

            throw new Error(

                `Server returned ${response.status}.`

            );

        }

        const data = await response.json();

        if (data.status !== "ok") {

            throw new Error(

                data.message || "Unexpected API error."

            );

        }

        return data.news || [];

    }

    catch (error) {

        console.error(error);

        showError(error.message);

        return [];

    }

    finally {

        hideSpinner();

    }

}


// ============================================================
// Latest News
// ============================================================

/**
 * Retrieves the latest news.
 *
 * Since the latest-news endpoint does not
 * support pagination, we simply replace
 * the articles each time it is called.
 */
async function fetchLatestNews() {

    searchMode = false;

    currentPage = 1;

    const url =
        buildLatestUrl();

    articles =
        await fetchFromApi(url);

    renderArticles();

    updateResultsCount();

    loadMoreBtn.classList.add("d-none");

}


// ============================================================
// Search News
// ============================================================

/**
 * Performs a keyword search.
 *
 * Uses page_number and page_size
 * supported by the Currents API.
 *
 * @param {boolean} append
 */
async function searchNews(

    append = false

) {

    searchMode = true;

    const url =
        buildSearchUrl();

    const results =
        await fetchFromApi(url);

    if (append) {

        articles.push(...results);

    }

    else {

        articles = results;

    }

    renderArticles();

    updateResultsCount();

    if (

        results.length < PAGE_SIZE

    ) {

        loadMoreBtn.disabled = true;

        loadMoreBtn.textContent =
            "No More Articles";

    }

    else {

        loadMoreBtn.disabled = false;

        loadMoreBtn.textContent =
            "Load More Articles";

    }

}


// ============================================================
// Load More
// ============================================================

/**
 * Loads additional search results.
 *
 * The Currents latest-news endpoint
 * doesn't truly paginate, so this
 * feature is available only while
 * searching.
 */
async function loadMoreArticles() {

    if (!searchMode) {

        return;

    }

    currentPage++;

    await searchNews(true);

}


// ============================================================
// Refresh Current View
// ============================================================

/**
 * Refreshes whatever the user
 * is currently viewing.
 */
async function refreshNews() {

    if (searchMode) {

        currentPage = 1;

        await searchNews(false);

    }

    else {

        await fetchLatestNews();

    }

}


// ============================================================
// Initialize Application
// ============================================================

/**
 * Loads the application's initial
 * state.
 */
async function initializeApp() {

    currentPage = 1;

    currentSearch = "";

    currentCategory = "";

    searchMode = false;

    articles = [];

    await fetchLatestNews();

}


// ============================================================
// Part 3
// ============================================================

// UI Rendering
// createArticleCard()
// renderArticles()
// Placeholder image support
// Author badges
// Category badges
// Published date
// Responsive Bootstrap cards
// Graceful handling of missing images and data
// ============================================================

/**
 * Creates a Bootstrap badge.
 *
 * @param {string} text
 * @param {string} className
 * @returns {HTMLElement}
 */
function createBadge(text, className = "bg-info") {

    const badge = document.createElement("span");

    badge.className = `badge ${className} me-2 mb-2`;

    badge.textContent = text;

    return badge;

}

/**
 * Creates one Bootstrap card for an article.
 *
 * @param {Object} article
 * @returns {HTMLElement}
 */
function createArticleCard(article) {

    const column =
        document.createElement("div");

    column.className =
        "col-md-6 col-lg-4";

    const card =
        document.createElement("div");

    card.className =
        "card h-100";

    // =====================================
    // Image
    // =====================================

    const image =
        document.createElement("img");

    image.className =
        "card-img-top";

    image.loading = "lazy";

    image.src =
        article.image ||
        "https://placehold.co/600x400?text=No+Image";

    image.alt =
        article.title || "News Image";

    image.onerror = () => {

        image.src =
            "https://placehold.co/600x400?text=No+Image";

    };

    card.appendChild(image);

    // =====================================
    // Card Body
    // =====================================

    const body =
        document.createElement("div");

    body.className =
        "card-body d-flex flex-column";

    // =====================================
    // Category Badge
    // =====================================

    if (

        article.category &&
        article.category.length > 0

    ) {

        body.appendChild(

            createBadge(

                article.category[0],

                "bg-primary"

            )

        );

    }

    // =====================================
    // Title
    // =====================================

    const title =
        document.createElement("h5");

    title.className =
        "card-title mt-2";

    title.textContent =
        article.title ||
        "Untitled Article";

    body.appendChild(title);

    // =====================================
    // Description
    // =====================================

    const description =
        document.createElement("p");

    description.className =
        "card-text";

    description.textContent =

        article.description ||

        "No description available.";

    body.appendChild(description);

    // =====================================
    // Source & Author
    // =====================================

    const meta =
        document.createElement("div");

    meta.className =
        "mb-3";

    if (article.author) {

        meta.appendChild(

            createBadge(

                article.author,

                "bg-secondary"

            )

        );

    }

    if (article.author === null &&
        article.source) {

        meta.appendChild(

            createBadge(

                article.source,

                "bg-secondary"

            )

        );

    }

    body.appendChild(meta);

    // =====================================
    // Publish Date
    // =====================================

    if (article.published) {

        const date =
            document.createElement("small");

        date.className =
            "text-muted mb-3";

        date.textContent =
            formatDate(

                article.published

            );

        body.appendChild(date);

    }

    // =====================================
    // Read More Button
    // =====================================

    const button =
        document.createElement("a");

    button.href =
        article.url;

    button.target =
        "_blank";

    button.rel =
        "noopener noreferrer";

    button.className =
        "btn btn-info text-white mt-auto";

    button.innerHTML =
        "Read Article";

    body.appendChild(button);

    card.appendChild(body);

    column.appendChild(card);

    return column;

}


// ============================================================
// Render Articles
// ============================================================

/**
 * Displays every article currently
 * stored in the articles array.
 */
function renderArticles() {

    clearArticles();

    if (

        articles.length === 0

    ) {

        newsContainer.innerHTML = `

            <div class="col-12">

                <div class="alert alert-warning text-center">

                    <h4>

                        No Articles Found

                    </h4>

                    <p>

                        Try another keyword
                        or category.

                    </p>

                </div>

            </div>

        `;

        return;

    }

    for (

        const article

        of articles

    ) {

        newsContainer.appendChild(

            createArticleCard(article)

        );

    }

}

// ============================================================
// Part 4 - Event Listeners

// Search button
// Press Enter to search
// Category filter
// Refresh button
// Load More button
// Back-to-Top button
// Window scroll events
// App initialization
// Final polish and best practices
// ============================================================

/**
 * Search button click
 */
searchBtn.addEventListener("click", async () => {

    currentSearch =
        searchInput.value.trim();

    currentPage = 1;

    if (currentSearch === "") {

        await fetchLatestNews();

        return;

    }

    await searchNews();

});


/**
 * Press Enter to search
 */
searchInput.addEventListener("keydown", async (event) => {

    if (event.key !== "Enter") {

        return;

    }

    currentSearch =
        searchInput.value.trim();

    currentPage = 1;

    if (currentSearch === "") {

        await fetchLatestNews();

        return;

    }

    await searchNews();

});


/**
 * Category selection
 */
categorySelect.addEventListener("change", async () => {

    currentCategory =
        categorySelect.value;

    currentPage = 1;

    if (currentSearch === "") {

        await fetchLatestNews();

    }

    else {

        await searchNews();

    }

});


/**
 * Refresh button
 */
refreshBtn.addEventListener("click", async () => {

    await refreshNews();

});


/**
 * Load More button
 */
loadMoreBtn.addEventListener("click", async () => {

    await loadMoreArticles();

});


/**
 * Back-to-top button
 */
topBtn.addEventListener("click", () => {

    scrollToTop();

});


/**
 * Window scrolling
 */
window.addEventListener("scroll", () => {

    updateTopButton();

});


// ============================================================
// Initialize
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    if (!API_KEY) {

        showError(
            "NEWS_API_KEY was not found. Check your .env file and restart Parcel."
        );

        loadMoreBtn.classList.add("d-none");

        return;

    }

    await initializeApp();

});


// ============================================================
// Debug (development only)
// ============================================================

// Uncomment the line below while developing to verify
// that Parcel is loading your environment variable.
//
// console.log("Currents API Key:", API_KEY);