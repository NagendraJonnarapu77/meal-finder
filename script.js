const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.getElementById("categorySidebar");
const closeBtn = document.querySelector(".close-icon");
const overlay = document.getElementById("sidebarOverlay");
const categoryList = document.getElementById("categoryList");
const categoriesGrid = document.getElementById("categories-grid");
const catSection = document.getElementById("categoriesSection");
const mealsSection = document.getElementById("meals-by-category");
const description = document.getElementById("description");
const mealsGrid = document.getElementById("meals-grid");
const searchForm = document.querySelector(".searchForm");
const searchInput = document.getElementById("searchInput");
const detailsSection = document.getElementById("meal-details");
const detailsContainer = document.getElementById("meal-details-container");
const backButton = document.getElementById("back-button");
const breadcrumb = document.getElementById("breadcrumb");

/* Sidebar open / close helpers (animated hamburger -> X) */
function openSidebar() {
    sidebar.classList.add("show");
    overlay.classList.remove("hidden");
    menuBtn.classList.add("open");
    menuBtn.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
    getCategories(); // lazy-load categories list when opening
}
function closeSidebar() {
    sidebar.classList.remove("show");
    overlay.classList.add("hidden");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
}

/* Toggle events */
menuBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("show")) closeSidebar();
    else openSidebar();
});
closeBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (sidebar.classList.contains("show")) closeSidebar();
    }
});

/* Fetch categories to populate sidebar list */
async function getCategories() {
    categoryList.innerHTML = "";
    try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const data = await res.json();
        if (data.categories && data.categories.length) {
            data.categories.forEach(c => {
                const li = document.createElement("li");
                li.textContent = c.strCategory;
                li.dataset.category = c.strCategory;
                categoryList.appendChild(li);
            });
        } else {
            categoryList.innerHTML = "<li>No categories</li>";
        }
    } catch (err) {
        console.error("Categories error:", err);
        categoryList.innerHTML = "<li>Unable to load categories</li>";
    }
}

/* Initial categories grid on DOM load */
document.addEventListener("DOMContentLoaded", () => {
    showCategories();
});

/* Show categories as cards */
async function showCategories() {
    categoriesGrid.innerHTML = "";
    try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const data = await res.json();
        if (data.categories && data.categories.length) {
            data.categories.forEach(c => {
                const card = document.createElement("div");
                card.className = "category-card";
                card.dataset.category = c.strCategory;
                card.innerHTML = `
                    <img src="${c.strCategoryThumb}" alt="${c.strCategory}">
                    <div class="category-title">${c.strCategory}</div>
                `;
                categoriesGrid.appendChild(card);
            });
        } else {
            categoriesGrid.innerHTML = "<p>No categories found.</p>";
        }
    } catch (err) {
        console.error("Show categories error:", err);
        categoriesGrid.innerHTML = "<p>Error loading categories.</p>";
    }
}

/* Fetch and display meals by category */
async function getMealsByCategory(category) {
    mealsGrid.innerHTML = "";
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
        const declare = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const dataDescription = await declare.json();
        description.innerHTML = "";
        const categoryData = dataDescription.categories.find(cat => cat.strCategory === category);
        if (categoryData && categoryData.strCategoryDescription) {
            description.innerHTML = `<p>${categoryData.strCategoryDescription}</p>`;
        }
        
        const data = await res.json();
        if (data.meals && data.meals.length) {
            data.meals.forEach(m => {
                const card = document.createElement("div");
                card.className = "meal-card";
                card.dataset.id = m.idMeal;
                card.innerHTML = `
                    <img src="${m.strMealThumb}" alt="${m.strMeal}">
                    <div class="meal-title">${m.strMeal}</div>
                `;
                card.addEventListener("click", () => {
                    showMealDetails(m.idMeal);
                });
                mealsGrid.appendChild(card);
            });
            // show breadcrumb and meals section
            breadcrumb.innerHTML = `<a href="#" class="bc-home">Home</a><span>›</span>${category}`;
            breadcrumb.classList.remove("hidden");
            breadcrumb.setAttribute("aria-hidden", "false");
            catSection.classList.add("hidden");
            mealsSection.classList.remove("hidden");
            detailsSection.classList.add("hidden");
            closeSidebar();
        } else {
            mealsGrid.innerHTML = "<h2>No meals found for this category.</h2>";
        }
    } catch (err) {
        console.error("getMealsByCategory error:", err);
        mealsGrid.innerHTML = "<h2>Error loading meals.</h2>";
    }
}

/* Click category card in grid */
categoriesGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".category-card");
    if (!card) return;
    const category = card.dataset.category;
    getMealsByCategory(category);
});

/* Click category in sidebar list */
categoryList.addEventListener("click", (e) => {
    if (e.target && e.target.tagName === "LI") {
        const category = e.target.dataset.category;
        getMealsByCategory(category);
    }
});

