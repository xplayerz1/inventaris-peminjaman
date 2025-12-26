import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { formatDate } from '../../lib/dateUtils';
import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

const GET_PENDING_LOANS = gql`
  query GetPendingLoans {
    pendingLoans {
      id
      loan_date
      planned_return_date
      notes
      created_at
      item {
        name
        code
        available_quantity
      }
      user {
        name
        email
        nim
        organization
      }
    }
  }
`;

const APPROVE_LOAN = gql`
  mutation ApproveLoan($input: ApproveLoanInput!) {
    approveLoan(input: $input) {
      id
      status
    }
  }
`;

const REJECT_LOAN = gql`
  mutation RejectLoan($input: RejectLoanInput!) {
    rejectLoan(input: $input) {
      id
      status
    }
  }
`;

export default function PendingLoans() {
  const toast = useToast();
  const [actionLoan, setActionLoan] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data, loading, refetch } = useQuery(GET_PENDING_LOANS, {
    pollInterval: 5000,
  });
  const [approveLoan] = useMutation(APPROVE_LOAN);
  const [rejectLoan] = useMutation(REJECT_LOAN);

  const handleApprove = async (loanId) => {
    try {
      await approveLoan({
        variables: {
          input: { loan_id: parseInt(loanId), admin_notes: adminNotes },
        },
      });
      toast.success('Loan Approved!', 'The loan request has been approved successfully.');
      setActionLoan(null);
      setAdminNotes('');
      refetch();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleReject = async (loanId) => {
    if (!adminNotes.trim()) {
      toast.warning('Note Required', 'Please provide a reason for rejection.');
      return;
    }
    try {
      await rejectLoan({
        variables: {
          input: { loan_id: parseInt(loanId), admin_notes: adminNotes },
        },
      });
      toast.success('Loan Rejected', 'The loan request has been rejected.');
      setActionLoan(null);
      setAdminNotes('');
      refetch();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Pending Loan Requests</h2>
        <p className="text-sm text-muted-foreground">
          Review and approve or reject loan requests
        </p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : data?.pendingLoans?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.pendingLoans?.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{loan.item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{loan.item.code}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{loan.user.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{loan.user.email}</p>
                  {loan.user.nim && (
                    <p className="text-sm">NIM: {loan.user.nim}</p>
                  )}
                  {loan.user.organization && (
                    <p className="text-sm">{loan.user.organization}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Loan Date</p>
                    <p className="font-medium">{formatDate(loan.loan_date)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Return Date</p>
                    <p className="font-medium">{formatDate(loan.planned_return_date)}</p>
                  </div>
                </div>

                {loan.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground font-medium">User Note</p>
                    <p>{loan.notes}</p>
                  </div>
                )}

                <div className="text-sm">
                  <p className="text-muted-foreground">Available Stock</p>
                  <p className="font-medium">{loan.item.available_quantity} units</p>
                </div>

                {actionLoan === loan.id ? (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-2">
                      <Label>Admin Notes</Label>
                      <Input
                        placeholder="Add notes..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleApprove(loan.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={() => handleReject(loan.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActionLoan(null);
                          setAdminNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setActionLoan(loan.id)}
                  >
                    Take Action
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
