let statesData = [];
let singleHashingTimes = [];
let doubleHashingTimes = [];
let trieTimes = [];
let singleHashingCount = 0;
let doubleHashingCount = 0;
let trieCount = 0;
let averageTimesChart;

async function fetchData() {
  try {
    const response = await fetch("data.json");
    const jsonData = await response.json();
    statesData = jsonData.states;
    console.log("Data loaded successfully:", statesData);
    let cityCount = 0;
    for (const state of statesData) {
      cityCount += state.cities.length;
    }
    const cityCountElement = document.getElementById("city-count");
    cityCountElement.textContent = `Total Cities/Data: ${cityCount}`;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();


function singleHashingSearch(text, pattern) {
  const p = 31; 
  const m = 1e9 + 9; 

  const S = text.length;
  const P = pattern.length;

  let pPow = 1;
  for (let i = 0; i < P; i++) {
    pPow = (pPow * p) % m;
  }

 
  let patternHash = 0;
  for (let i = 0; i < P; i++) {
    patternHash = (patternHash * p + (pattern.charCodeAt(i) - 'a'.charCodeAt(0) + 1)) % m;
  }


  let currentHash = 0;
  for (let i = 0; i < P; i++) {
    currentHash = (currentHash * p + (text.charCodeAt(i) - 'a'.charCodeAt(0) + 1)) % m;
  }

  for (let i = 0; i + P - 1 < S; i++) {
    if (patternHash === currentHash) {
      if (text.substr(i, P) === pattern) {
        return true;
      }
    }

   
    if (i + P < S) {
      currentHash = (currentHash * p - (text.charCodeAt(i) - 'a'.charCodeAt(0) + 1) * pPow + (text.charCodeAt(i + P) - 'a'.charCodeAt(0) + 1)) % m;
      if (currentHash < 0) currentHash += m;
    }
  }

  return false;
}


function doubleHashingSearch(text, pattern) {
  const p1 = 31; 
  const p2 = 37; 
  const m = 1e9 + 9; 

  const S = text.length;
  const P = pattern.length;

  let p1Pow = 1;
  let p2Pow = 1;
  for (let i = 0; i < P; i++) {
    p1Pow = (p1Pow * p1) % m;
    p2Pow = (p2Pow * p2) % m;
  }

  let patternHash1 = 0;
  let patternHash2 = 0;
  for (let i = 0; i < P; i++) {
    patternHash1 = (patternHash1 * p1 + (pattern.charCodeAt(i) - 'a'.charCodeAt(0) + 1)) % m;
    patternHash2 = (patternHash2 * p2 + (pattern.charCodeAt(i) - 'a'.charCodeAt(0) + 1)) % m;
  }


  let currentHash1 = 0;
  let currentHash2 = 0;
  for (let i = 0; i < P; i++) {
    currentHash1 = (currentHash1 * p1 + (text.charCodeAt(i) - 'a'.charCodeAt(0) + 1)) % m;
    currentHash2 = (currentHash2 * p2 + (text.charCodeAt(i) - 'a'.charCodeAt(0) + 1)) % m;
  }

 
  for (let i = 0; i + P - 1 < S; i++) {
    if (patternHash1 === currentHash1 && patternHash2 === currentHash2) {
      if (text.substr(i, P) === pattern) {
        return true;
      }
    }

  
    if (i + P < S) {
      currentHash1 = (currentHash1 * p1 - (text.charCodeAt(i) - 'a'.charCodeAt(0) + 1) * p1Pow + (text.charCodeAt(i + P) - 'a'.charCodeAt(0) + 1)) % m;
      if (currentHash1 < 0) currentHash1 += m;
      
      currentHash2 = (currentHash2 * p2 - (text.charCodeAt(i) - 'a'.charCodeAt(0) + 1) * p2Pow + (text.charCodeAt(i + P) - 'a'.charCodeAt(0) + 1)) % m;
      if (currentHash2 < 0) currentHash2 += m;
    }
  }

  return false;
}

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectAllWords(node, prefix);
  }

  collectAllWords(node, prefix) {
    let words = [];
    if (node.isEndOfWord) {
      words.push(prefix);
    }
    for (const char in node.children) {
      words = words.concat(
        this.collectAllWords(node.children[char], prefix + char)
      );
    }
    return words;
  }
}

const trie = new Trie();


function initializeTrie() {
  for (const state of statesData) {
    for (const city of state.cities) {
      trie.insert(city.toLowerCase());
    }
  }
}

