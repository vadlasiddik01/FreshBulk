import { useState } from "react";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AddressForm, { AddressFormValues } from "./AddressForm";
import { type Address } from "@shared/schema";

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (id: number) => void;
  onCreateAddress: (address: any) => void;
  onUpdateAddress: (id: number, address: any) => void;
  onDeleteAddress: (id: number) => void;
  onSetDefaultAddress: (id: number) => void;
  isLoading?: boolean;
}

const AddressSelector = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  isLoading = false,
}: AddressSelectorProps) => {
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isDeleteAddressOpen, setIsDeleteAddressOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const handleEditAddress = (address: Address) => {
    setAddressToEdit(address);
    setIsEditAddressOpen(true);
  };

  const handleDeleteAddress = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteAddressOpen(true);
  };

  const handleSubmitEdit = (data: AddressFormValues) => {
    if (addressToEdit) {
      onUpdateAddress(addressToEdit.id, data);
      setIsEditAddressOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      onDeleteAddress(addressToDelete.id);
      setIsDeleteAddressOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Delivery Addresses</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddAddressOpen(true)}
          className="flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" /> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-dashed rounded-md p-6 text-center">
          <p className="text-neutral-500">You don't have any saved addresses yet.</p>
          <Button 
            variant="secondary" 
            className="mt-2"
            onClick={() => setIsAddAddressOpen(true)}
          >
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const isSelected = selectedAddress?.id === address.id;
            return (
              <Card 
                key={address.id} 
                className={`p-4 relative cursor-pointer border-2 transition hover:border-primary/50 ${
                  isSelected ? "border-primary" : "border-neutral-200"
                }`}
                onClick={() => onSelectAddress(address.id)}
              >
                {address.isDefault && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs py-1 px-2 rounded-full">
                    Default
                  </div>
                )}
                <div className="mb-2 font-medium">{address.customerName}</div>
                <div className="text-sm text-neutral-600 space-y-1">
                  <p>{address.addressLine}</p>
                  <p>{address.city} - {address.pincode}</p>
                  <p>{address.customerPhone}</p>
                </div>
                <div className="flex justify-between mt-4 pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(address);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetDefaultAddress(address.id);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" /> Set as Default
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address);
                    }}
                    disabled={addresses.length === 1 && address.isDefault}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Address Dialog */}
      <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSubmit={(data) => {
              onCreateAddress(data);
              setIsAddAddressOpen(false);
            }}
            onCancel={() => setIsAddAddressOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isEditAddressOpen} onOpenChange={setIsEditAddressOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {addressToEdit && (
            <AddressForm
              defaultValues={{
                customerName: addressToEdit.customerName,
                customerEmail: addressToEdit.customerEmail,
                customerPhone: addressToEdit.customerPhone,
                addressLine: addressToEdit.addressLine,
                city: addressToEdit.city,
                pincode: addressToEdit.pincode,
                isDefault: addressToEdit.isDefault,
              }}
              onSubmit={handleSubmitEdit}
              onCancel={() => setIsEditAddressOpen(false)}
              isLoading={isLoading}
              submitLabel="Update Address"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation */}
      <AlertDialog open={isDeleteAddressOpen} onOpenChange={setIsDeleteAddressOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddressSelector;