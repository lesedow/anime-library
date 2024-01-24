const searchBar = document.getElementById("search-bar");
const searchForm = document.getElementById("search-form");
const results = document.getElementById("results");

const baseURL = "https://api.jikan.moe/v4/anime?q=";

function generateResult(anime)
{
    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result");

    resultContainer.insertAdjacentHTML("beforeend", `
        <img src="${anime.images.jpg.image_url}" alt="Anime Banner">
        <p>${anime.title}</p>
        <p>Episodes: ${anime.episodes || "Airing"}</p>
        <div class="add">
            <p>Add to list</p>
        </div>
    `); 
    
    return resultContainer;
}


function createSearchResult(searchData)
{
    let animeResults = [];
    searchData.data.forEach((anime) => {
        animeResults.push(generateResult(anime));
    });

    results.replaceChildren(...animeResults);

    let addButtons = document.querySelectorAll(".add");
    addButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            alert("clicked")
        })
    })
}

async function getAnime(searchValue)
{
    let response = await fetch(baseURL + searchValue + "&sfw");
    let animeData = await response.json();

    return animeData;
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    getAnime(searchBar.value).then((response) => {
        console.log(response)
        createSearchResult(response);    
    });

});
