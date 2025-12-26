import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/dateUtils';

const GET_MY_LOANS = gql`
  query GetMyLoans {
    myLoans {
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
    }
  }
`;

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'text-yellow-600' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'text-green-600' },
  active: { label: 'Active', icon: FileText, className: 'text-blue-600' },
  returned: { label: 'Returned', icon: CheckCircle, className: 'text-gray-600' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'text-red-600' },
};

export default function MyLoans() {
  const { data, loading } = useQuery(GET_MY_LOANS, {
    pollInterval: 5000,
  });

  const StatusIcon = ({ status }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.className}`} />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">My Loans</h2>
        <p className="text-sm text-muted-foreground">
          Track your loan requests and history
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading loans...</p>
        </div>
      ) : data?.myLoans?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No loan history yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.myLoans?.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{loan.item.name}</CardTitle>
                    <CardDescription>{loan.item.code}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon status={loan.status} />
                    <span className={statusConfig[loan.status].className}>
                      {statusConfig[loan.status].label}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    <p className="text-muted-foreground">Your Note</p>
                    <p>{loan.notes}</p>
                  </div>
                )}
                {loan.admin_notes && (
                  <div className="text-sm bg-muted p-3 rounded-md">
                    <p className="text-muted-foreground font-medium">Admin Note</p>
                    <p>{loan.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
