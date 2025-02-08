const OMDB_API_KEY = '9086674e';  
const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4/anime';

async function getMoviesOrSeries(mood, type) {
    let url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${mood}&type=${type}`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data.Search || []; 
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return [];
    }
}

async function getAnimeByMood(mood) {
    let url = `${JIKAN_BASE_URL}?q=${mood}&limit=20`;  // Increased limit to get more results
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data.data || []; 
    } catch (error) {
        console.error("Error fetching anime:", error);
        return [];
    }
}

// Function to generate HTML for each section dynamically
function displayResults(title, data, type) {
    let resultDiv = document.getElementById("result");
    resultDiv.innerHTML += `<h2>${title}</h2>`;

    if (data.length === 0) {
        resultDiv.innerHTML += `<p>No ${type} found for this mood.</p>`;
        return;
    }

    data.forEach(item => {
        let imageUrl = item.Poster || (item.images ? item.images.jpg.image_url : '');
        let year = item.Year || item.year || "N/A";
        let rating = item.imdbRating || item.score || "N/A";
        let genres = item.Genre || (item.genres ? item.genres.map(g => g.name).join(', ') : "N/A");
        let link = item.imdbID 
            ? `https://www.imdb.com/title/${item.imdbID}/` 
            : item.url || "#";

        resultDiv.innerHTML += `
            <a href="${link}" target="_blank" class="suggestion">
                <img src="${imageUrl}" alt="Poster">
                <p><strong>${item.Title || item.title}</strong> (${year})</p>
                <p>⭐ ${type === 'anime' ? 'Score' : 'IMDb'}: ${rating}</p>
                <p>🎭 Genre: ${genres}</p>
            </a>
        `;
    });

    // Add a "More Suggestions" button
    resultDiv.innerHTML += `<button class="more-suggestions" onclick="loadMoreSuggestions('${title}')">More Suggestions</button>`;
}

async function loadMoreSuggestions(title) {
    let mood = document.getElementById("moodSelect").value;
    let resultDiv = document.getElementById("result");

    // Clear "More Suggestions" button
    resultDiv.innerHTML = resultDiv.innerHTML.replace(
        /<button class="more-suggestions".*<\/button>/, 
        ''
    );

    // Fetch more results based on the section
    if (title === "🎬 Movies" || title === "📺 Series") {
        let moreMoviesOrSeries = await getMoviesOrSeries(mood, title === "🎬 Movies" ? "movie" : "series");
        displayResults(title, moreMoviesOrSeries, title === "🎬 Movies" ? "movies" : "series");
    } else if (title === "🎥 Anime") {
        let moreAnime = await getAnimeByMood(mood);
        displayResults(title, moreAnime, "anime");
    }
}

async function suggestEntertainment() {
    let mood = document.getElementById("moodSelect").value;
    let resultDiv = document.getElementById("result");
    
    resultDiv.innerHTML = ""; // Clear previous results

    let [movies, series, anime] = await Promise.all([
        getMoviesOrSeries(mood, "movie"),
        getMoviesOrSeries(mood, "series"),
        getAnimeByMood(mood)
    ]);

    displayResults("🎬 Movies", movies, "movies");
    displayResults("📺 Series", series, "series");
    displayResults("🎥 Anime", anime, "anime");
}
