import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Package, FileText, MessageSquare, LogOut, User } from 'lucide-react';

import BrowseItems from './BrowseItems';
import MyLoans from './MyLoans';
import Chat from './Chat';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Inventaris</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground text-xs">{user?.email}</p>
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
            <Link to="/user/items">
              <Button variant="ghost" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Browse Items
              </Button>
            </Link>
            <Link to="/user/loans">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                My Loans
              </Button>
            </Link>
            <Link to="/user/chat">
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat with Admin
              </Button>
            </Link>
          </aside>

          <main className="flex-1">
            <Routes>
              <Route index element={<BrowseItems />} />
              <Route path="items" element={<BrowseItems />} />
              <Route path="loans" element={<MyLoans />} />
              <Route path="chat" element={<Chat />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
