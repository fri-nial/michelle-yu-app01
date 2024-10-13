// Import required modules
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');  // Use native MongoDB driver

// Initialize Express app
const app = express();
const port = 3000;  // You can change the port if needed

// Use CORS to allow requests from the frontend (e.g., CodePen)
app.use(cors());

// Use body-parser to handle JSON requests
app.use(express.json());

// Connect to MongoDB
const mongoUri = "mongodb+srv://michelleyuche:<db_password>@intouchminds.pqxwm.mongodb.net/?retryWrites=true&w=majority&appName=InTouchMinds";  
// Database and collections
let db;
let lettersCollection;
let repliesCollection;

const client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

// Connect to MongoDB
try {
    await client.connect()
    console.log('Connected to MongoDB');
    db = client.db('admin');  // Choose your database name
    lettersCollection = db.collection('letters');
    repliesCollection = db.collection('replies');
  }
catch(err) {
    console.log('MongoDB connection error:', err);
}


// Route to submit a letter
app.post('/submit-letter', async (req, res) => {
    try {
      const newLetter = {
        content: req.body.content,
        status: 'available',
        createdAt: new Date()
      };
      const result = await lettersCollection.insertOne(newLetter);
      res.json({ message: 'Letter submitted successfully!', letter: result.ops[0] });
    } catch (err) {
      res.status(500).json({ message: 'Error submitting letter', error: err });
    }
});
  
// Route to get a random letter
app.get('/random-letter', async (req, res) => {
    try {
      const availableLetters = await lettersCollection.find({ status: 'available' }).toArray();
      if (availableLetters.length === 0) {
        return res.json({ message: 'No letters available at the moment.' });
      }
      const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
      res.json(randomLetter);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching random letter', error: err });
    }
});
  
// Route to submit a reply to a letter
app.post('/submit-reply', async (req, res) => {
    try {
      const { letterId, content } = req.body;
  
      // Find the letter by its ID
      const letter = await lettersCollection.findOne({ _id: new ObjectId(letterId) });
  
      if (!letter) {
        return res.status(404).json({ message: 'Letter not found.' });
      }
  
      // Update the letter's status to "replied"
      await lettersCollection.updateOne({ _id: new ObjectId(letterId) }, { $set: { status: 'replied' } });
  
      // Save the reply
      const newReply = {
        letterId: new ObjectId(letterId),
        content,
        createdAt: new Date()
      };
      const result = await repliesCollection.insertOne(newReply);
  
      res.json({ message: 'Reply submitted successfully!', reply: result.ops[0] });
    } catch (err) {
      res.status(500).json({ message: 'Error submitting reply', error: err });
    }
});
  


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
