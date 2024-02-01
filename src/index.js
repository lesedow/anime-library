import { Anime } from './anime.js';

// Search Form
const searchBar = document.getElementById("search-bar");
const searchForm = document.getElementById("search-form");
const results = document.getElementById("results");
const close = document.getElementById("close");

const newBtn = document.getElementById("new");
const list = document.getElementById("list");

// Edit Form
const editForm = document.getElementById("edit-form");
const category = document.getElementById("category");
const epWatched = document.getElementById("ep-watched");
const animeTitle = document.getElementById("anime-title");
const editPanel = document.querySelector(".edit-panel");
const totalEp = document.getElementById("total-episodes");
const cancel = document.getElementById("cancel");

// Category Buttons
const categories = document.querySelector(".categories");

const baseURL = "https://api.jikan.moe/v4/anime?q=";
let animeList = [];

let currentlyEditedAnime;
let currentlyPressedEditButton;
let currentlySelectedCategory = "all";

function loadFromStorage()
{
    animeList = JSON.parse(localStorage.getItem("animeList"));
    
    if (!animeList)
    {
        animeList = [];
        return;
    }

    animeList.forEach((anime, index) => {
        list.appendChild(generateAnimeElement(anime, index));
    });
}

function generateAnimeElement(anime, index)
{

    const animeElement = document.createElement("div");
    animeElement.classList.add("anime");

    animeElement.insertAdjacentHTML("beforeend", ` 
        <div class="banner-container">
            <img src="${anime.image}" alt="Anime Banner">
            <p class="episodes-watched">Watched: ${anime.episodesWatched}</p>
        </div>
        <p>${anime.title}</p>
        <div class="edit" data-index="${index}">
            <img src="icons/pencil.svg" alt="Edit Icon" class="icon">
        </div>
    `);

    return animeElement;
}

function filterAnime(category)
{   
    const filteredAnime = [];
    animeList.forEach((anime, index) => {
        if (anime.category == category)
        {
            filteredAnime.push(generateAnimeElement(anime, index));
        }
    });

    list.replaceChildren(...filteredAnime);    
}

function displayAllAnime()
{
    const allAnime = [];
    animeList.forEach((anime, index) => {
        allAnime.push(generateAnimeElement(anime, index));
    });

    list.replaceChildren(...allAnime);
}

function handleCategoryButton(event)
{
    let categoryType = event.target.getAttribute("data-category");
    if (!categoryType || categoryType == currentlySelectedCategory) return;

    let lastSelected = categories.querySelector(`[data-category="${currentlySelectedCategory}"]`);
    lastSelected.classList.remove("selected");

    currentlySelectedCategory = categoryType;
    event.target.classList.add("selected");

    categoryType == "all" 
        ? displayAllAnime()
        : filterAnime(categoryType);

}

function toValidNumber(number, maxNumber)
{
    let absoluteValue = Math.abs(parseInt(number));
    return absoluteValue > parseInt(maxNumber)
        ? parseInt(maxNumber)
        : absoluteValue
}

function handleEditSave(event)
{
    event.preventDefault();

    if (!currentlyEditedAnime)
    {
        alert("Edit panel is not linked properly! Use the edit button first.");
        return;
    }

    currentlyEditedAnime.category = category.value;
    currentlyEditedAnime.episodesWatched = toValidNumber(epWatched.value, currentlyEditedAnime.episodes);

    localStorage.setItem("animeList", JSON.stringify(animeList));

    const currentAnimeElement = currentlyPressedEditButton.parentElement.firstElementChild.querySelector("p");
    currentAnimeElement.textContent = `Watched: ${currentlyEditedAnime.episodesWatched}`;

    toggleEditPanel();
}

function showEditPanel(index)
{
    currentlyEditedAnime = animeList[index];
    
    animeTitle.textContent = currentlyEditedAnime.title;
    category.value = currentlyEditedAnime.category;
    totalEp.textContent = `/${currentlyEditedAnime.episodes}`;
    epWatched.value = currentlyEditedAnime.episodesWatched;
}

function handleEditButton(event)
{
    let index = event.target.getAttribute("data-index");
    if (!index) return;

    currentlyPressedEditButton = event.target;

    toggleEditPanel();
    showEditPanel(index);
}

function isReleased(anime)
{
    return anime.duration != "Unknown" ? true : false;
}

function isAlreadyInList(id)
{
    return animeList.find((anime) => anime.id == id);
}

function addToList(data)
{
    if(isAlreadyInList(data.mal_id))
    {
        alert(`${data.title} is already in your list`);
        return;
    }

    const animeObject = new Anime(
        data.title,
        "watching",
        data.images.jpg.image_url,
        data.airing,
        isReleased(data),
        data.mal_id,
        data.episodes
    );

    animeList.push(animeObject);
    localStorage.setItem("animeList", JSON.stringify(animeList));

    list.appendChild(generateAnimeElement(animeObject, animeList.length - 1));
}

function generateResult(anime)
{
    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result");

    const status = isReleased(anime) ? "Airing" : "Not Aired";
     
    resultContainer.insertAdjacentHTML("beforeend", `
        <img src="${anime.images.jpg.image_url}" alt="Anime Banner">
        <p>${anime.title}</p>
        <p>Episodes: ${anime.episodes || status }</p>
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
    addButtons.forEach((btn, index) => {
        btn.addEventListener("click", (e) => {
            addToList(searchData.data[index]);
        })
    })
}

async function getAnime(searchValue)
{
    let response = await fetch(baseURL + searchValue);
    let animeData = await response.json();

    return animeData;
}

function toggleSideBar()
{
    let searchTab = searchForm.parentElement;
    if(searchTab.classList.contains('slide-in'))
    {
        searchTab.classList.remove('slide-in');
        searchTab.classList.add('slide-out')
    } else {
        searchTab.classList.remove('slide-out');
        searchTab.classList.add('slide-in')
    }
}

function toggleEditPanel()
{
    let editTab = editForm.parentElement;
    if(editTab.classList.contains('slide-in'))
    {
        editTab.classList.remove('slide-in');
        editTab.classList.add('slide-out')
    } else {
        editTab.classList.remove('slide-out');
        editTab.classList.add('slide-in');
    }
}

newBtn.addEventListener("click",toggleSideBar);
close.addEventListener("click", toggleSideBar);

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    getAnime(searchBar.value).then((response) => {
        if (response.data.length == 0)
        {
            throw new Error("No results for your search!");
        }
        createSearchResult(response);    
    })
    .catch((error) => {
       alert(error);
    });

});

list.addEventListener("click", handleEditButton);
editForm.addEventListener("submit", handleEditSave);
categories.addEventListener("click", handleCategoryButton);
document.addEventListener("DOMContentLoaded", loadFromStorage);