// components/paymentComponents/PaymentOptionSelector.tsx
"use client";

import { QrCode, Wallet, CreditCard, Building2, Coins } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

interface PaymentOptionSelectorProps {
  selectedOption: string | null;
  onChange: (option: string) => void;
}

const PaymentOptionSelector: React.FC<PaymentOptionSelectorProps> = ({
  selectedOption,
  onChange
}) => {
  const { t, i18n } = useTranslation();
  const [cryptoSubOption, setCryptoSubOption] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedOption) {
      onChange("payAtHotel");
      setCryptoSubOption(null);
    } else if (selectedOption.startsWith("payWithCrypto-")) {
      setCryptoSubOption(selectedOption.split("-")[1]);
    } else if (selectedOption === "payWithCrypto") {
      setCryptoSubOption(null);
    }
  }, [selectedOption, onChange]);

  const handleCryptoSubOptionChange = (subOption: string) => {
    setCryptoSubOption(subOption);
    onChange(`payWithCrypto-${subOption}`);
  };

  return (
    <div className="payment-options">
      <h3 className="text-lg font-tripswift-medium mb-4 text-tripswift-black">
        {t('Payment.PaymentComponents.PaymentOptionSelector.title')}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pay at Hotel Option */}
        <label 
          className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedOption === 'payAtHotel' || !selectedOption
              ? 'border-tripswift-blue bg-tripswift-blue/5 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name="paymentOption"
            value="payAtHotel"
            checked={selectedOption === 'payAtHotel' || !selectedOption}
            onChange={() => {
              onChange("payAtHotel");
              setCryptoSubOption(null);
            }}
            className="sr-only"
          />
          
          {/* Check indicator */}
          {(selectedOption === 'payAtHotel' || !selectedOption) && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-tripswift-blue rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              selectedOption === 'payAtHotel' || !selectedOption
                ? 'bg-tripswift-blue/10'
                : 'bg-gray-100'
            }`}>
              <Building2 className={`w-5 h-5 ${
                selectedOption === 'payAtHotel' || !selectedOption
                  ? 'text-tripswift-blue'
                  : 'text-gray-600'
              }`} />
            </div>
            <span className={`text-sm font-tripswift-semibold ${
              selectedOption === 'payAtHotel' || !selectedOption
                ? 'text-tripswift-black'
                : 'text-gray-600'
            }`}>
              PAY AT HOTEL
            </span>
          </div>
          
          <p className={`text-xs ${
            selectedOption === 'payAtHotel' || !selectedOption
              ? 'text-tripswift-black/60'
              : 'text-gray-500'
          }`}>
            {t('Payment.PaymentComponents.PaymentOptionSelector.payAtHotelDescription') || 'Pay when you arrive'}
          </p>
        </label>

        {/* Pay Online Option */}
        <label 
          className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedOption === 'payOnline'
              ? 'border-tripswift-blue bg-tripswift-blue/5 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name="paymentOption"
            value="payOnline"
            checked={selectedOption === 'payOnline'}
            onChange={() => {
              onChange("payOnline");
              setCryptoSubOption(null);
            }}
            className="sr-only"
          />
          
          {/* Check indicator */}
          {selectedOption === 'payOnline' && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-tripswift-blue rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              selectedOption === 'payOnline'
                ? 'bg-tripswift-blue/10'
                : 'bg-gray-100'
            }`}>
              <CreditCard className={`w-5 h-5 ${
                selectedOption === 'payOnline'
                  ? 'text-tripswift-blue'
                  : 'text-gray-600'
              }`} />
            </div>
            <span className={`text-sm font-tripswift-semibold ${
              selectedOption === 'payOnline'
                ? 'text-tripswift-black'
                : 'text-gray-600'
            }`}>
              PAY ONLINE
            </span>
          </div>
          
          <p className={`text-xs ${
            selectedOption === 'payOnline'
              ? 'text-tripswift-black/60'
              : 'text-gray-500'
          }`}>
            UPI, Cards & More
          </p>
        </label>

        {/* Pay with Crypto Option */}
        <label 
          className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"
              ? 'border-tripswift-blue bg-tripswift-blue/5 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name="paymentOption"
            value="payWithCrypto"
            checked={selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"}
            onChange={() => {
              onChange("payWithCrypto");
              setCryptoSubOption(null);
            }}
            className="sr-only"
          />
          
          {/* Check indicator */}
          {(selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto") && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-tripswift-blue rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"
                ? 'bg-tripswift-blue/10'
                : 'bg-gray-100'
            }`}>
              <Coins className={`w-5 h-5 ${
                selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"
                  ? 'text-tripswift-blue'
                  : 'text-gray-600'
              }`} />
            </div>
            <span className={`text-sm font-tripswift-semibold ${
              selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"
                ? 'text-tripswift-black'
                : 'text-gray-600'
            }`}>
              {t('Payment.PaymentComponents.PaymentOptionSelector.payWithCrypto') || 'CRYPTO'}
            </span>
          </div>
          
          <p className={`text-xs ${
            selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"
              ? 'text-tripswift-black/60'
              : 'text-gray-500'
          }`}>
            {t('Payment.PaymentComponents.PaymentOptionSelector.payWithCryptoDescription') || 'Pay with cryptocurrency'}
          </p>
        </label>
      </div>

      {/* Crypto Sub-options */}
      {selectedOption === "payWithCrypto" && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-sm font-tripswift-medium mb-3 text-tripswift-black">
            {t("Payment.PaymentComponents.PaymentOptionSelector.chooseCryptoMethod") || "Choose Payment Method"}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCryptoSubOptionChange("payWithWallet")}
              disabled={true}
              className="p-3 rounded-lg border-2 border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-tripswift-medium text-gray-400">
                {t("Payment.PaymentComponents.PaymentOptionSelector.payWithWallet") || "Wallet"}
              </span>
            </button>

            <button
              onClick={() => handleCryptoSubOptionChange("payWithQR")}
              className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                cryptoSubOption === "payWithQR"
                  ? "border-tripswift-blue bg-tripswift-blue/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <QrCode className={`w-4 h-4 ${
                cryptoSubOption === "payWithQR" ? "text-tripswift-blue" : "text-gray-600"
              }`} />
              <span className={`text-sm font-tripswift-medium ${
                cryptoSubOption === "payWithQR" ? "text-tripswift-black" : "text-gray-600"
              }`}>
                {t("Payment.PaymentComponents.PaymentOptionSelector.payWithQR") || "QR Code"}
              </span>
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader className="text-tripswift-black">
            {t("Payment.PaymentComponents.PaymentOptionSelector.unavailableTitle")}
          </ModalHeader>
          <ModalBody>
            <p className="text-tripswift-black/80">
              {t("Payment.PaymentComponents.PaymentOptionSelector.unavailableMessage") ||
                "This provision is not available in your country."}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsModalOpen(false)}>
              {t("Common.close") || "Close"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PaymentOptionSelector;