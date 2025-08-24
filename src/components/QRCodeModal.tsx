import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface QRData {
  userId: string;
  userEmail: string;
  userName: string;
  offerId: string;
  offerName: string;
  stampsPerScan: number;
  timestamp: string;
  rewardId?: string;
  action?: string;
}

interface QRCodeModalProps {
  qrData: QRData;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  qrData,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const qrString = JSON.stringify(qrData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-sm w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center">
          <h3 className="text-lg font-semibold text-white flex-1 text-center truncate">
            {qrData.offerName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="p-6 flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={qrString}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
