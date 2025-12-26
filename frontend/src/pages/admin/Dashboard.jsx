import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Package, FileText, MessageSquare, LogOut, ClipboardCheck, Settings, History } from 'lucide-react';

import ManageItems from './ManageItems';
import PendingLoans from './PendingLoans';
import ActiveLoans from './ActiveLoans';
import ChatInbox from './ChatInbox';
import LoanHistory from './LoanHistory';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Settings className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground text-xs">Administrator</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 space-y-2">
            <Link to="/admin/items">
              <Button variant="ghost" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Manage Items
              </Button>
            </Link>
            <Link to="/admin/pending">
              <Button variant="ghost" className="w-full justify-start">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Pending Requests
              </Button>
            </Link>
            <Link to="/admin/active">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Active Loans
              </Button>
            </Link>
            <Link to="/admin/history">
              <Button variant="ghost" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                Loan History
              </Button>
            </Link>
            <Link to="/admin/chat">
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat Inbox
              </Button>
            </Link>
          </aside>

          <main className="flex-1">
            <Routes>
              <Route index element={<PendingLoans />} />
              <Route path="items" element={<ManageItems />} />
              <Route path="pending" element={<PendingLoans />} />
              <Route path="active" element={<ActiveLoans />} />
              <Route path="history" element={<LoanHistory />} />
              <Route path="chat" element={<ChatInbox />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
