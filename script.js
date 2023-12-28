const moves = document.getElementById("moves");
const timeDisplay = document.getElementById("time");
const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");
const pauseBtn = document.getElementById("pause");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const endscreen = document.querySelector(".endscreen-container"); 
const sizeInput = 4; // change to accommodate more in the future

let cards;
let timer;
let card1 = false, card2 = false;

const items = [
    {name: "nbr-1", match1: "1", match2: "2 - 1"},
    {name: "nbr-2", match1: "2", match2: "10 / 5"},
    {name: "nbr-3", match1: "3", match2: "12 - 9"},
    {name: "nbr-4", match1: "4", match2: "2 x 2"},
    {name: "nbr-5", match1: "5", match2: "sqrt(25)"},
    {name: "nbr-6", match1: "6", match2: "4 + 2"},
    {name: "nbr-7", match1: "7", match2: "11 - 4"},
    {name: "nbr-8", match1: "8", match2: "2 x 4"}
]

// initial time, moves, successCount:
let sec = 0, min = 0;
let moveCount = 0, successCount = 0;

// timer + formatting:
const timeGen = () => {
    sec++;

    if(sec == 60) {
        sec = 0;
        min++;
    }

    let secDisplay = sec >= 10 ? sec : `0${sec}`;
    let minDisplay = min >= 10 ? min : `0${min}`;
    timeDisplay.innerHTML = `<span>Time: </span>${minDisplay}:${secDisplay}`;
}

// moves display:
const movesGen = () => {
    moveCount++;
    moves.innerHTML = `<span>Moves: </span>${moveCount}`;
};

// random generator for cards
const randomCardGen = (size = sizeInput) => { // update for match1, match2, start with just match1
    let tempArr = [...items];
    
    //initialize cardValues arr
    let cardValues = [];
    size = (size**2)/2; // number of pairs

    for(let i=0; i<size; i++){
        const randIndex = Math.floor(Math.random() * tempArr.length);
        cardValues.push(tempArr[randIndex]);

        // remove card from tempArr
        tempArr.splice(randIndex, 1);
    }

    return cardValues;
};

const matrixGen = (cardValues, size = sizeInput) => { // cardvalues1, cardvalues2, and then put them tgt into cardvalues
    gameContainer.innerHTML="";
    cardValues = [...cardValues, ...cardValues];

    // shuffle cards
    cardValues.sort(() => Math.random() - 0.5);

    let seenCards = [];

    for(let i=0; i<size**2; i++){
        /**
         * card-back: ?
         * card-front: actual card content
         * data-card-name: stores names of the cards 
         */
        if(seenCards.includes(cardValues[i].match1)) {
            gameContainer.innerHTML += `
            <div class="card-container" data-card-name="${cardValues[i].name}">
                <div class="card-back">?</div>
                <div class="card-front">${cardValues[i].match2}</div>
            </div>
            `;
            seenCards.push(cardValues[i].match2);
        } else if(seenCards.includes(cardValues[i].match2)) {
            gameContainer.innerHTML += `
            <div class="card-container" data-card-name="${cardValues[i].name}">
                <div class="card-back">?</div>
                <div class="card-front">${cardValues[i].match1}</div>
            </div>
            `;
            seenCards.push(cardValues[i].match1);
        } else {
            let matchNum = Math.floor(Math.random() * 2);
            if(matchNum == 0) {
                gameContainer.innerHTML += `
            <div class="card-container" data-card-name="${cardValues[i].name}">
                <div class="card-back">?</div>
                <div class="card-front">${cardValues[i].match1}</div>
            </div>
            `;
            seenCards.push(cardValues[i].match1);
            } else {
                gameContainer.innerHTML += `
            <div class="card-container" data-card-name="${cardValues[i].name}">
                <div class="card-back">?</div>
                <div class="card-front">${cardValues[i].match2}</div>
            </div>
            `;
            seenCards.push(cardValues[i].match2);
            }
        }
    }
    

    // format board into grid
    gameContainer.style.gridTemplateColumns = `repeat(${size}, auto)`;

    cards = document.querySelectorAll(".card-container");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            // if card being clicked on is not match-found yet:
            if(!card.classList.contains("match-found") && !card.classList.contains("flipped")) {
                // flip the card
                card.classList.add("flipped");
                // let card1Value;
                if(!card1) { // if first card not flipped yet
                    card1 = card;
                    card1Value = card.getAttribute("data-card-name");
                } else { // if first card flipped
                    movesGen();
                    card2 = card;
                    let card2Value = card.getAttribute("data-card-name");
                    if(card1Value == card2Value) {
                        // match the cards
                        card1.classList.add("match-found"); 
                        card2.classList.add("match-found");
    
                        // reset card states for next pair to be found
                        card1 = false;
                        successCount++;
                        
                        // check if won game yet or not
                        if(successCount == Math.floor(cardValues.length / 2)) {
                            result.innerHTML = `<h2>You won! 🎉</h2>
                            <h4>Moves: ${moveCount}</h4>`;
                            stopGame();
                        } 
                    } else { // if cards don't match
                        // flip the cards back around
                        let [tempCard1, tempCard2] = [card1, card2];
                        card1 = false;
                        card2 = false;
                        let delay = setTimeout(() => {
                            tempCard1.classList.remove("flipped");
                            tempCard2.classList.remove("flipped");
                        }, 900);
                    }
                }
            }
        });

    });
};

// start game
playBtn.addEventListener("click", () => {
    if(playBtn.innerText == "Resume") {
        endscreen.classList.add("hidden");
        playBtn.classList.add("hidden");
        stopBtn.classList.remove("hidden");
        pauseBtn.classList.remove("hidden");

        // start timer
        timer = setInterval(timeGen, 1000);
    } else {
        sec = 0; min = 0;
        moveCount = 0;
        endscreen.classList.add("hidden");
        playBtn.classList.add("hidden");
        stopBtn.classList.remove("hidden");
        pauseBtn.classList.remove("hidden");

        // start timer
        timeDisplay.innerHTML = `<span>Time: </span> 00:00`;
        timer = setInterval(timeGen, 1000);

        // initial moves
        moves.innerHTML = `<span>Moves: </span> ${moveCount}`;

        initializer();
    }
});

// stop game
stopBtn.addEventListener("click", (stopGame = () => {
    endscreen.classList.remove("hidden");
    playBtn.classList.remove("hidden");
    playBtn.innerText = "Play Again";
    stopBtn.classList.add("hidden");
    pauseBtn.classList.add("hidden");
    clearInterval(timer);
}));

pauseBtn.addEventListener("click", () => {
    endscreen.classList.remove("hidden");
    playBtn.classList.remove("hidden");
    playBtn.innerText = "Resume";
    stopBtn.classList.add("hidden");
    pauseBtn.classList.add("hidden");
    clearInterval(timer);
});

// initalize board
const initializer = () => {
    result.innerText = "";
    successCount = 0;
    let cardValues = randomCardGen();
    console.log(cardValues);
    matrixGen(cardValues);
};

