"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
if (require.main === module) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    server.on('error', (error) => {
        console.error('Server error:', error);
    });
    server.on('close', () => {
        console.log('Server closed');
    });
}
//# sourceMappingURL=index.js.map