function autocomplete() {
  const input = document
    .getElementById("autocomplete-input")
    .value.toLowerCase();
  const algorithm = document.getElementById("algorithm").value;
  const suggestions = [];
  const timeTakenElement = document.getElementById("time-taken");

  if (input === "") {
    displaySuggestions(suggestions);
    timeTakenElement.textContent = "";
    return;
  }

  let startTime = performance.now();
  let algorithmTimes;

  if (algorithm === "single-hashing") {
    algorithmTimes = singleHashingTimes;
    singleHashingCount++;
    for (const state of statesData) {
      for (const city of state.cities) {
        if (singleHashingSearch(city.toLowerCase(), input)) {
          suggestions.push(city);
        }
      }
    }
  } else if (algorithm === "double-hashing") {
    algorithmTimes = doubleHashingTimes;
    doubleHashingCount++;
    for (const state of statesData) {
      for (const city of state.cities) {
        if (doubleHashingSearch(city.toLowerCase(), input)) {
          suggestions.push(city);
        }
      }
    }
  } else if (algorithm === "trie") {
    algorithmTimes = trieTimes;
    trieCount++;
    suggestions.push(...trie.startsWith(input));
  }

  let endTime = performance.now();
  let timeTaken = endTime - startTime;
  algorithmTimes.push(timeTaken);

  const averageTime = calculateAverage(algorithmTimes, algorithm);

  console.log(
    `Algorithm: ${algorithm}, Time taken: ${timeTaken.toFixed(
      2
    )} ms, Average Time: ${averageTime} ms`
  );

  timeTakenElement.textContent = `Time taken: ${timeTaken.toFixed(
    2
  )} ms, Average Time: ${averageTime} ms`;

  displaySuggestions(suggestions);
}

// Function to calculate average time
function calculateAverage(times, algorithm) {
  if (times.length === 0) return "Not used yet";
  const sum = times.reduce((acc, curr) => acc + curr, 0);
  const average = sum / times.length;
  return average.toFixed(2) + " ms";
}

window.autocomplete = autocomplete;

function displaySuggestions(suggestions) {
  const suggestionsList = document.getElementById("suggestions");
  suggestionsList.innerHTML = "";
  for (const suggestion of suggestions) {
    const listItem = document.createElement("li");
    listItem.textContent = suggestion;
    suggestionsList.appendChild(listItem);
  }
}

setInterval(() => {
  document.getElementById("single-hashing-average").textContent = calculateAverage(
    singleHashingTimes,
    "Single Hashing"
  );
  document.getElementById("double-hashing-average").textContent = calculateAverage(
    doubleHashingTimes,
    "Double Hashing"
  );
  document.getElementById("trie-average").textContent = calculateAverage(
    trieTimes,
    "Trie"
  );


  updateAverageTimesChart();
}, 1000); 

function updateAverageTimesChart() {
  averageTimesChart.data.datasets[0].data = [
    parseFloat(calculateAverage(singleHashingTimes, "Single Hashing")),
    parseFloat(calculateAverage(doubleHashingTimes, "Double Hashing")),
    parseFloat(calculateAverage(trieTimes, "Trie")),
  ];
  averageTimesChart.update();
}

setTimeout(() => {
  initializeTrie();
}, 1000);

function initializeChart() {
  const ctx = document.getElementById("average-times-chart").getContext("2d");
  averageTimesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Single Hashing", "Double Hashing", "Trie"],
      datasets: [
        {
          label: "Average Search Time (ms)",
          data: [NaN, NaN, NaN], 
          backgroundColor: [
            "rgba(255, 206, 86, 0.2)", 
            "rgba(75, 192, 192, 0.2)", 
            "rgba(54, 162, 235, 0.2)", 
          ],
          borderColor: [
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
          datalabels: {
            anchor: "end",
            align: "end",
            formatter: function (value, context) {
              return value + " ms";
            },
            color: "#333",
            font: {
              weight: "bold",
            },
          },
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
          display: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderRadius: 4,
          padding: {
            top: 2,
            bottom: 2,
            left: 6,
            right: 6,
          },
        },
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    },
  });
}

initializeChart();

function resetStats() {
  singleHashingTimes = [];
  doubleHashingTimes = [];
  trieTimes = [];
  singleHashingCount = 0;
  doubleHashingCount = 0;
  trieCount = 0;
  document.getElementById("single-hashing-average").textContent = "Not used yet";
  document.getElementById("double-hashing-average").textContent = "Not used yet";
  document.getElementById("trie-average").textContent = "Not used yet";
}

window.resetStats = resetStats;
