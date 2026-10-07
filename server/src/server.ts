import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 DareAI Support Ticket Explorer API running on port ${PORT}`);
  console.log(`📊 25,000 Support Tickets loaded in-memory`);
  console.log(`⏱️ Network Simulator active: 200-3000ms delay, ~10% failure rate`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
});
