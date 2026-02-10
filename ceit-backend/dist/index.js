"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Serve static files from public directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.use('/auth', authRoutes_1.default);
app.use('/posts', postRoutes_1.default);
app.use('/events', eventRoutes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'CEIT Admin Portal API is running' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
