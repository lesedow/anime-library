import { Anime } from './anime.js';

// Search Form
const searchBar = document.getElementById("search-bar");
const searchForm = document.getElementById("search-form");
const results = document.getElementById("results");
const searchTab = searchForm.parentElement;
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
const remove = document.getElementById("remove");

// Category Buttons
const categories = document.querySelector(".categories");

const baseURL = "https://api.jikan.moe/v4/anime?q=";
let searchData;
let animeList = [];

let currentlyEditedAnime;
let currentlyPressedEditButton;
let currentlySelectedCategory = "all";

let editPanelOpened = false;

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

    editPanelOpened = false;
    toggleClass(editPanel, 'slide-in-y', 'slide-out-y');
}

function regenerateDisplayedList()
{
    currentlySelectedCategory == "all" 
        ? displayAllAnime()
        : filterAnime(currentlySelectedCategory);
}

function handleEditRemove()
{
    const index = currentlyPressedEditButton.getAttribute('data-index');
    animeList.splice(index, 1);

    localStorage.setItem("animeList", JSON.stringify(animeList));

    const currentAnimeElement = currentlyPressedEditButton.parentElement;
    list.removeChild(currentAnimeElement);

    regenerateDisplayedList();

    editPanelOpened = false;
    toggleClass(editPanel, 'slide-in-y', 'slide-out-y');
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

    if (!editPanelOpened)
    {
        toggleClass(editPanel, 'slide-in-y', 'slide-out-y');
        editPanelOpened = true;  
    }

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

function generateResult(anime, index)
{
    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result");

    const status = isReleased(anime) ? "Airing" : "Not Aired";
     
    resultContainer.insertAdjacentHTML("beforeend", `
        <img src="${anime.images.jpg.image_url}" alt="Anime Banner">
        <p>${anime.title}</p>
        <p>Episodes: ${anime.episodes || status }</p>
        <div class="add" data-index="${index}">
            Add to list
        </div>
    `); 
    
    return resultContainer;
}


function createSearchResult()
{
    let animeResults = [];
    searchData.data.forEach((anime, index) => {
        animeResults.push(generateResult(anime, index));
    });

    results.replaceChildren(...animeResults);
}

async function getAnime(searchValue)
{
    let response = await fetch(baseURL + searchValue);
    let animeData = await response.json();

    return animeData;
}

function toggleClass(element, firstClass, secondClass)
{
    const firstClassEnabled = element.classList.toggle(firstClass);
    if (!firstClassEnabled)
    {
        element.classList.add(secondClass);
        return;
    }

    element.classList.remove(secondClass);
}

function handleSearchSubmit(event)
{
    event.preventDefault();

    getAnime(searchBar.value).then((response) => {
        if (response.data.length == 0)
        {
            throw new Error("No results for your search!");
        }
        searchData = response;
        createSearchResult();    
    })
    .catch((error) => {
       alert(error);
    });
}

function handleAddButton(event)
{
    const index = event.target.getAttribute('data-index');
    console.log(event.target)
    if (!index) return;

    addToList(searchData.data[index]);
}


newBtn.addEventListener("click", () => toggleClass(searchTab, 'slide-in', 'slide-out'));
close.addEventListener("click", () => toggleClass(searchTab, 'slide-in', 'slide-out'));
searchForm.addEventListener("submit", handleSearchSubmit);
list.addEventListener("click", handleEditButton);
editForm.addEventListener("submit", handleEditSave);
categories.addEventListener("click", handleCategoryButton);
document.addEventListener("DOMContentLoaded", loadFromStorage);
remove.addEventListener("click", handleEditRemove);
results.addEventListener("click", handleAddButton);