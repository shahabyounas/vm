import React from "react";
import { Offer } from "@/hooks/auth.types";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";

interface OffersTabProps {
  offers: Offer[];
}

const OffersTab: React.FC<OffersTabProps> = ({ offers }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Manage Offers</h3>
        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
          <Plus className="w-4 h-4 mr-2" />
          Create New Offer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map(offer => (
          <div
            key={offer.offerId}
            className={`bg-gradient-to-br ${
              offer.isActive
                ? "from-green-900/40 to-green-800/40 border-green-700/50"
                : "from-gray-800/40 to-gray-700/40 border-gray-600/50"
            } border rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">{offer.name}</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  offer.isActive
                    ? "bg-green-900/50 text-green-300 border border-green-700/50"
                    : "bg-gray-900/50 text-gray-300 border border-gray-600/50"
                }`}
              >
                {offer.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">{offer.description}</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Stamps:</span>
                <span className="text-white">{offer.stampRequirement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reward:</span>
                <span className="text-white">{offer.rewardDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">
                  {offer.rewardType}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-300 hover:bg-red-700/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersTab;
