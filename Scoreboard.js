import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default {
  name: 'Scoreboard',
  props: {
    scoreboard: {
      type: Array,
      required: true
    }
  },

  emits: ['start-new-game'],

  setup(props) {

    const sortKey = ref('score');
    const sortDirection = ref('desc');

    const sortedScores = computed(() => {
      let scores = props.scoreboard.slice();
      
      scores.sort((a, b) => {
        let valueA = a[sortKey.value];
        let valueB = b[sortKey.value];

        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return -1
        if (valueA > valueB) return 1
        return 0;
      })

      // reverse for descending order
      if (sortDirection.value === 'desc') {
        scores.reverse()
      }

      return scores
    })

    const toggleSort = (key) => {
      if (sortKey.value === key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortDirection.value = 'desc';
      }
    }

    return {
      sortKey,
      sortDirection,
      sortedScores,
      toggleSort
    }
  },

  template: `
  <div class="scoreboard">
    <h2>Previous Scores</h2>
    
    <div>
      <button v-on:click="$emit('start-new-game')">Play Again</button>
      
    </div>

    <table>
      <thead>
        <tr>
          <th> <button v-on:click="toggleSort('score')" 
          type="button" class="table-button">Score 
            {{ sortKey === 'score' ? (sortDirection === 'asc' ? '↑' : '↓') : '  ' }} 
             </button>
          </th>
          <th> <button v-on:click="toggleSort('number')"
           type="button" class="table-button">Number 
           {{ sortKey === 'number' ? (sortDirection === 'asc' ? '↑' : '↓') : '  ' }} 
            </button>
          </th>
          <th> <button v-on:click="toggleSort('fact')" 
            type="button" class="table-button"> Fact 
            {{ sortKey === 'fact' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }} 
            </button>
          </th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="score in sortedScores" v-bind:key="score.timestamp">
          <td>{{ score.score.toFixed(2) }}</td>
          <td>{{ score.number }}</td>
          <td>{{ score.fact }}</td>
          <td>{{ score.guessedNumber === score.number && 
                 score.guessedFact.toLowerCase() === score.fact.toLowerCase() 
                 ? 'Correct!' : 'Incorrect!' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
`
}