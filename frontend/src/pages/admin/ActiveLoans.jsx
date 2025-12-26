import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CheckCircle, FileText } from 'lucide-react';
import { formatDate } from '../../lib/dateUtils';
import { useToast } from '../../contexts/ToastContext';

const GET_ACTIVE_LOANS = gql`
  query GetActiveLoans {
    activeLoans {
      id
      loan_date
      planned_return_date
      status
      notes
      created_at
      item {
        name
        code
      }
      user {
        name
        email
      }
    }
  }
`;

const MARK_AS_RETURNED = gql`
  mutation MarkAsReturned($input: ReturnItemInput!) {
    markAsReturned(input: $input) {
      id
      status
    }
  }
`;

export default function ActiveLoans() {
  const toast = useToast();
  const [returningLoan, setReturningLoan] = useState(null);
  const [returnData, setReturnData] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    admin_notes: '',
  });

  const { data, loading, refetch } = useQuery(GET_ACTIVE_LOANS, {
    pollInterval: 5000,
  });
  const [markAsReturned] = useMutation(MARK_AS_RETURNED);

  const handleReturn = async (loanId) => {
    try {
      await markAsReturned({
        variables: {
          input: {
            loan_id: parseInt(loanId),
            ...returnData,
          },
        },
      });
      toast.success('Item Returned!', 'The item has been marked as returned successfully.');
      setReturningLoan(null);
      setReturnData({
        actual_return_date: new Date().toISOString().split('T')[0],
        admin_notes: '',
      });
      refetch();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Active Loans</h2>
        <p className="text-sm text-muted-foreground">
          Track and manage active loan transactions
        </p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : data?.activeLoans?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active loans</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.activeLoans?.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{loan.item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{loan.item.code}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium capitalize">{loan.status}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">{loan.user.name}</p>
                  <p className="text-sm text-muted-foreground">{loan.user.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Loan Date</p>
                    <p className="font-medium">{formatDate(loan.loan_date)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expected Return</p>
                    <p className="font-medium">{formatDate(loan.planned_return_date)}</p>
                  </div>
                </div>

                {loan.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground font-medium">User Note</p>
                    <p>{loan.notes}</p>
                  </div>
                )}

                {returningLoan === loan.id ? (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-2">
                      <Label>Actual Return Date</Label>
                      <Input
                        type="date"
                        value={returnData.actual_return_date}
                        onChange={(e) => setReturnData({ ...returnData, actual_return_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Admin Notes (Optional)</Label>
                      <Input
                        placeholder="Item condition, etc..."
                        value={returnData.admin_notes}
                        onChange={(e) => setReturnData({ ...returnData, admin_notes: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleReturn(loan.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Return
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setReturningLoan(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setReturningLoan(loan.id)}
                  >
                    Mark as Returned
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
