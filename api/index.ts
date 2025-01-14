import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000; 
const DATA_FILE = path.join(process.cwd(), 'api', 'data.json');

app.use(bodyParser.json());
app.use(cors());

interface User {
    name: string;
    pawn: string;
    position: number;
    stepsCompleted: number;
    timesCompleted: number;
}

// Load users from file
function loadUsers(): User[] {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data) as User[];
    }
    return [];
}

// Save users to file
function saveUsers(users: User[]): void {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Get all users
app.get('/api/users', (req: Request, res: Response) => {
    const users = loadUsers();
    res.json(users);
});

// Create or update user
app.post('/api/users', (req: Request, res: Response) => {
    const user: User = req.body;
    let users = loadUsers();
    const existingUserIndex = users.findIndex((u) => u.name === user.name);
    if (existingUserIndex >= 0) {
        users[existingUserIndex] = user;
    } else {
        users.push(user);
    }
    saveUsers(users);
    res.json(users);
});

// Listen on the provided port or default to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
