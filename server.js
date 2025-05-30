const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error: ', err));

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));  // Serve static files (e.g., background.jpg)

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views/register.html')));
app.get('/index', (req, res) => res.sendFile(path.join(__dirname, 'views/index.html')));

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send('Email is already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Redirect to login page after successful registration
    res.redirect('/');  
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('An error occurred. Please try again.');
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check for the user in the database
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    res.redirect('/index');  // Redirect to the main website after successful login
  } else {
    res.send('Invalid email or password');
  }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
