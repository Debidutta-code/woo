"use client";

import { useState } from "react";
import { X, Building2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Portal from "../ui/portal";
import { logout } from "@/Redux/slices/auth.slice";
import { useDispatch } from "react-redux";


interface BecomePartnerModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export default function BecomePartnerModal({
  open,
  onClose,
  userId,
}: BecomePartnerModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'success'>('intro');
  const [applicationId, setApplicationId] = useState<string>('');
const dispatch = useDispatch()
  if (!open) return null;

const handleContinue = () => {
  // Read access token from cookies
  const accessToken = Cookies.get("accessToken");

  // If no token → send to login
  if (!accessToken) {
      dispatch(logout());
      router.push("/login");
    onClose();
    return;
  }

  // If logged in → continue
  if (userId) {
    router.push(`/agency-application?userId=${userId}`);
  } else {
    router.push("/agency-application");
  }

  onClose();
};



  const handleClose = () => {
    setStep('intro');
    setApplicationId('');
    onClose();
  };

  return (
   <Portal>
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl relative max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {step === 'intro' && 'Become a Partner'}
            {step === 'success' && 'Application Submitted!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Intro Step */}
          {step === 'intro' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                Join our network of trusted travel agencies and corporate partners. 
                Fill out a quick application form and our team will review your 
                submission within 5-7 business days.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What you'll need:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Business registration details</li>
                  <li>GST number</li>
                  <li>Contact information</li>
                  <li>IATA code (for travel agencies)</li>
                </ul>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
              >
                Continue to Apply
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  Application Submitted Successfully!
                </h3>
                <p className="text-gray-600">
                  Thank you for your interest in becoming our partner.
                </p>
              </div>

              {applicationId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Application ID:</span> {applicationId}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Please save this ID for future reference
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Our team will review your application within 5-7 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>We'll contact you via email for any additional information needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Once approved, you'll receive your login credentials and onboarding instructions</span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-gray-500">
                  We'll send you an email confirmation shortly with more details.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
   </Portal>
  );
}