"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RequireClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequireClassesModal({ isOpen, onClose }: RequireClassesModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center mb-4">
          <div className="bg-orange-100 p-2 rounded-full mr-3">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Class Required</h3>
        </div>
        
        <p className="text-gray-700 mb-6">
          Before you can register a student, you need to create at least one class. 
          Students must be assigned to a class when they are registered.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:order-1"
          >
            Cancel
          </Button>
          
          <Button
            asChild
            className="bg-[#f6822d] hover:bg-orange-600 text-white sm:order-2"
          >
            <Link href="/protected/classes/new">
              Create Your First Class
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 