"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_routes_1 = __importDefault(require("./job.routes"));
const router = (0, express_1.Router)();
router.use('/jobs', job_routes_1.default);
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});
exports.default = router;
//# sourceMappingURL=index.js.map