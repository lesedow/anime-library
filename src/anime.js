export function Anime(title, category, image, airing, released, id, episodes)
{
    this.title = title;
    this.category = category;
    this.image = image;
    this.airing = airing;
    this.released = released;
    this.id = id;
    this.episodes = episodes;

    this.episodesWatched = 0;
}

// Anime.prototype.update = async () => {

// }