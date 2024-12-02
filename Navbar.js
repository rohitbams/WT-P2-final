import { ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default {
    name: 'Navbar',

    setup() {
        const randomTrivia = ref(null);

        const getRandomTriviaLocal = async () => {
            try {
                const res = await fetch("./mathfact.json");
                if (!res.ok) {
                    throw new Error('Failed to load local cache');
                }
                const data = await res.json();
                const randomTrivia = data[Math.floor(Math.random() * data.length)];
                return {
                    text: randomTrivia.text.replace(`${randomTrivia.number}`, ""),
                    number: randomTrivia.number
                }
            } catch (err) {
                console.error('Failed to load local cache:', err)
                return {
                    text: "is the number of degrees in a circle",
                    number: 360
                }
            }
        }

        const fetchTrivia = async () => {
            try {
                const res = await fetch("http://numbersapi.com/random/trivia?json");
                const data = await res.json();

                randomTrivia.value = {
                    text: data.text,
                    number: data.number
                }
            } catch (error) {
                console.error('Failed to load random trivia from numbersapi.com, trying local cache: ', error);
                try {
                    const localCacheTrivia = await getRandomTriviaLocal();
                    randomTrivia.value = localCacheTrivia;
                } catch (localError) {
                    console.error('Fail to fetch data from all sources :', localError)
                }
            }
        }

        const refreshTrivia = async () => {
            await fetchTrivia();
        }

        onMounted(() => {
            fetchTrivia(); 
        });
        
        return {
            randomTrivia,
            refreshTrivia,
            fetchTrivia,
            getRandomTriviaLocal
        }
    },

    template: `
    <div class="game-navbar">
     <h4>Navigation</h4>
        <ul>
            <li><a href="">Home</a></li>
            <li><a href="">About us</a></li>
            <li><a href="">More games</a></li>
            <li><a href="">Newsletter</a></li>
            <li><a href="">Contact us</a></li>
        </ul>
        <div class="trivia">
        <p><span v-on:click="refreshTrivia" 
        class="refresh">&#8635; 
        </span>Random math trivia:</p>
            <div>{{ randomTrivia?.text }}</div>
            
        </div>
    </div>
    `
}
