import QRCode from "@/components/QRCode";

const LoyaltyCard = ({ user }: { user: any }) => (
  <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-10 min-h-[460px] flex flex-col justify-center -mt-0 shadow-2xl">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-6">Your Loyalty Card</h3>
      <div className="flex justify-center mb-6">
        <QRCode value={`LOYALTY:${user.email}:${user.id}`} size={200} />
      </div>
      <p className="text-gray-400 text-sm">
        Show this QR code to staff to earn loyalty points
      </p>
    </div>
  </div>
);

export default LoyaltyCard;
