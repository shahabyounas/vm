import React, { useState, useEffect } from "react";
import { Offer, User } from "@/hooks/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createOffer, updateOffer, deleteOffer } from "@/db/offers";
import { Timestamp } from "firebase/firestore";
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  Gift,
  Target,
  Calendar,
  Users,
  Activity,
  RefreshCw,
  Download,
  X,
  Clock,
  Hash,
  AlertCircle,
  CheckCircle,
  Power,
  PowerOff,
  Play,
  Pause,
} from "lucide-react";

interface OffersTabProps {
  offers: Offer[];
  userRole?: "customer" | "admin" | "super_admin";
  onOfferCreated?: () => void; // Callback to refresh offers list
  currentUser?: User; // Current user context
}

const OffersTab: React.FC<OffersTabProps> = ({
  offers,
  userRole,
  onOfferCreated,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "activate" | "deactivate";
    offer: Offer;
    message: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    stampRequirement: 1,
    stampsPerScan: 1,
    rewardType: "percentage",
    rewardValue: "",
    rewardDescription: "",
    expiryDate: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    stampRequirement: 1,
    stampsPerScan: 1,
    rewardType: "percentage",
    rewardValue: "",
    rewardDescription: "",
    expiryDate: "",
  });

  // Check if offer has active users collecting stamps
  const hasActiveUsers = (offer: Offer) => {
    // This would ideally check the database for users with active rewards for this offer
    // For now, we'll show a generic warning for inactive offers
    // TODO: Implement actual database check for active users
    return !offer.isActive;
  };

  // Filter offers based on search and status
  const filteredOffers = offers.filter(offer => {
    const matchesSearch =
      offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && offer.isActive) ||
      (statusFilter === "inactive" && !offer.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalOffers = offers.length;
  const activeOffers = offers.filter(offer => offer.isActive).length;
  const inactiveOffers = offers.filter(offer => !offer.isActive).length;
  const totalStampsRequired = offers.reduce(
    (sum, offer) => sum + offer.stampRequirement,
    0
  );

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isCreateModalOpen) {
        handleCancelCreate();
      }
    };

    if (isCreateModalOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isCreateModalOpen]);

  const handleCreateOffer = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage(""); // Clear previous success message

      // Validate form
      if (!createForm.name.trim()) {
        setError("Offer name is required");
        return;
      }
      if (!createForm.description.trim()) {
        setError("Description is required");
        return;
      }
      if (!createForm.rewardValue.trim()) {
        setError("Reward value is required");
        return;
      }
      if (!createForm.rewardDescription.trim()) {
        setError("Reward description is required");
        return;
      }

      // Create offer object for database
      const offerData = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        stampRequirement: createForm.stampRequirement,
        stampsPerScan: createForm.stampsPerScan,
        rewardType: createForm.rewardType,
        rewardValue: createForm.rewardValue.trim(),
        rewardDescription: createForm.rewardDescription.trim(),
        isActive: false, // Offers start as inactive by default
        expiresAt: createForm.expiryDate
          ? Timestamp.fromDate(new Date(createForm.expiryDate))
          : null,
      };

      // Call database function to create offer
      if (!currentUser) {
        throw new Error("User context not available");
      }

      await createOffer(currentUser, offerData);

      // Show success message
      setSuccessMessage("Offer created successfully!");

      // Call the callback to refresh the list
      onOfferCreated?.();

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Reset form and close modal
      setCreateForm({
        name: "",
        description: "",
        stampRequirement: 1,
        stampsPerScan: 1,
        rewardType: "percentage",
        rewardValue: "",
        rewardDescription: "",
        expiryDate: "",
      });
      setIsCreateModalOpen(false);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create offer. Please try again."
      );
      console.error("Error creating offer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateForm({
      name: "",
      description: "",
      stampRequirement: 1,
      stampsPerScan: 1,
      rewardType: "percentage",
      rewardValue: "",
      rewardDescription: "",
      expiryDate: "",
    });
    setIsCreateModalOpen(false);
    setError("");
    setSuccessMessage(""); // Clear success message on cancel
    setIsSubmitting(false);
  };

  // Handle offer activation/deactivation
  const handleToggleOfferStatus = async (offer: Offer) => {
    const action = offer.isActive ? "deactivate" : "activate";
    const message = offer.isActive
      ? `Are you sure you want to deactivate "${offer.name}"? This will hide it from new users, but existing users can continue collecting stamps.`
      : `Are you sure you want to activate "${offer.name}"? This will make it visible to all customers.`;

    setConfirmAction({
      type: action,
      offer,
      message,
    });
    setIsConfirmModalOpen(true);
  };

  // Confirm and execute offer status change
  const confirmToggleOfferStatus = async () => {
    if (!confirmAction || !currentUser) return;

    try {
      const { offer } = confirmAction;
      const newStatus = !offer.isActive;
      await updateOffer(currentUser, offer.offerId, { isActive: newStatus });

      setSuccessMessage(
        `Offer ${newStatus ? "activated" : "deactivated"} successfully!`
      );
      onOfferCreated?.(); // Refresh offers list

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${confirmAction.type} offer. Please try again.`
      );
      console.error("Error toggling offer status:", err);
    } finally {
      closeConfirmModal();
    }
  };

  // Handle edit offer
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setEditForm({
      name: offer.name,
      description: offer.description,
      stampRequirement: offer.stampRequirement,
      stampsPerScan: offer.stampsPerScan || 1,
      rewardType: offer.rewardType,
      rewardValue: offer.rewardValue,
      rewardDescription: offer.rewardDescription,
      expiryDate: offer.expiresAt
        ? offer.expiresAt.toDate().toISOString().split("T")[0]
        : "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!currentUser || !editingOffer) {
        setError("User context or offer not available");
        return;
      }

      setIsEditSubmitting(true);
      setError("");

      // Validate form
      if (!editForm.name.trim()) {
        setError("Offer name is required");
        return;
      }
      if (!editForm.description.trim()) {
        setError("Description is required");
        return;
      }
      if (!editForm.rewardValue.trim()) {
        setError("Reward value is required");
        return;
      }
      if (!editForm.rewardDescription.trim()) {
        setError("Reward description is required");
        return;
      }

      // Update offer
      const updateData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        stampRequirement: editForm.stampRequirement,
        stampsPerScan: editForm.stampsPerScan,
        rewardType: editForm.rewardType,
        rewardValue: editForm.rewardValue.trim(),
        rewardDescription: editForm.rewardDescription.trim(),
        expiresAt: editForm.expiryDate
          ? Timestamp.fromDate(new Date(editForm.expiryDate))
          : null,
      };

      await updateOffer(currentUser, editingOffer.offerId, updateData);

      setSuccessMessage("Offer updated successfully!");
      onOfferCreated?.(); // Refresh offers list

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Close edit modal
      setIsEditModalOpen(false);
      setEditingOffer(null);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update offer. Please try again."
      );
      console.error("Error updating offer:", err);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingOffer(null);
    setEditForm({
      name: "",
      description: "",
      stampRequirement: 1,
      stampsPerScan: 1,
      rewardType: "percentage",
      rewardValue: "",
      rewardDescription: "",
      expiryDate: "",
    });
    setError("");
  };

  // Handle delete offer
  const handleDeleteOffer = async (offer: Offer) => {
    const message = `Are you sure you want to delete "${offer.name}"? This action cannot be undone and will remove the offer completely.`;

    setConfirmAction({
      type: "delete",
      offer,
      message,
    });
    setIsConfirmModalOpen(true);
  };

  // Confirm and execute offer deletion
  const confirmDeleteOffer = async () => {
    if (!confirmAction || !currentUser) return;

    try {
      setDeletingOffer(confirmAction.offer.offerId);
      await deleteOffer(currentUser, confirmAction.offer.offerId);

      setSuccessMessage("Offer deleted successfully!");
      onOfferCreated?.(); // Refresh offers list

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete offer. Please try again."
      );
      console.error("Error deleting offer:", err);
    } finally {
      setDeletingOffer(null);
      closeConfirmModal();
    }
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };

  // Calculate default expiry date (10 years from now)
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 10);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-8">
      {/* Offer Lifecycle Information */}
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-700/30 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 mt-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-blue-300 mb-2">
              Offer Lifecycle Management
            </h4>
            <div className="text-blue-200 text-sm space-y-2">
              <p>
                <strong>Active Offers:</strong> Visible to all customers, new
                users can start collecting stamps
              </p>
              <p>
                <strong>Inactive Offers:</strong> Hidden from new users, but
                existing users can continue collecting stamps
              </p>
              <p>
                <strong>User Protection:</strong> Users who started collecting
                stamps can complete their rewards even if the offer becomes
                inactive
              </p>
              <p>
                <strong>Admin Control:</strong> Use Play button to activate
                offers, Pause button to deactivate. Only inactive offers can be
                edited or deleted.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-400" />
              Search & Filters
            </h4>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Offers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active Offers</option>
              <option value="inactive">Inactive Offers</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 w-full"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={userRole !== "super_admin"}
              title={
                userRole !== "super_admin"
                  ? "Only super admins can create offers"
                  : "Create new loyalty offer"
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Offer
            </Button>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Gift className="w-5 h-5 mr-2 text-green-400" />
            Loyalty Offers ({filteredOffers.length})
          </h3>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-4 bg-green-900/20 border border-green-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">
                {successMessage}
              </span>
            </div>
          </div>
        )}

        <div className="p-6">
          {filteredOffers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map(offer => (
                <div
                  key={offer.offerId}
                  className={`bg-gradient-to-br ${
                    offer.isActive
                      ? "from-green-900/30 to-green-800/30 border-green-700/50"
                      : "from-gray-800/30 to-gray-700/30 border-gray-600/50"
                  } border rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white truncate">
                      {offer.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {/* Warning for inactive offers with active users */}
                      {!offer.isActive && hasActiveUsers(offer) && (
                        <div className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-600/30">
                          ⚠️ Users collecting
                        </div>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          offer.isActive
                            ? "bg-green-900/50 text-green-300 border border-green-700/50"
                            : "bg-gray-900/50 text-gray-300 border border-gray-600/50"
                        }`}
                      >
                        {offer.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {offer.description}
                  </p>

                  {/* Offer Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Target className="w-4 h-4 mr-2" />
                        Stamps Required
                      </div>
                      <span className="text-white font-medium">
                        {offer.stampRequirement}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Gift className="w-4 h-4 mr-2" />
                        Reward
                      </div>
                      <span className="text-white font-medium">
                        {offer.rewardDescription}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Activity className="w-4 h-4 mr-2" />
                        Type
                      </div>
                      <span className="text-white font-medium capitalize">
                        {offer.rewardType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Created
                      </div>
                      <span className="text-white font-medium text-sm">
                        {offer.createdAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`transition-all duration-200 flex-1 ${
                        offer.isActive
                          ? "border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          : "border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      }`}
                      title={
                        offer.isActive ? "Deactivate offer" : "Activate offer"
                      }
                      onClick={() => handleToggleOfferStatus(offer)}
                    >
                      {offer.isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    {/* Edit button - only show for inactive offers */}
                    {!offer.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white transition-all duration-200 flex-1"
                        title="Edit offer"
                        onClick={() => handleEditOffer(offer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Delete button - only show for inactive offers */}
                    {!offer.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 flex-1"
                        title="Delete offer"
                        onClick={() => handleDeleteOffer(offer)}
                        disabled={deletingOffer === offer.offerId}
                      >
                        {deletingOffer === offer.offerId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No offers found
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first loyalty offer to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={userRole !== "super_admin"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Offer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create New Offer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-green-400" />
                  Create New Loyalty Offer
                </h3>
                <button
                  onClick={handleCancelCreate}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">
                      {successMessage}
                    </span>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-green-400" />
                  Basic Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Offer Name *
                  </label>
                  <Input
                    value={createForm.name}
                    onChange={e =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    placeholder="Enter offer name..."
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={createForm.description}
                    onChange={e =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the offer..."
                    rows={3}
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Stamp Requirements */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-400" />
                  Stamp Requirements
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Stamps Required *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        min="1"
                        value={createForm.stampRequirement}
                        onChange={e =>
                          setCreateForm({
                            ...createForm,
                            stampRequirement: parseInt(e.target.value) || 1,
                          })
                        }
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stamps Per Scan *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        min="1"
                        value={createForm.stampsPerScan}
                        onChange={e =>
                          setCreateForm({
                            ...createForm,
                            stampsPerScan: parseInt(e.target.value) || 1,
                          })
                        }
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      Default: 1 stamp per scan. Can be increased for special
                      promotions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reward Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-purple-400" />
                  Reward Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reward Type *
                    </label>
                    <select
                      value={createForm.rewardType}
                      onChange={e =>
                        setCreateForm({
                          ...createForm,
                          rewardType: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed_amount">Fixed Amount Off</option>
                      <option value="free_item">Free Item</option>
                      <option value="buy_one_get_one">Buy One Get One</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reward Value *
                    </label>
                    <Input
                      value={createForm.rewardValue}
                      onChange={e =>
                        setCreateForm({
                          ...createForm,
                          rewardValue: e.target.value,
                        })
                      }
                      placeholder={
                        createForm.rewardType === "percentage"
                          ? "20"
                          : createForm.rewardType === "fixed_amount"
                            ? "5.00"
                            : "Free Coffee"
                      }
                      className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reward Description *
                  </label>
                  <Input
                    value={createForm.rewardDescription}
                    onChange={e =>
                      setCreateForm({
                        ...createForm,
                        rewardDescription: e.target.value,
                      })
                    }
                    placeholder="e.g., 20% OFF, $5.00 OFF, Free Coffee"
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                  Expiry Settings
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={createForm.expiryDate || getDefaultExpiryDate()}
                    onChange={e =>
                      setCreateForm({
                        ...createForm,
                        expiryDate: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Default: 10 years from creation date
                  </p>
                </div>
              </div>

              {/* Offer Status Note */}
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Power className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">
                    Offer Status: Inactive by Default
                  </span>
                </div>
                <p className="text-blue-200 text-xs mt-1">
                  New offers are created as inactive. Use the Play button to
                  activate them when ready. Only inactive offers can be edited
                  or deleted.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleCreateOffer}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 flex-1"
                  disabled={
                    !createForm.name ||
                    !createForm.description ||
                    !createForm.rewardValue ||
                    !createForm.rewardDescription ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Offer
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelCreate}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Offer Modal */}
      {isEditModalOpen && editingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-blue-400" />
                  Edit Loyalty Offer
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">
                      {successMessage}
                    </span>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-green-400" />
                  Basic Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Offer Name *
                  </label>
                  <Input
                    value={editForm.name}
                    onChange={e =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Enter offer name..."
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={editForm.description}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the offer..."
                    rows={3}
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Stamp Requirements */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-400" />
                  Stamp Requirements
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Stamps Required *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        min="1"
                        value={editForm.stampRequirement}
                        onChange={e =>
                          setEditForm({
                            ...editForm,
                            stampRequirement: parseInt(e.target.value) || 1,
                          })
                        }
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stamps Per Scan *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        min="1"
                        value={editForm.stampsPerScan}
                        onChange={e =>
                          setEditForm({
                            ...editForm,
                            stampsPerScan: parseInt(e.target.value) || 1,
                          })
                        }
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      Default: 1 stamp per scan. Can be increased for special
                      promotions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reward Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-purple-400" />
                  Reward Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reward Type *
                    </label>
                    <select
                      value={editForm.rewardType}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          rewardType: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed_amount">Fixed Amount Off</option>
                      <option value="free_item">Free Item</option>
                      <option value="buy_one_get_one">Buy One Get One</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reward Value *
                    </label>
                    <Input
                      value={editForm.rewardValue}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          rewardValue: e.target.value,
                        })
                      }
                      placeholder={
                        editForm.rewardType === "percentage"
                          ? "20"
                          : editForm.rewardType === "fixed_amount"
                            ? "5.00"
                            : "Free Coffee"
                      }
                      className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reward Description *
                  </label>
                  <Input
                    value={editForm.rewardDescription}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        rewardDescription: e.target.value,
                      })
                    }
                    placeholder="e.g., 20% OFF, $5.00 OFF, Free Coffee"
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                  Expiry Settings
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={editForm.expiryDate || getDefaultExpiryDate()}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        expiryDate: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Default: 1 year from creation date
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex-1"
                  disabled={
                    !editForm.name ||
                    !editForm.description ||
                    !editForm.rewardValue ||
                    !editForm.rewardDescription ||
                    isEditSubmitting
                  }
                >
                  {isEditSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Offer
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 flex-1"
                  disabled={isEditSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  {confirmAction.type === "delete" ? (
                    <Trash2 className="w-5 h-5 mr-2 text-red-400" />
                  ) : confirmAction.type === "activate" ? (
                    <Play className="w-5 h-5 mr-2 text-green-400" />
                  ) : (
                    <Pause className="w-5 h-5 mr-2 text-yellow-400" />
                  )}
                  {confirmAction.type === "delete"
                    ? "Delete Offer"
                    : confirmAction.type === "activate"
                      ? "Activate Offer"
                      : "Deactivate Offer"}
                </h3>
                <button
                  onClick={closeConfirmModal}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-300 text-sm">{confirmAction.message}</p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                  onClick={closeConfirmModal}
                >
                  Cancel
                </Button>
                <Button
                  className={`transition-all duration-200 ${
                    confirmAction.type === "delete"
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      : confirmAction.type === "activate"
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        : "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
                  }`}
                  onClick={
                    confirmAction.type === "delete"
                      ? confirmDeleteOffer
                      : confirmToggleOfferStatus
                  }
                  disabled={isSubmitting || isEditSubmitting}
                >
                  {isSubmitting || isEditSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : confirmAction.type === "delete" ? (
                    <Trash2 className="w-4 h-4 mr-2" />
                  ) : confirmAction.type === "activate" ? (
                    <Play className="w-4 h-4 mr-2" />
                  ) : (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  {confirmAction.type === "delete"
                    ? "Delete Offer"
                    : confirmAction.type === "activate"
                      ? "Activate Offer"
                      : "Deactivate Offer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersTab;
