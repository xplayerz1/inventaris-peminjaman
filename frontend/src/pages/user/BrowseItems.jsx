import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Package, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import RequestLoanDialog from '../../components/RequestLoanDialog';

const GET_AVAILABLE_ITEMS = gql`
  query GetAvailableItems {
    availableItems {
      id
      name
      code
      category
      available_quantity
      location
      description
    }
  }
`;

export default function BrowseItems() {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const { data, loading, refetch } = useQuery(GET_AVAILABLE_ITEMS);

  const filteredItems = data?.availableItems?.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Browse Items</h2>
          <p className="text-sm text-muted-foreground">
            View available items and request loans
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.code}</CardDescription>
                  </div>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Category:</span> {item.category || '-'}</p>
                  <p><span className="font-medium">Available:</span> {item.available_quantity} units</p>
                  <p><span className="font-medium">Location:</span> {item.location || '-'}</p>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                <Button
                  className="w-full"
                  onClick={() => setSelectedItem(item)}
                  disabled={item.available_quantity === 0}
                >
                  Request Loan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedItem && (
        <RequestLoanDialog
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => {
            setSelectedItem(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
