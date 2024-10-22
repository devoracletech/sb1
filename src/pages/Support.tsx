// Update the Support.tsx file to include the new LiveCrimeReport component
// Add this import at the top:
import LiveCrimeReport from '../components/LiveCrimeReport';

// Add 'LIVE_CRIME' to the ticket type options in the form:
<div>
  <label className="block text-sm font-medium text-gray-700">Ticket Type</label>
  <div className="mt-2 space-x-4">
    <label className="inline-flex items-center">
      <input
        type="radio"
        {...register('type')}
        value="GENERAL"
        onChange={() => setTicketType('GENERAL')}
        className="form-radio text-indigo-600"
      />
      <span className="ml-2">General Support</span>
    </label>
    <label className="inline-flex items-center">
      <input
        type="radio"
        {...register('type')}
        value="FRAUD_REPORT"
        onChange={() => setTicketType('FRAUD_REPORT')}
        className="form-radio text-indigo-600"
      />
      <span className="ml-2">Report Fraud</span>
    </label>
    <label className="inline-flex items-center">
      <input
        type="radio"
        {...register('type')}
        value="LIVE_CRIME"
        onChange={() => setTicketType('LIVE_CRIME')}
        className="form-radio text-red-600"
      />
      <span className="ml-2">Report Live Crime</span>
    </label>
  </div>
</div>

// Add this condition in the form rendering:
{ticketType === 'LIVE_CRIME' ? (
  <LiveCrimeReport onSubmit={() => refetch()} />
) : (
  // ... existing form content for other ticket types
)}