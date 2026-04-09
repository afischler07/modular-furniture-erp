import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { systemsRouter } from './routes/systems.js';
import { articlesRouter } from './routes/articles.js';
import { componentsRouter } from './routes/components.js';
import { customersRouter } from './routes/customers.js';
import { ordersRouter } from './routes/orders.js';
import { inventoryRouter } from './routes/inventory.js';
import { invoicesRouter } from './routes/invoices.js';
import { bomRouter } from './routes/bom.js';
import { dashboardRouter } from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/systems', systemsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/components', componentsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/bom', bomRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Möbel-ERP Backend läuft auf Port ${PORT}`);
});
