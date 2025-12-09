import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import Button from "../../components/Button";

const BillingCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
          Payment Cancelled
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Your payment was cancelled or not completed. You can try again any
          time.
        </p>

        <Button variant="link" onClick={() => navigate("/billing")}>
          Back to Plans
        </Button>
      </div>
    </div>
  );
};

export default BillingCancel;
