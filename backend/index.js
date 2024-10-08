// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const port = 3000;  // You can change the port if needed

// Use CORS to allow requests from the frontend (e.g., CodePen)
app.use(cors());

// Use body-parser to handle JSON requests
app.use(bodyParser.json());

// In-memory storage for letters and replies
let letters = [];  // Array to store submitted letters
let replies = {};  // Object to store replies, indexed by letter ID

// Route to handle submitting a letter
app.post('/submit-letter', (req, res) => {
    const letter = {
        id: letters.length + 1,  // Generate a simple ID for the letter
        content: req.body.content,
        status: 'available',
        createdAt: new Date()
    };

    // Store the letter
    letters.push(letter);

    // Respond with success
    res.json({ message: 'Letter submitted successfully!', letter });

    console.log(req.body.content)
});

// Route to get a random letter
app.get('/random-letter', (req, res) => {
    // Filter letters that are available
    const availableLetters = letters.filter(letter => letter.status === 'available');
    
    if (availableLetters.length === 0) {
        return res.json({ message: 'No letters available at the moment.' });
    }

    // Pick a random letter
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

    // Respond with the random letter
    res.json(randomLetter);
});

// Route to submit a reply to a letter
app.post('/submit-reply', (req, res) => {
    const letterId = req.body.letterId;
    const replyContent = req.body.content;

    // Find the letter with the given ID
    const letter = letters.find(l => l.id === letterId);

    if (!letter) {
        return res.status(404).json({ message: 'Letter not found.' });
    }

    // Mark the letter as replied
    letter.status = 'replied';

    // Store the reply in the replies object
    if (!replies[letterId]) {
        replies[letterId] = [];
    }
    replies[letterId].push({
        content: replyContent,
        createdAt: new Date()
    });

    // Respond with success
    res.json({ message: 'Reply submitted successfully!', reply: replyContent });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
