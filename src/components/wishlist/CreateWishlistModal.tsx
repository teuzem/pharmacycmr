import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useWishlist } from '../../contexts/WishlistContext';

interface CreateWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWishlistModal({ isOpen, onClose }: CreateWishlistModalProps) {
  const [name, setName] = useState('');
  const { createWishlist } = useWishlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await createWishlist(name.trim());
      onClose();
      setName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une nouvelle liste de souhaits">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="list-name" className="block text-sm font-medium text-gray-700">
            Nom de la liste
          </label>
          <input
            type="text"
            id="list-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
            Annuler
          </button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}