/* Search by name */
async function getMealsBySearch(name) {
    mealsGrid.innerHTML = "";
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.meals && data.meals.length) {
            data.meals.forEach(m => {
                const card = document.createElement("div");
                card.className = "meal-card";
                card.dataset.id = m.idMeal;
                card.innerHTML = `
                    <img src="${m.strMealThumb}" alt="${m.strMeal}">
                    <div class="meal-title">${m.strMeal}</div>
                `;
                mealsGrid.appendChild(card);
            });
            breadcrumb.innerHTML = `<a href="#" class="bc-home">Home</a><span>›</span>Search: ${name}`;
            breadcrumb.classList.remove("hidden");
            breadcrumb.setAttribute("aria-hidden", "false");
            catSection.classList.add("hidden");
            mealsSection.classList.remove("hidden");
            detailsSection.classList.add("hidden");
        } else {
            mealsGrid.innerHTML = "<h2>No meals found for this search.</h2>";
            breadcrumb.classList.remove("hidden");
            breadcrumb.innerHTML = `<a href="#" class="bc-home">Home</a><span>›</span>Search: ${name}`;
        }
    } catch (err) {
        console.error("getMealsBySearch error:", err);
        mealsGrid.innerHTML = "<h2>Error searching meals.</h2>";
    }
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = searchInput.value.trim();
    if (!term) return;
    getMealsBySearch(term);
});

/* Click meal card to show details */
mealsGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".meal-card");
    if (!card) return;
    const id = card.dataset.id;
    showMealDetails(id);
});

/* Back button logic: if meals exist show meals, else show categories */
backButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (mealsGrid.children.length) {
        detailsSection.classList.add("hidden");
        mealsSection.classList.remove("hidden");
        breadcrumb.classList.remove("hidden");
    } else {
        detailsSection.classList.add("hidden");
        mealsSection.classList.add("hidden");
        catSection.classList.remove("hidden");
        breadcrumb.classList.add("hidden");
    }
});

/* Breadcrumb home click to go back to categories */
breadcrumb.addEventListener("click", (e) => {
    if (e.target.classList.contains("bc-home")) {
        e.preventDefault();
        breadcrumb.classList.add("hidden");
        catSection.classList.remove("hidden");
        mealsSection.classList.add("hidden");
        detailsSection.classList.add("hidden");
    }
});

/* Render meal details */
async function showMealDetails(id) {
    detailsContainer.innerHTML = "";
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`);
        const data = await res.json();
        const meal = data.meals && data.meals[0];
        if (!meal) {
            detailsContainer.innerHTML = "<p>Meal details not found.</p>";
            return;
        }

        // gather ingredients and measures
        const ingredients = [];
        const measures = [];
        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredients.push(ing.trim());
                measures.push(measure ? measure.trim() : "");
            }
        }

        const tags = meal.strTags ? meal.strTags.split(",").map(t => t.trim()).filter(Boolean) : [];
        const instructions = meal.strInstructions
            ? meal.strInstructions.split(". ").map(s => s.trim()).filter(Boolean)
            : [];

        // Build HTML
        const topHtml = `
          <div class="meal-top">
            <div class="meal-details-image">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </div>
    
            <div class="meal-details-info">
              <h2>${meal.strMeal}</h2>
              <p class="category-text">Category: ${meal.strCategory || "—"}</p>
              ${meal.strSource ? `<p><a class="source-link" href="${meal.strSource}" target="_blank" rel="noopener noreferrer">Source</a></p>` : ""}
              <div class="meal-details-tags">${tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    
              <div class="ingredients-box" aria-label="Ingredients">
                <h3>Ingredients</h3>
                <ul class="details-list">
                  ${ingredients.map((ing, idx) => `<li>${idx + 1}. ${ing}</li>`).join("")}
                </ul>
              </div>
            </div>
          </div>
        `;

        const bottomHtml = `
          <div class="meal-bottom">
            <div class="measures-box" aria-label="Measures">
              <h3>Measures</h3>
              <ul class="details-list">
                ${measures.map(m => `<li>${m || "-"}</li>`).join("")}
              </ul>
            </div>
    
            <div class="details-instructions" aria-label="Instructions">
              <h3>Instructions</h3>
              <ul class="instructions-list">
                ${instructions.map(ins => `<li><i class="fas fa-check"></i><div>${ins.endsWith('.') ? ins : ins + '.'}</div></li>`).join("")}
              </ul>
            </div>
          </div>
        `;

        detailsContainer.innerHTML = topHtml + bottomHtml;

        // Show details and breadcrumb
        breadcrumb.innerHTML = `<a href="#" class="bc-home">Home</a><span>›</span>${meal.strMeal}`;
        breadcrumb.classList.remove("hidden");
        breadcrumb.setAttribute("aria-hidden", "false");
        detailsSection.classList.remove("hidden");
        mealsSection.classList.add("hidden");
        catSection.classList.add("hidden");

        // scroll to details for visibility
        detailsContainer.scrollIntoView({ behavior: "smooth" });

        // close sidebar if open
        if (sidebar.classList.contains("show")) closeSidebar();

    } catch (err) {
        console.error("showMealDetails error:", err);
        detailsContainer.innerHTML = "<p>Error loading meal details.</p>";
    }
}
