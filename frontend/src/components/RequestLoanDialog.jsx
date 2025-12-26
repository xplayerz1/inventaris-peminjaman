import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../contexts/ToastContext';

const REQUEST_LOAN = gql`
  mutation RequestLoan($input: RequestLoanInput!) {
    requestLoan(input: $input) {
      id
      status
    }
  }
`;

export default function RequestLoanDialog({ item, open, onClose }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    loan_date: new Date().toISOString().split('T')[0],
    planned_return_date: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const [requestLoan, { loading }] = useMutation(REQUEST_LOAN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await requestLoan({
        variables: {
          input: {
            item_id: parseInt(item.id),
            ...formData,
          },
        },
      });
      toast.success('Request Submitted!', `Your loan request for ${item.name} has been submitted successfully.`);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Request Loan</CardTitle>
          <CardDescription>
            {item.name} ({item.code})
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="loan_date">Loan Date</Label>
              <Input
                id="loan_date"
                type="date"
                value={formData.loan_date}
                onChange={(e) => setFormData({ ...formData, loan_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planned_return_date">Planned Return Date</Label>
              <Input
                id="planned_return_date"
                type="date"
                value={formData.planned_return_date}
                onChange={(e) => setFormData({ ...formData, planned_return_date: e.target.value })}
                required
                min={formData.loan_date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Purpose of loan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
