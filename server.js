const express = require('express');
        const { MongoClient, ObjectId } = require('mongodb');
        const cors = require('cors');
        
        const app = express();
        const PORT = 3000;
        
        // MongoDB connection
        const MONGODB_URI = 'mongodb+srv://rohankumbhar4370:y7qbTrZD20jvPUPw@100xdev.mbsoyb3.mongodb.net/todoapp?retryWrites=true&w=majority';
        let db;
        
        // Middleware
        app.use(cors());
        app.use(express.json());
        app.use(express.static('public')); // Serve the HTML file
        
        // Connect to MongoDB
        MongoClient.connect(MONGODB_URI)
            .then(client => {
                console.log('Connected to MongoDB');
                db = client.db('todoapp');
            })
            .catch(error => console.error('MongoDB connection error:', error));
        
        // API Routes
        
        // GET all todos
        app.get('/api/todos', async (req, res) => {
            try {
                const todos = await db.collection('todos').find({}).sort({ createdAt: -1 }).toArray();
                res.json(todos);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch todos' });
            }
        });
        
        // POST create todo
        app.post('/api/todos', async (req, res) => {
            try {
                const todo = {
                    ...req.body,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                const result = await db.collection('todos').insertOne(todo);
                const newTodo = await db.collection('todos').findOne({ _id: result.insertedId });
                
                res.status(201).json(newTodo);
            } catch (error) {
                res.status(500).json({ error: 'Failed to create todo' });
            }
        });
        
        // PATCH update todo
        app.patch('/api/todos/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const updates = {
                    ...req.body,
                    updatedAt: new Date().toISOString()
                };
                
                const result = await db.collection('todos').updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updates }
                );
                
                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: 'Todo not found' });
                }
                
                const updatedTodo = await db.collection('todos').findOne({ _id: new ObjectId(id) });
                res.json(updatedTodo);
            } catch (error) {
                res.status(500).json({ error: 'Failed to update todo' });
            }
        });
        
        // DELETE todo
        app.delete('/api/todos/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const result = await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
                
                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Todo not found' });
                }
                
                res.json({ message: 'Todo deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete todo' });
            }
        });
        
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });