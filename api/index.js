// Entry point for Vercel Serverless Functions
const app = require('../Backend/server');

// This handler ensures that Express receives the full request details
module.exports = (req, res) => {
    return app(req, res);
};
