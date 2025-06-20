import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Admin control - set to true for admin access
const ADMIN_MODE = true;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory post storage
let posts = [
    {
        id: '1',
        title: 'Welcome to My Blog',
        content: 'This is the first post on my new blog. More content coming soon!',
        createdAt: new Date().toLocaleString()
    }
];

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        posts, 
        isAdmin: ADMIN_MODE 
    });
});


// New post route (add isAdmin)
app.get('/posts/new', (req, res) => {
    if (!ADMIN_MODE) return res.redirect('/');
    res.render('new-post', { 
        isAdmin: ADMIN_MODE,
        title: 'New Post'
    });
});

app.post('/posts', (req, res) => {
    if (!ADMIN_MODE) return res.redirect('/');
    
    const { title, content } = req.body;
    const newPost = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toLocaleString()
    };
    posts.unshift(newPost);
    res.redirect('/');
});

// View post (public)
app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.redirect('/');
    res.render('view-post', { 
        post, 
        isAdmin: ADMIN_MODE 
    });
});

// Edit post route (add isAdmin)
app.get('/posts/:id/edit', (req, res) => {
    if (!ADMIN_MODE) return res.redirect('/');
    
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.redirect('/');
    res.render('edit-post', { 
        post,
        isAdmin: ADMIN_MODE,
        title: 'Edit: ' + post.title
    });
});

app.post('/posts/:id/update', (req, res) => {
    if (!ADMIN_MODE) return res.redirect('/');
    
    const { title, content } = req.body;
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) return res.redirect('/');
    
    posts[postIndex] = {
        ...posts[postIndex],
        title,
        content,
        updatedAt: new Date().toLocaleString()
    };
    res.redirect(`/posts/${req.params.id}`);
});

// Delete post (admin only)
app.post('/posts/:id/delete', (req, res) => {
    if (!ADMIN_MODE) return res.redirect('/');
    posts = posts.filter(p => p.id !== req.params.id);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin mode: ${ADMIN_MODE ? 'ON' : 'OFF'}`);
});
