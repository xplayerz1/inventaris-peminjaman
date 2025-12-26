import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText, User, Package, Calendar, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { formatDate } from '../../lib/dateUtils';

const GET_ALL_LOANS = gql`
  query GetAllLoans {
    allLoans {
      id
      loan_date
      planned_return_date
      actual_return_date
      status
      notes
      admin_notes
      created_at
      item {
        name
        code
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

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'text-yellow-600 bg-yellow-50' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'text-green-600 bg-green-50' },
  active: { label: 'Active', icon: RefreshCw, className: 'text-blue-600 bg-blue-50' },
  returned: { label: 'Returned', icon: CheckCircle, className: 'text-gray-600 bg-gray-50' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'text-red-600 bg-red-50' },
};

export default function LoanHistory() {
  const { data, loading } = useQuery(GET_ALL_LOANS, {
    pollInterval: 10000,
  });

  const loans = data?.allLoans || [];

  // Group loans by user
  const loansByUser = loans.reduce((acc, loan) => {
    const userEmail = loan.user?.email || 'Unknown';
    if (!acc[userEmail]) {
      acc[userEmail] = {
        user: loan.user,
        loans: [],
      };
    }
    acc[userEmail].loans.push(loan);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Loan History</h2>
        <p className="text-sm text-muted-foreground">
          Complete loan history from all users
        </p>
      </div>

      {/* Summary Stats - Now at TOP */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {loans.filter(l => l.status === 'pending').length}
              </p>
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {loans.filter(l => l.status === 'approved').length}
              </p>
              <p className="text-sm text-green-700">Approved</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {loans.filter(l => l.status === 'active').length}
              </p>
              <p className="text-sm text-blue-700">Active</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">
                {loans.filter(l => l.status === 'returned').length}
              </p>
              <p className="text-sm text-gray-700">Returned</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {loans.filter(l => l.status === 'rejected').length}
              </p>
              <p className="text-sm text-red-700">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      ) : Object.keys(loansByUser).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No loan history yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(loansByUser).map(([email, userData]) => (
            <Card key={email}>
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{userData.user?.name || 'Unknown User'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {userData.user?.email} 
                      {userData.user?.nim && ` • NIM: ${userData.user.nim}`}
                      {userData.user?.organization && ` • ${userData.user.organization}`}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {userData.loans.length} loans
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {userData.loans.map((loan) => {
                    const statusInfo = statusConfig[loan.status] || statusConfig.pending;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div key={loan.id} className="p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{loan.item?.name}</p>
                              <p className="text-sm text-muted-foreground">{loan.item?.code}</p>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded ${statusInfo.className}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span>{statusInfo.label}</span>
                          </div>
                        </div>
                        <div className="mt-3 ml-8 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> Loan Date
                            </p>
                            <p className="font-medium">{formatDate(loan.loan_date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Planned Return</p>
                            <p className="font-medium">{formatDate(loan.planned_return_date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Actual Return</p>
                            <p className="font-medium">{formatDate(loan.actual_return_date)}</p>
                          </div>
                        </div>
                        {(loan.notes || loan.admin_notes) && (
                          <div className="mt-3 ml-8 text-sm">
                            {loan.notes && (
                              <p><span className="text-muted-foreground">User Note:</span> {loan.notes}</p>
                            )}
                            {loan.admin_notes && (
                              <p><span className="text-muted-foreground">Admin Note:</span> {loan.admin_notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
