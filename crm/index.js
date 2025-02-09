import express from 'express';  

const app = express();
const PORT = 8080;

app.get('/', (req, res) => 
    res.send('Node and express server is running on port ${PORT}'));
app.listen(PORT, () =>
    console.log('Your server is running on port ${PORT}'));
