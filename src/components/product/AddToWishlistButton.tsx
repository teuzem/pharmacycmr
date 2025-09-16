import React, { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CreateWishlistModal } from '../wishlist/CreateWishlistModal';

interface AddToWishlistButtonProps {
  productId: string;
}

export function AddToWishlistButton({ productId }: AddToWishlistButtonProps) {
  const { wishlists, addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isInAnyWishlist = isProductInWishlist(productId);

  const handleToggleWishlist = (wishlistId: string) => {
    const isProductInThisList = wishlists.find(w => w.id === wishlistId)?.wishlist_items.some(i => i.product_id === productId);
    if (isProductInThisList) {
      removeFromWishlist(productId, wishlistId);
    } else {
      addToWishlist(productId, wishlistId);
    }
  };

  // Simplified toggle for the main button
  const handleMainClick = () => {
    const defaultWishlist = wishlists.find(w => w.is_default) || wishlists[0];
    if (defaultWishlist) {
      handleToggleWishlist(defaultWishlist.id);
    } else {
      setIsCreateModalOpen(true); // If no wishlists, prompt to create one
    }
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500"
            aria-label="Ajouter à la liste de souhaits"
          >
            <Heart className={`h-5 w-5 ${isInAnyWishlist ? 'fill-current text-red-500' : ''}`} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-white rounded-lg shadow-lg border p-2 mt-2 w-56"
            sideOffset={5}
          >
            <DropdownMenu.Label className="px-2 py-1 text-sm text-gray-500">Ajouter à...</DropdownMenu.Label>
            {wishlists.map(list => (
              <DropdownMenu.CheckboxItem
                key={list.id}
                checked={list.wishlist_items.some(i => i.product_id === productId)}
                onCheckedChange={() => handleToggleWishlist(list.id)}
                className="flex items-center justify-between space-x-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <span>{list.name}</span>
                <DropdownMenu.ItemIndicator>
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>
            ))}
            <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
            <DropdownMenu.Item
              onSelect={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-2 py-2 text-sm text-green-600 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une nouvelle liste</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <CreateWishlistModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
}
