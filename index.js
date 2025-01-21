// Game state
let countryData = [];
let currentRound = 1;
let score = 0;
let timeLeft = 15;
let timer;
let currentQuestion;
let currentUser = "";
let allResults = [];

// DOM elements
const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");
const scoreElement = document.getElementById("score");
const roundElement = document.getElementById("round");
const timerElement = document.getElementById("timer");
const countryElement = document.getElementById("countryName");
const flagElement = document.getElementById("flag");
const optionsContainer = document.getElementById("options");
const gameContent = document.getElementById("gameContent");
const gameOver = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");
const topScoreElement = document.getElementById("topScore");
const resultsTable = document.getElementById("resultsTable");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");
const usernameInput = document.getElementById("username");
const answerFeedback = document.getElementById("answerFeedback");
const correctAnswerElement = document.getElementById("correctAnswer");

// Fetch country data
async function getCountryData() {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all");
    countryData = response.data.filter(
      (country) => country.capital && country.capital.length > 0
    );
  } catch (error) {
    console.error("Error getting country data:", error);
  }
}

// Game functions
function generateQuestion() {
  const randomIndex = Math.floor(Math.random() * countryData.length);
  const correctCountry = countryData[randomIndex];

  const otherCapitals = countryData
    .filter((item) => item.capital[0] !== correctCountry.capital[0])
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((item) => item.capital[0]);

  const options = [...otherCapitals, correctCountry.capital[0]].sort(
    () => 0.5 - Math.random()
  );

  return {
    country: correctCountry.name.common,
    correctAnswer: correctCountry.capital[0],
    flag: correctCountry.flag,
    options,
  };
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timerElement.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      handleAnswer(null);
    }
  }, 1000);
}

function displayQuestion() {
  currentQuestion = generateQuestion();
  countryElement.textContent = currentQuestion.country;
  flagElement.textContent = currentQuestion.flag;
  answerFeedback.classList.add("hidden");

  optionsContainer.innerHTML = currentQuestion.options
    .map(
      (option) => `
            <button 
                class="w-full p-4 text-lg font-semibold text-gray-700 bg-gray-100 rounded-lg  transition-colors transform hover:scale-105"
                onclick="handleAnswer('${option}')"
            >
                ${option}
            </button>
        `
    )
    .join("");
}

function handleAnswer(answer) {
  clearInterval(timer);

  const buttons = optionsContainer.querySelectorAll("button");
  buttons.forEach((button) => {
    button.disabled = true;
    if (button.textContent.trim() === currentQuestion.correctAnswer) {
      button.classList.add("bg-green-500", "text-white");
    }
    if (
      button.textContent.trim() === answer &&
      answer !== currentQuestion.correctAnswer
    ) {
      button.classList.add("bg-red-500", "text-white");
    }
  });

  if (answer === currentQuestion.correctAnswer) {
    score++;
    scoreElement.textContent = score;
  } else {
    answerFeedback.classList.remove("hidden");
    correctAnswerElement.textContent = `Correct answer: ${currentQuestion.correctAnswer}`;
    correctAnswerElement.classList.add("text-red-600");
  }

  setTimeout(() => {
    currentRound++;
    if (currentRound <= 10) {
      roundElement.textContent = currentRound;
      displayQuestion();
      startTimer();
    } else {
      endGame();
    }
  }, 1000);
}

function updateResults() {
  allResults.push({ username: currentUser, score: score });
  allResults.sort((a, b) => b.score - a.score);

  // Update top score
  const topScore = allResults[0];
  topScoreElement.textContent = `${topScore.username}: ${topScore.score}/10`;

  // Update results table
  resultsTable.querySelector("tbody").innerHTML = allResults
    .map(
      (result) => `
            <tr>
                <td class="border p-2">${result.username}</td>
                <td class="border p-2">${result.score}/10</td>
            </tr>
        `
    )
    .join("");
}

function endGame() {
  gameScreen.classList.add("hidden");
  gameOver.classList.remove("hidden");
  finalScoreElement.textContent = `${score}/10`;
  updateResults();
}

function startGame() {
  currentUser = usernameInput.value.trim();
  if (!currentUser) {
    alert("Please enter a username");
    return;
  }

  loginScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  currentRound = 1;
  score = 0;
  scoreElement.textContent = score;
  roundElement.textContent = currentRound;
  displayQuestion();
  startTimer();
}

// Event listeners
restartButton.addEventListener("click", () => {
  gameOver.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  usernameInput.value = "";
});

startButton.addEventListener("click", startGame);

// Initialize the game
getCountryData().then(() => {
  loginScreen.classList.remove("hidden");
});
