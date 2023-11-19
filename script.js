const canvas = document.getElementById('geneCanvas');
const ctx = canvas.getContext('2d');
const sequences = [];
let chromosomes = []; // Array to store the chromosomes
const maxSequences = 2500;
const squareSize = 2;
const groupRows = 500; // 2 rows in a group
const groupCols = 1000; // 2 columns in a group
const creationInterval = 540000 / maxSequences; // Adjusted for 9-minute duration
let geneCount = 0;
const genesPerChromosome = 2000;
let chromosomeCount = 0;
let currentChromosomeSequence = "";

// Function to generate random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to generate a random gene letter
function getRandomGeneLetter() {
  const geneLetters = ['A', 'T', 'C', 'G'];
  return geneLetters[Math.floor(Math.random() * geneLetters.length)];
}

// Sequence class
class Sequence {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.letter = getRandomGeneLetter(); // Store gene letter
    this.velocity = {
      x: (Math.random() * 2 - 1),
      y: (Math.random() * 2 - 1)
    };
    this.group = [this]; // Group of attached sequences
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, squareSize, squareSize);
  }

  update() {
    // Update position if not part of a larger group
    if (this.group.length === 1) {
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      // Bounce off canvas edges
      if (this.x <= 0 || this.x >= canvas.width - squareSize) {
        this.velocity.x *= -1;
      }
      if (this.y <= 0 || this.y + squareSize >= canvas.height) {
        this.velocity.y *= -1;
      }
    }

    // Check for collisions with other sequences
    sequences.forEach(seq => {
      if (seq !== this && this.isColliding(seq) && !this.isInSameGroup(seq)) {
        this.mergeWithGroup(seq);
      }
    });
  }

  isColliding(other) {
    return this.x < other.x + squareSize &&
      this.x + squareSize > other.x &&
      this.y < other.y + squareSize &&
      this.y + squareSize > other.y;
  }

  isInSameGroup(other) {
    return this.group === other.group;
  }

  mergeWithGroup(other) {
    // Merge groups
    let combinedGroup = [...this.group, ...other.group];
    combinedGroup.forEach(member => {
      member.group = combinedGroup;
    });

    // Position the sequences in a grid
    this.positionGroup();
  }

  positionGroup() {
    let groupMembers = [...new Set(this.group)];
    groupMembers.forEach((member, index) => {
      let row = Math.floor(index / groupCols);
      let col = index % groupCols;
      member.x = this.x + col * squareSize;
      member.y = this.y + row * squareSize;
    });
  }
}



// Get the div element where you want to display the chromosome sequence
const chromosomeDisplay = document.getElementById('chromosomeDisplay');

// Function to update the display with all chromosomes
function updateChromosomeDisplay() {
    // Clear the display
    chromosomeDisplay.innerHTML = '';

    // Add each chromosome to the display
    chromosomes.forEach((chromosomeSeq, index) => {
        let chromosomeDiv = document.createElement('div');
        chromosomeDiv.textContent = `Chromosome ${index + 1}: ${formatChromosomeSequence(chromosomeSeq)}`;
        chromosomeDisplay.appendChild(chromosomeDiv);
    });

    // Scroll to the bottom of the display to show the latest chromosome
    chromosomeDisplay.scrollTop = chromosomeDisplay.scrollHeight;
}

// Function to handle new gene creation and chromosome logging
function handleNewGene(gene) {
    geneCount++;
    currentChromosomeSequence += gene.letter;

    // Update the current chromosome sequence on the display
    chromosomeDisplay.textContent = `Chromosome ${chromosomeCount + 1}: ${formatChromosomeSequence(currentChromosomeSequence)}`;

    // If we've reached the end of a chromosome
    if (geneCount % genesPerChromosome === 0) {
        chromosomeCount++;
        chromosomes.push(currentChromosomeSequence); // Save the completed chromosome
        updateChromosomeDisplay(); // Update the display to include the new chromosome
        currentChromosomeSequence = ''; // Reset for the next chromosome
    }
}

// Add this to your existing code to call the animate function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    animate();
});

// Function to format the chromosome sequence for display
function formatChromosomeSequence(sequence) {
    let formattedSequence = '';
    // Split sequence into groups of 6
    for (let i = 0; i < sequence.length; i += 6) {
        formattedSequence += sequence.slice(i, i + 6) + ' ';
    }
    return formattedSequence.trim(); // Remove trailing whitespace
}

// Function to add a new gene
function addGene() {
    if (geneCount < maxSequences) {
        let color = getRandomColor();
        let x = Math.random() * (canvas.width - squareSize);
        let y = Math.random() * (canvas.height - squareSize);
        let newGene = new Sequence(x, y, color);
        sequences.push(newGene);

        handleNewGene(newGene); // Process the new gene

        setTimeout(addGene, creationInterval);
    }
}

// Initialize the first gene
addGene();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw each sequence
  sequences.forEach(sequence => {
    sequence.update();
    sequence.draw();
  });
}

// Start the animation
animate();
