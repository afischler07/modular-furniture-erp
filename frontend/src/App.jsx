import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SystemsPage from './pages/SystemsPage';
import SystemDetail from './pages/SystemDetail';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetail from './pages/ArticleDetail';
import ComponentsPage from './pages/ComponentsPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetail from './pages/OrderDetail';
import InventoryPage from './pages/InventoryPage';
import InvoicesPage from './pages/InvoicesPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/systems" element={<SystemsPage />} />
        <Route path="/systems/:id" element={<SystemDetail />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
      </Routes>
    </Layout>
  );
}
