import { useState } from "react";

export const useDetailsModal = () => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (number) => {
    setSelectedNumber(number);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedNumber(null);
  };

  return {
    selectedNumber,
    showDetailsModal,
    handleViewDetails,
    handleCloseModal,
  };
};