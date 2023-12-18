let score = 0;

async function getRandomWord() {
    const randomWordUrl = "https://random-word-api.herokuapp.com/word";

    try {
        const response = await fetch(randomWordUrl);
        const data = await response.json();

        // Extract the random word and part of speech
        const word = data[0];
        const partOfSpeech = await getPartOfSpeech(word);

        return { word, partOfSpeech };
    } catch (error) {
        console.error('Error fetching random word:', error);
    }
}

async function getDefinition(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Extract the first definition
        return data[0]?.meanings[0]?.definitions[0]?.definition || null;
    } catch (error) {
        console.error('Error fetching definition:', error);
        return null;
    }
}

async function getRandomWords() {
    const randomWords = [];

    // Fetch random words until we have 10 with definitions
    while (randomWords.length < 10) {
        const randomWord = await getRandomWord();
        const definition = await getDefinition(randomWord.word);

        // Only add words with definitions
        if (definition !== null) {
            randomWords.push({ id: randomWords.length + 1, word: randomWord.word, definition: definition, partOfSpeech: randomWord.partOfSpeech });
        }
    }

    // Shuffle the array of pairs based on IDs
    return shuffleArray(randomWords);
}

async function getPartOfSpeech(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Extract the first part of speech
        return data[0]?.meanings[0]?.partOfSpeech || 'unknown';
    } catch (error) {
        console.error('Error fetching part of speech:', error);
        return 'unknown';
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    if (event.target.classList.contains("droppable")) {
        const targetElement = event.target;
        if (checkMatch(draggedElement, targetElement)) {
            updateScore(10);
            displayFeedback("Correct!");
        } else {
            displayFeedback("Incorrect!");
        }
        targetElement.appendChild(draggedElement);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function touchStart(event) {
    event.preventDefault();
    const touchedElement = event.target;
    if (touchedElement.classList.contains("draggable")) {
        event.dataTransfer.setData("text", touchedElement.id);
    }
}

function touchEnd(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    if (event.target.classList.contains("droppable")) {
        const targetElement = event.target;
        if (checkMatch(draggedElement, targetElement)) {
            updateScore(10);
            displayFeedback("Correct!");
        } else {
            displayFeedback("Incorrect!");
        }
        targetElement.appendChild(draggedElement);
    }
}

function touchMove(event) {
    event.preventDefault();
    // Additional touch move handling if needed
}

// Attach touch events to draggable elements
const draggableElements = document.querySelectorAll('.draggable');
draggableElements.forEach(element => {
    element.ontouchstart = touchStart;
    element.ontouchmove = touchMove;
    element.ontouchend = touchEnd;
});

function checkMatch(wordElement, definitionElement) {
    const wordNumber = wordElement.id.slice(-1);
    const definitionNumber = definitionElement.id.slice(-1);

    // Extract the numerical part of the IDs and compare them
    return parseInt(wordNumber) === parseInt(definitionNumber);
}

function updateScore(points) {
    score += points;
    document.getElementById("score").innerText = score;
}

function displayFeedback(message) {
    const feedbackSection = document.getElementById("feedback-section");
    feedbackSection.innerText = message;

    // Adjust the position of feedback
    const wordContainer = document.getElementById("word-cards");
    feedbackSection.style.top = `${wordContainer.offsetTop - feedbackSection.offsetHeight}px`;

    setTimeout(() => {
        feedbackSection.innerText = "";
        // Reset the position after clearing the feedback
        feedbackSection.style.top = "0";
    }, 3000); // Adjusted the duration to 3 seconds
}

async function initializeGame() {
    const loadingScreen = document.getElementById("loading-screen");
    const wordContainer = document.getElementById("word-cards");
    const definitionContainer = document.getElementById("definition-cards");

    // Show loading screen
    loadingScreen.style.display = "flex";

    const wordsAndDefinitions = await getRandomWords();

    // Hide loading screen
    loadingScreen.style.display = "none";

    // Clear previous content
    wordContainer.innerHTML = "";
    definitionContainer.innerHTML = "";

    wordsAndDefinitions.forEach((item, index) => {
        const wordCard = createCard(item.word, `word${item.id}`, 'draggable', item.partOfSpeech);
        const definitionCard = createCard(item.definition, `definition${item.id}`, 'droppable');

        wordContainer.appendChild(wordCard);
        definitionContainer.appendChild(definitionCard);
    });
}

function createCard(content, id, className, partOfSpeech) {
    const card = document.createElement("div");
    const contentWithPartOfSpeech = partOfSpeech ? `${content} (${partOfSpeech})` : content;
    card.innerHTML = contentWithPartOfSpeech;
    card.id = id;
    card.className = className;
    card.draggable = className === 'draggable';
    card.ondragstart = drag;
    card.ondrop = drop;
    card.ondragover = allowDrop;
    return card;
}


// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle
    while (currentIndex !== 0) {

        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap it with the current element
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

// Initialize the game when the page loads
window.onload = initializeGame;