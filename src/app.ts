import express from 'express';
import { createServer } from 'http';
import WebSocketService from './services/WebSocketService';

const app = express();
const server = createServer(app)
const webSocketService  = WebSocketService.getInstance(server)

// Middleware
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
// app.use('/api/example', exampleRoutes);

export default server;