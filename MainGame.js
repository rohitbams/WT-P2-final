import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import Scoreboard from './Scoreboard.js'
import Navbar from './Navbar.js';

export default {
  name: 'MainGame',
  components: {
    Scoreboard,
    Navbar
  },

  setup() {
    const gameMode = ref('welcome');
    const currentScore = ref(26);
    const sessionScoresArray = ref([]);
    const currentFact = ref(null);
    const guessedLetters = ref([]);
    const userGuesses = ref({
      fact: '',
      number: null
    });

    const getRandomMathLocal = async function () {
      try {
        const res = await fetch('./mathfacts.json');
        if (!res.ok) {
          throw new Error('Failed to load local cache')
        }
        const data = await res.json();
        // get random fact from mathfacts.json 
        const randomFact = data[Math.floor(Math.random() * data.length)];
        console.log(data.length);

        return {
          text: randomFact.text.replace(`${randomFact.number}`, "").replace(".","").trim(),
          number: randomFact.number
        };
      } catch (err) {
        console.error('Failed to load local cache:', err)
        return {
          text: "is the number of degrees in a circle",
          number: 360
        }
      }
    }

    const hiddenFact = computed(() => {
      if (!currentFact.value) {
        return '';
      }

      let result = '';
      let text = currentFact.value.text;

      for (let i = 0; i < text.length; i++) {
        let char = text[i];

        // keep non (a-z) characters unchanged
        if (!/[a-zA-Z]/.test(char)) {
          result += char;
        } else {
          // replace a-z characters to '_'
          if (guessedLetters.value.includes(char.toLowerCase())) {
            result += char;
          } else {
            result += '_';
          }
        }
      }
      return result;
    })

    const fetchFact = async () => {
      try {
        const res = await fetch('http://numbersapi.com/random/math?json');
        const data = await res.json();

        currentFact.value = {
          text: data.text.replace(`${data.number} `, '').replace('.', '').trim(),
          number: data.number
        }
      } catch (error) {
        console.error('Failed to fetch data from numbersapi.com, trying the local cache:', error);
        try {
          const localCacheData = await getRandomMathLocal();
          currentFact.value = localCacheData;
        } catch (localError) {
          console.error('Fail to fetch data from all sources :', localError)
        }
      }
    }

    const startNewGame = async () => {
      currentScore.value = 26;
      guessedLetters.value = [];
      userGuesses.value = { fact: '', number: null };
      gameMode.value = 'main';
      await fetchFact();
    }

    const makeGuess = (letter) => {

      const correctLettersSet = new Set(currentFact.value.text.toLowerCase().match(/[a-z]/g));
      const numberOfWrongLetters = 26 - correctLettersSet.size;

      // console.log("Current Score:  " + currentScorePretty.value)
      // console.log("current fact:   " + currentFact.value.number + " " + currentFact.value.text)
      // console.log("# wrong letter: " + numberOfWrongLetters)


      if (!guessedLetters.value.includes(letter)) {
        guessedLetters.value.push(letter)

        if (!currentFact.value.text.toLowerCase().includes(letter)) {
          // deduct current score by (26/number of wrong guesses) each time
          // if all wrong letters are guessed, the score should turn to 0
          // if currentScore value after deduction is an exponent number
          // (eg: 5.329070518200751e-15), currentScore should turn to 0
          currentScore.value = currentScore.value > (0.01 && currentScore.value < 1) ?
            (Math.max(0, currentScore.value - (26 / numberOfWrongLetters))) : 0;

          // console.log("deduct by: " + 26 / numberOfWrongLetters)
          // console.log("current score: " + currentScore.value)
          // console.log("Wrong letters: " + Array.from(numberOfWrongLetters))
        }

      }
    }

    const revealAllLetters = () => {
      guessedLetters.value = 'abcdefghijklmnopqrstuvwxyz'.split('')
      currentScore.value = 0;
      userGuesses.value.fact = currentFact.value.text;
    }

    // display current score value upto 2 decimal points
    const currentScorePretty = computed(() => {
      return currentScore.value.toString().substr(0, 4);
    });

    const submit = () => {
      const halfScore = 2;
      const bonusSore = 4;
      const isNumberCorrect = parseInt(userGuesses.value.number) === currentFact.value.number;
      const isFactCorrect =
        userGuesses.value.fact.toLowerCase().trim() === currentFact.value.text.toLowerCase();
      if (isNumberCorrect && isFactCorrect) {
        currentScore.value += bonusSore;
      } else if (isNumberCorrect || isFactCorrect) {
        currentScore.value = (currentScore.value / halfScore);
      } else {
        currentScore.value = 0;
      }

      const result = {
        score: currentScore.value,
        fact: currentFact.value.text,
        number: currentFact.value.number,
        guessedFact: userGuesses.value.fact.replace('.', '').trim(),
        guessedNumber: parseInt(userGuesses.value.number),
        timestamp: new Date().getTime()
      }
      sessionScoresArray.value.push(result);
      gameMode.value = 'scoreboard';

      // console.log("current score: " + currentScore.value);
    }

    const getLetterStatus = (letter) => {
      if (!guessedLetters.value.includes(letter)) return ''
      return currentFact.value.text.toLowerCase().includes(letter) ? 'correct' : 'incorrect'
    }

    return {
      currentFact,
      hiddenFact,
      guessedLetters,
      userGuesses,
      currentScore,
      currentScorePretty,
      sessionScoresArray,
      gameMode,
      revealAllLetters,
      makeGuess,
      submit,
      startNewGame,
      getLetterStatus
    }
  },

  template: `
    <div class="game-layout">
<Navbar/> 
      <div class="game-content">
      

        <div v-if="gameMode === 'welcome'" class="welcome-screen">
          <h2>Guess the Maths Fact</h2>

          <h3>Test your maths knowledge!</h3>
          <p>Guess the hidden fact and then work out the number it describes!</p>
          <button class="start-button" v-on:click="startNewGame">Start Game</button>
        </div>

        <template v-else>
          <div v-if="gameMode === 'main'">
              <div class="current-score">Current Score: 
              <span v-bind:style="{
                color:
                currentScore < 5 ? 'red' :
                currentScore < 15 ? '#fd7e1e' : '#4CAF50' }"> 
                  {{ currentScorePretty }} </span></div>
              
              <div class="question">
                <h3>Guess the hidden fact:</h3>
                <p>{{ hiddenFact }}</p>
              </div>
              
              <div class="letter-buttons">
              
                <button 
                  v-for="letter in 'abcdefghijklmnopqrstuvwxyz'"
                  v-bind:key="letter"
                  v-bind:disabled="guessedLetters.includes(letter)"
                  v-bind:class="getLetterStatus(letter)"
                  v-on:click="makeGuess(letter)">
                  {{ letter.toUpperCase() }}
                </button>
                <button
                  class="reveal-button"
                  v-on:click="revealAllLetters"
                  v-bind:disabled="guessedLetters.length === 26">
                ↧</button>
              </div>
              
              <div class="input-group">
                <label for="factGuess">Your fact guess:</label>
                <input 
                  id="factGuess"
                  v-model="userGuesses.fact"
                  type="text"
                  placeholder="Enter your fact guess">
              </div>
              
              <div class="input-group">
                <label for="numberGuess">Your number guess:</label>
                <input 
                  id="numberGuess"
                  v-model="userGuesses.number"
                  type="number"
                  placeholder="Enter your number guess">
              </div>

              <div>Make sure to enter your guesses before submitting!</div>
              <button 
                v-on:click="submit"
                v-bind:disabled="!userGuesses.fact || !userGuesses.number"> 
                Submit Answer
              </button>
          </div>

          <Scoreboard v-if="gameMode === 'scoreboard'" v-bind:scoreboard="sessionScoresArray"
            v-on:start-new-game="startNewGame"/>
        </template>
      </div>

      <div class="game-sidebar">
        <div class="aim-section">
          <h2>Game Aim</h2>
            <ul>
              <li>First work out the hidden maths fact</li>
              <li>Then work out which number the fact describes</li>
            </ul>
        </div> 

        <div class="rules-section">
          <h2>Game Rules</h2>
          <ul>
            <li>You start with a score of 26 points</li>
            <li>Click letters to gradually reveal the hidden math fact</li>
            <li>Each incorrect letter guess reduces your score</li>
            <li>Guess both the fact and the number</li>
            <li class="ra-code">The <code>↧</code> button will reveal all letters &  fill the fact input with the fact</li>
            <li>But revealing all (incorrect) letters will turn your score to 0!</li>
            <li>Submit your answer when you're ready</li>
          </ul>
        </div>

        <div class="scoring-section">
          <h2>Scoring System</h2>
          <ul>
            <li>You start each round with 26 points</li>
            <li>Points are deducted for every wrong letter you guess</li>
            <li>If you click every letter button, your score turns to 0!</li>
            <li>If you correctly guess both fact and number correct, you get +4 points</li>
            <li>If you only guess one correct (fact or number), your score gets halved</li>
            <li>If you get both guesses wrong, your score turns to 0!</li>
            <li>Maximum possible score: 30 points</li>
          </ul>
        </div>

        </div>

      </div>

   
  `
}